/**
 * frontend/src/pages/dashboard/DashboardKetuaRT.jsx
 * Dedicated Action-Oriented Dashboard for Ketua RT (Sprint 2)
 * Bumi Warga - Jabar Pintar Digital
 * 
 * Features:
 * 1. SLA Countdown & Aging Sorting with One-Touch Verification & SOP 3-Way Decisions (Setujui, Revisi, Tolak)
 * 2. Quick Inspection Drawer/Modal (Tinjau Berkas & KTP/KK Pemohon)
 * 3. Potensi & Daya Dukung Wilayah: Faskes (Nakes), Sekolah (Rombel), Hunian Sewa (Kos/Kontrakan), Tempat Ibadah Beririsan Multi-RT
 * 4. Dual-Sourcing Kelompok Rentan: Anak Yatim Piatu & Lansia Sebatang Kara (Auto-Scan KK + Input Lapangan RT + AI Copilot)
 * 5. 100% Tabular Nums & Monospace Typography
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  DashboardShell,
  RoleHeader,
  AIBriefCard,
  KPIGrid,
  KPICard,
  ActionCenter,
  StatusBadge,
  SLABadge
} from '../../components/design-system';
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
  GraduationCap,
  Plus,
  Search,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Phone,
  Calendar,
  Layers,
  Heart,
  CheckSquare,
  MessageCircle,
  BedDouble,
  ExternalLink,
  Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardKetuaRT() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab State: 'surat' (default) | 'fasilitas' | 'rentan'
  const activeTab = searchParams.get('tab') || 'surat';
  const handleTabChange = (newTab) => setSearchParams({ tab: newTab });

  const rtNomor = user?.rt || '001';
  const rwNomor = user?.rw || '001';

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);

  // Tab 1: Antrean Dokumen & Iuran
  const [pendingDocs, setPendingDocs] = useState([]);
  const [docStats, setDocStats] = useState({ pending_rt: 0, total_approved: 0, total_rejected: 0, compliance_rate: '100%' });
  const [iuranSummary, setIuranSummary] = useState({ total_kk: 0, sudah_bayar: 0, belum_bayar: 0, persentase: '0%' });
  const [balitaRisikoCount, setBalitaRisikoCount] = useState(0);
  const [auditSanggahanPending, setAuditSanggahanPending] = useState([]);
  const [docSearch, setDocSearch] = useState('');
  const [sortBy, setSortBy] = useState('aging_desc'); // 'aging_desc' (SLA oldest first) | 'aging_asc'
  const [inspectDoc, setInspectDoc] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Modal Aksi SOP (Revisi & Tolak)
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: '', // 'REVISE' | 'REJECT'
    doc: null,
    reason: ''
  });

  // Tab 2: Fasilitas & Hunian Sewa
  const [fasilitasSubTab, setFasilitasSubTab] = useState('keagamaan'); // 'keagamaan' | 'hunian' | 'kesehatan' | 'pendidikan'
  const [keagamaanList, setKeagamaanList] = useState([]);
  const [hunianSewaList, setHunianSewaList] = useState([]);
  const [kesehatanList, setKesehatanList] = useState([]);
  const [pendidikanList, setPendidikanList] = useState([]);
  const [showAddFasilitasModal, setShowAddFasilitasModal] = useState(false);
  const [fasilitasCategory, setFasilitasCategory] = useState('keagamaan');
  const [fasilitasSubmitting, setFasilitasSubmitting] = useState(false);
  const [fasilitasForm, setFasilitasForm] = useState({
    nama: '',
    alamat: '',
    kategori_spesifik: 'Masjid',
    kapasitas: 100,
    status_legalitas: 'Wakaf',
    apakah_beririsan: false,
    rt_rw_beririsan: ['RT 001', 'RT 002'],
    jumlah_kamar: 4,
    penghuni_aktif: 4,
    penghuni_pelajar: 0,
    penghuni_pekerja: 4,
    pemilik_di_rt: 0,
    alamat_pemilik: '',
    nama_kontak: '',
    no_kontak: '',
    jumlah_dokter: 1,
    jumlah_bidan: 2,
    jumlah_perawat: 2,
    daya_tampung_kursi: 60,
    jumlah_rombel: 2
  });

  // Tab 3: Kelompok Rentan (Anak Yatim Piatu & Lansia Sebatang Kara)
  const [kelompokRentanList, setKelompokRentanList] = useState([]);
  const [rentanFilter, setRentanFilter] = useState('all'); // 'all' | 'yatim' | 'lansia'
  const [scanningKK, setScanningKK] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showAddRentanModal, setShowAddRentanModal] = useState(false);
  const [rentanSubmitting, setRentanSubmitting] = useState(false);
  const [rentanForm, setRentanForm] = useState({
    kategori: 'ANAK_YATIM_PIATU',
    nik: '',
    nama: '',
    no_kk: '',
    tanggal_lahir: '',
    usia: '',
    jenis_kelamin: 'L',
    alamat: '',
    status_tempat_tinggal: 'Bersama Kakek/Nenek',
    nama_wali_pengasuh: '',
    no_kontak_wali: '',
    status_sekolah: 'Aktif Sekolah',
    nama_sekolah: '',
    tingkat_kemandirian_adl: 'Mandiri',
    riwayat_penyakit_kronis: '',
    bansos_diterima: 'Belum Pernah Menerima',
    kebutuhan_mendesak: ''
  });

  // Toasts
  const [actionSuccessToast, setActionSuccessToast] = useState('');
  const [actionErrorToast, setActionErrorToast] = useState('');

  // Fetch all RT Dashboard Data
  const loadRTData = async () => {
    try {
      setRefreshing(true);

      // 1. Role AI Brief
      setLoadingBrief(true);
      api.get('/analytics/role-brief')
        .then((res) => {
          if (res.success) setAiBrief(res.data);
        })
        .catch((e) => console.warn('Brief fetch warn:', e.message))
        .finally(() => setLoadingBrief(false));

      // 2. Fetch Core RT Data & Facilities in parallel
      const [
        docListRes,
        docStatsRes,
        iuranRes,
        bansosRes,
        balitaRes,
        keagamaanRes,
        hunianRes,
        kesehatanRes,
        pendidikanRes,
        rentanRes
      ] = await Promise.allSettled([
        api.get('/dokumen?status=SUBMITTED&approval_step=RT'),
        api.get(`/dokumen/stats?rt=${rtNomor}&rw=${rwNomor}`),
        api.get(`/keuangan/iuran?rt=${rtNomor}&rw=${rwNomor}`),
        api.get('/bansos/audit-sanggahan'),
        api.get(`/posyandu/balita/stats?rt=${rtNomor}`),
        api.get(`/fasilitas/keagamaan?rt=${rtNomor}`),
        api.get(`/fasilitas/hunian-sewa?rt=${rtNomor}`),
        api.get(`/fasilitas/kesehatan?rt=${rtNomor}`),
        api.get(`/fasilitas/pendidikan?rt=${rtNomor}`),
        api.get(`/fasilitas/kelompok-rentan?rt=${rtNomor}`)
      ]);

      // Handle Dokumen Antrean
      if (docListRes.status === 'fulfilled' && docListRes.value?.success) {
        const rawDocs = docListRes.value.data || [];
        const forRT = rawDocs.filter((d) => d.approval_step === 'RT' && d.status !== 'REJECTED');
        setPendingDocs(forRT);
      }

      // Handle Stats
      if (docStatsRes.status === 'fulfilled' && docStatsRes.value?.success) {
        setDocStats(docStatsRes.value.data || {});
      }

      // Handle Iuran
      if (iuranRes.status === 'fulfilled' && iuranRes.value?.data) {
        const iuranList = iuranRes.value.data || [];
        const lunas = iuranList.filter((i) => i.status_bayar === 'LUNAS').length;
        const total = iuranList.length || 1;
        const pct = Math.round((lunas / total) * 100);
        setIuranSummary({
          total_kk: total,
          sudah_bayar: lunas,
          belum_bayar: total - lunas,
          persentase: `${pct}%`
        });
      }

      // Handle Bansos Sanggahan
      if (bansosRes.status === 'fulfilled' && bansosRes.value?.data) {
        const list = bansosRes.value.data || [];
        const pendingSanggahan = list.filter((s) => s.status_review === 'PENDING_KELURAHAN' && s.rt === rtNomor);
        setAuditSanggahanPending(pendingSanggahan);
      }

      // Handle Balita Risiko
      if (balitaRes.status === 'fulfilled' && balitaRes.value?.data) {
        const bStats = balitaRes.value.data || {};
        setBalitaRisikoCount(bStats.berisiko_stunting || (bStats.gizi_kurang || 0) + (bStats.gizi_buruk || 0));
      }

      // Handle Fasilitas Keagamaan
      if (keagamaanRes.status === 'fulfilled' && keagamaanRes.value?.data) {
        setKeagamaanList(keagamaanRes.value.data || []);
      }

      // Handle Hunian Sewa
      if (hunianRes.status === 'fulfilled' && hunianRes.value?.data) {
        setHunianSewaList(hunianRes.value.data || []);
      }

      // Handle Kesehatan
      if (kesehatanRes.status === 'fulfilled' && kesehatanRes.value?.data) {
        setKesehatanList(kesehatanRes.value.data.inventory || kesehatanRes.value.data || []);
      }

      // Handle Pendidikan
      if (pendidikanRes.status === 'fulfilled' && pendidikanRes.value?.data) {
        setPendidikanList(pendidikanRes.value.data.inventory || pendidikanRes.value.data || []);
      }

      // Handle Kelompok Rentan
      if (rentanRes.status === 'fulfilled' && rentanRes.value?.data) {
        setKelompokRentanList(rentanRes.value.data || []);
      }

    } catch (err) {
      console.warn('[DashboardRT] Error loading data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRTData();
  }, [user?.rt, user?.rw]);

  // ===========================================================================
  // SORTING & FILTERING
  // ===========================================================================
  const sortedDocs = useMemo(() => {
    return pendingDocs
      .filter((d) => {
        const q = docSearch.toLowerCase();
        return (
          !q ||
          (d.nama_pemohon || '').toLowerCase().includes(q) ||
          (d.nik_pemohon || '').includes(q) ||
          (d.jenis_dokumen || d.jenis_surat || '').toLowerCase().includes(q) ||
          (d.nomor_registrasi || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.created_at || a.rt_received_at || 0).getTime();
        const timeB = new Date(b.created_at || b.rt_received_at || 0).getTime();
        return sortBy === 'aging_desc' ? timeA - timeB : timeB - timeA;
      });
  }, [pendingDocs, docSearch, sortBy]);

  // Kelompok Rentan Filtered
  const filteredRentan = useMemo(() => {
    if (rentanFilter === 'yatim') {
      return kelompokRentanList.filter((k) =>
        ['ANAK_YATIM', 'ANAK_PIATU', 'ANAK_YATIM_PIATU'].includes(k.kategori)
      );
    }
    if (rentanFilter === 'lansia') {
      return kelompokRentanList.filter((k) => k.kategori === 'LANSIA_SEBATANG_KARA');
    }
    return kelompokRentanList;
  }, [kelompokRentanList, rentanFilter]);

  // ===========================================================================
  // SOP ACTIONS (SETUJUI, REVISI, TOLAK)
  // ===========================================================================
  const handleQuickApprove = async (docId, docTitle) => {
    if (!window.confirm(`Setujui permohonan surat "${docTitle}" dan teruskan ke Ketua RW?`)) {
      return;
    }

    try {
      setProcessingId(docId);
      const res = await api.patch(`/dokumen/${docId}/approve`, {
        catatan: 'Disetujui oleh Ketua RT melalui Meja Kerja Terverifikasi.'
      });

      if (res.success) {
        setActionSuccessToast(`Surat "${docTitle}" berhasil diverifikasi dan diteruskan ke RW!`);
        setTimeout(() => setActionSuccessToast(''), 4000);
        setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
        if (inspectDoc?.id === docId) setInspectDoc(null);
        loadRTData();
      } else {
        alert(res.message || 'Gagal memproses persetujuan');
      }
    } catch (e) {
      alert(e.message || 'Terjadi kesalahan saat memproses verifikasi');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSOPAction = async () => {
    const { type, doc, reason } = actionModal;
    if (!doc) return;
    if (!reason.trim()) {
      alert('Mohon masukkan catatan penjelasan untuk pemohon.');
      return;
    }

    try {
      setProcessingId(doc.id);
      const endpoint = type === 'REJECT' ? `/dokumen/${doc.id}/reject` : `/dokumen/${doc.id}/revise`;
      const res = await api.patch(endpoint, {
        catatan: reason.trim()
      });

      if (res.success) {
        const msg = type === 'REJECT'
          ? 'Permohonan surat berhasil ditolak dengan pemberitahuan ke warga.'
          : 'Catatan revisi berhasil dikirimkan ke pemohon.';
        setActionSuccessToast(msg);
        setTimeout(() => setActionSuccessToast(''), 4000);
        setPendingDocs((prev) => prev.filter((d) => d.id !== doc.id));
        if (inspectDoc?.id === doc.id) setInspectDoc(null);
        setActionModal({ isOpen: false, type: '', doc: null, reason: '' });
        loadRTData();
      } else {
        alert(res.message || 'Gagal memproses tindakan dokumen');
      }
    } catch (e) {
      alert(e.message || 'Terjadi kesalahan saat memproses permohonan');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Input Fasilitas Baru
  const handleSaveFasilitas = async (e) => {
    e.preventDefault();
    setFasilitasSubmitting(true);
    try {
      const payload = {
        ...fasilitasForm,
        kategori: fasilitasCategory,
        rt: rtNomor,
        rw: rwNomor
      };
      const res = await api.post(`/fasilitas/${fasilitasCategory}`, payload);
      if (res.success) {
        setActionSuccessToast(`Fasilitas ${fasilitasForm.nama} berhasil dicatat!`);
        setTimeout(() => setActionSuccessToast(''), 4000);
        setShowAddFasilitasModal(false);
        setFasilitasForm({
          nama: '',
          alamat: '',
          kategori_spesifik: 'Masjid',
          kapasitas: 100,
          status_legalitas: 'Wakaf',
          apakah_beririsan: false,
          rt_rw_beririsan: ['RT 001', 'RT 002'],
          jumlah_kamar: 4,
          penghuni_aktif: 4,
          penghuni_pelajar: 0,
          penghuni_pekerja: 4,
          pemilik_di_rt: 0,
          alamat_pemilik: '',
          nama_kontak: '',
          no_kontak: '',
          jumlah_dokter: 1,
          jumlah_bidan: 2,
          jumlah_perawat: 2,
          daya_tampung_kursi: 60,
          jumlah_rombel: 2
        });
        loadRTData();
      } else {
        alert(res.message || 'Gagal menyimpan fasilitas');
      }
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setFasilitasSubmitting(false);
    }
  };

  // Handle Input Kelompok Rentan
  const handleSaveRentan = async (e) => {
    e.preventDefault();
    setRentanSubmitting(true);
    try {
      const payload = {
        ...rentanForm,
        rt: rtNomor,
        rw: rwNomor
      };
      const res = await api.post('/fasilitas/kelompok-rentan', payload);
      if (res.success) {
        setActionSuccessToast(`Data warga rentan ${rentanForm.nama} berhasil didaftarkan!`);
        setTimeout(() => setActionSuccessToast(''), 4000);
        setShowAddRentanModal(false);
        setRentanForm({
          kategori: 'ANAK_YATIM_PIATU',
          nik: '',
          nama: '',
          no_kk: '',
          tanggal_lahir: '',
          usia: '',
          jenis_kelamin: 'L',
          alamat: '',
          status_tempat_tinggal: 'Bersama Kakek/Nenek',
          nama_wali_pengasuh: '',
          no_kontak_wali: '',
          status_sekolah: 'Aktif Sekolah',
          nama_sekolah: '',
          tingkat_kemandirian_adl: 'Mandiri',
          riwayat_penyakit_kronis: '',
          bansos_diterima: 'Belum Pernah Menerima',
          kebutuhan_mendesak: ''
        });
        loadRTData();
      } else {
        alert(res.message || 'Gagal mendaftarkan data kelompok rentan');
      }
    } catch (err) {
      alert(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setRentanSubmitting(false);
    }
  };

  // Trigger Algoritma Scan KK Otomatis
  const handleAutoScanKK = async () => {
    setScanningKK(true);
    try {
      const res = await api.get('/fasilitas/kelompok-rentan/auto-detect');
      if (res.success) {
        setScanResult(res.data);
        setActionSuccessToast(`Pemindaian KK Selesai: Terdeteksi ${res.data?.total_ditemukan || 0} potensi warga rentan.`);
        setTimeout(() => setActionSuccessToast(''), 5000);
        loadRTData();
      } else {
        alert(res.message || 'Gagal menjalankan auto-detect KK');
      }
    } catch (err) {
      alert(err.message || 'Gagal memindai Kartu Keluarga');
    } finally {
      setScanningKK(false);
    }
  };

  // ===========================================================================
  // ACTION CENTER DATA
  // ===========================================================================
  const actionItems = useMemo(() => {
    const list = [];

    // 1. Berkas mendekati / melampaui SLA
    sortedDocs.forEach((doc) => {
      const created = doc.rt_received_at || doc.created_at;
      const deadline = doc.sla_deadline;
      
      list.push({
        id: `act-doc-${doc.id}`,
        title: `Verifikasi: ${doc.jenis_surat || doc.jenis_dokumen || 'Surat Pengantar'}`,
        description: `Pemohon: ${doc.nama_pemohon || doc.nik_pemohon}. Keperluan: "${doc.keperluan || '-'}"`,
        severity: 'critical',
        deadline: deadline ? `Tenggat SLA: ${new Date(deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'SLA 4 Jam',
        icon: 'FileCheck',
        primaryAction: {
          label: 'Tinjau & Setujui',
          onClick: () => setInspectDoc(doc)
        },
        secondaryAction: {
          label: 'Catatan Revisi',
          onClick: () => {
            setActionModal({ isOpen: true, type: 'REVISE', doc, reason: '' });
          }
        }
      });
    });

    // 2. Lansia Sebatang Kara Pemantauan
    const lansiaRentanCount = kelompokRentanList.filter((k) => k.kategori === 'LANSIA_SEBATANG_KARA').length;
    if (lansiaRentanCount > 0) {
      list.push({
        id: 'act-lansia-rentan',
        title: `${lansiaRentanCount} Lansia Sebatang Kara di RT ${rtNomor} Perlu Pemantauan`,
        description: 'Terdapat lansia tinggal sendiri dengan kebutuhan kunjungan sosial / pemeriksaan kesehatan berkala.',
        severity: 'high',
        icon: 'HeartPulse',
        primaryAction: {
          label: 'Lihat Daftar Lansia',
          onClick: () => handleTabChange('rentan')
        }
      });
    }

    // 3. KK Menunggak Iuran
    if (iuranSummary.belum_bayar > 0) {
      list.push({
        id: 'act-iuran-warga',
        title: `${iuranSummary.belum_bayar} KK Belum Membayar Iuran Bulan Ini`,
        description: `Kolektivitas iuran wilayah RT mencapai ${iuranSummary.persentase} (${iuranSummary.sudah_bayar}/${iuranSummary.total_kk} KK).`,
        severity: 'medium',
        icon: 'Wallet',
        primaryAction: {
          label: 'Buka Buku Kas RT',
          onClick: () => navigate('/dashboard/keuangan')
        }
      });
    }

    return list;
  }, [sortedDocs, kelompokRentanList, iuranSummary, navigate, rtNomor]);

  return (
    <DashboardShell
      // 1. Header Role Ketua RT
      header={
        <RoleHeader
          role="ketua_rt"
          userName={user?.nama || 'Ketua RT'}
          scopeLabel={`RT ${rtNomor} / RW ${rwNomor} • Kelurahan Kebonjati`}
          onRefresh={loadRTData}
          loading={refreshing}
        />
      }
      // 2. Role-Scoped AI Brief
      briefCard={
        <AIBriefCard
          brief={aiBrief}
          loading={loadingBrief}
          onRetry={loadRTData}
        />
      }
      // 3. Grid KPI RT (Maksimal 4)
      kpiGrid={
        <KPIGrid columns={4}>
          <KPICard
            label="Antrean Masuk RT"
            value={pendingDocs.length}
            unit="berkas"
            icon={<FileCheck size={20} />}
            urgency={pendingDocs.length > 0 ? 'critical' : 'low'}
            onClick={() => handleTabChange('surat')}
          />
          <KPICard
            label="Kepatuhan SLA RT"
            value={pendingDocs.length === 0 ? '100%' : `${Math.max(60, 100 - pendingDocs.length * 10)}%`}
            unit="target"
            icon={<Clock size={20} />}
            urgency={pendingDocs.length > 2 ? 'high' : 'low'}
          />
          <KPICard
            label="Kolektivitas Iuran"
            value={iuranSummary.persentase}
            unit={`${iuranSummary.sudah_bayar} KK`}
            icon={<Wallet size={20} />}
            urgency="medium"
            onClick={() => navigate('/dashboard/keuangan')}
          />
          <KPICard
            label="Kelompok Rentan RT"
            value={kelompokRentanList.length}
            unit="jiwa"
            icon={<Heart size={20} />}
            urgency={kelompokRentanList.length > 0 ? 'high' : 'low'}
            onClick={() => handleTabChange('rentan')}
          />
        </KPIGrid>
      }
      // 4. Action Center Prioritas
      actionCenter={
        <ActionCenter
          title="Tindakan Prioritas & Verifikasi Berkas RT"
          actions={actionItems}
          onRefresh={loadRTData}
          isRefreshing={refreshing}
        />
      }
    >
      {/* Toast Notifikasi Berhasil & Error */}
      <AnimatePresence>
        {actionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm mb-4"
          >
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccessToast}</span>
          </motion.div>
        )}
        {actionErrorToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm mb-4"
          >
            <XCircle size={16} className="text-red-600 shrink-0" />
            <span>{actionErrorToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-Tabs Navigasi Meja Kerja RT */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-1.5 shadow-2xs flex flex-wrap items-center gap-1.5 mb-6">
        <button
          type="button"
          onClick={() => handleTabChange('surat')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'surat'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-surface-container'
          }`}
        >
          <FileCheck size={16} />
          <span>Antrean Surat Masuk</span>
          {pendingDocs.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
              activeTab === 'surat' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
            }`}>
              {pendingDocs.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('fasilitas')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'fasilitas'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-surface-container'
          }`}
        >
          <Building2 size={16} />
          <span>Potensi & Fasilitas Wilayah</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
            activeTab === 'fasilitas' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {keagamaanList.length + hunianSewaList.length + kesehatanList.length + pendidikanList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('rentan')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'rentan'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-surface-container'
          }`}
        >
          <Heart size={16} />
          <span>Perlindungan Yatim & Lansia</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
            activeTab === 'rentan' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
          }`}>
            {kelompokRentanList.length}
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-800">
            AI Copilot
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEJA ANTREAN VERIFIKASI SURAT RT (SOP 3-KEPUTUSAN)                  */}
      {/* ========================================================================= */}
      {activeTab === 'surat' && (
        <div id="antrean-verifikasi-rt" className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
          {/* Header Seksi & Kontrol Sorting */}
          <div className="p-4 sm:p-5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/30">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-extrabold text-on-surface">
                  Antrean Permohonan Pengantar Warga
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-bold font-mono tabular-nums rounded-full bg-primary/10 text-primary">
                  {pendingDocs.length} berkas
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Verifikasi faktual domisili dan kelengkapan berkas sebelum pengesahan berjenjang ke RW & Kelurahan.
              </p>
            </div>

            {/* Controls Bar: Search & SLA Aging */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Cari pemohon / NIK / no. reg..."
                  className="pl-8 pr-7 py-1.5 rounded-lg text-xs bg-surface-container-low border border-outline-variant focus:border-primary outline-none text-on-surface"
                />
                {docSearch && (
                  <button
                    onClick={() => setDocSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSortBy((prev) => (prev === 'aging_desc' ? 'aging_asc' : 'aging_desc'))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer"
                title="Ubah urutan antrean berdasarkan waktu tunggu (aging)"
              >
                <ArrowUpDown size={14} className="text-primary" />
                <span>
                  {sortBy === 'aging_desc' ? 'Paling Lama Diajukan' : 'Paling Baru Diajukan'}
                </span>
              </button>

              <button
                type="button"
                onClick={loadRTData}
                disabled={refreshing}
                className="p-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
                title="Muat ulang antrean"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Tabel / Daftar Antrean Surat */}
          {sortedDocs.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-bold text-on-surface">Semua Berkas Surat RT Selesai Diverifikasi!</h4>
              <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                Tidak ada permohonan surat warga yang tertahan di tingkat RT {rtNomor}. Kepatuhan pelayanan prima terjaga.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/60">
              {sortedDocs.map((doc) => {
                const isProcessingThis = processingId === doc.id;
                const docTitle = doc.jenis_surat || doc.jenis_dokumen || 'Surat Pengantar';
                const createdDate = doc.rt_received_at || doc.created_at;

                return (
                  <div
                    key={doc.id}
                    className="p-4 sm:p-5 hover:bg-surface-container-low/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Info Dokumen & Pemohon */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 tabular-nums">
                          {doc.nomor_registrasi || `REG-${doc.id}`}
                        </span>
                        <StatusBadge status="PENDING_RT" />
                        <SLABadge
                          deadline={doc.sla_deadline}
                          createdAt={createdDate}
                          status={doc.status}
                        />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Iuran RT: Lunas
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-extrabold text-on-surface tracking-tight">
                        {docTitle}
                      </h4>

                      <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span><strong>Pemohon:</strong> {doc.nama_pemohon || 'Warga'} (NIK: <span className="font-mono tabular-nums">{doc.nik_pemohon}</span>)</span>
                        <span>•</span>
                        <span><strong>Keperluan:</strong> {doc.keperluan || '-'}</span>
                        <span>•</span>
                        <span>Diajukan: {createdDate ? new Date(createdDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</span>
                      </div>
                    </div>

                    {/* SOP 3-WAY ACTIONS (Tinjau Berkas, Tolak/Revisi, Setujui) */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 self-end lg:self-center">
                      {/* Tinjau Berkas */}
                      <button
                        type="button"
                        onClick={() => setInspectDoc(doc)}
                        className="px-3 py-2 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Tinjau kelengkapan berkas & KTP pemohon"
                      >
                        <Eye size={15} />
                        <span>Tinjau</span>
                      </button>

                      {/* Catatan Revisi */}
                      <button
                        type="button"
                        disabled={isProcessingThis}
                        onClick={() => {
                          setActionModal({ isOpen: true, type: 'REVISE', doc, reason: '' });
                        }}
                        className="px-3 py-2 rounded-xl border border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100 active:scale-95 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Minta pemohon untuk melengkapi perbaikan berkas"
                      >
                        <RotateCcw size={15} />
                        <span>Revisi</span>
                      </button>

                      {/* Tolak */}
                      <button
                        type="button"
                        disabled={isProcessingThis}
                        onClick={() => {
                          setActionModal({ isOpen: true, type: 'REJECT', doc, reason: '' });
                        }}
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 active:scale-95 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Tolak permohonan surat"
                      >
                        <XCircle size={15} />
                        <span>Tolak</span>
                      </button>

                      {/* One-Touch Setujui */}
                      <button
                        type="button"
                        disabled={isProcessingThis}
                        onClick={() => handleQuickApprove(doc.id, docTitle)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Verifikasi dengan satu klik dan teruskan ke RW"
                      >
                        {isProcessingThis ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        <span>Setujui (Teruskan RW)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POTENSI & FASILITAS WILAYAH                                        */}
      {/* ========================================================================= */}
      {activeTab === 'fasilitas' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                <span>Peta Potensi & Daya Dukung Wilayah RT {rtNomor}</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Inventarisasi faskes nakes, sekolah rombel, tempat ibadah beririsan multi-RT, dan hunian sewa warga.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setShowAddFasilitasModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus size={15} />
                <span>Tambah Fasilitas / Potensi</span>
              </button>
            </div>
          </div>

          {/* Sub-Tabs Navigasi Kategori Fasilitas */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFasilitasSubTab('keagamaan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                fasilitasSubTab === 'keagamaan'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Landmark size={14} />
              <span>Tempat Ibadah ({keagamaanList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFasilitasSubTab('hunian')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                fasilitasSubTab === 'hunian'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Home size={14} />
              <span>Kos & Kontrakan ({hunianSewaList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFasilitasSubTab('kesehatan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                fasilitasSubTab === 'kesehatan'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <HeartPulse size={14} />
              <span>Faskes & Bidan ({kesehatanList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFasilitasSubTab('pendidikan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                fasilitasSubTab === 'pendidikan'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <GraduationCap size={14} />
              <span>Sekolah & Rombel ({pendidikanList.length})</span>
            </button>
          </div>

          {/* SubTab 1: Tempat Ibadah Beririsan Multi-RT */}
          {fasilitasSubTab === 'keagamaan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {keagamaanList.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <Landmark size={32} className="text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-xs font-bold text-on-surface">Belum ada data tempat ibadah yang dicatat.</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Gunakan tombol "Tambah Fasilitas" untuk mencatat masjid/musholla di lingkungan RT {rtNomor}.</p>
                </div>
              ) : (
                keagamaanList.map((item) => (
                  <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                          {item.kategori_spesifik || 'Tempat Ibadah'}
                        </span>
                        <h4 className="text-sm font-extrabold text-on-surface mt-1.5">{item.nama}</h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="shrink-0 text-slate-400" />
                          <span>{item.alamat || `RT ${rtNomor}`}</span>
                        </p>
                      </div>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-surface-container text-on-surface tabular-nums">
                        Kapasitas: {item.kapasitas || 0}
                      </span>
                    </div>

                    {item.apakah_beririsan ? (
                      <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-purple-900 text-xs font-bold">
                          <Layers size={14} className="text-purple-700" />
                          <span>Fasilitas Beririsan Multi-RT</span>
                        </div>
                        <p className="text-[11px] text-purple-800">
                          Digunakan bersama oleh warga: {Array.isArray(item.rt_rw_beririsan) ? item.rt_rw_beririsan.join(', ') : item.rt_rw_beririsan || 'Lintas RT'}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-surface-container-low text-xs text-on-surface-variant">
                        Status Legalitas: <strong className="text-on-surface">{item.status_legalitas || 'Wakaf'}</strong>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* SubTab 2: Hunian Sewa (Kos & Kontrakan) */}
          {fasilitasSubTab === 'hunian' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hunianSewaList.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <Home size={32} className="text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-xs font-bold text-on-surface">Belum ada data kos / kontrakan yang terdaftar.</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">Daftarkan rumah kontrakan dan kos untuk ketertiban administrasi kependudukan non-permanen.</p>
                </div>
              ) : (
                hunianSewaList.map((item) => (
                  <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                          {item.kategori || 'Hunian Sewa'}
                        </span>
                        <h4 className="text-sm font-extrabold text-on-surface mt-1.5">{item.nama}</h4>
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="shrink-0 text-slate-400" />
                          <span>{item.alamat}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-on-surface tabular-nums">
                          {item.penghuni_aktif || 0} / {item.jumlah_kamar || 0}
                        </span>
                        <p className="text-[10px] text-on-surface-variant">Kamar Terisi</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-surface-container-low p-2.5 rounded-xl">
                      <div>
                        <span className="text-on-surface-variant">Pelajar/Mhs:</span>{' '}
                        <strong className="font-mono tabular-nums">{item.penghuni_pelajar || 0} orang</strong>
                      </div>
                      <div>
                        <span className="text-on-surface-variant">Pekerja:</span>{' '}
                        <strong className="font-mono tabular-nums">{item.penghuni_pekerja || 0} orang</strong>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-outline-variant/60">
                        <span className="text-on-surface-variant">Kontak Pengelola:</span>{' '}
                        <strong>{item.nama_kontak || '-'} ({item.no_kontak || '-'})</strong>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SubTab 3: Faskes & Nakes */}
          {fasilitasSubTab === 'kesehatan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kesehatanList.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <HeartPulse size={32} className="text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-xs font-bold text-on-surface">Belum ada data fasilitas kesehatan di RT {rtNomor}.</p>
                </div>
              ) : (
                kesehatanList.map((item) => (
                  <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-2xs space-y-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
                        {item.kategori_spesifik || 'Faskes'}
                      </span>
                      <h4 className="text-sm font-extrabold text-on-surface mt-1.5">{item.nama}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.alamat}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center bg-surface-container-low p-2.5 rounded-xl">
                      <div>
                        <p className="text-xs font-mono font-bold text-on-surface tabular-nums">{item.jumlah_dokter || 0}</p>
                        <p className="text-[10px] text-on-surface-variant">Dokter</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-on-surface tabular-nums">{item.jumlah_bidan || 0}</p>
                        <p className="text-[10px] text-on-surface-variant">Bidan</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-on-surface tabular-nums">{item.jumlah_perawat || 0}</p>
                        <p className="text-[10px] text-on-surface-variant">Perawat</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* SubTab 4: Sekolah & Rombel */}
          {fasilitasSubTab === 'pendidikan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendidikanList.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                  <GraduationCap size={32} className="text-on-surface-variant/40 mx-auto mb-2" />
                  <p className="text-xs font-bold text-on-surface">Belum ada institusi pendidikan yang tercatat di RT {rtNomor}.</p>
                </div>
              ) : (
                pendidikanList.map((item) => (
                  <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-2xs space-y-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200 uppercase">
                        {item.kategori_spesifik || 'Pendidikan'}
                      </span>
                      <h4 className="text-sm font-extrabold text-on-surface mt-1.5">{item.nama}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.alamat}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center bg-surface-container-low p-2.5 rounded-xl">
                      <div>
                        <p className="text-xs font-mono font-bold text-on-surface tabular-nums">{item.jumlah_rombel || 0}</p>
                        <p className="text-[10px] text-on-surface-variant">Rombongan Belajar</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold text-on-surface tabular-nums">{item.kapasitas || 0}</p>
                        <p className="text-[10px] text-on-surface-variant">Daya Tampung</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PERLINDUNGAN YATIM & LANSIA (AI COPILOT + DUAL SOURCING)            */}
      {/* ========================================================================= */}
      {activeTab === 'rentan' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-on-surface">
                  Perlindungan Sosial Anak Yatim Piatu & Lansia Sebatang Kara
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>AI Copilot Active</span>
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Dual-sourcing basis data: Deteksi otomatis pemindaian KK + verifikasi faktual lapangan Ketua RT.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                disabled={scanningKK}
                onClick={handleAutoScanKK}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="Pindai Kartu Keluarga warga secara otomatis untuk menemukan lansia sendiri atau yatim piatu"
              >
                {scanningKK ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Auto-Scan Kartu Keluarga</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddRentanModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus size={15} />
                <span>Input Data Lapangan</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRentanFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rentanFilter === 'all'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Semua ({kelompokRentanList.length})
            </button>
            <button
              type="button"
              onClick={() => setRentanFilter('yatim')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rentanFilter === 'yatim'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Anak Yatim / Piatu ({kelompokRentanList.filter((k) => ['ANAK_YATIM', 'ANAK_PIATU', 'ANAK_YATIM_PIATU'].includes(k.kategori)).length})
            </button>
            <button
              type="button"
              onClick={() => setRentanFilter('lansia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rentanFilter === 'lansia'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              Lansia Sebatang Kara ({kelompokRentanList.filter((k) => k.kategori === 'LANSIA_SEBATANG_KARA').length})
            </button>
          </div>

          {/* List Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRentan.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant p-6">
                <Heart size={32} className="text-on-surface-variant/40 mx-auto mb-2" />
                <p className="text-xs font-bold text-on-surface">Tidak ada data warga rentan pada filter ini.</p>
                <p className="text-[11px] text-on-surface-variant mt-1">Gunakan "Auto-Scan Kartu Keluarga" atau "Input Data Lapangan" untuk mulai mendata.</p>
              </div>
            ) : (
              filteredRentan.map((warga) => {
                const isYatim = ['ANAK_YATIM', 'ANAK_PIATU', 'ANAK_YATIM_PIATU'].includes(warga.kategori);

                return (
                  <div key={warga.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 shadow-2xs space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                          isYatim
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {warga.kategori?.replace(/_/g, ' ')}
                        </span>
                        <h4 className="text-sm font-extrabold text-on-surface mt-1.5">{warga.nama}</h4>
                        <p className="text-xs text-on-surface-variant font-mono tabular-nums">
                          NIK: {warga.nik} • Usia: {warga.usia} thn ({warga.jenis_kelamin})
                        </p>
                      </div>
                    </div>

                    <div className="bg-surface-container-low p-2.5 rounded-xl space-y-1.5 text-xs text-on-surface">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-on-surface-variant">Status Hunian:</span>
                        <strong>{warga.status_tempat_tinggal || 'Tinggal Sendiri'}</strong>
                      </div>
                      {isYatim ? (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-on-surface-variant">Pendidikan:</span>
                          <strong>{warga.status_sekolah || '-'}</strong>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-on-surface-variant">Kemandirian Fisik (ADL):</span>
                          <strong>{warga.tingkat_kemandirian_adl || 'Mandiri'}</strong>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-on-surface-variant">Bantuan Diterima:</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                          {warga.bansos_diterima || 'Belum Menerima'}
                        </span>
                      </div>
                    </div>

                    {warga.nama_wali_pengasuh && (
                      <p className="text-[11px] text-on-surface-variant">
                        Wali / Kontak: <strong>{warga.nama_wali_pengasuh}</strong> ({warga.no_kontak_wali || '-'})
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PENOLAKAN / CATATAN REVISI DOKUMEN                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {actionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                    actionModal.type === 'REJECT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {actionModal.type === 'REJECT' ? <XCircle size={18} /> : <RotateCcw size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      {actionModal.type === 'REJECT' ? 'Tolak Permohonan Surat' : 'Minta Revisi / Perbaikan Berkas'}
                    </h4>
                    <p className="text-[11px] text-on-surface-variant">
                      Sampaikan catatan perbaikan secara transparan ke warga.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActionModal({ isOpen: false, type: '', doc: null, reason: '' })}
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {actionModal.doc && (
                <div className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg space-y-1">
                  <p><strong>Dokumen:</strong> {actionModal.doc.jenis_surat || actionModal.doc.jenis_dokumen}</p>
                  <p><strong>Pemohon:</strong> {actionModal.doc.nama_pemohon || actionModal.doc.nik_pemohon}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Alasan / Catatan Perbaikan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Lampiran foto KTP/KK kurang jelas, mohon unggah ulang foto asli yang terbaca."
                  value={actionModal.reason}
                  onChange={(e) => setActionModal((prev) => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal({ isOpen: false, type: '', doc: null, reason: '' })}
                  className="px-3 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSOPAction}
                  className={`px-4 py-2 text-xs font-bold rounded-lg text-white transition-colors shadow-sm cursor-pointer ${
                    actionModal.type === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                  }`}
                >
                  {actionModal.type === 'REJECT' ? 'Kirim Penolakan' : 'Kirim Catatan Revisi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL QUICK INSPECTION DRAWER (TINJAU BERKAS)                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {inspectDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-on-surface">Tinjau Permohonan Surat Warga</h4>
                    <p className="text-[11px] text-on-surface-variant font-mono tabular-nums">{inspectDoc.nomor_registrasi || `REG-${inspectDoc.id}`}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectDoc(null)}
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-3 rounded-xl">
                  <div>
                    <span className="text-on-surface-variant">Jenis Surat:</span>
                    <p className="font-bold text-on-surface">{inspectDoc.jenis_surat || inspectDoc.jenis_dokumen}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Waktu Pengajuan:</span>
                    <p className="font-bold text-on-surface font-mono tabular-nums">
                      {inspectDoc.created_at ? new Date(inspectDoc.created_at).toLocaleString('id-ID') : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">Nama Pemohon:</span>
                    <p className="font-bold text-on-surface">{inspectDoc.nama_pemohon || 'Warga'}</p>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">NIK Pemohon:</span>
                    <p className="font-bold text-on-surface font-mono tabular-nums">{inspectDoc.nik_pemohon}</p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-outline-variant/60">
                    <span className="text-on-surface-variant">Keperluan / Keterangan:</span>
                    <p className="font-medium text-on-surface mt-0.5">{inspectDoc.keperluan || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    const doc = inspectDoc;
                    setInspectDoc(null);
                    setActionModal({ isOpen: true, type: 'REVISE', doc, reason: '' });
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 cursor-pointer"
                >
                  Minta Revisi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const doc = inspectDoc;
                    setInspectDoc(null);
                    setActionModal({ isOpen: true, type: 'REJECT', doc, reason: '' });
                  }}
                  className="px-3 py-2 text-xs font-bold rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 cursor-pointer"
                >
                  Tolak Berkas
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickApprove(inspectDoc.id, inspectDoc.jenis_surat || inspectDoc.jenis_dokumen)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Setujui Sekarang</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL TAMBAH FASILITAS / POTENSI WILAYAH                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddFasilitasModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-on-surface">Tambah Fasilitas & Potensi RT {rtNomor}</h4>
                    <p className="text-[11px] text-on-surface-variant">Pencatatan inventarisasi daya dukung dan fasilitas warga.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddFasilitasModal(false)}
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveFasilitas} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Kategori Fasilitas</label>
                  <select
                    value={fasilitasCategory}
                    onChange={(e) => setFasilitasCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-medium"
                  >
                    <option value="keagamaan">Tempat Ibadah (Masjid / Musholla / Gereja)</option>
                    <option value="hunian-sewa">Hunian Sewa (Kos / Kontrakan)</option>
                    <option value="kesehatan">Faskes / Posyandu / Praktik Bidan</option>
                    <option value="pendidikan">Sekolah / PAUD / TK</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Nama Fasilitas / Tempat *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Masjid Jami Al-Ikhlas / Kost Melati 10"
                    value={fasilitasForm.nama}
                    onChange={(e) => setFasilitasForm((prev) => ({ ...prev, nama: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                  />
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Alamat Lengkap / Lokasi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Mawar No. 12, RT 001"
                    value={fasilitasForm.alamat}
                    onChange={(e) => setFasilitasForm((prev) => ({ ...prev, alamat: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                  />
                </div>

                {fasilitasCategory === 'keagamaan' && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-on-surface mb-1">Jenis Tempat Ibadah</label>
                        <select
                          value={fasilitasForm.kategori_spesifik}
                          onChange={(e) => setFasilitasForm((prev) => ({ ...prev, kategori_spesifik: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                        >
                          <option value="Masjid">Masjid</option>
                          <option value="Musholla">Musholla</option>
                          <option value="Gereja">Gereja</option>
                          <option value="Vihara">Vihara</option>
                          <option value="Pura">Pura</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-on-surface mb-1">Kapasitas Jamaah</label>
                        <input
                          type="number"
                          value={fasilitasForm.kapasitas}
                          onChange={(e) => setFasilitasForm((prev) => ({ ...prev, kapasitas: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fasilitasForm.apakah_beririsan}
                          onChange={(e) => setFasilitasForm((prev) => ({ ...prev, apakah_beririsan: e.target.checked }))}
                          className="rounded text-purple-600"
                        />
                        <span className="font-bold text-purple-900">Tempat Ibadah Beririsan dengan RT Lain?</span>
                      </label>
                      <p className="text-[11px] text-purple-700">
                        Centang bila jamaah atau lokasi fasilitas ini melayani lebih dari satu RT di wilayah RW {rwNomor}.
                      </p>
                    </div>
                  </>
                )}

                {fasilitasCategory === 'hunian-sewa' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-on-surface mb-1">Jumlah Kamar</label>
                      <input
                        type="number"
                        value={fasilitasForm.jumlah_kamar}
                        onChange={(e) => setFasilitasForm((prev) => ({ ...prev, jumlah_kamar: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-on-surface mb-1">Penghuni Aktif</label>
                      <input
                        type="number"
                        value={fasilitasForm.penghuni_aktif}
                        onChange={(e) => setFasilitasForm((prev) => ({ ...prev, penghuni_aktif: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-on-surface mb-1">Nama Pemilik / Pengelola</label>
                      <input
                        type="text"
                        value={fasilitasForm.nama_kontak}
                        onChange={(e) => setFasilitasForm((prev) => ({ ...prev, nama_kontak: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-on-surface mb-1">No. Kontak / WA</label>
                      <input
                        type="text"
                        value={fasilitasForm.no_kontak}
                        onChange={(e) => setFasilitasForm((prev) => ({ ...prev, no_kontak: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowAddFasilitasModal(false)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={fasilitasSubmitting}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {fasilitasSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Simpan Fasilitas</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL INPUT KELOMPOK RENTAN (ANAK YATIM & LANSIA)                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddRentanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <Heart size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-on-surface">Pendaftaran Warga Rentan RT {rtNomor}</h4>
                    <p className="text-[11px] text-on-surface-variant">Pendataan anak yatim piatu & lansia sebatang kara untuk dukungan bansos.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddRentanModal(false)}
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveRentan} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Kategori Perlindungan *</label>
                  <select
                    value={rentanForm.kategori}
                    onChange={(e) => setRentanForm((prev) => ({ ...prev, kategori: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-medium"
                  >
                    <option value="ANAK_YATIM_PIATU">Anak Yatim Piatu (Ayah & Ibu Wafat)</option>
                    <option value="ANAK_YATIM">Anak Yatim (Ayah Wafat)</option>
                    <option value="ANAK_PIATU">Anak Piatu (Ibu Wafat)</option>
                    <option value="LANSIA_SEBATANG_KARA">Lansia Sebatang Kara (Tinggal Sendiri)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">NIK Warga *</label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      placeholder="16 digit NIK"
                      value={rentanForm.nik}
                      onChange={(e) => setRentanForm((prev) => ({ ...prev, nik: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Nomor KK</label>
                    <input
                      type="text"
                      maxLength={16}
                      placeholder="16 digit No. KK"
                      value={rentanForm.no_kk}
                      onChange={(e) => setRentanForm((prev) => ({ ...prev, no_kk: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-bold text-on-surface mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama warga"
                      value={rentanForm.nama}
                      onChange={(e) => setRentanForm((prev) => ({ ...prev, nama: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Usia (Tahun)</label>
                    <input
                      type="number"
                      placeholder="Tahun"
                      value={rentanForm.usia}
                      onChange={(e) => setRentanForm((prev) => ({ ...prev, usia: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-on-surface mb-1">Alamat Domisili RT {rtNomor} *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jl. Melati No. 4"
                    value={rentanForm.alamat}
                    onChange={(e) => setRentanForm((prev) => ({ ...prev, alamat: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Status Tempat Tinggal</label>
                    <select
                      value={rentanForm.status_tempat_tinggal}
                      onChange={(e) => setRentanForm((prev) => ({ ...prev, status_tempat_tinggal: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                    >
                      <option value="Tinggal Sendiri">Tinggal Sendiri</option>
                      <option value="Bersama Kakek/Nenek">Bersama Kakek / Nenek</option>
                      <option value="Bersama Saudara/Paman/Bibi">Bersama Saudara / Kerabat</option>
                      <option value="Menumpang Warga Lain">Menumpang di Warga Lain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-on-surface mb-1">Wali / Pengasuh / Pendamping</label>
                    <input
                      type="text"
                      placeholder="Nama wali / kerabat"
                      value={rentanForm.nama_wali_pengasuh}
                      onChange={(e) => setRentanForm((prev) => ({ ...prev, nama_wali_pengasuh: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                    />
                  </div>
                </div>

                {rentanForm.kategori === 'LANSIA_SEBATANG_KARA' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-on-surface mb-1">Kemandirian Fisik (ADL)</label>
                      <select
                        value={rentanForm.tingkat_kemandirian_adl}
                        onChange={(e) => setRentanForm((prev) => ({ ...prev, tingkat_kemandirian_adl: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                      >
                        <option value="Mandiri">Mandiri</option>
                        <option value="Perlu Bantuan Ringan">Perlu Bantuan Ringan</option>
                        <option value="Perlu Bantuan Penuh">Perlu Bantuan Penuh</option>
                        <option value="Terbaring (Bedridden)">Terbaring (Bedridden)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-on-surface mb-1">Penyakit Kronis (Bila Ada)</label>
                      <input
                        type="text"
                        placeholder="Contoh: Hipertensi, Diabetes"
                        value={rentanForm.riwayat_penyakit_kronis}
                        onChange={(e) => setRentanForm((prev) => ({ ...prev, riwayat_penyakit_kronis: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowAddRentanModal(false)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={rentanSubmitting}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-primary hover:bg-primary/90 text-white shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {rentanSubmitting ? <RefreshCw size={14} className="animate-spin" /> : <Heart size={14} />}
                    <span>Daftarkan Warga Rentan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
