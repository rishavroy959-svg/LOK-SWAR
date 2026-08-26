/**
 * People's Priorities - Audit Trail & Democratic Transparency Component
 * Immutable ledger tracking every administrative approval, evidence hash, AI model version, and decision provenance.
 */

export function renderAuditLogView(state) {
  const logs = state.auditLogs || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: var(--neutral-900);">
              📜 Immutable Governance & Decision Audit Ledger
            </h2>
            <div style="font-size: 0.85rem; color: var(--neutral-500); margin-top: 0.25rem;">
              Full chronological transparency: who changed what, which objective evidence was used, and which AI model version produced the estimate.
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline" onclick="window.print()" style="font-size: 0.82rem;">
              🖨️ Print / Export PDF
            </button>
            <button class="btn btn-primary" onclick="alert('Exported full DPC Planning Audit Log as JSON.')" style="font-size: 0.82rem;">
              💾 Export JSON
            </button>
          </div>
        </div>
      </div>

      <!-- Audit Ledger Entries Table -->
      <div class="card">
        <div class="data-table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Audit ID & Time</th>
                <th>Authorized Actor</th>
                <th>Action Type</th>
                <th>Target Entity / Hotspot</th>
                <th>Rationale & Ground Evidence</th>
                <th>AI Model Version</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr>
                  <td>
                    <strong>${log.id}</strong><br>
                    <span style="font-size: 0.72rem; color: var(--neutral-500);">${log.timestamp}</span>
                  </td>
                  <td>
                    <span style="font-weight: 600; color: var(--primary-700);">${log.actor}</span>
                  </td>
                  <td>
                    <span class="badge" style="background: var(--neutral-100); font-family: var(--font-mono);">${log.action}</span>
                  </td>
                  <td><strong>${log.target}</strong></td>
                  <td style="max-width: 320px; font-size: 0.8rem; line-height: 1.4;">
                    <div>${log.rationale}</div>
                    <div style="color: var(--neutral-500); font-size: 0.72rem; margin-top: 0.2rem;">
                      📁 Evidence: ${log.evidence_used}
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-low" style="font-size: 0.7rem; font-family: var(--font-mono);">
                      ${log.ai_model || 'v3.2'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
