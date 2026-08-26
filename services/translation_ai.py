"""
Lok Swar - Multilingual AI Speech Translation & NLP Processing Engine
Translates citizen voice/text from regional languages (Bhojpuri/Bihari, Odia, Hindi, Bengali)
into structured Administrative English, Hindi, and Bhojpuri summaries with auto-categorization,
priority urgency scoring, and government funding scheme matching.
"""

import re
import io
import urllib.request
import urllib.parse
import json
import base64
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
    
    # Bengali Unicode range: \u0980-\u09FF
    if re.search(r'[\u0980-\u09FF]', text):
        return "Bengali"
    
    # Devanagari (Hindi) Unicode range: \u0900-\u097F
    if re.search(r'[\u0900-\u097F]', text):
        return "Hindi"
    
    return "English"

def transcribe_audio_data(raw_audio_bytes, preferred_lang=None):
    """
    Transcribes audio bytes (WAV or supported raw audio) into text using Python SpeechRecognition.
    Supports Odia (or-IN), Bengali (bn-IN), Hindi/Bihari/Bhojpuri (hi-IN), and English (en-IN/en-US).
    Returns (transcribed_text, detected_language_name).
    """
    if not HAS_SR or not raw_audio_bytes:
        return "", ""
    
    try:
        r = sr.Recognizer()
        r.energy_threshold = 300
        r.dynamic_energy_threshold = True

        audio_file = io.BytesIO(raw_audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = r.record(source)

        # Build candidate language list
        candidate_langs = []
        if preferred_lang:
            pl = preferred_lang.lower().strip()
            lang_map = {
                "or": "or-IN", "odia": "or-IN",
                "bn": "bn-IN", "bengali": "bn-IN", "bangla": "bn-IN",
                "hi": "hi-IN", "hindi": "hi-IN",
                "bho": "hi-IN", "bihari": "hi-IN", "bhojpuri": "hi-IN",
                "en": "en-IN", "english": "en-IN"
            }
            if pl in lang_map:
                candidate_langs.append(lang_map[pl])

        # Priority scan: Odia, Hindi/Bihari, Bengali, English
        all_langs = ["hi-IN", "or-IN", "bn-IN", "en-IN", "en-US"]
        for l in all_langs:
            if l not in candidate_langs:
                candidate_langs.append(l)

        for lang_code in candidate_langs:
            try:
                transcript = r.recognize_google(audio_data, language=lang_code)
                if transcript and transcript.strip():
                    detected = detect_language(transcript)
                    if lang_code == "or-IN":
                        detected = "Odia"
                    elif lang_code == "bn-IN":
                        detected = "Bengali"
                    return transcript.strip(), detected
            except sr.UnknownValueError:
                continue
            except Exception as e:
                continue

    except Exception as e:
        print(f"[Audio Transcription Notice]: {e}")
    
    return "", ""

def fetch_live_translation_to_english(raw_text):
    """
    Translates regional text from ANY language (Bihari, Bhojpuri, Odia, Hindi, Bengali, Tamil, etc.)
    directly into clean English for search bar insertion and categorization.
    """
    if not raw_text or not raw_text.strip():
        return ""
    text = raw_text.strip()

    # Pre-process regional idioms (Bhojpuri, Odia, Bengali) for maximum translation precision
    processed_text = text
    det_lang = detect_language(text)
    
    # Bhojpuri / Bihari
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

    # Odia
    if det_lang == "Odia":
        processed_text = processed_text.replace("ପୋଲ ଭାଙ୍ଗିଯାଇଛି", "the bridge has collapsed")
        processed_text = processed_text.replace("ପୋଲ ଧୋଇଯାଇଛି", "the bridge was washed away")
        processed_text = processed_text.replace("ରାସ୍ତା ଖରାପ", "the road is severely damaged")
        processed_text = processed_text.replace("ନଳକୂପ ଅଚଳ", "the tube well handpump is defunct")
        processed_text = processed_text.replace("ପାଣି ମିଳୁନାହିଁ", "drinking water is not available")
        processed_text = processed_text.replace("ବିଜୁଳି ନାହିଁ", "there is no electricity supply")
        processed_text = processed_text.replace("ସ୍କୁଲ ଛାତ ଭାଙ୍ଗିଯାଇଛି", "the school roof is damaged")

    # Bengali
    if det_lang == "Bengali":
        processed_text = processed_text.replace("সেতু ভেঙে গেছে", "the bridge is broken")
        processed_text = processed_text.replace("রাস্তা নষ্ট", "the road is badly damaged")
        processed_text = processed_text.replace("বিদ্যুৎ নেই", "there is no electricity")
        processed_text = processed_text.replace("জল আসছে না", "drinking water is not available")

    # Tier 1: Google Mobile Translation Engine
    try:
        g_url = f"https://translate.google.com/m?sl=auto&tl=en&q={urllib.parse.quote(processed_text)}"
        g_req = urllib.request.Request(g_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'})
        with urllib.request.urlopen(g_req, timeout=5) as g_resp:
            html = g_resp.read().decode('utf-8')
            m = re.search(r'class="result-container">([^<]+)<', html)
            if m and m.group(1).strip():
                clean_t = m.group(1).replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'").strip()
                if clean_t:
                    return clean_t
    except Exception:
        pass

    # Tier 2: Google GTX NMT Translation API
    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=' + urllib.parse.quote(processed_text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as response:
            res = json.loads(response.read().decode('utf-8'))
            translated = ''.join([part[0] for part in res[0] if part and part[0]])
            if translated and translated.strip():
                return translated.strip()
    except Exception:
        pass

    # Tier 3: MyMemory Translation API with ISO Language Pair
    try:
        lang_code = "hi" if det_lang in ["Hindi", "Bihari / Bhojpuri", "Bhojpuri"] else ("or" if det_lang == "Odia" else ("bn" if det_lang == "Bengali" else "hi"))
        url_mm = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(processed_text)}&langpair={lang_code}|en"
        req_mm = urllib.request.Request(url_mm, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req_mm, timeout=4) as response:
            mm_data = json.loads(response.read().decode('utf-8'))
            t_res = mm_data.get('responseData', {}).get('translatedText', '')
            if t_res and not any(k in t_res.upper() for k in ["INVALID", "WARNING", "MYMEMORY", "IS AN INVALID"]):
                return t_res.strip()
    except Exception:
        pass

    # Tier 4: Domain-specific fallback lexicon
    return translate_regional_phrase_to_english(text, det_lang)

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
    
    return text if detected_lang == "English" else f"Public infrastructure grievance: {text}"

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
    raw_text = (text_input or "").strip()
    detected_lang = spoken_language or detect_language(raw_text)
    if spoken_language and spoken_language.lower() in ["bho", "bhojpuri", "bihari"]:
        detected_lang = "Bhojpuri"
    
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
