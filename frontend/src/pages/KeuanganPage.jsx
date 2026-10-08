/**
 * frontend/src/pages/KeuanganPage.jsx
 * Modul Pembukuan Kas Lingkungan & Transparansi Iuran Warga RT/RW.
 * Bumi Warga - Jabar Pintar Digital
 */

import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { offlineQueue } from '../utils/offlineQueue';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  FileText, 
  Calendar, 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2, 
  Printer, 
  QrCode, 
  DollarSign, 
  PieChart, 
  ShieldCheck, 
  Eye, 
  X,
  CreditCard,
  Building,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KATEGORI_MASUK = [
  'Iuran Kebersihan & Sampah',
  'Iuran Keamanan & Ronda',
  'Iuran Kas Sukarela Warga',
  'Dana Sosial / Donasi Kematian',
  'Sumbangan Pembangunan / Fasum',
  'Lain-lain'
];

const KATEGORI_KELUAR = [
  'Honor Petugas Pengangkut Sampah',
  'Honor / Konsumsi Petugas Ronda Malam',
  'Perbaikan Lampu Jalan / Pos Ronda',
  'Kegiatan Kerja Bakti & Kebersihan',
  'Santunan Kematian & Takziah Warga',
  'Pembelian ATK & Administrasi RT/RW',
  'Lain-lain'
];

export default function KeuanganPage() {
  const { user } = useAuth();
  const isOfficer = user && ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'].includes(user.role);
  const isRT = user?.role === 'ketua_rt';

  const [activeTab, setActiveTab] = useState('kas'); // 'kas' | 'iuran' | 'transparansi'
  const [summary, setSummary] = useState({
    total_masuk: 0,
    total_keluar: 0,
    saldo_berjalan: 0,
    breakdown: []
  });
  const [transaksiList, setTransaksiList] = useState([]);
  const [iuranList, setIuranList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [filterTipe, setFilterTipe] = useState('');
  const [filterKategori, setFilterKategori] = useState('');
  const [search, setSearch] = useState('');
  const [periodeBulan, setPeriodeBulan] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Modal State
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [submittingTx, setSubmittingTx] = useState(false);
  const [txForm, setTxForm] = useState({
    tipe: 'MASUK',
    kategori: KATEGORI_MASUK[0],
    nominal: '',
    keterangan: '',
    tanggal_transaksi: new Date().toISOString().slice(0, 10),
    bukti_foto_url: ''
  });

  // Kuitansi Modal
  const [showKuitansiModal, setShowKuitansiModal] = useState(false);
  const [kuitansiData, setKuitansiData] = useState(null);
  const [loadingKuitansi, setLoadingKuitansi] = useState(false);

  // Generate Iuran Modal
  const [showGenIuranModal, setShowGenIuranModal] = useState(false);
  const [genNominal, setGenNominal] = useState(25000);
  const [generatingIuran, setGeneratingIuran] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/keuangan/summary');
      if (res.data) setSummary(res.data);
    } catch (e) {
      console.warn('Gagal memuat summary kas:', e.message);
    }
  };

  const fetchTransaksi = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterTipe) params.append('tipe', filterTipe);
      if (filterKategori) params.append('kategori', filterKategori);
      if (search) params.append('search', search);

      const res = await api.get(`/keuangan/transaksi?${params.toString()}`);
      setTransaksiList(res.data || []);
    } catch (e) {
      setError(e.message || 'Gagal memuat transaksi kas');
    } finally {
      setLoading(false);
    }
  };

  const fetchIuran = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (periodeBulan) params.append('periode_bulan', periodeBulan);

      const res = await api.get(`/keuangan/iuran?${params.toString()}`);
      setIuranList(res.data || []);
    } catch (e) {
      setError(e.message || 'Gagal memuat data iuran');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    if (activeTab === 'kas' || activeTab === 'transparansi') {
      fetchTransaksi();
    } else if (activeTab === 'iuran') {
      fetchIuran();
    }
  }, [activeTab, filterTipe, filterKategori, search, periodeBulan]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!txForm.nominal || parseFloat(txForm.nominal) <= 0) {
      alert('Nominal harus lebih besar dari 0');
      return;
    }

    try {
      setSubmittingTx(true);
      setError('');

      if (!offlineQueue.isOnline()) {
        // Mode Offline: Enqueue action
        offlineQueue.enqueue({
          endpoint: '/keuangan/transaksi',
          method: 'POST',
          payload: txForm,
          title: `Transaksi Kas ${txForm.tipe} - Rp ${parseFloat(txForm.nominal).toLocaleString('id-ID')}`
        });
        setSuccessMsg('Transaksi berhasil disimpan di antrean offline lokal! Otomatis disinkronkan saat internet kembali.');
        setShowAddTxModal(false);
        setTxForm({
          tipe: 'MASUK',
          kategori: KATEGORI_MASUK[0],
          nominal: '',
          keterangan: '',
          tanggal_transaksi: new Date().toISOString().slice(0, 10),
          bukti_foto_url: ''
        });
        return;
      }

      const res = await api.post('/keuangan/transaksi', txForm);
      setSuccessMsg(res.message || 'Transaksi kas berhasil dibukukan.');
      setShowAddTxModal(false);
      setTxForm({
        tipe: 'MASUK',
        kategori: KATEGORI_MASUK[0],
        nominal: '',
        keterangan: '',
        tanggal_transaksi: new Date().toISOString().slice(0, 10),
        bukti_foto_url: ''
      });
      fetchSummary();
      fetchTransaksi();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal mencatat transaksi kas');
    } finally {
      setSubmittingTx(false);
    }
  };

  const handleBayarIuran = async (item) => {
    if (!window.confirm(`Konfirmasi pembayaran iuran KK ${item.nama_kepala_keluarga} sebesar Rp ${Number(item.nominal_tagihan).toLocaleString('id-ID')}?`)) {
      return;
    }

    try {
      setError('');
      if (!offlineQueue.isOnline()) {
        offlineQueue.enqueue({
          endpoint: `/keuangan/iuran/${item.id}/bayar`,
          method: 'POST',
          payload: { metode_bayar: 'TUNAI_RT' },
          title: `Pelunasan Iuran KK ${item.nama_kepala_keluarga}`
        });
        setSuccessMsg('Pembayaran iuran disimpan di antrean offline!');
        return;
      }

      const res = await api.post(`/keuangan/iuran/${item.id}/bayar`, { metode_bayar: 'TUNAI_RT' });
      setSuccessMsg(res.message || 'Iuran berhasil disahkan LUNAS.');
      fetchIuran();
      fetchSummary();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal mengesahkan iuran');
    }
  };

  const handleGenerateIuran = async (e) => {
    e.preventDefault();
    try {
      setGeneratingIuran(true);
      setError('');
      const res = await api.post('/keuangan/iuran/generate', {
        periode_bulan: periodeBulan,
        nominal: genNominal
      });
      setSuccessMsg(res.message || 'Tagihan iuran bulanan berhasil digenerate.');
      setShowGenIuranModal(false);
      fetchIuran();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal membuat tagihan iuran');
    } finally {
      setGeneratingIuran(false);
    }
  };

  const openKuitansi = async (transaksiId) => {
    try {
      setLoadingKuitansi(true);
      setShowKuitansiModal(true);
      const res = await api.get(`/keuangan/transaksi/${transaksiId}/kuitansi`);
      setKuitansiData(res.data);
    } catch (err) {
      setError('Gagal memuat kuitansi: ' + err.message);
    } finally {
      setLoadingKuitansi(false);
    }
  };

  // Kalkulasi Iuran Metrics
  const totalKK = iuranList.length;
  const lunasCount = iuranList.filter((i) => i.status_bayar === 'LUNAS').length;
  const persenLunas = totalKK > 0 ? Math.round((lunasCount / totalKK) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold mb-2 border border-sky-200">
            <ShieldCheck size={14} /> Akuntabilitas Kas Lingkungan Terverifikasi
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface flex items-center gap-3">
            <Wallet className="text-primary" size={32} />
            Pembukuan Kas & Transparansi Iuran
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Pengelolaan kas masuk, kas keluar, dan partisipasi iuran lingkungan RT/RW secara transparan & akuntabel.
          </p>
        </div>

        {isOfficer && (
          <div className="flex flex-wrap items-center gap-2">
            {isRT && (
              <button
                onClick={() => setShowGenIuranModal(true)}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-xl font-semibold shadow-sm hover:bg-sky-100 transition-colors text-xs"
              >
                <Calendar size={15} /> Buat Tagihan Iuran Bulanan
              </button>
            )}
            <button
              onClick={() => setShowAddTxModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-colors text-xs"
            >
              <Plus size={16} /> Catat Kas Masuk / Keluar
            </button>
          </div>
        )}
      </header>

      {/* ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs font-medium"
          >
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-3 text-xs font-medium"
          >
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* SALDO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* SALDO BERJALAN */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Saldo Kas Berjalan</span>
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Wallet size={20} />
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-on-surface mt-2">
            Rp {Number(summary.saldo_berjalan || 0).toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            Dana Kas Aktif Siap Pakai
          </p>
        </div>

        {/* TOTAL PEMASUKAN */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Total Penerimaan Kas</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <ArrowDownLeft size={20} />
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-emerald-600 mt-2">
            Rp {Number(summary.total_masuk || 0).toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-on-surface-variant mt-1">
            Akumulasi Iuran & Sumbangan Warga
          </p>
        </div>

        {/* TOTAL PENGELUARAN */}
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">Total Pengeluaran Kas</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <h3 className="text-2xl lg:text-3xl font-extrabold text-rose-600 mt-2">
            Rp {Number(summary.total_keluar || 0).toLocaleString('id-ID')}
          </h3>
          <p className="text-[11px] text-on-surface-variant mt-1">
            Operasional, Ronda & Kebersihan
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-outline-variant bg-surface-container-lowest rounded-t-xl overflow-x-auto p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('kas')}
          className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'kas'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <FileText size={15} />
          <span>Buku Kas Lingkungan ({transaksiList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('iuran')}
          className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'iuran'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <CreditCard size={15} />
          <span>Iuran Warga Bulanan ({totalKK > 0 ? `${lunasCount}/${totalKK} Lunas` : 'Iuran'})</span>
        </button>

        <button
          onClick={() => setActiveTab('transparansi')}
          className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'transparansi'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <PieChart size={15} />
          <span>Laporan Transparansi Warga</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: BUKU KAS                                                       */}
      {/* ===================================================================== */}
      {activeTab === 'kas' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari transaksi atau nomor kas..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={15} className="text-on-surface-variant" />
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value)}
                className="px-3 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Semua Tipe Kas</option>
                <option value="MASUK">Pemasukan (Kas Masuk)</option>
                <option value="KELUAR">Pengeluaran (Kas Keluar)</option>
              </select>
            </div>
          </div>

          {/* TABEL TRANSAKSI KAS */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold">
                  <tr>
                    <th className="p-3.5">Tanggal / No. Kas</th>
                    <th className="p-3.5">Tipe & Kategori</th>
                    <th className="p-3.5">Keterangan Penggunaan</th>
                    <th className="p-3.5 text-right">Nominal</th>
                    <th className="p-3.5">Pencatat</th>
                    <th className="p-3.5 text-center">Aksi / Bukti</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                        Memuat data buku kas...
                      </td>
                    </tr>
                  ) : transaksiList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                        Belum ada transaksi kas yang dicatat.
                      </td>
                    </tr>
                  ) : (
                    transaksiList.map((tx) => (
                      <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="p-3.5 font-mono whitespace-nowrap">
                          <div className="font-bold text-on-surface">{new Date(tx.tanggal_transaksi).toLocaleDateString('id-ID')}</div>
                          <div className="text-[10px] text-on-surface-variant">{tx.nomor_transaksi}</div>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          {tx.tipe === 'MASUK' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowDownLeft size={13} /> Kas Masuk
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <ArrowUpRight size={13} /> Kas Keluar
                            </span>
                          )}
                          <div className="text-[11px] font-medium text-on-surface mt-1">{tx.kategori}</div>
                        </td>
                        <td className="p-3.5 text-on-surface-variant max-w-sm">
                          <p className="line-clamp-2 text-on-surface font-medium">{tx.keterangan}</p>
                          <span className="text-[10px] text-sky-800 font-semibold bg-sky-50 px-1.5 py-0.2 rounded">
                            RT {tx.rt} / RW {tx.rw}
                          </span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap font-mono font-bold">
                          <span className={tx.tipe === 'MASUK' ? 'text-emerald-700 text-sm' : 'text-rose-700 text-sm'}>
                            {tx.tipe === 'MASUK' ? '+' : '-'} Rp {Number(tx.nominal).toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-[11px] text-on-surface-variant">
                          <div className="font-semibold text-on-surface">{tx.nama_pencatat || 'Pengurus RT'}</div>
                          <div className="text-[10px]">{tx.role_pencatat ? tx.role_pencatat.replace('_', ' ') : 'Aparat'}</div>
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {tx.bukti_foto_url && (
                              <a
                                href={tx.bukti_foto_url}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-surface-container border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors"
                                title="Lihat Foto Nota / Kuitansi"
                              >
                                <Eye size={13} />
                              </a>
                            )}
                            <button
                              onClick={() => openKuitansi(tx.id)}
                              className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-lg hover:bg-sky-100 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                              title="Cetak Kuitansi Resmi"
                            >
                              <Printer size={12} /> Kuitansi
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: IURAN WARGA                                                    */}
      {/* ===================================================================== */}
      {activeTab === 'iuran' && (
        <div className="space-y-4">
          {/* HEADER PERIODE & STATISTIK IURAN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center justify-between">
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium">Periode Bulan</span>
                <input
                  type="month"
                  value={periodeBulan}
                  onChange={(e) => setPeriodeBulan(e.target.value)}
                  className="mt-1 block font-bold text-sm bg-surface-container-low border border-outline-variant rounded px-2 py-1"
                />
              </div>
              <Calendar size={24} className="text-primary" />
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center justify-between">
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium">Kepatuhan Iuran KK</span>
                <h4 className="text-xl font-bold text-emerald-700 mt-1">{persenLunas}% Lunas</h4>
                <p className="text-[10px] text-on-surface-variant">{lunasCount} dari {totalKK} KK terdaftar</p>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center justify-between">
              <div>
                <span className="text-[11px] text-on-surface-variant font-medium">Belum Melunasi</span>
                <h4 className="text-xl font-bold text-amber-700 mt-1">{totalKK - lunasCount} KK</h4>
                <p className="text-[10px] text-on-surface-variant">Menunggu penyetoran</p>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* TABEL IURAN WARGA */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold">
                  <tr>
                    <th className="p-3.5">Kepala Keluarga</th>
                    <th className="p-3.5">No. Kartu Keluarga</th>
                    <th className="p-3.5">Wilayah</th>
                    <th className="p-3.5 text-right">Tagihan Iuran</th>
                    <th className="p-3.5 text-center">Status Iuran</th>
                    {isOfficer && <th className="p-3.5 text-center">Aksi Petugas RT</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={isOfficer ? 6 : 5} className="p-8 text-center text-on-surface-variant">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                        Memuat data iuran warga...
                      </td>
                    </tr>
                  ) : iuranList.length === 0 ? (
                    <tr>
                      <td colSpan={isOfficer ? 6 : 5} className="p-8 text-center text-on-surface-variant">
                        Belum ada tagihan iuran untuk periode {periodeBulan}. Silakan klik &ldquo;Buat Tagihan Iuran Bulanan&rdquo;.
                      </td>
                    </tr>
                  ) : (
                    iuranList.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="p-3.5 font-semibold text-on-surface">
                          <div className="text-sm font-bold">{item.nama_kepala_keluarga}</div>
                          {item.tanggal_bayar && (
                            <div className="text-[10px] text-emerald-700">
                              Lunas: {new Date(item.tanggal_bayar).toLocaleDateString('id-ID')}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-on-surface-variant">{item.no_kk}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            RT {item.rt} / RW {item.rw}
                          </span>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-on-surface">
                          Rp {Number(item.nominal_tagihan).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {item.status_bayar === 'LUNAS' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={13} className="text-emerald-600" /> LUNAS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock size={13} className="text-amber-600" /> Belum Bayar
                            </span>
                          )}
                        </td>
                        {isOfficer && (
                          <td className="p-3.5 text-center whitespace-nowrap">
                            {item.status_bayar !== 'LUNAS' ? (
                              <button
                                onClick={() => handleBayarIuran(item)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1 mx-auto"
                              >
                                <CheckCircle2 size={13} /> Terima Bayar
                              </button>
                            ) : (
                              <span className="text-[11px] text-on-surface-variant italic">
                                Diterima: {item.nama_penerima || 'Pengurus RT'}
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: TRANSPARANSI & LAPORAN PUBLIK                                  */}
      {/* ===================================================================== */}
      {activeTab === 'transparansi' && (
        <div className="space-y-6">
          <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-5">
            <h4 className="text-sm font-bold text-sky-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-sky-700" />
              Prinsip Transparansi Pengelolaan Kas Warga Bumi Warga
            </h4>
            <p className="text-xs text-sky-900/80 mt-1 leading-relaxed">
              Seluruh dana iuran dan sumbangan warga dibukukan secara digital tanpa manipulasi. Setiap warga berhak memeriksa realisasi alokasi kas lingkungan secara real-time guna mewujudkan tata kelola lingkungan rukun tetangga yang bersih, amanah, dan terpercaya.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* BREAKDOWN PENGELUARAN */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <ArrowUpRight size={18} className="text-rose-600" />
                Rincian Realisasi Kas Keluar
              </h4>
              <div className="space-y-3">
                {summary.breakdown && summary.breakdown.filter((b) => b.tipe === 'KELUAR').length > 0 ? (
                  summary.breakdown
                    .filter((b) => b.tipe === 'KELUAR')
                    .map((item, idx) => {
                      const persen = summary.total_keluar > 0 ? Math.round((Number(item.total_nominal) / summary.total_keluar) * 100) : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-on-surface">{item.kategori}</span>
                            <span className="text-rose-700 font-mono">
                              Rp {Number(item.total_nominal).toLocaleString('id-ID')} ({persen}%)
                            </span>
                          </div>
                          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${persen}%` }} />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-xs text-on-surface-variant italic">Belum ada data pengeluaran kas.</p>
                )}
              </div>
            </div>

            {/* BREAKDOWN PENERIMAAN */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <ArrowDownLeft size={18} className="text-emerald-600" />
                Rincian Sumber Penerimaan Kas Masuk
              </h4>
              <div className="space-y-3">
                {summary.breakdown && summary.breakdown.filter((b) => b.tipe === 'MASUK').length > 0 ? (
                  summary.breakdown
                    .filter((b) => b.tipe === 'MASUK')
                    .map((item, idx) => {
                      const persen = summary.total_masuk > 0 ? Math.round((Number(item.total_nominal) / summary.total_masuk) * 100) : 0;
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-on-surface">{item.kategori}</span>
                            <span className="text-emerald-700 font-mono">
                              Rp {Number(item.total_nominal).toLocaleString('id-ID')} ({persen}%)
                            </span>
                          </div>
                          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${persen}%` }} />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <p className="text-xs text-on-surface-variant italic">Belum ada data penerimaan kas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL CATAT TRANSAKSI KAS                                             */}
      {/* ===================================================================== */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-outline-variant shadow-xl my-8 text-xs space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Wallet className="text-primary" size={20} />
                Pencatatan Transaksi Kas Baru
              </h3>
              <button onClick={() => setShowAddTxModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Tipe Transaksi:</label>
                  <select
                    value={txForm.tipe}
                    onChange={(e) => {
                      const t = e.target.value;
                      setTxForm({
                        ...txForm,
                        tipe: t,
                        kategori: t === 'MASUK' ? KATEGORI_MASUK[0] : KATEGORI_KELUAR[0]
                      });
                    }}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="MASUK">Pemasukan (Kas Masuk)</option>
                    <option value="KELUAR">Pengeluaran (Kas Keluar)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Kategori:</label>
                  <select
                    value={txForm.kategori}
                    onChange={(e) => setTxForm({ ...txForm, kategori: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {(txForm.tipe === 'MASUK' ? KATEGORI_MASUK : KATEGORI_KELUAR).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Nominal (Rp):</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={txForm.nominal}
                    onChange={(e) => setTxForm({ ...txForm, nominal: e.target.value })}
                    placeholder="Contoh: 150000"
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Tanggal Transaksi:</label>
                  <input
                    type="date"
                    required
                    value={txForm.tanggal_transaksi}
                    onChange={(e) => setTxForm({ ...txForm, tanggal_transaksi: e.target.value })}
                    className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Keterangan / Peruntukan Dana:</label>
                <textarea
                  rows={2}
                  required
                  value={txForm.keterangan}
                  onChange={(e) => setTxForm({ ...txForm, keterangan: e.target.value })}
                  placeholder="Uraikan detail belanja atau sumber kas..."
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">URL / Bukti Foto Nota (Opsional):</label>
                <input
                  type="text"
                  value={txForm.bukti_foto_url}
                  onChange={(e) => setTxForm({ ...txForm, bukti_foto_url: e.target.value })}
                  placeholder="https://... (Foto kuitansi atau struk nota)"
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingTx}
                  className="px-5 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {submittingTx ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Simpan Transaksi Kas
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL GENERATE TAGIHAN BULANAN                                        */}
      {/* ===================================================================== */}
      {showGenIuranModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 border border-outline-variant shadow-xl my-8 text-xs space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Calendar className="text-sky-600" size={20} />
                Generate Tagihan Iuran Bulanan
              </h3>
              <button onClick={() => setShowGenIuranModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>

            <p className="text-on-surface-variant">
              Fitur ini akan secara otomatis menerbitkan tagihan iuran untuk seluruh Kepala Keluarga (KK) yang terdaftar di wilayah RT Anda.
            </p>

            <form onSubmit={handleGenerateIuran} className="space-y-3">
              <div>
                <label className="block font-bold text-on-surface mb-1">Periode Bulan Tagihan:</label>
                <input
                  type="month"
                  required
                  value={periodeBulan}
                  onChange={(e) => setPeriodeBulan(e.target.value)}
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Besaran Iuran per KK (Rp):</label>
                <input
                  type="number"
                  required
                  min="5000"
                  step="5000"
                  value={genNominal}
                  onChange={(e) => setGenNominal(e.target.value)}
                  className="w-full p-2.5 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowGenIuranModal(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface rounded-xl hover:bg-surface-container"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={generatingIuran}
                  className="px-5 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {generatingIuran ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                  Terbitkan Tagihan Sekarang
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL CETAK KUITANSI KAS RESMI                                        */}
      {/* ===================================================================== */}
      {showKuitansiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-8 shadow-2xl my-8 border border-slate-300 print:shadow-none print:border-none print:m-0 print:p-4 text-xs"
          >
            {loadingKuitansi ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 size={36} className="animate-spin text-primary" />
                <p className="text-xs text-slate-600 font-medium">Menyusun format kuitansi resmi...</p>
              </div>
            ) : kuitansiData ? (
              <div>
                {/* KOP KUITANSI */}
                <div className="text-center border-b-2 border-double border-slate-900 pb-3 mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-700">
                    {kuitansiData.kop?.instansi || 'PENGURUS RUKUN TETANGGA'}
                  </h3>
                  <h2 className="text-base font-extrabold uppercase tracking-wide">
                    {kuitansiData.kop?.wilayah || 'RT 001 / RW 001 &bull; KELURAHAN KEBONJATI'}
                  </h2>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {kuitansiData.kop?.kota || 'Kota Sukabumi, Jawa Barat'} &bull; Portal: bumiwarga.online
                  </p>
                </div>

                {/* JUDUL */}
                <div className="text-center mb-4">
                  <h4 className="text-sm font-extrabold underline uppercase tracking-wider text-slate-900">
                    TANDA TERIMA / KUITANSI KAS RESMI
                  </h4>
                  <p className="text-[11px] font-mono font-semibold text-slate-700 mt-0.5">
                    Nomor: {kuitansiData.nomor_kuitansi}
                  </p>
                </div>

                {/* RINCIAN */}
                <div className="border border-slate-300 rounded-lg p-3.5 mb-4 bg-slate-50 text-xs space-y-2">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-600">Telah Terima Dari / Untuk</span>
                    <span className="col-span-2 font-bold text-slate-900">: Kas {kuitansiData.transaksi?.kategori}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-600">Sejumlah Uang</span>
                    <span className="col-span-2 font-mono font-extrabold text-slate-900 text-sm">
                      : Rp {Number(kuitansiData.transaksi?.nominal).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-600">Untuk Keperluan</span>
                    <span className="col-span-2 text-slate-800 italic">: &ldquo;{kuitansiData.transaksi?.keterangan}&rdquo;</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-600">Tanggal Transaksi</span>
                    <span className="col-span-2 text-slate-800">: {kuitansiData.tanggal_resmi}</span>
                  </div>
                </div>

                {/* TANDA TANGAN & PENGESAHAN */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center text-xs">
                  <div>
                    <p className="text-slate-600 font-medium">Validasi Sistem SPBE</p>
                    <div className="h-16 flex items-center justify-center">
                      <div className="p-1 border border-slate-300 rounded bg-slate-50">
                        <QrCode size={36} className="text-slate-800" />
                      </div>
                    </div>
                    <p className="text-[10px] font-mono text-slate-500">Bumi Warga Verified</p>
                  </div>

                  <div>
                    <p className="text-slate-600 font-medium">Pengurus Kas Wilayah</p>
                    <div className="h-16 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400 italic">( Tanda Tangan )</span>
                    </div>
                    <p className="font-bold text-slate-900 underline">{kuitansiData.transaksi?.nama_pencatat || 'Bendahara / Ketua RT'}</p>
                    <p className="text-[10px] text-slate-500">RT {kuitansiData.transaksi?.rt} / RW {kuitansiData.transaksi?.rw}</p>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                  <span>Dokumen Bukti Kas Sah &bull; Jabar Pintar Digital</span>
                  <span>{kuitansiData.spbe_code}</span>
                </div>
              </div>
            ) : null}

            {/* BUTTONS (HIDDEN IN PRINT) */}
            <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setShowKuitansiModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors text-xs"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors text-xs flex items-center gap-2 shadow-sm"
              >
                <Printer size={15} /> Cetak Kuitansi / PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

