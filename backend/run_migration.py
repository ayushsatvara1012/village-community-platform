from dotenv import load_dotenv
import os
# Load env before importing database.py to ensure correct DATABASE_URL
load_dotenv()

from app.database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE payments ADD COLUMN IF NOT EXISTS purpose VARCHAR DEFAULT 'general';"))
    print("Successfully added purpose column!")
except Exception as e:
    print(f"Error executing migration: {e}")
