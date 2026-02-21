from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated, List
from .. import models, schemas, database
from .auth import get_current_user

router = APIRouter(
    prefix="/family",
    tags=["family"]
)

@router.get("/", response_model=List[schemas.FamilyMemberResponse])
def get_family_members(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Get all family members for the logged-in user (flat list)."""
    members = db.query(models.FamilyMember).filter(
        models.FamilyMember.user_id == current_user.id
    ).all()
    return members

@router.get("/tree")
def get_family_tree(
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Get the family tree as a nested structure. Root = user themselves."""
    members = db.query(models.FamilyMember).filter(
        models.FamilyMember.user_id == current_user.id
    ).all()

    # Build a map of id -> member data
    member_map = {}
    for m in members:
        member_map[m.id] = {
            "id": m.id,
            "name": m.name,
            "relation": m.relation,
            "gender": m.gender,
            "age": m.age,
            "profession": m.profession,
            "linked_user_id": m.linked_user_id,
            "children": []
        }

    # Build tree: attach children to their parents
    roots = []
    for m in members:
        if m.parent_id and m.parent_id in member_map:
            member_map[m.parent_id]["children"].append(member_map[m.id])
        else:
            roots.append(member_map[m.id])

    # Wrap in the user as the ultimate root
    tree = {
        "id": 0,
        "name": current_user.full_name,
        "relation": "Self",
        "gender": "male",
        "age": None,
        "profession": current_user.profession,
        "linked_user_id": current_user.id,
        "children": roots
    }

    return tree

@router.get("/tree/{user_id}")
def get_user_family_tree(
    user_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Get the family tree for a specific user (public to authenticated users)."""
    # Verify the target user exists and is a member
    target_user = db.query(models.User).filter(
        models.User.id == user_id,
        models.User.status == "member"
    ).first()
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")

    members = db.query(models.FamilyMember).filter(
        models.FamilyMember.user_id == user_id
    ).all()

    # Build a map of id -> member data
    member_map = {}
    for m in members:
        member_map[m.id] = {
            "id": m.id,
            "name": m.name,
            "relation": m.relation,
            "gender": m.gender,
            "age": m.age,
            "profession": m.profession,
            "linked_user_id": m.linked_user_id,
            "children": []
        }

    # Build tree: attach children to their parents
    roots = []
    for m in members:
        if m.parent_id and m.parent_id in member_map:
            member_map[m.parent_id]["children"].append(member_map[m.id])
        else:
            roots.append(member_map[m.id])

    # Wrap in the target user as the ultimate root
    tree = {
        "id": 0,
        "name": target_user.full_name,
        "relation": "Self",
        "gender": "male", # We don't track user gender yet, default to male
        "age": None,
        "profession": target_user.profession,
        "linked_user_id": target_user.id,
        "children": roots
    }

    return tree


@router.post("/", response_model=schemas.FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
def add_family_member(
    member: schemas.FamilyMemberCreate,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Add a new family member to the current user's tree."""
    
    # Check parent exists and belongs to this user
    if member.parent_id:
        parent = db.query(models.FamilyMember).filter(
            models.FamilyMember.id == member.parent_id,
            models.FamilyMember.user_id == current_user.id
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent family member not found or doesn't belong to you")

    # If linked_sabhasad_id is provided, look up the target user
    linked_user_id = None
    if member.linked_sabhasad_id:
        linked_target = db.query(models.User).filter(models.User.sabhasad_id == member.linked_sabhasad_id).first()
        if not linked_target:
            raise HTTPException(status_code=404, detail=f"No community member found with Sabhasad ID: {member.linked_sabhasad_id}")
        linked_user_id = linked_target.id

    db_member = models.FamilyMember(
        user_id=current_user.id,
        name=member.name,
        relation=member.relation,
        parent_id=member.parent_id,
        gender=member.gender,
        age=member.age,
        profession=member.profession,
        linked_user_id=linked_user_id
    )
    
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_family_member(
    member_id: int,
    current_user: Annotated[models.User, Depends(get_current_user)],
    db: Session = Depends(database.get_db)
):
    """Delete a family member and reassign their children to no parent (root level)."""
    member = db.query(models.FamilyMember).filter(
        models.FamilyMember.id == member_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")
        
    if member.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this family member")

    # Move children to root level
    db.query(models.FamilyMember).filter(
        models.FamilyMember.parent_id == member_id
    ).update({"parent_id": None})

    db.delete(member)
    db.commit()
