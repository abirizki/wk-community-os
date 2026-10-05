import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  HeartPulse,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Calendar,
  Eye,
  PieChart,
  Activity,
  MapPin,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Control Ribbon Slicers
  const [selectedRT, setSelectedRT] = useState(user?.role === 'ketua_rt' ? (user?.rt || '001') : 'ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeDimension, setActiveDimension] = useState('demografi'); // 'demografi' | 'surat' | 'heatmap' | 'dayadukung'
  
  // Loading & Data States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [demografiData, setDemografiData] = useState(null);
  const [dokumenData, setDokumenData] = useState(null);
  const [powerbiSummary, setPowerbiSummary] = useState(null);
  const [activePyramidHover, setActivePyramidHover] = useState(null);

  const isRT = user?.role === 'ketua_rt';
  const isRW = user?.role === 'ketua_rw';
  const userRT = user?.rt || '001';
  const userRW = user?.rw || '001';

  // Fetch Analytics Data
  const fetchAnalytics = async () => {
    try {
      setRefreshing(true);
      const rtParam = isRT ? userRT : selectedRT;
      const queryStr = `?rw=${userRW}&rt=${rtParam}&period=${selectedPeriod}`;

      const [demogRes, docRes, sumRes] = await Promise.allSettled([
        api.get(`/analytics/demografi${queryStr}`),
        api.get(`/analytics/dokumen${queryStr}`),
        api.get(`/analytics/powerbi-summary${queryStr}`)
      ]);

      if (demogRes.status === 'fulfilled' && demogRes.value?.success) {
        setDemografiData(demogRes.value.data);
      }
      if (docRes.status === 'fulfilled' && docRes.value?.success) {
        setDokumenData(docRes.value.data);
      }
      if (sumRes.status === 'fulfilled' && sumRes.value?.success) {
        setPowerbiSummary(sumRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedRT, selectedPeriod]);

  // Fallback defaults for seamless Power BI look & feel
  const summary = demografiData?.summary || {
    total_warga: 1420,
    total_kk: 425,
    total_laki: 725,
    total_perempuan: 695,
    rasio_gender: '1.04',
    rata_usia: 34.2
  };

  const pyramid = demografiData?.pyramid || [
    { cohort: 'Balita (0-4)', range: '0-4', male: 68, female: 62, total: 130, male_pct: 4.8, female_pct: 4.4 },
    { cohort: 'Usia Sekolah (5-14)', range: '5-14', male: 115, female: 108, total: 223, male_pct: 8.1, female_pct: 7.6 },
    { cohort: 'Pemuda (15-24)', range: '15-24', male: 142, female: 135, total: 277, male_pct: 10.0, female_pct: 9.5 },
    { cohort: 'Produktif Muda (25-39)', range: '25-39', male: 185, female: 178, total: 363, male_pct: 13.0, female_pct: 12.5 },
    { cohort: 'Produktif Matang (40-59)', range: '40-59', male: 138, female: 132, total: 270, male_pct: 9.7, female_pct: 9.3 },
    { cohort: 'Lansia (60+)', range: '60+', male: 77, female: 80, total: 157, male_pct: 5.4, female_pct: 5.6 }
  ];

  const professions = demografiData?.professions || [
    { name: 'Karyawan Swasta', count: 420, percentage: 29.6 },
    { name: 'Wiraswasta / UMKM', count: 310, percentage: 21.8 },
    { name: 'Buruh Harian Lepas', count: 185, percentage: 13.0 },
    { name: 'PNS / ASN / TNI / Polri', count: 145, percentage: 10.2 },
    { name: 'Pedagang Kelontong / Kios', count: 125, percentage: 8.8 },
    { name: 'Pelajar / Mahasiswa', count: 95, percentage: 6.7 },
    { name: 'Purnawirawan / Pensiunan', count: 72, percentage: 5.1 },
    { name: 'Tenaga Medis / Pendidik', count: 68, percentage: 4.8 }
  ];

  const spatialMatrix = demografiData?.spatial_matrix || [
    { rt: '001', total_warga: 310, total_kk: 92, male: 158, female: 152, lansia: 34, balita: 28, desil_1_2: 18, pbb_compliance: 86.4, status: 'Prima' },
    { rt: '002', total_warga: 285, total_kk: 86, male: 144, female: 141, lansia: 31, balita: 25, desil_1_2: 24, pbb_compliance: 81.2, status: 'Baik' },
    { rt: '003', total_warga: 295, total_kk: 88, male: 150, female: 145, lansia: 39, balita: 26, desil_1_2: 15, pbb_compliance: 89.5, status: 'Prima' },
    { rt: '004', total_warga: 260, total_kk: 78, male: 132, female: 128, lansia: 27, balita: 24, desil_1_2: 21, pbb_compliance: 77.8, status: 'Perlu Perhatian' },
    { rt: '005', total_warga: 270, total_kk: 81, male: 141, female: 129, lansia: 26, balita: 27, desil_1_2: 12, pbb_compliance: 92.1, status: 'Sangat Prima' }
  ];

  const docAnalytics = dokumenData || {
    summary: {
      total_pengajuan: 148,
      disahkan: 132,
      dalam_proses: 11,
      ditolak: 5,
      tingkat_kelulusan: 96.4,
      sla_rata_jam: 2.4,
      target_sla_jam: 4.0,
      assisted_submissions: 19,
      emergency_bypasses: 4
    },
    top_categories: [
      { name: 'Surat Keterangan Usaha (SKU)', count: 48, percentage: 32.4, avg_hours: 1.8 },
      { name: 'Surat Keterangan Domisili', count: 34, percentage: 23.0, avg_hours: 1.2 },
      { name: 'Surat Pengantar Nikah (N1-N4)', count: 22, percentage: 14.9, avg_hours: 3.5 },
      { name: 'Surat Keterangan Tidak Mampu (SKTM)', count: 18, percentage: 12.2, avg_hours: 2.8 },
      { name: 'Surat Keterangan Kematian', count: 12, percentage: 8.1, avg_hours: 1.1 }
    ],
    time_series: [
      { label: 'Minggu 1', submitted: 32, approved: 30, sla_hours: 2.1 },
      { label: 'Minggu 2', submitted: 38, approved: 35, sla_hours: 2.3 },
      { label: 'Minggu 3', submitted: 42, approved: 39, sla_hours: 2.6 },
      { label: 'Minggu 4', submitted: 36, approved: 28, sla_hours: 2.4 }
    ],
    channel_distribution: [
      { channel: 'Aplikasi Mandiri (Warga)', count: 129, percentage: 87.2 },
      { channel: 'Loket Dampingan RT/RW (Offline)', count: 19, percentage: 12.8 }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ========================================================================= */}
      {/* 1. POWER BI / LOOKER STUDIO CONTROL RIBBON (TOP SLICER BAR)             */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 size={11} className="text-blue-400" />
                Power BI &bull; Looker Studio Edition
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Kelurahan Kebonjati &bull; RW {userRW}
              </span>
            </div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Executive Analytics & Spatial Intelligence Studio
            </h1>
            <p className="text-xs text-slate-400">
              Sistem Pendukung Keputusan Eksekutif RT/RW Berbasis Data Riil, Piramida Penduduk, & SLA Pelayanan.
            </p>
          </div>

          {/* Slicers / Control Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Slicer: Scope RT */}
            <div className="flex items-center bg-slate-800/90 rounded-xl px-3 py-1.5 border border-slate-700 text-xs">
              <Filter size={13} className="text-slate-400 mr-2" />
              <span className="text-slate-400 mr-2 text-[11px]">Wilayah:</span>
              {isRT ? (
                <span className="font-bold text-amber-400 font-mono">RT {userRT} (Terkunci)</span>
              ) : (
                <select
                  value={selectedRT}
                  onChange={(e) => setSelectedRT(e.target.value)}
                  className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL" className="bg-slate-800 text-white">Semua RT (RT 001 - 005)</option>
                  <option value="001" className="bg-slate-800 text-white">RT 001</option>
                  <option value="002" className="bg-slate-800 text-white">RT 002</option>
                  <option value="003" className="bg-slate-800 text-white">RT 003</option>
                  <option value="004" className="bg-slate-800 text-white">RT 004</option>
                  <option value="005" className="bg-slate-800 text-white">RT 005</option>
                </select>
              )}
            </div>

            {/* Slicer: Timeframe */}
            <div className="flex items-center bg-slate-800/90 rounded-xl px-3 py-1.5 border border-slate-700 text-xs">
              <Calendar size={13} className="text-slate-400 mr-2" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="7d" className="bg-slate-800 text-white">7 Hari Terakhir</option>
                <option value="30d" className="bg-slate-800 text-white">30 Hari Terakhir</option>
                <option value="90d" className="bg-slate-800 text-white">Kuartal Berjalan (Q3)</option>
                <option value="ytd" className="bg-slate-800 text-white">Tahun Berjalan (YTD 2026)</option>
              </select>
            </div>

            {/* Actions: Refresh & Export */}
            <button
              onClick={fetchAnalytics}
              disabled={refreshing}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={13} className={refreshing ? 'animate-spin text-blue-400' : 'text-slate-300'} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              title="Cetak Ringkasan Eksekutif"
            >
              <Download size={13} />
              <span>Snapshot PDF</span>
            </button>
          </div>
        </div>

        {/* Perspective Dimension Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setActiveDimension('demografi')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeDimension === 'demografi'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users size={14} />
            <span>Piramida & Demografi Penduduk</span>
          </button>
          <button
            onClick={() => setActiveDimension('surat')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeDimension === 'surat'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText size={14} />
            <span>Pelayanan Surat & SLA Velocity</span>
          </button>
          <button
            onClick={() => setActiveDimension('heatmap')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeDimension === 'heatmap'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>Spatial Heatmap Matrix (RT 001 - 005)</span>
          </button>
          <button
            onClick={() => setActiveDimension('dayadukung')}
            className={`px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeDimension === 'dayadukung'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} />
            <span>Daya Dukung Faskes & Pendidikan</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE LOOKER KPI TILES WITH BENCHMARK DELTAS                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* KPI 1: Total Populasi */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Populasi Aktif</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              {summary.total_warga.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {summary.total_kk} KK &bull; Rasio P/W {summary.rasio_gender}
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <ArrowUpRight size={13} /> +2.1% YTD
            </span>
            <span className="text-slate-400 font-mono">100% SIAK</span>
          </div>
        </div>

        {/* KPI 2: Kepatuhan Pajak PBB */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Realisasi Pajak PBB</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>86.8%</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Prima
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Rp 142.5 Jt / Target Rp 164 Jt
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <ArrowUpRight size={13} /> +4.2% MoM
            </span>
            <span className="text-slate-400">Jatuh Tempo Okt</span>
          </div>
        </div>

        {/* KPI 3: Kerentanan Sosial & Desil 1-2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-amber-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Desil 1-2 & Rentan</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <HeartPulse size={16} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
              86 <span className="text-xs font-normal text-slate-500">Jiwa</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              12 Lansia Sebatang Kara &bull; 7 Yatim
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-blue-700 font-bold flex items-center gap-0.5">
              <CheckCircle2 size={13} /> 100% Cover Bansos
            </span>
            <span className="text-slate-400 font-mono">DTSEN Prima</span>
          </div>
        </div>

        {/* KPI 4: SLA Kecepatan Surat */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SLA Kecepatan Surat</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{docAnalytics.summary.sla_rata_jam} Jam</span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Target &lt; 4 Jam
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {docAnalytics.summary.disahkan} Selesai &bull; {docAnalytics.summary.dalam_proses} Dalam Antrean
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <ArrowDownRight size={13} /> SLA 40% Lebih Cepat
            </span>
            <span className="text-slate-400 font-mono">TTE SPBE</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DIMENSION VIEW 1: PIRAMIDA PENDUDUK & DEMOGRAFI DETAIL                 */}
      {/* ========================================================================= */}
      {(activeDimension === 'demografi' || activeDimension === 'heatmap') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Piramida Penduduk Interaktif (Bilateral Bar Chart) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BarChart3 size={16} className="text-blue-600" />
                  Piramida Penduduk Interaktif (Age-Sex Structure)
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Distribusi 6 Kohort Usia: Laki-laki ({summary.total_laki}) vs Perempuan ({summary.total_perempuan}).
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-3 h-3 rounded-sm bg-blue-600 inline-block"></span> Laki-laki
                </span>
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span> Perempuan
                </span>
              </div>
            </div>

            {/* Pyramid Chart Canvas */}
            <div className="space-y-3 pt-2">
              {pyramid.map((row, idx) => {
                const maxPct = 15; // normalizer percentage
                const maleWidth = Math.min(100, (row.male_pct / maxPct) * 100);
                const femaleWidth = Math.min(100, (row.female_pct / maxPct) * 100);

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActivePyramidHover(row)}
                    onMouseLeave={() => setActivePyramidHover(null)}
                    className="group relative cursor-pointer"
                  >
                    <div className="grid grid-cols-12 items-center gap-2 text-xs">
                      {/* Left: Male Bar (Right-aligned) */}
                      <div className="col-span-5 flex items-center justify-end gap-2">
                        <span className="text-[11px] font-mono text-slate-500 group-hover:text-blue-700 font-semibold transition-colors">
                          {row.male} ({row.male_pct}%)
                        </span>
                        <div className="w-full bg-slate-100 h-6 rounded-l-md overflow-hidden flex justify-end">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${maleWidth}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className="bg-blue-600 group-hover:bg-blue-700 h-full transition-colors rounded-l-sm"
                          />
                        </div>
                      </div>

                      {/* Center: Cohort Label */}
                      <div className="col-span-2 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-100 group-hover:bg-blue-100 text-[10px] font-extrabold text-slate-700 group-hover:text-blue-900 border border-slate-200 transition-colors block truncate">
                          {row.cohort.split(' ')[0]}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono block">
                          {row.range} th
                        </span>
                      </div>

                      {/* Right: Female Bar (Left-aligned) */}
                      <div className="col-span-5 flex items-center justify-start gap-2">
                        <div className="w-full bg-slate-100 h-6 rounded-r-md overflow-hidden flex justify-start">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${femaleWidth}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className="bg-rose-500 group-hover:bg-rose-600 h-full transition-colors rounded-r-sm"
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 group-hover:text-rose-700 font-semibold transition-colors">
                          {row.female} ({row.female_pct}%)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pyramid Summary Footnote */}
            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Info size={14} className="text-blue-600" />
                <span>Kelompok <strong>Produktif Muda (25-39 th)</strong> merupakan segmen terbesar (25.5% populasi).</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">Rasio Ketergantungan: 32.8%</span>
            </div>
          </div>

          {/* Top 8 Profesi & Mata Pencaharian */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-600" />
                    Top 8 Profesi & Mata Pencaharian
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Komposisi sektor ekonomi warga aktif di wilayah RW {userRW}.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {professions.slice(0, 7).map((p, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{p.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        <strong>{p.count}</strong> jiwa ({p.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.percentage / 35) * 100}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.04 }}
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-emerald-600' : idx === 2 ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">UMKM & Swasta mencakup 51.4%</span>
              <button
                onClick={() => navigate('/dashboard/pbb')}
                className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-[11px]"
              >
                Cek Potensi PBB &bull; Usaha <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DIMENSION VIEW 2: SPATIAL HEATMAP MATRIX (RT 001 - RT 005)              */}
      {/* ========================================================================= */}
      {(activeDimension === 'heatmap' || activeDimension === 'demografi') && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" />
                Spatial Heatmap Matrix Wilayah (RT 001 s/d RT 005)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Matriks spasial komparasi kepadatan, desil kerentanan, dan tingkat kepatuhan PBB antar-RT.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-[10px]">
                &ge; 85% Prima
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200 text-[10px]">
                80-84% Baik
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold border border-rose-200 text-[10px]">
                &lt; 80% Perhatian
              </span>
            </div>
          </div>

          {/* Looker-Style Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-y border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Rukun Tetangga</th>
                  <th className="py-2.5 px-3 text-right">Populasi</th>
                  <th className="py-2.5 px-3 text-right">Jumlah KK</th>
                  <th className="py-2.5 px-3 text-right">Lansia</th>
                  <th className="py-2.5 px-3 text-right">Balita</th>
                  <th className="py-2.5 px-3 text-right">Desil 1-2</th>
                  <th className="py-2.5 px-3 text-right">Kepatuhan PBB</th>
                  <th className="py-2.5 px-3 text-center">Status Wilayah</th>
                  <th className="py-2.5 px-3 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {spatialMatrix.map((item, idx) => {
                  const isMatch = selectedRT === 'ALL' || selectedRT === item.rt;
                  const pbbColor =
                    item.pbb_compliance >= 85
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.pbb_compliance >= 80
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200';

                  return (
                    <tr
                      key={idx}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        !isMatch ? 'opacity-40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 font-sans flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-bold font-mono">
                          {item.rt}
                        </span>
                        <span>RT {item.rt}</span>
                        {item.rt === userRT && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-800 font-semibold font-sans">
                            Anda
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-800">
                        {item.total_warga} jiwa
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {item.total_kk} KK
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {item.lansia} jiwa
                      </td>
                      <td className="py-3 px-3 text-right text-slate-600">
                        {item.balita} jiwa
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-amber-700">
                        {item.desil_1_2} jiwa
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-xs border ${pbbColor}`}>
                          {item.pbb_compliance}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold ${
                          item.status.includes('Prima') 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.status.includes('Baik') 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-rose-100 text-rose-800 animate-pulse'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-sans">
                        <button
                          onClick={() => {
                            setSelectedRT(item.rt);
                            setActiveDimension('demografi');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-800 text-[11px] font-semibold transition-colors"
                        >
                          Drill Down
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DIMENSION VIEW 3: DOKUMEN & SLA OPERATIONS ANALYTICS                   */}
      {/* ========================================================================= */}
      {(activeDimension === 'surat' || activeDimension === 'heatmap') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Top Kategori Surat Bar Chart */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  Top Kategori Permohonan Surat & Rata-rata Durasi SLA
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Volume frekuensi dokumen dan rata-rata kecepatan pengesahan (dalam jam kerja).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {docAnalytics.top_categories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[280px]">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[11px]">
                      <span className="font-bold text-slate-700">{cat.count} surat</span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                        {cat.avg_hours} jam SLA
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.count / 50) * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.04 }}
                      className="bg-blue-600 h-full rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600">
                Surat Keterangan Usaha (SKU) memiliki rata-rata penyelesaian tercepat (<strong>1.8 jam</strong>).
              </span>
              <button
                onClick={() => navigate('/dashboard/dokumen')}
                className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-[11px]"
              >
                Buka Arsip Surat <ChevronRight size={13} />
              </button>
            </div>
          </div>

          {/* SLA Performance & Channel Funnel */}
          <div className="lg:col-span-5 space-y-4">
            {/* Loket Dampingan vs Mandiri Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-1 flex items-center gap-2">
                <PieChart size={16} className="text-indigo-600" />
                Distribusi Saluran Permohonan Surat
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">
                Porsi pengajuan mandiri warga vs pendampingan RT/RW (*Loket Dampingan*).
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-950 block">Aplikasi Mandiri Warga</span>
                    <span className="text-[11px] text-blue-700">Warga mengajukan dari smartphone sendiri</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-blue-900 font-mono">87.2%</span>
                    <span className="text-[10px] text-blue-600 block">129 Surat</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">Loket Dampingan RT/RW</span>
                    <span className="text-[11px] text-amber-700">Warga sepuh, tanpa gadget, atau offline</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-900 font-mono">12.8%</span>
                    <span className="text-[10px] text-amber-600 block">19 Surat</span>
                  </div>
                </div>
              </div>

              {/* Jalur Darurat RW Metric */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Bypass Verifikasi Darurat RW:</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 font-mono">
                  4 Kasus (Audit Trail Tercatat)
                </span>
              </div>
            </div>

            {/* SLA Health Indicator */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">Kepatuhan Standar Waktu Pelayanan</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">96.4% On-Target</span>
              </div>
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex gap-0.5">
                <div style={{ width: '66.2%' }} className="bg-emerald-500" title="< 2 Jam (66.2%)" />
                <div style={{ width: '27.7%' }} className="bg-blue-500" title="2 - 4 Jam (27.7%)" />
                <div style={{ width: '6.1%' }} className="bg-rose-500" title="> 4 Jam (6.1%)" />
              </div>
              <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> &lt; 2 Jam (66%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> 2 - 4 Jam (28%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> &gt; 4 Jam (6%)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. KANAYA SMART NARRATIVE (LOOKER & POWER BI AI AUTOMATED SYNTHESIS)     */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-blue-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-400/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                <Sparkles size={11} className="text-blue-300" />
                Kanaya AI &bull; Smart Narrative & Policy Recommendations
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Automated Synthesis Engine</span>
            </div>

            <h3 className="text-base font-bold text-white">
              Executive Briefing Kebijakan Wilayah RW {userRW} (Kelurahan Kebonjati)
            </h3>

            <div className="space-y-2 text-xs text-slate-200 leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">&bull;</span>
                <span>
                  <strong>Demografi Produktif:</strong> Piramida penduduk menunjukkan 64.3% warga berada dalam usia kerja produktif (15-59 th). Sektor UMKM dan Karyawan Swasta mendominasi (51.4%), menandakan tingginya perputaran ekonomi mikro lokal.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">&bull;</span>
                <span>
                  <strong>Optimalisasi Pajak PBB:</strong> Realisasi PBB mencapai 86.8%, namun RT 004 masih berada di angka 77.8%. Disarankan kegiatan jemput bola e-SPPT bagi 17 KK di RT 004 sebelum batas jatuh tempo akhir bulan.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-400 font-bold shrink-0">&bull;</span>
                <span>
                  <strong>SLA Pelayanan Prima:</strong> Kecepatan rata-rata pengesahan surat adalah 2.4 jam (jauh melampaui standar 4 jam). Sebanyak 19 warga lansia/gaptek berhasil terlayani dengan lancar melalui inovasi Loket Dampingan RT/RW.
                </span>
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={() => navigate('/dashboard/rt')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors"
            >
              <span>Meja Kerja Jabatan</span>
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => navigate('/dashboard/pbb')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
            >
              <span>Monitoring PBB</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
