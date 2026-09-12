/**
 * Bumi Warga — Offline Storage & Background Sync Utility
 * Powered by native IndexedDB & Service Worker Background Sync
 */

const DB_NAME = 'bumi_warga_offline_db';
const DB_VERSION = 1;

const QUEUE_STORE = 'offline_queue';
const CACHE_STORE = 'cached_data';

/**
 * Open or upgrade the IndexedDB instance
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Notify subscribers (UI indicator) about queue length change
 */
async function notifyQueueChanged() {
  if (typeof window === 'undefined') return;
  try {
    const count = await getPendingCount();
    window.dispatchEvent(new CustomEvent('bw-offline-queue-changed', { detail: { count } }));
  } catch (err) {
    console.warn('[OfflineStorage] Error notifying queue change:', err);
  }
}

/**
 * Enqueue an offline mutation (e.g., posyandu submission, bansos check, pengaduan)
 */
export async function enqueueOfflineAction({ type, endpoint, method = 'POST', payload, label }) {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  const store = tx.objectStore(QUEUE_STORE);

  const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const item = {
    id,
    type,
    label: label || `${method} ${endpoint}`,
    endpoint,
    method,
    payload,
    status: 'pending',
    createdAt: new Date().toISOString(),
    retryCount: 0
  };

  return new Promise((resolve, reject) => {
    const req = store.add(item);
    req.onsuccess = () => {
      notifyQueueChanged();
      // If service worker background sync is available, register tag
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.sync.register('sync-offline-queue').catch(() => {});
        }).catch(() => {});
      }
      resolve(item);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve all pending queued items
 */
export async function getPendingQueue() {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, 'readonly');
  const store = tx.objectStore(QUEUE_STORE);

  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => {
      const items = (req.result || []).filter((item) => item.status === 'pending');
      items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      resolve(items);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Count pending queue items
 */
export async function getPendingCount() {
  try {
    const queue = await getPendingQueue();
    return queue.length;
  } catch (e) {
    return 0;
  }
}

/**
 * Remove an item from the queue after successful sync
 */
export async function removeQueueItem(id) {
  const db = await openDB();
  const tx = db.transaction(QUEUE_STORE, 'readwrite');
  const store = tx.objectStore(QUEUE_STORE);

  return new Promise((resolve, reject) => {
    const req = store.delete(id);
    req.onsuccess = () => {
      notifyQueueChanged();
      resolve(true);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Cache data snapshot for offline viewing
 */
export async function cacheData(key, data) {
  try {
    const db = await openDB();
    const tx = db.transaction(CACHE_STORE, 'readwrite');
    const store = tx.objectStore(CACHE_STORE);
    store.put({ key, data, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.warn('[OfflineStorage] Failed to cache data:', e);
  }
}

/**
 * Read cached data snapshot
 */
export async function getCachedData(key) {
  try {
    const db = await openDB();
    const tx = db.transaction(CACHE_STORE, 'readonly');
    const store = tx.objectStore(CACHE_STORE);
    return new Promise((resolve) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

/**
 * Flush and synchronize pending queue with server
 */
export async function flushOfflineQueue(apiCaller) {
  if (!navigator.onLine) {
    return { synced: 0, failed: 0, pending: await getPendingCount() };
  }

  const items = await getPendingQueue();
  if (items.length === 0) {
    return { synced: 0, failed: 0, pending: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      const options = {
        method: item.method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (item.payload) {
        options.body = JSON.stringify(item.payload);
      }

      const res = await (apiCaller 
        ? apiCaller(item.endpoint, options) 
        : fetch(item.endpoint, options));

      if (res && (res.ok || res.status === 200 || res.status === 201 || res.data)) {
        await removeQueueItem(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch (err) {
      console.warn(`[OfflineStorage] Failed to sync item ${item.id}:`, err);
      failed++;
    }
  }

  await notifyQueueChanged();
  const pending = await getPendingCount();
  return { synced, failed, pending };
}

/**
 * Register global listeners for automatic queue sync upon reconnect
 */
export function initOfflineSync(apiCaller) {
  if (typeof window === 'undefined') return;

  const handleOnline = async () => {
    console.log('[OfflineStorage] Device is back online. Flushing queue...');
    const result = await flushOfflineQueue(apiCaller);
    if (result.synced > 0) {
      window.dispatchEvent(new CustomEvent('bw-sync-completed', { detail: result }));
    }
  };

  window.addEventListener('online', handleOnline);

  // Listen to Service Worker message triggers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'TRIGGER_OFFLINE_SYNC') {
        handleOnline();
      }
    });
  }

  // Initial check if online and has pending items
  if (navigator.onLine) {
    setTimeout(() => {
      flushOfflineQueue(apiCaller).catch(() => {});
    }, 2000);
  }
}

