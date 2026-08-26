/**
 * People's Priorities - Multi-Source Data Fusion & Evidence Engine Component
 * Connects Citizen Demand with Objective Registries and Flags Conflicting Realities.
 */

export function renderDataFusionView(state) {
  const datasets = state.datasets || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: var(--neutral-900);">
              🔗 Multi-Source Data Fusion & Discrepancy Detection Engine
            </h2>
            <div style="font-size: 0.85rem; color: var(--neutral-500); margin-top: 0.25rem;">
              Corroborates subjective citizen voice with survey-grade GIS, census demographics, health registers, and drone verification.
            </div>
          </div>

          <button class="btn btn-primary nav-tab" data-view="drone_simulator">
            🚁 Launch Verification Mission
          </button>
        </div>

        <!-- Tri-Factor Architecture Model Diagram -->
        <div class="evidence-matrix">
          <div class="evidence-box">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase;">Factor A: Citizen Demand</div>
            <div class="evidence-score-gauge">91/100</div>
            <div style="font-size: 0.8rem; color: var(--neutral-600);">412 Voice & Text Submissions</div>
            <div style="font-size: 0.72rem; color: var(--neutral-400); margin-top: 0.25rem;">Weight: 35% in Evidence Index</div>
          </div>

          <div class="evidence-box">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase;">Factor B: Objective GIS Data</div>
            <div class="evidence-score-gauge" style="color: var(--accent-indigo);">76/100</div>
            <div style="font-size: 0.8rem; color: var(--neutral-600);">PMGSY GIS + Satellite DEM</div>
            <div style="font-size: 0.72rem; color: var(--neutral-400); margin-top: 0.25rem;">Weight: 35% in Evidence Index</div>
          </div>

          <div class="evidence-box">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--neutral-500); text-transform: uppercase;">Factor C: Ground Reality / Drone</div>
            <div class="evidence-score-gauge" style="color: var(--accent-emerald);">88%</div>
            <div style="font-size: 0.8rem; color: var(--neutral-600);">Field Inspection & Drone CV</div>
            <div style="font-size: 0.72rem; color: var(--neutral-400); margin-top: 0.25rem;">Weight: 30% in Evidence Index</div>
          </div>
        </div>
      </div>

      <!-- DISCREPANCY DETECTION ALERT MATRIX -->
      <div class="card" style="border: 2px solid #fde047; background: #fefce8;">
        <div class="card-header" style="border-bottom-color: #fef08a;">
          <div>
            <div class="card-title" style="color: #854d0e;">
              <span>⚠️ Automated Discrepancy Detections (Citizen Perception vs Objective Data)</span>
            </div>
            <div class="card-subtitle" style="color: #a16207;">
              Identifies when administrative records look fine on paper, but ground access is physically severed.
            </div>
          </div>
          <span class="badge badge-discrepancy">3 Hotspots Flagged</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          <!-- Discrepancy Item 1 -->
          <div style="background: white; border: 1px solid #fef08a; border-radius: var(--radius-md); padding: 1rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <div style="font-weight: 700; color: #854d0e; font-size: 0.95rem;">
                🚨 Discrepancy #1: Kalyanpur Healthcare Access Route (Hotspot #1)
              </div>
              <span class="badge badge-critical">Severe Severance</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.82rem; margin-bottom: 0.75rem;">
              <div style="background: #fee2e2; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid #fca5a5;">
                <strong>Citizen Perception:</strong> "Nearest hospital is 24 km away; road completely blocked in rain."
              </div>
              <div style="background: #e0f2fe; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid #bae6fd;">
                <strong>Official GIS Record:</strong> "PMGSY Master Plan records operational all-weather BT road to Kalyanpur PHC within 4.2 km."
              </div>
            </div>

            <div style="font-size: 0.82rem; color: var(--neutral-700); line-height: 1.4;">
              <strong>Root-Cause Analysis:</strong> The road is recorded as operational, but two slab culverts washed out during monsoon flash flooding. While physically shown on maps, ambulances cannot cross the ditch.
            </div>

            <div style="margin-top: 0.75rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
              <button class="btn btn-primary nav-tab" data-view="drone_simulator" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;">
                🚁 Review Drone Video & Evidence →
              </button>
            </div>
          </div>

          <!-- Discrepancy Item 2 -->
          <div style="background: white; border: 1px solid #fef08a; border-radius: var(--radius-md); padding: 1rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
              <div style="font-weight: 700; color: #854d0e; font-size: 0.95rem;">
                🚨 Discrepancy #2: Jhirpani Jal Jeevan Mission Tap Coverage
              </div>
              <span class="badge badge-medium">Dry Infrastructure</span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.82rem; margin-bottom: 0.75rem;">
              <div style="background: #fee2e2; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid #fca5a5;">
                <strong>Citizen Perception:</strong> "No water from taps for 8 months; using muddy contaminated spring."
              </div>
              <div style="background: #e0f2fe; padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid #bae6fd;">
                <strong>Official IMIS Record:</strong> "JJM Portal lists Jhirpani as '100% Functional Tap Connected'."
              </div>
            </div>

            <div style="font-size: 0.82rem; color: var(--neutral-700); line-height: 1.4;">
              <strong>Root-Cause Analysis:</strong> Physical pipes and standposts were installed, but the solar submersible pump burned out. The grid is electrically dead, forcing tribal families onto fluoride-heavy shallow borewells.
            </div>
          </div>
        </div>
      </div>

      <!-- DATA SOURCE REGISTRY TABLE -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📚 Official Government Data Source Registry</div>
            <div class="card-subtitle">Transparent provenance, confidence ratings, and last update timestamps</div>
          </div>
        </div>

        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Source Name</th>
                <th>Dataset Name</th>
                <th>Source Authority</th>
                <th>Coverage</th>
                <th>Quality & Confidence</th>
                <th>Last Synced</th>
              </tr>
            </thead>
            <tbody>
              ${datasets.map(ds => `
                <tr>
                  <td><strong>${ds.source_name}</strong></td>
                  <td>${ds.dataset_name}</td>
                  <td><span class="badge" style="background: var(--neutral-100);">${ds.source_type}</span></td>
                  <td>${ds.geographic_coverage}</td>
                  <td>
                    <span class="badge badge-verified">${Math.round(ds.confidence * 100)}% Confidence</span>
                  </td>
                  <td>${ds.last_updated}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
