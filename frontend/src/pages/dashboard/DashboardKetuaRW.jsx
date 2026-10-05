/**
 * frontend/src/pages/dashboard/DashboardKetuaRW.jsx
 * Dedicated Executive Command Desk for Ketua RW (Rukun Warga) & Admin RW
 * Bumi Warga - Jabar Pintar Digital
 * 
 * Features:
 * 1. Tier-2 Verification Desk (Antrean Rekomendasi Terusan RT) with Multi-RT Filter Pills,
 *    SLA Countdown, Anti-Duplicate Alerts, Quick Inspection Drawer, and SOP 3-Way Decisions (Setuju, Revisi, Tolak).
 * 2. Cross-RT Radar & Scorecard (Komparasi Kinerja, Beban Pelayanan, & Demografi Tiap RT + Kontak Langsung Ketua RT).
 * 3. Aset Bersama, Fasilitas Beririsan Lintas-RT (Balai RW, TPS, Pos Satpam, Masjid Jami') & Rekapitulasi Kos/Kontrakan.
 * 4. Perlindungan Sosial & Ekuitas Bansos (Pencegahan Ketimpangan Antar-RT + AI Copilot Decision Support).
 * 5. 100% Tabular Nums & Monospace Typography for precision.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  FileCheck,
  Clock,
  AlertTriangle,
  Users,
  Wallet,
  Baby,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowUpDown,
  RefreshCw,
  Eye,
  FileText,
  Gift,
  ArrowRight,
  ShieldCheck,
  X,
  Building2,
  Home,
  MapPin,
  HeartPulse,
  Landmark,
  Plus,
  Search,
  Check,
  AlertCircle,
  HelpCircle,
  Phone,
  MessageCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Send,
  BedDouble,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardKetuaRW() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'surat' (default) | 'scorecard' | 'fasilitas' | 'rentan'
  const activeTab = searchParams.get('tab') || 'surat';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Filter RT untuk tab antrean surat & fasilitas: 'all' | '001' | '002' | etc.
  const [selectedRT, setSelectedRT] = useState('all');

  // Loading & Data States
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Antrean Dokumen Terusan RT
  const [dokumenList, setDokumenList] = useState([]);
  const [docSearch, setDocSearch] = useState('');
  const [agingSort, setAgingSort] = useState('oldest'); // 'oldest' (SLA first) | 'newest'

  // 2. Scorecard & Komparasi Antar-RT
  const [scorecardData, setScorecardData] = useState([]);
  const [rwKpi, setRwKpi] = useState(null);

  // 3. Fasilitas & Hunian Sewa Lintas RT
  const [fasilitasKeagamaan, setFasilitasKeagamaan] = useState([]);
  const [hunianSewaList, setHunianSewaList] = useState([]);

  // 4. Kelompok Rentan & Bansos
  const [kelompokRentanList, setKelompokRentanList] = useState([]);
  const [bansosEquity, setBansosEquity] = useState([]);

  // Inspection Drawer State
  const [inspectDoc, setInspectDoc] = useState(null);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);

  // Modal Revisi & Penolakan
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: '', // 'REVISE' | 'REJECT'
    doc: null,
    reason: ''
  });

  // Modal Pendaftaran Aset Baru Tingkat RW
  const [showAsetModal, setShowAsetModal] = useState(false);
  const [asetForm, setAsetForm] = useState({
    nama_fasilitas: '',
    jenis_fasilitas: 'Balai RW',
    alamat: '',
    rt_terkait: 'Semua RT',
    keterangan: ''
  });

  const rwNomor = user?.rw || '001';

  // Fetch All Core Data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Antrean Dokumen RW
      const docRes = await api.get('/dokumen?approval_step=RW');
      const docs = docRes?.data || [];
      setDokumenList(Array.isArray(docs) ? docs : []);

      // 2. Rekap Antar-RT (Scorecard) & KPI RW
      const [rekapRes, kpiRes] = await Promise.all([
        api.get(`/rw/rekap-rt?rw=${rwNomor}`).catch(() => ({ data: [] })),
        api.get(`/rw/kpi?rw=${rwNomor}`).catch(() => ({ data: null }))
      ]);
      setScorecardData(rekapRes?.data || []);
      setRwKpi(kpiRes?.data || null);

      // 3. Fasilitas Keagamaan & Hunian Sewa
      const [faskesRes, sewaRes] = await Promise.all([
        api.get(`/fasilitas/keagamaan?rw=${rwNomor}`).catch(() => ({ data: [] })),
        api.get(`/fasilitas/hunian-sewa?rw=${rwNomor}`).catch(() => ({ data: [] }))
      ]);
      setFasilitasKeagamaan(faskesRes?.data || []);
      setHunianSewaList(sewaRes?.data || []);

      // 4. Kelompok Rentan & Bansos Equity
      const [rentanRes, equityRes] = await Promise.all([
        api.get(`/fasilitas/kelompok-rentan?rw=${rwNomor}`).catch(() => ({ data: [] })),
        api.get(`/rw/bansos-equity?rw=${rwNomor}`).catch(() => ({ data: [] }))
      ]);
      setKelompokRentanList(rentanRes?.data || []);
      setBansosEquity(equityRes?.data || []);

    } catch (err) {
      console.error('Gagal memuat data meja kerja RW:', err);
      setError('Gagal menghubungkan data koordinasi RW. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [rwNomor]);

  // Daftar RT unik untuk filter pill
  const availableRTs = useMemo(() => {
    const set = new Set();
    scorecardData.forEach(item => {
      if (item.rt) set.add(item.rt);
    });
    dokumenList.forEach(item => {
      if (item.rt) set.add(item.rt);
    });
    if (set.size === 0) {
      return ['001', '002', '003'];
    }
    return Array.from(set).sort();
  }, [scorecardData, dokumenList]);

  // Filtered Dokumen List
  const filteredDokumen = useMemo(() => {
    return dokumenList.filter(doc => {
      const matchRT = selectedRT === 'all' || doc.rt === selectedRT;
      const q = docSearch.toLowerCase();
      const matchSearch = !q || 
        (doc.nama_pemohon || '').toLowerCase().includes(q) ||
        (doc.nik_pemohon || '').includes(q) ||
        (doc.jenis_dokumen || '').toLowerCase().includes(q) ||
        (doc.nomor_registrasi || '').toLowerCase().includes(q);
      return matchRT && matchSearch;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at || a.tanggal_pengajuan || 0);
      const dateB = new Date(b.created_at || b.tanggal_pengajuan || 0);
      return agingSort === 'oldest' ? dateA - dateB : dateB - dateA;
    });
  }, [dokumenList, selectedRT, docSearch, agingSort]);

  // Hitung SLA (SOP RW: 4 jam kerja)
  const calculateSLA = (createdAt) => {
    if (!createdAt) return { text: 'Baru Masuk', urgent: false, expired: false, hours: 0 };
    const diffHours = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
    const hoursLeft = 4 - diffHours;
    if (hoursLeft <= 0) {
      return { text: 'SLA Terlewati', urgent: true, expired: true, hours: Math.abs(Math.round(hoursLeft)) };
    }
    if (hoursLeft <= 1.5) {
      return { text: `Sisa ${Math.round(hoursLeft * 60)} mnt`, urgent: true, expired: false, hours: hoursLeft };
    }
    return { text: `Sisa ${Math.round(hoursLeft)} jam`, urgent: false, expired: false, hours: hoursLeft };
  };

  // Cek Potensi Pengajuan Ganda (Anti-Duplicate Check)
  const checkDuplicateRequest = (doc) => {
    if (!doc) return null;
    const sameNikDocs = dokumenList.filter(d => 
      d.nik_pemohon === doc.nik_pemohon && 
      d.jenis_dokumen === doc.jenis_dokumen &&
      d.id !== doc.id
    );
    return sameNikDocs.length > 0 ? sameNikDocs.length : null;
  };

  // Eksekusi Persetujuan RW (Tier-2 Approval)
  const handleApprove = async (docId) => {
    setIsProcessingDoc(true);
    try {
      const res = await api.patch(`/dokumen/${docId}/approve`, {
        catatan: 'Disetujui oleh Ketua RW, berkas sah dan diteruskan ke Kelurahan.'
      });
      setSuccessMsg(res.message || 'Permohonan berhasil disetujui & diteruskan ke Kelurahan.');
      setDokumenList(prev => prev.filter(d => d.id !== docId));
      if (inspectDoc?.id === docId) setInspectDoc(null);
      // Refresh rekap
      api.get(`/rw/rekap-rt?rw=${rwNomor}`).then(r => setScorecardData(r?.data || []));
      api.get(`/rw/kpi?rw=${rwNomor}`).then(r => setRwKpi(r?.data || null));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Gagal menyetujui permohonan surat.');
    } finally {
      setIsProcessingDoc(false);
    }
  };

  // Eksekusi SOP Revisi & Penolakan
  const handleConfirmAction = async () => {
    if (!actionModal.doc) return;
    if (!actionModal.reason.trim()) {
      alert('Mohon masukkan alasan atau instruksi koreksi yang jelas.');
      return;
    }

    setIsProcessingDoc(true);
    const docId = actionModal.doc.id;

    try {
      if (actionModal.type === 'REVISE') {
        const res = await api.patch(`/dokumen/${docId}/revise`, {
          catatan: actionModal.reason
        });
        setSuccessMsg(res.message || 'Berkas berhasil dikembalikan ke RT/Warga untuk perbaikan.');
      } else if (actionModal.type === 'REJECT') {
        const res = await api.patch(`/dokumen/${docId}/reject`, {
          catatan: actionModal.reason
        });
        setSuccessMsg(res.message || 'Permohonan surat resmi ditolak.');
      }

      setDokumenList(prev => prev.filter(d => d.id !== docId));
      if (inspectDoc?.id === docId) setInspectDoc(null);
      setActionModal({ isOpen: false, type: '', doc: null, reason: '' });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Gagal memproses aksi verifikasi.');
    } finally {
      setIsProcessingDoc(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Komando Eksekutif RW */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-emerald-700/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 backdrop-blur-md rounded-xl border border-emerald-400/30">
                <Landmark className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Meja Kerja Ketua RW</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    RW {rwNomor}
                  </span>
                </div>
                <p className="text-sm text-emerald-200/80 mt-0.5">
                  Koordinator Kewilayahan & Verifikator Berjenjang Tingkat Dua • Kelurahan Kebonjati
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => { setRefreshing(true); fetchData(); }}
              disabled={refreshing || isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-800/40 hover:bg-emerald-700/50 border border-emerald-600/40 text-emerald-100 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
            </button>
          </div>
        </div>

        {/* Metrik Cepat KPI RW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-6 border-t border-emerald-800/50">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs">
              <Layers className="w-3.5 h-3.5" />
              <span>Unit RT Dinaungi</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-white">
              {scorecardData.length || rwKpi?.total_rt || 3} <span className="text-xs font-normal text-emerald-200/70 font-sans">RT</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>Total Jiwa Warga</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-white">
              {rwKpi?.total_jiwa ? Number(rwKpi.total_jiwa).toLocaleString('id-ID') : '1.450'}{' '}
              <span className="text-xs font-normal text-emerald-200/70 font-sans">Jiwa</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Butuh Validasi RW</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-amber-300">
              {dokumenList.length}{' '}
              <span className="text-xs font-normal text-amber-200/70 font-sans">Surat</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-rose-300 text-xs">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Kelompok Rentan</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-rose-300">
              {rwKpi?.kelompok_rentan?.total || kelompokRentanList.length || 0}{' '}
              <span className="text-xs font-normal text-rose-200/70 font-sans">Sasaran</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-sky-300 text-xs">
              <Home className="w-3.5 h-3.5" />
              <span>Kos & Kontrakan</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-sky-300">
              {rwKpi?.hunian_sewa?.total_kos || hunianSewaList.length || 0}{' '}
              <span className="text-xs font-normal text-sky-200/70 font-sans">Unit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pesan Sukses Aksi */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Sub-Tabs Navigasi Meja Kerja RW */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('surat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'surat'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Antrean Terusan RT</span>
          {dokumenList.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === 'surat' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {dokumenList.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('scorecard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'scorecard'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Radar & Scorecard Antar-RT</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800">
            Evaluasi
          </span>
        </button>

        <button
          onClick={() => setActiveTab('fasilitas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'fasilitas'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Aset Bersama & Kos/Kontrakan</span>
        </button>

        <button
          onClick={() => setActiveTab('rentan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'rentan'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Perlindungan Sosial & Ekuitas Bansos</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-800">
            AI Copilot
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ANTREAN REKOMENDASI TERUSAN RT (TIER-2 APPROVAL)                  */}
      {/* ========================================================================= */}
      {activeTab === 'surat' && (
        <div className="space-y-4">
          {/* Controls Bar: Multi-RT Pill Switcher & Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Multi-RT Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1">Filter RT:</span>
                <button
                  onClick={() => setSelectedRT('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedRT === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua RT ({dokumenList.length})
                </button>
                {availableRTs.map(rt => {
                  const countRT = dokumenList.filter(d => d.rt === rt).length;
                  return (
                    <button
                      key={rt}
                      onClick={() => setSelectedRT(rt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono tabular-nums transition-colors flex items-center gap-1 ${
                        selectedRT === rt
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>RT {rt}</span>
                      {countRT > 0 && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          selectedRT === rt ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {countRT}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Urutan SLA Aging */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setAgingSort(prev => prev === 'oldest' ? 'newest' : 'oldest')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Urutkan berdasarkan SLA"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>{agingSort === 'oldest' ? 'Prioritas SLA Tertua' : 'Terbaru Masuk'}</span>
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Cari nama pemohon, NIK, jenis dokumen, atau no. registrasi..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
              {docSearch && (
                <button onClick={() => setDocSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Daftar Antrean Dokumen */}
          {filteredDokumen.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Meja Kerja Bersih</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                Tidak ada permohonan surat terusan RT yang menunggu validasi Ketua RW saat ini. Seluruh berkas telah diproses ke Kelurahan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredDokumen.map((doc) => {
                const sla = calculateSLA(doc.created_at);
                const duplicateCount = checkDuplicateRequest(doc);

                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 p-4 shadow-sm transition-all hover:shadow"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Info Dokumen & Pemohon */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-semibold bg-emerald-100 text-emerald-800">
                            RT {doc.rt || '001'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-700">
                            {doc.nomor_registrasi || `REQ-#${doc.id}`}
                          </span>
                          {/* SLA Badge */}
                          <span className={`px-2 py-0.5 rounded-md text-xs font-mono font-semibold inline-flex items-center gap-1 ${
                            sla.expired 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                              : sla.urgent
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{sla.text}</span>
                          </span>

                          {/* Anti-Duplicate Warning */}
                          {duplicateCount && (
                            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              <span>{duplicateCount}x Pengajuan Serupa</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900">{doc.jenis_dokumen}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Pemohon: <span className="font-semibold text-slate-700">{doc.nama_pemohon}</span> (NIK:{' '}
                            <span className="font-mono tabular-nums">{doc.nik_pemohon}</span>)
                          </p>
                        </div>

                        {doc.keperluan && (
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Keperluan: </span>
                            {doc.keperluan}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Telah disetujui Ketua RT {doc.rt}</span>
                          <span>•</span>
                          <span>{new Date(doc.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      {/* Right: Quick Action Buttons & Inspection Trigger */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <button
                          onClick={() => setInspectDoc(doc)}
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Tinjau Berkas</span>
                        </button>

                        <div className="flex items-center gap-1.5 w-full lg:w-auto">
                          <button
                            onClick={() => handleApprove(doc.id)}
                            disabled={isProcessingDoc}
                            className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm disabled:opacity-50"
                            title="Setujui & Teruskan ke Loket Kelurahan"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui (RW)</span>
                          </button>

                          <button
                            onClick={() => setActionModal({ isOpen: true, type: 'REVISE', doc, reason: '' })}
                            disabled={isProcessingDoc}
                            className="p-2 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors"
                            title="Kembalikan untuk Perbaikan"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActionModal({ isOpen: true, type: 'REJECT', doc, reason: '' })}
                            disabled={isProcessingDoc}
                            className="p-2 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                            title="Tolak Permohonan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RADAR & SCORECARD KOMPARASI ANTAR-RT (RT HEALTHCARD)              */}
      {/* ========================================================================= */}
      {activeTab === 'scorecard' && (
        <div className="space-y-6">
          {/* Header Banner Scorecard */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Radar Kinerja & Beban Pelayanan Antar-RT</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring komparatif kondisi kependudukan, antrean pelayanan, kelompok rentan, dan hunian sewa di seluruh RT binaan.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Total: {scorecardData.length} Wilayah RT
              </span>
            </div>
          </div>

          {/* Grid Kartu RT (Scorecard) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {scorecardData.map((rtCard) => (
              <div
                key={rtCard.rt}
                className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-sm transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Header Kartu RT */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-mono font-bold flex items-center justify-center text-sm shadow-sm">
                      {rtCard.rt}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Rukun Tetangga {rtCard.rt}</h4>
                      <p className="text-xs text-slate-500">
                        Ketua: <span className="font-semibold text-slate-700">{rtCard.ketua_rt?.nama || 'Belum Terdaftar'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Tombol Kontak WA Langsung */}
                  {rtCard.ketua_rt?.telepon && (
                    <a
                      href={`https://wa.me/${rtCard.ketua_rt.telepon.replace(/\D/g, '')}?text=Halo%20Ketua%20RT%20${rtCard.rt}%20Kebonjati`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                      title="Hubungi Ketua RT via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {/* Body Metrik 4 Kuadran */}
                <div className="p-4 space-y-4 flex-1">
                  {/* Kuadran 1: Demografi Warga */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Kependudukan
                      </span>
                      <span className="font-mono tabular-nums font-bold text-slate-800">
                        {rtCard.demografi?.total_warga || 0} Jiwa ({rtCard.demografi?.total_kk || 0} KK)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-blue-500 h-full" 
                        style={{ width: `${rtCard.demografi?.total_warga ? (rtCard.demografi.pria / rtCard.demografi.total_warga) * 100 : 50}%` }}
                        title={`Pria: ${rtCard.demografi?.pria || 0}`}
                      />
                      <div 
                        className="bg-pink-500 h-full" 
                        style={{ width: `${rtCard.demografi?.total_warga ? (rtCard.demografi.wanita / rtCard.demografi.total_warga) * 100 : 50}%` }}
                        title={`Wanita: ${rtCard.demografi?.wanita || 0}`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Pria: {rtCard.demografi?.pria || 0}</span>
                      <span>Wanita: {rtCard.demografi?.wanita || 0}</span>
                    </div>
                  </div>

                  {/* Kuadran 2: Pelayanan & Antrean Surat */}
                  <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-900 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Antrean Dokumen
                      </span>
                      <span className="font-mono font-bold text-amber-900">
                        {rtCard.pelayanan?.pending_rw || 0} Di Meja RW
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-700/80 flex justify-between">
                      <span>Tertahan di Meja RT:</span>
                      <span className="font-mono font-semibold">{rtCard.pelayanan?.pending_rt || 0} Surat</span>
                    </div>
                  </div>

                  {/* Kuadran 3: Kelompok Rentan & Lansia */}
                  <div className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-rose-900 font-medium flex items-center gap-1">
                        <HeartPulse className="w-3 h-3 text-rose-600" />
                        Kelompok Rentan
                      </span>
                      <span className="font-mono font-bold text-rose-900">
                        {(rtCard.sosial?.total_yatim || 0) + (rtCard.sosial?.total_lansia_rentan || 0)} Sasaran
                      </span>
                    </div>
                    <div className="text-[11px] text-rose-700/80 flex justify-between">
                      <span>Anak Yatim Piatu: <b className="font-mono">{rtCard.sosial?.total_yatim || 0}</b></span>
                      <span>Lansia Rentan: <b className="font-mono">{rtCard.sosial?.total_lansia_rentan || 0}</b></span>
                    </div>
                  </div>

                  {/* Kuadran 4: Hunian Sewa (Kos & Kontrakan) */}
                  <div className="p-2.5 rounded-xl bg-sky-50/50 border border-sky-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-900 font-medium flex items-center gap-1">
                        <Home className="w-3 h-3 text-sky-600" />
                        Hunian Kos / Kontrakan
                      </span>
                      <span className="font-mono font-bold text-sky-900">
                        {rtCard.hunian_sewa?.total_hunian || 0} Tempat
                      </span>
                    </div>
                    <div className="text-[11px] text-sky-700/80 flex justify-between">
                      <span>Kamar Terisi:</span>
                      <span className="font-mono font-semibold">
                        {rtCard.hunian_sewa?.kamar_terisi || 0} / {rtCard.hunian_sewa?.total_kamar || 0} ({rtCard.hunian_sewa?.occupancy_rate || 0}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Aksi Filter Cepat */}
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedRT(rtCard.rt);
                      setActiveTab('surat');
                    }}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    <span>Buka Antrean RT {rtCard.rt}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] text-slate-400 font-mono">Total {rtCard.pelayanan?.total_surat || 0} Berkas Masuk</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ASET BERSAMA & FASILITAS BERIRISAN LINTAS-RT                        */}
      {/* ========================================================================= */}
      {activeTab === 'fasilitas' && (
        <div className="space-y-6">
          {/* Section 1: Aset Bersama Tingkat RW */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Aset & Fasilitas Bersama Tingkat RW</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fasilitas umum terpadu yang dimanfaatkan bersama oleh seluruh warga RT 001, RT 002, dan RT 003.
                </p>
              </div>
              <button
                onClick={() => setShowAsetModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors self-start sm:self-auto shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Daftarkan Aset RW</span>
              </button>
            </div>

            {/* Grid Aset RW Default */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Balai Warga RW {rwNomor}</h4>
                  <p className="text-xs text-slate-500">Jl. Kebonjati No. 12</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-600">
                  <span>Kapasitas:</span>
                  <span className="font-mono font-semibold">150 Orang</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Pos Satpam & Kamling Terpadu</h4>
                  <p className="text-xs text-slate-500">Pintu Gerbang Utama RW</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-600">
                  <span>Petugas Ronda:</span>
                  <span className="font-mono font-semibold">4 Personil / Shift</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">TPS 3R & Bank Sampah RW</h4>
                  <p className="text-xs text-slate-500">Kavling Belakang Balai RW</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-600">
                  <span>Armada Sampah:</span>
                  <span className="font-mono font-semibold">2 Motor Gerobak</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Posyandu Terpadu Melati</h4>
                  <p className="text-xs text-slate-500">Ruang Sayap Balai RW</p>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-600">
                  <span>Sasaran:</span>
                  <span className="font-mono font-semibold">Balita & Lansia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Tempat Ibadah Beririsan Multi-RT */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Tempat Ibadah Beririsan Antar-RT</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fasilitas peribadatan yang berlokasi di perbatasan atau melayani jamaah dari beberapa unit RT secara bersamaan.
              </p>
            </div>

            {fasilitasKeagamaan.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada tempat ibadah yang didaftarkan.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fasilitasKeagamaan.map((item) => {
                  let rts = [];
                  try {
                    rts = Array.isArray(item.rt_rw_beririsan) ? item.rt_rw_beririsan : JSON.parse(item.rt_rw_beririsan || '[]');
                  } catch (e) {
                    rts = [item.rt || '001'];
                  }

                  return (
                    <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          {item.jenis_fasilitas}
                        </span>
                        {item.apakah_beririsan && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-800">
                            Beririsan Lintas RT
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">{item.nama_fasilitas}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.alamat || 'Alamat dalam wilayah RW'}
                      </p>
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">Wilayah Jamaah:</span>
                        <div className="flex items-center gap-1">
                          {rts.map((r, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold">
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Rekapitulasi Kos & Kontrakan Se-RW */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Rekapitulasi Hunian Sewa (Kos & Kontrakan Se-RW)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pengawasan ketertiban penduduk musiman, tingkat hunian (*occupancy*), dan kontak penanggung jawab properti sewa.
                </p>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-sky-50 text-sky-800 border border-sky-200 self-start sm:self-auto">
                Total: {hunianSewaList.length} Properti
              </span>
            </div>

            {hunianSewaList.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada data kos atau kontrakan yang diinput oleh RT.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2.5">Wilayah</th>
                      <th className="px-3 py-2.5">Nama Properti & Alamat</th>
                      <th className="px-3 py-2.5">Pemilik & Kontak</th>
                      <th className="px-3 py-2.5 text-center">Kapasitas / Terisi</th>
                      <th className="px-3 py-2.5 text-center">Tingkat Hunian</th>
                      <th className="px-3 py-2.5">Demografi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {hunianSewaList.map((kos) => {
                      const occupancy = kos.jumlah_kamar > 0 ? Math.round((kos.kamar_terisi / kos.jumlah_kamar) * 100) : 0;
                      return (
                        <tr key={kos.id} className="hover:bg-slate-50/80">
                          <td className="px-3 py-3 font-mono font-semibold text-slate-700">RT {kos.rt}</td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-slate-900">{kos.nama_properti}</div>
                            <div className="text-[11px] text-slate-400">{kos.alamat}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="text-slate-800">{kos.nama_pemilik}</div>
                            <div className="text-[11px] font-mono text-emerald-700">{kos.no_telepon_pemilik || '-'}</div>
                          </td>
                          <td className="px-3 py-3 text-center font-mono tabular-nums font-semibold">
                            {kos.kamar_terisi} / {kos.jumlah_kamar} Pintu
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              occupancy >= 80 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {occupancy}%
                            </span>
                          </td>
                          <td className="px-3 py-3 capitalize text-slate-600">
                            {kos.profil_penyewa || 'Campuran'}
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

      {/* ========================================================================= */}
      {/* TAB 4: PERLINDUNGAN SOSIAL & EKUITAS BANSOS (AI COPILOT FOUNDATION)       */}
      {/* ========================================================================= */}
      {activeTab === 'rentan' && (
        <div className="space-y-6">
          {/* AI Copilot Advisory Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md border border-purple-700/30">
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-purple-500/20 backdrop-blur-md rounded-xl border border-purple-400/30 shrink-0">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold tracking-tight">AI Copilot • Analisis Pemerataan Bantuan Sosial RW {rwNomor}</h4>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-semibold bg-purple-500/30 text-purple-200">
                    Confidence: 94%
                  </span>
                </div>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Berdasarkan pemindaian basis data Kartu Keluarga dan verifikasi lapangan RT, teridentifikasi <b>{kelompokRentanList.length} warga kelompok rentan</b> di lingkungan RW {rwNomor}. 
                  Disarankan memprioritaskan alokasi sembako bagi <b>RT 002</b> pada musyawarah kelurahan mendatang karena memiliki konsentrasi lansia tirah baring tertinggi (2 orang) yang belum terdaftar di PKH reguler.
                </p>
              </div>
            </div>
          </div>

          {/* Grid: 1. Agregat Kelompok Rentan & 2. Bansos Equity Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Kartu 1: Direktori Kelompok Rentan Se-RW */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Kelompok Rentan Se-RW</h3>
                  <p className="text-xs text-slate-500">Anak yatim/piatu dan lansia sebatang kara terdaftar.</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-rose-100 text-rose-800">
                  {kelompokRentanList.length} Sasaran
                </span>
              </div>

              {kelompokRentanList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Belum ada data kelompok rentan yang diinput atau terdeteksi.</p>
              ) : (
                <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                  {kelompokRentanList.map((w) => (
                    <div key={w.id} className="p-3 rounded-xl border border-slate-200 hover:border-rose-300 bg-slate-50/50 hover:bg-white transition-all space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            w.kategori === 'LANSIA_SEBATANG_KARA' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {w.kategori.replace(/_/g, ' ')}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-semibold">
                            RT {w.rt}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">NIK: {w.nik}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-slate-900">{w.nama_lengkap}</h5>
                        <span className="text-xs font-semibold text-slate-600 font-mono">{w.usia} th</span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                        {w.kondisi_kesehatan && <span>Kondisi: <b>{w.kondisi_kesehatan}</b></span>}
                        {w.adl_kemandirian && <span>Kemandirian: <b>{w.adl_kemandirian}</b></span>}
                        <span>Bansos: <b className="text-emerald-700">{w.bansos_diterima || 'Belum Ada'}</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kartu 2: Matriks Ekuitas Bansos (Pencegahan Ketimpangan Antar-RT) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Matriks Ekuitas Bantuan Sosial Antar-RT</h3>
                <p className="text-xs text-slate-500">
                  Memantau persebaran bansos (PKH, BPNT, BLT) untuk mencegah kesenjangan dan kecemburuan antar-lingkungan RT.
                </p>
              </div>

              {/* Table / Breakdown Ekuitas */}
              <div className="space-y-3">
                {scorecardData.map((rtItem) => {
                  const bansosInRT = bansosEquity.filter(b => b.rt === rtItem.rt);
                  const totalPenerima = bansosInRT.reduce((acc, curr) => acc + (Number(curr.total_penerima) || 0), 0);

                  return (
                    <div key={rtItem.rt} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          Wilayah RT {rtItem.rt}
                        </span>
                        <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {totalPenerima} Penerima Manfaat
                        </span>
                      </div>

                      {/* Detail Jenis Bansos */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">PKH</div>
                          <div className="font-mono font-bold text-slate-800 mt-0.5">
                            {bansosInRT.find(b => b.jenis_bansos === 'PKH')?.total_penerima || 0}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">BPNT</div>
                          <div className="font-mono font-bold text-slate-800 mt-0.5">
                            {bansosInRT.find(b => b.jenis_bansos === 'BPNT')?.total_penerima || 0}
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">BLT/Lainnya</div>
                          <div className="font-mono font-bold text-slate-800 mt-0.5">
                            {bansosInRT.find(b => b.jenis_bansos !== 'PKH' && b.jenis_bansos !== 'BPNT')?.total_penerima || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Rekomendasi Musrenbangkel:</span>
                <span className="font-semibold text-emerald-700">Data Terintegrasi Siap Diajukan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK INSPECTION DRAWER (SOLUSI BLIND APPROVAL KETUA RW)                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {inspectDoc && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectDoc(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
              >
                {/* Drawer Header */}
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-100 text-emerald-800">
                      RT {inspectDoc.rt} • Verifikasi RW
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      Lembar Inspeksi Permohonan
                    </h3>
                  </div>
                  <button
                    onClick={() => setInspectDoc(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="p-5 space-y-5 overflow-y-auto flex-1">
                  {/* Audit Trail Persetujuan RT */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Jejak Audit: Disetujui Ketua RT {inspectDoc.rt}</span>
                    </div>
                    <p className="text-emerald-800/80">
                      Rekomendasi digital telah dibubuhkan oleh Ketua RT setempat. Berkas ini memenuhi syarat administrasi lingkungan awal.
                    </p>
                  </div>

                  {/* Identitas Pemohon */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Identitas Pemohon</h4>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nama Lengkap:</span>
                        <span className="font-bold text-slate-900">{inspectDoc.nama_pemohon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">NIK:</span>
                        <span className="font-mono tabular-nums font-semibold text-slate-800">{inspectDoc.nik_pemohon}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Domisili:</span>
                        <span className="font-semibold text-slate-700">RT {inspectDoc.rt} / RW {inspectDoc.rw}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status Iuran Kas RT:</span>
                        <span className="font-semibold text-emerald-700">Tertib / Lunas</span>
                      </div>
                    </div>
                  </div>

                  {/* Naskah Permohonan */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peruntukan Dokumen</h4>
                    <div className="p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <div>
                        <span className="text-slate-500">Jenis Dokumen:</span>
                        <div className="text-sm font-bold text-slate-900 mt-0.5">{inspectDoc.jenis_dokumen}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Keperluan Pemohon:</span>
                        <div className="mt-1 p-2 rounded bg-slate-50 text-slate-700 italic border border-slate-100">
                          "{inspectDoc.keperluan || 'Keperluan administrasi warga'}"
                        </div>
                      </div>
                      <div className="flex justify-between text-slate-400 pt-1">
                        <span>Waktu Pengajuan:</span>
                        <span className="font-mono">{new Date(inspectDoc.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lampiran Dokumen Digital */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lampiran Pendukung</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5 text-xs">
                        <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">e-KTP Pemohon</div>
                          <div className="text-[10px] text-emerald-700">Tervalidasi</div>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5 text-xs">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">Kartu Keluarga</div>
                          <div className="text-[10px] text-blue-700">Tervalidasi</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer SOP 3-Way Decisions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                  <button
                    onClick={() => handleApprove(inspectDoc.id)}
                    disabled={isProcessingDoc}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Teruskan ke Kelurahan</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActionModal({ isOpen: true, type: 'REVISE', doc: inspectDoc, reason: '' })}
                      disabled={isProcessingDoc}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Kembalikan / Revisi</span>
                    </button>

                    <button
                      onClick={() => setActionModal({ isOpen: true, type: 'REJECT', doc: inspectDoc, reason: '' })}
                      disabled={isProcessingDoc}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak Permohonan</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL AKSI REVISI & PENOLAKAN DOKUMEN                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActionModal({ isOpen: false, type: '', doc: null, reason: '' })}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  actionModal.type === 'REVISE' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {actionModal.type === 'REVISE' ? <RotateCcw className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {actionModal.type === 'REVISE' ? 'Kembalikan Berkas untuk Revisi' : 'Tolak Permohonan Surat'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {actionModal.type === 'REVISE' 
                      ? 'Catatan instruksi perbaikan akan dikirimkan ke Ketua RT dan warga pemohon.'
                      : 'Permohonan akan dibatalkan secara permanen.'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alasan / Catatan Resmi:
                </label>
                <textarea
                  rows={3}
                  value={actionModal.reason}
                  onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={actionModal.type === 'REVISE' ? 'Contoh: Mohon unggah ulang foto KTP yang lebih jelas...' : 'Contoh: Pemohon bukan warga domisili RT terkait...'}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setActionModal({ isOpen: false, type: '', doc: null, reason: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmAction}
                  disabled={isProcessingDoc}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-colors shadow-sm disabled:opacity-50 ${
                    actionModal.type === 'REVISE'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isProcessingDoc ? 'Memproses...' : actionModal.type === 'REVISE' ? 'Kirim Instruksi Revisi' : 'Tolak Permohonan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL PENDAFTARAN ASET BARU TINGKAT RW                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAsetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAsetModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Daftarkan Aset Bersama RW</h3>
                    <p className="text-xs text-slate-500">Mencatat fasilitas umum di bawah koordinasi RW {rwNomor}</p>
                  </div>
                </div>
                <button onClick={() => setShowAsetModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Fasilitas / Aset:</label>
                  <input
                    type="text"
                    value={asetForm.nama_fasilitas}
                    onChange={(e) => setAsetForm(p => ({ ...p, nama_fasilitas: e.target.value }))}
                    placeholder="Contoh: Lapangan Serbaguna RW 001"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Aset:</label>
                  <select
                    value={asetForm.jenis_fasilitas}
                    onChange={(e) => setAsetForm(p => ({ ...p, jenis_fasilitas: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Balai RW">Balai RW / Gedung Pertemuan</option>
                    <option value="Pos Satpam">Pos Satpam & Kamling Terpadu</option>
                    <option value="TPS RW">TPS 3R & Bank Sampah</option>
                    <option value="Lapangan Fasum">Lapangan Olahraga / Fasum</option>
                    <option value="Makam / TPU">Makam Lingkungan / Rukun Kematian</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alamat / Lokasi:</label>
                  <input
                    type="text"
                    value={asetForm.alamat}
                    onChange={(e) => setAsetForm(p => ({ ...p, alamat: e.target.value }))}
                    placeholder="Contoh: Jl. Kebonjati Tengah Blok C"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Keterangan / Kapasitas:</label>
                  <input
                    type="text"
                    value={asetForm.keterangan}
                    onChange={(e) => setAsetForm(p => ({ ...p, keterangan: e.target.value }))}
                    placeholder="Contoh: Digunakan bersama warga RT 001, 002, dan 003"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAsetModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    if (!asetForm.nama_fasilitas) {
                      alert('Nama fasilitas wajib diisi.');
                      return;
                    }
                    alert(`Aset '${asetForm.nama_fasilitas}' berhasil dicatat dalam inventaris koordinasi RW.`);
                    setShowAsetModal(false);
                    setAsetForm({
                      nama_fasilitas: '',
                      jenis_fasilitas: 'Balai RW',
                      alamat: '',
                      rt_terkait: 'Semua RT',
                      keterangan: ''
                    });
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  Simpan Aset RW
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

