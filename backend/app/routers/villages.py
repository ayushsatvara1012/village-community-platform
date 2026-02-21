from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated
from .. import models, schemas, database
from .auth import get_current_user

router = APIRouter(
    prefix="/villages",
    tags=["villages"]
)

@router.get("/", response_model=List[schemas.Village])
def read_villages(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    villages = db.query(models.Village).offset(skip).limit(limit).all()
    return villages

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
    return db_village

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
