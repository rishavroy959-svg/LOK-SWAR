"""
IVR System — Pydantic v2 Schemas
"""
from __future__ import annotations
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Ticket document (as stored in MongoDB)
# ---------------------------------------------------------------------------
class IVRTicket(BaseModel):
    call_sid: str = ""
    caller_phone: str = ""
    language: Literal["hi", "te", "en"] = "hi"
    category: Literal["electricity", "water", "other"] = "other"
    recording_url: str = ""
    recording_sid: str = ""
    duration: int = 0                  # seconds
    status: Literal["new", "in_progress", "resolved"] = "new"
    admin_notes: str = ""
    transcription: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ---------------------------------------------------------------------------
# API request/response helpers
# ---------------------------------------------------------------------------
class StatusUpdate(BaseModel):
    status: Literal["new", "in_progress", "resolved"]


class NotesUpdate(BaseModel):
    admin_notes: str


# ---------------------------------------------------------------------------
# Human-readable labels (used in templates & TwiML)
# ---------------------------------------------------------------------------
LANGUAGE_LABELS: dict[str, str] = {
    "hi": "Hindi",
    "te": "Telugu",
    "en": "English",
}

CATEGORY_LABELS: dict[str, str] = {
    "electricity": "Electricity / Bijli",
    "water": "Water / Paani",
    "other": "Other Complaint",
}

STATUS_LABELS: dict[str, str] = {
    "new": "New",
    "in_progress": "In Progress",
    "resolved": "Resolved",
}

# ---------------------------------------------------------------------------
# Multi-language TTS script library
# ---------------------------------------------------------------------------
PROMPTS: dict[str, dict[str, str]] = {
    "welcome": {
        "hi": (
            "नमस्ते। लोक स्वर ग्राहक सेवा में आपका स्वागत है। "
            "भाषा चुनने के लिए अंक दबाएँ। "
            "हिंदी के लिए एक दबाएँ। "
            "तेलुगू के लिए दो दबाएँ। "
            "अंग्रेज़ी के लिए तीन दबाएँ।"
        ),
        "te": (
            "నమస్కారం. లోక్ స్వర్ కస్టమర్ కేర్‌కు స్వాగతం. "
            "భాష ఎంచుకోవడానికి నంబర్ నొక్కండి. "
            "హిందీ కోసం ఒకటి నొక్కండి. "
            "తెలుగు కోసం రెండు నొక్కండి. "
            "ఇంగ్లీష్ కోసం మూడు నొక్కండి."
        ),
        "en": (
            "Welcome to Lok Swar customer care. "
            "Press 1 for Hindi. "
            "Press 2 for Telugu. "
            "Press 3 for English."
        ),
    },
    "category_hi": (
        "अपनी समस्या की श्रेणी चुनें। "
        "बिजली की समस्या के लिए एक दबाएँ। "
        "पानी या सिंचाई की समस्या के लिए दो दबाएँ। "
        "अन्य शिकायत के लिए तीन दबाएँ।"
    ),
    "category_te": (
        "మీ సమస్య వర్గాన్ని ఎంచుకోండి. "
        "విద్యుత్ సమస్య కోసం ఒకటి నొక్కండి. "
        "నీరు లేదా నీటిపారుదల కోసం రెండు నొక్కండి. "
        "ఇతర ఫిర్యాదు కోసం మూడు నొక్కండి."
    ),
    "category_en": (
        "Select your issue category. "
        "Press 1 for Electricity. "
        "Press 2 for Water or Irrigation. "
        "Press 3 for Other complaints."
    ),
    "record_hi": (
        "कृपया बीप के बाद अपनी समस्या विस्तार से बताएं। बोलने के बाद हैश दबाएँ या सीधे फोन काट दें।"
    ),
    "record_te": (
        "దయచేసి బీప్ తర్వాత మీ సమస్యను వివరించండి మరియు పూర్తయిన తర్వాత హ్యాష్ నొక్కండి లేదా కాల్ ముగించండి."
    ),
    "record_en": (
        "Please describe your issue after the beep. Press hash or hang up when you are done."
    ),
    "thanks_hi": (
        "धन्यवाद। आपकी शिकायत लोक स्वर में दर्ज कर ली गई है। "
        "प्रशासनिक टीम शीघ्र कार्रवाई करेगी। नमस्ते।"
    ),
    "thanks_te": (
        "ధన్యవాదాలు. మీ ఫిర్యాదు లోక్ స్వర్ లో నమోదు చేయబడింది. "
        "త్వరలో పరిష్కరించబడుతుంది. నమస్కారం."
    ),
    "thanks_en": (
        "Thank you. Your complaint has been registered with Lok Swar. "
        "It will be resolved shortly. Goodbye."
    ),
    "invalid": {
        "hi": "अमान्य प्रविष्टि। कृपया पुनः प्रयास करें।",
        "te": "చెల్లని ఎంపిక. దయచేసి మళ్ళీ ప్రయత్నించండి.",
        "en": "Invalid input. Please try again.",
    },
}
