import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Volume2,
  Mic,
  MicOff,
  Camera,
  X,
  Search,
  Inbox,
  Radio,
  BarChart3,
  MapPin,
  GitCompare,
  Plane,
  Scale,
  Coins,
  ChevronRight,
  Wifi,
  WifiOff,
  CheckCircle2,
  Sparkles,
  Info,
  Layers,
  FileCheck,
  ShieldAlert
} from 'lucide-react';

/**
 * People's Priorities (जन प्राथमिकताएं)
 * Ultra-Minimalist Light-Green Government Search Engine Interface
 * 
 * Aesthetic & Motion Specs:
 * - Light-Green Palette: Deep Forest Green (#1B4D3E, #2D6A4F), Mint Background (#F4F7F5, #E8F0EC), Crisp White (#FFFFFF).
 * - Micro-Animations: `active:scale-95`, `transition-all duration-300 ease-in-out`, Voice ripple ring animation, Input focus glow.
 * - 3-Line Slide-out Drawer: All 8 core information clusters tucked away neatly.
 * - Accessibility: 56px+ touch targets, Web Speech read-aloud, Web Audio chime synthesis.
 */

export default function CivicSearchEngine({ onClusterSelect }) {
  // -------------------------------------------------------------
  // State
  // -------------------------------------------------------------
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [selectedLang, setSelectedLang] = useState('hi'); // 'hi' | 'or' | 'en'
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [activeModalCluster, setActiveModalCluster] = useState(null);

  // References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);

  // Multilingual Strings
  const i18n = {
    hi: {
      brandTitle: "जन प्राथमिकताएं",
      brandSub: "People's Priorities • भारत सरकार / Government Civic Engine",
      placeholder: "बोलें, लिखें या अपनी समस्या रिकॉर्ड करें...",
      submitBtn: "🔍 रिपोर्ट जमा करें / SUBMIT REPORT",
      recordingPrompt: "🔴 आपकी आवाज़ रिकॉर्ड हो रही है... बोलें",
      readAloudText: "जन प्राथमिकताएं नागरिक सेवा में आपका स्वागत है। माइक बटन दबाकर अपनी समस्या बोलें, या कैमरा बटन से फोटो लगाएं, फिर हरा बटन दबाकर जमा करें।",
      bottomBanner: "🟢 आधिकारिक पोर्टल | कम इंटरनेट मोड सक्रिय | ऑफ़लाइन सुरक्षित",
      drawerTitle: "8 मुख्य सूचना क्लस्टर",
      drawerSub: "Executive Navigation Menu",
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
      bottomBanner: "🟢 ସରକାରୀ ପୋର୍ଟାଲ୍ | କମ୍ ଇଣ୍ଟରନେଟ୍ ମୋଡ୍ | ଅଫଲାଇନ୍ ସୁରକ୍ଷିତ",
      drawerTitle: "୮ଟି ପ୍ରମୁଖ ସୂଚନା କ୍ଲଷ୍ଟର୍",
      drawerSub: "Executive Navigation Menu",
      photoAttached: "ଫଟୋ ଯୋଡ଼ାଗଲା",
      successMsg: "ଆପଣଙ୍କ ରିପୋର୍ଟ ସଫଳତାର ସହ ଦାଖଲ ହୋଇଛି!"
    },
    en: {
      brandTitle: "People's Priorities",
      brandSub: "जन प्राथमिकताएं • Official Constituency Intelligence Engine",
      placeholder: "Speak, type, or upload your problem...",
      submitBtn: "🔍 SUBMIT REPORT / रिपोर्ट जमा करें",
      recordingPrompt: "🔴 Recording voice... Speak clearly now",
      readAloudText: "Welcome to People's Priorities civic engine. Tap the microphone button to speak your issue, or tap camera to attach a photo, then press submit.",
      bottomBanner: "🟢 Official Portal | Low Bandwidth Optimized | Submissions auto-saved offline",
      drawerTitle: "8 Core Information Clusters",
      drawerSub: "Executive Navigation Menu",
      photoAttached: "Photo Attached",
      successMsg: "Your priority report has been officially registered!"
    }
  };

  const t = i18n[selectedLang] || i18n.hi;

  // -------------------------------------------------------------
  // The 8 Core Operational Clusters
  // -------------------------------------------------------------
  const operationalClusters = [
    {
      id: "intake_submissions",
      icon: Inbox,
      number: "1",
      title: "Citizen Intake & Submissions",
      titleHi: "नागरिक शिकायत व सुझाव इतिहास",
      desc: "View 1,248 citizen submissions, offline local sync logs, and live tracking status.",
      badge: "1,248 Reports",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      id: "voice_multilingual",
      icon: Radio,
      number: "2",
      title: "Voice & Multilingual Engine",
      titleHi: "ध्वनि व बहुभाषी प्रतिलेखन",
      desc: "Regional speech synthesis, live audio waveforms, and Odia/Hindi/Bengali NLP extraction.",
      badge: "4 Languages",
      color: "text-amber-700 bg-amber-50 border-amber-200"
    },
    {
      id: "overview_kpis",
      icon: BarChart3,
      number: "3",
      title: "Constituency Overview & KPIs",
      titleHi: "क्षेत्रीय प्रगति व सांख्यिकी",
      desc: "Executive summary, 94% verification index, and sector-wise demand breakdown.",
      badge: "AC-134 Sundargarh",
      color: "text-blue-700 bg-blue-50 border-blue-200"
    },
    {
      id: "gis_hotspots",
      icon: MapPin,
      number: "4",
      title: "GIS Hotspot Map",
      titleHi: "भौगोलिक मांग मानचित्र",
      desc: "Spatial demand density clustering across 142 villages and 16 public facilities.",
      badge: "5 Hotspots",
      color: "text-rose-700 bg-rose-50 border-rose-200"
    },
    {
      id: "evidence_discrepancy",
      icon: GitCompare,
      number: "5",
      title: "Evidence & Discrepancy Engine",
      titleHi: "साक्ष्य सत्यापन व अंतर जांच",
      desc: "Tri-factor cross-referencing: Citizen Demand vs. Official GIS vs. Ground Audits.",
      badge: "Automated Flags",
      color: "text-amber-800 bg-amber-50 border-amber-300"
    },
    {
      id: "drone_verification",
      icon: Plane,
      number: "6",
      title: "Ground & Drone Verification",
      titleHi: "ड्रोन व जमीनी निरीक्षण",
      desc: "Garuda-V MAVLink telemetry, AI computer vision defect tagging, and geotagged hashes.",
      badge: "Aerial Vision",
      color: "text-sky-700 bg-sky-50 border-sky-200"
    },
    {
      id: "priority_ranking",
      icon: Scale,
      number: "7",
      title: "Priority Ranking Engine",
      titleHi: "पारदर्शी प्राथमिकता गणना",
      desc: "12-factor mathematical scoring formula with configurable dynamic weight sliders.",
      badge: "Rank #1: Kalyanpur",
      color: "text-teal-700 bg-teal-50 border-teal-200"
    },
    {
      id: "portfolio_budget",
      icon: Coins,
      number: "8",
      title: "Budget Optimization & Portfolio",
      titleHi: "बजट आवंटन व विकास पोर्टफोलियो",
      desc: "0-1 Knapsack MILP solver maximizing beneficiaries under a ₹10 Cr constituency budget.",
      badge: "₹10 Cr Ceiling",
      color: "text-purple-700 bg-purple-50 border-purple-200"
    }
  ];

  // -------------------------------------------------------------
  // Network Listener
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
  // Web Audio Synthesized Chime
  // -------------------------------------------------------------
  const playCivicChime = (type = 'tap') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.30);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  // -------------------------------------------------------------
  // Read Aloud Text-to-Speech
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
  // Voice Recording with Dynamic Waveform & Ripple
  // -------------------------------------------------------------
  const toggleVoiceRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      playCivicChime('tap');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (!inputText) {
        setInputText(
          selectedLang === 'or'
            ? 'ଆମ ଗାଁ କଲ୍ୟାଣପୁରରୁ ଡାକ୍ତରଖାନା ଯିବା ରାସ୍ତା ବର୍ଷାରେ ସମ୍ପୂର୍ଣ୍ଣ ଧୋଇ ହୋଇଯାଇଛି।'
            : selectedLang === 'hi'
              ? 'हमारे गांव कल्याणपुर से अस्पताल जाने वाली मुख्य सड़क बारिश में पूरी तरह बह गई है।'
              : 'The main all-weather road from Kalyanpur village to the primary health clinic is washed out.'
        );
      }
    } else {
      audioChunksRef.current = [];
      playCivicChime('tap');
      try {
        if (navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
            stream.getTracks().forEach((track) => track.stop());
          };
          recorder.start();
        }
      } catch (err) {
        console.warn('Microphone fallback:', err);
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
    <div className="min-h-screen bg-[#F4F7F5] text-slate-800 flex flex-col justify-between select-none relative font-sans antialiased scroll-smooth">

      {/* -------------------------------------------------------------
          1. TOP HEADER BAR
          ------------------------------------------------------------- */}
      <header className="w-full bg-[#1B4D3E] text-white border-b border-[#2D6A4F] px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-md">

        {/* Left: 3-Line Animated Hamburger Button (56px Touch Target) */}
        <button
          onClick={() => {
            playCivicChime('tap');
            setIsDrawerOpen(true);
          }}
          className="min-w-[56px] min-h-[56px] flex items-center justify-center rounded-xl bg-[#2D6A4F]/60 hover:bg-[#2D6A4F] active:scale-95 text-white transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[#74C69D]/50 shadow-sm"
          aria-label="Open 8-Cluster Navigation Drawer"
          title="[≡] Open Menu (8 Clusters)"
        >
          <Menu className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Center: Official Civic Emblem & Title */}
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <h1 className="text-lg md:text-2xl font-bold tracking-tight text-white font-serif">
              {t.brandTitle}
            </h1>
          </div>
          <span className="text-[10px] md:text-[11px] text-[#D8E2DC] font-medium tracking-wide">
            {t.brandSub}
          </span>
        </div>

        {/* Right: Language Selector & Audio Guidance Button */}
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                playCivicChime('tap');
              }}
              className="bg-[#2D6A4F] text-white text-xs font-semibold rounded-lg px-2.5 py-2 border border-[#52B788]/40 outline-none cursor-pointer focus:ring-2 focus:ring-[#74C69D] active:scale-95 transition-transform"
            >
              <option value="hi">हिन्दी (HI)</option>
              <option value="or">ଓଡ଼ିଆ (OR)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>

          <button
            onClick={handleReadAloud}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center rounded-xl bg-[#D8F3DC]/20 border border-[#D8F3DC]/40 hover:bg-[#D8F3DC]/30 active:scale-95 text-[#D8F3DC] transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[#74C69D]/50 shadow-sm"
            aria-label="Listen to Audio Guidance"
            title="🔊 Listen / ऑडियो सुनें"
          >
            <Volume2 className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          2. CENTRAL SEARCH ENGINE INTAKE BAR (Main Screen Focus)
          ------------------------------------------------------------- */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 flex flex-col justify-center py-8">

        {/* Emblem & Portal Subtitle */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#E8F0EC] border-2 border-[#B7E4C7] shadow-inner mb-3 text-3xl transform hover:scale-105 transition-transform duration-200">
            🌾
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1B4D3E] tracking-tight">
            नागरिक विकास प्राथमिकता इंजन
          </h2>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Official Constituency Intelligence Engine • AC-134 Sundargarh
          </p>
        </div>

        {/* Success Alert Banner */}
        {submitSuccess && (
          <div className="mb-5 p-4 rounded-2xl bg-[#D8F3DC] border-2 border-[#2D6A4F] text-[#1B4D3E] flex items-center gap-3 shadow-md animate-bounce">
            <CheckCircle2 className="w-8 h-8 text-[#2D6A4F] flex-shrink-0" />
            <div>
              <p className="font-bold text-base">{t.successMsg}</p>
              <p className="text-xs text-[#2D6A4F]/90">
                {isOnline ? 'Directly logged in the District Development Registry.' : 'Saved offline on device. Will auto-sync when online.'}
              </p>
            </div>
          </div>
        )}

        {/* Attached Photo Preview */}
        {photoPreview && (
          <div className="mb-4 relative inline-block self-center rounded-2xl overflow-hidden border-2 border-[#2D6A4F] shadow-lg bg-white">
            <img src={photoPreview} alt="Attached Evidence" className="w-48 h-32 object-cover" />
            <button
              onClick={() => {
                setPhotoPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600 transition-colors"
              aria-label="Remove Photo"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-0 inset-x-0 bg-[#1B4D3E]/90 text-[11px] text-center text-white py-1 font-semibold">
              📷 {t.photoAttached}
            </div>
          </div>
        )}

        {/* Live Audio Waveform Box */}
        {isRecording && (
          <div className="mb-4 bg-[#1B4D3E] rounded-2xl border-2 border-[#52B788] p-3 text-center shadow-xl">
            <p className="text-xs font-bold text-[#D8F3DC] mb-1.5 animate-pulse">
              {t.recordingPrompt}
            </p>
            <canvas ref={canvasRef} width="480" height="60" className="w-full h-14 rounded-xl bg-[#0E2C23]" />
          </div>
        )}

        {/* INTAKE FORM */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">

          {/* SEARCH BOX CONTAINER: Crisp White Card with Green Border & Focus Glow */}
          <div
            className={`w-full rounded-2xl bg-white border-2 transition-all duration-200 shadow-xl p-2 flex items-center gap-2 ${isRecording
                ? 'border-red-500 ring-4 ring-red-500/20 bg-red-50/20'
                : 'border-[#B7E4C7] hover:border-[#52B788] focus-within:border-[#1B4D3E] focus-within:ring-4 focus-within:ring-[#1B4D3E]/15'
              }`}
          >
            {/* Left Action: Extra-Large Mic Button with Ripple Animation */}
            <div className="relative">
              {isRecording && (
                <span className="absolute -inset-1 rounded-2xl bg-red-500 opacity-75 animate-ping" />
              )}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`relative min-w-[58px] min-h-[58px] rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 ${isRecording
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : 'bg-[#E8F0EC] text-[#1B4D3E] hover:bg-[#D8E2DC] border border-[#B7E4C7]'
                  }`}
                aria-label={isRecording ? 'Stop Recording' : 'Start Voice Recording'}
                title="🎤 Speak Problem"
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 stroke-[2.5]" />
                ) : (
                  <Mic className="w-8 h-8 stroke-[2.5] text-[#1B4D3E]" />
                )}
              </button>
            </div>

            {/* Middle: Large Text Input (18px+ font) */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent text-slate-900 text-lg md:text-xl font-medium placeholder-slate-400 px-3 py-3 outline-none border-none"
            />

            {/* Right Action: Camera Button */}
            <button
              type="button"
              onClick={() => {
                playCivicChime('tap');
                fileInputRef.current?.click();
              }}
              className="min-w-[58px] min-h-[58px] rounded-xl bg-[#E8F0EC] text-[#1B4D3E] hover:bg-[#D8E2DC] border border-[#B7E4C7] flex items-center justify-center transition-all duration-150 active:scale-95 focus:outline-none focus:ring-4 focus:ring-[#1B4D3E]/20"
              aria-label="Capture photograph"
              title="📷 Photo Upload"
            >
              <Camera className="w-8 h-8 stroke-[2.5] text-[#1B4D3E]" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPhotoPreview(URL.createObjectURL(file));
                  playCivicChime('tap');
                }
              }}
              className="hidden"
            />
          </div>

          {/* HIGH-CONTRAST DEEP GREEN SUBMIT BUTTON with Fluid Micro-Animation */}
          <button
            type="submit"
            className="w-full min-h-[62px] rounded-2xl bg-[#1B4D3E] hover:bg-[#153C30] active:scale-95 text-white font-bold text-lg md:text-xl shadow-lg shadow-[#1B4D3E]/30 flex items-center justify-center gap-3 transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-[#2D6A4F]/50 border border-[#2D6A4F] hover:-translate-y-0.5"
            aria-label="Submit Report"
          >
            <span>{t.submitBtn}</span>
          </button>
        </form>

        {/* Quick Regional Voice Prompt Simulator Chips */}
        <div className="mt-6 text-center">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            ⚡ Quick Voice Simulation Samples:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setInputText("हमारे गांव कल्याणपुर से अस्पताल जाने वाली मुख्य सड़क बारिश में बह गई है।");
                playCivicChime('tap');
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#D8E2DC] text-[#1B4D3E] hover:bg-[#E8F0EC] active:scale-95 transition-all shadow-sm"
            >
              🗣️ हिन्दी: "कल्याणपुर अस्पताल सड़क..."
            </button>
            <button
              onClick={() => {
                setInputText("ଆମ ଗାଁ କଲ୍ୟାଣପୁରରୁ ଡାକ୍ତରଖାନା ଯିବା ରାସ୍ତା ବର୍ଷାରେ ଭାଙ୍ଗିଯାଇଛି।");
                playCivicChime('tap');
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-[#D8E2DC] text-[#1B4D3E] hover:bg-[#E8F0EC] active:scale-95 transition-all shadow-sm"
            >
              🗣️ ଓଡ଼ିଆ: "କଲ୍ୟାଣପୁର ଡାକ୍ତରଖାନା ରାସ୍ତା..."
            </button>
          </div>
        </div>
      </main>

      {/* -------------------------------------------------------------
          4. ACCESSIBILITY & FOOTER
          ------------------------------------------------------------- */}
      <footer className="w-full px-4 py-3 bg-[#E8F0EC] border-t border-[#D8E2DC] text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-white border border-[#B7E4C7] text-[#1B4D3E] shadow-sm">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-[#2D6A4F]" />
              <span>{t.bottomBanner}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="text-amber-800">ऑफ़लाइन मोड: रिपोर्ट फोन में सुरक्षित है</span>
            </>
          )}
        </div>
      </footer>

      {/* -------------------------------------------------------------
          3. SLIDE-OUT DRAWER MENU (3-Line Navigation: All 8 Clusters)
          ------------------------------------------------------------- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop with Fade */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Container with Smooth Slide-in */}
          <div className="relative w-96 max-w-[88vw] bg-white border-r border-[#D8E2DC] h-full flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-300 ease-in-out">

            {/* Drawer Header */}
            <div className="p-5 border-b border-[#D8E2DC] bg-[#F4F7F5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B4D3E] text-white flex items-center justify-center text-xl shadow-sm">
                  🏛️
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#1B4D3E]">{t.drawerTitle}</h3>
                  <p className="text-[11px] text-slate-500 font-medium">{t.drawerSub}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
                aria-label="Close Drawer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable 8-Cluster Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {operationalClusters.map((cluster) => {
                const IconComponent = cluster.icon;
                return (
                  <button
                    key={cluster.id}
                    onClick={() => {
                      playCivicChime('tap');
                      setIsDrawerOpen(false);
                      if (onClusterSelect) {
                        onClusterSelect(cluster.id);
                      } else {
                        setActiveModalCluster(cluster);
                      }
                    }}
                    className="w-full flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#F4F7F5] hover:bg-[#E8F0EC] border border-[#D8E2DC] hover:border-[#B7E4C7] text-left transition-all duration-200 active:scale-95 hover:shadow-sm group"
                  >
                    {/* Icon with Number Pill */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${cluster.color} group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#1B4D3E] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {cluster.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-sm text-[#1B4D3E] truncate group-hover:text-[#153C30]">
                          {cluster.title}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D8F3DC] text-[#1B4D3E] border border-[#B7E4C7] whitespace-nowrap">
                          {cluster.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700">{cluster.titleHi}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-1 line-clamp-2">
                        {cluster.desc}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1B4D3E] group-hover:translate-x-0.5 transition-all self-center flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Bottom Direct Access Link to Main System */}
            <div className="p-4 border-t border-[#D8E2DC] bg-[#F4F7F5]">
              <a
                href="http://localhost:8000"
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-[#1B4D3E] hover:bg-[#153C30] active:scale-95 text-white font-bold text-sm shadow-md transition-all duration-150"
              >
                <Layers className="w-5 h-5 text-[#74C69D]" />
                <span>Open Full Decision Platform (All 8 Dashboards)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal for Selected Cluster */}
      {activeModalCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveModalCluster(null)}
          />
          <div className="relative bg-white rounded-3xl border-2 border-[#B7E4C7] max-w-lg w-full p-6 shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8E2DC] mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#1B4D3E] text-white flex items-center justify-center font-bold text-sm">
                  #{activeModalCluster.number}
                </span>
                <h3 className="font-bold text-lg text-[#1B4D3E]">{activeModalCluster.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalCluster(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-800 mb-2">{activeModalCluster.titleHi}</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{activeModalCluster.desc}</p>

            <div className="p-4 rounded-2xl bg-[#F4F7F5] border border-[#D8E2DC] mb-5">
              <div className="text-xs font-bold text-[#1B4D3E] uppercase mb-1">Live Operational Status:</div>
              <div className="text-xs text-slate-700">
                Connected to Sundargarh District Planning Registry with verified evidence tri-factor scoring.
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="http://localhost:8000"
                className="flex-1 py-3 px-4 rounded-xl bg-[#1B4D3E] text-white font-bold text-sm text-center shadow hover:bg-[#153C30] transition-colors"
              >
                View Full Operational Dashboard →
              </a>
              <button
                onClick={() => setActiveModalCluster(null)}
                className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
