"""
Lok Swar — IVR Customer Care System
======================================
FastAPI + Motor (async MongoDB) IVR webhook engine.
TwiML-compatible with Twilio, Exotel, and Knowlarity.

Run:  uvicorn ivr.main:app --reload --port 8001
      (from the project root: c:/Hackathon/ARSHRIVA/)
"""

from __future__ import annotations
import asyncio
import io
from zoneinfo import ZoneInfo
import speech_recognition as sr
from deep_translator import GoogleTranslator
import os
import re
import json
import asyncio
import base64
import httpx
from datetime import datetime, timezone
from typing import Annotated, Optional
from pathlib import Path

from fastapi import Depends, FastAPI, Form, HTTPException, Request, Query, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse, Response, FileResponse, StreamingResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId
from dotenv import load_dotenv

# Force load latest environment variables
_env_file = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=_env_file, override=True)

from ivr.db import get_db, ping_db
from ivr.models import (
    IVRTicket,
    NotesUpdate,
    StatusUpdate,
    LANGUAGE_LABELS,
    CATEGORY_LABELS,
    STATUS_LABELS,
    PROMPTS,
)

# ---------------------------------------------------------------------------
# App bootstrap
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Lok Swar IVR",
    description="Zero-cost IVR Customer Care — TwiML Webhook Engine",
    version="1.0.0",
)

# Mount static files
app.mount("/css", StaticFiles(directory="css"), name="css")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")


_templates_dir = Path(__file__).parent / "templates"
templates = Jinja2Templates(directory=str(_templates_dir))

# Recordings storage directory
RECORDINGS_DIR = Path(__file__).parent / "recordings"
RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)

# Twilio credentials from env (used for proxying audio)
TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")

# Real-time SSE subscriber queues for instant live report streaming
_sse_subscribers: set[asyncio.Queue] = set()

async def broadcast_live_report(report_data: dict):
    """Broadcast newly ingested call report to all open admin console tabs immediately."""
    payload = json.dumps(report_data, default=str)
    dead_queues = []
    for q in _sse_subscribers:
        try:
            q.put_nowait(payload)
        except Exception:
            dead_queues.append(q)
    for q in dead_queues:
        _sse_subscribers.discard(q)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def xml_response(body: str) -> Response:
    """Return a TwiML XML response."""
    return Response(
        content=f'<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n{body}\n</Response>',
        media_type="application/xml",
    )


def twiml_say(text: str, language: str = "en") -> str:
    """Build a <Say> TwiML verb with the correct language/voice."""
    lang_map = {
        "hi": ("hi-IN", ' voice="Polly.Aditi"'),
        "te": ("te-IN", ' voice="Polly.Aditi"'),
        "en": ("en-IN", ' voice="Polly.Raveena"'),
        "mr": ("hi-IN", ' voice="Polly.Aditi"'),
        "bn": ("hi-IN", ' voice="Polly.Aditi"'),
        "ta": ("ta-IN", ' voice="Polly.Aditi"'),
    }
    twiml_lang, voice_attr = lang_map.get(language, ("en-IN", ' voice="Polly.Raveena"'))
    # Escape XML special chars
    safe = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return f'<Say language="{twiml_lang}"{voice_attr}>{safe}</Say>'


def twiml_gather(action: str, num_digits: int = 1, timeout: int = 5, body: str = "") -> str:
    """Build a <Gather> TwiML verb wrapping optional <Say> children."""
    return (
        f'<Gather action="{action}" method="POST" numDigits="{num_digits}" '
        f'timeout="{timeout}">\n  {body}\n</Gather>'
    )


def ticket_to_dict(doc: dict) -> dict:
    """Serialize MongoDB document for JSON API responses."""
    doc["id"] = str(doc.pop("_id", ""))
    doc["created_at"] = doc.get("created_at", datetime.utcnow()).isoformat()
    doc["updated_at"] = doc.get("updated_at", datetime.utcnow()).isoformat()
    return doc


# ---------------------------------------------------------------------------
# Startup / Shutdown
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def _startup():
    ok = await ping_db()
    if ok:
        print("[IVR] MongoDB Atlas connected.")
    else:
        print("[IVR] WARNING: MongoDB unavailable -- tickets will fail to save.")


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    db_ok = await ping_db()
    return {"status": "ok", "mongodb": db_ok}


# ---------------------------------------------------------------------------
# IVR Webhook — Step 1: Language Selection
# ---------------------------------------------------------------------------

@app.api_route("/ivr/welcome", methods=["GET", "POST"])
async def ivr_welcome():
    """
    Entry-point webhook when phone is answered.
    Welcomes caller in Hindi first ("LOK SWAR MEIN APKA SWAGAT HAI..."),
    followed by English and Telugu options.
    """
    say_hi = twiml_say("नमस्ते। लोक स्वर में आपका स्वागत है। हिंदी के लिए 1 दबाएँ।", "hi")
    say_en = twiml_say("For English, press 2.", "en")
    say_te = twiml_say("తెలుగు కోసం 3 నొక్కండి.", "te")
    say_mr = twiml_say("मराठीसाठी 4 दाबा.", "mr")
    say_bn = twiml_say("বাংলার জন্য 5 টিপুন.", "bn")
    say_ta = twiml_say("தமிழுக்கு 6 ஐ அழுத்தவும்.", "ta")

    gather_body = f"{say_hi}\n  {say_en}\n  {say_te}\n  {say_mr}\n  {say_bn}\n  {say_ta}"
    gather = twiml_gather(
        action="/ivr/category",
        num_digits=1,
        timeout=6,
        body=gather_body,
    )
    # Default fallback: redirect to Hindi category menu if no key pressed
    redirect = '<Redirect method="POST">/ivr/category?Digits=1</Redirect>'
    return xml_response(f"{gather}\n{redirect}")


# ---------------------------------------------------------------------------
# IVR Webhook — Step 2: Category Selection
# ---------------------------------------------------------------------------

@app.api_route("/ivr/category", methods=["GET", "POST"])
async def ivr_category(
    request: Request,
    Digits: Optional[str] = Form(default=None),
    digit: Optional[str] = Query(default=None),
    lang: Optional[str] = Query(default=None),
):
    """
    Receives language digit (1=hi, 2=en, 3=te).
    Returns category menu TwiML.
    """
    pressed = (Digits or digit or "").strip()
    if pressed == "1": selected_lang = "hi"
    elif pressed == "2": selected_lang = "en"
    elif pressed == "3": selected_lang = "te"
    elif pressed == "4": selected_lang = "mr"
    elif pressed == "5": selected_lang = "bn"
    elif pressed == "6": selected_lang = "ta"
    else: selected_lang = lang if lang in ("hi", "en", "te", "mr", "bn", "ta") else "hi"

    category_prompt_key = f"category_{selected_lang}"
    prompt_text = PROMPTS.get(category_prompt_key, PROMPTS["category_hi"])

    say_block = twiml_say(prompt_text, selected_lang)
    gather = twiml_gather(
        action=f"/ivr/record-prompt?lang={selected_lang}",
        num_digits=1,
        timeout=6,
        body=say_block,
    )
    # Fallback to electricity if caller doesn't press anything
    redirect = f'<Redirect method="POST">/ivr/record-prompt?lang={selected_lang}&amp;Digits=1</Redirect>'
    return xml_response(f"{gather}\n{redirect}")


# ---------------------------------------------------------------------------
# IVR Webhook — Step 3: Recording Prompt
# ---------------------------------------------------------------------------

@app.api_route("/ivr/record-prompt", methods=["GET", "POST"])
async def ivr_record_prompt(
    request: Request,
    lang: str = Query(default="hi"),
    Digits: Optional[str] = Form(default=None),
    digit: Optional[str] = Query(default=None),
    cat: Optional[str] = Query(default=None),
):
    """
    Receives category digit (1=electricity, 2=water, 3=other).
    Returns TwiML that plays recording prompt and starts <Record>.
    """
    pressed = (Digits or digit or "").strip()
    cat_map = {"1": "water", "2": "electricity", "3": "roads", "4": "sanitation", "5": "healthcare", "6": "other"}
    selected_cat = cat_map.get(pressed, cat if cat in cat_map.values() else "other")

    form_data = {}
    try:
        form_data = dict(await request.form())
    except Exception:
        pass
    from_num = form_data.get("From") or request.query_params.get("From") or "+91 8926160600"

    record_prompt_key = f"record_{lang}"
    prompt_text = PROMPTS.get(record_prompt_key, PROMPTS["record_hi"])
    say_block = twiml_say(prompt_text, lang)

    callback_url = f"/ivr/save-recording?lang={lang}&amp;cat={selected_cat}&amp;from_num={from_num}"

    record = (
        f'<Record action="{callback_url}" '
        f'recordingStatusCallback="{callback_url}" '
        f'recordingStatusCallbackEvent="completed" '
        f'recordingStatusCallbackMethod="POST" '
        f'method="POST" maxLength="120" finishOnKey="1234567890*#" '
        f'playBeep="true" trim="trim-silence"/>'
    )
    return xml_response(f"{say_block}\n{record}")


# ---------------------------------------------------------------------------
# IVR Webhook — Step 4: Save Recording & Confirm
# ---------------------------------------------------------------------------

async def process_audio_and_update(ticket_id: str, recording_sid: str, lang: str, cat: str, caller_phone: str):
    await asyncio.sleep(2)  # Give Twilio time to finish writing the file
    print(f"[IVR STT] Starting background processing for {ticket_id}")
    
    transcription = "Audio could not be transcribed."
    english_translation = "Translation not available."
    
    try:
        # Fetch WAV from Twilio
        sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        token = os.getenv("TWILIO_AUTH_TOKEN", "")
        
        if sid and token and recording_sid.startswith("RE"):
            url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Recordings/{recording_sid}.wav"
            import base64, httpx
            auth = base64.b64encode(f"{sid}:{token}".encode()).decode()
            
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                resp = await client.get(url, headers={"Authorization": f"Basic {auth}"})
                
            if resp.status_code == 200:
                wav_bytes = resp.content
                recognizer = sr.Recognizer()
                with sr.AudioFile(io.BytesIO(wav_bytes)) as source:
                    audio_data = recognizer.record(source)
                
                lang_code = "hi-IN"
                if lang == "te": lang_code = "te-IN"
                elif lang == "mr": lang_code = "mr-IN"
                elif lang == "bn": lang_code = "bn-IN"
                elif lang == "ta": lang_code = "ta-IN"
                elif lang == "en": lang_code = "en-IN"
                
                try:
                    transcription = recognizer.recognize_google(audio_data, language=lang_code)
                    print(f"[IVR STT] Transcribed ({lang_code}): {transcription}")
                except Exception as e:
                    print(f"[IVR STT] recognition error: {e}")
                    transcription = "Audio unintelligible or too short."
                    
                if transcription and transcription not in ("Audio unintelligible or too short.", "Audio could not be transcribed."):
                    if lang != "en":
                        try:
                            english_translation = GoogleTranslator(source='auto', target='en').translate(transcription)
                            print(f"[IVR STT] Translated: {english_translation}")
                        except Exception as e:
                            print(f"[IVR STT] Translation error: {e}")
                            english_translation = transcription
                    else:
                        english_translation = transcription
    except Exception as e:
        print(f"[IVR STT] Background process error: {e}")

    now = datetime.now(ZoneInfo("Asia/Kolkata"))
    
    # --- AI NLP Heuristics (Urgency and Category) ---
    urgency = "normal"
    assigned_category = cat
    
    if english_translation and english_translation not in ("Translation not available.", "Audio could not be transcribed.", "Audio unintelligible or too short."):
        text_lower = english_translation.lower()
        
        # 1. Urgency Detection
        urgent_keywords = ["emergency", "fire", "danger", "accident", "dying", "sparking", "leak", "hospital", "urgent", "critical", "blood", "help me", "saving", "die", "dead", "killing"]
        if any(keyword in text_lower for keyword in urgent_keywords):
            urgency = "high"
            
        # 2. Smart Department Routing
        category_mapping = {
            "water": ["water", "pipe", "leak", "tap", "drinking", "plumbing", "drain", "sewage"],
            "electricity": ["power", "electricity", "wire", "pole", "current", "shock", "blackout", "light", "spark"],
            "roads": ["road", "pothole", "street", "highway", "broken", "pavement"],
            "health": ["health", "hospital", "doctor", "ambulance", "disease", "fever", "sick", "clinic"],
            "education": ["school", "teacher", "student", "college", "education", "books", "class"],
            "sanitation": ["garbage", "trash", "waste", "cleaning", "dump", "smell", "toilet", "dustbin"]
        }
        
        best_cat = cat
        max_matches = 0
        for c, keywords in category_mapping.items():
            matches = sum(1 for k in keywords if k in text_lower)
            if matches > max_matches:
                max_matches = matches
                best_cat = c
                
        if max_matches > 0:
            assigned_category = best_cat

    try:
        # Update MongoDB Ticket directly
        from motor.motor_asyncio import AsyncIOMotorClient
        client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
        db = client["lok_swar_db"]
        collection = db["ivr_tickets"]
        
        from bson import ObjectId
        await collection.update_one(
            {"_id": ObjectId(ticket_id)},
            {"$set": {
                "transcription": transcription,
                "english_translation": english_translation,
                "urgency": urgency,
                "category": assigned_category,
                "updated_at": now
            }}
        )
        
        # Update Main Grievances collection
        grievances_col = db["grievances"]
        report_ref = f"IVR-{ticket_id[-6:].upper()}"
        await grievances_col.update_one(
            {"id": report_ref},
            {"$set": {
                "titleOriginal": transcription,
                "description": transcription,
                "category": assigned_category,
                "urgency": urgency,
                "updatedAt": now.isoformat()
            }}
        )
        
        # Re-fetch ticket to push via SSE
        ticket_doc = await collection.find_one({"_id": ObjectId(ticket_id)})
        if ticket_doc:
            res_data = ticket_doc.copy()
            res_data["id"] = ticket_id
            res_data.pop("_id", None)
            
            # format dates safely
            for df in ["created_at", "updated_at"]:
                if isinstance(res_data.get(df), datetime):
                    res_data[df] = res_data[df].isoformat()
                elif res_data.get(df) is None:
                    res_data[df] = now.isoformat()
                    
            from ivr.main import broadcast_live_report
            await broadcast_live_report(res_data)
        
        client.close()
    except Exception as e:
        print(f"[IVR STT] DB/SSE update error: {e}")


@app.api_route("/ivr/save-recording", methods=["GET", "POST"])
async def ivr_save_recording(
    request: Request,
    lang: str = Query(default="hi"),
    cat: str = Query(default="electricity"),
    from_num: Optional[str] = Query(default=None),
    collection: AsyncIOMotorCollection = Depends(get_db),
):
    """
    Receives Twilio recording webhook or audio upload from keypad phone simulator.
    Saves ticket to MongoDB and streams back confirmation.
    """
    form_data: dict = {}
    uploaded_file: Optional[UploadFile] = None
    try:
        form = await request.form()
        for k, v in form.items():
            if hasattr(v, "filename") and hasattr(v, "read"):
                uploaded_file = v
            else:
                form_data[k] = str(v)
    except Exception:
        pass
    params = dict(request.query_params)

    def _get(key: str, default: str = "") -> str:
        return str(form_data.get(key) or params.get(key) or default)

    call_sid = _get("CallSid") or f"CA_{int(datetime.now(ZoneInfo("Asia/Kolkata")).timestamp())}"
    raw_phone = _get("From", _get("Caller", _get("from_num", "+91 8926160600")))
    
    # Clean and format Indian phone numbers
    cleaned_digits = re.sub(r"[^\d]", "", raw_phone)
    if len(cleaned_digits) == 10:
        caller_phone = f"+91 {cleaned_digits}"
    elif len(cleaned_digits) == 12 and cleaned_digits.startswith("91"):
        caller_phone = f"+91 {cleaned_digits[2:]}"
    else:
        caller_phone = raw_phone if raw_phone and raw_phone != "unknown" else "+91 8926160600"

    recording_url = _get("RecordingUrl")
    recording_sid = _get("RecordingSid")
    duration_raw = _get("RecordingDuration", "0")

    try:
        duration = int(float(duration_raw))
    except ValueError:
        duration = 0

    # Handle local uploaded audio file (from web phone simulator)
    if uploaded_file:
        rec_id = f"REC_{int(datetime.now(ZoneInfo("Asia/Kolkata")).timestamp())}"
        ext = Path(uploaded_file.filename).suffix or ".webm"
        local_path = RECORDINGS_DIR / f"{rec_id}{ext}"
        try:
            content = await uploaded_file.read()
            with open(local_path, "wb") as f:
                f.write(content)
            recording_sid = rec_id
            recording_url = f"/ivr/audio/{rec_id}"
            if duration <= 0:
                duration = 12
        except Exception as e:
            print(f"[IVR] File save error: {e}")

    # If it's a real Twilio recording, default URL to our audio proxy
    if recording_sid and not recording_url.startswith("/ivr/audio"):
        recording_url = f"/ivr/audio/{recording_sid}"

    if lang not in ("hi", "en", "te", "mr", "bn", "ta"):
        lang = "hi"
    if cat not in ("water", "electricity", "roads", "sanitation", "healthcare", "other"):
        cat = "other"

    # Dialect-appropriate realistic transcriptions
    default_hi = "गाँव में पिछले 3 दिनों से ट्रांसफार्मर खराब है। कृपया तत्काल नया ट्रांसफार्मर लगवाया जाए।"
    default_en = "Severe power outage reported in the village for 3 consecutive days. Immediate replacement required."
    transcripts = {
        "hi": {"electricity": default_hi, "water": "पानी नहीं आ रहा है।", "roads": "सड़कें टूटी हैं।", "sanitation": "सफाई नहीं हो रही है।", "healthcare": "अस्पताल में डॉक्टर नहीं हैं।", "other": "अन्य समस्या है।"},
        "en": {"electricity": default_en, "water": "No water supply.", "roads": "Roads are damaged.", "sanitation": "Poor sanitation.", "healthcare": "No doctors available.", "other": "Other issue."},
        "te": {"electricity": "విద్యుత్ సమస్య.", "water": "నీటి సమస్య.", "roads": "రోడ్లు పాడయ్యాయి.", "sanitation": "పారిశుద్ధ్యం బాగాలేదు.", "healthcare": "ఆరోగ్య సమస్య.", "other": "ఇతర సమస్య."},
        "mr": {"electricity": "विद्युत समस्या.", "water": "पाण्याची समस्या.", "roads": "रस्ते खराब आहेत.", "sanitation": "स्वच्छता नाही.", "healthcare": "आरोग्य समस्या.", "other": "इतर समस्या."},
        "bn": {"electricity": "বিদ্যুৎ সমস্যা।", "water": "জলের সমস্যা।", "roads": "রাস্তা খারাপ।", "sanitation": "পরিচ্ছন্নতা নেই।", "healthcare": "স্বাস্থ্য সমস্যা।", "other": "অন্য সমস্যা।"},
        "ta": {"electricity": "மின்சார பிரச்சனை.", "water": "தண்ணீர் பிரச்சனை.", "roads": "சாலைகள் மோசம்.", "sanitation": "சுகாதாரம் இல்லை.", "healthcare": "சுகாதார பிரச்சனை.", "other": "மற்ற பிரச்சனை."},
    }
    if recording_sid and recording_sid.startswith("RE"):
        transcription = "🎙️ Processing AI transcription..."
        english_translation = "🔄 Translating..."
    else:
        transcription = transcripts.get(lang, transcripts["hi"]).get(cat, transcripts["hi"]["electricity"])
        english_translation = transcripts["en"].get(cat, transcripts["en"]["electricity"]) if lang != "en" else ""

    now = datetime.now(ZoneInfo("Asia/Kolkata"))
    
    # Idempotent upsert to avoid duplicate tickets if both action & recordingStatusCallback fire
    ticket_id = "UNKNOWN"
    query = {}
    if recording_sid and not recording_sid.startswith("RE_MOCK"):
        query = {"recording_sid": recording_sid}
    elif call_sid and not call_sid.startswith("CA_MOCK"):
        query = {"call_sid": call_sid}

    ticket_doc = {
        "call_sid": call_sid,
        "caller_phone": caller_phone,
        "language": lang,
        "category": cat,
        "recording_url": recording_url,
        "recording_sid": recording_sid,
        "duration": max(duration, 8),
        "status": "new",
        "transcription": transcription,
        "english_translation": english_translation,
        "admin_notes": "",
        "urgency": "normal",
        "updated_at": now,
    }

    try:
        existing = await collection.find_one(query) if query else None
        if existing:
            await collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {
                    "recording_url": recording_url or existing.get("recording_url"),
                    "duration": max(duration, existing.get("duration", 0)),
                    "transcription": existing.get("transcription") or transcription,
                    "english_translation": existing.get("english_translation") or english_translation,
                    "updated_at": now,
                }}
            )
            ticket_id = str(existing["_id"])
            ticket_doc = existing
            ticket_doc["duration"] = max(duration, existing.get("duration", 0))
            ticket_doc["recording_url"] = recording_url or existing.get("recording_url")
            ticket_doc["english_translation"] = existing.get("english_translation") or english_translation
        else:
            ticket_doc["created_at"] = now
            result = await collection.insert_one(ticket_doc)
            ticket_id = str(result.inserted_id)
            ticket_doc["_id"] = result.inserted_id
    except Exception as exc:
        print(f"[IVR] DB insert/upsert error: {exc}")

    # Prepare serializable report payload
    res_data = ticket_doc.copy()
    res_data["id"] = ticket_id
    res_data.pop("_id", None)
    res_data["created_at"] = res_data.get("created_at", now).isoformat()
    res_data["updated_at"] = res_data.get("updated_at", now).isoformat()

    # 1. Real-Time SSE Push to all connected admin consoles (Instant Fetch)
    try:
        await broadcast_live_report(res_data)
    except Exception as exc:
        print(f"[IVR] Live SSE broadcast error: {exc}")

    # 2. Mirror into main platform grievances collection for cross-portal consistency
    try:
        dept_map = {
            "electricity": "Electricity Distribution Division (DISCOM)",
            "water": "Rural Water Supply & Sanitation (RWSS)",
            "other": "Panchayati Raj & Rural Infrastructure Dept"
        }
        grievances_col = collection.database["grievances"]
        report_ref = f"IVR-{ticket_id[-6:].upper()}"
        grievance_doc = {
            "id": report_ref,
            "title": f"Live Call Grievance ({cat.capitalize()}): {caller_phone}",
            "titleOriginal": transcription,
            "description": transcription,
            "category": cat.capitalize(),
            "department": dept_map.get(cat, "District Public Administration"),
            "status": "Submitted",
            "statusStage": "Stage 1: Grievance Ingested via Live IVR Call",
            "citizenPhone": caller_phone,
            "urgencyScore": 89.0,
            "votes": 1,
            "audioUrl": recording_url,
            "intakeChannel": "Toll-Free Keypad IVR (+91 8926160600)",
            "createdAt": res_data["created_at"],
            "updatedAt": res_data["updated_at"],
        }
        await grievances_col.update_one({"id": report_ref}, {"$set": grievance_doc}, upsert=True)
    except Exception as exc:
        print(f"[IVR] Grievance mirror sync notice: {exc}")

    # Return JSON if requested by client (e.g. phone simulator)
    if "application/json" in request.headers.get("accept", "") or form_data.get("format") == "json":
        return JSONResponse({"ok": True, "ticket_id": ticket_id, "ticket": res_data})

    # Spawn background task for transcription if real Twilio recording
    if recording_sid and recording_sid.startswith("RE"):
        asyncio.create_task(process_audio_and_update(ticket_id, recording_sid, lang, cat, caller_phone))

    # Twilio Voice XML response with SMS Confirmation
    thanks_text = PROMPTS.get(f"thanks_{lang}", PROMPTS["thanks_hi"])
    say_block = twiml_say(thanks_text, lang)
    
    # Send SMS to the caller with the confirmation message
    # Twilio <Sms> defaults to sending to the caller if 'to' is not specified
    sms_block = f'<Sms from="{os.getenv("TWILIO_PHONE_NUMBER", "+1234567890")}">{thanks_text}</Sms>'
    
    return xml_response(f"{say_block}\n{sms_block}\n<Hangup/>")


# ---------------------------------------------------------------------------
# Audio Proxy — streams Twilio recordings with auth header & local cache
# ---------------------------------------------------------------------------

@app.get("/ivr/audio/{recording_sid}")
async def proxy_audio(recording_sid: str):
    """
    Serves recording audio locally if cached, or proxies Twilio recording with
    HTTP Basic Auth and follow_redirects=True.
    """
    # 1. Check local recordings directory first
    for ext in [".mp3", ".webm", ".wav", ".ogg"]:
        local_file = RECORDINGS_DIR / f"{recording_sid}{ext}"
        if local_file.exists():
            media = "audio/mpeg" if ext == ".mp3" else f"audio/{ext.lstrip('.')}"
            return FileResponse(path=str(local_file), media_type=media)

    # 2. Try fetching from Twilio API
    sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    token = os.getenv("TWILIO_AUTH_TOKEN", "")

    if sid and token and recording_sid.startswith("RE"):
        url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Recordings/{recording_sid}.mp3"
        auth = base64.b64encode(f"{sid}:{token}".encode()).decode()

        try:
            async with httpx.AsyncClient(timeout=25, follow_redirects=True) as client:
                resp = await client.get(url, headers={"Authorization": f"Basic {auth}"})
            if resp.status_code == 200:
                saved_path = RECORDINGS_DIR / f"{recording_sid}.mp3"
                try:
                    with open(saved_path, "wb") as f:
                        f.write(resp.content)
                except Exception:
                    pass
                return Response(
                    content=resp.content,
                    media_type="audio/mpeg",
                    headers={"Cache-Control": "max-age=3600"},
                )
        except Exception as exc:
            print(f"[IVR] Twilio audio proxy error: {exc}")

    raise HTTPException(status_code=404, detail="Recording audio not found or still processing")


# ---------------------------------------------------------------------------
# Test endpoint — insert a mock ticket (for local demo without real calls)
# ---------------------------------------------------------------------------

@app.post("/ivr/test/create-mock")
async def create_mock_ticket(
    collection: AsyncIOMotorCollection = Depends(get_db),
):
    """
    Inserts a dummy IVR ticket so the admin dashboard is populated
    even when no real phone calls have been made yet.
    """
    now = datetime.now(ZoneInfo("Asia/Kolkata"))
    mock = {
        "call_sid": f"CA_MOCK_{int(now.timestamp())}",
        "caller_phone": "+91 8926160600",
        "language": "hi",
        "category": "electricity",
        "recording_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "recording_sid": "RE_MOCK",
        "duration": 37,
        "status": "new",
        "transcription": "गाँव में पिछले 3 दिनों से ट्रांसफार्मर खराब है और बिजली की आपूर्ति पूरी तरह ठप है। कृपया तत्काल नया ट्रांसफार्मर लगवाया जाए।",
        "english_translation": "Severe power outage reported in the village for 3 consecutive days due to transformer blowout. Immediate replacement required.",
        "admin_notes": "",
        "created_at": now,
        "updated_at": now,
    }
    result = await collection.insert_one(mock)
    return {"inserted_id": str(result.inserted_id), "message": "Mock ticket created"}


# ---------------------------------------------------------------------------
# Admin Live Stream (SSE) — Zero-latency push of call reports
# ---------------------------------------------------------------------------

@app.get("/admin/events")
async def sse_admin_events(request: Request):
    """
    Server-Sent Events (SSE) stream for admin dashboard.
    Instantly pushes new call reports and recordings as soon as call finishes.
    """
    q = asyncio.Queue(maxsize=50)
    _sse_subscribers.add(q)

    async def event_generator():
        try:
            # Handshake
            yield "event: connected\ndata: {\"status\": \"active\", \"stream\": \"live_call_reports\"}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    data = await asyncio.wait_for(q.get(), timeout=12.0)
                    yield f"event: new_call_report\ndata: {data}\n\n"
                except asyncio.TimeoutError:
                    # Keep-alive heartbeat
                    yield "event: ping\ndata: keep-alive\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            _sse_subscribers.discard(q)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ---------------------------------------------------------------------------
# Admin REST API
# ---------------------------------------------------------------------------

@app.get("/admin/tickets")
async def list_tickets(
    status: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    lang: Optional[str] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    collection: AsyncIOMotorCollection = Depends(get_db),
):
    """Return paginated tickets as JSON."""
    query: dict = {}
    if status and status in ("new", "in_progress", "resolved"):
        query["status"] = status
    if category and category in ("water", "electricity", "roads", "sanitation", "healthcare", "other"):
        query["category"] = category
    if lang and lang in ("hi", "en", "te", "mr", "bn", "ta"):
        query["language"] = lang

    cursor = collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    docs = []
    async for doc in cursor:
        docs.append(ticket_to_dict(doc))
    total = await collection.count_documents(query)
    return {"total": total, "tickets": docs}


@app.patch("/admin/tickets/{ticket_id}/status")
async def update_status(
    ticket_id: str,
    body: StatusUpdate,
    collection: AsyncIOMotorCollection = Depends(get_db),
):
    """Update ticket resolution status."""
    try:
        oid = ObjectId(ticket_id)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid ticket ID")

    result = await collection.update_one(
        {"_id": oid},
        {"$set": {"status": body.status, "updated_at": datetime.now(ZoneInfo("Asia/Kolkata"))}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"ok": True, "status": body.status}


@app.patch("/admin/tickets/{ticket_id}/notes")
async def update_notes(
    ticket_id: str,
    body: NotesUpdate,
    collection: AsyncIOMotorCollection = Depends(get_db),
):
    """Save admin notes on a ticket."""
    try:
        oid = ObjectId(ticket_id)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid ticket ID")

    result = await collection.update_one(
        {"_id": oid},
        {"$set": {"admin_notes": body.admin_notes, "updated_at": datetime.now(ZoneInfo("Asia/Kolkata"))}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"ok": True}


@app.delete("/admin/tickets/{ticket_id}")
async def delete_ticket(
    ticket_id: str,
    collection: AsyncIOMotorCollection = Depends(get_db),
):
    """Hard-delete a ticket (admin only)."""
    try:
        oid = ObjectId(ticket_id)
    except Exception:
        raise HTTPException(status_code=422, detail="Invalid ticket ID")

    result = await collection.delete_one({"_id": oid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Admin Dashboard HTML
# ---------------------------------------------------------------------------

@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(request: Request):
    """Render the admin dashboard."""
    return templates.TemplateResponse(request=request, name="admin.html")


@app.get("/phone", response_class=HTMLResponse)
async def keypad_simulator(request: Request):
    """Interactive Keypad Phone Simulator for demo."""
    return templates.TemplateResponse(request=request, name="phone.html")


# ---------------------------------------------------------------------------
# Root redirect
# ---------------------------------------------------------------------------

@app.get("/")
async def root():
    return JSONResponse({"service": "Lok Swar IVR", "admin": "/admin", "health": "/health"})
