/**
 * People's Priorities - Main Application Controller & State Orchestrator
 * "From People's Voices to Evidence-Based Development Decisions"
 */

import { CONSTITUENCY_INFO, DEMO_VILLAGES_AND_WARDS, DEMO_FACILITIES, MULTILINGUAL_SAMPLE_PHRASES, INITIAL_SUBMISSIONS } from './data/constituency_data.js';
import { OfflineStore } from './services/offline_store.js';
import { AudioAIEngine } from './services/audio_ai.js';
import { ComputerVisionAIEngine } from './services/cv_ai.js';
import { EvidenceFusionEngine } from './services/evidence_fusion.js';
import { PortfolioOptimizerEngine } from './services/optimizer.js';
import { AnimationSystem } from './services/animation_system.js';

import { renderHeader } from './components/header.js';
import { renderCitizenView } from './components/citizen_view.js';
import { renderAdminOverview } from './components/admin_overview.js';
import { renderGISMapView } from './components/gis_map.js';
import { renderThematicClusters } from './components/thematic_clusters.js';
import { renderDataFusionView } from './components/data_fusion.js';
import { renderFieldOfficerView } from './components/field_officer.js';
import { renderDroneSimulatorView } from './components/drone_simulator.js';
import { renderPriorityRankingView } from './components/priority_ranking.js';
import { renderPortfolioOptimizerView } from './components/portfolio_optimizer.js';
import { renderAuditLogView } from './components/audit_log.js';
import { renderGuidedDemoView, DEMO_STEPS } from './components/guided_demo.js';

const CIVIC_BACKGROUNDS = [
  'assets/bg_1_smart_village.jpg',
  'assets/bg_2_smart_odisha.jpg',
  'assets/bg_3_smart_bengal.jpg'
];

function applyRandomCivicBackground() {
  const chosenBg = CIVIC_BACKGROUNDS[Math.floor(Math.random() * CIVIC_BACKGROUNDS.length)];
  document.documentElement.style.setProperty('--active-bg-image', `url('${chosenBg}')`);
  if (document.body) {
    document.body.style.backgroundImage = `url('${chosenBg}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
  }
}

class App {
  constructor() {
    this.audioAI = new AudioAIEngine();
    this.cvAI = new ComputerVisionAIEngine();
    this.evidenceFusion = new EvidenceFusionEngine();
    this.optimizer = new PortfolioOptimizerEngine();
    this.animSystem = new AnimationSystem();

    this.offlineStore = new OfflineStore((syncedItems) => {
      this.showToast(`Synced ${syncedItems.length} offline citizen reports with District Office.`, 'Offline Sync Complete', '📡');
      this.refreshData();
    });

    // Main Reactive State
    this.state = {
      currentView: 'citizen',
      currentLang: 'Hindi',
      isExtremeRural: false,
      networkStatus: this.offlineStore.getEffectiveNetworkStatus(),
      isCitizenDrawerOpen: false,
      isAudioRecording: false,
      currentCitizenText: '',
      photoPreviewUrl: null,
      currentExtractedNLP: null,
      userReports: this.offlineStore.getUserReports(),
      
      submissions: INITIAL_SUBMISSIONS,
      clusters: [],
      hotspots: [],
      datasets: [],
      projects: [],
      auditLogs: [],
      
      selectedHotspot: null,
      budgetCr: 10.0,
      showWeightsConfig: false,
      rankingWeights: { ...this.optimizer.defaultWeights },
      optimizationResult: null,
      activeExplainProjectId: null,
      demoStep: 1,
      isNightMode: false,
      isNotifOpen: false,
      unreadNotifCount: 3,

      droneTelemetry: {
        status: "STANDBY",
        altitude_m: 45.0,
        battery_pct: 94,
        speed_mps: 8.5,
        current_lat: 22.1352,
        current_lng: 84.0451,
        evidence_hash: "sha256:7f83b1657ff190209cba8e59048a609d57a2205562140a3e"
      }
    };

    this.leafletMap = null;
    this.mapLayers = {};
  }

  async init() {
    console.log("Initializing People's Priorities Platform with GSAP 3 Physics...");
    applyRandomCivicBackground();
    if (this.animSystem) this.animSystem.init();
    await this.fetchInitialData();
    this.runOptimization();
    this.render();
    this.bindGlobalEvents();
  }

  async fetchInitialData() {
    try {
      const [resSub, resClu, resHot, resDat, resPrj, resAud] = await Promise.all([
        fetch('/api/submissions?limit=1250').then(r => r.json()).catch(() => null),
        fetch('/api/clusters').then(r => r.json()).catch(() => null),
        fetch('/api/hotspots').then(r => r.json()).catch(() => null),
        fetch('/api/datasets').then(r => r.json()).catch(() => null),
        fetch('/api/projects').then(r => r.json()).catch(() => null),
        fetch('/api/audit').then(r => r.json()).catch(() => null)
      ]);

      if (resSub && resSub.submissions) this.state.submissions = resSub.submissions;
      if (resClu && resClu.clusters) this.state.clusters = resClu.clusters;
      if (resHot && resHot.hotspots) {
        this.state.hotspots = resHot.hotspots;
        this.state.selectedHotspot = resHot.hotspots[0];
      }
      if (resDat && resDat.datasets) this.state.datasets = resDat.datasets;
      if (resPrj && resPrj.projects) this.state.projects = resPrj.projects;
      if (resAud && resAud.logs) this.state.auditLogs = resAud.logs;

    } catch (e) {
      console.warn("Backend API unavailable or running offline; using bundled datasets", e);
    }
  }

  runOptimization() {
    this.state.optimizationResult = this.optimizer.optimizePortfolio(
      this.state.projects,
      this.state.budgetCr,
      this.state.rankingWeights,
      { min_rural: 2 }
    );
  }

  render() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    if (this.state.isExtremeRural) {
      document.body.classList.add('extreme-rural-mode');
    } else {
      document.body.classList.remove('extreme-rural-mode');
    }

    if (this.state.isNightMode) {
      document.body.classList.add('night-mode');
    } else {
      document.body.classList.remove('night-mode');
    }

    let viewHtml = '';
    switch (this.state.currentView) {
      case 'citizen':
        viewHtml = renderCitizenView(this.state);
        break;
      case 'admin_overview':
        viewHtml = renderAdminOverview(this.state);
        break;
      case 'gis_map':
        viewHtml = renderGISMapView(this.state);
        break;
      case 'thematic_clusters':
        viewHtml = renderThematicClusters(this.state);
        break;
      case 'data_fusion':
        viewHtml = renderDataFusionView(this.state);
        break;
      case 'field_officer':
        viewHtml = renderFieldOfficerView(this.state);
        break;
      case 'drone_simulator':
        viewHtml = renderDroneSimulatorView(this.state);
        break;
      case 'priority_ranking':
        viewHtml = renderPriorityRankingView(this.state);
        break;
      case 'portfolio_optimizer':
        viewHtml = renderPortfolioOptimizerView(this.state);
        break;
      case 'audit_log':
        viewHtml = renderAuditLogView(this.state);
        break;
      case 'guided_demo':
        viewHtml = renderGuidedDemoView(this.state);
        break;
      default:
        viewHtml = renderCitizenView(this.state);
    }

    appEl.innerHTML = `
      ${renderHeader(this.state)}
      <main class="main-container">
        ${viewHtml}
      </main>
      <div id="toast-container" class="toast-container"></div>
    `;

    this.postRender();
  }

  postRender() {
    this.bindViewEvents();

    // GSAP Drawer animation if opened
    if (this.state.isCitizenDrawerOpen && this.animSystem) {
      const drawer = document.getElementById('global-nav-drawer') || document.querySelector('.citizen-drawer');
      const overlay = document.getElementById('citizen-drawer-backdrop');
      if (drawer) this.animSystem.animateDrawerOpen(drawer, overlay);
    }

    if (this.state.currentView === 'gis_map') {
      setTimeout(() => this.initLeafletMap(), 100);
    }
  }

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      // Nav Tab switching
      const tab = e.target.closest('.nav-tab');
      if (tab) {
        const view = tab.dataset.view;
        if (view) {
          this.state.currentView = view;
          this.state.isCitizenDrawerOpen = false;
          this.render();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }

      // Drawer opening from 3-lines [≡] or 3-dots [⋮]
      if (e.target.closest('#btn-open-citizen-drawer') || e.target.closest('#btn-three-dots-menu') || e.target.closest('.btn-open-drawer')) {
        this.state.isCitizenDrawerOpen = true;
        this.render();
        return;
      }

      // Drawer closing
      if (e.target.closest('#btn-close-citizen-drawer') || e.target.id === 'citizen-drawer-backdrop') {
        this.state.isCitizenDrawerOpen = false;
        this.render();
        return;
      }

      // Toggle Soft Blue Night Mode
      if (e.target.closest('#btn-toggle-night-mode')) {
        this.state.isNightMode = !this.state.isNightMode;
        this.showToast(this.state.isNightMode ? '🌙 Cinematic Night Mode Activated' : '☀️ Light Mode Activated');
        this.render();
        return;
      }

      // Toggle Notifications
      if (e.target.closest('#btn-toggle-notifications')) {
        this.state.isNotifOpen = !this.state.isNotifOpen;
        this.state.unreadNotifCount = 0;
        this.render();
      }

      if (e.target.closest('#btn-close-notif')) {
        this.state.isNotifOpen = false;
        this.render();
      }

      // Toggle Rural Mode
      if (e.target.closest('#btn-toggle-rural-contrast')) {
        this.state.isExtremeRural = !this.state.isExtremeRural;
        this.render();
      }

      // Network toggle simulation
      if (e.target.closest('#btn-network-status')) {
        const modes = ['online', 'low-bandwidth', 'offline'];
        const current = this.offlineStore.simulatedNetworkMode;
        const next = modes[(modes.indexOf(current) + 1) % modes.length];
        this.offlineStore.setSimulatedNetwork(next);
        this.state.networkStatus = this.offlineStore.getEffectiveNetworkStatus();
        this.showToast(`Network switched to: ${this.state.networkStatus.label}`);
        this.render();
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.id === 'select-app-language' || e.target.id === 'drawer-select-lang') {
        this.state.currentLang = e.target.value;
        this.showToast(`Language set to ${this.state.currentLang}`);
        this.render();
      }
    });
  }

  bindViewEvents() {
    // 1. Drawer Open/Close
    const btnOpenDrawer = document.getElementById('btn-open-citizen-drawer');
    if (btnOpenDrawer) {
      btnOpenDrawer.onclick = () => {
        this.state.isCitizenDrawerOpen = true;
        this.render();
      };
    }

    const btnCloseDrawer = document.getElementById('btn-close-citizen-drawer');
    const drawerBackdrop = document.getElementById('citizen-drawer-backdrop');
    if (btnCloseDrawer) btnCloseDrawer.onclick = () => { this.state.isCitizenDrawerOpen = false; this.render(); };
    if (drawerBackdrop) {
      drawerBackdrop.onclick = (e) => {
        if (e.target === drawerBackdrop) {
          this.state.isCitizenDrawerOpen = false;
          this.render();
        }
      };
    }

    // 2. Read Aloud Top Button
    const btnReadAloudTop = document.getElementById('btn-read-aloud-top');
    if (btnReadAloudTop) {
      btnReadAloudTop.onclick = () => {
        const promptText = this.state.currentLang === "Odia"
          ? "ଲୋକ ସ୍ୱର ନାଗରିକ ସେବାକୁ ସ୍ୱାଗତ। ମାଇକ୍ ବଟନ୍ ଦବାଇ ଆପଣଙ୍କ ସମସ୍ୟା କୁହନ୍ତୁ କିମ୍ବା କ୍ୟାମେରା ବଟନ୍ ଦବାନ୍ତୁ।"
          : this.state.currentLang === "English"
          ? "Welcome to Lok Swar. Tap the microphone button to speak your issue, or attach a photo, then press submit."
          : "लोक स्वर में आपका स्वागत है। माइक बटन दबाकर अपनी समस्या बोलें या कैमरा से फोटो लें और नीचे बटन दबाकर रिपोर्ट भेजें।";
        this.audioAI.speakText(promptText, this.state.currentLang);
        this.showToast("🔊 Reading instructions aloud...");
      };
    }

    // 3. Gemini-Style Mic Toggle
    const btnGeminiMic = document.getElementById('btn-gemini-mic');
    if (btnGeminiMic) {
      btnGeminiMic.onclick = async () => {
        if (!this.state.isAudioRecording) {
          this.state.isAudioRecording = true;
          this.render();
          await this.audioAI.startRecording(document.getElementById('audio-waveform'), (blob) => {
            console.log("Audio recording captured, size:", blob.size);
          });
        } else {
          this.audioAI.stopRecording();
          this.state.isAudioRecording = false;
          this.state.currentCitizenText = this.state.currentLang === 'Odia'
            ? "ଆମ ଗାଁ କଲ୍ୟାଣପୁରରୁ ଡାକ୍ତରଖାନା ଯିବା ରାସ୍ତା ବର୍ଷାରେ ଭାଙ୍ଗିଯାଇଛି।"
            : "हमारे गांव कल्याणपुर से अस्पताल जाने वाली सड़क बारिश में बह गई है।";

          this.state.currentExtractedNLP = this.audioAI.extractEntitiesFromVoice(
            this.state.currentCitizenText,
            this.state.currentLang
          );
          this.render();
        }
      };
    }

    // 4. Gemini-Style Camera
    const btnGeminiCamera = document.getElementById('btn-gemini-camera');
    const inputGeminiCamera = document.getElementById('gemini-camera-input');
    if (btnGeminiCamera && inputGeminiCamera) {
      btnGeminiCamera.onclick = () => inputGeminiCamera.click();
      inputGeminiCamera.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          this.state.photoPreviewUrl = URL.createObjectURL(file);
          this.showToast("📷 Photograph attached as evidence.");
          this.render();
        }
      };
    }

    const btnRemovePhoto = document.getElementById('btn-remove-photo-preview');
    if (btnRemovePhoto) {
      btnRemovePhoto.onclick = () => {
        this.state.photoPreviewUrl = null;
        this.render();
      };
    }

    // 5. Gemini-Style Submit Action
    const btnGeminiSubmit = document.getElementById('btn-gemini-submit');
    const inputGeminiText = document.getElementById('gemini-text-input');
    if (inputGeminiText) {
      inputGeminiText.oninput = (e) => {
        this.state.currentCitizenText = e.target.value;
      };
    }

    if (btnGeminiSubmit) {
      btnGeminiSubmit.onclick = () => {
        const textVal = inputGeminiText ? inputGeminiText.value : this.state.currentCitizenText;
        if (!textVal && !this.state.photoPreviewUrl) {
          this.showToast("🎙️ Please speak or type your problem first.");
          const promptText = "कृपया पहले माइक दबाकर अपनी समस्या बोलें।";
          this.audioAI.speakText(promptText, this.state.currentLang);
          return;
        }

        const newSubmission = {
          id: `SUB-${1000 + this.state.submissions.length + 1}`,
          category: this.state.currentExtractedNLP?.category || "Roads",
          sub_category: this.state.currentExtractedNLP?.sub_category || "Rural Road Connectivity",
          issue_description: textVal || "Citizen reported development priority.",
          administrative_area: "Kalyanpur Gram Panchayat",
          severity: "Critical",
          language: this.state.currentLang,
          is_assisted: false,
          verification_status: "Unverified"
        };

        if (this.state.networkStatus.status === 'offline') {
          this.offlineStore.saveOfflineSubmission(newSubmission);
          this.state.userReports = this.offlineStore.getUserReports();
          this.showToast("📶 Saved offline on phone. Will send when online!");
        } else {
          this.offlineStore.saveUserReport(newSubmission);
          this.state.submissions.unshift(newSubmission);
          this.state.userReports = this.offlineStore.getUserReports();
          this.showToast("🚀 Report successfully submitted to District Office!");
        }

        this.state.currentCitizenText = '';
        this.state.currentExtractedNLP = null;
        this.state.photoPreviewUrl = null;
        this.render();
      };
    }

    // 6. Quick Sample Phrases
    document.querySelectorAll('.btn-sample-phrase').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.dataset.index);
        const sample = MULTILINGUAL_SAMPLE_PHRASES[idx];
        this.state.currentCitizenText = sample.text;
        this.state.currentExtractedNLP = {
          detected_language: sample.lang,
          transcription: sample.text,
          english_translation: sample.translation,
          category: sample.category.split('&')[0].trim(),
          sub_category: sample.category,
          severity: sample.severity,
          location: sample.location,
          affected_population_estimate: 18400,
          potential_impact: sample.impact,
          confidence: 0.94,
          normalized_issue: sample.translation
        };
        this.render();
      };
    });

    // 7. Drawer Navigation
    const drawerStatus = document.getElementById('drawer-menu-status');
    if (drawerStatus) {
      drawerStatus.onclick = () => {
        this.state.isCitizenDrawerOpen = false;
        this.showToast(`Showing your ${this.state.userReports.length} submitted reports.`);
        this.render();
      };
    }

    const drawerSuggest = document.getElementById('drawer-menu-suggest');
    if (drawerSuggest) {
      drawerSuggest.onclick = () => {
        this.state.isCitizenDrawerOpen = false;
        this.state.currentCitizenText = this.state.currentLang === 'Odia'
          ? 'ଆମ ଗାଁରେ ଏକ ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ନିର୍ମାଣ ପାଇଁ ଅନୁରୋଧ।'
          : 'हमारे गांव में प्राथमिक स्वास्थ्य केंद्र का निर्माण किया जाए।';
        this.render();
      };
    }

    // 8. GIS Hotspot Item click
    document.querySelectorAll('.hotspot-list-item').forEach(item => {
      item.onclick = () => {
        const hid = item.dataset.hotspotId;
        this.state.selectedHotspot = this.state.hotspots.find(h => h.id === hid);
        this.render();
        if (this.leafletMap && this.state.selectedHotspot) {
          this.leafletMap.flyTo([this.state.selectedHotspot.lat, this.state.selectedHotspot.lng], 13);
        }
      };
    });

    // 9. Drone Mission Simulator Launch
    const btnStartDrone = document.getElementById('btn-start-drone-mission');
    if (btnStartDrone) {
      btnStartDrone.onclick = () => {
        this.showToast("🚁 Garuda-V MAVLink drone survey launched over Kalyanpur corridor!");
        let alt = 45;
        let bat = 94;
        const interval = setInterval(() => {
          alt = (40 + Math.random() * 8).toFixed(1);
          bat = Math.max(10, bat - 1);
          const altEl = document.getElementById('hud-alt');
          const batEl = document.getElementById('hud-bat');
          if (altEl) altEl.innerText = `${alt} m`;
          if (batEl) batEl.innerText = `${bat}%`;
        }, 1000);

        setTimeout(() => {
          clearInterval(interval);
          this.showToast("✅ Drone Survey Complete: 42 Orthophotos georeferenced. Bridge washout verified (+23% confidence).");
        }, 4000);
      };
    }

    // 10. Weight Config Sliders
    const btnToggleWeight = document.getElementById('btn-toggle-weight-config');
    if (btnToggleWeight) {
      btnToggleWeight.onclick = () => {
        this.state.showWeightsConfig = !this.state.showWeightsConfig;
        this.render();
      };
    }

    document.querySelectorAll('.weight-slider').forEach(slider => {
      slider.oninput = (e) => {
        const weightKey = e.target.dataset.weight;
        const val = parseFloat(e.target.value) / 100.0;
        this.state.rankingWeights[weightKey] = val;
        this.runOptimization();
        this.render();
      };
    });

    // 11. Explainability Modal Triggers
    document.querySelectorAll('.btn-explain-project').forEach(btn => {
      btn.onclick = () => {
        this.state.activeExplainProjectId = btn.dataset.projectId;
        this.render();
      };
    });

    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnCloseModalFooter = document.getElementById('btn-close-modal-footer');
    if (btnCloseModal) btnCloseModal.onclick = () => { this.state.activeExplainProjectId = null; this.render(); };
    if (btnCloseModalFooter) btnCloseModalFooter.onclick = () => { this.state.activeExplainProjectId = null; this.render(); };

    // 12. Budget Slider
    const budgetSlider = document.getElementById('input-budget-slider');
    if (budgetSlider) {
      budgetSlider.oninput = (e) => {
        this.state.budgetCr = parseFloat(e.target.value);
        this.runOptimization();
        this.render();
      };
    }

    // 13. Guided Demo Stepper Buttons
    const btnDemoPrev = document.getElementById('btn-demo-prev');
    const btnDemoNext = document.getElementById('btn-demo-next');
    const btnExecuteStep = document.getElementById('btn-execute-step-action');

    if (btnDemoPrev) {
      btnDemoPrev.onclick = () => {
        this.state.demoStep = Math.max(1, this.state.demoStep - 1);
        this.render();
      };
    }

    if (btnDemoNext) {
      btnDemoNext.onclick = () => {
        if (this.state.demoStep < DEMO_STEPS.length) {
          this.state.demoStep++;
          this.render();
        } else {
          this.showToast("🎉 Guided tour completed! You have experienced the full pipeline.");
        }
      };
    }

    if (btnExecuteStep) {
      btnExecuteStep.onclick = () => {
        const current = DEMO_STEPS.find(s => s.step === this.state.demoStep);
        if (current) {
          this.state.currentView = current.target_view;
          if (current.step === 1) {
            const sample = MULTILINGUAL_SAMPLE_PHRASES[0];
            this.state.currentCitizenText = sample.text;
            this.state.currentExtractedNLP = {
              detected_language: sample.lang,
              transcription: sample.text,
              english_translation: sample.translation,
              category: "Roads",
              sub_category: "Healthcare Access & Road Connectivity",
              severity: "Critical",
              location: "Kalyanpur Gram Panchayat",
              affected_population_estimate: 18400,
              potential_impact: sample.impact,
              confidence: 0.94,
              normalized_issue: sample.translation
            };
          }
          this.render();
        }
      };
    }

    document.querySelectorAll('.demo-step-pill').forEach(pill => {
      pill.onclick = () => {
        this.state.demoStep = parseInt(pill.dataset.step);
        this.render();
      };
    });
  }

  initLeafletMap() {
    const mapEl = document.getElementById('gis-leaflet-map');
    if (!mapEl || typeof L === 'undefined') return;

    if (this.leafletMap) {
      this.leafletMap.remove();
    }

    this.leafletMap = L.map('gis-leaflet-map').setView([22.1800, 84.1000], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors | Gov GIS'
    }).addTo(this.leafletMap);

    this.state.hotspots.forEach(h => {
      const circle = L.circle([h.lat, h.lng], {
        color: '#e11d48',
        fillColor: '#f43f5e',
        fillOpacity: 0.25,
        radius: (h.radius_km || 3.0) * 1000
      }).addTo(this.leafletMap);

      circle.bindPopup(`
        <div style="font-family: sans-serif;">
          <strong style="color: #e11d48;">🔥 ${h.title}</strong><br>
          <b>Citizen Demand:</b> ${h.reports_count} reports<br>
          <b>Population Impact:</b> ${h.population_affected?.toLocaleString()} citizens<br>
          <b>Gap:</b> ${h.infrastructure_gap}<br>
          <hr style="margin: 4px 0;">
          <small style="color: #ca8a04;"><b>⚠️ Discrepancy:</b> ${h.discrepancy_alert || 'None'}</small>
        </div>
      `);
    });

    DEMO_FACILITIES.forEach(f => {
      const iconHtml = f.type.includes('Health') ? '🏥' : f.type.includes('Education') ? '🏫' : f.type.includes('Water') ? '💧' : '🏢';
      const customIcon = L.divIcon({
        html: `<div style="font-size: 20px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${iconHtml}</div>`,
        className: 'custom-leaflet-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker([f.lat, f.lng], { icon: customIcon }).addTo(this.leafletMap)
        .bindPopup(`<strong>${f.name}</strong><br>Type: ${f.type}<br>Status: ${f.status}`);
    });

    const droneWaypoints = [
      [22.1220, 84.0300],
      [22.1260, 84.0350],
      [22.1350, 84.0450],
      [22.1480, 84.0600]
    ];
    L.polyline(droneWaypoints, { color: '#0284c7', weight: 3, dashArray: '6, 8' }).addTo(this.leafletMap)
      .bindPopup("<strong>Garuda-V MAVLink Drone Flight Survey Corridor</strong>");
  }

  showToast(message, title = "Civic Alert", icon = "🏛️") {
    if (this.animSystem && typeof this.animSystem.showNotification === 'function') {
      this.animSystem.showNotification({ title, message, icon });
    } else {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerText = message;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});
