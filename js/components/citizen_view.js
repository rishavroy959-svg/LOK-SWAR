/**
 * People's Priorities - Citizen Intake Interface
 * Gemini-Style Hyper-Minimal Zero-Literacy PWA Mode + Slide-Out Drawer & Audio-First UX
 */

import { DEMO_VILLAGES_AND_WARDS, MULTILINGUAL_SAMPLE_PHRASES } from '../data/constituency_data.js';

export function renderCitizenView(state) {
  const isExtremeRural = state.isExtremeRural;
  const reports = state.userReports || [];
  const isDrawerOpen = state.isCitizenDrawerOpen || false;
  const isRecording = state.isAudioRecording || false;
  const nlp = state.currentExtractedNLP;
  const photoPreview = state.photoPreviewUrl;

  const currentLang = state.currentLang || 'Hindi';
  const langKey = currentLang.toLowerCase();

  const labels = {
    brand: currentLang === 'Odia' ? 'ଲୋକ ସ୍ୱର' : currentLang === 'Hindi' ? 'लोक स्वर' : "Lok Swar",
    subBrand: `OFFICIAL CIVIC INTELLIGENCE • ${localStorage.getItem('lok_swar_user_location_name') ? localStorage.getItem('lok_swar_user_location_name').toUpperCase() : 'LIVE LOCATION'}`,
    placeholder: currentLang === 'Odia' ? 'କୁହନ୍ତୁ, ଲେଖନ୍ତୁ କିମ୍ବା ସମସ୍ୟା ରେକର୍ଡ କରନ୍ତୁ...' : currentLang === 'Hindi' ? 'बोलें, लिखें या अपनी समस्या रिकॉर्ड करें...' : 'Speak, type, or record your problem here...',
    submitBtn: currentLang === 'Odia' ? '🔍 ରିପୋର୍ଟ ଦାଖଲ କରନ୍ତୁ / SUBMIT REPORT' : currentLang === 'Hindi' ? '🔍 रिपोर्ट जमा करें / SUBMIT REPORT' : '🔍 SUBMIT REPORT / रिपोर्ट जमा करें',
    readAloudText: currentLang === 'Odia'
      ? 'ଲୋକ ସ୍ୱର ନାଗରିକ ସେବାକୁ ସ୍ୱାଗତ। ମାଇକ୍ ବଟନ୍ ଦବାଇ ଆପଣଙ୍କ ସମସ୍ୟା କୁହନ୍ତୁ କିମ୍ବା ଫଟୋ ଦେଇ ସବୁଜ ବଟନ୍ ଦବାନ୍ତୁ।'
      : 'लोक स्वर नागरिक सेवा में आपका स्वागत है। माइक बटन दबाकर अपनी समस्या बोलें, या कैमरा बटन से फोटो लगाएं, फिर हरा बटन दबाकर रिपोर्ट जमा करें।'
  };

  return `
    <div class="zero-literacy-wrapper" style="max-width: 680px; margin: 0 auto; min-height: 75vh; display: flex; flex-direction: column; justify-content: center; position: relative;">
      
      <!-- CENTRAL INTAKE CARD -->
      <div class="card" style="background: var(--bg-surface); border: 2px solid var(--border-subtle); border-radius: 28px; padding: 2rem; box-shadow: var(--shadow-xl); position: relative; margin-bottom: 1.5rem;">
        
        <!-- Card Top: Centered Title + Top-Right 🔊 Button -->
        <div style="position: relative; text-align: center; margin-bottom: 1.75rem;">
          <div style="display: flex; flex-direction: column; items-center; justify-content: center;">
            <div style="font-family: var(--font-heading); font-size: 1.85rem; font-weight: 900; color: var(--gov-green-dark); display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
              <span>🏛️</span> ${labels.brand}
            </div>
            <div style="font-size: 0.72rem; color: var(--neutral-500); font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 0.25rem;">
              ${labels.subBrand}
            </div>
          </div>

          <!-- Top-Right Multilingual Audio Readout Button (🔊) -->
          <button id="btn-read-aloud-top" class="btn btn-outline" style="position: absolute; top: 0; right: 0; width: 48px; height: 48px; border-radius: 14px; font-size: 1.3rem; display: flex; align-items: center; justify-content: center; border-color: var(--gov-border-green); color: var(--gov-green-dark); background: var(--gov-green-mint); cursor: pointer;" aria-label="Read screen aloud in selected language" title="🔊 Listen (Hindi/Odia/English)">
            🔊
          </button>
        </div>
        
        <!-- Attached Photo Preview Thumbnail -->
        ${photoPreview ? `
          <div style="align-self: center; margin-bottom: 1rem; position: relative; border-radius: 16px; overflow: hidden; border: 2px solid var(--primary-500); box-shadow: var(--shadow-md);">
            <img src="${photoPreview}" alt="Evidence Capture" style="width: 180px; height: 120px; object-fit: cover; display: block;">
            <button id="btn-remove-photo-preview" style="position: absolute; top: 4px; right: 4px; background: rgba(15,23,42,0.85); color: white; border: none; border-radius: 50%; width: 26px; height: 26px; cursor: pointer;">✕</button>
            <div style="background: rgba(15,23,42,0.85); color: #93c5fd; font-size: 0.68rem; text-align: center; padding: 2px 0;">📷 Evidence Attached</div>
          </div>
        ` : ''}

        <!-- Live Waveform Canvas (Shown when recording) -->
        ${isRecording ? `
          <div style="background: var(--neutral-900); border: 2px solid #ef4444; border-radius: 20px; padding: 0.75rem; margin-bottom: 1rem; text-align: center;">
            <div style="color: #f87171; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.25rem; animation: pulse 1s infinite;">
              🔴 Recording Audio... Speak now / अपनी समस्या बोलें
            </div>
            <canvas id="audio-waveform" width="500" height="60" style="width: 100%; height: 50px; border-radius: 12px; background: #020617;"></canvas>
          </div>
        ` : ''}

        <!-- GEMINI-STYLE UNIFIED SEARCH INPUT CONTAINER (High Contrast in both Day and Night Mode) -->
        <div style="background: var(--bg-surface); border: 2px solid ${isRecording ? '#ef4444' : 'var(--border-medium)'}; border-radius: 20px; padding: 0.5rem; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-lg); margin-bottom: 1.25rem; transition: border-color 0.3s ease, box-shadow 0.3s ease;">
          
          <!-- Left: Extra-Large Mic Button (Minimum 56px Touch Target) with Fluid Ripple -->
          <div style="position: relative;">
            ${isRecording ? `
              <span style="position: absolute; inset: -4px; border-radius: 18px; background: rgba(239, 68, 68, 0.4); animation: fluidRipple 1.8s infinite;"></span>
            ` : ''}
            <button id="btn-gemini-mic" class="btn" style="position: relative; width: 58px; height: 58px; border-radius: 14px; font-size: 1.6rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: ${isRecording ? '#dc2626' : 'var(--bg-surface-elevated)'}; color: ${isRecording ? 'white' : 'var(--gov-green-dark)'}; border: 1px solid var(--border-medium); box-shadow: var(--shadow-sm); cursor: pointer; transition: transform 0.15s ease;" aria-label="Microphone Voice Input">
              ${isRecording ? '⏹' : '🎙️'}
            </button>
          </div>

          <!-- Middle: Plain Text Input (Large 18px+ font, crystal clear in Night Mode) -->
          <input type="text" id="gemini-text-input" value="${state.currentCitizenText || ''}" placeholder="${labels.placeholder}" style="flex: 1; border: none; outline: none; background: transparent; font-size: 1.15rem; font-weight: 600; color: var(--neutral-900) !important; padding: 0.5rem 0.25rem;">

          <!-- Right: Camera Button (Minimum 56px Touch Target) -->
          <button id="btn-gemini-camera" class="btn" style="width: 58px; height: 58px; border-radius: 14px; font-size: 1.6rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--bg-surface-elevated); color: var(--gov-green-dark); border: 1px solid var(--border-medium); cursor: pointer; transition: transform 0.15s ease;" aria-label="Camera Evidence Capture">
            📷
          </button>
          <input type="file" id="gemini-camera-input" accept="image/*" capture="environment" style="display: none;">
        </div>

        <!-- FULL-WIDTH 56px+ HIGH-CONTRAST ACTION BUTTON WITH HOVER LIFT -->
        <button id="btn-gemini-submit" class="btn" style="width: 100%; min-height: 62px; border-radius: 16px; font-size: 1.2rem; font-weight: 800; background: var(--gov-green-dark); color: white; border: 1px solid var(--gov-green-medium); box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2); display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease; cursor: pointer;">
          <span>${labels.submitBtn}</span>
        </button>

        <!-- Quick 1-Click Regional Voice Simulation Chips -->
        <div style="margin-top: 1.5rem; text-align: center;">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase; margin-bottom: 0.5rem;">
            ⚡ Or test one-touch voice samples:
          </div>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 0.4rem;">
            ${MULTILINGUAL_SAMPLE_PHRASES.map((sample, idx) => `
              <button class="btn btn-outline btn-sample-phrase" data-index="${idx}" style="font-size: 0.75rem; padding: 0.35rem 0.65rem; border-radius: var(--radius-full);">
                🗣️ ${sample.lang}: "${sample.text.substring(0, 24)}..."
              </button>
            `).join('')}
          </div>
        </div>

        </div>
      </div> <!-- End Central Intake Card -->
    </div>
  `;
}
