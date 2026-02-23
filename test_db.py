import psycopg2
try:
    conn = psycopg2.connect("dbname=village_db user=ayushsatvara")
    print("Connected successfully to village_db")
    conn.close()
except Exception as e:
    print(f"Failed to connect to village_db: {e}")

try:
    conn = psycopg2.connect("dbname=postgres user=ayushsatvara")
    print("Connected successfully to postgres")
    conn.close()
except Exception as e:
    print(f"Failed to connect to postgres: {e}")
