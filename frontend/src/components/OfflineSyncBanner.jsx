/**
 * frontend/src/components/OfflineSyncBanner.jsx
 * Indikator Status Jaringan & Hub Sinkronisasi Data Lapangan Offline (Tahap 6)
 * Bumi Warga - Jabar Pintar Digital
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { offlineQueue } from '../utils/offlineQueue';
import { api } from '../utils/api';

export default function OfflineSyncBanner() {
  const [isOnline, setIsOnline] = useState(offlineQueue.isOnline());
  const [queueCount, setQueueCount] = useState(offlineQueue.getQueue().length);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Coba flush otomatis saat koneksi kembali
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncResult(null);
    };

    const handleQueueUpdate = (e) => {
      setQueueCount(e.detail?.count || offlineQueue.getQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-queue-updated', handleQueueUpdate);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-queue-updated', handleQueueUpdate);
    };
  }, []);

  const triggerSync = async () => {
    if (!offlineQueue.isOnline()) return;
    const currentQueue = offlineQueue.getQueue();
    if (currentQueue.length === 0) return;

    try {
      setSyncing(true);
      const res = await offlineQueue.flush(api);
      setQueueCount(res.remaining);
      if (res.successCount > 0) {
        setSyncResult(`Berhasil menyinkronkan ${res.successCount} data lapangan ke server!`);
        setTimeout(() => setSyncResult(null), 5000);
      }
    } catch (e) {
      console.warn('Sync error:', e);
    } finally {
      setSyncing(false);
    }
  };

  // Jangan render apa pun jika online dan tidak ada antrean
  if (isOnline && queueCount === 0 && !syncResult) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="sticky top-0 z-40 w-full">
        {/* BANNER OFFLINE */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md border-b border-amber-600"
          >
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="text-amber-950 flex-shrink-0 animate-pulse" />
              <span>
                <strong>Mode Bekerja Offline Aktif (Tanpa Sinyal).</strong> Anda tetap dapat mencatat data lapangan. Perubahan akan disimpan di perangkat ini ({queueCount} data tersimpan).
              </span>
            </div>
            <span className="hidden sm:inline-block px-2 py-0.5 bg-amber-600/30 rounded text-[10px] font-mono">
              OFFLINE-FIRST
            </span>
          </motion.div>
        )}

        {/* BANNER ONLINE DENGAN ANTREAN TERTUNDA */}
        {isOnline && queueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-sky-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md border-b border-sky-700"
          >
            <div className="flex items-center gap-2">
              <Wifi size={16} className="text-sky-200 flex-shrink-0" />
              <span>
                Koneksi internet terhubung kembali. Terdapat <strong>{queueCount} data lapangan offline</strong> yang siap disinkronkan ke pangkalan data server.
              </span>
            </div>
            <button
              onClick={triggerSync}
              disabled={syncing}
              className="px-3 py-1 bg-white text-sky-800 rounded-lg hover:bg-sky-50 transition-colors flex items-center gap-1.5 shadow-sm font-bold disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}
            </button>
          </motion.div>
        )}

        {/* NOTIFIKASI SUKSES SINKRONISASI */}
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
          >
            <CheckCircle2 size={15} />
            <span>{syncResult}</span>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

