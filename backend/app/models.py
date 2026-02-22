from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Village(Base):
    __tablename__ = "villages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    district = Column(String)
    
    users = relationship("User", back_populates="village")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False) # Primary login pre-payment
    hashed_password = Column(String)
    full_name = Column(String)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    address = Column(String, nullable=True)
    role = Column(String, default="user") # user, admin
    status = Column(String, default="pending") # pending, approved, member, rejected
    profession = Column(String, nullable=True)
    admin_comment = Column(String, nullable=True) # Admin approval/rejection comment
    sabhasad_id = Column(String, unique=True, nullable=True, index=True) # Assigned after payment
    village_id = Column(Integer, ForeignKey("villages.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    village = relationship("Village", back_populates="users")
    payments = relationship("Payment", back_populates="user")
    
    # Optional relation to see which family members link to this user account
    linked_family_members = relationship("FamilyMember", foreign_keys="[FamilyMember.linked_user_id]", back_populates="linked_user")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    currency = Column(String, default="INR")
    status = Column(String, default="completed")
    transaction_id = Column(String, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="payments")

class DonationEvent(Base):
    __tablename__ = "donation_events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    goal = Column(Float)
    raised = Column(Float, default=0)
    image = Column(String)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # Owner of the tree
    name = Column(String, nullable=False)
    relation = Column(String, nullable=False)  # Father, Mother, Son, Daughter, Spouse, etc.
    parent_id = Column(Integer, ForeignKey("family_members.id"), nullable=True)
    gender = Column(String, default="male")  # male, female
    age = Column(Integer, nullable=True)
    profession = Column(String, nullable=True)
    linked_user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Direct link to another community member
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], backref="family_members")
    linked_user = relationship("User", foreign_keys=[linked_user_id], back_populates="linked_family_members")
    children = relationship("FamilyMember", backref="parent", remote_side=[id])

