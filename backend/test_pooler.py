import urllib.parse
from sqlalchemy import create_engine

raw_password = "hkG7_yyV/@9HMDm"
encoded_password = urllib.parse.quote_plus(raw_password)

project_ref = "tjqnrgzgaxjtcplxnmjv"
region = "aws-0-ap-south-1"

# Approach 1: Port 5432 with regular username string (what failed on Render)
url_1 = f"postgresql://postgres.{project_ref}:{encoded_password}@{region}.pooler.supabase.com:5432/postgres"

# Approach 2: Port 6543 with options query parameter
url_2 = f"postgresql://postgres:{encoded_password}@{region}.pooler.supabase.com:6543/postgres?options=project%3D{project_ref}"

# Approach 3: Port 6543 with user.project username format
url_3 = f"postgresql://postgres.{project_ref}:{encoded_password}@{region}.pooler.supabase.com:6543/postgres"


def test_conn(url, name):
    print(f"\n--- Testing {name} ---")
    try:
        engine = create_engine(url)
        connection = engine.connect()
        print(f"✅ {name} SUCCESSFUL")
        connection.close()
        return True
    except Exception as e:
        print(f"❌ {name} FAILED: {str(e).split('OperationalError')[-1].strip()}")
        return False

test_conn(url_1, "Port 5432 (postgres.project)")
test_conn(url_2, "Port 6543 (?options=project)")
test_conn(url_3, "Port 6543 (postgres.project)")
