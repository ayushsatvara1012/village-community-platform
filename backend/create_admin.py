import sys
import os

from sqlalchemy.orm import Session
# Ensure we can import app
sys.path.append('.')

from app.database import engine, SessionLocal
from app.models import User
from app.routers.auth import get_password_hash

def create_admin():
    db = SessionLocal()
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            phone_number="0000000000",
            role="admin",
            status="member",
            village_id=None
        )
        db.add(admin)
        db.commit()
        print("Admin user created successfully")
    else:
        print("Admin user already exists")
    db.close()

if __name__ == '__main__':
    create_admin()
