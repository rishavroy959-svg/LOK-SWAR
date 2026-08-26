/**
 * People's Priorities / लोक स्वर - Clean, Simplified Navigation Header & Drawer
 * 1. Top-left has ONLY the clean [≡] Hamburger button (removed 3-dots from top-left).
 * 2. Simplified, easy-to-understand feature names in the sidebar drawer.
 * 3. 1-click Home navigation from anywhere.
 */

export function renderHeader(state) {
  const currentLang = state.currentLang || 'Hindi';
  const isNight = state.isNightMode || false;
  const isNotifOpen = state.isNotifOpen || false;
  const isDrawerOpen = state.isCitizenDrawerOpen || false;
  const unreadCount = state.unreadNotifCount !== undefined ? state.unreadNotifCount : 3;
  const currentView = state.currentView || 'citizen';
  const isMainPage = currentView === 'citizen';

  const viewTitles = {
    citizen: "लोक स्वर • Home",
    admin_overview: "Progress & Numbers",
    gis_map: "Village Map",
    thematic_clusters: "Issues by Topic",
    data_fusion: "Fact Check & Proof",
    field_officer: "Officer Ground Check",
    drone_simulator: "Drone & Camera Photos",
    priority_ranking: "Priority Work List",
    portfolio_optimizer: "₹10 Cr Budget Plan",
    audit_log: "Activity Records",
    guided_demo: "Guided Tour"
  };

  const currentViewTitle = viewTitles[currentView] || "Lok Swar";

  return `
    <header class="app-header-minimal" style="padding: 0.85rem 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 1000; background: var(--bg-app); border-bottom: 1px solid var(--border-subtle); transition: background-color 0.3s ease;">
      
      <!-- Left: Single Primary Hamburger Menu Button [≡] (Clean, no 3-dots) -->
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <button id="btn-open-citizen-drawer" class="btn btn-secondary" style="width: 48px; height: 48px; border-radius: 14px; font-size: 1.4rem; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); cursor: pointer;" aria-label="Open Navigation Menu" title="[≡] Open Menu">
          ☰
        </button>

        <!-- If on a secondary page, show clean 1-click Quick Return to Home button -->
        ${!isMainPage ? `
          <button id="btn-back-home" class="btn nav-tab" data-view="citizen" style="height: 48px; padding: 0 1.1rem; border-radius: 14px; font-weight: 800; font-size: 0.85rem; background: var(--gov-green-dark); color: white; border: 1px solid var(--gov-green-medium); display: flex; align-items: center; gap: 0.4rem; cursor: pointer; box-shadow: var(--shadow-sm); animation: fadeIn 0.2s ease;" title="Go back to Home (लोक स्वर)">
            <span>← 🏠 Home / मुख्य पृष्ठ</span>
          </button>
        ` : ''}
      </div>

      <!-- Center: Contextual View Indicator or Empty on Home -->
      <div style="flex: 1; text-align: center; font-family: var(--font-heading); font-size: 0.95rem; font-weight: 800; color: var(--neutral-900);">
        ${!isMainPage ? `
          <span class="badge" style="font-size: 0.75rem; padding: 0.35rem 0.85rem; background: var(--bg-surface); border: 1px solid var(--border-medium); color: var(--neutral-900); border-radius: 20px;">
            📄 Current: <strong>${currentViewTitle}</strong>
          </span>
        ` : ''}
      </div>

      <!-- Right: Top-Right Utilities (🔔 Notifications, 🌐 Language, ☀️/🌙 Day/Night) -->
      <div style="display: flex; align-items: center; gap: 0.5rem; position: relative;">
        
        <!-- 1. Notification Button -->
        <div style="position: relative;">
          <button id="btn-toggle-notifications" class="btn btn-secondary" style="width: 46px; height: 46px; border-radius: 14px; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; position: relative; box-shadow: var(--shadow-sm);" title="Notifications">
            🔔
            ${unreadCount > 0 ? `
              <span style="position: absolute; top: 8px; right: 8px; width: 9px; height: 9px; border-radius: 50%; background: #e28743; border: 2px solid var(--bg-app); animation: pulse 1s infinite;"></span>
            ` : ''}
          </button>

          <!-- Notification Dropdown Panel -->
          ${isNotifOpen ? `
            <div id="notif-dropdown-panel" class="card" style="position: absolute; right: 0; top: 55px; width: 310px; padding: 1rem; border-radius: 16px; box-shadow: var(--shadow-xl); z-index: 2000; animation: fadeIn 0.15s ease;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.5rem; margin-bottom: 0.75rem;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">🔔 Alerts & Updates</div>
                <button id="btn-close-notif" style="background: none; border: none; font-size: 0.85rem; cursor: pointer; color: var(--neutral-500);">✕</button>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.75rem;">
                <div style="padding: 0.5rem; border-radius: 8px; background: var(--neutral-50); border: 1px solid var(--border-subtle);">
                  <div style="font-weight: 700; color: var(--neutral-900);">Drone Photo Check Done</div>
                  <div style="color: var(--neutral-600);">Kalyanpur Bridge area surveyed with photos.</div>
                  <div style="color: var(--neutral-400); font-size: 0.68rem; margin-top: 2px;">10m ago</div>
                </div>
                <div style="padding: 0.5rem; border-radius: 8px; background: var(--neutral-50); border: 1px solid var(--border-subtle);">
                  <div style="font-weight: 700; color: var(--accent-amber);">⚠️ Road Status Mismatch</div>
                  <div style="color: var(--neutral-600);">Citizen report flagged damaged road vs old govt record.</div>
                  <div style="color: var(--neutral-400); font-size: 0.68rem; margin-top: 2px;">45m ago</div>
                </div>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- 2. Language Switcher Dropdown -->
        <select id="select-app-language" class="lang-select" style="height: 46px; border-radius: 14px; font-size: 0.8rem; font-weight: 700; padding: 0 0.75rem; border: 1px solid var(--border-medium); background: var(--bg-surface); color: var(--neutral-900); cursor: pointer;">
          <option value="Hindi" ${currentLang === 'Hindi' ? 'selected' : ''}>हिन्दी (HI)</option>
          <option value="Odia" ${currentLang === 'Odia' ? 'selected' : ''}>ଓଡ଼ିଆ (OR)</option>
          <option value="English" ${currentLang === 'English' ? 'selected' : ''}>English (EN)</option>
        </select>

        <!-- 3. Night Mode Toggle -->
        <button id="btn-toggle-night-mode" class="btn btn-secondary" style="width: 46px; height: 46px; border-radius: 14px; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); cursor: pointer;" title="${isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'}">
          ${isNight ? '☀️' : '🌙'}
        </button>

      </div>
    </header>

    <!-- GLOBAL SLIDE-OUT NAVIGATION DRAWER (Simplified, Clean Names) -->
    ${isDrawerOpen ? `
      <div class="modal-backdrop" id="citizen-drawer-backdrop" style="background: rgba(20, 23, 26, 0.65); backdrop-filter: blur(4px); z-index: 2500; justify-content: flex-start; padding: 0; position: fixed; inset: 0;">
        <div style="width: 370px; max-width: 88vw; height: 100vh; background: var(--bg-surface); display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-xl); border-right: 1px solid var(--border-medium); animation: slideInLeft 0.25s cubic-bezier(0.25, 1, 0.5, 1);">
          
          <!-- Drawer Header -->
          <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-subtle); background: var(--bg-surface-elevated); display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <div style="width: 42px; height: 42px; border-radius: 12px; background: var(--gov-green-dark); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-weight: bold;">
                🏛️
              </div>
              <div>
                <div style="font-family: var(--font-heading); font-size: 1.1rem; font-weight: 900; color: var(--neutral-900);">
                  लोक स्वर (Lok Swar)
                </div>
                <div style="font-size: 0.68rem; color: var(--neutral-500); font-weight: 700; text-transform: uppercase;">
                  ${localStorage.getItem('lok_swar_user_location_name') || 'Live Location'} • Simple Menu
                </div>
              </div>
            </div>
            <button id="btn-close-citizen-drawer" class="btn btn-secondary" style="width: 36px; height: 36px; border-radius: 50%; padding: 0; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; cursor: pointer;">✕</button>
          </div>

          <!-- Simple, Friendly Feature List -->
          <div style="flex: 1; overflow-y: auto; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.55rem;">
            
            <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--neutral-500); padding: 0.25rem 0.5rem;">
              Features & Pages:
            </div>

            <!-- 1. HOME (Citizen Intake) -->
            <button class="nav-tab ${currentView === 'citizen' ? 'active' : ''}" data-view="citizen" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 2px solid ${currentView === 'citizen' ? 'var(--gov-green-dark)' : 'var(--border-medium)'}; background: ${currentView === 'citizen' ? 'var(--primary-100)' : 'var(--bg-app)'}; display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: var(--gov-green-dark); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0;">
                🏠
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="font-weight: 900; font-size: 0.9rem; color: var(--neutral-900);">1. Home (लोक स्वर)</div>
                  <span class="badge" style="font-size: 0.65rem; background: var(--gov-green-dark); color: white;">MAIN</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--neutral-600); margin-top: 2px;">Voice, Text & Photo Report Intake</div>
              </div>
            </button>

            <!-- 2. Progress & Numbers -->
            <button class="nav-tab ${currentView === 'admin_overview' ? 'active' : ''}" data-view="admin_overview" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #e4eee8; color: var(--gov-green-dark); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                📊
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">2. Progress & Numbers</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Total reports and village statistics</div>
              </div>
            </button>

            <!-- 3. Village Map -->
            <button class="nav-tab ${currentView === 'gis_map' ? 'active' : ''}" data-view="gis_map" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #ffe4e6; color: #9f1239; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                🗺️
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">3. Village Map</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">See problems and needs on the map</div>
              </div>
            </button>

            <!-- 4. Issues by Topic -->
            <button class="nav-tab ${currentView === 'thematic_clusters' ? 'active' : ''}" data-view="thematic_clusters" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #fef3c7; color: #92400e; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                💡
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">4. Issues by Topic</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Roads, drinking water, power & schools</div>
              </div>
            </button>

            <!-- 5. Fact Check & Proof -->
            <button class="nav-tab ${currentView === 'data_fusion' ? 'active' : ''}" data-view="data_fusion" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #fef9c3; color: #854d0e; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                🔍
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">5. Fact Check & Proof</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Comparing citizen claims with ground data</div>
              </div>
            </button>

            <!-- 6. Officer Ground Check -->
            <button class="nav-tab ${currentView === 'field_officer' ? 'active' : ''}" data-view="field_officer" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #ccfbf1; color: #115e59; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                📋
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">6. Officer Ground Check</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Staff visits and verification checklist</div>
              </div>
            </button>

            <!-- 7. Drone & Camera Photos -->
            <button class="nav-tab ${currentView === 'drone_simulator' ? 'active' : ''}" data-view="drone_simulator" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #e0f2fe; color: #075985; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                🛸
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">7. Drone & Camera Photos</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Aerial pictures and damage check</div>
              </div>
            </button>

            <!-- 8. Priority Work List -->
            <button class="nav-tab ${currentView === 'priority_ranking' ? 'active' : ''}" data-view="priority_ranking" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #ede9fe; color: #5b21b6; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                ⚖️
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">8. Priority Work List</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Which work needs to be done first</div>
              </div>
            </button>

            <!-- 9. ₹10 Cr Budget Plan -->
            <button class="nav-tab ${currentView === 'portfolio_optimizer' ? 'active' : ''}" data-view="portfolio_optimizer" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #f3e8ff; color: #6b21a8; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                💰
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">9. ₹10 Cr Budget Plan</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Fair and optimal money allocation</div>
              </div>
            </button>

            <!-- 10. Activity Records -->
            <button class="nav-tab ${currentView === 'audit_log' ? 'active' : ''}" data-view="audit_log" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #f1f5f9; color: #334155; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                📜
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">10. Activity Records</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Clear history of all official decisions</div>
              </div>
            </button>

            <!-- 11. Guided Tour -->
            <button class="nav-tab ${currentView === 'guided_demo' ? 'active' : ''}" data-view="guided_demo" style="text-align: left; padding: 0.85rem; border-radius: 16px; border: 1px solid var(--border-subtle); background: var(--bg-app); display: flex; align-items: center; gap: 0.75rem; cursor: pointer; transition: all 0.15s ease;">
              <div style="width: 38px; height: 38px; border-radius: 12px; background: #fef08a; color: #854d0e; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; flex-shrink: 0;">
                🎯
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 800; font-size: 0.85rem; color: var(--neutral-900);">11. Guided Tour</div>
                <div style="font-size: 0.7rem; color: var(--neutral-600);">Easy step-by-step walkthrough demo</div>
              </div>
            </button>

          </div>

          <!-- Bottom Home Shortcut -->
          <div style="padding: 0.85rem; border-top: 1px solid var(--border-subtle); background: var(--bg-surface-elevated);">
            <button class="nav-tab btn" data-view="citizen" style="width: 100%; justify-content: center; background: var(--gov-green-dark); color: white; border-radius: 14px; font-weight: 900; font-size: 0.95rem; padding: 0.85rem; border: 1px solid var(--gov-green-medium); cursor: pointer; box-shadow: var(--shadow-sm);">
              🏠 Return to Home (लोक स्वर)
            </button>
          </div>

        </div>
      </div>
    ` : ''}
  `;
}
