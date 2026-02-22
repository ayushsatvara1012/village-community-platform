from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

print(f"Connecting to {DATABASE_URL}")
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Executing ALTER TABLE users ADD COLUMN address VARCHAR;")
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN address VARCHAR;"))
        conn.commit()
        print("Migration successful! Address column added.")
    except Exception as e:
        print(f"Migration failed or column already exists: {e}")
