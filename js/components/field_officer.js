/**
 * People's Priorities - Field & Verification Officer Dashboard Component
 * Mobile-ready, offline capable inspection queue, geotagged evidence logger & verification checklists.
 */

import { DEMO_VILLAGES_AND_WARDS } from '../data/constituency_data.js';

export function renderFieldOfficerView(state) {
  const tasks = [
    {
      id: "TSK-401",
      submission_id: "SUB-1082",
      title: "Verify Kalyanpur Road Bridge Washout",
      location: "Kalyanpur Gram Panchayat (Lathikata Block)",
      category: "Roads & Healthcare",
      urgency: "Immediate",
      assigned_to: "Field Officer R. K. Nayak",
      status: "In Progress",
      citizen_notes: "412 reports received stating ambulance cannot cross river culvert.",
      checklist: [
        { label: "Inspect culvert foundation & wingwalls", done: true },
        { label: "Measure water depth & carriage width", done: true },
        { label: "Capture geotagged HD photo / video", done: true },
        { label: "Record interview with Panchayat Pradhan", done: false }
      ]
    },
    {
      id: "TSK-402",
      submission_id: "SUB-1115",
      title: "Inspect Jhirpani Deep Borewell Fluoride Levels",
      location: "Jhirpani Tribal Hamlet (Bisra Block)",
      category: "Water",
      urgency: "High",
      assigned_to: "PHED Junior Engineer S. Mohanty",
      status: "Pending Inspection",
      citizen_notes: "Tribal villagers reporting reddish water and dental fluorosis in children.",
      checklist: [
        { label: "Collect 3 water samples for PHED lab", done: false },
        { label: "Check solar pump motor status", done: false },
        { label: "Geotag replacement borewell site", done: false }
      ]
    }
  ];

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 960px; margin: 0 auto;">
      <!-- Field Officer Mobile Header -->
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 1.25rem; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
            📋
          </div>
          <div>
            <div style="font-weight: 700; font-size: 1.1rem;">Field Verification Officer Portal</div>
            <div style="font-size: 0.78rem; color: #bfdbfe;">Assigned Officer: R. K. Nayak (Lathikata Circle)</div>
          </div>
        </div>

        <div style="text-align: right;">
          <span class="badge badge-low" style="background: #10b981; color: white;">Offline Sync Ready</span>
        </div>
      </div>

      <!-- Active Assigned Tasks -->
      <div style="display: flex; flex-direction: column; gap: 1rem;">
        ${tasks.map(t => `
          <div class="card" style="border-left: 4px solid var(--accent-rose);">
            <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.75rem;">
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 0.75rem; font-weight: 700; color: var(--accent-rose); text-transform: uppercase;">
                    ${t.id} • ${t.urgency} Urgency
                  </span>
                  <span class="badge ${t.status === 'In Progress' ? 'badge-high' : 'badge-unverified'}">${t.status}</span>
                </div>
                <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--neutral-900); margin-top: 0.2rem;">
                  ${t.title}
                </div>
                <div style="font-size: 0.82rem; color: var(--neutral-600);">📍 ${t.location}</div>
              </div>

              <button class="btn btn-outline" style="font-size: 0.78rem; padding: 0.35rem 0.65rem;">
                📍 GPS Route
              </button>
            </div>

            <div style="background: var(--neutral-50); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.82rem; color: var(--neutral-700); margin-bottom: 1rem;">
              <strong>Citizen Context:</strong> ${t.citizen_notes}
            </div>

            <!-- Field Checklist -->
            <div style="margin-bottom: 1rem;">
              <div style="font-size: 0.8rem; font-weight: 700; color: var(--neutral-800); margin-bottom: 0.5rem;">
                Verification Checklist:
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                ${t.checklist.map(item => `
                  <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: var(--neutral-700); cursor: pointer;">
                    <input type="checkbox" ${item.done ? 'checked' : ''} style="width: 16px; height: 16px;">
                    <span style="${item.done ? 'text-decoration: line-through; color: var(--neutral-400);' : ''}">${item.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Evidence Capture & Verification Action Buttons -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
              <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;" onclick="alert('Camera activated. Geotagged coordinates [22.1245° N, 84.0321° E] locked.')">
                📷 Capture Photo/Video
              </button>
              <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;" onclick="alert('Audio note recorder activated.')">
                🎙️ Record Field Voice Note
              </button>

              <div style="margin-left: auto; display: flex; gap: 0.5rem;">
                <button class="btn btn-success" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;" onclick="alert('Task marked as VERIFIED. Evidence hash committed to Audit Ledger.')">
                  ✅ Mark Verified
                </button>
                <button class="btn btn-danger" style="font-size: 0.8rem; padding: 0.45rem 0.85rem;" onclick="alert('Task marked as DISCREPANCY / NOT SUPPORTED.')">
                  ❌ Mark Discrepancy
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
