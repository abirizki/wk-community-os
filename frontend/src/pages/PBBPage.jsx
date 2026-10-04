import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Upload,
  Download,
  Printer,
  QrCode,
  Building2,
  RefreshCw,
  Loader2,
  ChevronRight,
  TrendingUp,
  Landmark,
  X,
  ExternalLink,
  Users,
  Eye,
  Check
} from 'lucide-react';

export default function PBBPage() {
  const { user } = useAuth();
  const normalizedRole = user?.role === 'admin' ? 'admin_kelurahan' : (user?.role || 'warga');
  const isKelurahan = ['superadmin', 'admin_kelurahan', 'admin', 'lurah', 'camat', 'walikota'].includes(normalizedRole);
  const isRW = ['ketua_rw', 'admin_rw'].includes(normalizedRole);
  const isRT = normalizedRole === 'ketua_rt';
  const canMonitor = isKelurahan || isRW || isRT;

  // Tabs
  const [activeTab, setActiveTab] = useState(canMonitor ? 'monitoring' : 'warga'); // 'warga' | 'monitoring' | 'dhkp'
  const [tahun, setTahun] = useState(2026);

  // States
  const [myPbb, setMyPbb] = useState([]);
  const [monitoringData, setMonitoringData] = useState({ items: [], total: 0 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filter States for Monitoring
  const [selectedRw, setSelectedRw] = useState(isRT || isRW ? (user?.rw || '001') : '');
  const [selectedRt, setSelectedRt] = useState(isRT ? (user?.rt || '001') : '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [selectedSppt, setSelectedSppt] = useState(null);
  const [showSpptModal, setShowSpptModal] = useState(false);
  const [payModalItem, setPayModalItem] = useState(null);
  const [payMethod, setPayMethod] = useState('QRIS Dinamis');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);

  // DHKP Import State
  const [dhkpJsonInput, setDhkpJsonInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Format IDR Currency
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(val) || 0);
  };

  // Fetch Data Function
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Tagihan Warga Sendiri
      const meRes = await api.get('/pbb/me');
      setMyPbb(meRes.data || []);

      // 2. Jika aparatur RT/RW/Kelurahan, ambil monitoring dan stats
      if (canMonitor) {
        const statsRes = await api.get(`/pbb/stats?tahun=${tahun}`);
        setStats(statsRes.data || null);

        const params = new URLSearchParams({
          tahun,
          status: statusFilter,
          search: searchQuery,
          limit: 100
        });
        if (selectedRw) params.append('rw', selectedRw);
        if (selectedRt) params.append('rt', selectedRt);

        const listRes = await api.get(`/pbb/monitoring?${params.toString()}`);
        setMonitoringData(listRes.data || { items: [], total: 0 });
      }
    } catch (err) {
      console.error('Error loading PBB data:', err);
      setError(err.message || 'Gagal mengambil data PBB');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tahun, selectedRw, selectedRt, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Handle Buka E-SPPT
  const handleOpenSppt = async (item) => {
    try {
      const res = await api.get(`/pbb/sppt/${item.nop}/${item.tahun}`);
      setSelectedSppt(res.data);
      setShowSpptModal(true);
    } catch (err) {
      alert('Gagal memuat e-SPPT: ' + err.message);
    }
  };

  // Handle Bayar Tagihan
  const handleOpenPay = (item) => {
    setPayModalItem(item);
    setPaymentSuccessData(null);
  };

  const handleExecutePayment = async () => {
    if (!payModalItem) return;
    setIsProcessingPayment(true);
    try {
      const res = await api.put('/pbb/pay', {
        nop: payModalItem.nop,
        tahun: payModalItem.tahun,
        metode_bayar: payMethod,
        nomor_transaksi_bank: `${payMethod.startsWith('QRIS') ? 'QRIS' : 'BJB'}-${Date.now().toString().slice(-8)}`
      });
      setPaymentSuccessData(res.data);
      await loadData();
    } catch (err) {
      alert('Pembayaran gagal: ' + err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Template Pesan WhatsApp Pengingat Santun
  const handleSendWaReminder = (item) => {
    const namaWp = item.nama_wajib_pajak || 'Bpk/Ibu Warga';
    const nop = item.nop;
    const nominal = formatIDR(item.nominal);
    const alamat = item.alamat_objek_pajak || `RT ${item.rt}/RW ${item.rw}`;
    const thn = item.tahun;
    const jatuhTempo = new Date(item.tanggal_jatuh_tempo).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const msg = `Sampurasun Bpk/Ibu ${namaWp},\n\nSemoga senantiasa sehat walafiat. Kami dari Pengurus RT ${item.rt}/RW ${item.rw} Kelurahan Kebonjati mengingatkan perihal kewajiban PBB-P2 Tahun ${thn} untuk objek pajak:\n• NOP: ${nop}\n• Alamat: ${alamat}\n• Nominal: ${nominal}\n• Jatuh Tempo: ${jatuhTempo}\n\nPembayaran dapat dilakukan mandiri melalui aplikasi Bumi Warga, Bank BJB (Mobile/ATM), Indomaret, Alfamart, QRIS resmi, atau melalui loket kelurahan.\n\nHatur nuhun atas partisipasi aktif dalam pembangunan Kota Sukabumi tercinta. 🙏`;

    const targetPhone = (item.no_wa_warga || '').replace(/[^0-9]/g, '');
    const phoneParam = targetPhone ? (targetPhone.startsWith('0') ? '62' + targetPhone.slice(1) : targetPhone) : '';
    const url = `https://wa.me/${phoneParam}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Preset Template DHKP untuk Uji Kelurahan
  const handleLoadSampleDhkp = () => {
    const sample = [
      {
        nop: '32.72.030.001.001-0088.0',
        nik_warga: '3272030103810001',
        nama_wajib_pajak: 'H. Suherman Subrata',
        alamat_objek_pajak: 'Jl. Surya Kencana No. 99 RT 001/RW 001',
        rt: '001',
        rw: '001',
        kelurahan: 'Kebonjati',
        kecamatan: 'Cikole',
        kota: 'Kota Sukabumi',
        tahun: 2026,
        luas_bumi: 140,
        luas_bangunan: 100,
        njop_bumi: 210000000,
        njop_bangunan: 150000000,
        nominal: 360000,
        denda: 0,
        status_pembayaran: 'UNPAID',
        tanggal_jatuh_tempo: '2026-09-30'
      },
      {
        nop: '32.72.030.001.002-0044.0',
        nik_warga: '3272030105900008',
        nama_wajib_pajak: 'Ibu Hj. Siti Maemunah',
        alamat_objek_pajak: 'Jl. Dahlia No. 12 RT 002/RW 001',
        rt: '002',
        rw: '001',
        kelurahan: 'Kebonjati',
        kecamatan: 'Cikole',
        kota: 'Kota Sukabumi',
        tahun: 2026,
        luas_bumi: 110,
        luas_bangunan: 80,
        njop_bumi: 165000000,
        njop_bangunan: 120000000,
        nominal: 285000,
        denda: 0,
        status_pembayaran: 'PAID',
        tanggal_jatuh_tempo: '2026-09-30'
      }
    ];
    setDhkpJsonInput(JSON.stringify(sample, null, 2));
  };

  const handleImportDhkp = async (e) => {
    e.preventDefault();
    if (!dhkpJsonInput.trim()) {
      alert('Masukkan data format JSON DHKP');
      return;
    }
    setIsImporting(true);
    setImportResult(null);
    try {
      const parsed = JSON.parse(dhkpJsonInput);
      const res = await api.post('/pbb/import', { records: parsed });
      setImportResult(res.data);
      await loadData();
      alert('Berhasil mengimpor data acuan DHKP!');
    } catch (err) {
      alert('Gagal mengimpor DHKP: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* HEADER SUPER APP */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5 backdrop-blur-sm">
                <Landmark size={14} /> Bapenda Kota Sukabumi • Kelurahan Kebonjati
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/90">
                PBB-P2 Tahun {tahun}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Pajak Bumi & Bangunan (PBB) Terpadu
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base mt-1 max-w-2xl">
              Sistem rekonsiliasi penerimaan daerah, pemantauan kepatuhan wajib pajak kewilayahan RT/RW, dan E-SPPT digital resmi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              aria-label="Pilih Tahun Pajak PBB"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold rounded-xl px-3.5 py-2.5 backdrop-blur-md outline-none transition cursor-pointer"
            >
              <option value={2026} className="text-gray-900">Tahun Pajak 2026</option>
              <option value={2025} className="text-gray-900">Tahun Pajak 2025</option>
              <option value={2024} className="text-gray-900">Tahun Pajak 2024</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition backdrop-blur-md border border-white/20 disabled:opacity-50"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              <span>Sinkron</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI STATS CARDS (Jika Memiliki Hak Akses RT/RW/Kelurahan) */}
      {canMonitor && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Ketetapan</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Landmark size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">{formatIDR(stats.summary.total_target_nominal)}</div>
              <p className="text-xs text-slate-500 mt-1">
                Dari {stats.summary.total_objek_pajak} NOP objek pajak terdaftar
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Realisasi Penerimaan</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-emerald-600">{formatIDR(stats.summary.total_lunas_nominal)}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {stats.summary.persentase_realisasi}% Tercapai
                </span>
                <span className="text-xs text-slate-500">{stats.summary.total_lunas_count} Objek Lunas</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Piutang Terutang</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-amber-600">{formatIDR(stats.summary.total_terutang_nominal)}</div>
              <p className="text-xs text-slate-500 mt-1">
                {stats.summary.total_terutang_count} Wajib Pajak belum melunasi
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Indeks Kepatuhan</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-900">
                {stats.summary.persentase_realisasi}%
              </div>
              {/* Progress Mini Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, Number(stats.summary.persentase_realisasi))}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Kepatuhan warga Kebonjati {tahun}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('warga')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            activeTab === 'warga'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText size={17} />
          <span>E-SPPT & Tagihan Saya ({myPbb.length})</span>
        </button>

        {canMonitor && (
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'monitoring'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users size={17} />
            <span>Monitoring Wilayah RT/RW</span>
          </button>
        )}

        {isKelurahan && (
          <button
            onClick={() => setActiveTab('dhkp')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'dhkp'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Upload size={17} />
            <span>Import & Rekonsiliasi DHKP</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: E-SPPT & TAGIHAN SAYA (WARGA MANDIRI) */}
      {/* ============================================================== */}
      {activeTab === 'warga' && (
        <div className="space-y-6">
          {loading && myPbb.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 flex flex-col items-center justify-center gap-3">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
              <p className="text-sm font-medium text-slate-600">Memeriksa pangkalan data PBB Anda...</p>
            </div>
          ) : myPbb.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <FileText size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Tidak Ada Tagihan PBB</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                Tidak ditemukan objek pajak PBB yang terdaftar atas NIK Anda untuk tahun {tahun}. Hubungi operator kelurahan jika Anda memiliki sertifikat tanah/bangunan yang belum terdata.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPbb.map((item) => {
                const isPaid = item.status_pembayaran === 'PAID';
                return (
                  <div
                    key={`${item.nop}-${item.tahun}`}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top Ribbon */}
                    <div className="p-6 border-b border-slate-100">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md inline-flex items-center gap-1.5">
                            <Landmark size={13} /> PBB-P2 Tahun {item.tahun}
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-2 font-mono tracking-wide">
                            {item.nop}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.nama_wajib_pajak || 'Wajib Pajak'}
                          </p>
                        </div>

                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 size={14} /> LUNAS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <Clock size={14} /> BELUM BAYAR
                          </span>
                        )}
                      </div>

                      {/* Objek Details */}
                      <div className="mt-4 bg-slate-50 rounded-xl p-3.5 space-y-2 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Letak Objek Pajak:</span>
                          <span className="font-medium text-slate-800 text-right">{item.alamat_objek_pajak || `RT ${item.rt}/RW ${item.rw} Kebonjati`}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Luas Bumi / Bangunan:</span>
                          <span className="font-medium text-slate-800">{item.luas_bumi || 0} m² / {item.luas_bangunan || 0} m²</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Jatuh Tempo:</span>
                          <span className="font-semibold text-rose-600">
                            {new Date(item.tanggal_jatuh_tempo).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        {isPaid && item.tanggal_bayar && (
                          <div className="flex justify-between border-t border-slate-200/60 pt-2 text-emerald-700">
                            <span>Dibayar Pada:</span>
                            <span className="font-semibold">
                              {new Date(item.tanggal_bayar).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })} via {item.metode_bayar || 'QRIS'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Area */}
                    <div className="p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Ketetapan PBB</span>
                        <div className="text-xl font-extrabold text-slate-900">
                          {formatIDR(item.nominal)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleOpenSppt(item)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition"
                        >
                          <Eye size={14} /> E-SPPT
                        </button>

                        {!isPaid ? (
                          <button
                            onClick={() => handleOpenPay(item)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
                          >
                            <CreditCard size={14} /> Bayar Sekarang
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenSppt(item)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200"
                          >
                            <Download size={14} /> Bukti Lunas
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MONITORING WILAYAH RT/RW (HEATMAP & DAFTAR PENUNGGAK) */}
      {/* ============================================================== */}
      {activeTab === 'monitoring' && canMonitor && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Filter RW */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Wilayah RW
                  </label>
                  <select
                    value={selectedRw}
                    disabled={isRT || isRW}
                    onChange={(e) => setSelectedRw(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                  >
                    <option value="">Semua RW</option>
                    <option value="001">RW 001</option>
                    <option value="002">RW 002</option>
                  </select>
                </div>

                {/* Filter RT */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Wilayah RT
                  </label>
                  <select
                    value={selectedRt}
                    disabled={isRT}
                    onChange={(e) => setSelectedRt(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                  >
                    <option value="">Semua RT</option>
                    <option value="001">RT 001</option>
                    <option value="002">RT 002</option>
                    <option value="003">RT 003</option>
                    <option value="004">RT 004</option>
                    <option value="005">RT 005</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Status Bayar
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="UNPAID">Belum Lunas (Menunggak)</option>
                    <option value="PAID">Sudah Lunas</option>
                  </select>
                </div>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari NOP / Nama / Alamat..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56 sm:w-64"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Cari
                </button>
              </form>
            </div>

            {/* Heatmap Progres RT/RW Mini */}
            {stats && stats.rt_breakdown && stats.rt_breakdown.length > 0 && (
              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Peta Kepatuhan Realisasi per RT:</span>
                  <span className="text-[11px] text-slate-400">Target Ketetapan vs Penerimaan Masuk</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {stats.rt_breakdown.map((rtItem) => (
                    <div
                      key={`rt-${rtItem.rt}`}
                      className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200/70 transition"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">RT {rtItem.rt}</span>
                        <span className={`font-extrabold ${rtItem.persentase >= 75 ? 'text-emerald-600' : rtItem.persentase >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                          {rtItem.persentase}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full ${rtItem.persentase >= 75 ? 'bg-emerald-500' : rtItem.persentase >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, rtItem.persentase)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>{rtItem.lunas_count} Lunas</span>
                        <span>{rtItem.belum_lunas_count} Tertunda</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tabel Objek Pajak Wilayah */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Daftar Objek Pajak Wilayah</h3>
                <p className="text-xs text-slate-500">
                  Ditemukan {monitoringData.total} objek pajak PBB terdaftar
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg font-medium">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Kerahasiaan Data Terlindungi UU PDP
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 size={28} className="animate-spin text-emerald-600" />
                <span className="text-xs text-slate-500">Memuat data monitoring...</span>
              </div>
            ) : monitoringData.items.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                Tidak ada data objek pajak yang sesuai kriteria pencarian.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                    <tr>
                      <th className="px-4 py-3.5">NOP & Objek Pajak</th>
                      <th className="px-4 py-3.5">Nama Wajib Pajak</th>
                      <th className="px-4 py-3.5">Wilayah</th>
                      <th className="px-4 py-3.5">Ketetapan</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-4 py-3.5 text-center">Aksi / Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monitoringData.items.map((row) => {
                      const isPaid = row.status_pembayaran === 'PAID';
                      return (
                        <tr key={`${row.nop}-${row.tahun}`} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3.5">
                            <div className="font-mono font-bold text-slate-900">{row.nop}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {row.alamat_objek_pajak || `Kebonjati`}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800">{row.nama_wajib_pajak || 'Wajib Pajak'}</div>
                            <div className="text-[10px] text-slate-400">NIK: {row.nik_warga ? `${row.nik_warga.slice(0, 6)}******${row.nik_warga.slice(-4)}` : '-'}</div>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-800">RT {row.rt} / RW {row.rw}</span>
                          </td>
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="font-bold text-slate-900">{formatIDR(row.nominal)}</div>
                            <div className="text-[10px] text-slate-400">Tahun {row.tahun}</div>
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                <Check size={12} /> Lunas
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                                <Clock size={12} /> Menunggak
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenSppt(row)}
                                title="Lihat E-SPPT"
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                              >
                                <Eye size={15} />
                              </button>

                              {!isPaid ? (
                                <>
                                  <button
                                    onClick={() => handleSendWaReminder(row)}
                                    title="Kirim Pengingat Santun via WhatsApp"
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                                  >
                                    <Send size={12} />
                                    <span>Ingatkan</span>
                                  </button>

                                  <button
                                    onClick={() => handleOpenPay(row)}
                                    title="Catat Pembayaran Titipan Warga"
                                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition"
                                  >
                                    <CreditCard size={15} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Terverifikasi
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: IMPORT & REKONSILIASI DHKP (KELURAHAN ONLY) */}
      {/* ============================================================== */}
      {activeTab === 'dhkp' && isKelurahan && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="max-w-2xl mb-6">
              <h2 className="text-lg font-bold text-slate-900">Import Acuan DHKP Bapenda Kota Sukabumi</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Unggah pangkalan data Daftar Himpunan Ketetapan Pajak (DHKP) resmi dari Bapenda untuk menyinkronkan data objek pajak, ketetapan nominal, dan status pembayaran tahunan se-Kelurahan Kebonjati.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Data JSON Acuan DHKP:</span>
                <button
                  type="button"
                  onClick={handleLoadSampleDhkp}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline"
                >
                  Gunakan Contoh Data Uji Coba (2 Objek)
                </button>
              </div>

              <textarea
                rows={10}
                value={dhkpJsonInput}
                onChange={(e) => setDhkpJsonInput(e.target.value)}
                placeholder='[{"nop": "32.72.030.001.001-0088.0", "nama_wajib_pajak": "...", "tahun": 2026, "nominal": 350000, ...}]'
                className="w-full p-4 font-mono text-xs bg-slate-900 text-emerald-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleImportDhkp}
                  disabled={isImporting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {isImporting ? (
                    <><Loader2 size={16} className="animate-spin" /> Memproses Sinkronisasi...</>
                  ) : (
                    <><Upload size={16} /> Jalankan Sinkronisasi DHKP</>
                  )}
                </button>
              </div>

              {importResult && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-bold">Sinkronisasi Berhasil</h4>
                    <p className="mt-0.5">{importResult.message || 'Data DHKP telah berhasil diperbarui ke database.'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL E-SPPT DIGITAL RESMI */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showSpptModal && selectedSppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200"
            >
              {/* Header SPPT */}
              <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Landmark size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">E-SPPT Pajak Bumi & Bangunan</h3>
                    <p className="text-xs text-slate-500">Pemberitahuan Pajak Terhutang Resmi (PBB-P2)</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSpptModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body Dokumen SPPT Digital */}
              <div className="p-6 sm:p-8 space-y-6 text-slate-800">
                {/* Kop Surat Pemkot */}
                <div className="text-center border-b-2 border-slate-800 pb-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600">PEMERINTAH KOTA SUKABUMI</h4>
                  <h3 className="text-sm font-black uppercase text-slate-900">BADAN PENGELOLAAN KEUANGAN DAN PENDAPATAN DAERAH</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    SURAT PEMBERITAHUAN PAJAK TERHUTANG (SPPT) PAJAK BUMI DAN BANGUNAN PERDESAAN DAN PERKOTAAN
                  </p>
                  <div className="text-xs font-extrabold text-emerald-800 mt-1">
                    TAHUN PAJAK {selectedSppt.tahun}
                  </div>
                </div>

                {/* Nomor Objek Pajak */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">NOMOR OBJEK PAJAK (NOP)</div>
                  <div className="text-lg font-mono font-black text-slate-900 mt-0.5 tracking-wider">
                    {selectedSppt.nop}
                  </div>
                </div>

                {/* Tabel Detail Letak & Wajib Pajak */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                    <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1">LETAK OBJEK PAJAK</span>
                    <div><span className="text-slate-400">Alamat:</span> <span className="font-medium">{selectedSppt.alamat_objek_pajak || '-'}</span></div>
                    <div><span className="text-slate-400">RT/RW:</span> <span className="font-medium">{selectedSppt.rt} / {selectedSppt.rw}</span></div>
                    <div><span className="text-slate-400">Kelurahan:</span> <span className="font-medium">{selectedSppt.kelurahan || 'Kebonjati'}</span></div>
                    <div><span className="text-slate-400">Kecamatan:</span> <span className="font-medium">{selectedSppt.kecamatan || 'Cikole'}</span></div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                    <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1">NAMA DAN ALAMAT WAJIB PAJAK</span>
                    <div><span className="text-slate-400">Nama:</span> <span className="font-bold text-slate-900">{selectedSppt.nama_wajib_pajak || 'Wajib Pajak'}</span></div>
                    <div><span className="text-slate-400">NIK:</span> <span className="font-medium">{selectedSppt.nik_warga || '-'}</span></div>
                    <div><span className="text-slate-400">Status:</span> <span className={`font-bold ${selectedSppt.status_pembayaran === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>{selectedSppt.status_pembayaran === 'PAID' ? 'LUNAS TERVERIFIKASI' : 'BELUM DIBAYAR'}</span></div>
                  </div>
                </div>

                {/* Perhitungan Objek Pajak */}
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2.5">Objek Pajak</th>
                        <th className="p-2.5 text-right">Luas (M²)</th>
                        <th className="p-2.5 text-right">Total NJOP (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-medium">BUMI</td>
                        <td className="p-2.5 text-right">{selectedSppt.luas_bumi || 0}</td>
                        <td className="p-2.5 text-right">{formatIDR(selectedSppt.njop_bumi || 0)}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium">BANGUNAN</td>
                        <td className="p-2.5 text-right">{selectedSppt.luas_bangunan || 0}</td>
                        <td className="p-2.5 text-right">{formatIDR(selectedSppt.njop_bangunan || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Rincian Ketetapan */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-emerald-800 font-semibold block">TOTAL PBB TERHUTANG</span>
                    <span className="text-2xl font-black text-emerald-900">{formatIDR(selectedSppt.nominal)}</span>
                    <span className="text-[11px] text-emerald-700 block mt-0.5">
                      Jatuh Tempo: {new Date(selectedSppt.tanggal_jatuh_tempo).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="text-center sm:text-right">
                    <div className="w-16 h-16 bg-white p-1 rounded-lg border border-emerald-300 mx-auto sm:ml-auto flex items-center justify-center">
                      <QrCode size={52} className="text-slate-800" />
                    </div>
                    <span className="text-[10px] text-emerald-800 font-mono block mt-1">BSrE Verified E-SPPT</span>
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition"
                >
                  <Printer size={15} /> Cetak E-SPPT
                </button>
                <button
                  onClick={() => setShowSpptModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL SIMULASI PEMBAYARAN PBB */}
      {/* ============================================================== */}
      <AnimatePresence>
        {payModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Pembayaran PBB-P2</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{payModalItem.nop}</p>
                  </div>
                </div>
                <button
                  onClick={() => setPayModalItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {paymentSuccessData ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={32} />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">Pembayaran Berhasil!</h4>
                    <p className="text-xs text-slate-600">
                      Tagihan PBB Tahun {payModalItem.tahun} sebesar {formatIDR(payModalItem.nominal)} telah LUNAS dan terverifikasi di kas daerah.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-700">
                      Ref: {paymentSuccessData.nomor_transaksi_bank || 'BJB-PAY-OK'}
                    </div>
                    <button
                      onClick={() => setPayModalItem(null)}
                      className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                    >
                      Selesai
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Wajib Pajak:</span>
                        <span className="font-bold text-slate-800">{payModalItem.nama_wajib_pajak || 'Warga'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tahun Pajak:</span>
                        <span className="font-semibold text-slate-800">{payModalItem.tahun}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-1.5">
                        <span className="text-slate-500 font-semibold">Total Tagihan:</span>
                        <span className="font-extrabold text-emerald-700 text-sm">{formatIDR(payModalItem.nominal)}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">Metode Pembayaran:</label>
                      <div className="space-y-2">
                        {['QRIS Dinamis', 'Bank BJB Virtual Account', 'Loket Kas Kelurahan'].map((method) => (
                          <label
                            key={method}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                              payMethod === method
                                ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700 text-xs'
                            }`}
                          >
                            <span className="text-xs">{method}</span>
                            <input
                              type="radio"
                              name="payMethod"
                              checked={payMethod === method}
                              onChange={() => setPayMethod(method)}
                              className="accent-emerald-600"
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={handleExecutePayment}
                        disabled={isProcessingPayment}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isProcessingPayment ? (
                          <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                        ) : (
                          <>Konfirmasi & Bayar Lunas</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
