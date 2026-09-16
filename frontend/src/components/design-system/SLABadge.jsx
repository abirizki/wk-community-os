import React, { useState, useEffect, useMemo } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * SLABadge Component
 *
 * An SLA countdown and status indicator badge designed for the Bumi Warga digital governance platform.
 * Displays real-time SLA status, deadlines, and urgency levels with WCAG AA compliant visual tokens.
 *
 * @component
 * @param {Object} props
 * @param {string | Date} [props.deadline] - The SLA deadline datetime
 * @param {string | Date} [props.createdAt=null] - Creation datetime for aging calculation
 * @param {string} [props.status=null] - Current workflow status string
 * @param {string | Date | boolean | null} [props.breachedAt=null] - Timestamp or flag if SLA was breached
 * @param {string | Date | null} [props.completedAt=null] - Timestamp if workflow step was completed
 * @param {'sm' | 'md' | 'lg'} [props.size='sm'] - Badge size variant
 * @param {string} [props.className=''] - Additional Tailwind CSS classes
 * @returns {JSX.Element}
 */
export default function SLABadge({
  deadline,
  createdAt = null,
  status = null,
  breachedAt = null,
  completedAt = null,
  size = 'sm',
  className = '',
  ...props
}) {
  const [now, setNow] = useState(() => new Date());

  const deadlineDate = useMemo(() => parseDate(deadline), [deadline]);
  const createdDate = useMemo(() => parseDate(createdAt), [createdAt]);
  const completedDate = useMemo(() => parseDate(completedAt), [completedAt]);

  const normalizedStatus = typeof status === 'string' ? status.toUpperCase() : '';
  const isCompleted = Boolean(completedAt) || ['APPROVED', 'SELESAI', 'DONE', 'RESOLVED', 'LUNAS', 'DISETUJUI'].includes(normalizedStatus);
  const isRejected = ['REJECTED', 'DITOLAK'].includes(normalizedStatus);
  const isBreached = Boolean(breachedAt) || normalizedStatus === 'OVERDUE';

  useEffect(() => {
    if (isBreached || isCompleted || isRejected || (!deadlineDate && !createdDate)) return;

    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, [isBreached, isCompleted, isRejected, deadlineDate, createdDate]);

  const badgeState = useMemo(() => {
    // 1. Rejected status
    if (isRejected) {
      return {
        label: 'Ditolak',
        icon: AlertTriangle,
        colorClass: 'bg-red-50 text-red-800 border-red-200',
      };
    }

    // 2. Breached status
    if (isBreached) {
      return {
        label: 'SLA Terlampaui',
        icon: AlertTriangle,
        colorClass: 'bg-red-50 text-red-800 border-red-200',
      };
    }

    // 3. Completed status
    if (isCompleted) {
      if (deadlineDate && (completedDate || now)) {
        const finishTime = completedDate ? completedDate.getTime() : now.getTime();
        if (finishTime <= deadlineDate.getTime()) {
          return {
            label: 'Tepat Waktu',
            icon: CheckCircle2,
            colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          };
        }
        return {
          label: 'Melampaui SLA',
          icon: AlertTriangle,
          colorClass: 'bg-red-50 text-red-800 border-red-200',
        };
      }
      return {
        label: 'Tepat Waktu',
        icon: CheckCircle2,
        colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }

    // 4. Calculate remaining duration for active deadline (Hijau -> Kuning -> Merah)
    if (deadlineDate) {
      const diffMs = deadlineDate.getTime() - now.getTime();

      if (diffMs <= 0) {
        return {
          label: 'Melampaui SLA',
          icon: AlertTriangle,
          colorClass: 'bg-red-50 text-red-800 border-red-200',
        };
      }

      const hoursRemaining = diffMs / (1000 * 60 * 60);

      if (hoursRemaining < 4) {
        const h = Math.floor(hoursRemaining);
        const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const timeStr = h > 0 ? `${h} jam` : `${Math.max(1, m)} menit`;
        return {
          label: `Mendesak (${timeStr})`,
          icon: AlertTriangle,
          colorClass: 'bg-red-50 text-red-800 border-red-200',
        };
      }

      if (hoursRemaining < 24) {
        const h = Math.round(hoursRemaining);
        return {
          label: `Segera (${h} jam)`,
          icon: Clock,
          colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      }

      const daysRemaining = Math.max(1, Math.round(hoursRemaining / 24));
      return {
        label: `${daysRemaining} hari lagi`,
        icon: Clock,
        colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    }

    // 5. If no deadline but createdAt is available → calculate Aging
    if (createdDate) {
      const ageMs = now.getTime() - createdDate.getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      const ageDays = Math.floor(ageHours / 24);

      if (ageHours < 24) {
        const h = Math.max(1, Math.round(ageHours));
        return {
          label: `Aging: ${h} jam`,
          icon: Clock,
          colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      } else if (ageDays <= 2) {
        return {
          label: `Aging: ${ageDays} hari`,
          icon: Clock,
          colorClass: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      } else {
        return {
          label: `Aging: ${ageDays} hari`,
          icon: AlertTriangle,
          colorClass: 'bg-red-50 text-red-800 border-red-200',
        };
      }
    }

    // 6. Default fallback
    return {
      label: 'Belum Ditetapkan',
      icon: Clock,
      colorClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }, [isBreached, isCompleted, isRejected, deadlineDate, createdDate, completedDate, now]);

  const sizeStyle = SIZE_MAP[size] || SIZE_MAP.sm;
  const IconComponent = badgeState.icon;

  const tooltip = useMemo(() => {
    if (!deadlineDate) return undefined;
    try {
      return `Tenggat SLA: ${new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(deadlineDate)}`;
    } catch {
      return undefined;
    }
  }, [deadlineDate]);

  return (
    <span
      role="status"
      aria-label={badgeState.label}
      title={tooltip}
      className={`inline-flex items-center justify-center font-semibold rounded-full border transition-colors select-none ${badgeState.colorClass} ${sizeStyle.container} ${className}`.trim()}
      {...props}
    >
      <IconComponent
        size={sizeStyle.iconSize}
        className="flex-shrink-0"
        aria-hidden="true"
      />
      <span>{badgeState.label}</span>
    </span>
  );
}

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

function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const normalized = trimmed.includes(' ') && !trimmed.includes('T')
      ? trimmed.replace(' ', 'T')
      : trimmed;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}
