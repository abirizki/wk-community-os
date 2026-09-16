import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  XCircle,
  RotateCcw,
  Info,
  HelpCircle,
} from 'lucide-react';

/**
 * StatusBadge Component
 *
 * A semantic status chip/badge designed for the Bumi Warga digital governance platform.
 * Maps document and workflow status keys to WCAG AA compliant visual tokens and human-readable Indonesian labels.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.status] - Status key (e.g., 'PENDING_RT', 'APPROVED', 'SELESAI', 'LUNAS', 'BELUM_BAYAR', etc.)
 * @param {'sm' | 'md' | 'lg'} [props.size='sm'] - Size variant of the badge
 * @param {string} [props.className=''] - Additional Tailwind CSS classes
 * @param {string} [props.label] - Custom human-readable label override
 * @param {React.ReactNode} [props.children] - Children to override label display
 * @param {boolean} [props.showIcon=true] - Whether to display the contextual status icon
 * @param {React.ReactNode} [props.icon] - Custom icon override
 * @returns {JSX.Element}
 */
export default function StatusBadge({
  status = '',
  size = 'sm',
  className = '',
  label,
  children,
  showIcon = true,
  icon,
  ...props
}) {
  // Normalize status string for resilient key lookup
  const normalizedKey = typeof status === 'string' ? status.trim().toUpperCase() : '';

  const config = STATUS_MAP[normalizedKey] || getFallbackConfig(status);

  // Size styling tokens
  const sizeStyle = SIZE_MAP[size] || SIZE_MAP.sm;

  // Determine final label to render
  const displayLabel = children ?? label ?? config.label;

  // Determine Icon component to render
  const IconComponent = config.icon;

  return (
    <span
      role="status"
      aria-label={typeof displayLabel === 'string' ? displayLabel : normalizedKey}
      className={`inline-flex items-center justify-center font-semibold rounded-full border transition-colors select-none ${config.colorClass} ${sizeStyle.container} ${className}`.trim()}
      {...props}
    >
      {showIcon && (
        icon !== undefined ? (
          icon
        ) : (
          IconComponent && (
            <IconComponent
              size={sizeStyle.iconSize}
              className="flex-shrink-0"
              aria-hidden="true"
            />
          )
        )
      )}
      <span>{displayLabel}</span>
    </span>
  );
}

/**
 * WCAG AA Compliant Status Color Tokens
 * - Green (emerald): bg-emerald-50 text-emerald-800 border-emerald-200
 * - Yellow (amber):   bg-amber-50 text-amber-800 border-amber-200
 * - Red (red):       bg-red-50 text-red-800 border-red-200
 * - Blue (sky):      bg-sky-50 text-sky-800 border-sky-200
 * - Gray (slate):    bg-slate-100 text-slate-700 border-slate-200
 */
const STATUS_MAP = {
  // === GREEN / SUCCESS ===
  APPROVED: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Disetujui',
    icon: CheckCircle2,
  },
  DISETUJUI: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Disetujui',
    icon: CheckCircle2,
  },
  DISETUJUI_PENCABUTAN: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Disetujui: Pencabutan',
    icon: CheckCircle2,
  },
  DISETUJUI_INKLUSI: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Disetujui: Inklusi',
    icon: CheckCircle2,
  },
  SELESAI: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Selesai',
    icon: CheckCircle2,
  },
  LUNAS: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Lunas',
    icon: CheckCircle2,
  },
  PAID: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Lunas',
    icon: CheckCircle2,
  },
  DONE: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Selesai',
    icon: CheckCircle2,
  },
  RESOLVED: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Selesai',
    icon: CheckCircle2,
  },
  AKTIF: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Aktif',
    icon: CheckCircle2,
  },
  ACTIVE: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Aktif',
    icon: CheckCircle2,
  },
  SUKSES: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Sukses',
    icon: CheckCircle2,
  },
  SUCCESS: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Sukses',
    icon: CheckCircle2,
  },
  SENT: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Terkirim',
    icon: CheckCircle2,
  },
  DISBURSED: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Tersalurkan',
    icon: CheckCircle2,
  },
  READY_PICKUP: {
    colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    label: 'Siap Diambil',
    icon: CheckCircle2,
  },

  // === YELLOW / WARNING ===
  // === READY FOR TTE (PENGESAHAN LURAH) ===
  READY_FOR_TTE: {
    colorClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    label: 'Siap TTE',
    icon: CheckCircle2,
  },
  READY_TTE: {
    colorClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    label: 'Siap TTE',
    icon: CheckCircle2,
  },
  SIAP_TTE: {
    colorClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    label: 'Siap TTE',
    icon: CheckCircle2,
  },

  // === OFFLINE ===
  OFFLINE: {
    colorClass: 'bg-slate-200 text-slate-800 border-slate-300',
    label: 'Offline (Lokal)',
    icon: AlertTriangle,
  },

  // === YELLOW / WARNING / AGING ===
  AGING: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Mendekati Tenggat (Aging)',
    icon: Clock,
  },
  WARNING: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Peringatan',
    icon: AlertCircle,
  },
  PENDING_RT: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Menunggu RT',
    icon: Clock,
  },
  PENDING_RW: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Menunggu RW',
    icon: Clock,
  },
  PENDING_KELURAHAN: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Menunggu Kelurahan',
    icon: Clock,
  },
  BELUM_BAYAR: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Belum Bayar',
    icon: AlertCircle,
  },
  UNPAID: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Belum Bayar',
    icon: AlertCircle,
  },
  DALAM_PROSES: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Dalam Proses',
    icon: Clock,
  },
  PENDING: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Menunggu',
    icon: Clock,
  },
  MENUNGGU: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Menunggu',
    icon: Clock,
  },
  DIPROSES: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Diproses',
    icon: Clock,
  },
  PROCESSING: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Diproses',
    icon: Clock,
  },
  PROSES: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Diproses',
    icon: Clock,
  },
  IN_PROGRESS: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Dalam Proses',
    icon: Clock,
  },
  REVIEW: {
    colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
    label: 'Dalam Telaah',
    icon: Clock,
  },

  // === RED / CRITICAL ===
  // === RED / CRITICAL / OVERDUE / REJECTED ===
  OVERDUE: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Terlampaui (Overdue)',
    icon: AlertTriangle,
  },
  CRITICAL: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Kritis',
    icon: AlertTriangle,
  },
  REJECTED: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Ditolak',
    icon: XCircle,
  },
  DITOLAK: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Ditolak',
    icon: XCircle,
  },
  GAGAL: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Gagal',
    icon: XCircle,
  },
  FAILED: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Gagal',
    icon: XCircle,
  },
  BATAL: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Dibatalkan',
    icon: XCircle,
  },
  CANCELLED: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Dibatalkan',
    icon: XCircle,
  },
  EXPIRED: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Kedaluwarsa',
    icon: AlertTriangle,
  },
  TIDAK_LAYAK: {
    colorClass: 'bg-red-50 text-red-800 border-red-200',
    label: 'Tidak Layak',
    icon: XCircle,
  },

  // === BLUE / INFO ===
  RETURNED: {
    colorClass: 'bg-sky-50 text-sky-800 border-sky-200',
    label: 'Dikembalikan',
    icon: RotateCcw,
  },
  REVISION: {
    colorClass: 'bg-sky-50 text-sky-800 border-sky-200',
    label: 'Perlu Revisi',
    icon: RotateCcw,
  },
  REVISI: {
    colorClass: 'bg-sky-50 text-sky-800 border-sky-200',
    label: 'Perlu Revisi',
    icon: RotateCcw,
  },
  DIKEMBALIKAN: {
    colorClass: 'bg-sky-50 text-sky-800 border-sky-200',
    label: 'Dikembalikan',
    icon: RotateCcw,
  },
  INFO: {
    colorClass: 'bg-sky-50 text-sky-800 border-sky-200',
    label: 'Informasi',
    icon: Info,
  },
  INFORMASI: {
    colorClass: 'bg-sky-50 text-sky-800 border-sky-200',
    label: 'Informasi',
    icon: Info,
  },

  // === GRAY / DEFAULT ===
  DRAFT: {
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Draf',
    icon: HelpCircle,
  },
  ARSIP: {
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Diarsipkan',
    icon: HelpCircle,
  },
  ARCHIVED: {
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Diarsipkan',
    icon: HelpCircle,
  },
  NONAKTIF: {
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Nonaktif',
    icon: HelpCircle,
  },
  INACTIVE: {
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    label: 'Nonaktif',
    icon: HelpCircle,
  },
};

/**
 * Size styling maps
 */
const SIZE_MAP = {
  sm: {
    container: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    iconSize: 12,
  },
  md: {
    container: 'text-xs px-3 py-1 gap-1.5',
    iconSize: 14,
  },
  lg: {
    container: 'text-sm px-3.5 py-1.5 gap-2',
    iconSize: 16,
  },
};

/**
 * Generates fallback configuration for unknown status strings
 *
 * @param {*} rawStatus
 * @returns {{ colorClass: string, label: string, icon: React.ComponentType }}
 */
function getFallbackConfig(rawStatus) {
  if (!rawStatus) {
    return {
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
      label: 'Tidak Diketahui',
      icon: HelpCircle,
    };
  }

  // Format snake_case / kebab-case / raw text into human-readable Title Case
  const formatted = String(rawStatus)
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  return {
    colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    label: formatted || 'Tidak Diketahui',
    icon: HelpCircle,
  };
}
