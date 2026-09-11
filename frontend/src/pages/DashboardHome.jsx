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
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOfficer = user && user.role !== 'warga';
  const isKelurahan = user && ['admin_kelurahan', 'superadmin', 'admin'].includes(user.role);
  const isRW = user && ['ketua_rw', 'admin_rw'].includes(user.role);
  const isRT = user && user.role === 'ketua_rt';

  // State untuk Executive Leadership Dashboard (Officer)
  const [summaryData, setSummaryData] = useState(null);
  const [loadingOfficer, setLoadingOfficer] = useState(isOfficer);
  const [errorOfficer, setErrorOfficer] = useState(null);

  // Modal Detail Bukti AI (Explainable AI)
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  // State untuk Citizen Portal (Warga)
  const [citizenStats, setCitizenStats] = useState({
    kk: null,
    docs: [],
    posyandu: [],
    bansos: []
  });
  const [loadingCitizen, setLoadingCitizen] = useState(!isOfficer);

  // Fetch data sesuai peran
  const fetchOfficerData = async () => {
    try {
      setLoadingOfficer(true);
      setErrorOfficer(null);
      const res = await api.get('/analytics/executive-summary');
      if (res.success) {
        setSummaryData(res.data);
      } else {
        setErrorOfficer('Gagal memuat data ringkasan eksekutif');
      }
    } catch (err) {
      setErrorOfficer(err.message || 'Gagal memuat analitik eksekutif');
    } finally {
      setLoadingOfficer(false);
    }
  };

  const fetchCitizenData = async () => {
    try {
      setLoadingCitizen(true);
      const [kkRes, docRes, posRes, banRes] = await Promise.allSettled([
        api.get('/kk/my'),
        api.get('/dokumen/me'),
        api.get('/posyandu/me'),
        api.get('/bansos')
      ]);

      setCitizenStats({
        kk: kkRes.status === 'fulfilled' && kkRes.value?.success ? kkRes.value.data : null,
        docs: docRes.status === 'fulfilled' && docRes.value?.success ? docRes.value.data : [],
        posyandu: posRes.status === 'fulfilled' && posRes.value?.success ? posRes.value.data : [],
        bansos: banRes.status === 'fulfilled' && banRes.value?.success ? banRes.value.data : []
      });
    } catch (err) {
      console.error('Error fetching citizen dashboard:', err);
    } finally {
      setLoadingCitizen(false);
    }
  };

  useEffect(() => {
    if (isOfficer) {
      fetchOfficerData();
    } else {
      fetchCitizenData();
    }
  }, [user?.role, user?.rt, user?.rw]);

  const openEvidenceModal = (insight) => {
    setSelectedInsight(insight);
    setShowEvidenceModal(true);
  };

  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val || 0);
  };

  // ===========================================================================
  // TAMPILAN 1: EXECUTIVE LEADERSHIP DASHBOARD (LURAH, RW, RT, PETUGAS)
  // ===========================================================================
  if (isOfficer) {
    const kpi = summaryData?.kpi || {};
    const demography = kpi.demography || {};
    const docVelocity = kpi.document_velocity || {};
    const complaints = kpi.complaints || {};
    const insights = summaryData?.ai_insights || [];
    const rtMatrix = summaryData?.rt_risk_matrix || [];

    const scopeLabel = isRT
      ? `Wilayah Binaan RT ${user?.rt || '001'} / RW ${user?.rw || '001'}`
      : isRW
      ? `Wilayah Binaan RW ${user?.rw || '001'} (Kelurahan Kebonjati)`
      : `Seluruh Wilayah Kelurahan Kebonjati (Kecamatan Andir)`;

    return (
      <div className="max-w-max-width mx-auto space-y-8 pb-16">
        {/* HEADER & EXECUTIVE DIRECTIVE BANNER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Sparkles size={14} className="text-amber-400" />
              <span>Pusat Komando & Keputusan Berbasis Evidens</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Dashboard Pimpinan Kebonjati
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Analitik presisi, deteksi dini risiko kesehatan siklus hidup, dan penyeimbangan jaring pengaman sosial berbasis bukti nyata.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-blue-300 font-medium">
              <MapPin size={14} />
              <span>{scopeLabel}</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <button
              onClick={fetchOfficerData}
              disabled={loadingOfficer}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-md border border-white/15 transition-all shadow-sm"
            >
              <RefreshCw size={14} className={loadingOfficer ? 'animate-spin' : ''} />
              <span>Segarkan Analitik</span>
            </button>
            <Link
              to="/dashboard/dokumen"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-md"
            >
              <FileCheck size={14} />
              <span>Verifikasi Dokumen ({docVelocity.total_dalam_proses || 0})</span>
            </Link>
          </div>
        </header>

        {/* LOADING & ERROR STATES */}
        {loadingOfficer && !summaryData ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm text-on-surface-variant">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p className="text-sm font-semibold">Memproses data inferensi AI dan agregasi metrik kewilayahan...</p>
          </div>
        ) : errorOfficer ? (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0" />
              <span>{errorOfficer}</span>
            </div>
            <button onClick={fetchOfficerData} className="font-semibold underline text-xs">Coba Lagi</button>
          </div>
        ) : (
          <>
            {/* =============================================================== */}
            {/* 1. HERO WIDGET: AI STRATEGIC DIRECTIVES & WARNINGS             */}
            {/* =============================================================== */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-on-surface">Rekomendasi Strategis & Peringatan AI</h2>
                    <p className="text-xs text-on-surface-variant">Inferensi deterministik dari rekam medis Posyandu, bansos, dan sensus demografi.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-surface-container-high rounded-full text-on-surface-variant">
                  {insights.length} Arahan Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight) => {
                  const isCrit = insight.severity === 'CRITICAL';
                  const isWarn = insight.severity === 'WARNING';

                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between shadow-sm ${
                        isCrit
                          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                          : isWarn
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                          : 'bg-blue-50/60 border-blue-200 text-blue-950'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isCrit
                              ? 'bg-rose-600 text-white'
                              : isWarn
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}>
                            {isCrit && <AlertTriangle size={12} />}
                            {insight.badge_label}
                          </span>
                          <span className="text-[11px] font-semibold opacity-70">
                            Skor Urgensi: {insight.impact_score}/100
                          </span>
                        </div>

                        <h3 className="font-bold text-base leading-snug mb-1.5">
                          {insight.title}
                        </h3>
                        <p className="text-xs leading-relaxed opacity-85">
                          {insight.summary}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-black/5 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-medium opacity-75">
                          Aturan: {insight.rule_code}
                        </span>
                        <button
                          onClick={() => openEvidenceModal(insight)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/80 hover:bg-white text-on-surface shadow-sm border border-black/10 transition-colors"
                        >
                          <Eye size={13} />
                          <span>Rasional Bukti & Aksi</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            {/* =============================================================== */}
            {/* 2. MACRO EXECUTIVE KPI METRICS                                  */}
            {/* =============================================================== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Kependudukan */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-3">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-bold uppercase tracking-wider">Demografi Penduduk</span>
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <Users size={18} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-on-surface tracking-tight">
                    {demography.total_warga_aktif || 0}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Warga Terdaftar Aktif</p>
                </div>
                <div className="pt-2 border-t border-outline-variant grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
                  <div>Laki-laki: <strong className="text-on-surface">{demography.total_laki || 0}</strong></div>
                  <div>Perempuan: <strong className="text-on-surface">{demography.total_perempuan || 0}</strong></div>
                  <div>Kartu Keluarga: <strong className="text-on-surface">{demography.total_kk || 0}</strong></div>
                  <div>Tetap: <strong className="text-emerald-600">{demography.status_tetap || 0}</strong></div>
                </div>
              </div>

              {/* Surveilans Balita & Stunting */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-3">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-bold uppercase tracking-wider">Surveilans Balita (KMS)</span>
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <Baby size={18} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                    {demography.total_balita || 0}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Balita Binaan Posyandu</p>
                </div>
                <div className="pt-2 border-t border-outline-variant flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant">Program Prioritas:</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    PMT & Zero-Stunting
                  </span>
                </div>
              </div>

              {/* Kesehatan Geriatri (PTM) */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-3">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-bold uppercase tracking-wider">Kesehatan Geriatri</span>
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <HeartPulse size={18} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-rose-600 tracking-tight">
                    {demography.total_lansia || 0}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Lansia Binaan (&ge; 60 Thn)</p>
                </div>
                <div className="pt-2 border-t border-outline-variant flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant">Skrining Rutin:</span>
                  <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    Posbindu & Tensi
                  </span>
                </div>
              </div>

              {/* Efisiensi Layanan & SLA Dokumen */}
              <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-3">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-xs font-bold uppercase tracking-wider">SLA Pelayanan Surat</span>
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <Clock size={18} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                    {docVelocity.rata_durasi_jam || 0} <span className="text-sm font-normal text-on-surface-variant">Jam</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Rata-rata Waktu Verifikasi</p>
                </div>
                <div className="pt-2 border-t border-outline-variant flex items-center justify-between text-[11px]">
                  <span className="text-on-surface-variant">Total Disahkan:</span>
                  <strong className="text-on-surface">{docVelocity.total_disahkan || 0} Dokumen</strong>
                </div>
              </div>
            </section>

            {/* =============================================================== */}
            {/* 3. MATRIKS RISIKO KEWILAYAHAN TERPADU (RT RISK MATRIX)          */}
            {/* =============================================================== */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Matriks Risiko Kewilayahan RT (Kesehatan & Sosial)</h2>
                    <p className="text-xs text-on-surface-variant">Pemetaan komparasi antar-RT untuk pengalokasian intervensi prioritas.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-surface-container-high rounded-lg text-on-surface-variant">
                  RW 001 · Kelurahan Kebonjati
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-xs uppercase font-bold text-on-surface-variant tracking-wider">
                    <tr>
                      <th className="p-4">Rukun Tetangga (RT)</th>
                      <th className="p-4">Status Balita & Stunting</th>
                      <th className="p-4">Status Geriatri & Komorbid</th>
                      <th className="p-4">Cakupan Jaring Pengaman (Bansos)</th>
                      <th className="p-4 text-center">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {rtMatrix.map((item) => {
                      const isStuntHigh = item.stunting.level === 'TINGGI';
                      const isStuntWarn = item.stunting.level === 'WASPADA';

                      const isGeriatriHigh = item.geriatri.level === 'TINGGI';
                      const isGeriatriWarn = item.geriatri.level === 'WASPADA';

                      const isBansosGap = item.bansos.coverage === 'PERLU_PERHATIAN';

                      return (
                        <tr key={item.rt} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="p-4">
                            <div className="font-extrabold text-on-surface text-base">RT {item.rt}</div>
                            <div className="text-xs text-on-surface-variant">RW {item.rw} Kebonjati</div>
                          </td>

                          {/* Balita */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isStuntHigh
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isStuntWarn
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {item.stunting.level}
                              </span>
                              <span className="text-xs text-on-surface-variant">
                                ({item.stunting.kasus_rawan} kasus rawan dari {item.stunting.total_balita} balita)
                              </span>
                            </div>
                          </td>

                          {/* Geriatri */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isGeriatriHigh
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : isGeriatriWarn
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {item.geriatri.level}
                              </span>
                              <span className="text-xs text-on-surface-variant">
                                ({item.geriatri.hipertensi_berat} tensi berat &bull; {item.geriatri.sebatang_kara} sebatang kara)
                              </span>
                            </div>
                          </td>

                          {/* Bansos */}
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                isBansosGap
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {isBansosGap ? 'Perlu Perhatian' : 'Optimal'}
                              </span>
                              <span className="text-xs text-on-surface-variant">
                                ({item.bansos.disahkan} disahkan dari {item.bansos.total_sktm} SKTM)
                              </span>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="p-4 text-center">
                            <Link
                              to="/dashboard/posyandu"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              <span>Periksa</span>
                              <ChevronRight size={13} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* =================================================================== */}
        {/* MODAL EXPLAINABLE AI (XAI) & ACTION DIRECTIVES                     */}
        {/* =================================================================== */}
        {showEvidenceModal && selectedInsight && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-outline-variant shadow-2xl my-8 space-y-6"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-4 border-b border-outline-variant">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary mb-1">
                    <Sparkles size={13} />
                    <span>Explainable AI (XAI) Evidence Basis</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface leading-snug">
                    {selectedInsight.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    Aturan Inferensi: <strong className="font-mono">{selectedInsight.rule_code}</strong> &bull; Kategori: {selectedInsight.category}
                  </p>
                </div>
                <button
                  onClick={() => setShowEvidenceModal(false)}
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Evidence Data Box */}
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
                  <BarChart3 size={15} className="text-primary" />
                  <span>Data Bukti Riil (MySQL Database Ground Truth)</span>
                </div>
                <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant text-xs font-mono space-y-1.5 max-h-48 overflow-y-auto">
                  {Object.entries(selectedInsight.evidence || {}).map(([key, val]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-1 border-b border-outline-variant/40 last:border-0">
                      <span className="text-on-surface-variant capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-bold text-on-surface">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Directives */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-on-surface uppercase tracking-wider">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Rekomendasi Instruksi Aksi Pimpinan (Action Directives)</span>
                </div>
                <div className="space-y-2">
                  {selectedInsight.action_directives?.map((action, idx) => (
                    <div key={idx} className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Navigation Footer */}
              <div className="pt-4 border-t border-outline-variant flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-on-surface-variant font-medium">
                  Keputusan berbasis evidens mempercepat penanganan di lapangan.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEvidenceModal(false)}
                    className="px-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold hover:bg-surface-container-high transition-colors"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEvidenceModal(false);
                      if (selectedInsight.category === 'KESEHATAN_BALITA' || selectedInsight.category === 'GERIATRI_LANSIA') {
                        navigate('/dashboard/posyandu');
                      } else if (selectedInsight.category === 'BANTUAN_SOSIAL') {
                        navigate('/dashboard/bansos');
                      } else {
                        navigate('/dashboard/dokumen');
                      }
                    }}
                    className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Lanjutkan ke Modul Terkait</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ===========================================================================
  // TAMPILAN 2: CITIZEN DIGITAL PORTAL HOME (WARGA)
  // ===========================================================================
  const kk = citizenStats.kk;
  const docs = citizenStats.docs || [];
  const latestDoc = docs[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* CITIZEN WELCOME BANNER */}
      <div className="bg-gradient-to-r from-primary via-indigo-700 to-blue-800 text-on-primary p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md">
            <Landmark size={14} />
            <span>Kelurahan Kebonjati &bull; Kecamatan Andir, Kota Bandung</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Selamat Datang, {user?.nama || 'Warga'}!
          </h1>
          <p className="text-sm text-blue-100 max-w-xl leading-relaxed">
            Portal Warga Mandiri untuk pengurusan dokumen administrasi, pemantauan kesehatan keluarga di Posyandu, dan jaring pengaman sosial.
          </p>
        </div>
      </div>

      {/* QUICK STATUS CARDS FOR CITIZEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KK Digital Card */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-3">
          <div className="flex items-center justify-between text-primary">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface-variant">Kartu Keluarga</span>
          </div>
          <div>
            <div className="font-mono font-bold text-lg text-on-surface">
              {kk?.no_kk || user?.username || 'No KK Digital'}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Kepala Keluarga: <strong className="text-on-surface">{kk?.kepala_keluarga || user?.nama || '-'}</strong>
            </p>
          </div>
          <Link
            to="/dashboard/kk"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2 border-t border-outline-variant w-full"
          >
            <span>Buka KK Digital</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Permohonan Surat Terakhir */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-3">
          <div className="flex items-center justify-between text-indigo-600">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <FileText size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface-variant">Surat Terakhir</span>
          </div>
          <div>
            <div className="font-bold text-sm text-on-surface truncate">
              {latestDoc ? (latestDoc.jenis_dokumen || latestDoc.jenis_surat) : 'Belum Ada Permohonan'}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Status: <strong className={latestDoc?.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}>
                {latestDoc?.status === 'APPROVED' ? 'Disahkan Kelurahan' : latestDoc?.approval_step ? `Verifikasi ${latestDoc.approval_step}` : '-'}
              </strong>
            </p>
          </div>
          <Link
            to="/dashboard/dokumen"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2 border-t border-outline-variant w-full"
          >
            <span>Lihat Semua Permohonan</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Posyandu & Kesehatan */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-3">
          <div className="flex items-center justify-between text-rose-600">
            <div className="p-2 bg-rose-100 rounded-xl">
              <HeartPulse size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface-variant">Posyandu Siklus Hidup</span>
          </div>
          <div>
            <div className="font-bold text-sm text-on-surface">
              Balita & Lansia Keluarga
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Tercatat {citizenStats.posyandu.length} riwayat pemeriksaan posyandu.
            </p>
          </div>
          <Link
            to="/dashboard/posyandu"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-2 border-t border-outline-variant w-full"
          >
            <span>Periksa Rekam Medis</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* QUICK ACTIONS FOR CITIZEN */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm space-y-4">
        <h3 className="font-bold text-base text-on-surface">Layanan Administrasi Mandiri Cepat</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            to="/dashboard/dokumen"
            className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-center flex flex-col items-center gap-2 border border-outline-variant/60"
          >
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <FileText size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface">Ajukan Surat</span>
          </Link>
          <Link
            to="/dashboard/kk"
            className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-center flex flex-col items-center gap-2 border border-outline-variant/60"
          >
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <Users size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface">KK Digital</span>
          </Link>
          <Link
            to="/dashboard/posyandu"
            className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-center flex flex-col items-center gap-2 border border-outline-variant/60"
          >
            <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl">
              <Baby size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface">Cek Posyandu</span>
          </Link>
          <Link
            to="/dashboard/pengaduan"
            className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-center flex flex-col items-center gap-2 border border-outline-variant/60"
          >
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <AlertCircle size={20} />
            </div>
            <span className="text-xs font-bold text-on-surface">Lapor Masalah</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
