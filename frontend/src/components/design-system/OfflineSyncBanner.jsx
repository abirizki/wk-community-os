import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Check,
  X,
  CloudOff,
  CloudUpload
} from 'lucide-react';

/**
 * Format timestamp sinkronisasi terakhir ke bahasa Indonesia
 * @param {string|Date|null} timestamp - Waktu sinkronisasi
 * @returns {string|null} String tanggal/jam terformat
 */
function formatLastSync(timestamp) {
  if (!timestamp) return null;
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return String(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    }).format(d);
  } catch {
    return String(timestamp);
  }
}

/**
 * OfflineSyncBanner Component (Design System Enhanced Version)
 *
 * Banner status jaringan & hub sinkronisasi data lapangan offline yang ditempatkan
 * di bagian atas halaman (fixed/sticky) dengan indikator progress dan kontrol sesi.
 *
 * @component
 * @param {Object} props
 * @param {boolean} [props.isOnline=true] - Status koneksi internet saat ini
 * @param {number} [props.pendingCount=0] - Jumlah mutasi/data lokal yang belum tersinkron
 * @param {boolean} [props.isSyncing=false] - Status proses sinkronisasi sedang berjalan
 * @param {number} [props.syncProgress=0] - Persentase kemajuan sinkronisasi (0-100)
 * @param {string|Date|null} [props.lastSyncAt=null] - Timestamp sinkronisasi berhasil terakhir
 * @param {() => void} [props.onSync] - Callback untuk memicu sinkronisasi manual
 * @param {string} [props.className=''] - ClassName tambahan
 * @returns {JSX.Element|null}
 */
export default function OfflineSyncBanner({
  isOnline = true,
  pendingCount = 0,
  isSyncing = false,
  syncProgress = 0,
  lastSyncAt = null,
  onSync,
  className = ''
}) {
  const [isDismissed, setIsDismissed] = useState(false);
  const safePending = Math.max(0, Number(pendingCount) || 0);
  const safeProgress = Math.min(100, Math.max(0, Number(syncProgress) || 0));
  const formattedSyncTime = formatLastSync(lastSyncAt);

  // Reset status dismiss secara otomatis jika status koneksi berubah, ada item baru, atau sedang sinkron
  useEffect(() => {
    setIsDismissed(false);
  }, [isOnline, pendingCount, isSyncing]);

  // Skenario 1: Jika online dan tidak ada antrean pending serta tidak sedang syncing -> sembunyikan banner
  if (isOnline && safePending === 0 && !isSyncing) {
    return null;
  }

  // Jika di-dismiss oleh pengguna untuk sesi saat ini
  if (isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -24 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        role="alert"
        aria-live="polite"
        className={`sticky top-0 z-40 w-full shadow-card transition-colors ${className}`}
      >
        {/* KONDISI 1: OFFLINE (Amber/Yellow Banner) */}
        {!isOnline && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200 flex-shrink-0 flex items-center justify-center">
                  <WifiOff size={16} className="animate-pulse" />
                </div>
                <div className="text-xs sm:text-sm font-medium leading-tight">
                  <span className="font-semibold text-amber-950">
                    Anda sedang offline. Data disimpan lokal.
                  </span>
                  {safePending > 0 ? (
                    <span className="text-amber-800 ml-1">
                      Terdapat <strong>{safePending} perubahan</strong> menunggu koneksi untuk dikirim.
                    </span>
                  ) : (
                    <span className="text-amber-800/90 ml-1 hidden sm:inline">
                      Semua formulir lapangan tetap dapat diisi dan aman.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                {/* Badge Status Offline */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  <CloudOff size={12} />
                  <span>Offline-First</span>
                </span>

                {/* Info Last Sync jika tersedia */}
                {formattedSyncTime && (
                  <span className="hidden md:inline-flex text-[11px] text-amber-800">
                    Sinkron terakhir: {formattedSyncTime}
                  </span>
                )}

                {/* Tombol Tutup / Dismiss Banner */}
                <button
                  type="button"
                  onClick={() => setIsDismissed(true)}
                  className="p-1 text-amber-800 hover:text-amber-950 hover:bg-amber-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  aria-label="Tutup notifikasi offline"
                  title="Tutup banner untuk sesi ini"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* KONDISI 2: ONLINE DENGAN SYNC BERJALAN ATAU ANTREAN TERTUNDA (Blue Banner) */}
        {isOnline && (isSyncing || safePending > 0) && (
          <div className="bg-sky-50 border-b border-sky-200 text-sky-900 px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                {/* Info Teks & Icon */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="p-1.5 rounded-lg bg-sky-100 text-sky-800 border border-sky-200 flex-shrink-0 flex items-center justify-center">
                    {isSyncing ? (
                      <RefreshCw size={16} className="animate-spin text-primary" />
                    ) : (
                      <Wifi size={16} className="text-sky-700" />
                    )}
                  </div>

                  <div className="text-xs sm:text-sm font-medium leading-tight">
                    {isSyncing ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sky-950">Menyinkronkan...</span>
                        <span className="text-sky-800">
                          {safePending > 0
                            ? `Memproses ${safePending} mutasi lapangan ke server`
                            : 'Mengirimkan data lokal ke server'}
                        </span>
                        {safeProgress > 0 && (
                          <span className="font-mono text-xs font-bold text-primary">
                            ({safeProgress}%)
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sky-950">
                          {safePending} mutasi menunggu sinkronisasi.
                        </span>
                        <span className="text-sky-800 hidden sm:inline">
                          Koneksi internet terhubung dan siap dikirim.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kontrol & Tombol Aksi */}
                <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                  {/* Badge Sukses jika sinkronisasi mencapai 100% */}
                  {isSyncing && safeProgress === 100 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Check size={12} className="stroke-[2.5]" />
                      Selesai
                    </span>
                  )}

                  {/* Tombol Manual Trigger Sync */}
                  {!isSyncing && onSync && (
                    <button
                      type="button"
                      onClick={onSync}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-sky-700 active:bg-sky-800 text-on-primary text-xs font-semibold rounded-lg shadow-card transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                      title="Sinkronkan data sekarang"
                    >
                      <CloudUpload size={14} className="stroke-[2.2]" />
                      <span>Sinkronkan Sekarang</span>
                    </button>
                  )}

                  {/* Timestamp Sinkron Terakhir */}
                  {formattedSyncTime && !isSyncing && (
                    <span className="hidden md:inline-flex text-[11px] text-sky-800">
                      Terakhir: {formattedSyncTime}
                    </span>
                  )}

                  {/* Tombol Dismiss */}
                  <button
                    type="button"
                    onClick={() => setIsDismissed(true)}
                    className="p-1 text-sky-800 hover:text-sky-950 hover:bg-sky-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                    aria-label="Tutup notifikasi sinkronisasi"
                    title="Tutup banner untuk sesi ini"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* PROGRESS BAR KETIKA SEDANG SINKRONISASI */}
              {isSyncing && (
                <div
                  className="w-full bg-sky-200/70 rounded-full h-1.5 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={safeProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progres sinkronisasi data"
                >
                  {safeProgress > 0 ? (
                    <motion.div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${safeProgress}%` }}
                    />
                  ) : (
                    <motion.div
                      className="bg-primary h-full rounded-full w-1/3"
                      animate={{
                        x: ['-100%', '300%']
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.4,
                        ease: 'easeInOut'
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  );
}
