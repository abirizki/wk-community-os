import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * @typedef {'low' | 'medium' | 'high' | 'critical'} KPICardUrgency
 * @typedef {'up' | 'down' | 'flat'} KPICardTrendDirection
 *
 * @typedef {Object} KPICardTrend
 * @property {KPICardTrendDirection} direction - Arah pergerakan metrik ('up' | 'down' | 'flat')
 * @property {number|string} [value] - Nilai kuantitatif pergerakan (misal: 12, '12.5%')
 * @property {string} [label] - Label konteks perbandingan (misal: 'vs bulan lalu', 'target')
 */

/**
 * Konfigurasi styling visual berdasarkan tingkat urgensi.
 * Menjamin kepatuhan rasio kontras WCAG AA untuk tema Bumi Warga.
 */
const URGENCY_CONFIG = {
  critical: {
    border: 'border-l-red-600',
    iconCircle: 'bg-red-50 text-red-700 border border-red-200',
  },
  high: {
    border: 'border-l-amber-500',
    iconCircle: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  medium: {
    border: 'border-l-sky-500',
    iconCircle: 'bg-sky-50 text-sky-700 border border-sky-200',
  },
  low: {
    border: 'border-l-slate-400',
    iconCircle: 'bg-slate-100 text-slate-700 border border-slate-200',
  },
};

/**
 * Konfigurasi badge tren metrik dengan warna status WCAG AA.
 */
const TREND_CONFIG = {
  up: {
    icon: TrendingUp,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  down: {
    icon: TrendingDown,
    badgeClass: 'bg-red-50 text-red-800 border-red-200',
  },
  flat: {
    icon: Minus,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

/**
 * Komponen KPICard menampilkan kartu metrik tunggal untuk dashboard tata kelola kependudukan & layanan kelurahan.
 *
 * @component
 * @param {Object} props
 * @param {string} props.label - Label metrik KPI, misal: 'Total Warga Aktif'
 * @param {number|string} props.value - Nilai metrik numerik atau string
 * @param {string} [props.unit] - Satuan unit, misal: 'jiwa', 'berkas', 'KK'
 * @param {import('react').ReactNode} [props.icon] - Elemen ikon lucide-react
 * @param {KPICardTrend|null} [props.trend] - Indikator tren performa
 * @param {KPICardUrgency} [props.urgency='low'] - Tingkat urgensi indikator aksen
 * @param {function(import('react').MouseEvent): void} [props.onClick] - Handler aksi klik opsional
 * @param {string} [props.className=''] - Kelas Tailwind tambahan
 * @returns {import('react').JSX.Element}
 */
export default function KPICard({
  label,
  value,
  unit,
  icon,
  trend = null,
  urgency = 'low',
  onClick,
  className = '',
}) {
  const currentUrgency = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.low;

  // Format nilai angka menggunakan pemisah ribuan standar Indonesia (id-ID)
  const formattedValue = useMemo(() => {
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (typeof value === 'number') {
      return new Intl.NumberFormat('id-ID').format(value);
    }
    return String(value);
  }, [value]);

  // Format nilai tren persentase
  const formattedTrendValue = useMemo(() => {
    if (!trend || trend.value === null || trend.value === undefined) {
      return null;
    }
    const val = trend.value;
    if (typeof val === 'number') {
      const prefix = trend.direction === 'up' && val > 0 ? '+' : '';
      return `${prefix}${val}%`;
    }
    return String(val);
  }, [trend]);

  const trendConfig = trend?.direction ? (TREND_CONFIG[trend.direction] || TREND_CONFIG.flat) : null;
  const TrendIcon = trendConfig?.icon;

  // Keyboard accessibility handler jika kartu dapat diklik
  const handleKeyDown = (event) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event);
    }
  };

  const isInteractive = typeof onClick === 'function';

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={label ? `${label}: ${formattedValue}${unit ? ` ${unit}` : ''}` : undefined}
      className={`
        relative w-full h-full bg-white rounded-lg p-5
        border border-slate-200 ${currentUrgency.border} border-l-4
        shadow-card flex flex-col justify-between
        ${isInteractive
          ? 'cursor-pointer transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 select-none'
          : ''
        }
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div>
        {/* Baris Atas: Ikon & Indikator Tren */}
        {(icon || trend) && (
          <div className="flex items-center justify-between gap-3 mb-3">
            {icon ? (
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 [&>svg]:w-5 [&>svg]:h-5 ${currentUrgency.iconCircle}`}
                aria-hidden="true"
              >
                {icon}
              </div>
            ) : (
              <div />
            )}

            {trend && trendConfig && (
              <div
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${trendConfig.badgeClass}`}
                title={trend.label ? `${trend.direction}: ${formattedTrendValue || ''} ${trend.label}` : undefined}
              >
                {TrendIcon && <TrendIcon className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />}
                {formattedTrendValue && <span>{formattedTrendValue}</span>}
                {trend.label && (
                  <span className="font-normal opacity-85 text-[11px] ml-0.5">
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Label Metrik KPI */}
        {label && (
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">
            {label}
          </h3>
        )}
      </div>

      {/* Nilai Utama & Satuan Unit */}
      <div className="flex items-baseline gap-1.5 mt-2">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {formattedValue}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-500">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
