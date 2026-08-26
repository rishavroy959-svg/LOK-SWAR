import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Camera,
  X,
  Lock,
  UserCheck,
  Search,
  CheckCircle2,
  ShieldCheck,
  Building,
  FileText,
  LogOut,
  MapPin,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

const CIVIC_BACKGROUNDS = [
  'assets/bg_1_smart_village.jpg',
  'assets/bg_2_smart_odisha.jpg',
  'assets/bg_3_smart_bengal.jpg'
];

export default function LokSwarInteractive() {
  const [bgImage] = useState(() => CIVIC_BACKGROUNDS[Math.floor(Math.random() * CIVIC_BACKGROUNDS.length)]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hi');
  const [currentRoute, setCurrentRoute] = useState(() => (typeof window !== 'undefined' ? window.location.hash || '#/' : '#/'));
  
  // Auth state
  const [citizenUser, setCitizenUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lok_swar_citizen_session');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });
  const [adminSession, setAdminSession] = useState(() => {
    try {
      const saved = localStorage.getItem('lok_swar_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });

  const [isCitizenAuthModalOpen, setIsCitizenAuthModalOpen] = useState(false);
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const navigateTo = (route) => {
    if (typeof window !== 'undefined') {
      window.location.hash = route;
      setCurrentRoute(route);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between select-none font-sans overflow-x-hidden">
      {/* Fullscreen background */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0
        }}
      />

      {/* Citizen Public Intake Portal */}
      <div className="flex-1 flex flex-col justify-between z-10 relative">
        <header className="w-full px-4 md:px-8 py-4 flex items-center justify-between z-30 relative bg-transparent">
          <button className="min-w-[50px] min-h-[50px] flex items-center justify-center rounded-2xl border shadow-lg backdrop-blur-xl bg-white/70 text-blue-600">
            <Volume2 className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5">
            {citizenUser ? (
              <div className="px-3.5 py-2 rounded-2xl border font-bold text-xs bg-emerald-50 text-emerald-800 flex items-center gap-1.5 backdrop-blur-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{citizenUser.name}</span>
              </div>
            ) : (
              <button 
                onClick={() => setIsCitizenAuthModalOpen(true)}
                className="px-3.5 py-2.5 rounded-2xl border font-bold text-xs bg-white/80 text-blue-700 backdrop-blur-xl shadow-lg"
              >
                🇮🇳 नागरिक लॉगिन (Sign In)
              </button>
            )}

            <button 
              onClick={() => navigateTo('#/admin')}
              className="px-3 py-2.5 rounded-2xl border font-bold text-xs bg-white/70 text-slate-700 backdrop-blur-xl shadow-lg"
            >
              🔒 Admin
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 flex flex-col justify-center py-6 z-10 relative">
          <div className="rounded-3xl p-6 md:p-8 flex flex-col items-center text-center backdrop-blur-2xl bg-white/75 border border-white/80 shadow-2xl">
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <span className="text-3xl">🏛️</span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">लोक स्वर</h1>
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white/80 text-blue-700 border border-blue-200">AC-134 SUNDARGARH</span>
            </div>

            <div className="w-full rounded-full p-2 pl-3.5 flex items-center gap-2.5 backdrop-blur-2xl bg-white/85 border border-white shadow-xl">
              <button className="min-w-[46px] min-h-[46px] rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                <Mic className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="बोलें, लिखें या अपनी समस्या बताएं..."
                className="flex-1 bg-transparent text-sm md:text-base font-bold px-2 outline-none border-none text-slate-900"
              />
              <button onClick={() => fileInputRef.current?.click()} className="min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center text-blue-600">
                <Camera className="w-5 h-5" />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm py-2.5 px-6 rounded-full flex items-center gap-1.5">
                <Search className="w-4 h-4" />
                <span>रिपोर्ट जमा करें</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
