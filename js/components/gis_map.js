/**
 * People's Priorities - Interactive GIS Demand Hotspot Map Component
 * Powered by Leaflet GIS with layer controls (Citizen Reports, Density Heatmap, Facilities, Gaps & Drone Paths)
 */

export function renderGISMapView(state) {
  const hotspots = state.hotspots || [];
  const selectedHotspot = state.selectedHotspot || hotspots[0];

  return `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div class="card" style="padding: 1rem 1.5rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
        <div>
          <h2 style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--neutral-900);">
            🗺️ Interactive GIS Demand Hotspot & Infrastructure Map
          </h2>
          <div style="font-size: 0.8rem; color: var(--neutral-500);">
            Spatial fusion of 1,248 citizen geo-records, government facility registries, and high-priority development zones.
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <select id="select-map-category-filter" style="padding: 0.45rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-medium); font-size: 0.82rem;">
            <option value="All">All Categories</option>
            <option value="Roads">Roads & Connectivity</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Water">Water Supply</option>
            <option value="Drainage">Drainage / Flood</option>
          </select>

          <select id="select-map-area-filter" style="padding: 0.45rem 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-medium); font-size: 0.82rem;">
            <option value="All">All Wards & Villages</option>
            <option value="rural">Rural Blocks Only</option>
            <option value="extreme_rural">Extreme Rural Hamlets</option>
            <option value="urban">Urban Wards</option>
          </select>
        </div>
      </div>

      <!-- Map Canvas & Sidebar Grid -->
      <div class="map-layout">
        <!-- Leaflet Map Container -->
        <div class="gis-map-wrapper">
          <div id="gis-leaflet-map" style="width: 100%; height: 100%;"></div>

          <!-- Floating Map Mode Controls -->
          <div class="map-floating-controls">
            <button id="btn-layer-heatmap" class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
              🔥 Toggle Heatmap
            </button>
            <button id="btn-layer-facilities" class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
              🏥 Govt Facilities
            </button>
            <button id="btn-layer-drone" class="btn btn-outline" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
              🚁 Drone Flight Path
            </button>
          </div>
        </div>

        <!-- Sidebar: Hotspot Inspector -->
        <div class="map-sidebar">
          <div class="card" style="padding: 1.25rem;">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent-rose); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem;">
              Critical Hotspot Selected
            </div>
            <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 700; color: var(--neutral-900); margin-bottom: 0.5rem;">
              ${selectedHotspot ? selectedHotspot.title : 'Kalyanpur-Lathikata Corridor'}
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.82rem;">
              <div style="background: var(--neutral-50); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="color: var(--neutral-500); font-size: 0.72rem; text-transform: uppercase;">Citizen Demand Intensity</div>
                <div style="font-weight: 700; color: var(--primary-600); font-size: 1.1rem;">
                  ${selectedHotspot ? selectedHotspot.reports_count : 412} Reports
                </div>
              </div>

              <div style="background: var(--neutral-50); padding: 0.6rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
                <div style="color: var(--neutral-500); font-size: 0.72rem; text-transform: uppercase;">Estimated Population Impact</div>
                <div style="font-weight: 700; color: var(--neutral-800); font-size: 1.1rem;">
                  ${selectedHotspot ? selectedHotspot.population_affected?.toLocaleString() : '18,400'} Citizens
                </div>
              </div>

              <div>
                <strong>Infrastructure Gap:</strong>
                <div style="color: var(--neutral-600); margin-top: 0.15rem;">
                  ${selectedHotspot ? selectedHotspot.infrastructure_gap : 'Road washed out; culvert collapsed.'}
                </div>
              </div>

              <div>
                <strong>Nearest Govt Facility:</strong>
                <div style="color: var(--neutral-600); margin-top: 0.15rem;">
                  ${selectedHotspot ? selectedHotspot.nearest_facility : 'Kalyanpur PHC (4.2 km) / Hospital (24 km)'}
                </div>
              </div>

              ${selectedHotspot && selectedHotspot.discrepancy_alert ? `
                <div style="background: #fefce8; border: 1px solid #fde047; padding: 0.6rem; border-radius: var(--radius-sm); color: #854d0e; font-size: 0.78rem;">
                  <strong>⚠️ Discrepancy:</strong> ${selectedHotspot.discrepancy_alert}
                </div>
              ` : ''}

              <button class="btn btn-primary nav-tab" data-view="drone_simulator" style="width: 100%; font-size: 0.8rem; margin-top: 0.5rem;">
                🚁 Create Drone Mission for this Hotspot
              </button>
            </div>
          </div>

          <!-- All Hotspots List -->
          <div class="card" style="padding: 1rem;">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--neutral-800); margin-bottom: 0.5rem;">
              Constituency Hotspots (${hotspots.length})
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem; max-height: 200px; overflow-y: auto;">
              ${hotspots.map(h => `
                <div class="hotspot-list-item ${h.id === selectedHotspot?.id ? 'active' : ''}" data-hotspot-id="${h.id}" style="padding: 0.5rem; border-radius: var(--radius-sm); font-size: 0.78rem; cursor: pointer; background: ${h.id === selectedHotspot?.id ? 'var(--primary-100)' : 'var(--neutral-50)'}; border: 1px solid ${h.id === selectedHotspot?.id ? 'var(--primary-500)' : 'var(--border-subtle)'};">
                  <strong>${h.title}</strong>
                  <div style="color: var(--neutral-500); font-size: 0.72rem;">${h.reports_count} reports | ${h.population_affected?.toLocaleString()} pop</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
