from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from groq import Groq
from .ragservices import search_rag
import asyncio, os, base64, json
import websockets
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/voice", tags=["Voice"])

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "Xb7hH8MSUJpSbSDYk0k2")
MODEL_ID = "eleven_flash_v2_5"

print(f"🔑 ElevenLabs Key: {ELEVENLABS_API_KEY}")
print(f"🎤 ElevenLabs Voice ID: {VOICE_ID}")

# ════════════════════════════════
# STEP 1: WHISPER
# ════════════════════════════════
async def transcribe_audio(audio_bytes: bytes) -> str:
    def call_whisper():
        return groq_client.audio.transcriptions.create(
            file=("audio.m4a", audio_bytes),  # Expo HIGH_QUALITY = m4a
            model="whisper-large-v3-turbo",
            temperature=0,
            response_format="verbose_json",
        ).text
    return await asyncio.to_thread(call_whisper)

# ════════════════════════════════
# STEP 2: LLM + RAG
# ════════════════════════════════
async def get_llm_answer(question: str) -> str:
    context = await search_rag(question)

    def call_llm():
        return groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{
                "role": "user",
                "content": f"""You are an expert Pakistani real estate legal AI assistant.

LANGUAGE RULE:
- English → English reply
- Roman Urdu → Roman Urdu reply
- Urdu script → Urdu script reply

PAKISTAN LAWS CONTEXT:
{context}

QUESTION: {question}

ANSWER (concise, max 3-4 sentences):"""
            }],
            max_tokens=300,
        ).choices[0].message.content

    return await asyncio.to_thread(call_llm)

# ════════════════════════════════
# STEP 3: ELEVENLABS
# ════════════════════════════════
async def elevenlabs_stream(answer: str, client_ws: WebSocket):
    print(f"🔊 ElevenLabs calling with text: {answer[:50]}...")
    uri = f"wss://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}/stream-input?model_id={MODEL_ID}"

    try:
        # ✅ API key header mein
        async with websockets.connect(
            uri,
            additional_headers={"xi-api-key": ELEVENLABS_API_KEY}
        ) as el_ws:
            print("✅ ElevenLabs WS connected")

            # ✅ Init message — xi_api_key body mein mat bhejo
            await el_ws.send(json.dumps({
                "text": " ",
                "voice_settings": {
                    "stability": 0.5,
                    "similarity_boost": 0.8,
                    "use_speaker_boost": False
                },
                "generation_config": {
                    "chunk_length_schedule": [120, 160, 250, 290]
                }
            }))

            # ✅ Text bhejo
            await el_ws.send(json.dumps({"text": answer, "flush": True}))
            await el_ws.send(json.dumps({"text": ""}))

            audio_received = False

            while True:
                try:
                    message = await asyncio.wait_for(el_ws.recv(), timeout=15.0)
                    data = json.loads(message)
                    print(f"📦 ElevenLabs keys: {list(data.keys())}")

                    if data.get("audio"):
                        audio_chunk = base64.b64decode(data["audio"])
                        print(f"🎵 Sending audio chunk: {len(audio_chunk)} bytes")
                        # ✅ base64 string bhejo — React Native file se play karega
                        await client_ws.send_json({
                            "type": "audio",
                            "data": data["audio"]  # already base64
                        })
                        audio_received = True

                    if data.get("isFinal"):
                        print("✅ ElevenLabs stream done")
                        await client_ws.send_json({"status": "done"})
                        break

                except asyncio.TimeoutError:
                    print("⏰ ElevenLabs timeout")
                    await client_ws.send_json({"status": "done"})
                    break
                except websockets.exceptions.ConnectionClosed as e:
                    print(f"❌ ElevenLabs WS closed: {e}")
                    if not audio_received:
                        await client_ws.send_json({"status": "error", "message": "ElevenLabs connection closed"})
                    else:
                        await client_ws.send_json({"status": "done"})
                    break

    except Exception as e:
        print(f"❌ ElevenLabs error: {e}")
        import traceback
        traceback.print_exc()
        try:
            await client_ws.send_json({"status": "error", "message": f"TTS error: {str(e)}"})
        except:
            pass

# ════════════════════════════════
# MAIN WEBSOCKET
# ════════════════════════════════
@router.websocket("/ws")
async def voice_websocket(websocket: WebSocket):
    await websocket.accept()
    print("🎙️ Connected")

    try:
        while True:
            audio_bytes = await websocket.receive_bytes()
            print(f"🎤 Audio received: {len(audio_bytes)} bytes")

            # Step 1: Whisper
            await websocket.send_json({"status": "transcribing"})
            try:
                text = await transcribe_audio(audio_bytes)
                print(f"📝 Transcribed: {text}")
                if not text or not text.strip():
                    await websocket.send_json({"status": "error", "message": "Kuch sunai nahi diya, dobara bolein"})
                    continue
                await websocket.send_json({"status": "transcribed", "text": text})
            except Exception as e:
                print(f"❌ Whisper error: {e}")
                await websocket.send_json({"status": "error", "message": f"Transcription failed: {str(e)}"})
                continue

            # Step 2: RAG + LLM
            await websocket.send_json({"status": "thinking"})
            try:
                answer = await get_llm_answer(text)
                print(f"🤖 Answer: {answer}")
                await websocket.send_json({"status": "answered", "answer": answer})
            except Exception as e:
                print(f"❌ LLM error: {e}")
                await websocket.send_json({"status": "error", "message": f"AI error: {str(e)}"})
                continue

            # Step 3: ElevenLabs
            await websocket.send_json({"status": "speaking"})
            await elevenlabs_stream(answer, websocket)

    except WebSocketDisconnect:
        print("🔌 Disconnected")
    except Exception as e:
        print(f"❌ Main WS error: {e}")
        import traceback
        traceback.print_exc()
        try:
            await websocket.send_json({"status": "error", "message": str(e)})
        except:
            pass