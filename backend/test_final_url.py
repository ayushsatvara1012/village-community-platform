from sqlalchemy import create_engine

# Testing the exact string the user provided
db_url = "postgresql://postgres.tjqnrgzgaxjtcplxnmjv:hkG7_yyV%2F%409HMDm@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"

print(f"Testing URL: {db_url}")

try:
    engine = create_engine(db_url)
    connection = engine.connect()
    print("✅ CONNECTION SUCCESSFUL!")
    connection.close()
except Exception as e:
    print(f"❌ FAILED: {str(e).split('OperationalError')[-1].strip()}")
