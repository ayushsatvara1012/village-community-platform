# Local Development Guide

This guide explains how to run the Village Community Platform locally on your machine.

## Prerequisites
- **Python 3.10+** (for the backend)
- **Node.js 18+** (for the frontend)
- **PostgreSQL** (optional, uses a remote Supabase DB by default in `.env`)

---

## 🚀 Quick Start

The application consists of two parts: a FastAPI backend and a Vite+React frontend.

### 1. Backend (FastAPI)
The backend is typically already running in your terminal. If you need to start it manually:
1. Navigate to the `backend` directory.
2. Activate your virtual environment and install dependencies:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

   *The backend will be available at `http://127.0.0.1:8000`.*

### 2. Frontend (Vite + React)
1. Open a new terminal window.
2. Navigate to the `frontend` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173` (or the port shown in your terminal).*

---

## 🔗 How it Works (Local vs. Production)

The frontend is configured with an **Automatic API Switch** in `frontend/src/context/AuthContext.jsx`:
- **Local:** If you access the site via `localhost` or `127.0.0.1`, it automatically connects to `http://127.0.0.1:8000`.
- **Production:** If accessed via the deployed URL, it connects to the Render backend (`https://village-community-platform.onrender.com`).

## 🛠️ Environment Configuration
- **Backend:** Configured via `backend/.env`.
- **Frontend:** Configured via `frontend/.env` (mainly for Firebase).

---

## 🐳 Running with Docker
If you prefer Docker, you can use the provided `docker-compose.yml`:
```bash
docker-compose up --build
```
This will spin up the backend, a local PostgreSQL database, and pgAdmin.
