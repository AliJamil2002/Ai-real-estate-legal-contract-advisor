from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from database import users_collection
from model import RegisterRequest, LoginRequest
import jwt, os
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY  = os.getenv("SECRET_KEY", "supersecretkey123")

@router.post("/register")
async def register(data: RegisterRequest):
    # Email already exists?
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(400, detail="Email pehle se registered hai")

    # Password hash karo
    hashed = pwd_context.hash(data.password)

    # MongoDB mein save karo
    await users_collection.insert_one({
        "name":       data.name,
        "email":      data.email,
        "password":   hashed,
        "created_at": datetime.utcnow()
    })
    return {"message": "Account ban gaya!"}


@router.post("/login")
async def login(data: LoginRequest):
    # User dhundo
    user = await users_collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(401, detail="Email ya password galat hai")

    # Password verify karo
    if not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(401, detail="Email ya password galat hai")

    # JWT token banao
    token = jwt.encode({
        "user_id": str(user["_id"]),
        "email":   user["email"],
        "exp":     datetime.utcnow() + timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")

    return {
        "token": token,
        "user":  {"name": user["name"], "email": user["email"]}
    }