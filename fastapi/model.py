from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from typing import List

# ── AUTH ──────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    name: str
    email: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse


# __Contract Analysis__
class ClauseItem(BaseModel):
    type: str    # danger, warning, info, safe
    title: str
    text: str

class UploadResponse(BaseModel):
    contract_id: str
    filename: str
    summary: str
    clauses: List[ClauseItem]

class QueryResponse(BaseModel):
    answer: str
    context: Optional[str] = None