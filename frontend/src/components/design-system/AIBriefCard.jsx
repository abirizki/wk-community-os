import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  FileCheck,
  Wallet,
  Users,
  Gift,
  HeartPulse,
  MessageSquareWarning,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

/**
 * Icon lookup table for dynamically mapped suggested actions from the AI engine.
 */
const ICON_MAP = {
  FileCheck,
  Wallet,
  Users,
  Gift,
  HeartPulse,
  MessageSquareWarning,
  FileText,
  Activity,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Info,
};

/**
 * Severity configuration for priority items with strict WCAG AA contrast colors.
 */
const SEVERITY_MAP = {
  CRITICAL: {
    container: 'bg-red-50 text-red-900 border-red-200 border-l-red-600',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-800 border-red-200',
    badgeLabel: 'Mendesak',
    actionLink: 'text-red-800 hover:text-red-950',
  },
  WARNING: {
    container: 'bg-amber-50 text-amber-900 border-amber-200 border-l-amber-500',
    icon: AlertCircle,
    iconColor: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeLabel: 'Perhatian',
    actionLink: 'text-amber-800 hover:text-amber-950',
  },
  INFO: {
    container: 'bg-sky-50 text-sky-900 border-sky-200 border-l-sky-500',
    icon: Info,
    iconColor: 'text-sky-600',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    badgeLabel: 'Informasi',
    actionLink: 'text-sky-800 hover:text-sky-950',
  },
};

const DEFAULT_SEVERITY = {
  container: 'bg-slate-100 text-slate-800 border-slate-200 border-l-slate-400',
  icon: Info,
  iconColor: 'text-slate-600',
  badge: 'bg-slate-200 text-slate-800 border-slate-300',
  badgeLabel: 'Catatan',
  actionLink: 'text-slate-800 hover:text-slate-950',
};

/**
 * Formats date into Indonesian locale (e.g. 14 September 2026).
 * @param {string|Date} [dateVal]
 * @returns {string|null}
 */
function formatIndonesianDate(dateVal) {
  if (!dateVal) return null;
  try {
    const parsed = new Date(dateVal);
    if (isNaN(parsed.getTime())) return String(dateVal);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(parsed);
  } catch {
    return String(dateVal);
  }
}

/**
 * Formats number values with Indonesian thousand separators.
 * @param {string|number} val
 * @returns {string}
 */
function formatMetricNumber(val) {
  if (val === null || val === undefined) return '0';
  if (typeof val === 'number') {
    return new Intl.NumberFormat('id-ID').format(val);
  }
  return String(val);
}

/**
 * Renders an internal or external action link.
 */
function ActionItemLink({ to, className, children }) {
  if (to && (to.startsWith('http://') || to.startsWith('https://'))) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to || '#'} className={className}>
      {children}
    </Link>
  );
}

/**
 * AIBriefCard - Displays role-scoped daily AI brief for governance leaders and staff.
 *
 * Shows AI-generated executive summaries, KPI highlight pills, urgent priorities with
 * WCAG AA-compliant severity borders, and quick action buttons.
 *
 * @component
 * @param {Object} props
 * @param {Object} [props.brief] - The brief data object
 * @param {string} [props.brief.greeting] - Executive greeting message
 * @param {Array<{label: string, value: number|string, unit?: string, urgency?: 'high'|'low'}>} [props.brief.kpi_highlights] - Metric pills
 * @param {Array<{level: 'CRITICAL'|'WARNING'|'INFO', message: string, action_path?: string}>} [props.brief.priorities] - Actionable priority alerts
 * @param {Array<{label: string, path: string, icon?: string}>} [props.brief.suggested_actions] - Suggested action chips
 * @param {string} [props.brief.generated_at] - Generation date string (ISO / YYYY-MM-DD)
 * @param {boolean} [props.loading=false] - Shimmer loading state
 * @param {string|null} [props.error=null] - Error message if retrieval failed
 * @param {() => void} [props.onRetry] - Callback invoked to retry or refresh
 * @param {string} [props.className=''] - Additional custom CSS classes
 * @returns {JSX.Element}
 */
export default function AIBriefCard({
  brief,
  loading = false,
  error = null,
  onRetry,
  className = '',
}) {
  const formattedDate = useMemo(() => {
    return formatIndonesianDate(brief?.generated_at);
  }, [brief?.generated_at]);

  const hasData = useMemo(() => {
    if (!brief) return false;
    const hasGreeting = Boolean(brief.greeting && brief.greeting.trim());
    const hasKpi = Array.isArray(brief.kpi_highlights) && brief.kpi_highlights.length > 0;
    const hasPriorities = Array.isArray(brief.priorities) && brief.priorities.length > 0;
    const hasActions = Array.isArray(brief.suggested_actions) && brief.suggested_actions.length > 0;
    return hasGreeting || hasKpi || hasPriorities || hasActions;
  }, [brief]);

  // ===========================================================================
  // 1. LOADING STATE (Skeleton Shimmer Animation)
  // ===========================================================================
  if (loading) {
    return (
      <section
        aria-busy="true"
        aria-label="Memuat ringkasan harian AI"
        className={`bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card p-5 sm:p-6 animate-pulse space-y-5 ${className}`.trim()}
      >
        {/* Header Skeleton */}
        <div className="flex items-center justify-between gap-4 pb-1 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="h-5 w-40 bg-slate-200 rounded" />
          </div>
          <div className="h-5 w-28 bg-slate-200 rounded-full" />
        </div>

        {/* Greeting Skeleton */}
        <div className="space-y-2">
          <div className="h-4.5 w-11/12 bg-slate-200 rounded" />
          <div className="h-4.5 w-3/4 bg-slate-200 rounded" />
        </div>

        {/* KPI Pills Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-6 w-24 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        {/* Priorities Skeleton */}
        <div className="p-3.5 rounded-lg border-l-4 border-l-slate-300 border border-slate-200 bg-slate-50 space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3.5 w-full bg-slate-200 rounded" />
        </div>

        {/* Action Chips Skeleton */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-32 bg-slate-200 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  // ===========================================================================
  // 2. ERROR STATE
  // ===========================================================================
  if (error) {
    return (
      <section
        role="alert"
        className={`bg-red-50 border border-red-200 rounded-lg p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-red-900 ${className}`.trim()}
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={22} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-red-900">Gagal Memuat Ringkasan Harian AI</h3>
            <p className="text-xs text-red-800 leading-relaxed">
              {typeof error === 'string' ? error : 'Terjadi gangguan saat mengambil data analitik harian wilayah.'}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-red-400 shrink-0 cursor-pointer"
          >
            <RefreshCw size={13} className="shrink-0" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>
        )}
      </section>
    );
  }

  // ===========================================================================
  // 3. EMPTY STATE
  // ===========================================================================
  if (!hasData) {
    return (
      <section
        className={`bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card p-6 sm:p-8 text-center space-y-3 ${className}`.trim()}
      >
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-100 text-slate-500 mb-1">
          <Sparkles size={24} className="opacity-70" aria-hidden="true" />
        </div>
        <h3 className="text-sm font-semibold text-on-surface">Ringkasan belum tersedia</h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
          Sistem analitik cerdas sedang mengumpulkan data aktivitas kewilayahan terbaru. Silakan periksa kembali beberapa saat lagi.
        </p>

        {onRetry && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw size={13} aria-hidden="true" />
              <span>Periksa Pembaruan</span>
            </button>
          </div>
        )}
      </section>
    );
  }

  // ===========================================================================
  // 4. MAIN CONTENT
  // ===========================================================================
  const kpiHighlights = Array.isArray(brief?.kpi_highlights) ? brief.kpi_highlights : [];
  const priorities = Array.isArray(brief?.priorities) ? brief.priorities : [];
  const suggestedActions = Array.isArray(brief?.suggested_actions) ? brief.suggested_actions : [];

  return (
    <article
      className={`bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card p-5 sm:p-6 space-y-5 transition-all ${className}`.trim()}
      aria-label="Ringkasan Harian AI"
    >
      {/* Top Section: Sparkles Icon + Title + Generated Date */}
      <header className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/40">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-sky-100 text-sky-700 rounded-lg shadow-xs">
            <Sparkles size={18} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface tracking-tight">
              Ringkasan Harian AI
            </h2>
            <p className="text-xs text-on-surface-variant hidden sm:block">
              Intelijen kewilayahan & rekomendasi operasional real-time
            </p>
          </div>
        </div>

        {formattedDate && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container-low text-on-surface-variant border border-outline-variant/60 shadow-xs">
            <span>Dihasilkan:</span>
            <time className="font-semibold text-on-surface">{formattedDate}</time>
          </div>
        )}
      </header>

      {/* Greeting Section in body-lg */}
      {brief?.greeting && (
        <div className="text-body-lg text-on-surface leading-relaxed font-normal">
          {brief.greeting}
        </div>
      )}

      {/* KPI Highlights: Small Inline Metric Pills */}
      {kpiHighlights.length > 0 && (
        <section aria-label="Sorotan Indikator Kinerja Utama">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kpiHighlights.map((kpi, idx) => {
              const isUrgent = kpi.urgency === 'high' || kpi.urgency === 'critical';
              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                    isUrgent
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-surface-container-low border-outline-variant/60 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-medium text-on-surface-variant line-clamp-1">
                      {kpi.label}
                    </span>
                    {isUrgent && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
                        Perhatian
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-2xl font-bold tracking-tight text-on-surface">
                      {formatMetricNumber(kpi.value)}
                    </span>
                    {kpi.unit && (
                      <span className="text-xs font-medium text-on-surface-variant">
                        {kpi.unit}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Priorities Section: Colored Left Border & Severity Icon */}
      {priorities.length > 0 && (
        <section aria-label="Prioritas Tindakan" className="space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Prioritas Perhatian
          </h3>

          <div className="space-y-2">
            {priorities.map((item, idx) => {
              const levelKey = (item.level || '').toUpperCase();
              const conf = SEVERITY_MAP[levelKey] || DEFAULT_SEVERITY;
              const IconComp = conf.icon;

              return (
                <div
                  key={idx}
                  className={`border-l-4 rounded-r-lg border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${conf.container}`}
                >
                  <div className="flex items-start gap-3">
                    <IconComp size={18} className={`${conf.iconColor} shrink-0 mt-0.5`} aria-hidden="true" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${conf.badge}`}>
                          {conf.badgeLabel}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium leading-snug">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  {item.action_path && (
                    <ActionItemLink
                      to={item.action_path}
                      className={`inline-flex items-center gap-1 text-xs font-bold underline underline-offset-4 shrink-0 transition-opacity self-end sm:self-center ${conf.actionLink}`}
                    >
                      <span>Tindak Lanjuti</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </ActionItemLink>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Suggested Actions Section: Horizontal Row of Action Buttons/Chips */}
      {suggestedActions.length > 0 && (
        <section aria-label="Aksi yang Disarankan" className="pt-2 border-t border-outline-variant/40 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Aksi yang Disarankan
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {suggestedActions.map((action, idx) => {
              const IconComp = (action.icon && ICON_MAP[action.icon]) ? ICON_MAP[action.icon] : ArrowRight;

              return (
                <ActionItemLink
                  key={idx}
                  to={action.path}
                  className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-surface-container-low hover:bg-surface-container-high text-on-surface hover:text-primary border border-outline-variant/70 hover:border-primary/50 transition-all shadow-xs"
                >
                  <IconComp
                    size={14}
                    className="text-primary group-hover:scale-110 transition-transform shrink-0"
                    aria-hidden="true"
                  />
                  <span>{action.label}</span>
                </ActionItemLink>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
