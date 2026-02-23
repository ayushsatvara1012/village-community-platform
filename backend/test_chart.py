from app.database import SessionLocal
from app.routers.payments import get_chart_data

db = SessionLocal()
try:
    print(get_chart_data(db, year=2026))
except Exception as e:
    import traceback
    traceback.print_exc()
