import React from 'react';
import UnifiedStatCard from './UnifiedStatCard';

/**
 * KPICard (Backward-Compatible Wrapper untuk UnifiedStatCard)
 * Menggunakan standar desain tunggal:
 * - padding 16px (p-4)
 * - min-height 112px
 * - typography hierarkis
 * - tren semantik & anti-CLS
 */
export default function KPICard(props) {
  return <UnifiedStatCard {...props} />;
}
