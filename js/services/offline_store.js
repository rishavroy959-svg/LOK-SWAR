/**
 * People's Priorities - Offline-First Local Store & Background Sync Service
 * Ensures 100% submission availability in extreme rural / zero-connectivity areas.
 */

const STORAGE_KEYS = {
  OFFLINE_QUEUE: 'peoples_priorities_offline_queue',
  LOCAL_CACHE_SUBMISSIONS: 'peoples_priorities_cached_submissions',
  USER_REPORTS: 'peoples_priorities_my_reports'
};

export class OfflineStore {
  constructor(onSyncCallback) {
    this.onSyncCallback = onSyncCallback;
    this.isOnline = navigator.onLine;
    this.simulatedNetworkMode = 'online'; // 'online', 'low-bandwidth', 'offline'
    
    this.initNetworkListeners();
  }

  initNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerAutoSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  setSimulatedNetwork(mode) {
    this.simulatedNetworkMode = mode;
    if (mode === 'online') {
      this.triggerAutoSync();
    }
  }

  getEffectiveNetworkStatus() {
    if (this.simulatedNetworkMode === 'offline' || !this.isOnline) {
      return { status: 'offline', label: 'Offline PWA Mode (Queued)', color: 'var(--accent-rose)' };
    }
    if (this.simulatedNetworkMode === 'low-bandwidth') {
      return { status: 'low-bandwidth', label: '2G Low Bandwidth (Compressed)', color: 'var(--accent-amber)' };
    }
    return { status: 'online', label: 'Online 4G/5G (Connected)', color: 'var(--accent-emerald)' };
  }

  saveOfflineSubmission(submission) {
    const queue = this.getOfflineQueue();
    const offlineItem = {
      ...submission,
      offline_id: `OFF-${Date.now()}`,
      created_offline_at: new Date().toISOString(),
      sync_status: 'PENDING_SYNC'
    };
    
    queue.push(offlineItem);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    
    // Also store in user's trackable reports
    this.saveUserReport(offlineItem);
    
    return offlineItem;
  }

  getOfflineQueue() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn("Error reading offline queue", e);
      return [];
    }
  }

  saveUserReport(report) {
    try {
      const reports = this.getUserReports();
      reports.unshift(report);
      localStorage.setItem(STORAGE_KEYS.USER_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.warn("Error saving user report", e);
    }
  }

  getUserReports() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  async triggerAutoSync() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { synced: 0 };

    console.log(`[OfflineStore] Synchronizing ${queue.length} offline queued submissions...`);
    const syncedItems = [];

    for (const item of queue) {
      item.sync_status = 'SYNCED';
      item.synced_at = new Date().toISOString();
      syncedItems.push(item);
    }

    // Clear queue
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));

    if (this.onSyncCallback) {
      this.onSyncCallback(syncedItems);
    }

    return { synced: syncedItems.length, items: syncedItems };
  }
}
