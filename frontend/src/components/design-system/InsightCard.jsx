import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  Eye, 
  ChevronDown, 
  Database, 
  CheckCircle2 
} from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: {
    cardBorder: 'border-l-4 border-l-red-500 border-red-200/80 bg-red-50/30',
    badge: 'bg-red-100 text-red-800 border-red-200',
    pill: 'bg-red-50 text-red-800 border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-700',
    defaultLabel: 'Kritis',
  },
  WARNING: {
    cardBorder: 'border-l-4 border-l-amber-500 border-amber-200/80 bg-amber-50/30',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    pill: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertCircle,
    iconColor: 'text-amber-700',
    defaultLabel: 'Peringatan',
  },
  INFO: {
    cardBorder: 'border-l-4 border-l-sky-500 border-sky-200/80 bg-sky-50/30',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    pill: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: Info,
    iconColor: 'text-sky-700',
    defaultLabel: 'Informasi',
  },
};

export default function InsightCard({
  insight,
  onViewEvidence,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!insight || typeof insight !== 'object') {
    return null;
  }

  const {
    rule_code,
    severity = 'INFO',
    badge_label,
    title,
    summary,
    evidence,
    action_directives = [],
    impact_score,
    category,
    what,
    why
  } = insight;

  const normalizedSeverity = typeof severity === 'string' ? severity.toUpperCase() : 'INFO';
  const config = SEVERITY_CONFIG[normalizedSeverity] || SEVERITY_CONFIG.INFO;
  const SeverityIcon = config.icon;

  const handleToggleEvidence = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
    if (typeof onViewEvidence === 'function') {
      onViewEvidence(insight);
    }
  };

  const hasDirectives = Array.isArray(action_directives) && action_directives.length > 0;
  const hasEvidence = evidence !== null && evidence !== undefined && (
    typeof evidence === 'object' ? Object.keys(evidence).length > 0 : String(evidence).trim().length > 0
  );

  return (
    <article
      className={`relative rounded-lg border border-outline-variant bg-surface-container-lowest p-4 sm:p-5 shadow-card transition-shadow hover:shadow-elevated ${config.cardBorder} ${className}`}
      aria-labelledby={`insight-title-${insight.id || 'current'}`}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badge}`}
          >
            <SeverityIcon className={`w-3.5 h-3.5 shrink-0 ${config.iconColor}`} aria-hidden="true" />
            <span>Prioritas: {insight.priority || badge_label || config.defaultLabel}</span>
          </span>

          {rule_code && (
            <span className="font-mono text-[11px] text-on-surface-variant/70 tracking-tight">
              {rule_code}
            </span>
          )}
        </div>

        {impact_score !== undefined && impact_score !== null && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.pill}`}
            title={`Skor Dampak: ${impact_score}`}
          >
            Dampak: {impact_score}/100
          </span>
        )}
      </header>

      <div className="mt-3.5 space-y-2.5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            What (Kondisi)
          </span>
          <h3
            id={`insight-title-${insight.id || 'current'}`}
            className="text-base font-bold text-on-surface leading-snug tracking-tight mt-1"
          >
            {what || title || 'Pemberitahuan Analisis Data'}
          </h3>
        </div>

        {(why || summary) && (
          <div className="pt-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              Why (Penyebab & Analisis)
            </span>
            <p className="mt-1 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              {why || summary}
            </p>
          </div>
        )}
      </div>

      {hasDirectives && (
        <section className="mt-3.5 pt-3 border-t border-outline-variant/60" aria-label="Arahan Tindakan">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
              Action (Rekomendasi Tindak Lanjut)
            </span>
          </div>
          <ol className="space-y-1.5">
            {action_directives.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-on-surface leading-relaxed">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-surface-container-high text-on-surface text-[10px] font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1 font-medium">
                  {typeof action === 'string' ? action : (action.label || action.title || JSON.stringify(action))}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <footer className="mt-4 pt-3 border-t border-outline-variant/60 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleToggleEvidence}
          aria-expanded={isExpanded}
          aria-controls={`insight-evidence-${insight.id || 'current'}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          <Eye className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>{isExpanded ? 'Tutup Bukti Analitik' : 'Lihat Bukti Analitik'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {category && (
          <span className="text-[11px] text-on-surface-variant font-medium capitalize">
            {category.toLowerCase().replace(/_/g, ' ')}
          </span>
        )}
      </footer>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`insight-evidence-${insight.id || 'current'}`}
            key="evidence-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-outline-variant bg-surface-container-low/60 rounded-md p-3 border text-xs">
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-outline-variant/60 text-on-surface-variant">
                <span className="flex items-center gap-1.5 font-semibold text-on-surface">
                  <Database className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  Bukti Data Analitik (Ground Truth):
                </span>
                {rule_code && (
                  <span className="font-mono text-[10px] text-on-surface-variant">
                    Aturan: {rule_code}
                  </span>
                )}
              </div>

              {hasEvidence ? (
                typeof evidence === 'object' && !Array.isArray(evidence) ? (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-mono">
                    {Object.entries(evidence).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex flex-col sm:flex-row sm:items-baseline justify-between py-1 border-b border-outline-variant/30 last:border-0"
                      >
                        <dt className="text-on-surface-variant capitalize text-[11px] font-sans">
                          {key.replace(/_/g, ' ')}:
                        </dt>
                        <dd className="font-semibold text-on-surface text-right sm:text-left">
                          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : Array.isArray(evidence) ? (
                  <ul className="space-y-1 text-xs list-disc list-inside text-on-surface font-mono">
                    {evidence.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap font-mono">
                    {String(evidence)}
                  </p>
                )
              ) : (
                <p className="text-xs text-on-surface-variant italic py-1">
                  Tidak ada data bukti riil tambahan yang terlampir untuk anomali ini.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
