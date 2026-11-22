import React from 'react';
import { motion } from 'framer-motion';

/**
 * ModuleHeader - A unified Civic Utility header for operational module pages (Dokumen, Bansos, PBB, etc.)
 * Strictly follows the Soft Sky & Slate Civic Trust design language.
 *
 * @component
 * @param {Object} props
 * @param {string} [props.badge] - Optional badge label (e.g. 'Tata Kelola Berbasis Evidensi')
 * @param {React.ElementType} [props.badgeIcon] - Optional Lucide icon for badge
 * @param {string} props.title - Page / Module title
 * @param {React.ElementType} [props.titleIcon] - Optional Lucide icon for title
 * @param {string} [props.description] - Brief description or SOP guidance
 * @param {string} [props.scopeLabel] - Territory scope indicator (e.g. 'RT 001 / RW 001')
 * @param {React.ElementType} [props.scopeIcon] - Optional Lucide icon for scope
 * @param {React.ReactNode} [props.children] - Action buttons rendered on the right
 * @param {string} [props.className] - Additional classes
 */
export default function ModuleHeader({
  badge = '',
  badgeIcon: BadgeIcon,
  title = '',
  titleIcon: TitleIcon,
  description = '',
  scopeLabel = '',
  scopeIcon: ScopeIcon,
  children,
  className = '',
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100/80 via-sky-50/50 to-white text-slate-900 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 border border-sky-200/80 ${className}`.trim()}
      role="banner"
    >
      {/* Main Content Area */}
      <div className="relative z-10 space-y-2 max-w-2xl">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border bg-white text-sky-800 border-sky-200 shadow-xs">
            {BadgeIcon && <BadgeIcon size={13} className="text-sky-700 shrink-0" aria-hidden="true" />}
            <span>{badge}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {TitleIcon && (
            <div className="w-10 h-10 rounded-xl bg-white border border-sky-200 flex items-center justify-center shrink-0 text-sky-700 shadow-xs">
              <TitleIcon size={22} aria-hidden="true" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>
            {scopeLabel && (
              <div className="flex items-center gap-1.5 pt-0.5 text-xs text-slate-600 font-medium">
                {ScopeIcon && <ScopeIcon size={13} className="text-sky-700 shrink-0" aria-hidden="true" />}
                <span className="tracking-wide">{scopeLabel}</span>
              </div>
            )}
          </div>
        </div>

        {description && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons Area */}
      {children && (
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {children}
        </div>
      )}
    </motion.header>
  );
}
