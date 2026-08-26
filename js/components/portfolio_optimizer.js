/**
 * People's Priorities - Budget-Constrained Development Portfolio Optimizer Component
 * Mixed Integer Linear Programming (MILP) Knapsack Solver with Live Budget Slider & Trade-off Explainability
 */

export function renderPortfolioOptimizerView(state) {
  const opt = state.optimizationResult || {};
  const budgetCr = state.budgetCr || 10.0;
  const selected = opt.selected_projects || [];
  const excluded = opt.excluded_projects || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- Interactive Budget Controller Bar -->
      <div class="budget-control-bar">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
          <div>
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: #93c5fd; font-weight: 700;">
              Portfolio Decision Support • MILP 0-1 Knapsack Solver
            </div>
            <h2 style="font-family: var(--font-heading); font-size: 1.5rem; font-weight: 800; color: white;">
              Constituency Development Budget Allocation
            </h2>
          </div>

          <div class="budget-display-badge">
            ₹<span id="budget-val-display">${budgetCr.toFixed(1)}</span> Crore
          </div>
        </div>

        <div class="budget-slider-wrapper">
          <span style="font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">₹2 Cr</span>
          <input type="range" id="input-budget-slider" class="budget-range-input" min="2.0" max="25.0" step="0.5" value="${budgetCr}">
          <span style="font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">₹25 Cr</span>
        </div>

        <!-- Dynamic Summary Metrics -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 1rem;">
          <div>
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Selected Projects</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #4ade80;">
              ${opt.selected_count || 5} of ${opt.total_candidates || 10}
            </div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Budget Utilized</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #60a5fa;">
              ₹${opt.budget_utilized_cr || 9.4} Cr <span style="font-size: 0.85rem; color: #94a3b8;">(₹${opt.budget_surplus_cr || 0.6} Cr buffer)</span>
            </div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Population Benefited</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: white;">
              ${(opt.total_population_benefited || 66100).toLocaleString()} Citizens
            </div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: #94a3b8; text-transform: uppercase;">Avg Priority Score</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #fbbf24;">
              ${opt.average_priority_score || 87.6}/100
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 1: RECOMMENDED DEVELOPMENT PORTFOLIO (SELECTED) -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title" style="color: var(--accent-emerald);">
              <span>✅ Recommended Development Portfolio (${selected.length} Projects Selected)</span>
            </div>
            <div class="card-subtitle">
              Maximized public welfare function subject to fiscal ceiling and rural equity constraints.
            </div>
          </div>
          <button class="btn btn-success" style="font-size: 0.82rem;" onclick="alert('Portfolio approved and committed to District Planning Committee Official Gazetted Plan!')">
            🏛️ Formally Approve Portfolio
          </button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${selected.map((p, idx) => `
            <div class="project-card selected-in-portfolio">
              <div class="project-card-header">
                <div style="display: flex; align-items: flex-start; gap: 1rem; flex: 1;">
                  <div class="project-rank-badge">
                    #${idx + 1}
                  </div>

                  <div style="flex: 1;">
                    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                      <span style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--neutral-900);">
                        ${p.project_name}
                      </span>
                      <span class="badge badge-low">SELECTED IN PORTFOLIO</span>
                      <span class="badge" style="background: var(--neutral-100);">${p.category}</span>
                    </div>

                    <div style="font-size: 0.82rem; color: var(--neutral-600); margin-bottom: 0.35rem;">
                      📍 <strong>${p.location}</strong> | 💰 Outlay: <strong>₹${p.estimated_cost_cr} Cr</strong> | 👥 Beneficiaries: <strong>${p.expected_population_benefited.toLocaleString()}</strong> | ⏱️ <strong>${p.implementation_months} Mos</strong>
                    </div>

                    <div style="font-size: 0.82rem; color: var(--neutral-700); line-height: 1.4; background: white; padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid #d1fae5;">
                      <strong>Selection Rationale:</strong> ${p.why_selected || p.description}
                    </div>
                  </div>
                </div>

                <div style="text-align: right; min-width: 140px;">
                  <div style="font-family: var(--font-heading); font-size: 1.75rem; font-weight: 800; color: var(--accent-emerald);">
                    ${p.priority_score || p.dynamic_priority_score || 90}/100
                  </div>
                  <div style="font-size: 0.72rem; color: var(--neutral-500); text-transform: uppercase;">Priority Score</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECTION 2: EXCLUDED CANDIDATE PROJECTS WITH TRADE-OFF EXPLANATIONS -->
      <div class="card" style="background: #f8fafc; border: 1px dashed var(--border-medium);">
        <div class="card-header">
          <div>
            <div class="card-title" style="color: var(--neutral-700);">
              <span>⏸️ Competing Candidate Projects Excluded by Budget Envelope (${excluded.length})</span>
            </div>
            <div class="card-subtitle">
              Full transparency on why these projects were not selected in the current funding round.
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${excluded.map(p => `
            <div class="project-card excluded-from-portfolio">
              <div class="project-card-header">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="font-weight: 700; color: var(--neutral-800); font-size: 0.95rem;">${p.project_name}</span>
                    <span class="badge" style="background: var(--neutral-200);">${p.category}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--neutral-500); margin-bottom: 0.35rem;">
                    Cost: ₹${p.estimated_cost_cr} Cr | Beneficiaries: ${p.expected_population_benefited.toLocaleString()} | Priority: ${p.priority_score || 76}/100
                  </div>
                  <div style="font-size: 0.8rem; color: #7f1d1d; background: #fee2e2; padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid #fca5a5;">
                    <strong>Why not selected:</strong> ${p.exclusion_reason || 'Exceeded budget headroom.'}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
