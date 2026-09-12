import React, { useState, useEffect } from 'react';
import { 
  Building2,
  GraduationCap,
  HeartPulse,
  Store,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  FileCheck,
  ShieldAlert,
  Stethoscope,
  ShoppingBag,
  ExternalLink,
  MapPin,
  Phone,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function DayaDukungPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pendidikan'); // 'pendidikan' | 'kesehatan' | 'ekonomi' | 'sanitasi'
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Sektor States
  const [summaryData, setSummaryData] = useState(null);
  const [pendidikanData, setPendidikanData] = useState({ inventory: [], analysis: null });
  const [kesehatanData, setKesehatanData] = useState({ inventory: [], analysis: null });
  const [usahaData, setUsahaData] = useState({ inventory: [], analysis: null });
  const [sanitasiData, setSanitasiData] = useState(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategoriUsaha, setSelectedKategoriUsaha] = useState('');

  // Modals
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showBizModal, setShowBizModal] = useState(false);

  // Form States
  const [schoolForm, setSchoolForm] = useState({
    nama_sekolah: '',
    npsn: '',
    jenjang: 'SD',
    status_sekolah: 'Negeri',
    alamat: '',
    daya_tampung_kursi_baru: 60,
    total_kapasitas_murid: 240,
    jumlah_rombel: 6,
    akreditasi: 'A',
    no_telepon: ''
  });

  const [healthForm, setHealthForm] = useState({
    nama_faskes: '',
    jenis_faskes: 'Puskesmas',
    kategori_pengelola: 'Pemerintah',
    alamat: '',
    jumlah_dokter: 2,
    jumlah_bidan: 2,
    jumlah_perawat: 4,
    jumlah_ahli_gizi: 1,
    kapasitas_tempat_tidur: 4,
    layanan_igd_24jam: 0,
    jam_operasional: '08:00 - 15:30 WIB',
    no_kontak: ''
  });

  const [bizForm, setBizForm] = useState({
    nama_usaha: '',
    kategori_usaha: 'Kuliner & Warung',
    skala_usaha: 'Mikro',
    alamat: '',
    rt: user?.rt || '001',
    rw: user?.rw || '001',
    jumlah_tenaga_kerja_lokal: 1,
    omset_bulanan_kategori: '< 5 Juta',
    apakah_toko_pangan_murah: 0,
    deskripsi_produk: ''
  });

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, eduRes, healthRes, bizRes, sanRes] = await Promise.allSettled([
        api.get('/fasilitas/summary'),
        api.get('/fasilitas/pendidikan'),
        api.get('/fasilitas/kesehatan'),
        api.get('/fasilitas/usaha'),
        api.get('/fasilitas/sanitasi')
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value?.data?.data) {
        setSummaryData(sumRes.value.data.data);
      }
      if (eduRes.status === 'fulfilled' && eduRes.value?.data?.data) {
        setPendidikanData(eduRes.value.data.data);
      }
      if (healthRes.status === 'fulfilled' && healthRes.value?.data?.data) {
        setKesehatanData(healthRes.value.data.data);
      }
      if (bizRes.status === 'fulfilled' && bizRes.value?.data?.data) {
        setUsahaData(bizRes.value.data.data);
      }
      if (sanRes.status === 'fulfilled' && sanRes.value?.data?.data) {
        setSanitasiData(sanRes.value.data.data);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data daya dukung wilayah');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fasilitas/pendidikan', schoolForm);
      setShowSchoolModal(false);
      fetchAllData();
    } catch (err) {
      alert('Gagal menambah sekolah: ' + err.message);
    }
  };

  const handleCreateHealth = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fasilitas/kesehatan', healthForm);
      setShowHealthModal(false);
      fetchAllData();
    } catch (err) {
      alert('Gagal mendaftar faskes: ' + err.message);
    }
  };

  const handleCreateBiz = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fasilitas/usaha', bizForm);
      setShowBizModal(false);
      fetchAllData();
    } catch (err) {
      alert('Gagal mendaftarkan usaha: ' + err.message);
    }
  };

  const canManageFacilities = ['superadmin', 'admin_kelurahan', 'admin'].includes(user?.role);

  // Filtered inventories
  const filteredSchools = (pendidikanData.inventory || []).filter(s => 
    s.nama_sekolah.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.jenjang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHealth = (kesehatanData.inventory || []).filter(h =>
    h.nama_faskes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.jenis_faskes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBiz = (usahaData.inventory || []).filter(b => {
    const matchQuery = b.nama_usaha.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.nama_pemilik.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKat = selectedKategoriUsaha ? b.kategori_usaha === selectedKategoriUsaha : true;
    return matchQuery && matchKat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-surface-container-low to-secondary/10 border border-outline-variant/60 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold tracking-wide rounded-full bg-primary/20 text-primary uppercase">
                Sprint 8 Enterprise
              </span>
              <span className="text-xs text-on-surface-variant">
                Daya Dukung Wilayah & Ekonomi Lokal
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              Fasilitas Publik & Daya Dukung Wilayah
            </h1>
            <p className="text-sm md:text-base text-on-surface-variant mt-1 max-w-2xl">
              Perencanaan spasial kapasitas kursi zonasi sekolah, rasio tenaga medis per 1.000 jiwa, direktori UMKM terhubung SKU, dan korelasi sanitasi-stunting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-high transition flex items-center gap-2 text-sm font-semibold text-on-surface shadow-xs disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              Segarkan Data
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        {summaryData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-outline-variant/40">
            <div className="bg-surface/80 backdrop-blur-xs rounded-2xl p-4 border border-outline-variant/40">
              <span className="text-xs font-medium text-on-surface-variant">Indeks Daya Dukung</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl md:text-3xl font-black text-primary">
                  {summaryData.index_daya_dukung?.score || 0}%
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  summaryData.index_daya_dukung?.color === 'emerald' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : summaryData.index_daya_dukung?.color === 'rose'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {summaryData.index_daya_dukung?.status}
                </span>
              </div>
            </div>

            <div className="bg-surface/80 backdrop-blur-xs rounded-2xl p-4 border border-outline-variant/40">
              <span className="text-xs font-medium text-on-surface-variant">Rasio Dokter / 1.000 Jiwa</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl md:text-3xl font-black text-blue-600">
                  {summaryData.kesehatan?.faskes_stats?.dokter?.rasio_per_1000 || 0}
                </span>
                <span className="text-[11px] text-on-surface-variant">WHO: ≥ 1.0</span>
              </div>
            </div>

            <div className="bg-surface/80 backdrop-blur-xs rounded-2xl p-4 border border-outline-variant/40">
              <span className="text-xs font-medium text-on-surface-variant">UMKM & Serapan Naker</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl md:text-3xl font-black text-amber-600">
                  {summaryData.ekonomi?.total_serapan_naker || 0}
                </span>
                <span className="text-[11px] text-on-surface-variant">
                  dari {summaryData.ekonomi?.total_umkm || 0} usaha
                </span>
              </div>
            </div>

            <div className="bg-surface/80 backdrop-blur-xs rounded-2xl p-4 border border-outline-variant/40">
              <span className="text-xs font-medium text-on-surface-variant">Cakupan Sanitasi Sehat</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl md:text-3xl font-black text-emerald-600">
                  {summaryData.sanitasi?.jamban_sehat_tercover_persen || 0}%
                </span>
                <span className="text-[11px] text-on-surface-variant">Air: {summaryData.sanitasi?.air_bersih_tercover_persen || 0}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-surface-container-low rounded-2xl border border-outline-variant/60">
        <button
          onClick={() => setActiveTab('pendidikan')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'pendidikan'
              ? 'bg-surface text-primary shadow-xs border border-outline-variant/60'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
          }`}
        >
          <GraduationCap size={18} />
          <span>Sektor Pendidikan & Kursi PPDB</span>
        </button>

        <button
          onClick={() => setActiveTab('kesehatan')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'kesehatan'
              ? 'bg-surface text-primary shadow-xs border border-outline-variant/60'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
          }`}
        >
          <HeartPulse size={18} />
          <span>Sektor Kesehatan & Rasio Medis</span>
        </button>

        <button
          onClick={() => setActiveTab('ekonomi')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'ekonomi'
              ? 'bg-surface text-primary shadow-xs border border-outline-variant/60'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
          }`}
        >
          <Store size={18} />
          <span>Ekonomi Lokal & UMKM (SKU)</span>
        </button>

        <button
          onClick={() => setActiveTab('sanitasi')}
          className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === 'sanitasi'
              ? 'bg-surface text-primary shadow-xs border border-outline-variant/60'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface/50'
          }`}
        >
          <Droplets size={18} />
          <span>Sanitasi & Korelasi Stunting</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: SEKTOR PENDIDIKAN */}
      {/* =================================================================== */}
      {activeTab === 'pendidikan' && (
        <div className="space-y-6">
          {/* Cohorts PPDB Zonasi Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {pendidikanData.analysis?.cohorts?.map((c, idx) => (
              <div 
                key={idx}
                className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {c.jenjang}
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    c.status_kapasitas === 'SURPLUS'
                      ? 'bg-emerald-100 text-emerald-700'
                      : c.status_kapasitas === 'DEFISIT'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {c.status_kapasitas} ({c.selisih_kursi > 0 ? `+${c.selisih_kursi}` : c.selisih_kursi})
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-on-surface-variant">Kapasitas Kursi Baru:</span>
                    <span className="text-base font-bold text-on-surface">{c.kursi_baru} kursi</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-on-surface-variant">Anak Usia Sekolah:</span>
                    <span className="text-base font-bold text-on-surface">{c.jumlah_anak} anak</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-on-surface-variant">Rasio Ketersediaan:</span>
                    <span className="text-sm font-black text-primary">{c.rasio_daya_tampung_persen}%</span>
                  </div>
                </div>

                <div className="w-full bg-surface-container-high h-2 rounded-full mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      c.status_kapasitas === 'SURPLUS' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, c.rasio_daya_tampung_persen)}%` }}
                  />
                </div>
                <div className="text-[11px] text-on-surface-variant mt-2">
                  {c.institusi} Institusi terdaftar ({c.usia_label})
                </div>
              </div>
            ))}
          </div>

          {/* AI Early Warning Banner */}
          {pendidikanData.analysis?.ai_warnings?.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm mb-2">
                <AlertTriangle size={18} />
                <span>Peringatan Dini AI Sektor Pendidikan & Zonasi PPDB</span>
              </div>
              <div className="space-y-2">
                {pendidikanData.analysis.ai_warnings.map((w, idx) => (
                  <div key={idx} className="text-xs md:text-sm text-on-surface flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 shrink-0" />
                    <span>{w.pesan}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* School Inventory Table */}
          <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-on-surface">Direktori Fasilitas Pendidikan Kelurahan</h3>
                <p className="text-xs text-on-surface-variant">PAUD, SD, SMP, SMA/SMK di wilayah Kebonjati</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Cari sekolah atau jenjang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant focus:outline-none focus:border-primary"
                  />
                </div>

                {canManageFacilities && (
                  <button
                    onClick={() => setShowSchoolModal(true)}
                    className="px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition shrink-0"
                  >
                    <Plus size={16} />
                    <span>Tambah Sekolah</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant/60">
                  <tr>
                    <th className="py-3.5 px-4">Nama Sekolah & NPSN</th>
                    <th className="py-3.5 px-4">Jenjang & Status</th>
                    <th className="py-3.5 px-4">Alamat</th>
                    <th className="py-3.5 px-4 text-center">Rombel</th>
                    <th className="py-3.5 px-4 text-center">Kursi Baru</th>
                    <th className="py-3.5 px-4 text-center">Total Kapasitas</th>
                    <th className="py-3.5 px-4 text-center">Akreditasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                  {filteredSchools.length > 0 ? (
                    filteredSchools.map((s) => (
                      <tr key={s.id} className="hover:bg-surface-container-lowest transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold">{s.nama_sekolah}</div>
                          <div className="text-[11px] text-on-surface-variant">NPSN: {s.npsn || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-surface-container-high mr-1">
                            {s.jenjang}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            s.status_sekolah === 'Negeri' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {s.status_sekolah}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant max-w-xs truncate">
                          {s.alamat} (RT {s.rt}/RW {s.rw})
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold">{s.jumlah_rombel}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-primary">{s.daya_tampung_kursi_baru}</td>
                        <td className="py-3.5 px-4 text-center font-medium">{s.total_kapasitas_murid}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded font-black text-[11px] bg-emerald-100 text-emerald-700">
                            {s.akreditasi}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                        Belum ada data fasilitas pendidikan yang sesuai filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: SEKTOR KESEHATAN */}
      {/* =================================================================== */}
      {activeTab === 'kesehatan' && (
        <div className="space-y-6">
          {/* Medical Ratios */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-on-surface-variant">Dokter Umum</span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  kesehatanData.analysis?.faskes_stats?.dokter?.status === 'IDEAL'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {kesehatanData.analysis?.faskes_stats?.dokter?.status}
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-on-surface">
                  {kesehatanData.analysis?.faskes_stats?.dokter?.rasio_per_1000 || 0}
                </span>
                <span className="text-xs text-on-surface-variant ml-1">per 1.000 jiwa</span>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-2">
                Total: {kesehatanData.analysis?.faskes_stats?.dokter?.jumlah || 0} Dokter (Standar WHO: ≥ 1.0)
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-on-surface-variant">Bidan Desa</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Posyandu Ready
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-on-surface">
                  {kesehatanData.analysis?.faskes_stats?.bidan?.rasio_per_1000 || 0}
                </span>
                <span className="text-xs text-on-surface-variant ml-1">per 1.000 jiwa</span>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-2">
                Total: {kesehatanData.analysis?.faskes_stats?.bidan?.jumlah || 0} Bidan melayani balita & bumil
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-on-surface-variant">Tenaga Keperawatan</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                  Pelayanan Primer
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-on-surface">
                  {kesehatanData.analysis?.faskes_stats?.perawat?.rasio_per_1000 || 0}
                </span>
                <span className="text-xs text-on-surface-variant ml-1">per 1.000 jiwa</span>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-2">
                Total: {kesehatanData.analysis?.faskes_stats?.perawat?.jumlah || 0} Perawat terdaftar
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-on-surface-variant">Tempat Tidur Faskes</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface">
                  Rawat Inap / Observasi
                </span>
              </div>
              <div className="mt-3">
                <span className="text-3xl font-black text-on-surface">
                  {kesehatanData.analysis?.faskes_stats?.tempat_tidur?.rasio_per_1000 || 0}
                </span>
                <span className="text-xs text-on-surface-variant ml-1">per 1.000 jiwa</span>
              </div>
              <div className="text-[11px] text-on-surface-variant mt-2">
                Total: {kesehatanData.analysis?.faskes_stats?.tempat_tidur?.jumlah || 0} Bed Pustu & Klinik
              </div>
            </div>
          </div>

          {/* Health Insights */}
          {kesehatanData.analysis?.insights?.length > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-2">
                <Stethoscope size={18} />
                <span>Rekomendasi Kapasitas Kesehatan Kelurahan</span>
              </div>
              <div className="space-y-1.5">
                {kesehatanData.analysis.insights.map((ins, idx) => (
                  <div key={idx} className="text-xs md:text-sm text-on-surface flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Facility Table */}
          <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-on-surface">Direktori Fasilitas Kesehatan Kelurahan</h3>
                <p className="text-xs text-on-surface-variant">Puskesmas, Pustu, Posyandu, Klinik Pratama & Apotek</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Cari faskes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-container-low border border-outline-variant focus:outline-none focus:border-primary"
                  />
                </div>

                {canManageFacilities && (
                  <button
                    onClick={() => setShowHealthModal(true)}
                    className="px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition shrink-0"
                  >
                    <Plus size={16} />
                    <span>Tambah Faskes</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant/60">
                  <tr>
                    <th className="py-3.5 px-4">Nama Faskes</th>
                    <th className="py-3.5 px-4">Jenis & Pengelola</th>
                    <th className="py-3.5 px-4">Alamat / Lokasi</th>
                    <th className="py-3.5 px-4 text-center">Dokter</th>
                    <th className="py-3.5 px-4 text-center">Bidan</th>
                    <th className="py-3.5 px-4 text-center">Perawat</th>
                    <th className="py-3.5 px-4 text-center">Tempat Tidur</th>
                    <th className="py-3.5 px-4">Jam Operasional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                  {filteredHealth.length > 0 ? (
                    filteredHealth.map((h) => (
                      <tr key={h.id} className="hover:bg-surface-container-lowest transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold">{h.nama_faskes}</div>
                          <div className="text-[11px] text-on-surface-variant">{h.penanggung_jawab ? `PJ: ${h.penanggung_jawab}` : ''}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold px-2 py-0.5 rounded bg-surface-container-high mr-1">
                            {h.jenis_faskes}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-medium">
                            {h.kategori_pengelola}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant">
                          {h.alamat} (RW {h.rw})
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold">{h.jumlah_dokter}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-blue-600">{h.jumlah_bidan}</td>
                        <td className="py-3.5 px-4 text-center font-bold">{h.jumlah_perawat}</td>
                        <td className="py-3.5 px-4 text-center font-bold">{h.kapasitas_tempat_tidur}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant">{h.jam_operasional}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                        Belum ada data fasilitas kesehatan yang sesuai.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: EKONOMI LOKAL & UMKM */}
      {/* =================================================================== */}
      {activeTab === 'ekonomi' && (
        <div className="space-y-6">
          {/* Economy Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
              <span className="text-xs font-bold uppercase text-on-surface-variant">Total UMKM Terdata</span>
              <div className="text-3xl font-black text-on-surface mt-2">
                {usahaData.analysis?.total_umkm || 0}
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                {usahaData.analysis?.total_terverifikasi_sku || 0} Terverifikasi Surat SKU
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
              <span className="text-xs font-bold uppercase text-on-surface-variant">Tenaga Kerja Lokal Terserap</span>
              <div className="text-3xl font-black text-emerald-600 mt-2">
                {usahaData.analysis?.total_serapan_naker || 0} orang
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                Rasio Serapan: {usahaData.analysis?.rasio_serapan_persen || 0}% usia produktif
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
              <span className="text-xs font-bold uppercase text-on-surface-variant">Toko Pangan / Sembako Murah</span>
              <div className="text-3xl font-black text-amber-600 mt-2">
                {(usahaData.inventory || []).filter(i => i.apakah_toko_pangan_murah === 1).length} toko
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                Mitra Keterjangkauan Pangan Bansos
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
              <span className="text-xs font-bold uppercase text-on-surface-variant">Usia Produktif Mencari Kerja</span>
              <div className="text-3xl font-black text-rose-600 mt-2">
                {usahaData.analysis?.usia_produktif_belum_bekerja || 0} orang
              </div>
              <div className="text-[11px] text-on-surface-variant mt-1">
                Sasaran Program Pelatihan Kerja & UMKM
              </div>
            </div>
          </div>

          {/* Food Accessibility per RW */}
          <div className="bg-surface rounded-2xl p-5 border border-outline-variant/60 shadow-xs">
            <h4 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-primary" />
              <span>Peta Keterjangkauan Toko Sembako Murah vs Keluarga Rentan Desil 1–2 per RW</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {usahaData.analysis?.food_accessibility_per_rw?.map((fa, idx) => (
                <div key={idx} className="bg-surface-container-low rounded-xl p-3.5 border border-outline-variant/40">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-on-surface">RW {fa.rw}</span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      fa.color === 'rose'
                        ? 'bg-rose-100 text-rose-700'
                        : fa.color === 'amber'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {fa.status_akses}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-on-surface-variant space-y-1">
                    <div>Keluarga Desil 1-2: <span className="font-bold text-on-surface">{fa.keluarga_desil_1_2} KK</span></div>
                    <div>Toko Pangan Murah: <span className="font-bold text-on-surface">{fa.toko_pangan_murah} unit</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Inventory Table */}
          <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-on-surface">Direktori UMKM & Sentra Usaha Warga</h3>
                <p className="text-xs text-on-surface-variant">Sinkronisasi otomatis saat pengesahan Surat Keterangan Usaha (SKU)</p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={selectedKategoriUsaha}
                  onChange={(e) => setSelectedKategoriUsaha(e.target.value)}
                  className="py-2 px-3 text-xs rounded-xl bg-surface-container-low border border-outline-variant focus:outline-none focus:border-primary"
                >
                  <option value="">Semua Kategori</option>
                  <option value="Kuliner & Warung">Kuliner & Warung</option>
                  <option value="Toko Sembako / Kelontong">Toko Sembako / Kelontong</option>
                  <option value="Jasa & Servis">Jasa & Servis</option>
                  <option value="Fashion & Tekstil">Fashion & Tekstil</option>
                  <option value="Kerajinan & Industri Kreatif">Industri Kreatif</option>
                </select>

                <button
                  onClick={() => setShowBizModal(true)}
                  className="px-3 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-primary/90 transition shrink-0"
                >
                  <Plus size={16} />
                  <span>Daftar Usaha</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant/60">
                  <tr>
                    <th className="py-3.5 px-4">Nama Usaha</th>
                    <th className="py-3.5 px-4">Pemilik & NIK</th>
                    <th className="py-3.5 px-4">Kategori & Skala</th>
                    <th className="py-3.5 px-4">Wilayah</th>
                    <th className="py-3.5 px-4 text-center">Naker Lokal</th>
                    <th className="py-3.5 px-4">Omset</th>
                    <th className="py-3.5 px-4 text-center">SKU / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                  {filteredBiz.length > 0 ? (
                    filteredBiz.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-container-lowest transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold flex items-center gap-2">
                            <span>{b.nama_usaha}</span>
                            {b.apakah_toko_pangan_murah === 1 && (
                              <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                Sembako Murah
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-on-surface-variant truncate max-w-xs">{b.deskripsi_produk || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold">{b.nama_pemilik}</div>
                          <div className="text-[11px] text-on-surface-variant font-mono">{b.nik_pemilik}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium px-2 py-0.5 rounded bg-surface-container-high mr-1">
                            {b.kategori_usaha}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-bold">({b.skala_usaha})</span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant">
                          RT {b.rt} / RW {b.rw}
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                          {b.jumlah_tenaga_kerja_lokal} orang
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant">{b.omset_bulanan_kategori}</td>
                        <td className="py-3.5 px-4 text-center">
                          {b.sku_nomor_registrasi ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              <CheckCircle2 size={12} />
                              <span>{b.sku_nomor_registrasi}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                              Usaha Mandiri
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                        Belum ada entitas usaha yang tercatat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: SANITASI & KORELASI STUNTING */}
      {/* =================================================================== */}
      {activeTab === 'sanitasi' && (
        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-outline-variant/60 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant/60">
              <h3 className="text-base font-bold text-on-surface">Matriks Korelasi Spasial: Sanitasi Lingkungan vs Kasus Stunting Balita</h3>
              <p className="text-xs text-on-surface-variant">
                Mendeteksi RT berisiko ganda di mana sanitasi non-standar (jamban cemplung/cubluk) bersinggungan langsung dengan kasus gizi kurang balita posyandu.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-semibold border-b border-outline-variant/60">
                  <tr>
                    <th className="py-3.5 px-4">Wilayah RT / RW</th>
                    <th className="py-3.5 px-4 text-center">Total KK</th>
                    <th className="py-3.5 px-4 text-center">Akses Air Bersih</th>
                    <th className="py-3.5 px-4 text-center">Jamban Sehat</th>
                    <th className="py-3.5 px-4 text-center">Jamban Non-Standar</th>
                    <th className="py-3.5 px-4 text-center">Kasus Balita Stunting</th>
                    <th className="py-3.5 px-4">Status & Kategori Risiko Lingkungan</th>
                    <th className="py-3.5 px-4">Rekomendasi Intervensi Kebijakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40 text-on-surface">
                  {sanitasiData?.matrix_rt?.length > 0 ? (
                    sanitasiData.matrix_rt.map((item, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-lowest transition">
                        <td className="py-3.5 px-4 font-bold">
                          RT {item.rt} / RW {item.rw}
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium">{item.total_kk}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-emerald-600">{item.air_bersih_persen}%</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-emerald-600">{item.jamban_sehat_persen}%</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-bold ${item.jamban_non_standar > 0 ? 'text-rose-600' : 'text-on-surface-variant'}`}>
                            {item.jamban_non_standar} KK
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-black px-2 py-0.5 rounded ${
                            item.kasus_stunting_balita > 0 ? 'bg-rose-100 text-rose-700' : 'bg-surface-container-high text-on-surface-variant'
                          }`}>
                            {item.kasus_stunting_balita} balita
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                            item.badge_color === 'rose'
                              ? 'bg-rose-100 text-rose-800'
                              : item.badge_color === 'amber'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {item.kategori_risiko}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-on-surface-variant text-[11px]">
                          {item.rekomendasi_intervensi}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-on-surface-variant">
                        Data profil sanitasi lingkungan RT belum terhimpun.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TAMBAH SEKOLAH */}
      {/* =================================================================== */}
      {showSchoolModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-3xl p-6 max-w-lg w-full border border-outline-variant shadow-xl">
            <h3 className="text-lg font-bold text-on-surface mb-4">Tambah Fasilitas Sekolah</h3>
            <form onSubmit={handleCreateSchool} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SD Negeri 035 Kebonjati"
                  value={schoolForm.nama_sekolah}
                  onChange={(e) => setSchoolForm({ ...schoolForm, nama_sekolah: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Jenjang</label>
                  <select
                    value={schoolForm.jenjang}
                    onChange={(e) => setSchoolForm({ ...schoolForm, jenjang: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="PAUD">PAUD / TK</option>
                    <option value="SD">Sekolah Dasar (SD)</option>
                    <option value="SMP">SMP / MTs</option>
                    <option value="SMA">SMA / MA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Status</label>
                  <select
                    value={schoolForm.status_sekolah}
                    onChange={(e) => setSchoolForm({ ...schoolForm, status_sekolah: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="Negeri">Negeri</option>
                    <option value="Swasta">Swasta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Kursi Baru PPDB</label>
                  <input
                    type="number"
                    min="0"
                    value={schoolForm.daya_tampung_kursi_baru}
                    onChange={(e) => setSchoolForm({ ...schoolForm, daya_tampung_kursi_baru: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Total Kapasitas</label>
                  <input
                    type="number"
                    min="0"
                    value={schoolForm.total_kapasitas_murid}
                    onChange={(e) => setSchoolForm({ ...schoolForm, total_kapasitas_murid: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Akreditasi</label>
                  <select
                    value={schoolForm.akreditasi}
                    onChange={(e) => setSchoolForm({ ...schoolForm, akreditasi: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Kebonjati No..."
                  value={schoolForm.alamat}
                  onChange={(e) => setSchoolForm({ ...schoolForm, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs"
                >
                  Simpan Sekolah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TAMBAH FASKES */}
      {/* =================================================================== */}
      {showHealthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-3xl p-6 max-w-lg w-full border border-outline-variant shadow-xl">
            <h3 className="text-lg font-bold text-on-surface mb-4">Tambah Fasilitas Kesehatan</h3>
            <form onSubmit={handleCreateHealth} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Faskes</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Puskesmas Pembantu Kebonjati"
                  value={healthForm.nama_faskes}
                  onChange={(e) => setHealthForm({ ...healthForm, nama_faskes: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Jenis Faskes</label>
                  <select
                    value={healthForm.jenis_faskes}
                    onChange={(e) => setHealthForm({ ...healthForm, jenis_faskes: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="Puskesmas">Puskesmas</option>
                    <option value="Pustu">Puskesmas Pembantu (Pustu)</option>
                    <option value="Klinik Pratama">Klinik Pratama</option>
                    <option value="Posyandu">Posyandu</option>
                    <option value="Apotek">Apotek</option>
                    <option value="Praktik Mandiri">Praktik Mandiri</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Pengelola</label>
                  <select
                    value={healthForm.kategori_pengelola}
                    onChange={(e) => setHealthForm({ ...healthForm, kategori_pengelola: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="Pemerintah">Pemerintah</option>
                    <option value="Swasta">Swasta</option>
                    <option value="Masyarakat">Masyarakat (Kader)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Dokter</label>
                  <input
                    type="number"
                    min="0"
                    value={healthForm.jumlah_dokter}
                    onChange={(e) => setHealthForm({ ...healthForm, jumlah_dokter: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl bg-surface-container-low border border-outline-variant"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Bidan</label>
                  <input
                    type="number"
                    min="0"
                    value={healthForm.jumlah_bidan}
                    onChange={(e) => setHealthForm({ ...healthForm, jumlah_bidan: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl bg-surface-container-low border border-outline-variant"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Perawat</label>
                  <input
                    type="number"
                    min="0"
                    value={healthForm.jumlah_perawat}
                    onChange={(e) => setHealthForm({ ...healthForm, jumlah_perawat: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl bg-surface-container-low border border-outline-variant"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Bed</label>
                  <input
                    type="number"
                    min="0"
                    value={healthForm.kapasitas_tempat_tidur}
                    onChange={(e) => setHealthForm({ ...healthForm, kapasitas_tempat_tidur: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl bg-surface-container-low border border-outline-variant"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Alamat Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Gardujati No..."
                  value={healthForm.alamat}
                  onChange={(e) => setHealthForm({ ...healthForm, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowHealthModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs"
                >
                  Simpan Faskes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: DAFTAR UMKM / ENTITAS USAHA */}
      {/* =================================================================== */}
      {showBizModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-3xl p-6 max-w-lg w-full border border-outline-variant shadow-xl">
            <h3 className="text-lg font-bold text-on-surface mb-4">Pendaftaran Usaha Warga Mandiri</h3>
            <form onSubmit={handleCreateBiz} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold block mb-1">Nama Usaha / Toko</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Warung Sembako Berkah Bu Siti"
                  value={bizForm.nama_usaha}
                  onChange={(e) => setBizForm({ ...bizForm, nama_usaha: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Kategori Usaha</label>
                  <select
                    value={bizForm.kategori_usaha}
                    onChange={(e) => setBizForm({ ...bizForm, kategori_usaha: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="Kuliner & Warung">Kuliner & Warung</option>
                    <option value="Toko Sembako / Kelontong">Toko Sembako / Kelontong</option>
                    <option value="Jasa & Servis">Jasa & Servis</option>
                    <option value="Fashion & Tekstil">Fashion & Tekstil</option>
                    <option value="Kerajinan & Industri Kreatif">Kerajinan & Industri Kreatif</option>
                    <option value="Pertanian & Peternakan Perkotaan">Pertanian / Peternakan</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold block mb-1">Skala Usaha</label>
                  <select
                    value={bizForm.skala_usaha}
                    onChange={(e) => setBizForm({ ...bizForm, skala_usaha: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="Mikro">Mikro (&lt; 50 Juta aset)</option>
                    <option value="Kecil">Kecil</option>
                    <option value="Menengah">Menengah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Jumlah Pekerja Lokal</label>
                  <input
                    type="number"
                    min="1"
                    value={bizForm.jumlah_tenaga_kerja_lokal}
                    onChange={(e) => setBizForm({ ...bizForm, jumlah_tenaga_kerja_lokal: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Omset Bulanan</label>
                  <select
                    value={bizForm.omset_bulanan_kategori}
                    onChange={(e) => setBizForm({ ...bizForm, omset_bulanan_kategori: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                  >
                    <option value="< 5 Juta">&lt; 5 Juta</option>
                    <option value="5 - 15 Juta">5 - 15 Juta</option>
                    <option value="15 - 50 Juta">15 - 50 Juta</option>
                    <option value="> 50 Juta">&gt; 50 Juta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Alamat Tempat Usaha</label>
                <input
                  type="text"
                  required
                  placeholder="Jl. Kebonjati RT..."
                  value={bizForm.alamat}
                  onChange={(e) => setBizForm({ ...bizForm, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-surface-container-low border border-outline-variant"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="panganMurahCheck"
                  checked={bizForm.apakah_toko_pangan_murah === 1}
                  onChange={(e) => setBizForm({ ...bizForm, apakah_toko_pangan_murah: e.target.checked ? 1 : 0 })}
                  className="rounded border-outline-variant text-primary"
                />
                <label htmlFor="panganMurahCheck" className="text-xs text-on-surface cursor-pointer">
                  Toko ini menyediakan sembako / pangan terjangkau untuk warga sekitar (Mitra Pangan)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBizModal(false)}
                  className="px-4 py-2 rounded-xl border border-outline-variant font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold shadow-xs"
                >
                  Daftarkan Usaha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
