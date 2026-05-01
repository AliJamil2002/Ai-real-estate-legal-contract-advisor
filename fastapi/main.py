
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.auth import router as auth
from routers.contract import router as contract
from routers.voice import router as voice
from dotenv import load_dotenv
load_dotenv()
app = FastAPI(title="AI Real Estate Legal Advisor API")

origins = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://192.168.100.183:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(auth)
app.include_router(contract)
app.include_router(voice)

@app.get("/")
async def root():
    return {"status": "AI Legal Advisor API chal rahi hai ✓"} 