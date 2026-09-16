import React from 'react';
import { motion } from 'framer-motion';

/**
 * Variasi animasi entrance container bertingkat (stagger) menggunakan Framer Motion.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

/**
 * Variasi animasi untuk setiap slot bagian/seksi di dalam dashboard.
 */
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

/**
 * DashboardShell - Wrapper layout dashboard standar yang menyediakan struktur terpadu
 * dan konsisten untuk platform digital kelurahan "Bumi Warga".
 *
 * Mengikuti alur visual hierarkis:
 * header → briefCard → kpiGrid → actionCenter → children
 * Dilengkapi animasi mount berjenjang (staggered entrance) dengan Framer Motion.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} [props.header] - Slot area header (biasanya RoleHeader / Directive Banner)
 * @param {import('react').ReactNode} [props.briefCard] - Slot kartu AI Brief / rekomendasi intelijen (opsional)
 * @param {import('react').ReactNode} [props.kpiGrid] - Slot grid metrik ringkasan KPI (opsional)
 * @param {import('react').ReactNode} [props.actionCenter] - Slot panel pusat tindakan prioritas (opsional)
 * @param {import('react').ReactNode} [props.children] - Slot konten utama halaman
 * @param {string} [props.className=''] - Kelas CSS kustom tambahan
 * @returns {import('react').JSX.Element}
 */
export default function DashboardShell({
  header,
  breadcrumb,
  briefCard,
  kpiGrid,
  actionCenter,
  actionTray,
  children,
  className = '',
}) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`w-full max-w-[1280px] mx-auto p-4 lg:p-0 space-y-6 ${className}`.trim()}
    >
      {/* 1. Slot Header Dashboard (e.g. RoleHeader / Executive Banner) */}
      {header && (
        <motion.header variants={itemVariants} className="w-full">
          {header}
        </motion.header>
      )}

      {/* 1.1 Slot Breadcrumb (Navigasi Hirarki Wilayah Opsional) */}
      {breadcrumb && (
        <motion.nav variants={itemVariants} aria-label="Breadcrumb" className="w-full">
          {breadcrumb}
        </motion.nav>
      )}

      {/* 2. Slot Kartu Ringkasan Intelijen AI (AI Brief Card) */}
      {briefCard && (
        <motion.section variants={itemVariants} aria-label="Ringkasan AI" className="w-full">
          {briefCard}
        </motion.section>
      )}

      {/* 3. Slot Ringkasan Metrik / KPI Grid */}
      {kpiGrid && (
        <motion.section variants={itemVariants} aria-label="Indikator Kinerja Utama" className="w-full">
          {kpiGrid}
        </motion.section>
      )}

      {/* 4. Slot Pusat Tindakan (Action Center) */}
      {actionCenter && (
        <motion.section variants={itemVariants} aria-label="Pusat Tindakan" className="w-full">
          {actionCenter}
        </motion.section>
      )}

      {/* 5. Slot Konten Utama Halaman (Children) */}
      {children && (
        <motion.section variants={itemVariants} aria-label="Konten Utama" className="w-full">
          {children}
        </motion.section>
      )}

      {/* 6. Slot Action Tray (e.g. QuickSignTray / Floating Batch Actions) */}
      {actionTray && (
        <motion.aside variants={itemVariants} aria-label="Baki Tindakan Cepat">
          {actionTray}
        </motion.aside>
      )}
    </motion.div>
  );
}
