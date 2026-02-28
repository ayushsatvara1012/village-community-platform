from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, Date, Integer, extract
from typing import List, Annotated
from pydantic import BaseModel
from .. import models, schemas, database
from ..config import razorpay_client, razorpay_client_special, RAZORPAY_KEY_ID, RAZORPAY_KEY_ID_SPECIAL
from .auth import get_current_user
import uuid
import io
from fastapi.responses import Response
from reportlab.lib.pagesizes import A5
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import cm

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)

MEMBERSHIP_FEE = 500  # ₹500 membership fee

class CreateOrderRequest(BaseModel):
    amount: float
    purpose: str = "general"

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    amount: float
    purpose: str = "general"

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
                "purpose": order.purpose
            }
        }
        razorpay_order = razorpay_client.order.create(data=order_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create payment order: {str(e)}")

    return {
        "order_id": razorpay_order["id"],
        "amount": order.amount,
        "currency": "INR",
        "purpose": order.purpose,
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
        status="completed",
        purpose=payment.purpose
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

# ─── Special Welfare Fund ─────────────────────────────────

@router.post("/special/create-order")
def create_special_order(
    order: CreateOrderRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
):
    """Create a Razorpay order for the Special Welfare Fund using the special client."""
    if order.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")

    amount_in_paise = int(order.amount * 100)

    try:
        order_data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": f"SPF-{uuid.uuid4().hex[:8]}",
            "notes": {
                "user_id": str(current_user.id),
                "purpose": "special_fund"
            }
        }
        # Use the special client for this fund
        razorpay_order = razorpay_client_special.order.create(data=order_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create special fund order: {str(e)}")

    return {
        "order_id": razorpay_order["id"],
        "amount": order.amount,
        "currency": "INR",
        "purpose": "special_fund",
        "razorpay_key_id": RAZORPAY_KEY_ID_SPECIAL,
    }

@router.post("/special/verify", response_model=schemas.Payment)
def verify_special_payment(
    payment: VerifyPaymentRequest,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Verify special fund payment using the special client."""
    try:
        # Use the special client to verify
        razorpay_client_special.utility.verify_payment_signature({
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
        status="completed",
        purpose="special_fund"
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    return db_payment

# ─── Receipts ─────────────────────────────────────────────

@router.get("/{payment_id}/receipt")
def get_payment_receipt(
    payment_id: int,
    db: Session = Depends(database.get_db)
):
    """Generate a professional PDF receipt for a payment. Publicly accessible."""
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    
    user = db.query(models.User).filter(models.User.id == payment.user_id).first()
    donor_name = user.full_name if user else "Community Supporter"

    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A5, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor("#1e293b"),
        alignment=1, # Center
        spaceAfter=20
    )
    
    content_list = []
    
    # Header
    content_list.append(Paragraph("Village Community Platform", title_style))
    content_list.append(Paragraph("Official Donation Receipt", styles['Normal']))
    content_list.append(Spacer(1, 0.5*cm))
    
    # Receipt Details Table
    data = [
        ["Receipt No:", f"REC-{payment.id:06d}"],
        ["Date:", payment.created_at.strftime("%d/%m/%Y") if payment.created_at else "—"],
        ["Transaction ID:", payment.transaction_id],
        ["Donor Name:", donor_name],
        ["Purpose:", payment.purpose.replace("_", " ").title() if payment.purpose else "Donation"],
        ["Amount:", f"INR {payment.amount:,.2f}"],
    ]
    
    table = Table(data, colWidths=[4*cm, 7*cm])
    table.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor("#64748b")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
    ]))
    content_list.append(table)
    content_list.append(Spacer(1, 1*cm))
    
    # Footer
    footer_text = "This is a computer generated receipt. Thank you for your generous contribution to our community welfare projects. Your support helps us build a better future together."
    content_list.append(Paragraph(footer_text, ParagraphStyle('Footer', parent=styles['Normal'], fontSize=9, leading=12, textColor=colors.grey)))
    
    content_list.append(Spacer(1, 1*cm))
    content_list.append(Paragraph("<b>Authorized Signature</b>", ParagraphStyle('Sign', parent=styles['Normal'], alignment=2)))

    # Build PDF
    doc.build(content_list)
    
    pdf_out = buffer.getvalue()
    buffer.close()
    
    return Response(
        content=pdf_out,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=receipt_{payment.id}.pdf"}
    )

from typing import Optional
from datetime import date

@router.get("/recent-donations", response_model=List[schemas.DashboardDonationResponse])
def get_recent_donations(
    db: Session = Depends(database.get_db),
    limit: int = 10,
    offset: int = 0,
    sort_by: str = "date",
    order: str = "desc",
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    query = (
        db.query(
            models.Payment.id,
            models.Payment.amount,
            models.Payment.purpose,
            models.Payment.created_at,
            models.User.full_name.label("donor_name")
        )
        .join(models.User, models.User.id == models.Payment.user_id)
    )

    if start_date:
        query = query.filter(models.Payment.created_at >= start_date)
    if end_date:
        # Cast to date to include the whole day
        query = query.filter(func.cast(models.Payment.created_at, Date) <= end_date)

    if sort_by == "amount":
        if order == "asc":
            query = query.order_by(models.Payment.amount.asc())
        else:
            query = query.order_by(models.Payment.amount.desc())
    else:  # default to date
        if order == "asc":
            query = query.order_by(models.Payment.created_at.asc())
        else:
            query = query.order_by(models.Payment.created_at.desc())

    donations = query.limit(limit).offset(offset).all()
    
    # SQLAlchemy row objects need to be converted to dicts to match schema
    return [
        {
            "id": d.id,
            "amount": d.amount,
            "purpose": d.purpose,
            "created_at": d.created_at,
            "donor_name": d.donor_name
        } for d in donations
    ]

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

class ChartDataResponse(BaseModel):
    date: str
    amount: float

@router.get("/chart", response_model=List[ChartDataResponse])
def get_chart_data(
    db: Session = Depends(database.get_db),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    month: Optional[int] = None,
    year: Optional[int] = None
):
    """Get aggregated payment data by date for the dashboard chart."""
    query = db.query(
        func.cast(models.Payment.created_at, Date).label("date"),
        func.sum(models.Payment.amount).label("total_amount")
    ).filter(models.Payment.status == "completed")

    if start_date:
        query = query.filter(func.cast(models.Payment.created_at, Date) >= start_date)
    if end_date:
        query = query.filter(func.cast(models.Payment.created_at, Date) <= end_date)
    
    if year:
        query = query.filter(extract('year', models.Payment.created_at) == year)
    if month:
        query = query.filter(extract('month', models.Payment.created_at) == month)

    results = query.group_by("date").order_by("date").all()

    return [{"date": str(r.date), "amount": float(r.total_amount)} for r in results]
