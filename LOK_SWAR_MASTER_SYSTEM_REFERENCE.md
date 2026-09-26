# Lok Swar — Complete Master Technical & Architectural Reference Manual

> **Prepared for Hackathon Evaluation, Technical Jury & Defense**  
> **Repository:** [https://github.com/rishavroy959-svg/LOK-SWAR](https://github.com/rishavroy959-svg/LOK-SWAR)  
> **Interactive Document:** [LOK_SWAR_MASTER_SYSTEM_REFERENCE.html](file:///c:/Hackathon/ARSHRIVA/LOK_SWAR_MASTER_SYSTEM_REFERENCE.html)

---

## 1. Executive Summary & The Problem Solved

**Lok Swar** ("The Voice of the People") is a next-generation civic grievance redresal, participatory democracy, and public infrastructure audit platform engineered specifically for **rural and semi-urban India**.

### The Core Problem
Over 280 million rural citizens in India face severe barriers when dealing with digital government portals (CPGRAMS, state e-governance portals, municipality forms):
1. **Illiteracy & Digital Insecurity**: Inability to read complex forms or type in English/formal Hindi.
2. **Dialect Diversity**: Citizens speak colloquial dialects (Bhojpuri, Odia, Bengali, Magahi, Maithili) that standard government portals do not understand.
3. **Ghost Works & Corruption**: Public contractors often claim budget expenditures for roads, borewells, and school roofs that were never actually built or repaired.
4. **The Feature Phone Divide**: Millions of poor rural citizens possess only ₹800 basic keypad phones with zero internet.

### The Lok Swar Solution
- **Zero-Literacy Voice-First UX**: Tap anywhere on the screen to receive immediate spoken guidance in the local tongue.
- **Multimodal Dialect AI**: Speaks and understands Bhojpuri, Odia, Bengali, Hindi, and English with auto-normalization.
- **Auto-Synced Geolocation**: No manual GPS buttons; automatic satellite coordinates with location-driven UI adaptation.
- **Multi-Sensor Data Fusion**: Independent validation comparing citizen claims against satellite imagery, drone recon, and weather telemetry to verify ground truth before allocating state funds.
- **Toll-Free Keypad IVR**: Dial a toll-free number from any basic feature phone to record voice grievances and receive SMS receipts.
- **Mathematical Budget Optimization**: Solves the 0/1 Knapsack resource allocation problem to maximize human impact and risk mitigation under constrained public treasury funds.

---

## 2. Complete Breakdown of Every Feature

### A. Citizen Experience (`citizen.html`)
1. **Every-Click Spoken Orientation (Zero-Literacy Engine)**:
   - Built for completely illiterate citizens.
   - The moment the citizen taps or clicks anywhere on the screen (background, empty space, cards, buttons), the Web Audio Speech engine speaks clear contextual orientation.
2. **Automatic Location & Telemetry Synchronization**:
   - Zero manual "Refresh GPS" buttons required.
   - On load, queries browser satellite GPS (high-accuracy mode).
   - Falls back gracefully to server reverse-geocoded IP location if GPS is unavailable.
   - Continuously monitors movement in the background using `navigator.geolocation.watchPosition` (>500m movement triggers instant resync).
3. **Location-Driven UI Language Adaptation**:
   - Dynamic boundary detector maps coordinates and state/district names directly to regional languages:
     - **Bihar / Purvanchal** $\rightarrow$ **Bhojpuri (`bho`)**
     - **Odisha** $\rightarrow$ **Odia (`or`)**
     - **West Bengal** $\rightarrow$ **Bengali (`bn`)**
     - **North India** $\rightarrow$ **Hindi (`hi`)**
     - **Other** $\rightarrow$ **English (`en`)**
   - Automatically re-renders all UI labels, cards, placeholders, and voice guidance into the detected regional tongue.
4. **Live Search Bar Auto-Translation**:
   - As a citizen types or speaks in their regional language, a dual-layer NMT translation engine converts regional colloquialisms into concise Administrative English in real-time inside the search bar.
5. **Multimodal Grievance Reporting**:
   - Audio: In-browser Web Audio recorder capturing live voice notes.
   - Camera/Photo: Camera file-picker capturing real-world visual evidence.
   - Coordinates: Satellite latitude, longitude, and accuracy radius.
   - Text: Optional manual text typing.
6. **Democratic Civic Upvoting (Crowd Endorsements)**:
   - Nearby citizens can browse active issues on a map and hit "Endorse / Upvote", preventing duplicate tickets and proving community consensus.
7. **DigiLocker & Aadhaar Profile Integration**:
   - Citizen identity verification with 12-digit Aadhaar simulation, automatic masking (`•••• •••• 9012`), and irreversible SHA-256 mobile hashing for privacy.

---

### B. Executive & Administration Dashboard (`admin.html`)
1. **GIS Spatial Heatmap & Hotspot Clustering**:
   - Interactive Leaflet.js map with CartoDB tiles showing localized infrastructure failures and risk densities.
2. **Autonomous Drone (UAV) Reconnaissance Center**:
   - Dispatches simulated autonomous drone flights to survey high-urgency disaster zones (collapsed bridges, power line hazard).
   - Displays live flight telemetry, speed, battery, and geotagged 4K video feeds.
3. **Multi-Sensor Data Fusion Engine**:
   - Cross-references citizen grievance reports against independent satellite imagery, IMD rain radar, and drone footage to calculate a **Fusion Confidence Score (0-100%)**.
4. **Algorithmic Treasury Budget Allocation**:
   - Directly matches verified grievances to official government funding schemes (*PMGSY, Jal Jeevan Mission, SDRF, DDUGJY, 5T High School Fund*).
5. **Public Works Contractor Adjudication**:
   - Audit trail of maintenance SLAs, dispute resolutions, and breach penalty tracking against failing contractors.

---

### C. Toll-Free Keypad IVR Telephony (`ivr/`)
1. **Interactive Voice Response for Basic Keypad Phones**:
   - FastAPI server integrated with Twilio Voice API.
   - Accessible from any ₹800 non-smartphone with zero internet.
2. **DTMF Menu Selection**:
   - Press 1 for Odia, Press 2 for Hindi, Press 3 for Bhojpuri, Press 4 for Bengali.
3. **Automated Voice Recording & SMS Receipt**:
   - Citizen speaks after the beep; the voice file is saved, transcribed via speech recognition, assigned a unique Ticket ID, and an SMS receipt is sent to their keypad phone.

---

## 3. Artificial Intelligence, NLP & Audio Models

| AI Component | Underlying Technology | Purpose | Fallback Layer |
|---|---|---|---|
| **Speech-to-Text (ASR)** | Web Speech API (`webkitSpeechRecognition`) & Google Speech Recognition | Transcribes raw speech in Odia, Bhojpuri, Hindi, Bengali, English | Server Python `speech_recognition` module |
| **Colloquial Dialect Normalizer** | Tokenized Regex & Grammatical Phrase Transducer | Normalizes regional idioms (e.g. *पुलवा बह गइल बा*, *छत चुअता*) | Exact keyword mapping table |
| **Neural Machine Translation (NMT)** | Google GTX NMT + MyMemory Multi-Lingual API | Translates regional speech into polished Administrative English | Local bilingual infrastructure phrasebook |
| **NLP Auto-Categorization** | Multilingual Keyword Vectorizer + Semantic Matcher | Classifies grievance into 1 of 7 Civic Categories | Default to "Roads & Connectivity" |
| **Urgency Risk Scoring** | Dynamic Multi-Factor Heuristic with Hazard Boosts | Computes priority score (0.0 to 100.0) based on severity keywords | Category default urgency (PHC: 95, Roads: 92.5) |
| **Government Scheme Matcher** | Deterministic Knowledge Graph | Automatically pairs issues with state and central funding pools | District Collector Discretionary Pool |
| **Text-to-Speech (TTS)** | Web Speech Synthesis API (`speechSynthesis`) | Speaks spoken orientation to illiterate citizens | Visual audio equalizer modal with text |
| **Multi-Sensor Data Fusion** | Multi-Source Correlation Matrix | Detects false reports by correlating satellite, weather, and drone feeds | Peer citizen upvote quorum |
| **Knapsack Resource Optimizer** | 0/1 Integer Linear Programming Solver | Maximizes human lives impacted under constrained budget | Greedy heuristic urgency ranking |

---

## 4. Complete Backend REST API Architecture (49 Endpoints)

### A. Geolocation & Spatial Telemetry
1. `GET /api/geo/location`: Server-side IP telemetry fallback.
2. `GET /api/geo/reverse`: Reverse geocodes latitude/longitude into Ward, GP, District, and State.
3. `GET /api/grievances/nearby`: Haversine distance spatial query returning grievances within a defined radius.
4. `GET /api/clusters`: Returns geographic spatial density clusters for map overlay.
5. `GET /api/hotspots`: Returns recurring infrastructure failure hot zones.

### B. Authentication & Citizen Identity
6. `POST /api/auth/citizen/register`: Registers a new citizen.
7. `POST /api/auth/citizen/login`: Authenticates citizen and issues session cookie.
8. `POST /api/auth/citizen/send-otp`: Sends mobile SMS verification OTP via SMS gateway.
9. `POST /api/auth/citizen/verify-otp`: Validates 6-digit OTP code.
10. `POST /api/auth/citizen/send-email-otp`: Dispatches verification OTP to email.
11. `POST /api/auth/citizen/verify-email-otp`: Validates email OTP.
12. `POST /api/auth/citizen/reset-password`: Resets citizen password.
13. `POST /api/auth/citizen/upload-avatar`: Uploads and stores profile avatar.
14. `POST /api/auth/citizen/profile`: Updates citizen name, GP, and Aadhaar hash.
15. `POST /api/auth/citizen/digilocker-fetch`: Fetches verified credentials simulation from DigiLocker.
16. `POST /api/auth/admin/login`: Officer/Collector authentication.
17. `POST /api/auth/logout`: Clears session tokens.
18. `GET /api/auth/me`: Current active session inspector.

### C. Grievances & Multimodal Ingestion
19. `GET /api/grievances/list`: Returns all grievances with filtering (status, category, urgency).
20. `GET /api/grievances/{id}`: Detailed case dossier, evidence photos, and resolution logs.
21. `POST /api/grievances/submit`: Primary multimodal endpoint (audio, photo, GPS, text, Aadhaar).
22. `POST /api/grievances/endorse`: Records citizen democratic upvote / civic endorsement.
23. `POST /api/grievances/ai-categorize`: Real-time NLP category, urgency, and scheme evaluator.
24. `POST /api/grievances/{id}/status`: Updates ticket status (Pending, In Progress, Resolved).
25. `POST /api/grievances/clear-all`: Demo/test reset of grievance store.

### D. AI & Audio Processing
26. `GET /api/tts`: Streaming text-to-speech audio synthesis.
27. `POST /api/translate`: Multi-lingual NMT translation to English.
28. `POST /api/speech-to-text`: Server-side SpeechRecognition on raw audio bytes.
29. `POST /api/voice-notes/upload`: Uploads raw audio files.
30. `GET /api/voice-notes/my-notes/{mobile}`: Citizen's voice note archive.
31. `GET /api/voice-notes/admin/all`: Administrative voice note triage inbox.
32. `POST /api/voice-notes/admin/{id}/status`: Updates voice note review status.

### E. Executive Governance, Drones & Optimization
33. `GET /api/admin/budget/overview`: Real-time treasury ledger and scheme expenditure breakdown.
34. `POST /api/admin/budget/allocate`: Authorizes expenditure for scheme tenders.
35. `GET /api/drone/missions`: Active, scheduled, and completed UAV flights.
36. `POST /api/admin/drone/dispatch`: Dispatches autonomous UAV drone mission to GPS coordinates.
37. `GET /api/data-fusion/cases`: Multi-sensor fusion case list with verification scores.
38. `POST /api/data-fusion/analyze`: Computes cross-verification across satellite, weather, and drone feeds.
39. `POST /api/optimizer/solve`: Solves Knapsack optimization algorithm for budget allocation.
40. `POST /api/adjudicate`: Executes contractor dispute penalty or resolution verdict.
41. `GET /api/constituency`: Administrative boundary hierarchy (GPs, Wards, Blocks).
42. `GET /api/projects`: Public infrastructure projects and contractor tenders.
43. `GET /api/datasets`: Open Government Data integration indicators.
44. `POST /api/webhook/messaging`: Inbound Twilio / WhatsApp messaging webhook.
45-49. Media file storage endpoints (`/uploads/audio/*`, `/uploads/photos/*`).

---

## 5. Software Stack, Libraries & Tools Used

### Frontend Architecture
- **React 18 & Babel Standalone**: Fast, lightweight single-page application rendering with zero build-step overhead.
- **Vanilla CSS3 & Tailwind CSS**: Curated design tokens, rich dark mode, glassmorphic cards, and micro-animations.
- **Leaflet.js 1.9.4**: Open-source GIS interactive mapping engine with CartoDB Positron and Dark Matter tiles.
- **Web Speech API**: In-browser hardware access to `SpeechRecognition` and `SpeechSynthesis`.
- **Web Audio API (`AudioContext`)**: Custom synthesized chime sound effects (tap, success, alert, recording pulse).

### Backend & AI Infrastructure
- **Python 3.10+ (FastAPI, Uvicorn, HTTP Server)**: High-concurrency asynchronous I/O and REST routing.
- **Node.js & Express (`backend/server.js`)**: Parallel modular API backend implementation.
- **MongoDB Atlas & Motor**: Cloud-scale async document database.
- **Local JSON Datastore (`db/local_store.json`)**: Zero-dependency ACID atomic local file persistence for offline resiliency.
- **SpeechRecognition & Google Translation Engines**: Automated Speech-to-Text and multi-lingual translation pipelines.

### Telephony & Hardware
- **Twilio Voice API & TwiML**: Keypad feature phone IVR call flow, DTMF tone detection, and audio recording.
- **Fast2SMS / Twilio Messaging**: Automated SMS OTP delivery and ticket tracking dispatch.
- **Android Native Wrapper (`android/`)**: Hardware-accelerated WebView shell granting direct access to GPS, camera, and microphone.

---

## 6. Hackathon Cross-Question Defense (Judge Q&A Cheat Sheet)

### Q1: "How do you prevent malicious citizens from spamming fake grievances?"
> **Answer**: Lok Swar uses a **Three-Layer Anti-Fraud Defense**:  
> 1. **Multi-Sensor Data Fusion**: We cross-reference reports against satellite reflectance, IMD precipitation feeds, and autonomous drone imagery.  
> 2. **Civic Quorum Verification**: Issues require local peer endorsements (+1 Upvotes) from citizens within 2km before funds are released.  
> 3. **Spatial Deduplication**: Any report filed within 500 meters of an existing active ticket is automatically converted into an upvote rather than creating a duplicate ticket.

### Q2: "What if there is no internet in remote rural hamlets?"
> **Answer**: Lok Swar operates on a **Tri-Tier Connectivity Fallback**:  
> 1. **Full Internet**: Rich citizen portal with interactive map, camera upload, and voice assistant.  
> 2. **Intermittent Internet**: LocalStorage offline caching queue that stores submissions locally and syncs automatically when 2G/3G connectivity is re-established.  
> 3. **Zero Internet / Keypad Phones**: Our toll-free IVR telephony server allows citizens with ₹800 feature phones to dial in, select their dialect via DTMF keypad, speak their issue, and receive an SMS tracking ticket.

### Q3: "How do illiterate citizens navigate the application?"
> **Answer**: Through our **Every-Click Spoken Orientation Engine**. Every button, category card, banner, and input has an audio script in `js/citizen/voice_engine.js`. When an illiterate citizen taps anywhere on the screen, the system immediately speaks conversational instructions in their native dialect (Bhojpuri, Odia, Bengali, Hindi), eliminating the requirement to read or type.

### Q4: "How does the system ensure mathematical fairness in budget allocation?"
> **Answer**: Rather than relying on political discretion, the **Lok Swar Knapsack Optimizer** solves a 0/1 Integer Linear Programming problem:  
> $$\text{Maximize } Z = \sum (Urgency_i \times Population_i \times RiskMultiplier_i \times X_i) \quad \text{subject to} \quad \sum (Cost_i \times X_i) \le Budget$$  
> This guarantees that public funds are scientifically allocated to projects that protect the largest population and avert the highest casualty risks first.
