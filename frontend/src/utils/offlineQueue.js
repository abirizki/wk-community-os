/**
 * Offline Queue Helper for Bumi Warga
 * Backwards-compatible facade backed by IndexedDB & LocalStorage offlineStorage
 */

import {
  enqueueOfflineAction,
  getPendingQueue,
  getPendingCount,
  removeQueueItem,
  clearQueue,
  flushOfflineQueue,
  initOfflineSync,
  notifyQueueChanged
} from './offlineStorage';

const QUEUE_KEY = 'bw_offline_queue';

export const isOnline = () => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

export const getQueue = async () => {
  try {
    return await getPendingQueue();
  } catch (e) {
    console.warn('Gagal membaca antrean offline IndexedDB, fallback ke localStorage:', e);
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
};

export const offlineQueue = {
  isOnline,
  getQueue,
  getPendingQueue,
  getPendingCount,

  enqueue: async (options) => {
    const item = await enqueueOfflineAction({
      type: options.type || 'MUTATION',
      endpoint: options.endpoint,
      method: options.method || 'POST',
      payload: options.payload || {},
      label: options.label || options.title || 'Transaksi Offline',
      title: options.title || options.label || 'Transaksi Offline'
    });
    return item;
  },

  removeItem: async (id) => {
    return await removeQueueItem(id);
  },

  clear: async () => {
    return await clearQueue();
  },

  flush: async (apiInstance) => {
    const res = await flushOfflineQueue(apiInstance);
    return {
      successCount: res?.synced || 0,
      failCount: res?.failed || 0,
      deadLetterCount: res?.deadLetters || 0,
      remaining: res?.pending || 0
    };
  },

  initSync: (apiCaller) => {
    initOfflineSync(apiCaller);
  }
};

export default offlineQueue;
