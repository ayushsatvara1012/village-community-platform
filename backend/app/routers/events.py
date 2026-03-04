from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Annotated
from pydantic import BaseModel
from .. import models, schemas, database
from ..config import razorpay_client, RAZORPAY_KEY_ID
from .auth import get_current_user
from ..cloudinary_config import upload_image, delete_image
import uuid

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

@router.post("/upload-image")
async def upload_event_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
        
    # Upload to Cloudinary
    image_url = upload_image(file.file, folder="events")
    if not image_url:
        raise HTTPException(status_code=500, detail="Failed to upload image to Cloudinary")
        
    return {"url": image_url}

@router.get("/", response_model=List[schemas.DonationEvent])
def list_events(db: Session = Depends(database.get_db)):
    return db.query(models.DonationEvent).order_by(models.DonationEvent.created_at.desc()).all()

@router.post("/", response_model=schemas.DonationEvent)
def create_event(
    event: schemas.DonationEventCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    db_event = models.DonationEvent(
        title=event.title,
        description=event.description,
        goal=event.goal,
        image=event.image,
        category=event.category
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.patch("/{event_id}", response_model=schemas.DonationEvent)
def update_event(
    event_id: int,
    event_update: schemas.DonationEventUpdate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_event = db.query(models.DonationEvent).filter(models.DonationEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    update_data = event_update.dict(exclude_unset=True)
    
    # If image is being updated, delete the old one
    if "image" in update_data and db_event.image and update_data["image"] != db_event.image:
        delete_image(db_event.image)

    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_event = db.query(models.DonationEvent).filter(models.DonationEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Delete image from Cloudinary if it exists
    if db_event.image:
        delete_image(db_event.image)

    db.delete(db_event)
    db.commit()
    return {"message": "Event deleted successfully"}

class DonateRequest(BaseModel):
    amount: float

class VerifyDonationRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    amount: float

@router.post("/{event_id}/donate")
def create_donation_order(
    event_id: int,
    donation: DonateRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Create a Razorpay order for a donation to an event."""
    event = db.query(models.DonationEvent).filter(models.DonationEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    if donation.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    # Razorpay expects amount in paise (1 INR = 100 paise)
    amount_in_paise = int(donation.amount * 100)

    try:
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"DON-{event_id}-{uuid.uuid4().hex[:8]}",
            "notes": {
                "event_id": str(event_id),
                "user_id": str(current_user.id),
                "event_title": event.title
            }
        }
        razorpay_order = razorpay_client.order.create(data=order_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

    return {
        "order_id": razorpay_order["id"],
        "amount": donation.amount,
        "currency": "INR",
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "event_title": event.title
    }

@router.post("/{event_id}/verify-donation")
def verify_donation(
    event_id: int,
    payment: VerifyDonationRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Verify Razorpay payment signature and record the donation."""
    event = db.query(models.DonationEvent).filter(models.DonationEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Verify the payment signature
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payment.razorpay_order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "razorpay_signature": payment.razorpay_signature
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

    # Signature is valid — record the payment
    db_payment = models.Payment(
        user_id=current_user.id,
        amount=payment.amount,
        transaction_id=payment.razorpay_payment_id,
        status="completed"
    )
    db.add(db_payment)

    # Update event raised amount
    event.raised = (event.raised or 0) + payment.amount
    db.commit()

    return {
        "message": "Donation successful",
        "amount": payment.amount,
        "event_title": event.title,
        "new_total": event.raised,
        "transaction_id": payment.razorpay_payment_id
    }
