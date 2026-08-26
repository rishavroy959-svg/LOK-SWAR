/**
 * People's Priorities - Drone Verification Mission & MAVLink Telemetry HUD Simulator
 * Simulates autonomous survey flight, live video feed, AI CV bounding boxes & cryptographic hash generation.
 */

export function renderDroneSimulatorView(state) {
  const telemetry = state.droneTelemetry || {
    status: "STANDBY_READY",
    drone_model: "Garuda-V MAVLink Hexacopter (Survey Class)",
    flight_controller: "ArduPilot v4.5 Companion Computer (Jetson Orin Nano)",
    altitude_m: 45.0,
    battery_pct: 94,
    speed_mps: 8.5,
    gps_fix: "3D RTK Fix (18 Sats)",
    current_lat: 22.1352,
    current_lng: 84.0451,
    flight_progress: 0,
    evidence_hash: "sha256:7f83b1657ff190209cba8e59048a609d57a2205562140a3e"
  };

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- Drone Mission Header -->
      <div class="card" style="padding: 1.5rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: var(--neutral-900);">
            🚁 Autonomous Drone Ground Verification Mission (MAVLink Simulator)
          </h2>
          <div style="font-size: 0.85rem; color: var(--neutral-500); margin-top: 0.25rem;">
            Evidence collection tool for inaccessible terrain & disputed infrastructure records.
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button id="btn-start-drone-mission" class="btn btn-primary" style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);">
            🚀 Launch 4.8 km Corridor Survey Flight
          </button>
        </div>
      </div>

      <!-- Drone HUD & Video Stream Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        <!-- Left: Live Drone Camera Stream with AI CV Bounding Boxes -->
        <div class="drone-hud-container">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1e293b; padding-bottom: 0.5rem;">
            <div style="font-weight: 700; color: #38bdf8;">
              LIVE TELEMETRY STREAM • MAVLink ID #42
            </div>
            <div style="display: flex; gap: 1rem; font-size: 0.78rem;">
              <span>ALT: <strong id="hud-alt" style="color: #67e8f9;">${telemetry.altitude_m} m</strong></span>
              <span>BAT: <strong id="hud-bat" style="color: #4ade80;">${telemetry.battery_pct}%</strong></span>
              <span>SPEED: <strong id="hud-spd" style="color: #67e8f9;">${telemetry.speed_mps} m/s</strong></span>
            </div>
          </div>

          <!-- Video Stream Box -->
          <div class="drone-feed-sim">
            <!-- Simulated Aerial Canvas -->
            <canvas id="drone-aerial-canvas" width="640" height="340" style="width: 100%; height: 100%; object-fit: cover;"></canvas>

            <!-- Telemetry Overlay Grid -->
            <div class="drone-telemetry-overlay">
              <div>LAT: ${telemetry.current_lat}° N | LNG: ${telemetry.current_lng}° E</div>
              <div>GSD: 2.1 cm/px | 4K MULTISPECTRAL</div>
            </div>

            <!-- Dynamic AI Computer Vision Bounding Boxes -->
            <div class="cv-bounding-box" style="top: 30%; left: 25%; width: 45%; height: 35%;">
              ⚠️ CRITICAL ROAD SUBGRADE EROSION [Confidence: 93%]
            </div>
            <div class="cv-bounding-box" style="top: 60%; left: 65%; width: 28%; height: 30%; border-color: #fbbf24; animation-delay: 0.5s;">
              ⚠️ CULVERT COLLAPSE & FLOOD INUNDATION [Confidence: 89%]
            </div>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; color: #94a3b8;">
            <div>Target: <strong>Kalyanpur to Brahmani Bridge Corridor</strong></div>
            <div style="color: #4ade80;">● AI Inference Engine: YOLO-Infrastructure-v8 Active</div>
          </div>
        </div>

        <!-- Right: Flight Mission Parameters & Cryptographic Proof -->
        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="card" style="padding: 1.25rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--neutral-800); margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.4rem;">
              Flight Mission Manifest
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.6rem; font-size: 0.82rem;">
              <div><strong>Mission ID:</strong> MSN-DRONE-882</div>
              <div><strong>Target Hotspot:</strong> HOT-01 (Kalyanpur Healthcare Access)</div>
              <div><strong>Created By:</strong> District Collector / Planning Officer</div>
              <div><strong>Verification Type:</strong> Multispectral Photogrammetry</div>
              <div><strong>Flight Path:</strong> 8 Pre-programmed Waypoints</div>
              <div><strong>Status:</strong> <span class="badge badge-low">SURVEY COMPLETED</span></div>
            </div>
          </div>

          <div class="card" style="padding: 1.25rem; background: var(--neutral-50);">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--neutral-800); margin-bottom: 0.5rem;">
              🔐 Evidence Cryptographic Provenance
            </div>
            <div style="font-size: 0.75rem; color: var(--neutral-600); word-break: break-all; font-family: var(--font-mono); background: white; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              ${telemetry.evidence_hash}
            </div>
            <div style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 600; margin-top: 0.5rem;">
              ✓ Immutable hash committed to DPC Planning Ledger
            </div>
            <div style="font-size: 0.78rem; color: var(--neutral-600); margin-top: 0.4rem;">
              Evidence Confidence boost: <strong>+23%</strong> (Calculated score updated to <strong>92.4/100</strong>).
            </div>
          </div>

          <button class="btn btn-primary nav-tab" data-view="priority_ranking" style="width: 100%; font-size: 0.85rem;">
            ⚖️ Proceed to Priority Ranking →
          </button>
        </div>
      </div>
    </div>
  `;
}
