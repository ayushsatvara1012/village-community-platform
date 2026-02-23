from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from .models import Base
from contextlib import asynccontextmanager

# Create tables on startup
# In production, use Alembic for migrations
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="Village Community API", lifespan=lifespan)

import traceback
from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    with open("trace.log", "w") as f:
        f.write(traceback.format_exc())
    return JSONResponse(status_code=500, content={"message": "Internal Server Error"})

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Village Community API is running"}

from .routers import auth, members, villages, payments, events, family

app.include_router(auth.router)
app.include_router(members.router)
app.include_router(villages.router)
app.include_router(payments.router)
app.include_router(events.router)
app.include_router(family.router)
