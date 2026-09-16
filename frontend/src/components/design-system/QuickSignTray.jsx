import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  Eye,
  FileCheck,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

/**
 * Format tanggal dalam format lokal Indonesia (id-ID)
 * @param {string|Date} dateVal - Tanggal yang akan diformat
 * @returns {string} String tanggal terformat
 */
function formatDate(dateVal) {
  if (!dateVal) return '-';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return String(dateVal);
  }
}

/**
 * Mendapatkan style badge urgensi dokumen sesuai standar WCAG AA
 * @param {string} urgency - Tingkat urgensi dokumen (urgent, tinggi, sedang, normal, dll)
 * @returns {{ label: string, badgeClass: string }}
 */
function getUrgencyBadge(urgency) {
  if (!urgency) return null;
  const lower = String(urgency).toLowerCase().trim();

  if (lower === 'urgent' || lower === 'mendesak' || lower === 'tinggi' || lower === 'high') {
    return {
      label: 'Mendesak',
      badgeClass: 'bg-red-50 text-red-800 border-red-200'
    };
  }
  if (lower === 'sedang' || lower === 'medium') {
    return {
      label: 'Sedang',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200'
    };
  }
  return {
    label: urgency.charAt(0).toUpperCase() + urgency.slice(1),
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  };
}

/**
 * QuickSignTray Component
 * 
 * Baki persetujuan/penandatanganan massal (batch sign tray) untuk petugas RT/RW/Kelurahan
 * dalam memproses pengajuan dokumen warga secara cepat dan efisien.
 *
 * @component
 * @param {Object} props
 * @param {Array<{id: string|number, nomor_registrasi?: string, jenis_surat?: string, pemohon?: string, created_at?: string|Date, urgency?: string}>} [props.items=[]] - Daftar dokumen yang menunggu tindakan
 * @param {(id: string|number) => void} [props.onApprove] - Callback saat tombol persetujuan per item diklik
 * @param {(ids: Array<string|number>) => void} [props.onApproveAll] - Callback saat tombol persetujuan massal diklik
 * @param {(id: string|number) => void} [props.onReject] - Callback saat tombol penolakan diklik
 * @param {(id: string|number) => void} [props.onViewDetail] - Callback saat tombol lihat rincian dokumen diklik
 * @param {string} [props.actionLabel='Setujui'] - Label untuk tombol persetujuan
 * @param {boolean} [props.loading=false] - Status loading proses
 * @param {string} [props.className=''] - ClassName kustom tambahan
 * @returns {JSX.Element|null}
 */
export default function QuickSignTray({
  items = [],
  onApprove,
  onApproveAll,
  onReject,
  onViewDetail,
  actionLabel = 'Setujui',
  loading = false,
  className = ''
}) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);

  // Filter items yang valid
  const safeItems = useMemo(() => {
    return Array.isArray(items) ? items.filter((item) => item && item.id != null) : [];
  }, [items]);

  const itemCount = safeItems.length;

  // Sinkronisasi seleksi ketika daftar item berubah
  useEffect(() => {
    if (safeItems.length > 0) {
      setSelectedIds((prev) => {
        const validIdSet = new Set(safeItems.map((item) => item.id));
        const stillSelected = prev.filter((id) => validIdSet.has(id));
        // Jika belum ada yang dipilih atau seleksi sebelumnya kosong, default pilih semua
        return stillSelected.length > 0 ? stillSelected : safeItems.map((item) => item.id);
      });
    } else {
      setSelectedIds([]);
    }
  }, [safeItems]);

  // Toggle pemilihan satu item
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle pemilihan semua item
  const allSelected = itemCount > 0 && selectedIds.length === itemCount;
  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(safeItems.map((item) => item.id));
    }
  };

  // Handler eksekusi batch approve
  const handleBatchApprove = () => {
    if (loading || selectedIds.length === 0) return;
    if (onApproveAll) {
      onApproveAll(selectedIds);
    }
  };

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.aside
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          aria-label="Baki Tindakan Cepat Dokumen"
          className={`fixed bottom-0 inset-x-0 z-50 w-full sm:bottom-6 sm:right-6 sm:left-auto sm:w-[480px] sm:max-w-[calc(100vw-3rem)] bg-surface-container-lowest border-t sm:border border-outline-variant shadow-elevated rounded-t-lg sm:rounded-lg overflow-hidden flex flex-col ${className}`}
        >
          {/* HEADER TRAY */}
          <header className="px-4 py-3 bg-surface-container-low border-b border-outline-variant flex items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                <FileCheck size={18} className="text-primary" />
              </div>
              <div className="flex items-center gap-2 truncate">
                <h2 className="text-sm font-bold text-on-surface truncate">Tindakan Cepat</h2>
                <span
                  className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-primary text-on-primary flex-shrink-0"
                  title={`${itemCount} dokumen menunggu tindakan`}
                >
                  {itemCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Tombol Batch Approve */}
              <button
                type="button"
                onClick={handleBatchApprove}
                disabled={loading || selectedIds.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-card transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                title={
                  selectedIds.length > 0
                    ? `${actionLabel} ${selectedIds.length} dokumen terpilih`
                    : 'Pilih dokumen terlebih dahulu'
                }
              >
                <Check size={14} className="stroke-[2.5]" />
                <span>
                  {selectedIds.length === itemCount
                    ? `${actionLabel} Semua`
                    : `${actionLabel} (${selectedIds.length})`}
                </span>
              </button>

              {/* Tombol Minimalkan / Perluas Tray */}
              <button
                type="button"
                onClick={() => setIsExpanded((prev) => !prev)}
                className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                aria-expanded={isExpanded}
                aria-label={isExpanded ? 'Sembunyikan daftar dokumen' : 'Tampilkan daftar dokumen'}
                title={isExpanded ? 'Kecilkan' : 'Buka'}
              >
                {isExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
              </button>
            </div>
          </header>

          {/* KONTEN DAFTAR DOKUMEN (EXPANDABLE) */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden flex flex-col"
              >
                {/* SUB-HEADER: Opsi Pilih Semua */}
                <div className="px-4 py-2 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between text-xs text-on-surface-variant">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={handleToggleSelectAll}
                      disabled={loading}
                      className="rounded border-outline text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer disabled:opacity-50"
                    />
                    <span>
                      {allSelected ? 'Batalkan Semua' : 'Pilih Semua'} ({selectedIds.length}/{itemCount})
                    </span>
                  </label>
                  <span className="text-[11px] text-on-surface-variant/70">
                    Geser untuk rincian
                  </span>
                </div>

                {/* LIST DOKUMEN DENGAN SCROLL */}
                <ul
                  className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-outline-variant/60 bg-surface-container-lowest"
                  role="list"
                >
                  {safeItems.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    const urgencyMeta = getUrgencyBadge(item.urgency);

                    return (
                      <li
                        key={item.id}
                        className={`p-3.5 hover:bg-surface-container-low transition-colors flex flex-col gap-2 ${
                          isSelected ? 'bg-primary-container/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox item */}
                          <div className="pt-0.5 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(item.id)}
                              disabled={loading}
                              aria-label={`Pilih dokumen ${item.nomor_registrasi || item.id}`}
                              className="rounded border-outline text-primary focus:ring-primary h-4 w-4 cursor-pointer disabled:opacity-50"
                            />
                          </div>

                          {/* Info Dokumen */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-0.5">
                              <span className="font-mono text-xs font-semibold text-primary">
                                {item.nomor_registrasi || `REG-${item.id}`}
                              </span>
                              {urgencyMeta && (
                                <span
                                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${urgencyMeta.badgeClass}`}
                                >
                                  {urgencyMeta.label}
                                </span>
                              )}
                            </div>

                            <p className="text-sm font-semibold text-on-surface truncate">
                              {item.jenis_surat || 'Surat Keterangan'}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 truncate">
                              <span className="truncate">
                                Pemohon: <strong className="text-on-surface font-medium">{item.pemohon || 'Warga'}</strong>
                              </span>
                              {item.created_at && (
                                <>
                                  <span aria-hidden="true">&bull;</span>
                                  <span className="text-[11px] whitespace-nowrap">
                                    {formatDate(item.created_at)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* TOMBOL AKSI INDIVIDUAL */}
                        <div className="flex items-center justify-end gap-1.5 pt-1 pl-7">
                          {/* Tombol Lihat Detail */}
                          {onViewDetail && (
                            <button
                              type="button"
                              onClick={() => onViewDetail(item.id)}
                              disabled={loading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-800 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border border-sky-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:opacity-50"
                              title="Lihat rincian dokumen"
                            >
                              <Eye size={13} className="text-sky-700 stroke-[2.2]" />
                              <span>Detail</span>
                            </button>
                          )}

                          {/* Tombol Tolak */}
                          {onReject && (
                            <button
                              type="button"
                              onClick={() => onReject(item.id)}
                              disabled={loading}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-800 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/40 disabled:opacity-50"
                              title="Tolak permohonan dokumen"
                            >
                              <X size={13} className="text-red-700 stroke-[2.5]" />
                              <span>Tolak</span>
                            </button>
                          )}

                          {/* Tombol Setujui Individu */}
                          {onApprove && (
                            <button
                              type="button"
                              onClick={() => onApprove(item.id)}
                              disabled={loading}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
                              title={`${actionLabel} dokumen ini`}
                            >
                              <Check size={13} className="stroke-[2.5]" />
                              <span>{actionLabel}</span>
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
