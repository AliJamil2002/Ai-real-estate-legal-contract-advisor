from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from database import db
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import tempfile, os, uuid, json, re, asyncio
from datetime import datetime
from dotenv import load_dotenv
from groq import Groq

pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'

load_dotenv()

router = APIRouter(prefix="/contract", tags=["Contract"])

# ════════════════════════════════
# GLOBAL STORAGE
# ════════════════════════════════
vector_store = {}
laws_vector_store = None

# ✅ GROQ CLIENT
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY)

# Embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

contracts_collection = db["contracts"]

# ════════════════════════════════
# PDF SCAN CHECK
# ════════════════════════════════
def is_scanned_pdf(path):
    reader = PdfReader(path)
    for page in reader.pages:
        if page.extract_text():
            return False
    return True

# ════════════════════════════════
# TEXT EXTRACTION (SYNC — thread mein chalega)
# ════════════════════════════════
def extract_text(file_path, filename):
    if filename.lower().endswith(".pdf"):
        if not is_scanned_pdf(file_path):
            reader = PdfReader(file_path)
            return "".join(p.extract_text() or "" for p in reader.pages)
        else:
            images = convert_from_path(file_path)
            return "".join(pytesseract.image_to_string(img) for img in images)
    else:
        return pytesseract.image_to_string(Image.open(file_path))

# ════════════════════════════════
# 🔥 ASYNC LLM CALL
# ════════════════════════════════
async def safe_llm(prompt):
    def call_llm():
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
            )
            return response.choices[0].message.content
        except Exception as e:
            print("❌ LLM Error:", e)
            return ""

    return await asyncio.to_thread(call_llm)

# ════════════════════════════════
# LOAD PAKISTAN LAWS (startup pe ek baar)
# ════════════════════════════════
def load_pakistan_laws():
    global laws_vector_store
    data_folder = os.path.join(os.path.dirname(__file__), "../data/")

    if not os.path.exists(data_folder):
        print("⚠️ Data folder missing")
        return

    all_text = ""

    for filename in os.listdir(data_folder):
        if filename.endswith(".pdf"):
            print(f"📄 Loading law: {filename}")
            try:
                reader = PdfReader(os.path.join(data_folder, filename))
                for page in reader.pages:
                    all_text += page.extract_text() or ""
            except Exception as e:
                print(f"⚠️ Error loading {filename}: {e}")

    if not all_text.strip():
        print("⚠️ No law text found")
        return

    splitter = RecursiveCharacterTextSplitter(chunk_size=300, chunk_overlap=50)
    chunks = splitter.split_text(all_text)
    laws_vector_store = FAISS.from_texts(chunks, embeddings)
    print(f"✅ Pakistan Laws loaded! {len(chunks)} chunks")

load_pakistan_laws()

# ════════════════════════════════
# UPLOAD CONTRACT
# ════════════════════════════════
@router.post("/upload")
async def upload_contract(file: UploadFile = File(...)):
    print(f"📁 File received: {file.filename}, type: {file.content_type}")
    suffix = ".pdf" if file.filename.endswith(".pdf") else ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        # 🔥 OCR/PDF extraction — blocking hai, thread mein
        text = await asyncio.to_thread(extract_text, tmp_path, file.filename)

        if not text.strip():
            raise HTTPException(400, detail="No text extracted")

        # 🔥 FAISS indexing — blocking hai, thread mein
        def build_faiss():
            splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=300)  # ✅ updated
            chunks = splitter.split_text(text)
            return FAISS.from_texts(chunks, embeddings)

        faiss_db = await asyncio.to_thread(build_faiss)

        contract_id = str(uuid.uuid4())
        vector_store[contract_id] = faiss_db

        summary_prompt = f"""
You are a Pakistani legal AI assistant.

Return ONLY valid JSON with no extra text:

{{
  "summary": "2-3 line summary",
  "clauses": [
    {{"type":"danger","title":"...","text":"..."}},
    {{"type":"warning","title":"...","text":"..."}},
    {{"type":"info","title":"...","text":"..."}},
    {{"type":"safe","title":"...","text":"..."}}
  ]
}}

Contract:
{text[:3000]}
"""

        # 🔥 LLM call async
        raw = await safe_llm(summary_prompt)
        print(f"🤖 LLM Response: {raw[:200]}")

        try:
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            parsed = json.loads(match.group()) if match else {}
        except:
            parsed = {}

        summary = parsed.get("summary", "Contract processed")
        clauses = parsed.get("clauses", [])

        await contracts_collection.insert_one({
            "contract_id": contract_id,
            "filename": file.filename,
            "summary": summary,
            "clauses": clauses,
            "full_text": text,
            "created_at": datetime.utcnow()
        })

        return {
            "contract_id": contract_id,
            "summary": summary,
            "clauses": clauses,
            "filename": file.filename
        }

    finally:
        os.unlink(tmp_path)

# ════════════════════════════════
# QUERY CONTRACT
# ════════════════════════════════
class QueryRequest(BaseModel):
    question: str
    contract_id: str

@router.post("/query")
async def query_contract(data: QueryRequest):

    faiss_db = vector_store.get(data.contract_id)

    if not faiss_db:
        contract = await contracts_collection.find_one(
            {"contract_id": data.contract_id}
        )

        if not contract:
            raise HTTPException(404, detail="Contract not found")

        text = contract.get("full_text", "")

        # 🔥 FAISS rebuild — thread mein
        def rebuild_faiss():
            chunks = RecursiveCharacterTextSplitter(
                chunk_size=1500, chunk_overlap=300  # ✅ updated
            ).split_text(text)
            return FAISS.from_texts(chunks, embeddings)

        faiss_db = await asyncio.to_thread(rebuild_faiss)
        vector_store[data.contract_id] = faiss_db

    # 🔥 Contract + Law search PARALLEL — asyncio.gather se
    async def search_contract():
        return await asyncio.to_thread(
            faiss_db.as_retriever(search_kwargs={"k": 10}).invoke,  # ✅ updated
            data.question
        )

    async def search_laws():
        if laws_vector_store:
            return await asyncio.to_thread(
                laws_vector_store.as_retriever(search_kwargs={"k": 2}).invoke,
                data.question
            )
        return []

    # 🔥 Dono searches ek saath chalein
    contract_docs, law_docs = await asyncio.gather(
        search_contract(),
        search_laws()
    )

    contract_context = "\n".join([d.page_content for d in contract_docs])
    law_context = "\n".join([d.page_content for d in law_docs])

    prompt = f"""You are an expert Pakistani real estate legal AI assistant with deep knowledge of Pakistan property laws.

LANGUAGE RULE (MOST IMPORTANT):
- User writes in English → You MUST reply in English
- User writes in Roman Urdu → You MUST reply in Roman Urdu
- User writes in Urdu script → You MUST reply in Urdu script
- NEVER mix languages in your response

ANSWER RULES:
- Answer ONLY from the contract and law context provided below
- Be specific, clear and helpful
- If information is not in context:
    - English question → say: "This information was not found in the document"
    - Roman Urdu question → say: "Yeh information document mein nahi mili"
    - Urdu script question → say: "یہ معلومات دستاویز میں نہیں ملی"
- Never make up information
- Keep answer concise but complete
- Highlight important points

CONTRACT CONTEXT:
{contract_context}

PAKISTAN LAW CONTEXT:
{law_context}

USER QUESTION:
{data.question}

YOUR ANSWER:"""

    # 🔥 LLM async
    answer = await safe_llm(prompt)

    return {
        "answer": answer,
        "context": contract_context[:300]
    }

# ════════════════════════════════
# LIST CONTRACTS
# ════════════════════════════════
@router.get("/list")
async def list_contracts():
    contracts = await contracts_collection.find(
        {},
        {
            "_id": 0,
            "contract_id": 1,
            "filename": 1,
            "summary": 1,
            "created_at": 1
        }
    ).to_list(100)

    return {"contracts": contracts}