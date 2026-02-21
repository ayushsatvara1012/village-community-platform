"""Script to clean the database: remove all non-admin users, villages, payments, family members."""
import sys
sys.path.insert(0, '.')

from app.database import SessionLocal, engine
from app import models

def cleanup():
    db = SessionLocal()
    try:
        # Delete family members
        count = db.query(models.FamilyMember).delete()
        print(f"Deleted {count} family members")

        # Delete payments
        count = db.query(models.Payment).delete()
        print(f"Deleted {count} payments")

        # Delete non-admin users
        count = db.query(models.User).filter(models.User.role != "admin").delete()
        print(f"Deleted {count} non-admin users")

        # Delete all villages
        count = db.query(models.Village).delete()
        print(f"Deleted {count} villages")

        # Delete donation events
        count = db.query(models.DonationEvent).delete()
        print(f"Deleted {count} donation events")

        db.commit()
        print("\n✅ Database cleaned. Only admin user remains.")

        # Show remaining admin
        admin = db.query(models.User).filter(models.User.role == "admin").first()
        if admin:
            print(f"   Admin: {admin.full_name} ({admin.email}) - {admin.member_id}")
        else:
            print("   ⚠️  No admin user found!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    cleanup()
