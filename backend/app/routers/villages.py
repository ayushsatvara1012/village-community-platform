from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated
from .. import models, schemas, database
from .auth import get_current_user

from sqlalchemy import func

router = APIRouter(
    prefix="/villages",
    tags=["villages"]
)

@router.get("/", response_model=List[schemas.Village])
def read_villages(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    results = db.query(
        models.Village,
        func.count(models.User.id).label("member_count")
    ).outerjoin(models.User, models.Village.id == models.User.village_id).group_by(models.Village.id).offset(skip).limit(limit).all()
    
    villages_with_count = []
    for village, count in results:
        village_dict = village.__dict__.copy()
        village_dict["member_count"] = count
        villages_with_count.append(village_dict)
    
    return villages_with_count

@router.post("/", response_model=schemas.Village)
def create_village(
    village: schemas.VillageCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    # Check for duplicate
    existing = db.query(models.Village).filter(models.Village.name == village.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Village already exists")
    db_village = models.Village(name=village.name, district=village.district)
    db.add(db_village)
    db.commit()
    db.refresh(db_village)
    
    village_dict = db_village.__dict__.copy()
    village_dict["member_count"] = 0
    return village_dict

@router.delete("/{village_id}")
def delete_village(
    village_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    village = db.query(models.Village).filter(models.Village.id == village_id).first()
    if not village:
        raise HTTPException(status_code=404, detail="Village not found")
    # Check if any users are associated
    user_count = db.query(models.User).filter(models.User.village_id == village_id).count()
    if user_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete village with {user_count} members")
    db.delete(village)
    db.commit()
    return {"detail": "Village deleted"}

@router.put("/{village_id}", response_model=schemas.Village)
def update_village(
    village_id: int,
    village_update: schemas.VillageUpdate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db_village = db.query(models.Village).filter(models.Village.id == village_id).first()
    if not db_village:
        raise HTTPException(status_code=404, detail="Village not found")
        
    if village_update.name is not None:
        # Check for duplicate name if changing
        existing = db.query(models.Village).filter(models.Village.name == village_update.name, models.Village.id != village_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Village with this name already exists")
        db_village.name = village_update.name
        
    if village_update.district is not None:
        db_village.district = village_update.district
        
    db.commit()
    db.refresh(db_village)
    
    # Get member count to return proper schema
    member_count = db.query(models.User).filter(models.User.village_id == village_id).count()
    
    village_dict = db_village.__dict__.copy()
    village_dict["member_count"] = member_count
    
    return village_dict
