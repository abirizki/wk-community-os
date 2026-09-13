import React, { useState, useEffect, useMemo } from 'react';
import {
  Landmark,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Award,
  Sparkles,
  Layers,
  ChevronRight,
  MapPin,
  Clock,
  Filter,
  Eye,
  RotateCcw,
  BarChart3,
  PieChart,
  Activity,
  FileText,
  Target,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function CommandCenterPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Data States
  const [commandData, setCommandData] = useState(null);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [activeTenant, setActiveTenant] = useState(null);

  // Analysis Modes (Data Analyst Storytelling Controls)
  const [activeTab, setActiveTab] = useState('ranking_bar'); // 'ranking_bar' | 'kecamatan_group' | 'matrix_table'
  const [selectedMetric, setSelectedMetric] = useState('stunting'); // 'stunting' | 'desil' | 'sla' | 'maturity'
  const [selectedKecamatan, setSelectedKecamatan] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('desc'); // 'desc' | 'asc'
  const [selectedBarItem, setSelectedBarItem] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cmdRes, kecRes, tenantRes] = await Promise.allSettled([
        api.get('/wilayah/command-center'),
        api.get('/wilayah/kecamatan'),
        api.get('/wilayah/active-tenant')
      ]);

      if (cmdRes.status === 'fulfilled' && cmdRes.value?.data?.data) {
        setCommandData(cmdRes.value.data.data);
      }
      if (kecRes.status === 'fulfilled' && kecRes.value?.data?.data) {
        setKecamatanList(kecRes.value.data.data);
      }
      if (tenantRes.status === 'fulfilled' && tenantRes.value?.data?.active_tenant) {
        setActiveTenant(tenantRes.value.data.active_tenant);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat Command Center');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSwitchTenant = async (kodeKelurahan) => {
    try {
      const res = await api.post('/wilayah/switch-tenant', { kode_kelurahan: kodeKelurahan });
      setActiveTenant(res.data.active_tenant);
      alert(res.data.message);
    } catch (err) {
      alert('Gagal beralih tenant: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleResetTenant = async () => {
    try {
      await api.post('/wilayah/switch-tenant', { kode_kelurahan: null });
      setActiveTenant(null);
      alert('Tampilan kembali ke perspektif makro Kota Sukabumi.');
    } catch (err) {
      alert('Gagal mereset tenant: ' + err.message);
    }
  };

  // Metrik Konfigurasi Analis Data
  const METRIC_CONFIG = {
    stunting: {
      label: 'Kasus Stunting Balita',
      unit: 'kasus',
      color: 'bg-rose-500',
      textColor: 'text-rose-600',
      lightBg: 'bg-rose-50 border-rose-200',
      barGradient: 'from-rose-500 to-rose-400',
      getValue: (k) => k.metrics.kasus_stunting,
      cityAvg: 3.2,
      storyInsight: 'Prioritas intervensi gizi terpadu untuk percepatan zero stunting.'
    },
    desil: {
      label: 'Keluarga Desil 1–2 (Miskin Ekstrem)',
      unit: 'keluarga',
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      lightBg: 'bg-amber-50 border-amber-200',
      barGradient: 'from-amber-500 to-amber-400',
      getValue: (k) => k.metrics.kemiskinan_ekstrem_desil_1_2,
      cityAvg: 22.4,
      storyInsight: 'Basis alokasi bantuan sosial APBD dan jaring pengaman sosial.'
    },
    sla: {
      label: 'Kecepatan Layanan Surat (SLA)',
      unit: 'jam',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      lightBg: 'bg-emerald-50 border-emerald-200',
      barGradient: 'from-emerald-500 to-teal-400',
      getValue: (k) => k.metrics.sla_proses_surat_jam,
      cityAvg: 1.8,
      storyInsight: 'Efisiensi birokrasi dan SLA penandatanganan surat digital TTE.'
    },
    maturity: {
      label: 'Indeks Kematangan Data SPBE',
      unit: '%',
      color: 'bg-sky-500',
      textColor: 'text-sky-600',
      lightBg: 'bg-sky-50 border-sky-200',
      barGradient: 'from-sky-500 to-indigo-400',
      getValue: (k) => k.metrics.indeks_kematangan_data,
      cityAvg: 81.2,
      storyInsight: 'Kesiapan validasi NIK dan kelengkapan basis data kependudukan.'
    }
  };

  const currentMetric = METRIC_CONFIG[selectedMetric];

  // Filter & Sort Data Kelurahan
  const rawList = commandData?.heatmap || [];

  const filteredKelurahan = useMemo(() => {
    return rawList
      .filter((k) => {
        const matchKec = selectedKecamatan ? k.kode_kecamatan === selectedKecamatan : true;
        const matchQuery =
          k.nama_kelurahan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          k.nama_kecamatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (k.nama_lurah && k.nama_lurah.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchKec && matchQuery;
      })
      .sort((a, b) => {
        const valA = currentMetric.getValue(a);
        const valB = currentMetric.getValue(b);
        return sortBy === 'desc' ? valB - valA : valA - valB;
      });
  }, [rawList, selectedKecamatan, searchQuery, selectedMetric, sortBy]);

  // Agregasi Antar-Kecamatan untuk Storytelling Bar Group
  const kecamatanAggregates = useMemo(() => {
    const map = {};
    rawList.forEach((k) => {
      if (!map[k.nama_kecamatan]) {
        map[k.nama_kecamatan] = {
          nama: k.nama_kecamatan,
          kode: k.kode_kecamatan,
          jumlah_kelurahan: 0,
          total_stunting: 0,
          total_desil: 0,
          total_warga: 0,
          total_sla: 0,
          total_maturity: 0
        };
      }
      map[k.nama_kecamatan].jumlah_kelurahan += 1;
      map[k.nama_kecamatan].total_stunting += k.metrics.kasus_stunting;
      map[k.nama_kecamatan].total_desil += k.metrics.kemiskinan_ekstrem_desil_1_2;
      map[k.nama_kecamatan].total_warga += k.metrics.total_warga;
      map[k.nama_kecamatan].total_sla += k.metrics.sla_proses_surat_jam;
      map[k.nama_kecamatan].total_maturity += k.metrics.indeks_kematangan_data;
    });

    return Object.values(map).map((kec) => ({
      ...kec,
      avg_sla: Number((kec.total_sla / (kec.jumlah_kelurahan || 1)).toFixed(1)),
      avg_maturity: Number((kec.total_maturity / (kec.jumlah_kelurahan || 1)).toFixed(1))
    }));
  }, [rawList]);

  // Nilai maksimum untuk skala bar chart
  const maxMetricValue = useMemo(() => {
    if (filteredKelurahan.length === 0) return 100;
    const max = Math.max(...filteredKelurahan.map((k) => currentMetric.getValue(k)));
    return max > 0 ? max : 100;
  }, [filteredKelurahan, currentMetric]);

  // Storytelling Highlights
  const highestKelurahan = filteredKelurahan[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* 1. Header Banner Eksekutif */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-sky-900 text-white p-6 md:p-8 shadow-xl border border-sky-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="px-3 py-1 text-[11px] font-bold tracking-wide rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 uppercase flex items-center gap-1.5 backdrop-blur-sm">
                <BarChart3 size={13} />
                <span>Executive Data Analytics Command Center</span>
              </span>
              <span className="text-xs text-sky-200/80">33 Kelurahan · 7 Kecamatan</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Pusat Komando Analisis Data Spasial
            </h1>
            <p className="text-xs md:text-sm text-sky-100/80 mt-1 max-w-2xl leading-relaxed">
              Dashboard komparasi multivariat berbasis grafik dan storytelling untuk monitoring stunting, kemiskinan ekstrem, kecepatan SLA surat, dan kesiapan data digital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeTenant && (
              <button
                onClick={handleResetTenant}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw size={14} />
                <span>Reset ke Makro Kota</span>
              </button>
            )}

            <button
              onClick={() => { setRefreshing(true); fetchData(); }}
              disabled={refreshing || loading}
              className="px-4 py-2.5 rounded-xl border border-sky-300/30 bg-white/10 hover:bg-white/20 transition flex items-center gap-2 text-xs font-bold text-white shadow-sm backdrop-blur-sm"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span>Segarkan Data</span>
            </button>
          </div>
        </div>

        {/* Active Tenant Context Banner */}
        {activeTenant && (
          <div className="mt-4 p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Perspektif Tenant Wilayah Aktif:</span>
              <span className="font-extrabold text-amber-300">
                Kelurahan {activeTenant.nama_kelurahan} (Kec. {activeTenant.nama_kecamatan})
              </span>
              <span className="font-mono text-white/70">[{activeTenant.kode_kelurahan}]</span>
            </div>
            <span className="text-[11px] text-sky-200">Row-level security aktif</span>
          </div>
        )}

        {/* Macro City KPIs */}
        {commandData?.kota && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-sky-200/80">Total Penduduk</span>
              <div className="text-xl md:text-2xl font-black mt-1">
                {commandData.kota.kpi_agregat.total_penduduk.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-sky-300">33 Kelurahan</span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-sky-200/80">Total Kepala Keluarga</span>
              <div className="text-xl md:text-2xl font-black mt-1">
                {commandData.kota.kpi_agregat.total_kk.toLocaleString('id-ID')}
              </div>
              <span className="text-[10px] text-sky-300">KK Terdata</span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-rose-200/90">Kasus Stunting Kota</span>
              <div className="text-xl md:text-2xl font-black text-rose-300 mt-1">
                {commandData.kota.kpi_agregat.total_kasus_stunting}
              </div>
              <span className="text-[10px] text-rose-200">Balita Gizi Kurang</span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-amber-200/90">Kemiskinan Ekstrem</span>
              <div className="text-xl md:text-2xl font-black text-amber-300 mt-1">
                {commandData.kota.kpi_agregat.total_keluarga_desil_1_2}
              </div>
              <span className="text-[10px] text-amber-200">Keluarga Desil 1–2</span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-emerald-200/90">Rata-rata SLA Surat</span>
              <div className="text-xl md:text-2xl font-black text-emerald-300 mt-1">
                {commandData.kota.kpi_agregat.rata_rata_sla_jam} Jam
              </div>
              <span className="text-[10px] text-emerald-200">Verifikasi & Pengesahan</span>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-3.5 border border-white/10">
              <span className="text-[11px] text-sky-200/90">Kematangan Data</span>
              <div className="text-xl md:text-2xl font-black text-sky-300 mt-1">
                {commandData.kota.kpi_agregat.rata_rata_kematangan_data}%
              </div>
              <span className="text-[10px] text-sky-200">Data Maturity Index</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Data Analyst Storytelling Narrative Card */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline-variant">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Data Storytelling Briefing: Analisis Pimpinan</h3>
              <p className="text-[11px] text-on-surface-variant">Wawasan tematik berbasis korelasi data spasial</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full border border-sky-200">
            Korelasi & Proyeksi Kebijakan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <HeartPulse size={14} /> Beban Stunting Tertinggi
              </span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                Intervensi Prioritas
              </span>
            </div>
            <p className="text-xs text-rose-950 leading-relaxed">
              Konsentrasi stunting tertinggi berada di <strong>Kelurahan {highestKelurahan?.nama_kelurahan || 'Kebonjati'}</strong> ({currentMetric.getValue(highestKelurahan || { metrics: {} })} kasus). Perlu percepatan pendistribusian PMT dan audit antropometri posyandu.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Clock size={14} /> Efisiensi Layanan Surat (SLA)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                SLA &lt; 2 Jam
              </span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Rata-rata kecepatan penerbitan surat kota tercatat <strong>1.8 Jam</strong>. Digitalisasi persetujuan TTE ber-QR Code mempercepat alur birokrasi hingga 65% dibandingkan loket konvensional.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                <Award size={14} /> Kesiapan SPBE & Validitas Data
              </span>
              <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                Skor 81.2%
              </span>
            </div>
            <p className="text-xs text-sky-950 leading-relaxed">
              Kelurahan dengan indeks kematangan data tinggi berkorelasi positif dengan akurasi penyaluran bansos tanpa duplikasi NIK dan verifikasi sanggahan yang transparan.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Navigation Controls & Chart Type Switcher */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Chart Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('ranking_bar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'ranking_bar'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <BarChart3 size={15} />
              <span>Grafik Batang (Ranking Kelurahan)</span>
            </button>

            <button
              onClick={() => setActiveTab('kecamatan_group')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'kecamatan_group'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <Layers size={15} />
              <span>Komparasi Antar-Kecamatan</span>
            </button>

            <button
              onClick={() => setActiveTab('matrix_table')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'matrix_table'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <FileText size={15} />
              <span>Matriks Spasial Lengkap</span>
            </button>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <span className="text-[11px] font-bold text-on-surface-variant shrink-0 mr-1">Metrik Analisis:</span>
            {Object.entries(METRIC_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedMetric(key)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap text-xs ${
                  selectedMetric === key
                    ? `${config.color} text-white shadow-xs`
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {config.label.includes('Stunting') ? 'Stunting' : config.label.includes('Desil') ? 'Desil 1-2' : config.label.includes('SLA') ? 'SLA Surat' : 'Kematangan SPBE'}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter & Search Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-3 border-t border-outline-variant">
          {/* Kecamatan Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedKecamatan('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedKecamatan === ''
                  ? 'bg-sky-700 text-white'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Semua Kecamatan (7)
            </button>
            {kecamatanList.map((kec) => (
              <button
                key={kec.kode_kecamatan}
                onClick={() => setSelectedKecamatan(kec.kode_kecamatan)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedKecamatan === kec.kode_kecamatan
                    ? 'bg-sky-700 text-white'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {kec.nama_kecamatan}
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Cari kelurahan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-surface-container-low border border-outline-variant focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <button
              onClick={() => setSortBy(sortBy === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-1.5 rounded-xl border border-outline-variant bg-surface-container-low text-xs font-bold text-on-surface flex items-center gap-1.5 hover:bg-surface-container shrink-0"
              title="Ganti Urutan"
            >
              <span>{sortBy === 'desc' ? 'Tertinggi ↓' : 'Terendah ↑'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. TAMPILAN GRAFIK: Tab 1 - Grafik Batang Komparatif (Bar Chart Ranking) */}
      {activeTab === 'ranking_bar' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-outline-variant">
            <div>
              <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
                <span>Ranking Spasial: {currentMetric.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${currentMetric.lightBg} ${currentMetric.textColor}`}>
                  {filteredKelurahan.length} Kelurahan
                </span>
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Klik salah satu batang grafik untuk menelaah rincian kelurahan secara mendalam.
              </p>
            </div>
            <div className="text-right text-[11px] text-on-surface-variant">
              Rata-rata Kota: <strong className="text-on-surface">{currentMetric.cityAvg} {currentMetric.unit}</strong>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-2">
            {filteredKelurahan.map((item, index) => {
              const val = currentMetric.getValue(item);
              const percentage = Math.min(Math.round((val / maxMetricValue) * 100), 100);
              const isSelected = selectedBarItem?.kode_kelurahan === item.kode_kelurahan;

              return (
                <div
                  key={item.kode_kelurahan}
                  onClick={() => setSelectedBarItem(item)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-1 ring-sky-400'
                      : 'border-outline-variant/60 hover:border-outline hover:bg-surface-container-low/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 text-[10px] font-bold text-on-surface-variant/80 text-right">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-on-surface truncate">
                        {item.nama_kelurahan}
                      </span>
                      <span className="text-[10px] text-on-surface-variant truncate">
                        (Kec. {item.nama_kecamatan})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-black ${currentMetric.textColor}`}>
                        {val} {currentMetric.unit}
                      </span>
                      {selectedMetric === 'stunting' && val >= 5 && (
                        <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">
                          Tinggi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden flex">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(percentage, 3)}%` }}
                      transition={{ duration: 0.4, delay: index * 0.015 }}
                      className={`h-full rounded-full bg-gradient-to-r ${currentMetric.barGradient}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Drilldown Drawer / Card saat bar diklik */}
          <AnimatePresence>
            {selectedBarItem && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-4 rounded-2xl bg-sky-50 border border-sky-200 mt-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-sky-950">
                        Kelurahan {selectedBarItem.nama_kelurahan}
                      </h4>
                      <span className="text-[10px] font-semibold bg-sky-200 text-sky-800 px-2 py-0.5 rounded">
                        Kec. {selectedBarItem.nama_kecamatan}
                      </span>
                    </div>
                    <p className="text-xs text-sky-900 mt-1">
                      Lurah: <strong>{selectedBarItem.nama_lurah || 'Belum Terdata'}</strong> · Populasi: {selectedBarItem.metrics.total_warga?.toLocaleString('id-ID')} jiwa ({selectedBarItem.metrics.total_kk?.toLocaleString('id-ID')} KK)
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSwitchTenant(selectedBarItem.kode_kelurahan)}
                      className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Eye size={13} />
                      <span>Beralih Perspektif Kelurahan Ini</span>
                    </button>
                    <button
                      onClick={() => setSelectedBarItem(null)}
                      className="text-xs text-sky-700 hover:text-sky-900 px-2 py-1 font-semibold"
                    >
                      Tutup
                    </button>
                  </div>
                </div>

                {/* 4 Metric Badges in Selected Kelurahan */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-sky-200/80">
                  <div className="bg-white p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-rose-600 font-bold block">Stunting Balita</span>
                    <span className="text-base font-black text-rose-700">{selectedBarItem.metrics.kasus_stunting} kasus</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-amber-600 font-bold block">Desil 1–2 (Miskin)</span>
                    <span className="text-base font-black text-amber-700">{selectedBarItem.metrics.kemiskinan_ekstrem_desil_1_2} KK</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-emerald-600 font-bold block">SLA Surat Kelurahan</span>
                    <span className="text-base font-black text-emerald-700">{selectedBarItem.metrics.sla_proses_surat_jam} jam</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-sky-100">
                    <span className="text-[10px] text-sky-600 font-bold block">Kematangan SPBE</span>
                    <span className="text-base font-black text-sky-700">{selectedBarItem.metrics.indeks_kematangan_data}%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 5. TAMPILAN GRAFIK: Tab 2 - Komparasi Antar-Kecamatan (Aggregated Grouped Bar) */}
      {activeTab === 'kecamatan_group' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-5 shadow-sm space-y-6">
          <div className="pb-3 border-b border-outline-variant">
            <h3 className="text-sm font-extrabold text-on-surface">
              Perbandingan Agregat 7 Kecamatan se-Kota Sukabumi
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              Analisis beban masalah dan efisiensi pelayanan yang diakumulasikan di tingkat kecamatan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kecamatanAggregates.map((kec) => (
              <div
                key={kec.kode}
                className="p-4 rounded-2xl border border-outline-variant bg-surface-container-low/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                      {kec.nama.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">Kecamatan {kec.nama}</h4>
                      <span className="text-[10px] text-on-surface-variant">{kec.jumlah_kelurahan} Kelurahan</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedKecamatan(kec.kode); setActiveTab('ranking_bar'); }}
                    className="text-[10px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-0.5"
                  >
                    <span>Detail</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-on-surface-variant">Beban Kasus Stunting</span>
                      <strong className="text-rose-600">{kec.total_stunting} kasus</strong>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${Math.min((kec.total_stunting / 25) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-on-surface-variant">Keluarga Desil 1–2</span>
                      <strong className="text-amber-600">{kec.total_desil} KK</strong>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.min((kec.total_desil / 180) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant">Rata-rata SLA Surat:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {kec.avg_sla} Jam
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-on-surface-variant">Rata-rata SPBE Data:</span>
                    <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                      {kec.avg_maturity}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAMPILAN TABEL MATRIKS: Tab 3 - Detail Spasial 33 Kelurahan */}
      {activeTab === 'matrix_table' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Matriks Komparasi Spasial 33 Kelurahan</h3>
              <p className="text-xs text-on-surface-variant">
                Menampilkan {filteredKelurahan.length} data kelurahan {selectedKecamatan ? 'pada kecamatan terpilih' : 'se-Kota Sukabumi'}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
              Multi-Tenant Scoped
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant">
                <tr>
                  <th className="py-3 px-4">Kelurahan & Kecamatan</th>
                  <th className="py-3 px-4">Lurah</th>
                  <th className="py-3 px-4 text-center">Stunting Balita</th>
                  <th className="py-3 px-4 text-center">Desil 1–2</th>
                  <th className="py-3 px-4 text-center">SLA Surat</th>
                  <th className="py-3 px-4 text-center">Kematangan SPBE</th>
                  <th className="py-3 px-4 text-right">Aksi Pimpinan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredKelurahan.map((kel) => (
                  <tr key={kel.kode_kelurahan} className="hover:bg-surface-container-low/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-on-surface">{kel.nama_kelurahan}</div>
                      <div className="text-[10px] text-on-surface-variant">Kec. {kel.nama_kecamatan} · {kel.kode_kelurahan}</div>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant font-medium">
                      {kel.nama_lurah || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                        kel.metrics.kasus_stunting >= 5 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {kel.metrics.kasus_stunting} kasus
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
                        {kel.metrics.kemiskinan_ekstrem_desil_1_2} KK
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs">
                        {kel.metrics.sla_proses_surat_jam} jam
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-xs">
                        {kel.metrics.indeks_kematangan_data}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleSwitchTenant(kel.kode_kelurahan)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-bold transition inline-flex items-center gap-1"
                      >
                        <Eye size={12} />
                        <span>Beralih</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
