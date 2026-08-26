/**
 * People's Priorities - AI Thematic Clusters & Semantic NLP Intelligence Component
 */

export function renderThematicClusters(state) {
  const clusters = state.clusters || [];
  const submissions = state.submissions || [];

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
          <div>
            <h2 style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 700; color: var(--neutral-900);">
              🧠 AI Thematic Analysis & Multilingual Semantic Clustering
            </h2>
            <div style="font-size: 0.85rem; color: var(--neutral-500); margin-top: 0.25rem;">
              Transforms 1,248 unstructured voice notes, text messages, and field photos across 5 languages into structured development themes.
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <input type="text" id="input-semantic-search" placeholder="🔍 Semantic search themes..." style="padding: 0.5rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-medium); font-size: 0.85rem; width: 260px;">
          </div>
        </div>

        <!-- Semantic NLP Engine Architecture Info Banner -->
        <div style="margin-top: 1.25rem; background: var(--neutral-50); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; font-size: 0.82rem; color: var(--neutral-700);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">🌐</span>
            <div>
              <strong>Multilingual Embeddings Engine:</strong>
              <div>Clusters semantically identical phrases across Odia, Hindi, Bengali, and English without keyword rigidness.</div>
            </div>
          </div>
          <div style="display: flex; gap: 1.5rem;">
            <div>
              <div style="font-weight: 700; color: var(--primary-600);">99.4%</div>
              <div style="font-size: 0.72rem; color: var(--neutral-500);">Cluster Accuracy</div>
            </div>
            <div>
              <div style="font-weight: 700; color: var(--accent-emerald);">312</div>
              <div style="font-size: 0.72rem; color: var(--neutral-500);">Duplicates Merged</div>
            </div>
            <div>
              <div style="font-weight: 700; color: var(--accent-indigo);">10</div>
              <div style="font-size: 0.72rem; color: var(--neutral-500);">Distinct Themes</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Clusters Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 1.25rem;">
        ${clusters.map((c, idx) => `
          <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid ${idx < 3 ? 'var(--accent-rose)' : 'var(--primary-500)'};">
            <div>
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 700; color: var(--neutral-900);">
                  ${c.theme}
                </div>
                <span class="badge ${c.severity === 'Critical' ? 'badge-critical' : c.severity === 'High' ? 'badge-high' : 'badge-medium'}">
                  ${c.severity}
                </span>
              </div>

              <div style="font-size: 0.82rem; color: var(--neutral-600); margin-bottom: 0.75rem;">
                📍 Geographic Epicenter: <strong>${c.lead_area}</strong>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; background: var(--neutral-50); padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-bottom: 0.75rem;">
                <div>
                  <div style="color: var(--neutral-500); font-size: 0.72rem; text-transform: uppercase;">Citizen Reports</div>
                  <div style="font-weight: 800; font-size: 1.2rem; color: var(--primary-600);">${c.count}</div>
                </div>
                <div>
                  <div style="color: var(--neutral-500); font-size: 0.72rem; text-transform: uppercase;">Affected Population</div>
                  <div style="font-weight: 800; font-size: 1.2rem; color: var(--neutral-800);">${c.population_impact?.toLocaleString()}</div>
                </div>
              </div>

              <div style="font-size: 0.78rem; color: var(--neutral-600); line-height: 1.4;">
                <strong>Semantic Sample Input:</strong>
                <div style="font-style: italic; background: white; padding: 0.4rem 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-top: 0.2rem;">
                  "${idx === 0 ? 'କଲ୍ୟାଣପୁର ରାସ୍ତା ବର୍ଷାରେ ଧୋଇ ହୋଇଯାଇଛି, ଆମ୍ବୁଲାନ୍ସ ଆସିପାରୁନାହିଁ...' : idx === 1 ? 'स्वास्थ्य केंद्र में डॉक्टर नहीं हैं, रात को कोई सुविधा नहीं...' : idx === 2 ? 'गांव में पीने का पानी लाल आ रहा है, हैंडपंप खराब है...' : 'School classroom overcrowding and structural leaks...'}"
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem; margin-top: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
              <button class="btn btn-outline nav-tab" data-view="gis_map" style="flex: 1; font-size: 0.75rem; padding: 0.35rem 0.6rem;">
                🗺️ View on GIS
              </button>
              <button class="btn btn-secondary nav-tab" data-view="priority_ranking" style="flex: 1; font-size: 0.75rem; padding: 0.35rem 0.6rem;">
                ⚖️ Prioritize Work
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
