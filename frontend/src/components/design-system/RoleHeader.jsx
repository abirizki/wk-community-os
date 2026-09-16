import React, { useMemo } from 'react';
import { Sparkles, MapPin, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Role-to-theme mapping configuration
 * Defines Indonesian role label, custom Tailwind gradient, and badge styles.
 */
const ROLE_THEMES = {
  ketua_rt: {
    label: 'Ketua RT',
    gradient: 'from-slate-800 to-blue-900',
    badge: 'bg-blue-400/20 text-blue-200 border-blue-300/30',
    sparkleColor: 'text-blue-300',
  },
  ketua_rw: {
    label: 'Ketua RW',
    gradient: 'from-slate-800 to-indigo-900',
    badge: 'bg-indigo-400/20 text-indigo-200 border-indigo-300/30',
    sparkleColor: 'text-indigo-300',
  },
  admin_kelurahan: {
    label: 'Admin Kelurahan',
    gradient: 'from-slate-800 to-sky-900',
    badge: 'bg-sky-400/20 text-sky-200 border-sky-300/30',
    sparkleColor: 'text-sky-300',
  },
  lurah: {
    label: 'Lurah',
    gradient: 'from-slate-900 via-indigo-950 to-blue-950',
    badge: 'bg-amber-400/20 text-amber-200 border-amber-300/30',
    sparkleColor: 'text-amber-300',
  },
  kader_posyandu: {
    label: 'Kader Posyandu',
    gradient: 'from-emerald-800 to-teal-900',
    badge: 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30',
    sparkleColor: 'text-emerald-300',
  },
  warga: {
    label: 'Warga',
    gradient: 'from-sky-700 to-blue-800',
    badge: 'bg-sky-300/20 text-sky-100 border-sky-200/30',
    sparkleColor: 'text-sky-200',
  },
  superadmin: {
    label: 'Super Admin',
    gradient: 'from-slate-800 to-slate-900',
    badge: 'bg-slate-400/20 text-slate-200 border-slate-300/30',
    sparkleColor: 'text-slate-300',
  },
  walikota: {
    label: 'Walikota',
    gradient: 'from-slate-900 via-indigo-950 to-blue-950',
    badge: 'bg-amber-400/20 text-amber-200 border-amber-300/30',
    sparkleColor: 'text-amber-300',
  },
  camat: {
    label: 'Camat',
    gradient: 'from-slate-900 via-indigo-950 to-blue-950',
    badge: 'bg-indigo-400/20 text-indigo-200 border-indigo-300/30',
    sparkleColor: 'text-indigo-300',
  },
};

const DEFAULT_THEME = {
  label: 'Petugas Kebonjati',
  gradient: 'from-slate-800 to-slate-900',
  badge: 'bg-white/10 text-slate-200 border-white/20',
  sparkleColor: 'text-amber-300',
};

/**
 * Returns dynamic time-based Indonesian greeting.
 * @param {string} [userName]
 * @returns {string}
 */
function getAutoGreeting(userName) {
  const hour = new Date().getHours();
  let timeStr = 'Selamat Datang';

  if (hour >= 4 && hour < 11) {
    timeStr = 'Selamat Pagi';
  } else if (hour >= 11 && hour < 15) {
    timeStr = 'Selamat Siang';
  } else if (hour >= 15 && hour < 18) {
    timeStr = 'Selamat Sore';
  } else if (hour >= 18 || hour < 4) {
    timeStr = 'Selamat Malam';
  }

  return userName && userName.trim() ? `${timeStr}, ${userName.trim()}` : timeStr;
}

/**
 * RoleHeader - A role-aware header banner for dashboard pages in Bumi Warga.
 *
 * Provides a distinguished, accessible banner with gradients matching user role,
 * interactive refresh triggers, scope territory indicators, and responsive layouts.
 *
 * @component
 * @param {Object} props
 * @param {'ketua_rt'|'ketua_rw'|'admin_kelurahan'|'lurah'|'kader_posyandu'|'warga'|'superadmin'|'walikota'|'camat'|string} [props.role] - User role identifier
 * @param {string} [props.userName] - Display name of the user
 * @param {string} [props.scopeLabel] - Territory scope string (e.g. 'RT 001 / RW 001')
 * @param {string} [props.greeting] - Optional custom greeting text override
 * @param {() => void} [props.onRefresh] - Optional callback function triggered on refresh click
 * @param {boolean} [props.loading=false] - Whether data is actively being refreshed (spins icon)
 * @param {string} [props.className=''] - Additional custom CSS class names
 * @param {React.ReactNode} [props.children] - Optional custom action buttons or widgets rendered on the right
 * @returns {JSX.Element}
 */
export default function RoleHeader({
  role = 'warga',
  userName = '',
  scopeLabel = '',
  greeting = '',
  onRefresh,
  loading = false,
  className = '',
  children,
}) {
  const theme = useMemo(() => {
    const normalizedRole = (role || '').toLowerCase().trim();
    return ROLE_THEMES[normalizedRole] || DEFAULT_THEME;
  }, [role]);

  const displayGreeting = useMemo(() => {
    if (greeting && greeting.trim()) {
      return greeting.trim();
    }
    return getAutoGreeting(userName);
  }, [greeting, userName]);

  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${theme.gradient} text-white p-6 sm:p-8 shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-6 ${className}`.trim()}
      role="banner"
    >
      {/* Decorative blurred background circles */}
      <div
        className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -left-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content Area: Role Pill, Headline Greeting, Scope */}
      <div className="relative z-10 space-y-2.5 max-w-2xl">
        {/* Top Role Badge Pill with Sparkles Icon */}
        <div className="inline-flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs transition-colors ${theme.badge}`}
          >
            <Sparkles size={13} className={`${theme.sparkleColor} shrink-0`} aria-hidden="true" />
            <span>{theme.label}</span>
          </span>
        </div>

        {/* Headline Greeting Text */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
          {displayGreeting}
        </h1>

        {/* Territory Scope Label with MapPin Icon */}
        {scopeLabel ? (
          <div className="flex items-center gap-2 pt-0.5 text-xs sm:text-sm text-white/80 font-medium">
            <MapPin size={14} className="text-sky-300 shrink-0" aria-hidden="true" />
            <span className="tracking-wide">{scopeLabel}</span>
          </div>
        ) : null}
      </div>

      {/* Action Area: Optional Children & Refresh Button */}
      {(onRefresh || children) && (
        <div className="relative z-10 flex flex-wrap items-center gap-3 self-start md:self-center">
          {children}

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              aria-label="Segarkan data"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-xl text-xs sm:text-sm font-semibold backdrop-blur-md border border-white/20 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={`shrink-0 transition-transform ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>{loading ? 'Menyegarkan...' : 'Segarkan Data'}</span>
            </button>
          )}
        </div>
      )}
    </motion.header>
  );
}
