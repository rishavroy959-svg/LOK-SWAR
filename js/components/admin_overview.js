/**
 * People's Priorities - Government & Administrator Overview Component
 * Shows Constituency KPIs, Thematic Breakdown, Evidence Health & Action Center.
 */

import { CONSTITUENCY_INFO } from '../data/constituency_data.js';

export function renderAdminOverview(state) {
  const submissions = state.submissions || [];
  const clusters = state.clusters || [];
  const hotspots = state.hotspots || [];
  const projects = state.projects || [];

  const verifiedCount = submissions.filter(s => s.verification_status === 'Verified').length;
  const verifiedPct = Math.round((verifiedCount / Math.max(1, submissions.length)) * 100);

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- Top Banner -->
      <div style="background: linear-gradient(135deg, var(--primary-900) 0%, var(--primary-800) 100%); color: white; padding: 1.5rem; border-radius: var(--radius-lg); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; box-shadow: var(--shadow-md);">
        <div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <span style="font-size: 1.5rem;">🏛️</span>
            <h2 style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 700;">
              ${CONSTITUENCY_INFO.name}
            </h2>
          </div>
          <div style="font-size: 0.85rem; color: #94a3b8;">
            Civic Intelligence & Development Planning Hub | District Planning Committee (DPC)
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-primary nav-tab" data-view="gis_map" style="border-radius: var(--radius-md);">
            🗺️ View Hotspot Map
          </button>
          <button class="btn btn-secondary nav-tab" data-view="portfolio_optimizer" style="border-radius: var(--radius-md);">
            💰 Optimize Portfolio (₹10 Cr)
          </button>
        </div>
      </div>

      <!-- High-Level KPI Metric Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Citizen Submissions</div>
          <div class="stat-value">${submissions.length.toLocaleString()}</div>
          <div class="stat-meta">
            <span style="color: var(--accent-emerald);">↑ +184 this week</span> across 142 villages
          </div>
        </div>

        <div class="stat-card stat-accent-rose">
          <div class="stat-label">Identified Demand Hotspots</div>
          <div class="stat-value" style="color: var(--accent-rose);">${hotspots.length}</div>
          <div class="stat-meta">
            <span>5 Geographic clusters with critical gaps</span>
          </div>
        </div>

        <div class="stat-card stat-accent-indigo">
          <div class="stat-label">AI Thematic Clusters</div>
          <div class="stat-value" style="color: var(--accent-indigo);">${clusters.length}</div>
          <div class="stat-meta">
            <span>Consolidated from 1,200+ raw inputs</span>
          </div>
        </div>

        <div class="stat-card stat-accent-emerald">
          <div class="stat-label">Evidence Verification Rate</div>
          <div class="stat-value" style="color: var(--accent-emerald);">${verifiedPct}%</div>
          <div class="stat-meta">
            <span>Field & Drone survey verified</span>
          </div>
        </div>

        <div class="stat-card stat-accent-amber">
          <div class="stat-label">Affected Population</div>
          <div class="stat-value">84,200</div>
          <div class="stat-meta">
            <span>~29.6% of Constituency Population</span>
          </div>
        </div>
      </div>

      <!-- Two-Column Layout: Thematic Clusters & Quick Action Center -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
        <!-- Left: Top Ranked Thematic Clusters -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">🔥 Top Civic Demand Clusters (Normalized Intelligence)</div>
              <div class="card-subtitle">AI groups semantic problems regardless of dialect or intake channel</div>
            </div>
            <button class="btn btn-outline nav-tab" data-view="thematic_clusters" style="font-size: 0.78rem; padding: 0.35rem 0.75rem;">
              View All 10 Themes →
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${clusters.slice(0, 5).map(c => `
              <div style="background: var(--neutral-50); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="font-weight: 700; color: var(--neutral-900); font-size: 0.95rem;">${c.theme}</span>
                    <span class="badge ${c.severity === 'Critical' ? 'badge-critical' : 'badge-high'}">${c.severity}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--neutral-600);">
                    📍 Epicenter: <strong>${c.lead_area}</strong> | 👥 Estimated Affected: <strong>${c.population_impact.toLocaleString()}</strong>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--primary-600);">
                    ${c.count}
                  </div>
                  <div style="font-size: 0.72rem; color: var(--neutral-500); text-transform: uppercase;">Citizen Reports</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Evidence & Discrepancy Alert Box -->
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
          <!-- Discrepancy Alert Box -->
          <div class="card" style="border-left: 4px solid var(--accent-amber); background: #fffbeb;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.25rem;">⚠️</span>
              <div style="font-weight: 700; color: #92400e; font-size: 0.95rem;">Active Discrepancies (3)</div>
            </div>
            <div style="font-size: 0.82rem; color: #78350f; line-height: 1.4; margin-bottom: 0.75rem;">
              Citizen perception differs from official records in 3 hotspots (e.g. facility exists in GIS but is cut off by flood erosion).
            </div>
            <button class="btn btn-secondary nav-tab" data-view="data_fusion" style="width: 100%; font-size: 0.8rem; background: white;">
              Inspect Discrepancies & Data Fusion →
            </button>
          </div>

          <!-- Quick Action / Drone Mission Launch Box -->
          <div class="card" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span style="font-size: 1.25rem;">🚁</span>
              <div style="font-weight: 700; font-size: 0.95rem; color: #38bdf8;">Drone Verification Flight</div>
            </div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 1rem;">
              Garuda-V MAVLink autonomous surveyor is primed on standby at Kalyanpur Corridor.
            </div>
            <button class="btn btn-primary nav-tab" data-view="drone_simulator" style="width: 100%; font-size: 0.85rem;">
              Launch Autonomous Drone Survey →
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
