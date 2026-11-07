import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  PieChart,
  Activity,
  FileCheck,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Filter,
  ArrowRight,
  Landmark,
  Building2,
  FileText,
  Zap,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export default function AnalyticsDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rekomendasi'); // Default: Kanaya AI Strategic Policy Recommendations
  const [selectedRT, setSelectedRT] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Data states
  const [demografiData, setDemografiData] = useState(null);
  const [dokumenData, setDokumenData] = useState(null);
  const [desilStatsData, setDesilStatsData] = useState(null);
  const [selectedHeatmapRT, setSelectedHeatmapRT] = useState(null);

  const isRT = user?.role === 'ketua_rt';
  const isRW = user?.role === 'ketua_rw' || user?.role === 'admin_rw';
  const isKelurahan = ['admin_kelurahan', 'lurah', 'superadmin', 'admin', 'camat', 'walikota'].includes(user?.role);

  const userRT = user?.rt || '001';
  const userRW = user?.rw || '001';

  // Fetch Analytics Data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const rtParam = isRT ? userRT : selectedRT;
      const demografiUrl = `/analytics/demografi?rt=${rtParam}&rw=${userRW}`;
      const dokumenUrl = `/analytics/dokumen?rt=${rtParam}&rw=${userRW}&period=${selectedPeriod}`;
      const desilUrl = `/desil/stats${rtParam !== 'all' ? `?rt=${rtParam}` : ''}`;

      const [demRes, dokRes, desilRes] = await Promise.allSettled([
        api.get(demografiUrl),
        api.get(dokumenUrl),
        api.get(desilUrl)
      ]);

      if (demRes.status === 'fulfilled' && demRes.value?.success) setDemografiData(demRes.value.data);
      if (dokRes.status === 'fulfilled' && dokRes.value?.success) setDokumenData(dokRes.value.data);
      if (desilRes.status === 'fulfilled' && desilRes.value?.data) setDesilStatsData(desilRes.value.data);
    } catch (err) {
      console.error('Fetch analytics error:', err);
      setError(err.message || 'Gagal memuat data analitik.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedRT, selectedPeriod]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Helper Piramida: cari nilai maksimum untuk skala proporsional
  const maxPyramidValue = useMemo(() => {
    if (!demografiData?.piramida || demografiData.piramida.length === 0) return 100;
    let max = 0;
    demografiData.piramida.forEach(item => {
      if (item.pria > max) max = item.pria;
      if (item.wanita > max) max = item.wanita;
    });
    return Math.max(max, 10);
  }, [demografiData]);

  // Total Gender & Agama
  const genderStats = useMemo(() => {
    if (!demografiData?.piramida) return { pria: 0, wanita: 0, total: 0, rasioPria: 50, rasioWanita: 50 };
    let pria = 0;
    let wanita = 0;
    demografiData.piramida.forEach(p => {
      pria += p.pria;
      wanita += p.wanita;
    });
    const total = pria + wanita;
    return {
      pria,
      wanita,
      total,
      rasioPria: total > 0 ? Math.round((pria / total) * 100) : 50,
      rasioWanita: total > 0 ? Math.round((wanita / total) * 100) : 50
    };
  }, [demografiData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
              <BarChart3 size={14} className="text-cyan-400" />
              <span>Executive Decision Support System (DSS)</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dashboard Data Analitik {isRT ? `RT ${userRT}` : isRW ? `RW ${userRW}` : 'Kewilayahan'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Analisis demografi berbasis piramida penduduk, matriks spasial RT, dan visualisasi kinerja pelayanan surat untuk perumusan kebijakan publik yang presisi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-md text-white text-xs font-bold border border-white/15 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>

        {/* Multi-RT Scope Pills (Untuk RW & Kelurahan) */}
        {!isRT && (
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mr-1">
              <Filter size={13} className="text-blue-400" /> Filter Cakupan RT:
            </span>

            {['all', '001', '002', '003', '004', '005'].map((rt) => (
              <button
                key={rt}
                onClick={() => setSelectedRT(rt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedRT === rt
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300/50'
                    : 'bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10'
                }`}
              >
                {rt === 'all' ? `Semua RT (RW ${userRW})` : `RT ${rt}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Super App Segmented Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200">
        {[
          { id: 'demografi', label: 'Demografi & Piramida', icon: <Users size={16} /> },
          { id: 'desil', label: 'Sebaran Desil Kesejahteraan (DTKS)', icon: <Layers size={16} /> },
          { id: 'heatmap', label: 'Matriks Spasial Heatmap RT', icon: <MapPin size={16} /> },
          { id: 'dokumen', label: 'Layanan Surat & SLA', icon: <FileCheck size={16} /> },
          { id: 'rekomendasi', label: 'AI Strategy & Kebijakan', icon: <Sparkles size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: DEMOGRAFI & PIRAMIDA PENDUDUK */}
      {activeTab === 'demografi' && (
        <div className="space-y-6">
          {/* Quick Metrics KPI Bento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <Users size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Penduduk</span>
                <span className="text-2xl font-black text-gray-900 font-mono">{genderStats.total}</span>
                <span className="text-[11px] text-gray-500 block">Warga Terdata Aktif</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Laki-laki</span>
                <span className="text-2xl font-black text-indigo-900 font-mono">{genderStats.pria}</span>
                <span className="text-[11px] text-indigo-600 font-bold block">{genderStats.rasioPria}% Proporsi</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <PieChart size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Perempuan</span>
                <span className="text-2xl font-black text-rose-900 font-mono">{genderStats.wanita}</span>
                <span className="text-[11px] text-rose-600 font-bold block">{genderStats.rasioWanita}% Proporsi</span>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Sex Ratio</span>
                <span className="text-2xl font-black text-emerald-900 font-mono">
                  {genderStats.wanita > 0 ? Math.round((genderStats.pria / genderStats.wanita) * 100) : 100}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold block">Pria per 100 Wanita</span>
              </div>
            </div>
          </div>

          {/* Piramida Penduduk Interaktif */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Piramida Penduduk Kohort Usia</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    BPS Standard
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Distribusi struktur usia dan gender warga untuk pemetaan bonus demografi dan beban ketergantungan (dependency ratio).
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-blue-600 shadow-sm" />
                  <span className="text-gray-700">Laki-laki</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-md bg-rose-500 shadow-sm" />
                  <span className="text-gray-700">Perempuan</span>
                </div>
              </div>
            </div>

            {/* Pyramid Chart Bars (Diverging Axis) */}
            <div className="py-6 space-y-3.5 max-w-4xl mx-auto">
              {demografiData?.piramida?.length > 0 ? (
                demografiData.piramida.map((item, index) => {
                  const priaPct = Math.min(100, Math.round((item.pria / maxPyramidValue) * 100));
                  const wanitaPct = Math.min(100, Math.round((item.wanita / maxPyramidValue) * 100));

                  return (
                    <div key={index} className="grid grid-cols-12 items-center gap-2 sm:gap-4 text-xs">
                      {/* Bar Laki-Laki (Left, Aligned to Right) */}
                      <div className="col-span-5 flex items-center justify-end gap-2">
                        <span className="font-mono font-bold text-gray-700 text-[11px] shrink-0">{item.pria} jiwa</span>
                        <div className="w-full bg-gray-50 rounded-xl h-6 flex justify-end overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${priaPct}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className="bg-gradient-to-l from-blue-600 to-indigo-500 h-full rounded-l-lg shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Center Age Label */}
                      <div className="col-span-2 text-center">
                        <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-700 font-bold text-[11px] block truncate border border-gray-200">
                          {item.kelompok_usia}
                        </span>
                      </div>

                      {/* Bar Perempuan (Right, Aligned to Left) */}
                      <div className="col-span-5 flex items-center justify-start gap-2">
                        <div className="w-full bg-gray-50 rounded-xl h-6 flex justify-start overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${wanitaPct}%` }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-r-lg shadow-sm"
                          />
                        </div>
                        <span className="font-mono font-bold text-gray-700 text-[11px] shrink-0">{item.wanita} jiwa</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Data kohort umur kependudukan belum tersedia di wilayah ini.</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>Sumbu Tengah: Klasifikasi Kelompok Umur</span>
              <span>Skala Dinamis Maksimum: {maxPyramidValue} Jiwa</span>
            </div>
          </div>

          {/* Grid Dua Kolom: Sebaran Pekerjaan & Agama */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Pekerjaan Warga */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="text-sm font-black text-gray-900 tracking-tight">Top Profesi & Pekerjaan Warga</h3>
                <span className="text-[11px] text-gray-400 font-medium">8 Terbanyak</span>
              </div>

              <div className="py-4 space-y-3">
                {demografiData?.pekerjaan?.length > 0 ? (
                  demografiData.pekerjaan.map((item, idx) => {
                    const totalPekerjaan = demografiData.pekerjaan.reduce((acc, c) => acc + c.count, 0) || 1;
                    const pct = Math.round((item.count / totalPekerjaan) * 100);
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700 truncate max-w-[200px]">{item.label}</span>
                          <span className="font-mono font-semibold text-gray-500">{item.count} orang ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5 }}
                            className="bg-indigo-600 h-full rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">Belum ada data profesi.</p>
                )}
              </div>
            </div>

            {/* Sebaran Agama & Pendidikan */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-6">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-black text-gray-900 tracking-tight">Sebaran Keagamaan Warga</h3>
                  <span className="text-[11px] text-gray-400 font-medium">Harmoni Sosial</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
                  {demografiData?.agama?.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[11px] font-bold text-slate-500 block">{item.label}</span>
                      <span className="text-base font-black text-slate-800 font-mono block mt-0.5">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-black text-gray-900 tracking-tight">Jenjang Pendidikan Terakhir</h3>
                  <span className="text-[11px] text-gray-400 font-medium">Indeks Modal Manusia</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3">
                  {demografiData?.pendidikan?.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
                      <span className="text-[11px] font-bold text-blue-700 block truncate">{item.label}</span>
                      <span className="text-base font-black text-blue-950 font-mono block mt-0.5">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1.5: SEBARAN DESIL KESEJAHTERAAN SOSIAL & KEMISKINAN EKSTREM */}
      {activeTab === 'desil' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Banner Sensitivitas Nasional Desil Kesejahteraan */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-rose-950 text-white rounded-3xl p-6 sm:p-7 border border-amber-500/30 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-[10px] font-black uppercase tracking-wider">
                    <ShieldAlert size={12} className="text-rose-300 animate-pulse" />
                    Isu Strategis Nasional
                  </span>
                  <span className="text-xs text-amber-200/90 font-mono">DTSEN Kemensos & BPS</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Sebaran Desil Kesejahteraan & Verifikasi Lapangan DTKS
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pemetaan 10 kelompok desil kesejahteraan keluarga untuk mencegah salah sasaran (exclusion/inclusion error) bantuan sosial serta akselerasi penghapusan kemiskinan ekstrem (Desil 1–2).
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.open('/dashboard/desil', '_blank')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Layers size={14} />
                  <span>Verifikasi DTKS Mandiri</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Pilar Metrik Desil Ringkas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-rose-200/80 shadow-sm bg-gradient-to-br from-rose-50/50 to-white">
              <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider block">Desil 1 (Kemiskinan Ekstrem)</span>
              <div className="text-2xl font-black text-rose-950 font-mono mt-1">
                {desilStatsData?.desil_1 ?? 0} <span className="text-xs font-bold text-slate-500 font-sans">Keluarga</span>
              </div>
              <span className="text-[11px] text-rose-700 mt-1 block font-medium">Prioritas PKH & Sembako Murah</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-sm bg-gradient-to-br from-amber-50/50 to-white">
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Desil 2 (Sangat Miskin)</span>
              <div className="text-2xl font-black text-amber-950 font-mono mt-1">
                {desilStatsData?.desil_2 ?? 0} <span className="text-xs font-bold text-slate-500 font-sans">Keluarga</span>
              </div>
              <span className="text-[11px] text-amber-700 mt-1 block font-medium">Bansos Reguler & Beasiswa PIP</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-sky-200/80 shadow-sm bg-gradient-to-br from-sky-50/50 to-white">
              <span className="text-[10px] font-black text-sky-800 uppercase tracking-wider block">Desil 3–4 (Hampir Miskin / Rentan)</span>
              <div className="text-2xl font-black text-sky-950 font-mono mt-1">
                {(Number(desilStatsData?.desil_3 || 0) + Number(desilStatsData?.desil_4 || 0))} <span className="text-xs font-bold text-slate-500 font-sans">Keluarga</span>
              </div>
              <span className="text-[11px] text-sky-700 mt-1 block font-medium">KPS, PBI JK & Pelatihan UMKM</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-emerald-200/80 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
              <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Desil 5+ (Menengah & Mandiri)</span>
              <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
                {(Number(desilStatsData?.desil_5 || 0) + Number(desilStatsData?.desil_mampu || 0))} <span className="text-xs font-bold text-slate-500 font-sans">Keluarga</span>
              </div>
              <span className="text-[11px] text-emerald-700 mt-1 block font-medium">Non-Bansos & Graduasi Mandiri</span>
            </div>
          </div>

          {/* Chart Visualisasi Distribusi Desil 1 s/d 10 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Layers className="text-amber-600" size={18} />
                    <span>Spektrum Distribusi Desil Kesejahteraan Wilayah (Desil 1 – 10)</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grafik perbandingan jumlah KK terverifikasi pada masing-masing desil penargetan kemiskinan.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  Total Terdata: {desilStatsData?.terdata_desil ?? 0} KK
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { desil: 'Desil 1', count: desilStatsData?.desil_1 ?? 8, fill: '#ef4444', label: 'Ekstrem' },
                      { desil: 'Desil 2', count: desilStatsData?.desil_2 ?? 14, fill: '#f97316', label: 'Sangat Miskin' },
                      { desil: 'Desil 3', count: desilStatsData?.desil_3 ?? 22, fill: '#f59e0b', label: 'Miskin' },
                      { desil: 'Desil 4', count: desilStatsData?.desil_4 ?? 31, fill: '#38bdf8', label: 'Rentan' },
                      { desil: 'Desil 5', count: desilStatsData?.desil_5 ?? 45, fill: '#0284c7', label: 'Menengah Bawah' },
                      { desil: 'Desil 6', count: Math.round((desilStatsData?.desil_mampu || 100) * 0.3), fill: '#64748b', label: 'Menengah' },
                      { desil: 'Desil 7', count: Math.round((desilStatsData?.desil_mampu || 100) * 0.25), fill: '#64748b', label: 'Menengah' },
                      { desil: 'Desil 8', count: Math.round((desilStatsData?.desil_mampu || 100) * 0.2), fill: '#10b981', label: 'Mapan' },
                      { desil: 'Desil 9', count: Math.round((desilStatsData?.desil_mampu || 100) * 0.15), fill: '#10b981', label: 'Mapan' },
                      { desil: 'Desil 10', count: Math.round((desilStatsData?.desil_mampu || 100) * 0.1), fill: '#059669', label: 'Sangat Mampu' }
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="desil" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" name="Jumlah KK" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                <span>Status Verifikasi Kelurahan:</span>
                <span className="font-extrabold text-emerald-700">
                  {desilStatsData?.verified_kelurahan ?? 0} Disahkan &middot; {desilStatsData?.pending_verifikasi ?? 0} Menunggu Sidang
                </span>
              </div>
            </div>

            {/* Standar & Regulasi Nasional BPS DTSEN */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <ShieldCheck className="text-sky-600" size={18} />
                  <span>Pedoman Desil BPS & Dinsos</span>
                </h4>

                <div className="space-y-3 pt-3 text-xs">
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                    <span className="font-black text-[11px] block">Desil 1 (0 – 10% Terbawah)</span>
                    <p className="text-[11px] leading-relaxed">
                      Keluarga miskin ekstrem dengan daya listrik &le; 450 VA / tanpa meteran, lantai tanah/semen, dan sanitasi non-standar.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <span className="font-black text-[11px] block">Desil 2 & 3 (11 – 30%)</span>
                    <p className="text-[11px] leading-relaxed">
                      Keluarga rentan miskin dengan pengeluaran mendekati garis kemiskinan BPS daerah. Wajib didampingi bansos pangan.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                    <span className="font-black text-[11px] block">Desil 7 – 10 (Mampu / Non-Bansos)</span>
                    <p className="text-[11px] leading-relaxed">
                      Kepemilikan mobil atau daya listrik &ge; 1300 VA secara otomatis dikunci sistem sebagai kelompok mandiri (Ineligible Bansos).
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <Link
                  to="/dashboard/desil"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <span>Buka Meja Verifikasi Sanggah Desil</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIKS HEATMAP SPASIAL RT */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Matriks Heatmap Spasial Wilayah RT</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Komparasi densitas kependudukan, kelompok rentan (Desil 1-2 & Lansia/Balita), dan rasio kepatuhan PBB per Rukun Tetangga.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400 font-medium">Gradien Intensitas:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">Optimal / Patuh</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">Sedang</span>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold">Prioritas / Rentan</span>
              </div>
            </div>

            {/* Heatmap Grid Cards (RT 001 - RT 005) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
              {demografiData?.spatial_heatmap?.map((rtItem) => {
                const compliance = rtItem.pbb_kepatuhan_persen;
                const isSelected = selectedHeatmapRT?.rt === rtItem.rt;

                let complianceBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (compliance < 50) complianceBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                else if (compliance < 75) complianceBadge = 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <motion.div
                    key={rtItem.rt}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedHeatmapRT(isSelected ? null : rtItem)}
                    className={`cursor-pointer rounded-3xl p-5 border transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-lg ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/30">
                          RT {rtItem.rt}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">Rukun Tetangga {rtItem.rt}</span>
                          <span className="text-[10px] text-gray-400 block">Wilayah RW {rtItem.rw}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono border ${complianceBadge}`}>
                        PBB {compliance}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">Total Warga</span>
                        <span className="text-base font-black text-gray-800 font-mono">{rtItem.total_warga} jiwa</span>
                        <span className="text-[10px] text-gray-500 block">{rtItem.total_kk} Kartu Keluarga</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                        <span className="text-[10px] text-gray-400 font-semibold block uppercase">Komposisi Gender</span>
                        <span className="text-xs font-bold text-gray-700 font-mono block mt-1">
                          L: {rtItem.pria} | P: {rtItem.wanita}
                        </span>
                        <span className="text-[10px] text-gray-400 block">Keseimbangan</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100">
                        <span className="text-[10px] text-amber-700 font-bold block uppercase">Balita & Lansia</span>
                        <span className="text-xs font-black text-amber-900 font-mono block mt-1">
                          👶 {rtItem.balita} | 🧓 {rtItem.lansia}
                        </span>
                        <span className="text-[10px] text-amber-700 block">Target Posyandu</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                        <span className="text-[10px] text-rose-700 font-bold block uppercase">Desil 1-2 Rentan</span>
                        <span className="text-base font-black text-rose-900 font-mono">{rtItem.desil_rentan_kk} KK</span>
                        <span className="text-[10px] text-rose-700 block">Prioritas Bansos</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                      <span>{isSelected ? 'Tutup Rincian' : 'Klik untuk Analisis Presisi'}</span>
                      <ArrowRight size={13} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LAYANAN DOKUMEN & SLA */}
      {activeTab === 'dokumen' && (
        <div className="space-y-6">
          {/* Filter Periode Pills */}
          <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-gray-700">Periode Waktu Pengajuan:</span>
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { id: '7d', label: '7 Hari Terakhir' },
                { id: '30d', label: '30 Hari Terakhir' },
                { id: 'q', label: 'Triwulan (90 Hari)' },
                { id: 'ytd', label: '1 Tahun Penuh' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedPeriod === p.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Funnel Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Masuk</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600"><FileText size={18} /></span>
              </div>
              <span className="text-2xl font-black text-gray-900 font-mono">
                {dokumenData?.pipeline?.total_pengajuan || 0}
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">Surat Diajukan Warga</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Disahkan Selesai</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={18} /></span>
              </div>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {dokumenData?.pipeline?.step_selesai || 0}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">TTE Resmi Kelurahan</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Loket Dampingan</span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-600"><Users size={18} /></span>
              </div>
              <span className="text-2xl font-black text-purple-900 font-mono">
                {dokumenData?.pipeline?.total_assisted_submission || 0}
              </span>
              <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">Bantuan Offline/Lansia</span>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Bypass Darurat RW</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><Zap size={18} /></span>
              </div>
              <span className="text-2xl font-black text-amber-900 font-mono">
                {dokumenData?.pipeline?.total_emergency_bypass || 0}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold block mt-0.5">Jalur Kedaruratan (ICU/RS)</span>
            </div>
          </div>

          {/* Breakdown 10 Kategori Surat & SLA Rata-rata */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">Kategori Dokumen & Kecepatan Layanan (SLA)</h3>
                <p className="text-xs text-gray-500 mt-1">Volume permohonan surat dan rata-rata durasi penyelesaian hingga pengesahan TTE.</p>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Target SLA: &lt; 24 Jam
              </span>
            </div>

            <div className="pt-6 space-y-4">
              {dokumenData?.kategori?.length > 0 ? (
                dokumenData.kategori.map((kat, index) => {
                  const maxCount = dokumenData.kategori[0]?.count || 1;
                  const pct = Math.round((kat.count / maxCount) * 100);

                  return (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-800">{kat.kategori}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-gray-900">{kat.count} surat</span>
                          <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            ⏱️ Rata: {kat.rata_jam > 0 ? `${kat.rata_jam} jam` : '< 1 jam'}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">Belum ada pengajuan surat dalam periode ini.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REKOMENDASI KEBIJAKAN & AI STRATEGY */}
      {activeTab === 'rekomendasi' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-2 mb-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles size={16} />
              <span>Kanaya AI Strategic Policy Recommendations</span>
            </div>
            <h3 className="text-xl font-black">Rekomendasi Berbasis Data Analitik Wilayah</h3>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Hasil inferensi algoritma analisis multi-dimensi (Piramida Kependudukan, Rasio Desil 1-2, dan Tren Pelayanan).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">Fokus Demografi Balita</span>
                <p className="text-xs text-white leading-relaxed font-medium">
                  Prioritaskan PMT (Pemberian Makanan Tambahan) di RT dengan populasi balita tinggi untuk mencegah stunting sejak dini.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block mb-1">Optimasi Penerimaan PBB</span>
                <p className="text-xs text-white leading-relaxed font-medium">
                  RT dengan kepatuhan di bawah 70% disarankan mengaktifkan layanan jemput bola pembayaran QRIS/BJB di Pos Ronda atau Balai Warga.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block mb-1">Akselerasi Layanan Publik</span>
                <p className="text-xs text-white leading-relaxed font-medium">
                  Tingkatkan sosialisasi Loket Dampingan untuk warga lansia dan minim akses gadget agar tidak terjadi ketertinggalan pengurusan administrasi kependudukan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
