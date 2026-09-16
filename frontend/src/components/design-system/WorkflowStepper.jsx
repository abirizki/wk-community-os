import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, X, Clock, User } from 'lucide-react';

/**
 * Standard administrative approval steps in Indonesian kelurahan governance.
 */
const DEFAULT_STEPS = [
  { key: 'SUBMIT', label: 'Pengajuan Surat' },
  { key: 'RT', label: 'Verifikasi RT' },
  { key: 'RW', label: 'Verifikasi RW' },
  { key: 'KELURAHAN', label: 'Pengesahan Kelurahan' },
  { key: 'SELESAI', label: 'Dokumen Terbit' },
];

/**
 * Format timestamp into Indonesian locale date string (e.g., "14 Sep 2026, 10:45")
 * 
 * @param {string|Date|null} timestamp - ISO date string or Date object
 * @returns {string|null} Formatted date string or null if empty
 */
function formatTimestamp(timestamp) {
  if (!timestamp) return null;
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return String(timestamp);
    }
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return String(timestamp);
  }
}

/**
 * WorkflowStepper Component
 * 
 * Step-by-step workflow progress indicator for document approval, civic verification,
 * and multi-tier public administration workflows in Bumi Warga.
 * 
 * @component
 * @param {Object} props
 * @param {Array<{ key: string, label: string, status?: 'completed'|'active'|'pending'|'rejected', timestamp?: string|null, actor?: string|null }>} [props.steps] - Array of step definitions
 * @param {string} [props.currentStep] - Key of the active step (used to infer status if not explicit)
 * @param {'horizontal'|'vertical'} [props.orientation='horizontal'] - Preferred layout orientation. Horizontal auto-switches to vertical on mobile (< 640px).
 * @param {'sm'|'md'} [props.size='md'] - Visual size variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {JSX.Element}
 */
export default function WorkflowStepper({
  steps,
  currentStep,
  orientation = 'horizontal',
  size = 'md',
  className = '',
}) {
  // Normalize steps with fallback and resolve effective status
  const normalizedSteps = useMemo(() => {
    const rawSteps = Array.isArray(steps) && steps.length > 0 ? steps : DEFAULT_STEPS;
    const currentIndex = currentStep ? rawSteps.findIndex((s) => s.key === currentStep) : -1;

    return rawSteps.map((step, idx) => {
      let status = step.status ? String(step.status).toLowerCase() : null;

      // Infer status if not explicitly provided on step object
      if (!status) {
        if (currentIndex !== -1) {
          if (idx < currentIndex) status = 'completed';
          else if (idx === currentIndex) status = 'active';
          else status = 'pending';
        } else {
          status = idx === 0 ? 'active' : 'pending';
        }
      }

      return {
        ...step,
        status,
      };
    });
  }, [steps, currentStep]);

  // Size styling tokens
  const isSm = size === 'sm';
  const circleSizeClass = isSm ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-9 h-9 sm:w-10 sm:h-10';
  const iconSizeClass = isSm ? 'w-3.5 h-3.5 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5';
  const labelTextClass = isSm ? 'text-xs' : 'text-xs sm:text-sm';
  const metaTextClass = isSm ? 'text-[10px]' : 'text-[11px] sm:text-xs';
  const horizontalLineTopClass = isSm ? 'top-3.5 sm:top-4' : 'top-[18px] sm:top-5';

  /**
   * Helper to render step node circle with appropriate status styling and animation
   */
  const renderStepCircle = (step, index) => {
    const { status } = step;

    if (status === 'completed') {
      return (
        <motion.div
          key={`circle-completed-${step.key || index}`}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className={`flex items-center justify-center rounded-full bg-emerald-600 text-white border-2 border-emerald-600 shadow-sm shrink-0 ${circleSizeClass}`}
          aria-label={`Langkah ${index + 1}: ${step.label} (Selesai)`}
        >
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.05 }}
          >
            <Check className={iconSizeClass} strokeWidth={2.5} aria-hidden="true" />
          </motion.span>
        </motion.div>
      );
    }

    if (status === 'active') {
      return (
        <motion.div
          key={`circle-active-${step.key || index}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className={`flex items-center justify-center rounded-full bg-sky-600 text-white border-2 border-sky-600 ring-4 ring-sky-100 shadow-sm shrink-0 ${circleSizeClass}`}
          aria-label={`Langkah ${index + 1}: ${step.label} (Sedang Diproses)`}
          aria-current="step"
        >
          <Loader2 className={`${iconSizeClass} animate-spin`} strokeWidth={2.5} aria-hidden="true" />
        </motion.div>
      );
    }

    if (status === 'rejected') {
      return (
        <motion.div
          key={`circle-rejected-${step.key || index}`}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className={`flex items-center justify-center rounded-full bg-red-600 text-white border-2 border-red-600 shadow-sm shrink-0 ${circleSizeClass}`}
          aria-label={`Langkah ${index + 1}: ${step.label} (Ditolak)`}
        >
          <X className={iconSizeClass} strokeWidth={2.5} aria-hidden="true" />
        </motion.div>
      );
    }

    // Default: 'pending' state
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-slate-100 text-slate-500 border-2 border-slate-300 font-semibold shrink-0 text-xs sm:text-sm ${circleSizeClass}`}
        aria-label={`Langkah ${index + 1}: ${step.label} (Menunggu)`}
      >
        <span>{index + 1}</span>
      </div>
    );
  };

  /**
   * Determine connecting line styles between current step and next step
   */
  const getLineStyle = (currentStepObj, nextStepObj) => {
    const nextStatus = nextStepObj?.status;
    const currentStatus = currentStepObj?.status;

    if (nextStatus === 'rejected' || currentStatus === 'rejected') {
      return {
        isDashed: false,
        bgClass: 'bg-red-500',
        borderClass: 'border-red-500',
      };
    }

    if (nextStatus === 'completed' || (currentStatus === 'completed' && nextStatus !== 'pending' && nextStatus !== 'active')) {
      return {
        isDashed: false,
        bgClass: 'bg-emerald-500',
        borderClass: 'border-emerald-500',
      };
    }

    if (currentStatus === 'completed' && nextStatus === 'active') {
      return {
        isDashed: true,
        bgClass: 'border-sky-500',
        borderClass: 'border-sky-500',
      };
    }

    // Default pending/inactive transition
    return {
      isDashed: true,
      bgClass: 'border-slate-300',
      borderClass: 'border-slate-300',
    };
  };

  return (
    <nav aria-label="Alur Proses Dokumen" className={`w-full ${className}`}>
      {/* =================================================================== */}
      {/* 1. HORIZONTAL DESKTOP VIEW (Visible on sm: and up when horizontal)   */}
      {/* =================================================================== */}
      {orientation === 'horizontal' && (
        <ol className="hidden sm:flex items-start w-full justify-between">
          {normalizedSteps.map((step, idx) => {
            const isLast = idx === normalizedSteps.length - 1;
            const lineStyle = !isLast ? getLineStyle(step, normalizedSteps[idx + 1]) : null;
            const formattedTime = formatTimestamp(step.timestamp);

            return (
              <li
                key={step.key || idx}
                className="flex-1 relative flex flex-col items-center text-center group"
              >
                {/* Horizontal Connecting Line to Next Step */}
                {!isLast && (
                  <div
                    className={`absolute ${horizontalLineTopClass} left-[50%] w-full -translate-y-1/2 z-0 px-2`}
                    aria-hidden="true"
                  >
                    {lineStyle.isDashed ? (
                      <div className={`w-full border-t-2 border-dashed ${lineStyle.borderClass}`} />
                    ) : (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        style={{ transformOrigin: 'left' }}
                        className={`h-0.5 w-full ${lineStyle.bgClass}`}
                      />
                    )}
                  </div>
                )}

                {/* Node Circle */}
                <div className="relative z-10">
                  {renderStepCircle(step, idx)}
                </div>

                {/* Step Metadata: Label, Timestamp, Actor */}
                <div className="mt-2.5 max-w-[140px] px-1 flex flex-col items-center text-center">
                  <span
                    className={`font-semibold leading-tight tracking-tight ${labelTextClass} ${
                      step.status === 'active'
                        ? 'text-primary'
                        : step.status === 'completed'
                        ? 'text-on-surface'
                        : step.status === 'rejected'
                        ? 'text-red-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>

                  {formattedTime && (
                    <time
                      dateTime={typeof step.timestamp === 'string' ? step.timestamp : undefined}
                      className={`mt-1 inline-flex items-center gap-1 text-slate-500 font-mono ${metaTextClass}`}
                      title={`Waktu verifikasi: ${formattedTime}`}
                    >
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{formattedTime}</span>
                    </time>
                  )}

                  {step.actor && (
                    <span
                      className={`mt-0.5 inline-flex items-center gap-1 text-slate-600 font-medium truncate max-w-full ${metaTextClass}`}
                      title={`Aktor: ${step.actor}`}
                    >
                      <User className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                      <span className="truncate">{step.actor}</span>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* =================================================================== */}
      {/* 2. VERTICAL VIEW (Always for 'vertical', or mobile < sm if 'horizontal') */}
      {/* =================================================================== */}
      <ol
        className={`w-full flex-col ${
          orientation === 'horizontal' ? 'flex sm:hidden' : 'flex'
        }`}
      >
        {normalizedSteps.map((step, idx) => {
          const isLast = idx === normalizedSteps.length - 1;
          const lineStyle = !isLast ? getLineStyle(step, normalizedSteps[idx + 1]) : null;
          const formattedTime = formatTimestamp(step.timestamp);

          return (
            <li
              key={step.key || idx}
              className="relative flex items-start gap-3.5 pb-5 last:pb-0 group"
            >
              {/* Left Column: Node Circle + Vertical Connecting Line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative z-10">
                  {renderStepCircle(step, idx)}
                </div>

                {!isLast && (
                  <div
                    className="flex-1 w-0.5 min-h-[28px] my-1 flex justify-center z-0"
                    aria-hidden="true"
                  >
                    {lineStyle.isDashed ? (
                      <div className={`h-full border-l-2 border-dashed ${lineStyle.borderClass}`} />
                    ) : (
                      <motion.div
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        style={{ transformOrigin: 'top' }}
                        className={`w-0.5 h-full ${lineStyle.bgClass}`}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Step Label, Timestamp, Actor */}
              <div className="pt-1 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <h4
                    className={`font-semibold leading-snug tracking-tight ${labelTextClass} ${
                      step.status === 'active'
                        ? 'text-primary'
                        : step.status === 'completed'
                        ? 'text-on-surface'
                        : step.status === 'rejected'
                        ? 'text-red-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h4>

                  {step.status === 'active' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                      Aktif
                    </span>
                  )}
                  {step.status === 'completed' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Selesai
                    </span>
                  )}
                  {step.status === 'rejected' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-800 border border-red-200">
                      Ditolak
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                  {formattedTime && (
                    <time
                      dateTime={typeof step.timestamp === 'string' ? step.timestamp : undefined}
                      className={`inline-flex items-center gap-1 font-mono ${metaTextClass}`}
                      title={`Waktu verifikasi: ${formattedTime}`}
                    >
                      <Clock className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                      <span>{formattedTime}</span>
                    </time>
                  )}

                  {step.actor && (
                    <span
                      className={`inline-flex items-center gap-1 font-medium text-slate-600 ${metaTextClass}`}
                      title={`Aktor: ${step.actor}`}
                    >
                      <User className="w-3 h-3 text-slate-400 shrink-0" aria-hidden="true" />
                      <span className="truncate">{step.actor}</span>
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
