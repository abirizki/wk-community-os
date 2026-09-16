import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Users,
  Gift,
  Wallet,
  HeartPulse,
  MessageSquareWarning,
  FileText,
  ShieldCheck,
  Bell,
  Clock,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const ICON_MAP = {
  FileCheck,
  Users,
  Gift,
  Wallet,
  HeartPulse,
  MessageSquareWarning,
  FileText,
  ShieldCheck,
  Bell,
  Clock,
  AlertTriangle
};

function getActionIconComponent(iconProp) {
  if (typeof iconProp === 'string' && ICON_MAP[iconProp]) {
    return ICON_MAP[iconProp];
  }
  return Bell;
}

const URGENCY_CONFIG = {
  critical: {
    badge: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
    iconBg: 'bg-red-50 text-red-600',
    label: 'Kritis'
  },
  high: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    iconBg: 'bg-amber-50 text-amber-600',
    label: 'Tinggi'
  },
  medium: {
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
    iconBg: 'bg-sky-50 text-sky-600',
    label: 'Sedang'
  },
  low: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    iconBg: 'bg-slate-100 text-slate-600',
    label: 'Rendah'
  }
};

export default function ActionCenter({
  title = 'Pusat Tindakan & Tugas Prioritas',
  actions = [],
  onActionClick,
  maxItems = 5,
  className = '',
  onRefresh,
  isRefreshing = false
}) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const safeActions = Array.isArray(actions) ? actions : [];
  const hasItems = safeActions.length > 0;
  const showViewAll = safeActions.length > maxItems;
  const visibleActions = isExpanded ? safeActions : safeActions.slice(0, maxItems);

  const handleActionClick = (action) => {
    if (typeof onActionClick === 'function') {
      onActionClick(action);
    } else if (action?.path) {
      navigate(action.path);
    }
  };

  const handleToggleViewAll = (e) => {
    e.preventDefault();
    setIsExpanded((prev) => !prev);
  };

  return (
    <div
      className={`rounded-xl border border-outline-variant bg-surface-container-lowest shadow-card overflow-hidden ${className}`}
      role="region"
      aria-label={title}
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-outline-variant/80 bg-surface-container-low/40">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
          <h2 className="text-sm font-bold text-on-surface tracking-tight">
            {title}
          </h2>
          {hasItems && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {safeActions.length}
            </span>
          )}
        </div>

        {typeof onRefresh === 'function' && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            title="Segarkan daftar tindakan"
            aria-label="Segarkan daftar tindakan"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? 'animate-spin text-primary' : ''}
            />
          </button>
        )}
      </div>

      {!hasItems ? (
        <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-200">
            <CheckCircle2 size={24} aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-on-surface">
            Tidak ada tindakan yang menunggu
          </p>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
            Semua permohonan, verifikasi, dan tugas administratif telah selesai diproses.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-outline-variant/60">
          {visibleActions.map((action, index) => {
            const urgencyKey = (action?.severity || action?.urgency || 'low').toLowerCase();
            const urgency = URGENCY_CONFIG[urgencyKey] || URGENCY_CONFIG.low;
            const IconComponent = getActionIconComponent(action?.icon);
            const count = typeof action?.count === 'number' ? action.count : 0;
            const itemTitle = action?.title || action?.label || 'Tindakan Tanpa Judul';
            const hasActionButtons = Boolean(action?.primaryAction || action?.secondaryAction);

            return (
              <div
                key={action?.id ?? `action-${index}`}
                className="p-3.5 sm:p-4 hover:bg-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div
                  className={`flex items-start gap-3 min-w-0 flex-1 ${!hasActionButtons ? 'cursor-pointer' : ''}`}
                  onClick={() => !hasActionButtons && handleActionClick(action)}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-black/5 mt-0.5 sm:mt-0 ${urgency.iconBg}`}
                  >
                    {React.isValidElement(action?.icon) ? (
                      action.icon
                    ) : (
                      <IconComponent size={18} aria-hidden="true" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1 pr-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                        {itemTitle}
                      </p>
                      {count > 0 && (
                        <span
                          className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full border ${urgency.badge}`}
                          title={`${count} berkas / tugas`}
                        >
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </div>

                    {action?.description && (
                      <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                        {action.description}
                      </p>
                    )}
                    {action?.deadline && (
                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-1">
                        <Clock size={12} className="shrink-0 text-outline" />
                        <span>Tenggat: {action.deadline}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-1 sm:pt-0">
                  {action?.secondaryAction && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof action.secondaryAction.onClick === 'function') {
                          action.secondaryAction.onClick(action);
                        } else if (action.secondaryAction.path) {
                          navigate(action.secondaryAction.path);
                        }
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                    >
                      {action.secondaryAction.label || 'Batal'}
                    </button>
                  )}

                  {action?.primaryAction && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (typeof action.primaryAction.onClick === 'function') {
                          action.primaryAction.onClick(action);
                        } else if (action.primaryAction.path) {
                          navigate(action.primaryAction.path);
                        } else {
                          handleActionClick(action);
                        }
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded-md bg-primary hover:bg-primary/90 text-on-primary transition-colors shadow-sm cursor-pointer"
                    >
                      {action.primaryAction.label || 'Proses'}
                    </button>
                  )}

                  {!hasActionButtons && (
                    <button
                      type="button"
                      onClick={() => handleActionClick(action)}
                      className="flex items-center gap-2 p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                      aria-label={`Buka ${itemTitle}`}
                    >
                      <span
                        className="relative flex h-2.5 w-2.5 items-center justify-center"
                        title={`Tingkat Urgensi: ${urgency.label}`}
                      >
                        {urgencyKey === 'critical' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
                        )}
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${urgency.dot}`} />
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-outline/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showViewAll && (
        <div className="p-3 border-t border-outline-variant/60 bg-surface-container-low/30 text-center">
          <button
            type="button"
            onClick={handleToggleViewAll}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 focus:outline-none focus-visible:underline cursor-pointer"
          >
            <span>
              {isExpanded
                ? 'Tampilkan Lebih Sedikit'
                : `Lihat Semua Tindakan (${safeActions.length})`}
            </span>
            <ChevronRight
              size={14}
              className={`transition-transform duration-200 ${
                isExpanded ? '-rotate-90' : 'rotate-90'
              }`}
              aria-hidden="true"
            />
          </button>
        </div>
      )}
    </div>
  );
}
