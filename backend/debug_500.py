from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

try:
    response = client.get("/payments/recent-donations")
    print("Recent Donations Status:", response.status_code)
    if response.status_code == 500:
        print("500 Error Body:", response.text)
    else:
        print("Success Body:", response.json())
except Exception as e:
    import traceback
    traceback.print_exc()

try:
    response2 = client.get("/payments/history")
    print("History Status:", response2.status_code)
    if response2.status_code == 500:
        print("500 Error Body:", response2.text)
    else:
        print("Success Body:", response2.json())
except Exception as e:
    import traceback
    traceback.print_exc()
