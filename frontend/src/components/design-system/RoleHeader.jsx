import React, { useMemo } from 'react';
import { Sparkles, MapPin, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Role-to-label mapping configuration
 * Consistent with Soft Sky Civic Utility design language (no unmeaningful rainbow variations).
 */
const ROLE_LABELS = {
  ketua_rt: 'Ketua RT',
  ketua_rw: 'Ketua RW',
  admin_kelurahan: 'Admin Kelurahan',
  lurah: 'Lurah Kebonjati',
  kader_posyandu: 'Kader Posyandu',
  warga: 'Warga Masyarakat',
  superadmin: 'Super Admin',
  walikota: 'Walikota Sukabumi',
  camat: 'Camat Cikole',
};

const CIVIC_UTILITY_THEME = {
  gradient: 'from-slate-900 via-slate-900 to-sky-950 border border-slate-800/80',
  badge: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
  sparkleColor: 'text-sky-400',
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
  const roleLabel = useMemo(() => {
    const normalizedRole = (role || '').toLowerCase().trim();
    return ROLE_LABELS[normalizedRole] || 'Petugas Kebonjati';
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
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${CIVIC_UTILITY_THEME.gradient} text-white p-5 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 ${className}`.trim()}
      role="banner"
    >
      {/* Subtle Sky Accent Glow */}
      <div
        className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Content Area: Role Pill, Headline Greeting, Scope */}
      <div className="relative z-10 space-y-2 max-w-2xl">
        {/* Top Role Badge Pill */}
        <div className="inline-flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border ${CIVIC_UTILITY_THEME.badge}`}
          >
            <Sparkles size={13} className={`${CIVIC_UTILITY_THEME.sparkleColor} shrink-0`} aria-hidden="true" />
            <span>{roleLabel}</span>
          </span>
        </div>

        {/* Headline Greeting Text */}
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
          {displayGreeting}
        </h1>

        {/* Territory Scope Label with MapPin Icon */}
        {scopeLabel ? (
          <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-300 font-medium">
            <MapPin size={14} className="text-sky-400 shrink-0" aria-hidden="true" />
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
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/25 text-white rounded-xl text-xs sm:text-sm font-semibold border border-white/20 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
