/**
 * People's Priorities - Interactive End-to-End Guided Demo Walkthrough
 * 1-Click step-by-step interactive demonstration of the core civic intelligence pipeline:
 * Voice Input -> AI Clustering -> GIS Hotspot -> Discrepancy Alert -> Drone Mission -> Verification -> Score Recalculation -> ₹10 Cr Portfolio Optimization.
 */

export const DEMO_STEPS = [
  {
    step: 1,
    id: "step-voice",
    title: "1. Multilingual Citizen Voice Intake",
    target_view: "citizen",
    desc: "A rural citizen from Kalyanpur speaks in Odia reporting an impassable flooded road cutting off the primary healthcare clinic. The AI voice engine transcribes, translates, and normalizes the request without requiring technical jargon.",
    action_label: "Simulate Odia Voice Input 🎙️",
    badge: "Input Layer"
  },
  {
    step: 2,
    id: "step-cluster",
    title: "2. AI Semantic Clustering (412 Reports)",
    target_view: "thematic_clusters",
    desc: "The Multilingual Embedding Pipeline groups 412 distinct reports submitted across Odia, Hindi, and English into the 'Road Infrastructure & Healthcare Connectivity' theme.",
    action_label: "View Semantic Clusters 🧠",
    badge: "NLP Intelligence"
  },
  {
    step: 3,
    id: "step-hotspot",
    title: "3. Spatial GIS Hotspot Detection",
    target_view: "gis_map",
    desc: "GIS engine identifies a critical demand density hotspot in Kalyanpur affecting 18,400 citizens with a 24 km detour to tertiary care.",
    action_label: "Inspect GIS Hotspot 🗺️",
    badge: "Spatial Analytics"
  },
  {
    step: 4,
    id: "step-discrepancy",
    title: "4. Data Fusion & Discrepancy Alert",
    target_view: "data_fusion",
    desc: "Government GIS records claim an operational all-weather BT road exists, but citizen reports claim total severance. System flags an automated discrepancy and recommends ground verification.",
    action_label: "Review Discrepancy Flag ⚠️",
    badge: "Data Fusion"
  },
  {
    step: 5,
    id: "step-drone",
    title: "5. Autonomous Drone Verification Mission",
    target_view: "drone_simulator",
    desc: "District Collector authorizes Garuda-V MAVLink autonomous drone survey over the corridor. Live Computer Vision detects submerged culvert collapse and subgrade washout. Evidence confidence jumps to 91% (Status: VERIFIED).",
    action_label: "Launch Drone Telemetry 🚁",
    badge: "Ground Reality"
  },
  {
    step: 6,
    id: "step-ranking",
    title: "6. Transparent Priority Recalculation (Score: 92.4)",
    target_view: "priority_ranking",
    desc: "With verified evidence and high life-safety impact, the transparent scoring formula recalculates the Kalyanpur All-Weather Road & Bridge project to Rank #1 with a score of 92.4/100.",
    action_label: "Inspect Score Breakdown ⚖️",
    badge: "Scoring Engine"
  },
  {
    step: 7,
    id: "step-portfolio",
    title: "7. Budget-Constrained MILP Portfolio Optimization",
    target_view: "portfolio_optimizer",
    desc: "Under an annual budget of ₹10.0 Crore, the Knapsack optimizer selects the top 5 highest-benefit projects benefiting 66,100 citizens, and transparently justifies why competing lower-benefit projects were excluded.",
    action_label: "Generate Recommended Portfolio 💰",
    badge: "Planning Output"
  }
];

export function renderGuidedDemoView(state) {
  const currentStepNum = state.demoStep || 1;
  const currentStep = DEMO_STEPS.find(s => s.step === currentStepNum) || DEMO_STEPS[0];

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- Guided Demo Master Controller Banner -->
      <div class="demo-stepper-bar">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
          <div>
            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #fbbf24; font-weight: 700;">
              End-to-End Showcase Tour • 7 Steps
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: white;">
              Scenario: From Kalyanpur Citizen Voice to ₹10 Cr Approved Plan
            </h2>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button id="btn-demo-prev" class="btn btn-secondary" style="font-size: 0.8rem; background: rgba(255,255,255,0.15); color: white; border-color: rgba(255,255,255,0.3);" ${currentStepNum === 1 ? 'disabled' : ''}>
              ← Previous Step
            </button>
            <button id="btn-demo-next" class="btn btn-primary" style="font-size: 0.8rem; background: #fbbf24; color: #1e1b4b; border: none; font-weight: 700;">
              ${currentStepNum === 7 ? '🎉 Complete Tour' : 'Next Step →'}
            </button>
          </div>
        </div>

        <!-- Step Indicator Pills -->
        <div class="demo-step-indicator">
          ${DEMO_STEPS.map(s => `
            <div class="demo-step-pill ${s.step === currentStepNum ? 'active' : s.step < currentStepNum ? 'completed' : ''}" data-step="${s.step}">
              ${s.step < currentStepNum ? '✓ ' : ''}${s.step}. ${s.title.split('.')[1] || s.title}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Active Step Spotlight Card -->
      <div class="card" style="border: 2px solid var(--primary-500); background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);">
        <div class="card-header">
          <div>
            <span class="badge badge-high" style="font-size: 0.7rem; margin-bottom: 0.25rem;">
              ${currentStep.badge}
            </span>
            <div class="card-title" style="font-size: 1.25rem;">
              ${currentStep.title}
            </div>
          </div>

          <button id="btn-execute-step-action" class="btn btn-primary" style="padding: 0.65rem 1.25rem; font-size: 0.9rem;">
            ${currentStep.action_label}
          </button>
        </div>

        <div style="font-size: 0.95rem; color: var(--neutral-700); line-height: 1.6; margin-bottom: 1.25rem;">
          ${currentStep.desc}
        </div>

        <div style="background: var(--neutral-50); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem;">
          <div style="color: var(--neutral-600);">
            💡 <em>Clicking the action button switches the UI live to that module and triggers the step.</em>
          </div>
          <div style="font-weight: 700; color: var(--primary-600);">
            Step ${currentStepNum} of 7
          </div>
        </div>
      </div>
    </div>
  `;
}
