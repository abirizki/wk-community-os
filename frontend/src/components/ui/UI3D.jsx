import React from 'react';
import { motion } from 'framer-motion';

/**
 * UI3D Component Library
 * Komponen siap pakai dengan efek 3D untuk Bumi Warga
 * Mobile-First Design with Soft Sky Blue Identity
 */

// ============================================================================
// STAT CARD 3D - Glass Morphism dengan Sky Accent
// ============================================================================
export function StatCard3D({ 
  icon, 
  iconBgColor = 'from-blue-100 to-blue-50',
  iconColor = 'text-blue-700',
  borderAccent = 'border-l-blue-500',
  label, 
  value, 
  subtitle,
  metrics = [],
  className = '',
  onClick
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`
        group relative
        bg-gradient-to-br from-white via-white to-sky-50/30
        p-card-padding-md
        rounded-lg lg:rounded-xl
        border-2 border-sky-100/60 ${borderAccent ? `border-l-4 ${borderAccent}` : ''}
        shadow-card-3d
        hover:shadow-card-3d-hover
        transition-all duration-300 ease-out
        overflow-hidden
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Top Accent Line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-50" />

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/0 via-sky-50/0 to-sky-100/0 group-hover:from-sky-100/40 group-hover:to-sky-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 space-y-3 sm:space-y-4">
        {/* Header: Label + Icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 truncate">
            {label}
          </span>
          
          {/* Icon with 3D Background */}
          {icon && (
            <div className={`
              p-2.5 sm:p-3
              bg-gradient-to-br ${iconBgColor}
              ${iconColor}
              rounded-xl
              shadow-[0_2px_8px_rgba(37,99,235,0.15),inset_0_1px_0_rgba(255,255,255,0.6)]
              border border-blue-200/50
              flex-shrink-0
            `}>
              {icon}
            </div>
          )}
        </div>

        {/* Primary Metric */}
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight [text-shadow:_0_1px_2px_rgba(255,255,255,0.8)]">
            {value}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Divider */}
        {metrics && metrics.length > 0 && (
          <div className="h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />
        )}

        {/* Secondary Metrics Grid */}
        {metrics && metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs">
            {metrics.map((metric, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-slate-600 text-[11px] sm:text-xs">{metric.label}</span>
                <div className={`font-bold text-sm sm:text-base ${metric.color || 'text-slate-900'}`}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Shine Effect */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-40" />
    </motion.div>
  );
}

// ============================================================================
// BUTTON 3D - Primary dengan Lift Effect
// ============================================================================
export function Button3D({ 
  children, 
  icon, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  ...props 
}) {
  const variants = {
    primary: `
      bg-gradient-to-b from-sky-500 to-sky-600
      text-white
      border border-sky-700/30
      shadow-button
      hover:shadow-button-hover
      active:shadow-button-active
      hover:translate-y-[-1px]
      active:translate-y-0
    `,
    secondary: `
      bg-white hover:bg-slate-50
      text-slate-800
      border-2 border-slate-200
      shadow-[0_2px_8px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
      hover:shadow-[0_4px_12px_rgba(15,23,42,0.12)]
      hover:translate-y-[-1px]
      active:translate-y-0
      active:shadow-[0_1px_4px_rgba(15,23,42,0.1),inset_0_2px_4px_rgba(0,0,0,0.05)]
    `,
    ghost: `
      bg-transparent hover:bg-sky-50
      text-sky-700
      border border-transparent
      hover:border-sky-200
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-xs min-h-[36px]',
    md: 'px-4 sm:px-5 py-2.5 sm:py-3 text-sm min-h-[44px]',
    lg: 'px-6 py-3.5 text-base min-h-[52px]'
  };

  return (
    <button
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl
        font-bold
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// ============================================================================
// HEADER 3D - Executive Banner dengan Orbs
// ============================================================================
export function Header3D({ 
  badge,
  badgeIcon,
  title, 
  subtitle,
  location,
  actions,
  className = '' 
}) {
  return (
    <header className={`
      relative overflow-hidden
      bg-gradient-to-br from-sky-50 via-white to-blue-50
      border-2 border-sky-200/60
      rounded-lg sm:rounded-xl lg:rounded-2xl
      p-4 sm:p-header-padding-sm lg:p-header-padding-md
      shadow-[0_4px_16px_rgba(2,132,199,0.08),0_1px_3px_rgba(15,23,42,0.05)]
      ${className}
    `}>
      {/* 3D Depth - Top Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60" />
      
      {/* Background Orbs */}
      <div className="absolute -right-16 sm:-right-20 -bottom-16 sm:-bottom-20 w-64 sm:w-80 h-64 sm:h-80 bg-gradient-radial from-sky-200/40 via-sky-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 sm:-left-16 -top-12 sm:-top-16 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-radial from-blue-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        {/* Left: Title Section */}
        <div className="space-y-2 sm:space-y-3 max-w-2xl">
          {/* Badge */}
          {badge && (
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-gradient-to-br from-sky-50 to-sky-100 border border-sky-300/50 shadow-[0_2px_8px_rgba(2,132,199,0.12),inset_0_1px_0_rgba(255,255,255,0.8)] text-sky-800 text-xs font-bold">
              {badgeIcon && <span className="flex-shrink-0">{badgeIcon}</span>}
              <span className="truncate">{badge}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-slate-900 tracking-tight [text-shadow:_0_1px_2px_rgba(255,255,255,0.8)]">
            {title}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm lg:text-base text-slate-700 leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-600 font-medium">
              {location}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================================================
// GLASS CARD - AI Insights dengan Glass Morphism
// ============================================================================
export function GlassCard({ 
  severity = 'info', 
  badge,
  title, 
  content,
  action,
  className = '' 
}) {
  const severityStyles = {
    critical: {
      bg: 'from-rose-50/90 via-white/60 to-rose-50/50',
      border: 'border-rose-200/60',
      badge: 'from-rose-600 to-rose-500',
      glow: 'from-rose-100/40 to-rose-50/20'
    },
    warning: {
      bg: 'from-amber-50/90 via-white/60 to-amber-50/50',
      border: 'border-amber-200/60',
      badge: 'from-amber-600 to-amber-500',
      glow: 'from-amber-100/40 to-amber-50/20'
    },
    info: {
      bg: 'from-white/90 via-sky-50/60 to-blue-50/50',
      border: 'border-sky-200/60',
      badge: 'from-sky-600 to-sky-500',
      glow: 'from-sky-100/40 to-sky-50/20'
    }
  };

  const style = severityStyles[severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${style.bg}
        backdrop-blur-xl
        border-2 border-white/40 ${style.border}
        shadow-[0_8px_32px_rgba(2,132,199,0.12),0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)]
        hover:shadow-[0_12px_48px_rgba(2,132,199,0.18)]
        p-4 sm:p-5 lg:p-6 rounded-xl lg:rounded-2xl
        transition-all duration-300
        ${className}
      `}
    >
      {/* Glow Border Top */}
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-${severity === 'critical' ? 'rose' : severity === 'warning' ? 'amber' : 'sky'}-400 to-transparent`} />

      {/* Badge */}
      {badge && (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${style.badge} text-white text-xs font-bold shadow-[0_4px_12px_rgba(220,38,38,0.3)]`}>
          {badge}
        </span>
      )}

      {/* Title */}
      <h3 className="font-bold text-base sm:text-lg leading-snug mt-3 mb-2 text-slate-900">
        {title}
      </h3>

      {/* Content */}
      <div className="text-xs sm:text-sm leading-relaxed text-slate-700 opacity-90">
        {content}
      </div>

      {/* Action */}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}

      {/* Hover Glow */}
      <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent group-hover:${style.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
    </motion.div>
  );
}

// ============================================================================
// BADGE 3D - Status badges dengan depth
// ============================================================================
export function Badge3D({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '' 
}) {
  const variants = {
    primary: 'bg-sky-50 text-sky-800 border-sky-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    default: 'bg-slate-50 text-slate-700 border-slate-200'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`
      inline-flex items-center gap-1
      rounded-full
      font-bold
      border
      shadow-xs
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
}

export default {
  StatCard3D,
  Button3D,
  Header3D,
  GlassCard,
  Badge3D
};
