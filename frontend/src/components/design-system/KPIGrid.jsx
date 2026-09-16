import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Variasi animasi kontainer untuk efek stagger kemunculan elemen anak.
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/**
 * Variasi animasi elemen individual (fade-in-up).
 */
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
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
 * Pemetaan kelas Tailwind responsif saat jumlah kolom ditentukan secara eksplisit.
 */
const COLUMN_CLASSES = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
};

/**
 * Menghitung kelas grid responsif otomatis berdasarkan jumlah kartu anak:
 * - Mobile (< 640px): 1 kolom
 * - Tablet (640-1024px): 2 kolom
 * - Desktop (> 1024px): 3 atau 4 kolom (disesuaikan agar kartu terisi seimbang)
 *
 * @param {number} count - Jumlah kartu anak valid
 * @returns {string} Kelas grid Tailwind
 */
function getResponsiveGridClass(count) {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (count === 3 || count === 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
}

/**
 * Komponen KPIGrid berfungsi sebagai container tata letak grid responsif untuk menyusun kumpulan KPICard.
 * Mendukung transisi animasi mount berjenjang (staggered fade-in-up) menggunakan framer-motion.
 *
 * @component
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Komponen anak, umumnya KPICard
 * @param {number} [props.columns] - Penimpa jumlah kolom kustom (default: auto-responsive)
 * @param {string} [props.className=''] - Kelas Tailwind tambahan
 * @returns {import('react').JSX.Element|null}
 */
export default function KPIGrid({
  children,
  columns,
  className = '',
}) {
  // Saring dan ratakan elemen anak agar aman dari nilai null, false, atau undefined
  const validChildren = useMemo(() => {
    return React.Children.toArray(children).filter(Boolean);
  }, [children]);

  // Tentukan kelas grid responsif
  const gridColumnsClass = useMemo(() => {
    if (columns) {
      return COLUMN_CLASSES[columns] || `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`;
    }
    return getResponsiveGridClass(validChildren.length);
  }, [columns, validChildren.length]);

  if (validChildren.length === 0) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid gap-4 ${gridColumnsClass} ${className}`.trim().replace(/\s+/g, ' ')}
    >
      {validChildren.map((child, index) => (
        <motion.div
          key={child.key ?? index}
          variants={itemVariants}
          className="h-full"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
