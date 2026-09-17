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
    language: Literal["hi", "en", "te", "mr", "bn", "ta"] = "hi"
    category: Literal["water", "electricity", "roads", "sanitation", "healthcare", "other"] = "other"
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
    "en": "English",
    "te": "Telugu",
    "mr": "Marathi",
    "bn": "Bengali",
    "ta": "Tamil",
}

CATEGORY_LABELS: dict[str, str] = {
    "water": "Water / Paani",
    "electricity": "Electricity / Bijli",
    "roads": "Roads / Sadak",
    "sanitation": "Sanitation / Swachhta",
    "healthcare": "Healthcare / Swasthya",
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
PROMPTS: dict[str, str] = {
    "category_hi": "अपनी समस्या की श्रेणी चुनें। पानी के लिए १ दबाएँ। बिजली के लिए २ दबाएँ। सड़कों के लिए ३ दबाएँ। स्वच्छता के लिए ४ दबाएँ। स्वास्थ्य के लिए ५ दबाएँ। अन्य के लिए ६ दबाएँ।",
    "category_en": "Select your issue category. Press 1 for Water. Press 2 for Electricity. Press 3 for Roads. Press 4 for Sanitation. Press 5 for Healthcare. Press 6 for Other.",
    "category_te": "మీ సమస్య వర్గాన్ని ఎంచుకోండి. నీటి కోసం 1 నొక్కండి. విద్యుత్ కోసం 2 నొక్కండి. రోడ్ల కోసం 3 నొక్కండి. పారిశుధ్యం కోసం 4 నొక్కండి. ఆరోగ్యం కోసం 5 నొక్కండి. ఇతరుల కోసం 6 నొక్కండి.",
    "category_mr": "आपल्या समस्येची श्रेणी निवडा. पाण्यासाठी १ दाबा. विजेसाठी २ दाबा. रस्त्यांसाठी ३ दाबा. स्वच्छतेसाठी ४ दाबा. आरोग्यासाठी ५ दाबा. अन्य तक्रारींसाठी ६ दाबा.",
    "category_bn": "আপনার সমস্যার বিভাগ বেছে নিন। জলের জন্য ১ টিপুন। বিদ্যুতের জন্য ২ টিপুন। রাস্তার জন্য ৩ টিপুন। পরিচ্ছন্নতার জন্য ৪ টিপুন। স্বাস্থ্যের জন্য ৫ টিপুন। অন্য অভিযোগের জন্য ৬ টিপুন।",
    "category_ta": "உங்கள் பிரச்சனைக்கான வகையைத் தேர்ந்தெடுக்கவும். தண்ணீருக்கு 1 ஐ அழுத்தவும். மின்சாரத்திற்கு 2 ஐ அழுத்தவும். சாலைகளுக்கு 3 ஐ அழுத்தவும். சுகாதாரத்திற்கு 4 ஐ அழுத்தவும். மருத்துவ வசதிக்கு 5 ஐ அழுத்தவும். மற்ற புகார்களுக்கு 6 ஐ அழுத்தவும்.",
    
    "record_hi": "कृपया बीप के बाद अपनी समस्या विस्तार से बताएं। बोलने के बाद हैश दबाएँ या फोन काट दें।",
    "record_en": "Please describe your issue after the beep. Press hash or hang up when you are done.",
    "record_te": "దయచేసి బీప్ తర్వాత మీ సమస్యను వివరించండి. మాట్లాడిన తర్వాత హ్యాష్ నొక్కండి లేదా కాల్ ముగించండి.",
    "record_mr": "कृपया बीपनंतर तुमची समस्या सविस्तर सांगा. बोलून झाल्यावर हॅश दाबा किंवा फोन ठेवा.",
    "record_bn": "দয়া করে বিপের পর আপনার সমস্যার কথা বিস্তারিত বলুন। বলা শেষ হলে হ্যাশ টিপুন অথবা ফোন কেটে দিন।",
    "record_ta": "பீப் ஒலிக்குப் பிறகு உங்கள் பிரச்சனையை விவரிக்கவும். பேசிய பிறகு ஹேஷ் பொத்தானை அழுத்தவும் அல்லது அழைப்பைத் துண்டிக்கவும்.",
    
    "thanks_hi": "धन्यवाद। आपकी समस्या लोक स्वर में दर्ज कर दी गई है।",
    "thanks_en": "Thank you. Your problem has been registered in Lok Swar.",
    "thanks_te": "ధన్యవాదాలు. మీ సమస్య లోక్ స్వర్ లో నమోదు చేయబడింది.",
    "thanks_mr": "धन्यवाद. तुमची समस्या लोक स्वर मध्ये नोंदवली गेली आहे.",
    "thanks_bn": "ধন্যবাদ। আপনার সমস্যা লোক স্বর-এ রেকর্ড করা হয়েছে।",
    "thanks_ta": "நன்றி. உங்கள் பிரச்சனை லோக் ஸ்வர்-இல் பதிவு செய்யப்பட்டுள்ளது.",
}
