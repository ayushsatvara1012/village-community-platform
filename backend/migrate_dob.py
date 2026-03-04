from dotenv import load_dotenv
import os
import sys

# Add the current directory to sys.path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Load env before importing database.py to ensure correct DATABASE_URL
load_dotenv()

from app.database import engine
from sqlalchemy import text

print(f"Using DATABASE_URL: {os.getenv('DATABASE_URL')}")

try:
    with engine.begin() as conn:
        print("Adding date_of_birth column to users table...")
        # For SQLite
        if 'sqlite' in os.getenv('DATABASE_URL', ''):
            conn.execute(text("ALTER TABLE users ADD COLUMN date_of_birth DATETIME;"))
        # For Postgres
        else:
            conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMP;"))
        print("Successfully added date_of_birth column!")
except Exception as e:
    print(f"Error executing migration: {e}")
    print("If the column already exists, you can ignore this error.")
