from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "signin")

client = AsyncIOMotorClient(MONGO_URL)
db     = client[DB_NAME]

# Collections
users_collection     = db["user"]
contracts_collection = db["contracts"] 

async def get_database():
    return db