# FastAPI Backend README

## Overview
This `fastapi` backend provides the API services for the AI Real Estate Legal Advisor mobile app. It handles user authentication, contract processing with OCR and AI analysis, legal chat with RAG, and voice assistant functionality using FastAPI, MongoDB, and external AI services.

## Features
- User registration and login with JWT authentication
- Contract upload and processing (PDF/image OCR)
- Contract summary and clause analysis using Groq LLM
- Contract-specific AI chat with retrieval-augmented generation (RAG)
- Voice assistant with speech-to-text (Whisper) and text-to-speech (ElevenLabs)
- Pakistan property law context integration for legal queries

## Project Structure
- `main.py` - FastAPI app entry point with CORS and router includes
- `routers/` - API endpoints:
  - `auth.py` - user authentication (register, login)
  - `contract.py` - contract upload, query, and list
  - `voice.py` - voice websocket for real-time speech processing
- `database.py` - MongoDB connection and collections
- `model.py` - Pydantic request/response models
- `data/` - Pakistan law documents for RAG retrieval
- `requirements.txt` - Python dependencies
- `pyproject.toml` - project metadata

## Prerequisites
- Python 3.12+
- MongoDB running locally or remote
- Tesseract OCR installed (for PDF/image processing)
- API keys for Groq, ElevenLabs, and optional MongoDB Atlas

## Setup
1. Open terminal in `fastapi/`
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Install Tesseract OCR:
   - macOS: `brew install tesseract`
   - Ubuntu: `sudo apt install tesseract-ocr`
   - Windows: Download from GitHub releases
5. Create `.env` file in `fastapi/` with:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=signin
   SECRET_KEY=your_secret_key_here
   GROQ_API_KEY=your_groq_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ELEVENLABS_VOICE_ID=your_voice_id
   ```

## Run the Backend
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.

## API Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user and return JWT token
- `POST /contract/upload` - Upload and process contract document
- `POST /contract/query` - Query contract with AI response
- `GET /contract/list` - List all uploaded contracts
- `WebSocket /voice/ws` - Voice assistant for speech input/output

## Dependencies
- `fastapi` - Web framework
- `motor` - Async MongoDB driver
- `passlib[bcrypt]` - Password hashing
- `python-jose[cryptography]` - JWT handling
- `python-multipart` - File uploads
- `pypdf` - PDF processing
- `pytesseract` - OCR for images
- `pdf2image` - Convert PDF to images for OCR
- `langchain` - Text splitting and embeddings
- `faiss-cpu` - Vector search
- `groq` - LLM API
- `websockets` - WebSocket support
- `python-dotenv` - Environment variables

## Notes
- Uses FAISS for contract vector search and Pakistan law retrieval.
- OCR handles both text PDFs and scanned images.
- Voice processing uses Groq Whisper for transcription and ElevenLabs for TTS.
- All AI responses are contextualized with Pakistan property laws.
- MongoDB stores users, contracts, and metadata.
- Ensure `.env` keys are valid for production use.

## Important
- Backend must be running for the mobile app to function.
- For production, use secure secrets and consider rate limiting.
- MongoDB connection string should be updated for remote databases.
