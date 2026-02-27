# 🦅 Village Community Platform: The Bird's Eye View

Welcome to the team! You're looking at the **Village Community Platform**, a digital hub designed to connect and organize members of a village community. It's essentially a "Community ERP" that handles everything from identity (membership approval, IDs), financial contributions (donations, membership fees via Razorpay), to social structures (family trees) and event management (community gatherings and donation drives). Think of it as a private social network meets a governance portal for tight-knit rural or heritage communities.

---

## 🗺️ The Folder/File Map

### 🏚️ Backend (`/backend/app`)
*   `main.py`: The "Air Traffic Control" – initializes the FastAPI app and routes requests.
*   `models.py`: The "Blueprints" – contains SQLAlchemy models representing our database tables (Users, Villages, Payments, etc.).
*   `schemas.py`: The "Vetting Station" – defines Pydantic models for data validation and API request/response shapes.
*   `database.py`: The "Plumbing" – manages the connection to the PostgreSQL database.
*   `routers/`: The "Neighborhoods" – grouped API endpoints (e.g., `auth.py`, `members.py`, `family.py`).
*   `email_utils.py` & `sendgrid_utils.py`: The "Postmen" – handle outgoing OTPs and notifications.

### 🏠 Frontend (`/frontend/src`)
*   `main.jsx`: The "Ignition Switch" – the very first point of execution where React starts.
*   `App.jsx`: The "Navigation Deck" – defines all the routes (URLs) and the overall layout.
*   `pages/`: The "Rooms" – individual full-page components (Dashboard, Profile, Login).
*   `components/`: The "Furniture" – reusable UI elements like buttons, navbars, and modals.
*   `context/AuthContext.js`: The "ID Card" – manages the global login state (who is logged in?).

---

## 🕸️ The Dependency Graph

The project follows a classic **Client-Server-Database** architecture.

**Layer Diagram:**
`UI (React Pages) → Logic (FastAPI Routers) → Data (SQLAlchemy Models) → DB (PostgreSQL)`

**File Talk:**
*   `App.jsx` → `pages/*.jsx` (Mounts pages based on URL)
*   `pages/*.jsx` → `backend/app/routers/*.py` (Via fetch/axios API calls)
*   `routers/*.py` → `schemas.py` (Validates incoming digital mail)
*   `routers/*.py` → `models.py` (Reads/Writes to the blueprints)
*   `models.py` → `database.py` (Executes the actual storage)

---

## 🌊 The Data Flow: Adding a Family Member

Let's trace what happens when you click "Add Member" in your Family Tree:

1.  **Frontend View**: You click 'Add' on `Profile.jsx`.
2.  **State Logic**: A modal opens; you fill the form and hit 'Save'.
3.  **API Call**: `Profile.jsx` sends a POST request to `/family/members` on the backend.
4.  **Routing**: `backend/app/main.py` hands the request to `routers/family.py`.
5.  **Validation**: `routers/family.py` checks the data against `schemas.FamilyMemberCreate`.
6.  **Database Action**: The router creates a `models.FamilyMember` object and saves it via `database.py`.
7.  **Response**: The backend sends a 201 Success; the frontend updates the local tree UI instantly.

---

## 🏁 The Entry Points

1.  **Backend**: `backend/app/main.py`. This is where the FastAPI server "wakes up," connects to the DB, and registers all routers.
2.  **Frontend**: `frontend/src/main.jsx`. This is where React mounts the `App` component into the `index.html` file.

---

## 🎖️ The Core Files (The "80/20" Pack)

If you only read 3 files, read these:
1.  `backend/app/models.py`: Understand this, and you understand the "Brain" of the project—how data is structured.
2.  `frontend/src/App.jsx`: Understand this, and you see the "Skeleton"—how every page connects to another.
3.  `backend/app/routers/auth.py`: Understand this, and you see the "Security Guard"—how we handle the complex dance of OTPs, roles, and permissions.

---

## 🗣️ The Communication Rules

*   **Frontend to Backend**: Strictly **JSON over REST**. No GraphQL, no WebSockets yet.
*   **Browser to Storage**: We use **JWT Tokens** stored in `localStorage` to remember who you are.
*   **Internal Backend**: Heavy use of **FastAPI Dependencies** (`Depends(get_db)`) to inject database sessions into functions.

---

## ⚠️ The Danger Zones

1.  **`backend/app/models.py`**: Touching this is "Open Heart Surgery." A tiny change here requires a database migration (Alembic) or it will crash the whole system.
2.  **`frontend/src/context/AuthContext.js`**: This is the "Foundation." If you break the logic here, nobody can log in, and every single protected page will redirect to `/login`.
3.  **`backend/app/routers/payments.py`**: This handles real money (Razorpay). Bugs here don't just cause errors; they cause financial discrepancies. Tread carefully!

---

**Ready to dive in? Which area do you want to drill deeper into—the Family Tree logic, the Payment integration, or the Admin approval workflow?**
