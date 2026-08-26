import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Volume2,
  Mic,
  MicOff,
  Camera,
  X,
  Search,
  FileText,
  Building2,
  BarChart3,
  Globe,
  Wifi,
  WifiOff,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Info
} from 'lucide-react';

/**
 * People's Priorities (जन प्राथमिकताएं)
 * Official Civic Intelligence & Government Search Engine Interface
 * 
 * Aesthetic: Light Green & Porcelain Civic Theme (#1B4D3E, #2D6A4F, #F4F7F5, #D8E2DC)
 * Principles: Extreme Simplicity, Zero-Literacy Audio-First, 56px+ Touch Targets, Hidden Drawer Complexity.
 */

export default function CivicSearchHome({ onAdminPortalClick, onPublicBulletinsClick }) {
  // -------------------------------------------------------------
  // State Management
  // -------------------------------------------------------------
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [selectedLang, setSelectedLang] = useState('hi'); // 'hi' | 'or' | 'en' | 'bn' | 'bho'
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [voiceMeta, setVoiceMeta] = useState(null);
  const [isTranslatingVoice, setIsTranslatingVoice] = useState(false);

  // References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const pcmChunksRef = useRef([]);
  const scriptProcessorRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const typewriterIntervalRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);

  // Multilingual Strings
  const i18n = {
    hi: {
      brandTitle: "जन प्राथमिकताएं",
      brandSub: "People's Priorities • भारत सरकार / Odisha Civic Portal",
      placeholder: "बोलें, लिखें या अपनी समस्या रिकॉर्ड करें...",
      submitBtn: "🔍 रिपोर्ट जमा करें / SUBMIT REPORT",
      recordingPrompt: "🔴 आपकी आवाज़ रिकॉर्ड हो रही है... बोलें",
      readAloudText: "जन प्राथमिकताएं नागरिक सेवा में आपका स्वागत है। माइक बटन दबाकर अपनी समस्या बोलें, या कैमरा बटन से फोटो लगाएं, फिर हरा बटन दबाकर जमा करें।",
      bottomBanner: "🟢 आधिकारिक नागरिक पोर्टल | कम इंटरनेट मोड सक्रिय | ऑफ़लाइन सुरक्षित",
      drawerTitle: "नागरिक सेवाएं",
      menuStatus: "मेरी रिपोर्ट की स्थिति (Check Status)",
      menuSuggest: "विकास कार्य का सुझाव (Suggest Project)",
      menuBulletins: "सार्वजनिक रिपोर्ट (Public Bulletins)",
      menuOffline: "ऑफ़लाइन सूची (Offline Queue)",
      menuOfficer: "अधिकारी लॉगिन (Government Officer Portal)",
      photoAttached: "फोटो संलग्न है",
      successMsg: "आपकी प्राथमिकता रिपोर्ट सफलतापूर्वक दर्ज कर ली गई है!"
    },
    or: {
      brandTitle: "ଜନ ପ୍ରାଥମିକତା",
      brandSub: "People's Priorities • ଓଡ଼ିଶା ସରକାରୀ ନାଗରିକ ପୋର୍ଟାଲ୍",
      placeholder: "କୁହନ୍ତୁ, ଲେଖନ୍ତୁ କିମ୍ବା ସମସ୍ୟା ରେକର୍ଡ କରନ୍ତୁ...",
      submitBtn: "🔍 ରିପୋର୍ଟ ଦାଖଲ କରନ୍ତୁ / SUBMIT REPORT",
      recordingPrompt: "🔴 ଆପଣଙ୍କ ସ୍ୱର ରେକର୍ଡ ହେଉଛି... କୁହନ୍ତୁ",
      readAloudText: "ଜନ ପ୍ରାଥମିକତା ସେବାକୁ ସ୍ୱାଗତ। ମାଇକ୍ ବଟନ୍ ଦବାଇ ସମସ୍ୟା କୁହନ୍ତୁ କିମ୍ବା ଫଟୋ ଦେଇ ସବୁଜ ବଟନ୍ ଦବାନ୍ତୁ।",
      bottomBanner: "🟢 ସରକାରୀ ନାଗରିକ ପୋର୍ଟାଲ୍ | କମ୍ ଇଣ୍ଟରନେଟ୍ ମୋଡ୍ | ଅଫଲାଇନ୍ ସୁରକ୍ଷିତ",
      drawerTitle: "ନାଗରିକ ସେବା",
      menuStatus: "ମୋ ରିପୋର୍ଟର ସ୍ଥିତି (Check Status)",
      menuSuggest: "ବିକାଶ କାର୍ଯ୍ୟ ପ୍ରସ୍ତାବ (Suggest Project)",
      menuBulletins: "ସାର୍ବଜନୀନ ରିପୋର୍ଟ (Public Bulletins)",
      menuOffline: "ଅଫଲାଇନ୍ ତାଲିକା (Offline Queue)",
      menuOfficer: "ଅଧିକାରୀ ଲଗଇନ୍ (Government Officer Portal)",
      photoAttached: "ଫଟୋ ଯୋଡ଼ାଗଲା",
      successMsg: "ଆପଣଙ୍କ ରିପୋର୍ଟ ସଫଳତାର ସହ ଦାଖଲ ହୋଇଛି!"
    },
    en: {
      brandTitle: "People's Priorities",
      brandSub: "जन प्राथमिकताएं • Official Constituency Intelligence Engine",
      placeholder: "Speak, type, or record your problem here...",
      submitBtn: "🔍 SUBMIT REPORT / रिपोर्ट जमा करें",
      recordingPrompt: "🔴 Recording voice... Speak clearly now",
      readAloudText: "Welcome to People's Priorities civic engine. Tap the microphone button to speak your issue, or tap camera to attach a photo, then press the green submit button.",
      bottomBanner: "🟢 Official Civic Portal | Low-Bandwidth Mode Active | Submissions auto-save offline",
      drawerTitle: "Civic Menu",
      menuStatus: "Check Status of My Reports",
      menuSuggest: "Suggest New Infrastructure Project",
      menuBulletins: "Public Priority Bulletins",
      menuOffline: "Offline Storage & Sync Status",
      menuOfficer: "Government Officer Portal",
      photoAttached: "Photo Attached",
      successMsg: "Your priority report has been officially registered!"
    }
  };

  const t = i18n[selectedLang] || i18n.hi;

  // -------------------------------------------------------------
  // Offline & Online Network Listener
  // -------------------------------------------------------------
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // -------------------------------------------------------------
  // Silent Chime for Official Government Portal
  // -------------------------------------------------------------
  const playCivicChime = () => {
    // Popping sounds disabled for professional government portal
  };

  // -------------------------------------------------------------
  // Speech Synthesis Accessibility Readout
  // -------------------------------------------------------------
  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(t.readAloudText);
      utterance.rate = 0.88;
      if (selectedLang === 'hi') utterance.lang = 'hi-IN';
      else if (selectedLang === 'or') utterance.lang = 'or-IN';
      else utterance.lang = 'en-IN';
      window.speechSynthesis.speak(utterance);
      playCivicChime('tap');
    }
  };

  // -------------------------------------------------------------
  // Audio Recording & Waveform Visualizer with Auto-Translate to English
  // -------------------------------------------------------------
  // PCM 16-bit 16kHz WAV Audio Encoder
  const encodeWAV = (samples, sampleRate = 16000) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeStr = (v, offset, str) => {
      for (let i = 0; i < str.length; i++) v.setUint8(offset + i, str.charCodeAt(i));
    };
    writeStr(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeStr(view, 8, 'WAVE');
    writeStr(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([view], { type: 'audio/wav' });
  };

  const downsampleBuffer = (buffer, inRate, outRate = 16000) => {
    if (inRate === outRate) return buffer;
    const ratio = inRate / outRate;
    const newLen = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLen);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffset = Math.round((offsetResult + 1) * ratio);
      let accum = 0, count = 0;
      for (let i = offsetBuffer; i < nextOffset && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = count > 0 ? accum / count : 0;
      offsetResult++;
      offsetBuffer = nextOffset;
    }
    return result;
  };

  const speechRecRef = useRef(null);
  const rawTranscriptRef = useRef("");

  const translateTextToEnglishAndType = async (spokenText, wavBase64 = null) => {
    setIsTranslatingVoice(true);
    if (typewriterIntervalRef.current) {
      clearInterval(typewriterIntervalRef.current);
    }

    try {
      let origText = (spokenText || "").trim();
      let englishText = '';
      let detectedLanguage = 'Hindi';

      if (wavBase64 || origText) {
        try {
          const res = await fetch('/api/speech-to-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: wavBase64,
              transcript: origText,
              spokenLanguage: selectedLang
            })
          });
          const data = await res.json();
          if (data.success) {
            if (data.transcribedText) origText = data.transcribedText;
            if (data.directEnglishTranslation || data.translatedText) {
              englishText = data.directEnglishTranslation || data.translatedText;
            }
            if (data.spokenLanguage) detectedLanguage = data.spokenLanguage;
          }
        } catch(e) {}
      }

      if (!englishText && origText) {
        try {
          const res = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: origText, spokenLanguage: selectedLang })
          });
          const data = await res.json();
          if (data.success && (data.directEnglishTranslation || data.translatedText)) {
            englishText = data.directEnglishTranslation || data.translatedText;
            if (data.spokenLanguage) detectedLanguage = data.spokenLanguage;
          }
        } catch(e) {}
      }

      if (!englishText && origText) {
        try {
          const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(origText)}`;
          const gRes = await fetch(gUrl);
          const gData = await gRes.json();
          if (gData && gData[0]) {
            englishText = gData[0].map(p => p[0]).filter(Boolean).join('');
          }
        } catch(e) {}
      }

      const finalText = (englishText || origText).trim();
      if (!origText && !finalText) {
        setIsTranslatingVoice(false);
        return;
      }

      if (detectedLanguage === 'Hindi' || !detectedLanguage) {
        if (/[\u0B00-\u0B7F]/.test(origText)) detectedLanguage = "Odia (ଓଡ଼ିଆ)";
        else if (/[\u0980-\u09FF]/.test(origText)) detectedLanguage = "Bengali (বাংলা)";
        else if (/(\bबा\b|\bनइखे\b|\bगइल\b|\bपुलवा\b|\bसड़किया\b|\bपनिया\b|\bचापकाल\b|\bचापाकल\b)/.test(origText)) detectedLanguage = "Bihari / Bhojpuri (भोजपुरी)";
        else if (/[\u0900-\u097F]/.test(origText)) detectedLanguage = "Hindi (हिन्दी)";
        else detectedLanguage = "English";
      }

      setVoiceMeta({
        originalText: origText || finalText,
        detectedLang: detectedLanguage,
        englishText: finalText
      });

      setInputText('');
      let cur = 0;
      const stepSize = Math.max(1, Math.floor(finalText.length / 28));
      typewriterIntervalRef.current = setInterval(() => {
        cur += stepSize;
        if (cur >= finalText.length) {
          clearInterval(typewriterIntervalRef.current);
          setInputText(finalText);
          playCivicChime('tap');
        } else {
          setInputText(finalText.substring(0, cur));
        }
      }, 18);

    } catch(err) {
      if (spokenText) setInputText(spokenText);
    } finally {
      setIsTranslatingVoice(false);
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      playCivicChime('tap');
      if (speechRecRef.current) {
        try { speechRecRef.current.stop(); } catch(e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch(e) {}
      }
      if (scriptProcessorRef.current) {
        try { scriptProcessorRef.current.disconnect(); } catch(e) {}
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      let wavBase64String = null;
      try {
        if (pcmChunksRef.current && pcmChunksRef.current.length > 0) {
          const totalLen = pcmChunksRef.current.reduce((acc, c) => acc + c.length, 0);
          const merged = new Float32Array(totalLen);
          let offset = 0;
          for (const chunk of pcmChunksRef.current) {
            merged.set(chunk, offset);
            offset += chunk.length;
          }
          const inRate = audioContextRef.current ? audioContextRef.current.sampleRate : 44100;
          const downsampled = downsampleBuffer(merged, inRate, 16000);
          const wavBlob = encodeWAV(downsampled, 16000);

          const reader = new FileReader();
          reader.readAsDataURL(wavBlob);
          reader.onloadend = () => {
            wavBase64String = reader.result;
            const captured = rawTranscriptRef.current || "";
            translateTextToEnglishAndType(captured.trim(), wavBase64String);
          };
          return;
        }
      } catch(e) {}

      const captured = rawTranscriptRef.current || "";
      translateTextToEnglishAndType(captured.trim(), null);

    } else {
      audioChunksRef.current = [];
      pcmChunksRef.current = [];
      rawTranscriptRef.current = "";
      setVoiceMeta(null);
      playCivicChime('tap');

      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          speechRecRef.current = rec;
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = (selectedLang === 'or') ? 'or-IN' : (selectedLang === 'bn') ? 'bn-IN' : (selectedLang === 'en') ? 'en-IN' : 'hi-IN';

          rec.onresult = (event) => {
            let accumulated = '';
            for (let i = 0; i < event.results.length; ++i) {
              accumulated += event.results[i][0].transcript + ' ';
            }
            rawTranscriptRef.current = accumulated.trim();
          };
          rec.start();
        } catch(e) {}
      }

      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStreamRef.current = stream;

          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            audioContextRef.current = ctx;

            const source = ctx.createMediaStreamSource(stream);
            const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              pcmChunksRef.current.push(new Float32Array(input));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(ctx.destination);
          }

          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
          };
          recorder.start();
        }
      } catch (err) {
        console.warn('Microphone access fallback:', err);
      }
      setIsRecording(true);
      drawWaveform();
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(render);

      ctx.fillStyle = '#1B4D3E';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = '#74C69D';

      const sliceWidth = canvas.width / 36;
      let x = 0;

      for (let i = 0; i < 36; i++) {
        const v = Math.sin(phase + i * 0.28) * Math.cos(phase * 0.6 + i * 0.12);
        const y = canvas.height / 2 + v * (canvas.height / 2.7);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.stroke();
      phase += 0.18;
    };

    render();
  };

  // -------------------------------------------------------------
  // Camera Capture
  // -------------------------------------------------------------
  const handleCameraTrigger = () => {
    playCivicChime('tap');
    fileInputRef.current?.click();
  };

  const handlePhotoSelected = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
      playCivicChime('tap');
    }
  };

  // -------------------------------------------------------------
  // Form Submission
  // -------------------------------------------------------------
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText && !audioBlob && !photoPreview) {
      handleReadAloud();
      return;
    }

    playCivicChime('success');
    setSubmitSuccess(true);
    if (!isOnline) setPendingQueueCount((prev) => prev + 1);

    setTimeout(() => {
      setInputText('');
      setAudioBlob(null);
      setPhotoPreview(null);
      setSubmitSuccess(false);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between select-none relative font-sans antialiased">
      
      {/* -------------------------------------------------------------
          1. TOP OFFICIAL HEADER BAR
          ------------------------------------------------------------- */}
      <header className="w-full bg-slate-950/80 backdrop-blur-xl text-white border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">
        
        {/* Left: Navigation Menu Icon - 48px touch target */}
        <button
          onClick={() => {
            playCivicChime('tap');
            setIsDrawerOpen(true);
          }}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 active:scale-95 text-slate-300 hover:text-white transition-all focus:outline-none"
          aria-label="Open Navigation Drawer"
          title="Open Menu"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Center: Official Civic Title */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h1 className="text-base md:text-xl font-bold tracking-tight text-white font-sans">
              {t.brandTitle}
            </h1>
          </div>
          <span className="text-[10px] md:text-[11px] text-slate-400 font-medium tracking-wide">
            {t.brandSub}
          </span>
        </div>

        {/* Right Controls: Language Selector + Audio Guidance Icon */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative hidden sm:block">
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                playCivicChime('tap');
              }}
              className="bg-slate-900 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-2 border border-slate-700 outline-none cursor-pointer hover:border-slate-600"
              aria-label="Language Selector"
            >
              <option value="hi">हिन्दी (HI)</option>
              <option value="bho">भोजपुरी (BHO)</option>
              <option value="or">ଓଡ଼ିଆ (OR)</option>
              <option value="bn">বাংলা (BN)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>

          {/* Audio Guidance Button */}
          <button
            onClick={handleReadAloud}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 active:scale-95 text-blue-400 transition-all focus:outline-none"
            aria-label="Listen to Audio Guidance"
            title="Audio Guidance"
          >
            <Volume2 className="w-5 h-5 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          2. CENTRAL SEARCH ENGINE INTAKE CONTAINER
          ------------------------------------------------------------- */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 flex flex-col justify-center py-8">
        
        {/* Official Subheader */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 mb-3 shadow">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            National Citizen Grievance & Public Priority Engine
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Constituency Intelligence & Scheme Triage • AC-134 Sundargarh
          </p>
        </div>

        {/* Success Alert Banner */}
        {submitSuccess && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-white flex items-center gap-3 shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm text-emerald-200">{t.successMsg}</p>
              <p className="text-xs text-emerald-300/80">
                {isOnline ? 'Report registered in the District Planning Registry.' : 'Saved locally on device. Will synchronize when connected.'}
              </p>
            </div>
          </div>
        )}

        {/* Attached Photo Preview Thumbnail */}
        {photoPreview && (
          <div className="mb-4 relative inline-block self-center rounded-2xl overflow-hidden border border-slate-700 shadow-lg bg-slate-900">
            <img src={photoPreview} alt="Attached Evidence" className="w-48 h-32 object-cover" />
            <button
              onClick={() => {
                setPhotoPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-950/90 text-white hover:bg-red-600 transition-colors"
              aria-label="Remove Photo"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 text-[11px] text-center text-slate-300 py-1 font-semibold">
              {t.photoAttached}
            </div>
          </div>
        )}

        {/* Live Audio Waveform Box (Shown only when recording) */}
        {isRecording && (
          <div className="mb-4 bg-slate-950 rounded-2xl border border-rose-500/60 p-3 text-center shadow-xl">
            <p className="text-xs font-bold text-rose-400 mb-1.5 animate-pulse">
              {t.recordingPrompt}
            </p>
            <canvas ref={canvasRef} width="480" height="52" className="w-full h-12 rounded-xl bg-slate-900" />
          </div>
        )}

        {/* MAIN INTAKE FORM */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
          
          {/* SEARCH BOX CONTAINER: Executive Dark Glass Card */}
          <div
            className={`w-full rounded-2xl bg-slate-900/90 backdrop-blur-xl border transition-all shadow-xl p-2 flex items-center gap-2 ${
              isRecording
                ? 'border-red-500 ring-2 ring-red-500/30 bg-red-950/20'
                : 'border-slate-700/80 hover:border-blue-500/60 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/30'
            }`}
          >
            {/* Left Action: Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              className={`min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center transition-all active:scale-95 focus:outline-none ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30'
              }`}
              aria-label={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
              title="Voice Input (Bihari, Odia, Hindi, Bengali, English)"
            >
              {isRecording ? (
                <MicOff className="w-6 h-6 stroke-[2]" />
              ) : (
                <Mic className="w-6 h-6 stroke-[2] text-blue-400" />
              )}
            </button>

            {/* Middle: Large Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent text-white text-base md:text-lg font-medium placeholder-slate-400 px-2 py-2 outline-none border-none"
            />

            {/* Right Action: Camera Button */}
            <button
              type="button"
              onClick={handleCameraTrigger}
              className="min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-all active:scale-95 focus:outline-none"
              aria-label="Capture or Upload Photograph"
              title="Attach Photo Evidence"
            >
              <Camera className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Hidden Native File/Camera Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoSelected}
              className="hidden"
            />
          </div>

          {/* HIGH-CONTRAST ACTION BUTTON */}
          <button
            type="submit"
            className="w-full min-h-[50px] rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold text-sm md:text-base shadow-lg flex items-center justify-center gap-2 transition-all focus:outline-none border border-blue-400/30 cursor-pointer"
            aria-label="Submit Report"
          >
            <Search className="w-4 h-4" />
            <span>{t.submitBtn}</span>
          </button>
        </form>

        {/* Quick Sample Voice Prompts (Low Literacy Assistance) */}
        <div className="mt-6 text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Multilingual Simulation Samples:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setInputText("हमार गाँव के सड़किया बाढ़ में टूट गइल बा, आवागमन बंद हो गइल बा।");
                playCivicChime('tap');
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors cursor-pointer"
            >
              भोजपुरी: "हमार गाँव के सड़किया..."
            </button>
            <button
              onClick={() => {
                setInputText("ଆମ ଗାଁ କଲ୍ୟାଣପୁରରୁ ଡାକ୍ତରଖାନା ଯିବା ରାସ୍ତା ବର୍ଷାରେ ଭାଙ୍ଗିଯାଇଛି।");
                playCivicChime('tap');
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors cursor-pointer"
            >
              ଓଡ଼ିଆ: "କଲ୍ୟାଣପୁର ଡାକ୍ତରଖାନା..."
            </button>
            <button
              onClick={() => {
                setInputText("हमारे गांव कल्याणपुर से अस्पताल जाने वाली मुख्य सड़क बारिश में बह गई है।");
                playCivicChime('tap');
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:border-slate-500 transition-colors cursor-pointer"
            >
              हिन्दी: "कल्याणपुर अस्पताल सड़क..."
            </button>
          </div>
        </div>
      </main>

      {/* -------------------------------------------------------------
          3. MINIMAL ACCESSIBLE FOOTER
          ------------------------------------------------------------- */}
      <footer className="w-full px-4 py-3 bg-slate-950 border-t border-slate-800 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lok Swar • Official Citizen Priority System • AC-134 Sundargarh</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="text-amber-400">Offline Mode: Report buffered locally</span>
            </>
          )}
        </div>
      </footer>

      {/* -------------------------------------------------------------
          4. SLIDE-OUT NAVIGATION DRAWER (Hidden Menu Complexity)
          ------------------------------------------------------------- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-84 max-w-[85vw] bg-white border-r border-[#D8E2DC] h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#D8E2DC] mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <h3 className="font-bold text-lg text-[#1B4D3E]">{t.drawerTitle}</h3>
                    <p className="text-[11px] text-slate-500 font-medium">People's Priorities Portal</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  aria-label="Close Drawer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Options */}
              <nav className="flex flex-col gap-2.5">
                {/* 1. Check Status */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    playCivicChime('tap');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F4F7F5] hover:bg-[#E8F0EC] text-left text-slate-800 transition-colors border border-[#D8E2DC]"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#2D6A4F]" />
                    <span className="font-semibold text-sm">{t.menuStatus}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 2. Suggest Infrastructure */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    setInputText("हमारे गांव में प्राथमिक स्वास्थ्य केंद्र का निर्माण किया जाए।");
                    playCivicChime('tap');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F4F7F5] hover:bg-[#E8F0EC] text-left text-slate-800 transition-colors border border-[#D8E2DC]"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-amber-700" />
                    <span className="font-semibold text-sm">{t.menuSuggest}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 3. Public Bulletins */}
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    if (onPublicBulletinsClick) onPublicBulletinsClick();
                    playCivicChime('tap');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#F4F7F5] hover:bg-[#E8F0EC] text-left text-slate-800 transition-colors border border-[#D8E2DC]"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-700" />
                    <span className="font-semibold text-sm">{t.menuBulletins}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* 4. Offline Queue */}
                <div className="p-3.5 rounded-xl bg-[#F4F7F5] border border-[#D8E2DC] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-700 font-semibold text-sm">
                    <Wifi className="w-5 h-5 text-[#2D6A4F]" />
                    <span>{t.menuOffline}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D8F3DC] text-[#1B4D3E]">
                    {pendingQueueCount} Queued
                  </span>
                </div>
              </nav>
            </div>

            {/* Bottom Government Officer Portal Access */}
            <div className="pt-4 border-t border-[#D8E2DC]">
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  if (onAdminPortalClick) onAdminPortalClick();
                }}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#1B4D3E] hover:bg-[#153C30] text-white font-bold text-sm shadow-md transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-[#74C69D]" />
                <span>{t.menuOfficer}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
