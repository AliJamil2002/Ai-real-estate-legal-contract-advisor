from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
import os, asyncio

# ════════════════════════════════
# EMBEDDINGS
# ════════════════════════════════
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ════════════════════════════════
# GLOBAL VECTOR STORE
# ════════════════════════════════
rag_vector_store = None

# ════════════════════════════════
# LOAD PAKISTAN LAWS
# ════════════════════════════════
def _load_rag_sync():
    global rag_vector_store
    data_folder = os.path.join(os.path.dirname(__file__), "../data/")

    if not os.path.exists(data_folder):
        print("⚠️ Data folder missing")
        return

    all_text = ""

    for filename in os.listdir(data_folder):
        if filename.endswith(".pdf"):
            print(f"📄 RAG Loading: {filename}")
            try:
                reader = PdfReader(os.path.join(data_folder, filename))
                for page in reader.pages:
                    all_text += page.extract_text() or ""
            except Exception as e:
                print(f"⚠️ Error: {filename}: {e}")

    if not all_text.strip():
        print("⚠️ No text found")
        return

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=300
    )
    chunks = splitter.split_text(all_text)
    rag_vector_store = FAISS.from_texts(chunks, embeddings)
    print(f"✅ RAG loaded! {len(chunks)} chunks")

# 🔥 Async loader — startup pe thread mein chalega
async def load_rag_knowledge():
    await asyncio.to_thread(_load_rag_sync)

# ════════════════════════════════
# SEARCH FUNCTION
# ════════════════════════════════
async def search_rag(question: str, k: int = 5) -> str:
    if not rag_vector_store:
        return ""

    docs = await asyncio.to_thread(
        rag_vector_store.as_retriever(search_kwargs={"k": k}).invoke,
        question
    )
    return "\n".join([d.page_content for d in docs])