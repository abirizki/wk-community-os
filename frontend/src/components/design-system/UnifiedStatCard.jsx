import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';

/**
 * @typedef {'low' | 'medium' | 'high' | 'critical' | 'neutral' | 'success'} StatUrgency
 * @typedef {'up' | 'down' | 'flat'} StatTrendDirection
 *
 * @typedef {Object} StatTrend
 * @property {StatTrendDirection} direction - Arah tren ('up' | 'down' | 'flat')
 * @property {number|string} [value] - Nilai kuantitatif (misal: 12, '12.5%')
 * @property {string} [label] - Konteks perbandingan (misal: 'vs minggu lalu')
 * @property {boolean} [isPositive] - True jika arah tren ini berita baik. Default: up=true, down=false.
 *                                    Jika false, arah 'up' akan diwarnai merah (misal: aduan naik, tunggakan naik).
 */

const URGENCY_CONFIG = {
  critical: {
    border: 'border-l-rose-600',
    iconCircle: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900',
  },
  high: {
    border: 'border-l-amber-500',
    iconCircle: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900',
  },
  medium: {
    border: 'border-l-sky-500',
    iconCircle: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-900',
  },
  success: {
    border: 'border-l-emerald-600',
    iconCircle: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900',
  },
  low: {
    border: 'border-l-slate-400 dark:border-l-slate-600',
    iconCircle: 'bg-surface-container text-on-surface-variant border border-outline-variant',
  },
  neutral: {
    border: 'border-l-primary',
    iconCircle: 'bg-primary/10 text-primary border border-primary/20',
  },
};

/**
 * UnifiedStatCard
 * Standar Kartu Metrik Bumi Warga (Sprint Polish UI/UX)
 *
 * Spesifikasi Desain:
 * - Padding: 16px (p-4)
 * - Tinggi minimum: 112px (min-h-[112px]), flex-col justify-between
 * - Pola baca: Label -> Nilai + Satuan -> Denominator / Konteks Pembanding
 * - Tren semantik: Warna berdasarkan dampak positif/negatif, bukan sekadar arah panah
 * - Loading Skeleton: Ukuran tetap tanpa Cumulative Layout Shift (CLS)
 */
export default function UnifiedStatCard({
  label,
  value,
  unit,
  denominator,
  context,
  icon,
  trend = null,
  urgency = 'low',
  loading = false,
  onClick,
  className = '',
}) {
  const currentUrgency = URGENCY_CONFIG[urgency] || URGENCY_CONFIG.low;
  const isInteractive = typeof onClick === 'function';

  // Format nilai utama
  const formattedValue = useMemo(() => {
    if (value === null || value === undefined || value === '') {
      return '0';
    }
    if (typeof value === 'number') {
      return new Intl.NumberFormat('id-ID').format(value);
    }
    return String(value);
  }, [value]);

  // Tren semantik dengan warna cerdas (isPositive flag)
  const trendElement = useMemo(() => {
    if (!trend || !trend.direction) return null;

    const dir = trend.direction;
    const isUp = dir === 'up';
    const isDown = dir === 'down';
    const isFlat = dir === 'flat';

    // Logika semantik: apakah kenaikan/penurunan ini kabar baik?
    const isGoodNews = trend.isPositive !== undefined
      ? Boolean(trend.isPositive)
      : isUp; // Default: up = baik, down = buruk

    let badgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    let IconComp = Minus;

    if (isFlat) {
      IconComp = Minus;
    } else if (isGoodNews) {
      badgeClass = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      IconComp = isUp ? TrendingUp : TrendingDown;
    } else {
      badgeClass = 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      IconComp = isUp ? TrendingUp : TrendingDown;
    }

    const formattedTrendVal = trend.value !== undefined && trend.value !== null
      ? (typeof trend.value === 'number' && trend.value > 0 && isUp ? `+${trend.value}%` : `${trend.value}`)
      : null;

    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass} shrink-0`}
        title={trend.label ? `${trend.label}` : undefined}
      >
        <IconComp className="w-3 h-3 shrink-0" aria-hidden="true" />
        {formattedTrendVal && <span>{formattedTrendVal}</span>}
        {trend.label && <span className="font-medium opacity-90">{trend.label}</span>}
      </div>
    );
  }, [trend]);

  // Keyboard accessibility
  const handleKeyDown = (event) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick(event);
    }
  };

  // Skeleton Loading State dengan ukuran persis sama (Mencegah CLS)
  if (loading) {
    return (
      <div className={`p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant shadow-sm min-h-[112px] flex flex-col justify-between animate-pulse ${className}`}>
        <div className="flex items-center justify-between">
          <div className="h-3 w-24 bg-surface-container-highest rounded" />
          <div className="w-7 h-7 rounded-lg bg-surface-container-highest" />
        </div>
        <div className="space-y-1.5 mt-3">
          <div className="h-7 w-16 bg-surface-container-highest rounded" />
          <div className="h-2.5 w-32 bg-surface-container-highest rounded" />
        </div>
      </div>
    );
  }

  const denominatorText = denominator || context;

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant ${currentUrgency.border} border-l-4
        shadow-sm min-h-[112px] flex flex-col justify-between transition-all group
        ${isInteractive
          ? 'cursor-pointer hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          : ''
        }
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {/* Baris Atas: Label Metrik & Ikon / Tren */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-xs font-semibold text-on-surface-variant line-clamp-1 tracking-tight">
          {label}
        </h3>

        <div className="flex items-center gap-1.5 shrink-0">
          {trendElement}
          {icon && (
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4 ${currentUrgency.iconCircle}`}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          {isInteractive && !icon && (
            <ChevronRight size={14} className="text-on-surface-variant/40 group-hover:text-primary transition-colors" />
          )}
        </div>
      </div>

      {/* Baris Bawah: Nilai Utama & Konteks Denominator */}
      <div className="mt-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight font-mono">
            {formattedValue}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-on-surface-variant">
              {unit}
            </span>
          )}
        </div>

        {denominatorText && (
          <p className="text-[11px] text-on-surface-variant font-medium mt-0.5 line-clamp-1">
            {denominatorText}
          </p>
        )}
      </div>
    </div>
  );
}
