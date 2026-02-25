from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class VillageBase(BaseModel):
    name: str
    district: str

class VillageCreate(VillageBase):
    pass

class VillageUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None

class Village(VillageBase):
    id: int
    member_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    village_id: Optional[int] = None
    profession: Optional[str] = None
    date_of_birth: Optional[datetime] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    status: str
    profession: Optional[str] = None
    admin_comment: Optional[str] = None
    sabhasad_id: Optional[str] = None
    created_at: datetime
    village: Optional[Village] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None # We'll use this for member_id in the token

class PaymentBase(BaseModel):
    amount: float
    transaction_id: Optional[str] = None
    purpose: str = "general"

class PaymentCreate(PaymentBase):
    pass

class Payment(PaymentBase):
    id: int
    user_id: int
    status: str
    purpose: Optional[str] = "general"
    created_at: datetime
    
    class Config:
        from_attributes = True

class DashboardDonationResponse(BaseModel):
    id: int
    amount: float
    purpose: Optional[str] = "general"
    created_at: datetime
    donor_name: Optional[str] = None

class DonationEventBase(BaseModel):
    title: str
    description: str
    goal: float
    image: str
    category: str

class DonationEventCreate(DonationEventBase):
    pass

class DonationEvent(DonationEventBase):
    id: int
    raised: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# ─── Family Member Schemas ─────────────────────

class FamilyMemberCreate(BaseModel):
    name: str
    relation: str
    parent_id: Optional[int] = None
    gender: str = "male"
    age: Optional[int] = None
    profession: Optional[str] = None
    linked_sabhasad_id: Optional[str] = None # E.g., SAB-0001

class FamilyMemberResponse(BaseModel):
    id: int
    user_id: int
    name: str
    relation: str
    parent_id: Optional[int] = None
    gender: str
    age: Optional[int] = None
    profession: Optional[str] = None
    linked_user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class FamilyMemberTree(BaseModel):
    id: int
    name: str
    relation: str
    gender: str
    age: Optional[int] = None
    profession: Optional[str] = None
    linked_user_id: Optional[int] = None
    children: List["FamilyMemberTree"] = []

    class Config:
        from_attributes = True

# ─── User OTP Login Schemas ─────────────────────

class UserOtpRequest(BaseModel):
    identifier: str # Email or Phone Number

class UserOtpVerify(BaseModel):
    identifier: str # Email or Phone Number
    otp: str
    remember_me: Optional[bool] = False


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    profession: Optional[str] = None
    date_of_birth: Optional[datetime] = None
