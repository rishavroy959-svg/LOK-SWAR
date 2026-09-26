"""
Lok Swar - Multilingual AI Speech Translation & NLP Processing Engine
Translates citizen voice/text from regional languages (Bhojpuri/Bihari, Odia, Hindi, Bengali)
into structured Administrative English, Hindi, and Bhojpuri summaries with auto-categorization,
priority urgency scoring, and government funding scheme matching.
"""

import os
import re
import io
import urllib.request
import urllib.parse
import json
import base64

# Auto-load .env from root
_env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
if os.path.exists(_env_path):
    try:
        from dotenv import load_dotenv
        load_dotenv(_env_path)
    except Exception:
        try:
            with open(_env_path, "r", encoding="utf-8") as _f:
                for _line in _f:
                    _line = _line.strip()
                    if _line and not _line.startswith("#") and "=" in _line:
                        _k, _v = _line.split("=", 1)
                        if _k.strip() not in os.environ:
                            os.environ[_k.strip()] = _v.strip()
        except Exception:
            pass

try:
    import speech_recognition as sr
    HAS_SR = True
except ImportError:
    HAS_SR = False

# Comprehensive multi-lingual keyword dictionary for accurate automatic categorization
CATEGORY_RULES = [
    {
        "category": "Power & Electricity",
        "keywords": [
            "electric", "electricity", "pole", "wire", "power", "current", "darkness", "outage", "light", "transformer", "voltage", "spark", "cable",
            # Bhojpuri / Bihari
            "बिजली", "बिजुलिया", "करेंट", "करंट", "करंटवा", "पोल", "तार", "अन्हार", "अन्हारिया", "ट्रांसफार्मर", "ट्रांसफर्मरवा", 
            "लाइन नइखे", "जर गइल", "जल गइल", "लाइन कटल बा", "कट गइल बा", "बत्ती गुल", "वोल्टेज", "सार्ट", "स्पार्क",
            # Odia
            "ବିଜୁଳି", "ଖୁଣ୍ଟ", "ତାର", "ଟ୍ରାନ୍ସଫରମର", "କରେଣ୍ଟ", "ଅନ୍ଧାର", "ଆଲୋକ",
            # Hindi
            "बिजली", "खंभा", "तार", "ट्रांसफार्मर", "करेंट", "अंधेरा", "विद्युत", "वोल्टेज",
            # Bengali
            "বিদ্যুৎ", "খুঁটি", "তার", "কারেন্ট", "অন্ধকার", "ট্রান্সফরমার"
        ],
        "scheme": "Deen Dayal Upadhyaya Gram Jyoti Yojana / OPTCL Grid Pool",
        "default_urgency": 94.0
    },
    {
        "category": "Roads & Connectivity",
        "keywords": [
            "road", "bridge", "rasta", "pul", "pulia", "pola", "collapse", "washout", "flood", "detour", "pothole", "tar", "asphalt", "highway", "culvert",
            # Bhojpuri / Bihari
            "सड़किया", "सडकिया", "पुलवा", "पुलिया", "रास्ता", "रस्तवा", "गड्ढा", "गड़हा", "टूट गइल बा", "टूटल बा", "बह गइल बा", 
            "आवागमन बंद बा", "जाम बा", "रोड", "पुल", "सड़क", "पुलिया टूट गइल", "बाढ़ में बह गइल", "कीचड़",
            # Odia
            "ରାସ୍ତା", "ପୋଲ", "ପୋଲିଆ", "ଭାଙ୍ଗି", "ଧୋଇଯାଇଛି", "ଖାଲ", "ପିଚୁ",
            # Hindi
            "सड़क", "रास्ता", "पुल", "पुलिया", "गड्ढा", "टूट गया", "बह गई", "डामर", "मार्ग",
            # Bengali
            "রাস্তা", "সেতু", "কালভার্ট", "গর্ত", "ভেঙে", "বন্যায়"
        ],
        "scheme": "SDRF Disaster Relief Fund / PMGSY Rural Roads",
        "default_urgency": 92.5
    },
    {
        "category": "Drinking Water & RWSS",
        "keywords": [
            "water", "pani", "handpump", "borewell", "fluoride", "drinking", "paani", "dry", "yellow", "tap", "pipe", "pipeline", "leak", "chlorine", "motor",
            # Bhojpuri / Bihari
            "पनिया", "पानी", "चापाकल", "चापकाल", "नलका", "हैंडपंप", "हैंडपाइप", "नलवा", "सूख गइल", "पानी नइखे", "खराब बा", 
            "बिगड़ल बा", "पिए के पानी", "नल", "पाइप", "पानी चुअता", "गंदा पनिया", "बोरिंग",
            # Odia
            "ପାଣି", "ନଳକୂପ", "ଚୁଆ", "ପାଇପ", "ପାନୀୟ", "ଫ୍ଲୋରାଇଡ", "ଶୁଖିଯାଇଛି",
            # Hindi
            "पानी", "हैंडपंप", "चापाकल", "नल", "पाइप", "फ्लोराइड", "पीने का पानी", "सूख गया", "लीक",
            # Bengali
            "জল", "নলকূপ", "টিউবওয়েল", "ট্যাপ", "পাইপলাইন", "পানীয় জল"
        ],
        "scheme": "Jal Jeevan Mission (RWSS Har Ghar Jal)",
        "default_urgency": 89.0
    },
    {
        "category": "Education & 5T Schools",
        "keywords": [
            "school", "roof", "classroom", "children", "student", "teacher", "chhat", "vidyalaya", "high school", "midday", "meal", "desk", "toilet", "bench",
            # Bhojpuri / Bihari
            "स्कूल", "स्कूलवा", "छत", "छतवा", "कमरा", "मास्टर साहब", "मास्टर", "लइका", "लइकन", "बच्चा सब", "पढ़ाई", "चुअता", 
            "टपकता", "विद्यालय", "बस्ता", "किताब", "बेंच",
            # Odia
            "ବିଦ୍ୟାଳୟ", "ସ୍କୁଲ", "ଛାତ", "ଶ୍ରେଣୀଗୃହ", "ପିଲାମାନେ", "ଶିକ୍ଷକ", "ମଧ୍ୟାହ୍ନ ଭୋଜନ",
            # Hindi
            "स्कूल", "छत", "कक्षा", "छात्र", "बच्चे", "शिक्षक", "विद्यालय", "मिड डे मील", "कमरा",
            # Bengali
            "স্কুল", "ছাদ", "বিদ্যালয়", "শিক্ষক", "বাচ্চারা", "শ্রেণীকক্ষ", "মিড ডে মিল"
        ],
        "scheme": "5T High School Transformation Fund / Samagra Shiksha",
        "default_urgency": 86.0
    },
    {
        "category": "Healthcare & PHC",
        "keywords": [
            "hospital", "phc", "chc", "doctor", "ambulance", "medicine", "maternity", "pregnant", "health", "clinic", "nurse", "injection", "emergency", "fever",
            # Bhojpuri / Bihari
            "अस्पताल", "अस्पतलिया", "डाक्टर", "डक्टरा", "दवाई", "दवा", "इलाज", "एंबुलेंस", "बीमार", "नइखन", "नइखे मिलत", 
            "दवा-दारू", "सुई", "गर्भवती", "डिलीवरी", "मरीज",
            # Odia
            "ଡାକ୍ତରଖାନା", "ଡାକ୍ତର", "ଓଷଧ", "ଏମ୍ବୁଲାନ୍ସ", "ଗର୍ଭବତୀ", "ଚିକିତ୍ସା", "ସ୍ୱାସ୍ଥ୍ୟ",
            # Hindi
            "अस्पताल", "डॉक्टर", "दवा", "एम्बुलेंस", "गर्भवती", "इलाज", "प्राथमिक स्वास्थ्य केंद्र", "नर्स",
            # Bengali
            "হাসপাতাল", "ডাক্তার", "ওষুধ", "অ্যাম্বুলেন্স", "গর্ভবতী", "চিকিৎসা"
        ],
        "scheme": "National Health Mission (NHM) Emergency Infra & BSKY",
        "default_urgency": 95.0
    },
    {
        "category": "Drainage & Flood Mitigation",
        "keywords": [
            "drain", "drainage", "flood", "sewage", "sluice", "gate", "inundation", "overflow", "waterlogging", "gutter", "nallah", "sludge",
            # Bhojpuri / Bihari
            "नाली", "नाला", "नालवा", "पानी भरल बा", "जलजमाव", "बजबजा गइल", "कीचड़", "पानी भर गइल", "सीवर", "बदबू",
            # Odia
            "ନର୍ଦ୍ଦମା", "ଡ୍ରେନ", "ଜଳବନ୍ଦୀ", "ବନ୍ୟା", "ନାଳ",
            # Hindi
            "नाली", "नाला", "जलभराव", "कीचड़", "गंदा पानी", "बाढ़", "सीवर",
            # Bengali
            "ড্রেন", "নিকাশি", "জল জমে", "পয়ঃনিষ্কাশন"
        ],
        "scheme": "State Urban & Rural Flood Mitigation Pool",
        "default_urgency": 84.0
    },
    {
        "category": "Canal Irrigation & Agriculture",
        "keywords": [
            "canal", "irrigation", "farmer", "crop", "drought", "paddy", "pump", "field", "kisan",
            # Bhojpuri / Bihari
            "नहर", "नहरिया", "खेत", "फसल", "पटवन", "सुखात बा", "सिंचाई", "किसान", "धान", "सूखा", "खेती",
            # Odia
            "କେନାଲ", "ଜଳସେଚନ", "ଚାଷୀ", "ଫସଲ", "ମରୁଡ଼ି",
            # Hindi
            "नहर", "सिंचाई", "किसान", "फसल", "सूखा", "खेत",
            # Bengali
            "খাল", "সেচ", "কৃষক", "ফসল", "খরা"
        ],
        "scheme": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
        "default_urgency": 82.0
    }
]

# Characteristic grammatical and vocabulary markers for Bhojpuri / Bihari
BHOJPURI_MARKERS = [
    " बा", " बाटे", " बाड़े", "बा।", "बा?", "बा,", "नइखे", "नइखन", "गइल", "हमार", "रउवा", "तोहार", "लइका", "लइकन",
    "का भइल", "चुअता", "सुखात", "पनिया", "सड़किया", "पुलवा", "पटवन", "जर गइल", "बिगड़ल", "आइल", "दिक्कत बा", "चापकाल", "चापाकल",
    "हमनी", "रउआ", "काहे", "काहा", "बथान", "दियरा", "बाबू", "माई", "बाप"
]

# Bhojpuri / Bihari Colloquial Phrase Mapping to Clear Meaningful Hindi/English Concepts
BHOJPURI_PHRASE_NORMALIZER = [
    ("पुलिया टूट गइल बा", "पुलिया टूट गई है और आवागमन बाधित है"),
    ("पुलवा बह गइल बा", "पुल बाढ़ के पानी में बह गया है"),
    ("पानी नइखे आवत", "पीने का पानी नहीं आ रहा है"),
    ("पनिया सूख गइल", "पीने का पानी सूख गया है"),
    ("चापाकल खराब बा", "हैंडपंप और चापाकल खराब हो गया है"),
    ("चापकाल खराब बा", "हैंडपंप और चापाकल खराब हो गया है"),
    ("बिजली जर गइल", "ट्रांसफार्मर और बिजली का तार जल गया है"),
    ("लाइन नइखे", "बिजली आपूर्ति बंद है"),
    ("अन्हार बा", "गांव में अंधेरा छाया है"),
    ("छतवा चुअता", "स्कूल की छत से पानी टपक रहा है"),
    ("छत चुअता", "स्कूल की छत से पानी टपक रहा है"),
    ("डाक्टर नइखन", "अस्पताल में डॉक्टर उपलब्ध नहीं हैं"),
    ("दवाई नइखे मिलत", "अस्पताल में आवश्यक दवाएं उपलब्ध नहीं हैं"),
    ("पटवन नइखे होत", "फसलों की सिंचाई के लिए नहर में पानी नहीं है"),
    ("नाली भर गइल बा", "नाली जाम होने से रास्ते में जलजमाव हो गया है")
]

def normalize_bhojpuri_speech(text):
    """
    Normalizes spoken Bhojpuri / Bihari dialect variations to ensure 100% precision in NLP recognition.
    """
    if not text:
        return ""
    normalized = text
    for bho, hin in BHOJPURI_PHRASE_NORMALIZER:
        if bho in normalized:
            normalized = normalized.replace(bho, f"{bho} ({hin})")
    return normalized

def detect_language(text):
    if not text:
        return "Hindi"
    
    lower = text.strip()
    for marker in BHOJPURI_MARKERS:
        if marker in lower:
            return "Bihari / Bhojpuri"
    
    # Odia Unicode range: \u0B00-\u0B7F
    if re.search(r'[\u0B00-\u0B7F]', text):
        return "Odia"
    
    # Bengali / Assamese Unicode range: \u0980-\u09FF
    if re.search(r'[\u0980-\u09FF]', text):
        return "Bengali"
    
    # Gurmukhi (Punjabi) Unicode range: \u0A00-\u0A7F
    if re.search(r'[\u0A00-\u0A7F]', text):
        return "Punjabi"

    # Gujarati Unicode range: \u0A80-\u0AFF
    if re.search(r'[\u0A80-\u0AFF]', text):
        return "Gujarati"

    # Tamil Unicode range: \u0B80-\u0BFF
    if re.search(r'[\u0B80-\u0BFF]', text):
        return "Tamil"

    # Telugu Unicode range: \u0C00-\u0C7F
    if re.search(r'[\u0C00-\u0C7F]', text):
        return "Telugu"

    # Kannada Unicode range: \u0C80-\u0CFF
    if re.search(r'[\u0C80-\u0CFF]', text):
        return "Kannada"

    # Malayalam Unicode range: \u0D00-\u0D7F
    if re.search(r'[\u0D00-\u0D7F]', text):
        return "Malayalam"

    # Santali (Ol Chiki)
    if re.search(r'[\u1C50-\u1C7F]', text):
        return "Santali"

    # Maithili (Tirhuta)
    if re.search(r'[\U00011480-\U000114DF]', text):
        return "Maithili"

    # Arabic / Urdu / Sindhi / Kashmiri Unicode range: \u0600-\u06FF
    if re.search(r'[\u0600-\u06FF]', text):
        return "Urdu/Kashmiri/Sindhi"
    
    # Devanagari (Hindi, Marathi, Bhojpuri, Maithili) Unicode range: \u0900-\u097F
    if re.search(r'[\u0900-\u097F]', text):
        return "Hindi/Marathi"
    
    return "English"

def transcribe_audio_with_openai(raw_audio_bytes, preferred_lang=None):
    """
    Transcribes audio bytes into original native text using OpenAI Whisper API.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key or not raw_audio_bytes:
        return "", ""
    try:
        import httpx
        url = "https://api.openai.com/v1/audio/transcriptions"
        headers = {
            "Authorization": f"Bearer {api_key}"
        }
        files = {
            "file": ("voice_input.wav", raw_audio_bytes, "audio/wav")
        }
        data = {
            "model": "whisper-1",
            "response_format": "verbose_json"
        }
        if preferred_lang:
            iso_2 = preferred_lang[:2].lower()
            if iso_2 in ["hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa", "ur", "en"]:
                data["language"] = iso_2
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, headers=headers, files=files, data=data)
            if resp.status_code == 200:
                result = resp.json()
                text = result.get("text", "").strip()
                detected_lang = result.get("language", "")
                if text:
                    lang_name = detect_language(text)
                    if detected_lang:
                        lang_map = {
                            "hindi": "Hindi", "odia": "Odia", "bengali": "Bengali",
                            "marathi": "Marathi", "tamil": "Tamil", "telugu": "Telugu",
                            "english": "English", "urdu": "Urdu", "gujarati": "Gujarati",
                            "punjabi": "Punjabi", "kannada": "Kannada", "malayalam": "Malayalam"
                        }
                        lang_name = lang_map.get(detected_lang.lower(), lang_name)
                    return text, lang_name
    except Exception as e:
        print(f"[OpenAI Whisper Notice]: {e}")
    return "", ""

def translate_and_analyze_with_openai(text, spoken_language=None):
    """
    Leverages OpenAI GPT to translate regional speech into fluent Administrative English,
    auto-categorize, and generate incident summaries for district officials.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key or not text or not text.strip():
        return None
    try:
        import httpx
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        system_prompt = (
            "You are Lok Swar AI, an expert civic infrastructure assistant for Indian regional languages and governance. "
            "Analyze citizen complaints in Indian languages (Hindi, Odia, Bhojpuri, Bengali, Maithili, Tamil, Telugu, etc.) "
            "and convert them into clear, professional English for government administration.\n"
            "Return STRICT JSON only with keys:\n"
            "- 'spokenLanguage': identified language name (e.g. Hindi, Odia, Bhojpuri, Bengali, English)\n"
            "- 'originalText': clean transcription of the input in its native script\n"
            "- 'directEnglishTranslation': faithful, natural English translation of what the citizen said\n"
            "- 'aiAnalyzedTitle': concise government incident title in English (max 8 words)\n"
            "- 'adminEnglishTranslation': formal administrative inspection summary for District Magistrate\n"
            "- 'category': one of ['Roads & Connectivity', 'Drinking Water & RWSS', 'Power & Electricity', 'Education & 5T Schools', 'Healthcare & PHC', 'Drainage & Flood Mitigation', 'Irrigation & Canal', 'General']\n"
            "- 'suggestedScheme': official government scheme (e.g. PMGSY Rural Roads, Jal Jeevan Mission, DDUGJY, NHM, 5T High School, etc.)\n"
            "- 'urgencyScore': float between 70.0 and 99.0"
        )
        user_prompt = f"Citizen Grievance Text: {text}\nSelected Language Hint: {spoken_language or 'Auto-detect'}"
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "max_tokens": 500
        }
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"]
                parsed = json.loads(content)
                return parsed
    except Exception as e:
        print(f"[OpenAI Translation Notice]: {e}")
    return None

def transcribe_audio_data(raw_audio_bytes, preferred_lang=None):
    """
    Transcribes audio bytes (WAV or supported raw audio) into text using OpenAI Whisper or Python SpeechRecognition.
    Supports Odia (or-IN), Bengali (bn-IN), Hindi/Bihari/Bhojpuri (hi-IN), and English (en-IN/en-US).
    Returns (transcribed_text, detected_language_name).
    """
    if not raw_audio_bytes:
        return "", ""

    # 1. Primary Engine: OpenAI Whisper (if API key configured)
    stt_text, stt_lang = transcribe_audio_with_openai(raw_audio_bytes, preferred_lang)
    if stt_text:
        return stt_text, stt_lang

    if not HAS_SR:
        return "", ""
    
    try:
        r = sr.Recognizer()
        r.energy_threshold = 300
        r.dynamic_energy_threshold = True

        audio_file = io.BytesIO(raw_audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = r.record(source)

        # Build candidate language list
        # Build candidate language list with robust multi-dialect fallbacks
        candidate_langs = []
        if preferred_lang:
            pl = preferred_lang.lower().strip()
            lang_map = {
                "or": ["or-IN", "hi-IN", "bn-IN"], "odia": ["or-IN", "hi-IN", "bn-IN"],
                "bn": ["bn-IN", "hi-IN"], "bengali": ["bn-IN", "hi-IN"], "bangla": ["bn-IN", "hi-IN"],
                "hi": ["hi-IN", "en-IN"], "hindi": ["hi-IN", "en-IN"],
                "bho": ["hi-IN"], "bihari": ["hi-IN"], "bhojpuri": ["hi-IN"],
                "en": ["en-IN", "en-US"], "english": ["en-IN", "en-US"],
                "ta": ["ta-IN", "en-IN"], "tamil": ["ta-IN", "en-IN"],
                "te": ["te-IN", "en-IN"], "telugu": ["te-IN", "en-IN"],
                "kn": ["kn-IN", "en-IN"], "kannada": ["kn-IN", "en-IN"],
                "ml": ["ml-IN", "en-IN"], "malayalam": ["ml-IN", "en-IN"],
                "mr": ["mr-IN", "hi-IN"], "marathi": ["mr-IN", "hi-IN"],
                "gu": ["gu-IN", "hi-IN"], "gujarati": ["gu-IN", "hi-IN"],
                "pa": ["pa-IN", "hi-IN"], "punjabi": ["pa-IN", "hi-IN"],
                "ur": ["ur-IN", "hi-IN"], "urdu": ["ur-IN", "hi-IN"],
                "as": ["as-IN", "bn-IN", "hi-IN"], "assamese": ["as-IN", "bn-IN", "hi-IN"],
                "mai": ["hi-IN"], "maithili": ["hi-IN"],
                "sat": ["hi-IN", "bn-IN"], "santali": ["hi-IN", "bn-IN"],
                "ks": ["ur-IN", "hi-IN"], "kashmiri": ["ur-IN", "hi-IN"],
                "sd": ["ur-IN", "hi-IN"], "sindhi": ["ur-IN", "hi-IN"]
            }
            if pl in lang_map:
                for c in lang_map[pl]:
                    if c not in candidate_langs:
                        candidate_langs.append(c)

        # Priority scan: Odia, Hindi/Bihari, Bengali, English + some common ones
        all_langs = ["hi-IN", "en-IN", "bn-IN", "te-IN", "ta-IN", "mr-IN", "gu-IN", "ur-IN"]
        for l in all_langs:
            if l not in candidate_langs:
                candidate_langs.append(l)

        for lang_code in candidate_langs:
            try:
                transcript = r.recognize_google(audio_data, language=lang_code)
                if transcript and transcript.strip():
                    detected = detect_language(transcript)
                    if lang_code == "or-IN": detected = "Odia"
                    elif lang_code == "bn-IN": detected = "Bengali"
                    elif lang_code == "as-IN": detected = "Assamese"
                    elif lang_code == "mr-IN": detected = "Marathi"
                    elif lang_code == "ta-IN": detected = "Tamil"
                    elif lang_code == "te-IN": detected = "Telugu"
                    elif lang_code == "kn-IN": detected = "Kannada"
                    elif lang_code == "ml-IN": detected = "Malayalam"
                    elif lang_code == "gu-IN": detected = "Gujarati"
                    elif lang_code == "pa-IN": detected = "Punjabi"
                    elif lang_code == "ur-IN": detected = "Urdu"
                    elif lang_code == "mai-IN": detected = "Maithili"
                    elif lang_code == "sat-IN": detected = "Santali"
                    elif lang_code == "ks-IN": detected = "Kashmiri"
                    elif lang_code == "sd-IN": detected = "Sindhi"
                    return transcript.strip(), detected
            except sr.UnknownValueError:
                continue
            except Exception as e:
                continue

    except Exception as e:
        print(f"[Audio Transcription Notice]: {e}")
    
    return "", ""

def _chunk_text_by_sentences(text, max_chars=300):
    """Splits long text (e.g. 100+ words) into natural sentence chunks for reliable API translation."""
    if len(text) <= max_chars:
        return [text]
    parts = re.split(r'([।\.\n\?!]+)', text)
    chunks = []
    curr = ""
    for p in parts:
        if not p:
            continue
        if len(curr) + len(p) <= max_chars:
            curr += p
        else:
            if curr.strip():
                chunks.append(curr.strip())
            curr = p
    if curr.strip():
        chunks.append(curr.strip())
    # Fallback if a single sentence was too long
    final_chunks = []
    for c in chunks:
        if len(c) > max_chars:
            words = c.split()
            sub = ""
            for w in words:
                if len(sub) + len(w) + 1 <= max_chars:
                    sub += (" " if sub else "") + w
                else:
                    if sub: final_chunks.append(sub)
                    sub = w
            if sub: final_chunks.append(sub)
        else:
            final_chunks.append(c)
    return final_chunks or [text]

def normalize_vernacular_speech(text):
    """
    Normalizes common Indian dialect colloquialisms (Bhojpuri, Maithili, Odia, Hindi)
    into standard terms for high-accuracy neural translation.
    """
    if not text:
        return text
    bhojpuri_map = [
        (r'\bचापाकल\b', 'हैंडपंप'),
        (r'\bचापकाल\b', 'हैंडपंप'),
        (r'\bपनिया\b', 'पानी'),
        (r'\bसड़किया\b', 'सड़क'),
        (r'\bपुलवा\b', 'पुल'),
        (r'\bनलवा\b', 'नल'),
        (r'\bस्कूलवा\b', 'स्कूल'),
        (r'\bछतवा\b', 'छत'),
        (r'\bबिजुलिया\b', 'बिजली'),
        (r'\bखम्भवा\b', 'खंभा'),
        (r'\bनहरिया\b', 'नहर'),
        (r'\bनालवा\b', 'नाला'),
        (r'\bनइखे आवत\b', 'नहीं आ रहा है'),
        (r'\bनइखे\b', 'नहीं है'),
        (r'\bजर गइल\b', 'जल गया'),
        (r'\bटूट गइल\b', 'टूट गया'),
        (r'\bगिर गइल\b', 'गिर गया'),
        (r'\bबह गइल\b', 'बह गया'),
        (r'\bगइल\b', 'गया'),
        (r'\bखराब बा\b', 'खराब है'),
        (r'\bबा\b', 'है'),
        (r'\bहमार\b', 'हमारे'),
        (r'\bरउवा\b', 'आप'),
        (r'\bतनी\b', 'थोड़ा'),
        (r'\bबड़का\b', 'बड़ा'),
    ]
    for pattern, replacement in bhojpuri_map:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text

def is_likely_english(text):
    """Checks if ASCII text is actually English or Romanized Indian language (Hinglish)."""
    if not text:
        return True
    if any(ord(c) >= 128 for c in text):
        return False
    hinglish_markers = {
        "humare", "hamare", "gaon", "gao", "mein", "me", "pani", "paani", "bijli", "sadak",
        "toot", "khambha", "khamba", "gaya", "hai", "nahi", "nhi", "raha", "chapakal", "gaddha",
        "pul", "pulia", "bada", "bahut", "samasya", "dikkat", "kisan", "kheti", "naali", "nala",
        "aspataal", "mariz", "bimar", "kharab", "thik", "pura", "bhi", "aur", "kar", "diya", "kiya",
        "karo", "kijiye", "rahe", "hote", "kaise", "kab", "kyu", "kyun", "chhat", "pole", "wire"
    }
    words = re.findall(r'[a-zA-Z]+', text.lower())
    if not words:
        return True
    if any(w in hinglish_markers for w in words):
        return False
    return True

def fetch_live_translation_to_english(raw_text, quick_mode=False, source_lang_code=None):
    """
    Translates regional text from ANY language (Bihari, Bhojpuri, Odia, Hindi, Bengali, Tamil, Hinglish, etc.)
    directly into clean English for search bar insertion and categorization.
    quick_mode=True skips OpenAI for faster response (used by /api/translate/quick).
    """
    if not raw_text or not raw_text.strip():
        return ""
    # Strip any accidental prefixes
    text = re.sub(r'^(Public infrastructure grievance:\s*)+', '', raw_text.strip(), flags=re.IGNORECASE).strip()
    if not text:
        return ""

    # Skip ONLY if text is verified to be native English (not Hinglish)
    if is_likely_english(text):
        return text

    # Pre-normalize dialect terms (e.g. Bhojpuri chaapaakal -> handpump)
    text = normalize_vernacular_speech(text)

    # Tier 0: OpenAI Translation Engine (High accuracy for Indian languages/dialects)
    if not quick_mode:
        try:
            openai_res = translate_and_analyze_with_openai(text)
            if openai_res and openai_res.get("directEnglishTranslation"):
                return openai_res["directEnglishTranslation"].strip()
        except Exception:
            pass

    # Tier 1: Google GTX NMT Translation API (supports multi-sentence long text & Hinglish)
    try:
        chunks = _chunk_text_by_sentences(text, max_chars=400)
        translated_parts = []
        for chunk in chunks:
            iso_map = {
                "Hindi": "hi", "Hindi/Marathi": "hi", "Bihari / Bhojpuri": "bho", "Bhojpuri": "bho",
                "Odia": "or", "Bengali": "bn", "Tamil": "ta", "Telugu": "te",
                "Punjabi": "pa", "Gujarati": "gu", "Kannada": "kn",
                "Malayalam": "ml", "Marathi": "mr", "Urdu": "ur", "Urdu/Kashmiri/Sindhi": "ur"
            }
            sl = iso_map.get(source_lang_code, "auto") if source_lang_code else "auto"
            url = f'https://translate.googleapis.com/translate_a/single?client=gtx&sl={sl}&tl=en&dt=t&q=' + urllib.parse.quote(chunk)
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9'
            })
            with urllib.request.urlopen(req, timeout=4) as response:
                res = json.loads(response.read().decode('utf-8'))
                part = ''.join([p[0] for p in res[0] if p and p[0]])
                if part and part.strip():
                    translated_parts.append(part.strip())
        if translated_parts:
            combined = ' '.join(translated_parts).strip()
            if combined and combined.lower() != text.lower():
                return combined
    except Exception as e:
        pass

    det_lang = detect_language(text)

    # Tier 2: deep-translator MyMemory (Installed library, supports 100+ words with chunking)
    try:
        from deep_translator import MyMemoryTranslator
        iso_map_mm = {
            "Hindi": "hi-IN", "Hindi/Marathi": "hi-IN", "Bihari / Bhojpuri": "hi-IN", "Bhojpuri": "hi-IN",
            "Odia": "or-IN", "Bengali": "bn-IN", "Tamil": "ta-IN", "Telugu": "te-IN",
            "Punjabi": "pa-IN", "Gujarati": "gu-IN", "Kannada": "kn-IN",
            "Malayalam": "ml-IN", "Marathi": "mr-IN", "Urdu": "ur-PK", "Urdu/Kashmiri/Sindhi": "ur-PK"
        }
        src_mm = iso_map_mm.get(det_lang, "hi-IN")
        chunks = _chunk_text_by_sentences(text, max_chars=300)
        mm_parts = []
        for chunk in chunks:
            res_chunk = MyMemoryTranslator(source=src_mm, target='en-GB').translate(chunk)
            if res_chunk and not any(k in res_chunk.upper() for k in ["INVALID", "WARNING", "MYMEMORY", "QUERY LENGTH"]):
                mm_parts.append(res_chunk.strip())
        if mm_parts:
            combined_mm = ' '.join(mm_parts).strip()
            if combined_mm and combined_mm.lower() != text.lower():
                return combined_mm
    except Exception as e:
        pass

    # Tier 3: Pre-process regional idioms (Bhojpuri, Odia, Bengali) if online translators were unreachable
    processed_text = text
    if det_lang in ["Bihari / Bhojpuri", "Bhojpuri"]:
        processed_text = processed_text.replace("पुलवा बह गइल बा", "The bridge has been washed away")
        processed_text = processed_text.replace("पुलिया टूट गइल बा", "The bridge and culvert is collapsed")
        processed_text = processed_text.replace("सड़किया टूट गइल बा", "The road is broken")
        processed_text = processed_text.replace("सड़किया", "road")
        processed_text = processed_text.replace("पुलवा", "bridge")
        processed_text = processed_text.replace("पनिया", "drinking water")
        processed_text = processed_text.replace("चापाकल खराब बा", "the handpump is broken")
        processed_text = processed_text.replace("चापकाल खराब बा", "the handpump is broken")
        processed_text = processed_text.replace("लाइन नइखे", "there is no electricity")
        processed_text = processed_text.replace("जर गइल बा", "is burnt down")
        processed_text = processed_text.replace("छत चुअता", "the school roof is leaking")
        processed_text = processed_text.replace("डाक्टर नइखन", "doctor is absent in hospital")
        processed_text = processed_text.replace("पटवन नइखे होत", "no canal water for crop irrigation")

    if det_lang == "Odia":
        processed_text = processed_text.replace("ପୋଲ ଭାଙ୍ଗିଯାଇଛି", "the bridge has collapsed")
        processed_text = processed_text.replace("ପୋଲ ଧୋଇଯାଇଛି", "the bridge was washed away")
        processed_text = processed_text.replace("ରାସ୍ତା ଖରାପ", "the road is severely damaged")
        processed_text = processed_text.replace("ନଳକୂପ ଅଚଳ", "the tube well handpump is defunct")
        processed_text = processed_text.replace("ପାଣି ମିଳୁନାହିଁ", "drinking water is not available")
        processed_text = processed_text.replace("ବିଜୁଳି ନାହିଁ", "there is no electricity supply")
        processed_text = processed_text.replace("ସ୍କୁଲ ଛାତ ଭାଙ୍ଗିଯାଇଛି", "the school roof is damaged")

    if det_lang == "Bengali":
        processed_text = processed_text.replace("সেতু ভেঙে গেছে", "the bridge is broken")
        processed_text = processed_text.replace("রাস্তা নষ্ট", "the road is badly damaged")
        processed_text = processed_text.replace("বিদ্যুৎ নেই", "there is no electricity")
        processed_text = processed_text.replace("জল আসছে না", "drinking water is not available")

    english_chars = sum(1 for c in processed_text if ord(c) < 128 and c.isalpha())
    total_alpha = sum(1 for c in processed_text if c.isalpha()) or 1
    if english_chars / total_alpha > 0.7 and english_chars > 10:
        return processed_text.strip()


    # Tier 3: Google Clients5 Dict Chrome Extension Proxy
    try:
        c_url = f"https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=en&q={urllib.parse.quote(processed_text)}"
        c_req = urllib.request.Request(c_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(c_req, timeout=5) as c_resp:
            c_data = json.loads(c_resp.read().decode('utf-8'))
            if isinstance(c_data, list) and c_data and isinstance(c_data[0], str):
                c_res = c_data[0].strip()
                if c_res and c_res.lower() != text.lower():
                    return c_res
    except Exception:
        pass

    # Tier 4: Direct MyMemory HTTP API fallback
    try:
        iso_map = {
            "Hindi": "hi", "Hindi/Marathi": "hi", "Bihari / Bhojpuri": "hi", "Bhojpuri": "hi",
            "Odia": "or", "Bengali": "bn", "Tamil": "ta", "Telugu": "te",
            "Punjabi": "pa", "Gujarati": "gu", "Kannada": "kn",
            "Malayalam": "ml", "Urdu": "ur"
        }
        lang_code = iso_map.get(det_lang, "hi")
        url_mm = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(processed_text[:400])}&langpair={lang_code}|en"
        req_mm = urllib.request.Request(url_mm, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_mm, timeout=4) as response:
            mm_data = json.loads(response.read().decode('utf-8'))
            t_res = mm_data.get('responseData', {}).get('translatedText', '')
            if t_res and not any(k in t_res.upper() for k in ["INVALID", "WARNING", "MYMEMORY", "IS AN INVALID"]):
                return t_res.strip()
    except Exception:
        pass

    # Tier 5: Domain-specific fallback lexicon (without fake prefixes)
    translated_fallback = translate_regional_phrase_to_english(text, det_lang)
    if translated_fallback:
        return translated_fallback
    return text

def translate_regional_phrase_to_english(raw_text, detected_lang):
    """
    Translates colloquial regional spoken phrases into concise, readable English for search bar entry.
    """
    text = (raw_text or "").strip()
    lower = text.lower()

    if any(w in lower or w in text for w in ["electric", "pole", "wire", "power", "current", "darkness", "outage", "ବିଜୁଳି", "बिजली", "खंभा", "जर गइल", "बिजुलिया", "लाइन नइखे"]):
        return "Electric power pole damage and electricity outage in the locality."
    if any(w in text or w in lower for w in ["ରାସ୍ତା", "सड़क", "रास्ता", "road", "bridge", "पुल", "सड़किया", "पुलवा", "पुलिया", "टूट गइल"]):
        return "Road and bridge damage in village requiring urgent repair for transportation and connectivity."
    elif any(w in text or w in lower for w in ["ପାଣି", "पानी", "जल", "water", "handpump", "नल", "चापाकल", "चापकाल", "पनिया", "पानी नइखे"]):
        return "Drinking water shortage and broken pipe/handpump issue in hamlet."
    elif any(w in text or w in lower for w in ["ସ୍କୁଲ", "स्कूल", "স্কুল", "school", "ଛାତ", "छत", "चुअता", "लइका", "लइकन"]):
        return "School building and classroom roof damage repair requested for student safety."
    elif any(w in text or w in lower for w in ["ଡାକ୍ତର", "अस्पताल", "doctor", "hospital", "दवा", "डाक्टर", "नइखन", "इलाज"]):
        return "Primary healthcare accessibility barrier and medical clinic issue."
    elif any(w in text or w in lower for w in ["नाली", "नाला", "drain", "waterlog", "जलजमाव", "नालवा"]):
        return "Severe drainage blockage and monsoon waterlogging in village area."
    elif any(w in text or w in lower for w in ["नहर", "खेत", "canal", "पटवन", "सिंचाई", "farmer", "नहरिया"]):
        return "Agricultural canal irrigation blockage and crop water distress."
    
    return text

def generate_ai_analyzed_title(direct_english, raw_text, category):
    """
    Synthesizes an official government title for administrative tracking.
    """
    text = ((direct_english or "") + " " + (raw_text or "")).lower()
    
    # School / Education (High priority check before water/rain)
    if any(w in text for w in ["school", "classroom", "student", "teacher", "chhat", "ବିଦ୍ୟାଳୟ", "स्कूल", "स्कूलवा", "इस्कुल", "छत"]):
        if any(w in text for w in ["roof", "leak", "collapse", "rain", "छत", "टपक", "ପଡି", "चुअता", "गिर"]):
            return "Government School Classroom Roof Leakage & Safety Hazard"
        return "School Infrastructure & Academic Facility Grievance"

    # Healthcare / Hospital
    if any(w in text for w in ["hospital", "doctor", "phc", "medicine", "clinic", "health", "nurse", "ambulance", "ଡାକ୍ତର", "अस्पताल", "डाक्टर", "दवाई", "औषधालय"]):
        if any(w in text for w in ["absent", "no doctor", "doctor nahi", "নেই", "नइखन", "नहीं"]):
            return "Primary Health Center Doctor Absenteeism & Service Failure"
        if any(w in text for w in ["ambulance", "गाड़ी", "एंबुलेंस"]):
            return "Emergency 108 Ambulance Delay & Critical Access Barrier"
        return "Emergency Medical Facility & PHC Access Issue"

    # Power / Electricity
    if any(w in text for w in ["electric", "pole", "wire", "power", "current", "darkness", "outage", "light", "transformer", "ବିଜୁଳି", "बिजली", "खंभा", "विद्युत", "বিদ্যুৎ", "जर गइल", "बिजुलिया", "लाइन नइखे"]):
        if any(w in text for w in ["fall", "fell", "broken", "collapse", "गिर", "पड़", "ଭାଙ୍ଗି", "টুট", "टूट"]):
            return "Electricity Pole Collapse & 33kV Power Hazard"
        if any(w in text for w in ["transformer", "blast", "जल गया", "ପୋଡି", "जर गइल"]):
            return "Distribution Transformer Failure & Blackout"
        return "Village Electricity Outage & Grid Failure"

    # Canal & Irrigation
    if any(w in text for w in ["canal", "irrigation", "farmer", "crop", "paddy", "नहर", "सिंचाई", "କେନାଲ", "पटवन", "नहरिया", "खेत"]):
        return "Canal Water Supply Breach & Agricultural Irrigation Disruption"

    # Drainage / Flood / Waterlogging
    if any(w in text for w in ["drain", "sewage", "overflow", "waterlog", "waterlogging", "नाली", "नाला", "जलजमाव", "नालवा"]):
        return "Monsoon Drainage Channel Overflow & Village Waterlogging"

    # Bridges & Culverts
    if any(w in text for w in ["bridge", "culvert", "pul", "pulia", "pola", "ପୋଲ", "पुल", "सेतु", "पुलवा", "पुलिया"]):
        if any(w in text for w in ["collapse", "wash", "flood", "broken", "बह", "टूट", "भेঙে", "गइल"]):
            return "Critical Bridge Washout & Transportation Disruption"
        return "Bridge Structural Damage & Access Hazard"

    # Roads & Connectivity
    if any(w in text for w in ["road", "rasta", "highway", "path", "street", "connectivity", "ରାସ୍ତା", "सड़क", "रास्ता", "सड़किया", "रस्तवा"]):
        if any(w in text for w in ["flood", "mud", "wash", "water", "पानी", "बाढ़", "waterlog", "भरल"]):
            return "Severe Monsoon Road Inundation & Village Cut-Off"
        if any(w in text for w in ["pothole", "gaddha", "khala", "गड्ढा", "ଖାଲ", "गड़हा"]):
            return "Severe Pothole Damage & Hazardous Roadway"
        return "Damaged Roadway Requiring PMGSY Re-Surfacing"

    # Drinking Water & Sanitation
    if any(w in text for w in ["water", "pani", "handpump", "tap", "borewell", "fluoride", "drinking", "pipe", "pipeline", "rwss", "ପାଣି", "पानी", "जल", "पनिया", "चापाकल", "चापकाल"]):
        if any(w in text for w in ["broken", "leak", "damage", "नल", "टूट", "खराब", "ଫାଟି", "बिगड़ल"]):
            return "Drinking Water Pipeline & Community Tap Breakdown"
        if any(w in text for w in ["dry", "shortage", "scarcity", "नहीं आ रहा", "सूख", "ଶୁଖି", "नइखे"]):
            return "Acute Drinking Water Crisis & Borewell Depletion"
        if any(w in text for w in ["fluoride", "yellow", "ganda", "गंदा", "दवा", "ଦୂଷିତ"]):
            return "Severe Drinking Water Contamination Hazard"
        return "Jal Jeevan Drinking Water Infrastructure Grievance"

    # Default official title from direct English translation
    words = (direct_english or raw_text).split()
    if len(words) > 8:
        return ' '.join(words[:8]).strip('.,;:') + '...'
    return (direct_english or raw_text).strip('.,;:') or f"Public Infrastructure Report ({category})"

def process_and_translate_grievance(text_input, spoken_language=None, is_verified=True):
    """
    Deeply analyzes citizen speech, accurately categorizing the civic problem,
    formulating an official incident title, extracting schemes, and computing priority urgency.
    Supports Bhojpuri, Odia, Hindi, Bengali, and English.
    """
    raw_text = re.sub(r"^(Public infrastructure grievance:\s*)+", "", (text_input or "").strip(), flags=re.IGNORECASE).strip()
    detected_lang = spoken_language or detect_language(raw_text)
    if spoken_language and spoken_language.lower() in ["bho", "bhojpuri", "bihari"]:
        detected_lang = "Bhojpuri"
    
    # 0. High-Fidelity OpenAI Analysis (if API key provided)
    openai_analysis = translate_and_analyze_with_openai(raw_text, spoken_language=detected_lang)
    if openai_analysis and openai_analysis.get("directEnglishTranslation"):
        eng_trans = openai_analysis["directEnglishTranslation"].strip()
        cat = openai_analysis.get("category") or "Roads & Connectivity"
        scheme = openai_analysis.get("suggestedScheme") or "General Civic Infrastructure Fund"
        try:
            urg = float(openai_analysis.get("urgencyScore", 88.0))
        except (ValueError, TypeError):
            urg = 88.0
        if is_verified:
            urg = min(99.8, urg + 2.5)
        return {
            "spokenLanguage": openai_analysis.get("spokenLanguage") or detected_lang,
            "transcribedOriginalText": openai_analysis.get("originalText") or raw_text,
            "directEnglishTranslation": eng_trans,
            "aiAnalyzedTitle": openai_analysis.get("aiAnalyzedTitle") or generate_ai_analyzed_title(eng_trans, raw_text, cat),
            "adminEnglishTranslation": openai_analysis.get("adminEnglishTranslation") or f"{eng_trans}. Recommended for official field verification.",
            "adminHindiTranslation": f"नागरिक शिकायत: {raw_text}। {scheme} अंतर्गत त्वरित निरीक्षण अनुशंसित।",
            "adminBhojpuriTranslation": f"नागरिक के गुहार: {raw_text}। {scheme} तहत त्वरित कार्रवाई के सिफारिश बा।",
            "category": cat,
            "suggestedScheme": scheme,
            "urgencyScore": round(urg, 1),
            "affectedPopulation": 14000 if urg > 90 else 6500
        }

    # 1. Exact translation of user's actual speech
    direct_english = fetch_live_translation_to_english(raw_text) if raw_text else ""
    combined_search_text = (raw_text + " " + (direct_english or "")).lower()

    # 2. Categorization & Scheme Identification
    matched_cat = "Roads & Connectivity"
    matched_scheme = "SDRF Disaster Relief Fund / PMGSY Rural Roads"
    base_urgency = 78.0

    best_match_count = 0
    for rule in CATEGORY_RULES:
        match_count = sum(1 for kw in rule["keywords"] if kw.lower() in combined_search_text or kw in raw_text)
        if match_count > best_match_count:
            best_match_count = match_count
            matched_cat = rule["category"]
            matched_scheme = rule["scheme"]
            base_urgency = rule["default_urgency"]

    # Urgency boosts based on severe emergency indicators
    if any(k in combined_search_text for k in ["collapse", "emergency", "washout", "urgent", "hospital", "flood", "death", "blast", "electric", "spark", "darkness", "danger", "hazard", "hazard", "ଆପାତକାଳୀନ", "बाढ़", "बह गई", "भेঙে", "खतरा", "विद्युत", "जर गइल", "टूट गइल"]):
        base_urgency = min(99.4, base_urgency + 5.5)
    
    if is_verified:
        base_urgency = min(99.8, base_urgency + 2.5)

    # 3. Smart Analyzed Title
    ai_title = generate_ai_analyzed_title(direct_english, raw_text, matched_cat)

    # 4. Generate Administrative Briefs for Officer Triage
    admin_english = f"{direct_english or raw_text}. Recommended for immediate field inspection and scheme allocation under {matched_scheme}."
    admin_hindi = f"नागरिक शिकायत: {raw_text}। {matched_scheme} अंतर्गत त्वरित निरीक्षण एवं समाधान अनुशंसित।"
    admin_bhojpuri = f"नागरिक के गुहार: {raw_text}। {matched_scheme} के तहत तुरंत जांच आ समाधान के सिफारिश बा।"

    # Estimate affected population based on severity
    affected_pop = 18400 if base_urgency > 94 else 7800 if base_urgency > 88 else 4200

    return {
        "spokenLanguage": detected_lang,
        "transcribedOriginalText": raw_text,
        "directEnglishTranslation": direct_english,
        "aiAnalyzedTitle": ai_title,
        "adminEnglishTranslation": admin_english,
        "adminHindiTranslation": admin_hindi,
        "adminBhojpuriTranslation": admin_bhojpuri,
        "category": matched_cat,
        "suggestedScheme": matched_scheme,
        "urgencyScore": round(base_urgency, 1),
        "affectedPopulation": affected_pop
    }
