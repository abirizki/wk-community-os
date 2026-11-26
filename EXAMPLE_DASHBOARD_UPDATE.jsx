// ============================================================================
// CONTOH IMPLEMENTASI: Update DashboardHome.jsx dengan UI3D Components
// Copy-paste section ini ke frontend/src/pages/DashboardHome.jsx
// ============================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Baby, 
  HeartPulse, 
  Gift, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Landmark, 
  Loader2, 
  ChevronRight, 
  Info, 
  Eye, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  BarChart3, 
  Layers, 
  MapPin,
  Check,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ IMPORT KOMPONEN UI3D BARU
import { Header3D, Button3D, StatCard3D, GlassCard, Badge3D } from '../components/ui/UI3D';

// ... import dashboard role-specific components ...

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ... existing role routing logic ...

  const isOfficer = user && user.role !== 'warga';
  
  // State management
  const [summaryData, setSummaryData] = useState(null);
  const [loadingOfficer, setLoadingOfficer] = useState(isOfficer);
  const [errorOfficer, setErrorOfficer] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // ... existing functions (fetchOfficerData, etc.) ...

  const scopeLabel = isRT
    ? `Wilayah Binaan RT ${user?.rt || '001'} / RW ${user?.rw || '001'}`
    : isRW
    ? `Wilayah Binaan RW ${user?.rw || '001'} (Kelurahan Kebonjati)`
    : `Seluruh Wilayah Kelurahan Kebonjati (Kecamatan Cikole, Kota Sukabumi)`;

  // Extract data
  const kpi = summaryData?.kpi || {};
  const demography = kpi.demography || {};
  const docVelocity = kpi.document_velocity || {};
  const complaints = kpi.complaints || {};
  const insights = summaryData?.ai_insights || [];
  const rtMatrix = summaryData?.rt_risk_matrix || [];

  // ============================================================================
  // ✅ TAMPILAN DENGAN KOMPONEN UI3D BARU - MOBILE-FIRST
  // ============================================================================
  
  if (isOfficer) {
    return (
      <div className="max-w-max-width mx-auto space-y-6 sm:space-y-8 pb-16">
        
        {/* =====================================================================
            1. HEADER 3D - Ganti dengan Header3D Component
            ===================================================================== */}
        <Header3D
          badge="Pusat Komando & Keputusan Berbasis Evidens"
          badgeIcon={<Sparkles size={14} className="text-sky-600" />}
          title="Dashboard Pimpinan Kebonjati"
          subtitle="Analitik presisi, deteksi dini risiko kesehatan siklus hidup, dan penyeimbangan jaring pengaman sosial berbasis bukti nyata."
          location={
            <>
              <MapPin size={14} className="text-sky-600" />
              <span>{scopeLabel}</span>
            </>
          }
          actions={
            <>
              <Button3D
                variant="secondary"
                size="md"
                icon={<RefreshCw size={14} className={loadingOfficer ? 'animate-spin' : ''} />}
                onClick={fetchOfficerData}
                disabled={loadingOfficer}
              >
                Segarkan Analitik
              </Button3D>
              <Button3D
                variant="primary"
                size="md"
                icon={<FileCheck size={14} />}
                onClick={() => navigate('/dashboard/dokumen')}
              >
                Buka Layanan Surat ({docVelocity.total_dalam_proses || 0})
              </Button3D>
            </>
          }
        />

        {/* =====================================================================
            2. LOADING & ERROR STATES - Keep existing logic
            ===================================================================== */}
        {loadingOfficer && !summaryData ? (
          <div className="p-12 sm:p-16 flex flex-col items-center justify-center gap-3 bg-surface-container-lowest rounded-xl lg:rounded-2xl border border-outline-variant shadow-sm text-on-surface-variant">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p className="text-sm font-semibold text-center">
              Memproses data inferensi AI dan agregasi metrik kewilayahan...
            </p>
          </div>
        ) : errorOfficer ? (
          <div className="p-4 sm:p-5 bg-rose-50 border-2 border-rose-200 rounded-xl lg:rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-800 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0" />
              <span>{errorOfficer}</span>
            </div>
            <button 
              onClick={fetchOfficerData} 
              className="font-semibold underline text-xs whitespace-nowrap"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* =================================================================
                3. AI STRATEGIC INSIGHTS - Ganti dengan GlassCard
                ================================================================= */}
            <section className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg flex-shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-on-surface">
                      Rekomendasi Strategis & Peringatan AI
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Inferensi deterministik dari rekam medis Posyandu, bansos, dan sensus demografi.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  {summaryData?.data_fidelity && (
                    <Badge3D 
                      variant={
                        summaryData.data_fidelity.level === 'HIGH' ? 'success' :
                        summaryData.data_fidelity.level === 'MODERATE' ? 'warning' : 'danger'
                      }
                      size="md"
                    >
                      <ShieldCheck size={14} />
                      <span>Data Confidence: {summaryData.data_fidelity.confidence_score}%</span>
                    </Badge3D>
                  )}
                  <Badge3D variant="default" size="md">
                    {insights.length} Arahan Aktif
                  </Badge3D>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <GlassCard
                    key={insight.id}
                    severity={
                      insight.severity === 'CRITICAL' ? 'critical' :
                      insight.severity === 'WARNING' ? 'warning' : 'info'
                    }
                    badge={
                      <>
                        {insight.severity === 'CRITICAL' && <AlertTriangle size={12} />}
                        <span>{insight.badge_label}</span>
                      </>
                    }
                    title={insight.title}
                    content={
                      <div className="space-y-2">
                        <p className="text-xs sm:text-sm">{insight.summary}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-black/5">
                          <span className="text-[11px] font-medium opacity-75">
                            Aturan: {insight.rule_code}
                          </span>
                          <span className="text-[11px] font-semibold">
                            Urgensi: {insight.impact_score}/100
                          </span>
                        </div>
                      </div>
                    }
                    action={
                      <Button3D
                        variant="secondary"
                        size="sm"
                        icon={<Eye size={13} />}
                        onClick={() => openEvidenceModal(insight)}
                      >
                        Rasional Bukti & Aksi
                        <ChevronRight size={13} />
                      </Button3D>
                    }
                  />
                ))}
              </div>
            </section>

            {/* =================================================================
                4. MACRO KPI METRICS - Ganti dengan StatCard3D
                ================================================================= */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Kependudukan */}
              <StatCard3D
                icon={<Users size={20} />}
                iconBgColor="from-blue-100 to-blue-50"
                iconColor="text-blue-700"
                borderAccent="border-l-blue-500"
                label="Demografi Penduduk"
                value={demography.total_warga_aktif || 0}
                subtitle="Warga Terdaftar Aktif"
                metrics={[
                  { label: 'Laki-laki', value: demography.total_laki || 0 },
                  { label: 'Perempuan', value: demography.total_perempuan || 0 },
                  { label: 'Kartu Keluarga', value: demography.total_kk || 0 },
                  { label: 'Tetap', value: demography.status_tetap || 0, color: 'text-emerald-600' }
                ]}
              />

              {/* Surveilans Balita */}
              <StatCard3D
                icon={<Baby size={20} />}
                iconBgColor="from-emerald-100 to-emerald-50"
                iconColor="text-emerald-700"
                borderAccent="border-l-emerald-500"
                label="Surveilans Balita (KMS)"
                value={demography.total_balita || 0}
                subtitle="Balita Binaan Posyandu"
                metrics={[
                  { 
                    label: 'Program Prioritas', 
                    value: 'PMT & Zero-Stunting', 
                    color: 'text-emerald-700' 
                  }
                ]}
              />

              {/* Kesehatan Geriatri */}
              <StatCard3D
                icon={<HeartPulse size={20} />}
                iconBgColor="from-rose-100 to-rose-50"
                iconColor="text-rose-700"
                borderAccent="border-l-rose-500"
                label="Kesehatan Geriatri"
                value={demography.total_lansia || 0}
                subtitle="Lansia Binaan (≥ 60 Thn)"
                metrics={[
                  { 
                    label: 'Skrining Rutin', 
                    value: 'Posbindu & Tensi', 
                    color: 'text-rose-700' 
                  }
                ]}
              />

              {/* SLA Dokumen */}
              <StatCard3D
                icon={<Clock size={20} />}
                iconBgColor="from-indigo-100 to-indigo-50"
                iconColor="text-indigo-700"
                borderAccent="border-l-indigo-500"
                label="SLA Pelayanan Surat"
                value={`${docVelocity.rata_durasi_jam || 0} Jam`}
                subtitle="Rata-rata Waktu Verifikasi"
                metrics={[
                  { 
                    label: 'Total Disahkan', 
                    value: `${docVelocity.total_disahkan || 0} Dok` 
                  }
                ]}
              />
            </section>

            {/* =================================================================
                5. RT RISK MATRIX - Keep existing, add responsive tweaks
                ================================================================= */}
            <section className="bg-surface-container-lowest rounded-xl lg:rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl flex-shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-on-surface">
                      Matriks Risiko Kewilayahan RT (Kesehatan & Sosial)
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Pemetaan komparasi antar-RT untuk pengalokasian intervensi prioritas.
                    </p>
                  </div>
                </div>
                <Badge3D variant="default" size="sm">
                  RW 001 · Kelurahan Kebonjati
                </Badge3D>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-xs uppercase font-bold text-on-surface-variant tracking-wider">
                    <tr>
                      <th className="p-3 sm:p-4 whitespace-nowrap">Rukun Tetangga (RT)</th>
                      <th className="p-3 sm:p-4 whitespace-nowrap">Status Balita & Stunting</th>
                      <th className="p-3 sm:p-4 whitespace-nowrap">Status Geriatri & Komorbid</th>
                      <th className="p-3 sm:p-4 whitespace-nowrap">Cakupan Jaring Pengaman</th>
                      <th className="p-3 sm:p-4 text-center whitespace-nowrap">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {rtMatrix.map((item) => (
                      <tr key={item.rt} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="p-3 sm:p-4">
                          <div className="font-extrabold text-on-surface text-sm sm:text-base">
                            RT {item.rt}
                          </div>
                          <div className="text-xs text-on-surface-variant">
                            RW {item.rw} Kebonjati
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <Badge3D 
                            variant={
                              item.stunting.level === 'TINGGI' ? 'danger' :
                              item.stunting.level === 'WASPADA' ? 'warning' : 'success'
                            }
                            size="sm"
                          >
                            {item.stunting.level}
                          </Badge3D>
                          <div className="text-xs text-on-surface-variant mt-1">
                            {item.stunting.kasus_rawan} rawan / {item.stunting.total_balita} balita
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <Badge3D 
                            variant={
                              item.geriatri.level === 'TINGGI' ? 'danger' :
                              item.geriatri.level === 'WASPADA' ? 'warning' : 'success'
                            }
                            size="sm"
                          >
                            {item.geriatri.level}
                          </Badge3D>
                          <div className="text-xs text-on-surface-variant mt-1">
                            {item.geriatri.hipertensi_berat} tensi · {item.geriatri.sebatang_kara} kara
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <Badge3D 
                            variant={
                              item.bansos.coverage === 'PERLU_PERHATIAN' ? 'warning' : 'success'
                            }
                            size="sm"
                          >
                            {item.bansos.coverage === 'PERLU_PERHATIAN' ? 'Perlu Perhatian' : 'Optimal'}
                          </Badge3D>
                          <div className="text-xs text-on-surface-variant mt-1">
                            {item.bansos.disahkan} / {item.bansos.total_sktm} SKTM
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <Button3D
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard/posyandu')}
                          >
                            Periksa
                            <ChevronRight size={13} />
                          </Button3D>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* =================================================================
            6. MODAL EVIDENCE - Keep existing modal logic
            ================================================================= */}
        {showEvidenceModal && selectedInsight && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container-lowest rounded-2xl lg:rounded-3xl max-w-2xl w-full p-5 sm:p-6 lg:p-8 border border-outline-variant shadow-2xl my-8 space-y-6"
            >
              {/* Modal content - keep existing */}
              <div className="flex items-start justify-between pb-4 border-b border-outline-variant">
                <div className="space-y-1">
                  <Badge3D variant="primary" size="sm">
                    <Sparkles size={13} />
                    <span>Explainable AI (XAI) Evidence Basis</span>
                  </Badge3D>
                  <h3 className="text-base sm:text-lg font-bold text-on-surface leading-snug">
                    {selectedInsight.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Aturan: <strong className="font-mono">{selectedInsight.rule_code}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowEvidenceModal(false)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              {/* ... rest of modal content ... */}
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ... rest of component (citizen view, etc.) ...
}
