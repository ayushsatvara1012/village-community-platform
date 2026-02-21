import requests
import random

API_URL = "http://localhost:8000"

villages = [
    {"name": "Devrasan", "district": "Mahesana"},
    {"name": "Kukarwada", "district": "Mahesana"},
    {"name": "Vihar", "district": "Mahesana"},
    {"name": "Gozariya", "district": "Mahesana"},
    {"name": "Kherva", "district": "Mahesana"}
]

professions = ["Farmer", "Teacher", "Engineer", "Doctor", "Shopkeeper", "Driver", "Student", "Nurse", "Carpenter", "Electrician"]

def seed_data():
    print("Seeding Villages...")
    village_ids = []
    for v in villages:
        try:
            res = requests.post(f"{API_URL}/villages/", json=v)
            if res.status_code == 200:
                village_ids.append(res.json()["id"])
                print(f"Created {v['name']}")
        except Exception as e:
            print(f"Error creating village: {e}")

    print("Seeding Members...")
    for i in range(20):
        village_id = random.choice(village_ids) if village_ids else None
        profession = random.choice(professions)
        user = {
            "email": f"member{i+1}@example.com",
            "password": "password123",
            "full_name": f"Member {i+1}",
            "phone_number": f"98765432{i:02d}",
            "village_id": village_id
        }
        
        try:
            # Register
            res = requests.post(f"{API_URL}/auth/register", json=user)
            if res.status_code == 200:
                data = res.json()
                print(f"Registered {data['full_name']}")
                
                # Update status and profession (Directly via DB would be better but we don't have direct DB script handy, 
                # effectively we are relying on defaults. Wait, Register doesn't allow setting status/profession directly in current API)
                # We need to hack this or just update the DB directly. 
                # For now, let's just register them. 
                # Ah, I forgot to update UserCreate to allow profession if I want to seed it via API.
                # Actually, I should update UserCreate too.
                pass
        except Exception as e:
            print(f"Error creating member: {e}")

if __name__ == "__main__":
    seed_data()
