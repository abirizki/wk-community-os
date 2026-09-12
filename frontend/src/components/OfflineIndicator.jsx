import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from 'lucide-react';
import { getPendingCount, flushOfflineQueue } from '../utils/offlineStorage';
import { api } from '../utils/api';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  const updateQueueCount = async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  };

  useEffect(() => {
    updateQueueCount();

    const handleOnline = () => {
      setIsOnline(true);
      handleManualSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChanged = (e) => {
      setPendingCount(e.detail?.count ?? 0);
    };

    const handleSyncCompleted = (e) => {
      if (e.detail?.synced > 0) {
        setSyncToast(`${e.detail.synced} data offline berhasil disinkronkan ke server!`);
        setTimeout(() => setSyncToast(null), 4000);
      }
      updateQueueCount();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('bw-offline-queue-changed', handleQueueChanged);
    window.addEventListener('bw-sync-completed', handleSyncCompleted);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('bw-offline-queue-changed', handleQueueChanged);
      window.removeEventListener('bw-sync-completed', handleSyncCompleted);
    };
  }, []);

  const handleManualSync = async () => {
    if (!navigator.onLine || isSyncing) return;
    setIsSyncing(true);
    try {
      const res = await flushOfflineQueue(api);
      if (res.synced > 0) {
        setSyncToast(`${res.synced} data berhasil disinkronkan!`);
        setTimeout(() => setSyncToast(null), 4000);
      }
    } catch (e) {
      console.warn('Sync failed:', e);
    } finally {
      setIsSyncing(false);
      updateQueueCount();
    }
  };

  return (
    <>
      <AnimatePresence>
        {/* Offline Banner */}
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-amber-500 text-white text-xs font-medium px-4 py-2 flex items-center justify-between shadow-md z-40 relative"
          >
            <div className="flex items-center gap-2">
              <WifiOff size={16} className="animate-pulse" />
              <span>
                <strong>Mode Offline:</strong> Anda tidak terhubung ke internet. Data yang Anda simpan akan masuk antrean lokal ({pendingCount} pending).
              </span>
            </div>
            <span className="text-[11px] bg-amber-700/60 px-2 py-0.5 rounded text-amber-100 font-mono">
              Offline Cache Aktif
            </span>
          </motion.div>
        )}

        {/* Online Pending Sync Notice */}
        {isOnline && pendingCount > 0 && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="bg-primary text-on-primary text-xs font-medium px-4 py-2 flex items-center justify-between shadow-md z-40 relative"
          >
            <div className="flex items-center gap-2">
              <CloudUpload size={16} />
              <span>
                Terdapat <strong>{pendingCount}</strong> data formulir/catatan yang belum disinkronkan ke server.
              </span>
            </div>
            <button
              onClick={handleManualSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-2.5 py-1 rounded shadow-sm hover:bg-slate-100 transition disabled:opacity-50"
            >
              <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
              {isSyncing ? 'Sinkronisasi...' : 'Sinkronkan Sekarang'}
            </button>
          </motion.div>
        )}

        {/* Success Toast */}
        {syncToast && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-600"
          >
            <CheckCircle2 size={18} className="text-emerald-300 flex-shrink-0" />
            <span className="text-xs font-medium">{syncToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

