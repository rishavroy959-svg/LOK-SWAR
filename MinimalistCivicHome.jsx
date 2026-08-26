import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Bell,
  Globe,
  Sun,
  Moon,
  Mic,
  MicOff,
  Camera,
  X,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Building,
  MapPin,
  BrainCircuit,
  GitCompare,
  ClipboardCheck,
  Plane,
  Coins,
  ChevronRight,
  Wifi,
  Sparkles
} from 'lucide-react';

/**
 * People's Priorities (जन प्राथमिकताएं)
 * Hyper-Minimalist Civic Intelligence Search Engine
 * 
 * Directives:
 * 1. ZERO heavy top bars on the main screen.
 * 2. All 8 Information Clusters & System Status consolidated into Left-Side Slide-out Drawer ([≡]).
 * 3. Clean Top-Right Utilities: 🔔 Notifications, 🌐 Language, ☀️/🌙 Soft Blue Night Mode Toggle.
 * 4. Themes:
 *    - Light Mode: #F4F9F6 background, #FFFFFF cards, #1E4B3D Forest Green accents.
 *    - Soft Blue Night Mode: #3B4D61 Slate/Twilight Blue background, #4A6278 Soft Blue cards, #FFFFFF text, #3B82F6 Blue accents.
 */

export default function MinimalistCivicHome({ onNavigateTab }) {
  // -------------------------------------------------------------
  // State
  // -------------------------------------------------------------
  const [isDarkMode, setIsDarkMode] = useState(false); // false: Light (#F4F9F6), true: Soft Blue (#3B4D61)
  const [selectedLang, setSelectedLang] = useState('hi'); // 'hi' | 'or' | 'en'
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(3);

  // References
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const fileInputRef = useRef(null);

  // Multilingual Configuration
  const i18n = {
    hi: {
      centerTitle: "🏛️ जन प्राथमिकताएं | OFFICIAL CIVIC INTELLIGENCE",
      placeholder: "बोलें, लिखें या अपनी समस्या रिकॉर्ड करें...",
      submitBtn: "🔍 रिपोर्ट जमा करें / SUBMIT REPORT",
      recordingPrompt: "🔴 आपकी आवाज़ रिकॉर्ड हो रही है... बोलें",
      successMsg: "आपकी प्राथमिकता रिपोर्ट सफलतापूर्वक दर्ज कर ली गई है!",
      drawerTitle: "People's Priorities",
      constituencyTag: "AC-134 SUNDARGARH",
      systemMode: "Standard Mode • Online 4G/5G",
      navSectionTitle: "सूचना व निर्णय डैशबोर्ड (8 TABS)",
      notifTitle: "अधिसूचनाएं (Notifications)",
      photoAttached: "फोटो संलग्न है"
    },
    or: {
      centerTitle: "🏛️ ଜନ ପ୍ରାଥମିକତା | OFFICIAL CIVIC INTELLIGENCE",
      placeholder: "କୁହନ୍ତୁ, ଲେଖନ୍ତୁ କିମ୍ବା ସମସ୍ୟା ରେକର୍ଡ କରନ୍ତୁ...",
      submitBtn: "🔍 ରିପୋର୍ଟ ଦାଖଲ କରନ୍ତୁ / SUBMIT REPORT",
      recordingPrompt: "🔴 ଆପଣଙ୍କ ସ୍ୱର ରେକର୍ଡ ହେଉଛି... କୁହନ୍ତୁ",
      successMsg: "ଆପଣଙ୍କ ରିପୋର୍ଟ ସଫଳତାର ସହ ଦାଖଲ ହୋଇଛି!",
      drawerTitle: "People's Priorities",
      constituencyTag: "AC-134 SUNDARGARH",
      systemMode: "Standard Mode • Online 4G/5G",
      navSectionTitle: "ସୂଚନା ଓ ବିକାଶ ଡ୍ୟାସବୋର୍ଡ (8 TABS)",
      notifTitle: "ବିଜ୍ଞପ୍ତି (Notifications)",
      photoAttached: "ଫଟୋ ଯୋଡ଼ାଗଲା"
    },
    en: {
      centerTitle: "🏛️ People's Priorities | OFFICIAL CIVIC INTELLIGENCE",
      placeholder: "Speak, type, or record your problem here...",
      submitBtn: "🔍 SUBMIT REPORT / रिपोर्ट जमा करें",
      recordingPrompt: "🔴 Recording voice... Speak clearly now",
      successMsg: "Your priority report has been officially registered!",
      drawerTitle: "People's Priorities",
      constituencyTag: "AC-134 SUNDARGARH",
      systemMode: "Standard Mode • Online 4G/5G",
      navSectionTitle: "Executive Information Clusters (8 Tabs)",
      notifTitle: "Civic Notifications",
      photoAttached: "Photo Attached"
    }
  };

  const t = i18n[selectedLang] || i18n.hi;

  // The 8 Core Operational Tabs
  const drawerTabs = [
    {
      id: "citizen",
      icon: UserCheck,
      number: "1",
      title: "Citizen Intake & Voice",
      titleHi: "नागरिक शिकायत व ध्वनि इनपुट",
      desc: "Multilingual voice recorder, offline queue & verification tracking.",
      badge: "1,248 Submissions"
    },
    {
      id: "admin_overview",
      icon: Building,
      number: "2",
      title: "Overview & KPIs",
      titleHi: "क्षेत्रीय प्रगति व सांख्यिकी",
      desc: "Constituency KPIs, resolution metrics, and sector-wise distribution.",
      badge: "AC-134 Sundargarh"
    },
    {
      id: "gis_map",
      icon: MapPin,
      number: "3",
      title: "GIS Hotspot Map",
      titleHi: "भौगोलिक मांग मानचित्र",
      desc: "Spatial clustering across 142 villages & 16 public facilities.",
      badge: "5 Hotspots"
    },
    {
      id: "thematic_clusters",
      icon: BrainCircuit,
      number: "4",
      title: "AI Thematic Clusters",
      titleHi: "आर्टिफिशियल इंटेलिजेंस क्लस्टरिंग",
      desc: "Multilingual semantic embedding & clustering of 1,248 reports.",
      badge: "10 AI Themes"
    },
    {
      id: "data_fusion",
      icon: GitCompare,
      number: "5",
      title: "Evidence & Discrepancies",
      titleHi: "साक्ष्य सत्यापन व अंतर जांच",
      desc: "Tri-factor cross-referencing: Citizen Demand vs. Official GIS Data.",
      badge: "Automated Flags"
    },
    {
      id: "field_officer",
      icon: ClipboardCheck,
      number: "6",
      title: "Field Verification",
      titleHi: "जमीनी अधिकारी कार्यसूची",
      desc: "Mobile inspection workflow with offline audit checklist.",
      badge: "Officer Portal"
    },
    {
      id: "drone_simulator",
      icon: Plane,
      number: "7",
      title: "Drone Telemetry & Evidence",
      titleHi: "ड्रोन टेलीमेट्री व साक्ष्य",
      desc: "Garuda-V MAVLink autonomous aerial surveys & CV damage detection.",
      badge: "Aerial Vision"
    },
    {
      id: "portfolio_optimizer",
      icon: Coins,
      number: "8",
      title: "Budget Optimization",
      titleHi: "बजट आवंटन व पोर्टफोलियो",
      desc: "0-1 Knapsack MILP solver maximizing beneficiaries under ₹10 Cr.",
      badge: "₹10 Cr Budget"
    }
  ];

  // Notifications List
  const notifications = [
    {
      id: 1,
      title: "Drone Survey Georeferenced",
      desc: "Garuda-V completed Kalyanpur Bridge corridor audit with 42 orthophotos.",
      time: "10m ago",
      type: "drone"
    },
    {
      id: 2,
      title: "Discrepancy Alert Flagged",
      desc: "Kalyanpur road status discrepancy detected (Govt: All-Weather vs Citizen: Washout).",
      time: "45m ago",
      type: "alert"
    },
    {
      id: 3,
      title: "Budget Optimization Recalculated",
      desc: "Optimal 5-project portfolio generated for ₹9.1 Cr benefiting 76,100 citizens.",
      time: "2h ago",
      type: "budget"
    }
  ];

  // Soft Chime Audio Feedback
  const playChime = (type = 'tap') => {
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
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {}
  };

  // Voice Recording Toggle
  const toggleVoiceRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      playChime('tap');
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
      playChime('tap');
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
      } catch (err) {}
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
      ctx.fillStyle = isDarkMode ? '#2D3B4A' : '#1E4B3D';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = isDarkMode ? '#60A5FA' : '#74C69D';

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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!inputText && !photoPreview) return;
    playChime('success');
    setSubmitSuccess(true);
    setTimeout(() => {
      setInputText('');
      setPhotoPreview(null);
      setSubmitSuccess(false);
    }, 3500);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between select-none relative font-sans transition-colors duration-300 ${
        isDarkMode
          ? 'bg-[#3B4D61] text-[#FFFFFF]' // Soft Blue Night Mode
          : 'bg-[#F4F9F6] text-slate-800'  // Light Mode (Porcelain Mint)
      }`}
    >
      {/* -------------------------------------------------------------
          1. ULTRA-MINIMAL TOP HEADER AREA (Transparent & Clean)
          ------------------------------------------------------------- */}
      <header className="w-full px-4 md:px-8 py-4 flex items-center justify-between z-30">
        
        {/* Left: 3-Line Animated Hamburger Button */}
        <button
          onClick={() => {
            playChime('tap');
            setIsDrawerOpen(true);
          }}
          className={`min-w-[52px] min-h-[52px] flex items-center justify-center rounded-2xl border transition-all duration-200 active:scale-95 shadow-sm ${
            isDarkMode
              ? 'bg-[#4A6278] border-[#5E7A94] text-white hover:bg-[#5E7A94]'
              : 'bg-white border-[#D8E2DC] text-[#1E4B3D] hover:bg-[#E8F0EC]'
          }`}
          aria-label="Open Slide-out Navigation Drawer"
          title="[≡] Open Menu"
        >
          <Menu className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Center: Minimal Text Title */}
        <div className="text-center px-2">
          <h1
            className={`text-sm md:text-lg font-bold tracking-tight font-serif flex items-center justify-center gap-1.5 ${
              isDarkMode ? 'text-[#FFFFFF]' : 'text-[#1E4B3D]'
            }`}
          >
            {t.centerTitle}
          </h1>
        </div>

        {/* Right: Top-Right Utilities (🔔 Notifications, 🌐 Language, ☀️/🌙 Soft Blue Toggle) */}
        <div className="flex items-center gap-2">
          
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => {
                playChime('tap');
                setIsNotifOpen(!isNotifOpen);
                setUnreadNotifs(0);
              }}
              className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-2xl border transition-all duration-200 active:scale-95 relative ${
                isDarkMode
                  ? 'bg-[#4A6278] border-[#5E7A94] text-white hover:bg-[#5E7A94]'
                  : 'bg-white border-[#D8E2DC] text-[#1E4B3D] hover:bg-[#E8F0EC]'
              }`}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[2.2]" />
              {unreadNotifs > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotifOpen && (
              <div
                className={`absolute right-0 mt-2 w-80 rounded-2xl border shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150 ${
                  isDarkMode
                    ? 'bg-[#4A6278] border-[#5E7A94] text-white'
                    : 'bg-white border-[#D8E2DC] text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/15">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span>{t.notifTitle}</span>
                  </div>
                  <button onClick={() => setIsNotifOpen(false)} className="text-xs opacity-60 hover:opacity-100">
                    ✕
                  </button>
                </div>
                <div className="space-y-2.5 text-xs">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border ${
                        isDarkMode
                          ? 'bg-[#3B4D61]/60 border-[#5E7A94]/40'
                          : 'bg-[#F4F9F6] border-[#D8E2DC]'
                      }`}
                    >
                      <div className="flex justify-between font-bold mb-0.5">
                        <span>{n.title}</span>
                        <span className="text-[10px] opacity-60 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {n.time}
                        </span>
                      </div>
                      <p className="opacity-80 leading-tight">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <select
              value={selectedLang}
              onChange={(e) => {
                setSelectedLang(e.target.value);
                playChime('tap');
              }}
              className={`h-[48px] px-3 text-xs font-semibold rounded-2xl border outline-none cursor-pointer active:scale-95 transition-all ${
                isDarkMode
                  ? 'bg-[#4A6278] border-[#5E7A94] text-white'
                  : 'bg-white border-[#D8E2DC] text-[#1E4B3D]'
              }`}
              aria-label="Language Selector"
            >
              <option value="hi" className={isDarkMode ? 'bg-[#3B4D61]' : ''}>हिन्दी (HI)</option>
              <option value="or" className={isDarkMode ? 'bg-[#3B4D61]' : ''}>ଓଡ଼ିଆ (OR)</option>
              <option value="en" className={isDarkMode ? 'bg-[#3B4D61]' : ''}>English (EN)</option>
            </select>
          </div>

          {/* Soft Blue Night Mode Toggle */}
          <button
            onClick={() => {
              playChime('tap');
              setIsDarkMode(!isDarkMode);
            }}
            className={`min-w-[48px] min-h-[48px] flex items-center justify-center rounded-2xl border transition-all duration-200 active:scale-95 ${
              isDarkMode
                ? 'bg-blue-500/20 border-blue-400/50 text-blue-300 hover:bg-blue-500/30'
                : 'bg-white border-[#D8E2DC] text-[#1E4B3D] hover:bg-[#E8F0EC]'
            }`}
            aria-label="Toggle Soft Blue Night Mode"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Soft Blue Night Mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 stroke-[2.2] text-amber-300 animate-spin-slow" />
            ) : (
              <Moon className="w-5 h-5 stroke-[2.2]" />
            )}
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          2. CENTER FOCUS: THE CENTRAL INTAKE CARD & ACTION
          ------------------------------------------------------------- */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 flex flex-col justify-center py-6">
        
        {/* Civic Emblem Badge */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-inner mb-3 text-3xl transform hover:scale-105 transition-transform duration-200 ${
              isDarkMode
                ? 'bg-[#4A6278] border-[#5E7A94] text-white'
                : 'bg-[#E8F0EC] border-[#B7E4C7] text-[#1E4B3D]'
            }`}
          >
            🌾
          </div>
          <h2
            className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-[#1E4B3D]'
            }`}
          >
            नागरिक विकास प्राथमिकता इंजन
          </h2>
          <p className={`text-xs md:text-sm font-medium mt-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
            District Planning Intelligence • AC-134 Sundargarh
          </p>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div
            className={`mb-5 p-4 rounded-2xl border-2 flex items-center gap-3 shadow-md animate-bounce ${
              isDarkMode
                ? 'bg-blue-500/20 border-blue-400 text-blue-200'
                : 'bg-[#D8F3DC] border-[#2D6A4F] text-[#1B4D3E]'
            }`}
          >
            <CheckCircle2 className="w-7 h-7 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">{t.successMsg}</p>
              <p className="text-xs opacity-80">Logged directly into the District Development Ledger.</p>
            </div>
          </div>
        )}

        {/* Photo Evidence Preview */}
        {photoPreview && (
          <div
            className={`mb-4 relative inline-block self-center rounded-2xl overflow-hidden border-2 shadow-lg ${
              isDarkMode ? 'bg-[#4A6278] border-blue-400' : 'bg-white border-[#1E4B3D]'
            }`}
          >
            <img src={photoPreview} alt="Evidence" className="w-48 h-32 object-cover" />
            <button
              onClick={() => {
                setPhotoPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-white hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div
              className={`absolute bottom-0 inset-x-0 text-[11px] text-center py-1 font-semibold ${
                isDarkMode ? 'bg-[#3B4D61]/90 text-white' : 'bg-[#1E4B3D]/90 text-white'
              }`}
            >
              📷 {t.photoAttached}
            </div>
          </div>
        )}

        {/* Live Audio Waveform Canvas */}
        {isRecording && (
          <div
            className={`mb-4 rounded-2xl border-2 p-3 text-center shadow-xl ${
              isDarkMode ? 'bg-[#4A6278] border-blue-400' : 'bg-[#1E4B3D] border-[#52B788]'
            }`}
          >
            <p className="text-xs font-bold text-white mb-1.5 animate-pulse">{t.recordingPrompt}</p>
            <canvas ref={canvasRef} width="480" height="60" className="w-full h-14 rounded-xl bg-slate-950/50" />
          </div>
        )}

        {/* INTAKE FORM */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          
          {/* THE PROMINENT CENTRAL SEARCH BOX CONTAINER */}
          <div
            className={`w-full rounded-2xl border-2 transition-all duration-200 shadow-xl p-2 flex items-center gap-2 ${
              isRecording
                ? 'border-red-500 ring-4 ring-red-500/20'
                : isDarkMode
                ? 'bg-[#4A6278] border-[#5E7A94] focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-400/20'
                : 'bg-white border-[#B7E4C7] hover:border-[#52B788] focus-within:border-[#1E4B3D] focus-within:ring-4 focus-within:ring-[#1E4B3D]/15'
            }`}
          >
            {/* Left Action: Extra-Large Mic Button with Ripple Animation */}
            <div className="relative">
              {isRecording && <span className="absolute -inset-1 rounded-xl bg-red-500 opacity-75 animate-ping" />}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`relative min-w-[58px] min-h-[58px] rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 ${
                  isRecording
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/50'
                    : isDarkMode
                    ? 'bg-[#3B4D61] text-blue-300 hover:bg-[#2D3B4A] border border-[#5E7A94]'
                    : 'bg-[#E8F0EC] text-[#1E4B3D] hover:bg-[#D8E2DC] border border-[#B7E4C7]'
                }`}
                aria-label="Microphone Voice Input"
                title="🎤 Speak Problem"
              >
                {isRecording ? <MicOff className="w-7 h-7 stroke-[2.5]" /> : <Mic className="w-7 h-7 stroke-[2.5]" />}
              </button>
            </div>

            {/* Middle: Text Input (18px+ font) */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t.placeholder}
              className={`flex-1 bg-transparent text-lg md:text-xl font-medium px-3 py-3 outline-none border-none ${
                isDarkMode ? 'text-white placeholder-slate-400' : 'text-slate-900 placeholder-slate-400'
              }`}
            />

            {/* Right Action: Camera Button */}
            <button
              type="button"
              onClick={() => {
                playChime('tap');
                fileInputRef.current?.click();
              }}
              className={`min-w-[58px] min-h-[58px] rounded-xl flex items-center justify-center transition-all duration-150 active:scale-95 border ${
                isDarkMode
                  ? 'bg-[#3B4D61] text-blue-300 hover:bg-[#2D3B4A] border-[#5E7A94]'
                  : 'bg-[#E8F0EC] text-[#1E4B3D] hover:bg-[#D8E2DC] border-[#B7E4C7]'
              }`}
              aria-label="Camera Evidence Capture"
              title="📷 Photo Evidence"
            >
              <Camera className="w-7 h-7 stroke-[2.5]" />
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
                  playChime('tap');
                }
              }}
              className="hidden"
            />
          </div>

          {/* LARGE HIGH-CONTRAST ACTION BUTTON */}
          <button
            type="submit"
            className={`w-full min-h-[62px] rounded-2xl text-white font-bold text-lg md:text-xl shadow-lg flex items-center justify-center gap-3 transition-all duration-150 active:scale-95 hover:-translate-y-0.5 ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40 border border-blue-400 focus:ring-4 focus:ring-blue-400/50'
                : 'bg-[#1E4B3D] hover:bg-[#153C30] shadow-[#1E4B3D]/30 border border-[#2D6A4F] focus:ring-4 focus:ring-[#2D6A4F]/50'
            }`}
            aria-label="Submit Report"
          >
            <span>{t.submitBtn}</span>
          </button>
        </form>

        {/* Quick Simulation Voice Samples */}
        <div className="mt-6 text-center">
          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            ⚡ Quick Voice Simulation:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setInputText("हमारे गांव कल्याणपुर से अस्पताल जाने वाली मुख्य सड़क बारिश में बह गई है।");
                playChime('tap');
              }}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all active:scale-95 shadow-sm ${
                isDarkMode
                  ? 'bg-[#4A6278] border-[#5E7A94] text-white hover:bg-[#5E7A94]'
                  : 'bg-white border-[#D8E2DC] text-[#1E4B3D] hover:bg-[#E8F0EC]'
              }`}
            >
              🗣️ हिन्दी: "कल्याणपुर अस्पताल सड़क..."
            </button>
            <button
              onClick={() => {
                setInputText("ଆମ ଗାଁ କଲ୍ୟାଣପୁରରୁ ଡାକ୍ତରଖାନା ଯିବା ରାସ୍ତା ବର୍ଷାରେ ଭାଙ୍ଗିଯାଇଛି।");
                playChime('tap');
              }}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all active:scale-95 shadow-sm ${
                isDarkMode
                  ? 'bg-[#4A6278] border-[#5E7A94] text-white hover:bg-[#5E7A94]'
                  : 'bg-white border-[#D8E2DC] text-[#1E4B3D] hover:bg-[#E8F0EC]'
              }`}
            >
              🗣️ ଓଡ଼ିଆ: "କଲ୍ୟାଣପୁର ଡାକ୍ତରଖାନା ରାସ୍ତା..."
            </button>
          </div>
        </div>
      </main>

      {/* -------------------------------------------------------------
          3. MINIMAL STATUS FOOTER
          ------------------------------------------------------------- */}
      <footer className="w-full px-4 py-3 text-center">
        <div
          className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full border shadow-sm ${
            isDarkMode
              ? 'bg-[#4A6278] border-[#5E7A94] text-white'
              : 'bg-[#E8F0EC] border-[#B7E4C7] text-[#1E4B3D]'
          }`}
        >
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span>🟢 Official Civic Portal | Low-Bandwidth Mode Active | Auto-Saved Offline</span>
        </div>
      </footer>

      {/* -------------------------------------------------------------
          4. SLIDE-OUT DRAWER MENU (CONSOLIDATES ALL 8 TABS & METADATA)
          ------------------------------------------------------------- */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Body with Smooth Left-to-Right Slide */}
          <div
            className={`relative w-96 max-w-[88vw] h-full flex flex-col justify-between shadow-2xl z-10 border-r animate-in slide-in-from-left duration-300 ease-in-out ${
              isDarkMode
                ? 'bg-[#4A6278] border-[#5E7A94] text-white'
                : 'bg-white border-[#D8E2DC] text-slate-800'
            }`}
          >
            {/* Drawer Header Info */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-[#3B4D61] border-[#5E7A94]' : 'bg-[#F4F9F6] border-[#D8E2DC]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-bold shadow-sm ${
                    isDarkMode ? 'bg-blue-600 text-white' : 'bg-[#1E4B3D] text-white'
                  }`}
                >
                  🏛️
                </div>
                <div>
                  <h3 className="font-bold text-base">{t.drawerTitle}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {t.constituencyTag}
                    </span>
                    <span className="text-[10px] opacity-75">{t.systemMode}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className={`p-2 rounded-xl text-lg hover:opacity-100 opacity-60 active:scale-95 transition-all`}
              >
                ✕
              </button>
            </div>

            {/* The 8 Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-60 px-1 mb-1">
                {t.navSectionTitle}
              </div>

              {drawerTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      playChime('tap');
                      setIsDrawerOpen(false);
                      if (onNavigateTab) {
                        onNavigateTab(tab.id);
                      } else {
                        window.location.href = `http://localhost:8000#${tab.id}`;
                      }
                    }}
                    className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl border text-left transition-all duration-200 active:scale-95 hover:shadow-md group ${
                      isDarkMode
                        ? 'bg-[#3B4D61] hover:bg-[#344456] border-[#5E7A94] text-white'
                        : 'bg-[#F4F9F6] hover:bg-[#E8F0EC] border-[#D8E2DC] text-slate-800'
                    }`}
                  >
                    {/* Number & Icon */}
                    <div className="relative flex-shrink-0 mt-0.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs group-hover:scale-105 transition-transform ${
                          isDarkMode
                            ? 'bg-[#4A6278] border-[#5E7A94] text-blue-300'
                            : 'bg-white border-[#B7E4C7] text-[#1E4B3D]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {tab.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="font-bold text-sm truncate">{tab.title}</h4>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                            isDarkMode
                              ? 'bg-blue-500/20 text-blue-200 border-blue-400/30'
                              : 'bg-[#D8F3DC] text-[#1B4D3E] border-[#B7E4C7]'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium opacity-80">{tab.titleHi}</p>
                      <p className="text-[10px] opacity-65 leading-tight mt-1 line-clamp-1">
                        {tab.desc}
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all self-center flex-shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Bottom Full Access Link */}
            <div
              className={`p-4 border-t ${
                isDarkMode ? 'bg-[#3B4D61] border-[#5E7A94]' : 'bg-[#F4F9F6] border-[#D8E2DC]'
              }`}
            >
              <a
                href="http://localhost:8000"
                className={`w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-white font-bold text-sm shadow-md active:scale-95 transition-all duration-150 ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-[#1E4B3D] hover:bg-[#153C30]'
                }`}
              >
                <span>Launch Interactive Platform Dashboard →</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
