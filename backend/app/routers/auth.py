from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Annotated
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from .. import models, schemas, database
from ..email_utils import send_otp_email
import os
import random
import time

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

# In-memory OTP store: { email: { "otp": "123456", "expires": timestamp } }
otp_store = {}

# Helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# ─── Standard Auth Routes ─────────────────────────────────────

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # Check for duplicate email
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")
        
    # Check for duplicate phone number
    if user.phone_number and db.query(models.User).filter(models.User.phone_number == user.phone_number).first():
        raise HTTPException(status_code=400, detail="Phone number already registered.")

    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        phone_number=user.phone_number,
        village_id=user.village_id,
        profession=user.profession,
        status="pending"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(database.get_db)
):
    # Retrieve user by email or sabhasad_id
    from sqlalchemy import or_
    user = db.query(models.User).filter(
        or_(
            models.User.email == form_data.username,
            models.User.sabhasad_id == form_data.username,
            models.User.phone_number == form_data.username
        )
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not registered. Please register first or check your email/ID.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/users/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: Annotated[models.User, Depends(get_current_user)]):
    return current_user


# ─── User OTP Login ──────────────────────────────────────────

# ─── Pre-Registration Validation ────────────────────────────────

class CheckDuplicatesRequest(BaseModel):
    email: EmailStr
    phone_number: str

@router.post("/check-duplicates")
def check_duplicates(request: CheckDuplicatesRequest, db: Session = Depends(database.get_db)):
    """Check if email or phone number is already registered."""
    email_exists = db.query(models.User).filter(models.User.email == request.email).first() is not None
    phone_exists = db.query(models.User).filter(models.User.phone_number == request.phone_number).first() is not None
    
    return {
        "email_exists": email_exists,
        "phone_exists": phone_exists
@router.post("/request-otp")
def user_request_otp(request: schemas.UserOtpRequest, db: Session = Depends(database.get_db)):
    """Request an OTP for user login. OTP is printed to the server console or emailed."""
    from sqlalchemy import or_
    user = db.query(models.User).filter(
        or_(
            models.User.email == request.identifier,
            models.User.phone_number == request.identifier
        )
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_store[request.identifier] = {
        "otp": otp,
        "expires": time.time() + 300  # 5 minutes
    }

    # If identifier is an email, try sending email
    if "@" in request.identifier:
        email_sent = send_otp_email(request.identifier, otp)
        if email_sent:
            return {"message": "OTP sent to your email. Please check your inbox."}
            
    # Fallback to console print for SMS/Email failures or phone numbers
    print(f"\n{'='*40}\n[DEV LOG] OTP for {request.identifier}: {otp}\n{'='*40}\n", flush=True)
    return {"message": "OTP generated successfully. (Check server console in DEV mode)"}

@router.post("/verify-otp", response_model=schemas.Token)
def user_verify_otp(request: schemas.UserOtpVerify, db: Session = Depends(database.get_db)):
    """Verify the OTP and issue a JWT token for user login."""
    stored = otp_store.get(request.identifier)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this identifier. Please request a new OTP.")

    if time.time() > stored["expires"]:
        del otp_store[request.identifier]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if stored["otp"] != request.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP. Please try again.")

    # OTP is valid — clean up and issue token
    del otp_store[request.identifier]
    
    from sqlalchemy import or_
    user = db.query(models.User).filter(
        or_(
            models.User.email == request.identifier,
            models.User.phone_number == request.identifier
        )
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ─── Admin OTP Login ──────────────────────────────────────────

class AdminOtpRequest(BaseModel):
    email: EmailStr

class AdminOtpVerify(BaseModel):
    email: EmailStr
    otp: str

@router.post("/admin/request-otp")
def admin_request_otp(request: AdminOtpRequest, db: Session = Depends(database.get_db)):
    """Request an OTP for admin login. OTP is printed to the server console."""
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))
    otp_store[request.email] = {
        "otp": otp,
        "expires": time.time() + 300  # 5 minutes
    }

    # Send OTP via email (falls back to console if SMTP not configured)
    email_sent = send_otp_email(request.email, otp)

    if email_sent:
        return {"message": "OTP sent to your email. Please check your inbox."}
    else:
        return {"message": "OTP generated. Check the server console (email not configured)."}

@router.post("/admin/verify-otp", response_model=schemas.Token)
def admin_verify_otp(request: AdminOtpVerify, db: Session = Depends(database.get_db)):
    """Verify the OTP and issue a JWT token for admin login."""
    stored = otp_store.get(request.email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this email. Please request a new OTP.")

    if time.time() > stored["expires"]:
        del otp_store[request.email]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if stored["otp"] != request.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP. Please try again.")

    # OTP is valid — clean up and issue token
    del otp_store[request.email]

    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied.")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# ─── Forgot Password ──────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ForgotPasswordReset(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

@router.post("/forgot-password/request-otp")
def forgot_password_request_otp(request: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    """Request an OTP for password reset."""
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Email not registered. Please register first.")

    otp = str(random.randint(100000, 999999))
    otp_store[f"reset_{request.email}"] = {
        "otp": otp,
        "expires": time.time() + 300  # 5 minutes
    }
    email_sent = send_otp_email(request.email, otp)
    if email_sent:
        return {"message": "OTP sent to your email. Please check your inbox."}
    else:
        return {"message": "OTP generated. Check the server console (email not configured)."}

@router.post("/forgot-password/reset")
def forgot_password_reset(request: ForgotPasswordReset, db: Session = Depends(database.get_db)):
    """Verify the OTP and reset the user's password."""
    store_key = f"reset_{request.email}"
    stored = otp_store.get(store_key)
    
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this email. Please request a new OTP.")

    if time.time() > stored["expires"]:
        del otp_store[store_key]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    if stored["otp"] != request.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP. Please try again.")

    # OTP is valid — update password and clean up
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    del otp_store[store_key]

    return {"message": "Password reset successfully. You can now login with your new password."}

@router.post("/check-email")
def check_email(request: ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    """Check if an email is already registered. Returns {"exists": True/False}"""
    user = db.query(models.User).filter(models.User.email == request.email).first()
    return {"exists": user is not None}
