from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Annotated
from pydantic import BaseModel
from .. import models, schemas, database
from ..config import razorpay_client, RAZORPAY_KEY_ID
from .auth import get_current_user
import uuid

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

MEMBERSHIP_FEE = 500  # ₹500 membership fee

class CreateOrderRequest(BaseModel):
    amount: float

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    amount: float

def generate_sabhasad_id(db: Session) -> str:
    """Generate next sequential Sabhasad ID like SAB-0001, SAB-0002, etc."""
    # Find highest existing sabhasad_id
    last = db.query(models.User).filter(
        models.User.sabhasad_id.isnot(None)
    ).order_by(models.User.sabhasad_id.desc()).first()
    
    if last and last.sabhasad_id:
        try:
            num = int(last.sabhasad_id.split("-")[1]) + 1
        except (IndexError, ValueError):
            num = 1
    else:
        num = 1
    
    return f"SAB-{num:04d}"

# ─── Membership Payment ───────────────────────────────────

@router.post("/membership/create-order")
def create_membership_order(
    current_user: Annotated[models.User, Depends(get_current_user)],
):
    """Create a Razorpay order for membership payment. Only for approved users."""
    if current_user.status != "approved":
        raise HTTPException(status_code=400, detail="Only approved users can pay the membership fee")
    
    if current_user.sabhasad_id:
        raise HTTPException(status_code=400, detail="You already have a Sabhasad ID")

    amount_in_paise = int(MEMBERSHIP_FEE * 100)

    try:
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"MEM-{uuid.uuid4().hex[:8]}",
            "notes": {
                "user_id": str(current_user.id),
                "purpose": "membership_fee"
            }
        }
        razorpay_order = razorpay_client.order.create(data=order_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

    return {
        "order_id": razorpay_order["id"],
        "amount": MEMBERSHIP_FEE,
        "currency": "INR",
        "razorpay_key_id": RAZORPAY_KEY_ID,
    }

@router.post("/membership/verify")
def verify_membership_payment(
    payment: VerifyPaymentRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Verify membership payment, assign Sabhasad ID, and upgrade to member status."""
    if current_user.status != "approved":
        raise HTTPException(status_code=400, detail="Only approved users can complete membership payment")

    # Verify the payment signature
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payment.razorpay_order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "razorpay_signature": payment.razorpay_signature
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

    # Record the payment
    db_payment = models.Payment(
        user_id=current_user.id,
        amount=payment.amount,
        transaction_id=payment.razorpay_payment_id,
        status="completed"
    )
    db.add(db_payment)

    # Generate Sabhasad ID and upgrade status
    sabhasad_id = generate_sabhasad_id(db)
    current_user.sabhasad_id = sabhasad_id
    current_user.status = "member"

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Payment successful! Welcome to the community!",
        "sabhasad_id": sabhasad_id,
        "status": "member"
    }

@router.get("/membership/fee")
def get_membership_fee():
    """Get the current membership fee."""
    return {"amount": MEMBERSHIP_FEE, "currency": "INR"}

# ─── General Payments ─────────────────────────────────────

@router.post("/create-order")
def create_order(
    order: CreateOrderRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
):
    """Create a Razorpay order for a general payment."""
    if order.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    amount_in_paise = int(order.amount * 100)

    try:
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"PAY-{uuid.uuid4().hex[:8]}",
            "notes": {
                "user_id": str(current_user.id),
            }
        }
        razorpay_order = razorpay_client.order.create(data=order_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

    return {
        "order_id": razorpay_order["id"],
        "amount": order.amount,
        "currency": "INR",
        "razorpay_key_id": RAZORPAY_KEY_ID,
    }

@router.post("/verify", response_model=schemas.Payment)
def verify_payment(
    payment: VerifyPaymentRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Verify Razorpay payment signature and record the payment."""
    try:
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": payment.razorpay_order_id,
            "razorpay_payment_id": payment.razorpay_payment_id,
            "razorpay_signature": payment.razorpay_signature
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Payment verification failed. Invalid signature.")

    db_payment = models.Payment(
        user_id=current_user.id,
        amount=payment.amount,
        transaction_id=payment.razorpay_payment_id,
        status="completed"
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

@router.get("/history", response_model=List[schemas.Payment])
def payment_history(db: Session = Depends(database.get_db)):
    return db.query(models.Payment).order_by(models.Payment.created_at.desc()).all()

@router.get("/stats")
def payment_stats(db: Session = Depends(database.get_db)):
    total = db.query(func.coalesce(func.sum(models.Payment.amount), 0)).scalar()
    
    top_donor_query = (
        db.query(
            models.User.full_name,
            func.sum(models.Payment.amount).label("total")
        )
        .join(models.Payment, models.Payment.user_id == models.User.id)
        .group_by(models.User.id, models.User.full_name)
        .order_by(func.sum(models.Payment.amount).desc())
        .first()
    )
    
    return {
        "total_collection": float(total),
        "current_balance": float(total) * 0.8,
        "top_donor": top_donor_query[0] if top_donor_query else "N/A",
        "top_donor_amount": float(top_donor_query[1]) if top_donor_query else 0
    }
