/**
 * frontend/src/utils/offlineQueue.js
 * Offline-First Mutation Queue Manager (Tahap 6: Anti-Blank Spot)
 * Bumi Warga - Jabar Pintar Digital
 */

const QUEUE_KEY = 'WK_OFFLINE_MUTATION_QUEUE';

export const offlineQueue = {
  /**
   * Cek apakah saat ini perangkat sedang online
   */
  isOnline() {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  /**
   * Ambil seluruh antrean transaksi yang tertahan offline
   */
  getQueue() {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Gagal membaca antrean offline:', e);
      return [];
    }
  },

  /**
   * Tambahkan aksi transaksi ke antrean offline
   */
  enqueue({ endpoint, method = 'POST', payload = {}, title = 'Transaksi Offline' }) {
    const queue = this.getQueue();
    const item = {
      id: `OFFLINE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      endpoint,
      method,
      payload,
      title,
      createdAt: new Date().toISOString(),
      retryCount: 0
    };
    queue.push(item);
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      // Dispatch custom event agar UI segera merespons
      window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: { count: queue.length } }));
    } catch (e) {
      console.error('Gagal menyimpan ke antrean offline:', e);
    }
    return item;
  },

  /**
   * Hapus satu item dari antrean
   */
  removeItem(id) {
    const queue = this.getQueue().filter((item) => item.id !== id);
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
      window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: { count: queue.length } }));
    } catch (e) {}
    return queue;
  },

  /**
   * Bersihkan seluruh antrean offline
   */
  clear() {
    try {
      localStorage.removeItem(QUEUE_KEY);
      window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: { count: 0 } }));
    } catch (e) {}
  },

  /**
   * Kirim ulang seluruh antrean offline ke server saat koneksi internet pulih
   */
  async flush(apiInstance) {
    const queue = this.getQueue();
    if (queue.length === 0) return { successCount: 0, failCount: 0 };

    let successCount = 0;
    let failCount = 0;
    const remainingQueue = [];

    for (const item of queue) {
      try {
        if (item.method === 'POST') {
          await apiInstance.post(item.endpoint, item.payload);
        } else if (item.method === 'PATCH') {
          await apiInstance.patch(item.endpoint, item.payload);
        } else if (item.method === 'PUT') {
          await apiInstance.put(item.endpoint, item.payload);
        }
        successCount++;
      } catch (err) {
        console.warn(`Sinkronisasi item ${item.title} gagal:`, err.message);
        item.retryCount = (item.retryCount || 0) + 1;
        item.lastError = err.message;
        remainingQueue.push(item);
        failCount++;
      }
    }

    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
      window.dispatchEvent(new CustomEvent('offline-queue-updated', { detail: { count: remainingQueue.length } }));
    } catch (e) {}

    return { successCount, failCount, remaining: remainingQueue.length };
  }
};

