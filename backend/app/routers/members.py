from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Annotated
from datetime import datetime
from pydantic import BaseModel
from .. import models, schemas, database
from .auth import get_current_user

router = APIRouter(
    prefix="/members",
    tags=["members"]
)

class MembershipApplication(BaseModel):
    village_id: int
    address: Optional[str] = None
    profession: Optional[str] = None
    date_of_birth: Optional[datetime] = None

class AdminAction(BaseModel):
    comment: Optional[str] = None

@router.get("/", response_model=List[schemas.UserResponse])
def read_members(
    skip: int = 0, 
    limit: int = 100, 
    village_id: Optional[int] = None,
    current_user: Annotated[models.User, Depends(get_current_user)] = None,
    db: Session = Depends(database.get_db)
):
    """List members. Requires authenticated user with approved/member/admin status."""
    if not current_user or current_user.status not in ("approved", "member") and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="You must be an approved member to view the members list")
    
    query = db.query(models.User).filter(
        models.User.status.in_(["approved", "member"]),
        models.User.role != "admin"
    )
    if village_id:
        query = query.filter(models.User.village_id == village_id)
        
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/pending", response_model=List[schemas.UserResponse])
def get_pending_members(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(models.User).filter(models.User.status == "pending").all()

@router.get("/{member_id}", response_model=schemas.UserResponse)
def get_member(
    member_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Get profile of a specific member. Requires approved+ status."""
    if current_user.status not in ("approved", "member") and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    user = db.query(models.User).filter(
        models.User.id == member_id, 
        models.User.status.in_(["approved", "member"])
    ).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Member not found")
        
    return user

@router.put("/apply", response_model=schemas.UserResponse)
def apply_for_membership(
    application: MembershipApplication,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.status in ("approved", "member"):
        raise HTTPException(status_code=400, detail="You are already approved or a member")

    # Verify village exists
    village = db.query(models.Village).filter(models.Village.id == application.village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")

    current_user.village_id = application.village_id
    current_user.address = application.address
    current_user.profession = application.profession
    current_user.date_of_birth = application.date_of_birth
    current_user.status = "pending"

    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/{member_id}/approve", response_model=schemas.UserResponse)
def approve_member(
    member_id: int,
    action: AdminAction,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(models.User).filter(models.User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.status != "pending":
        raise HTTPException(status_code=400, detail="User is not in pending status")

    user.status = "approved"
    user.admin_comment = action.comment or "Application approved"
    db.commit()
    db.refresh(user)
    return user


@router.put("/{member_id}/reject")
def reject_member(
    member_id: int,
    action: AdminAction,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(models.User).filter(models.User.id == member_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.status != "pending":
        raise HTTPException(status_code=400, detail="User is not in pending status")

    db.delete(user)
    db.commit()
    return {"message": "Application rejected and user removed successfully"}
