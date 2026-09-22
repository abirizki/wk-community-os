/**
 * frontend/src/pages/dashboard/DashboardKetuaRT.jsx
 * Dedicated Action-Oriented Dashboard for Ketua RT (Sprint 2)
 * Features: SLA Countdown, Aging Sorting, Quick One-Touch Verification, Action Center
 * Dedicated Modern Command Desk for Ketua RT (Rukun Tetangga)
 * Bumi Warga - Jabar Pintar Digital
 * Modern Action-Oriented Dashboard for Ketua RT (Bumi Warga - Jabar Pintar Digital)
 * 
 * Features:
 * 1. SLA Countdown & Aging Sorting with One-Touch Verification & SOP 3-Way Decisions (Setujui, Revisi, Tolak)
 * 2. Quick Inspection Drawer/Modal (Tinjau Berkas & KTP/KK Pemohon)
 * 3. Potensi & Daya Dukung Wilayah: Faskes (Nakes), Sekolah (Rombel), Hunian Sewa (Kos/Kontrakan), Tempat Ibadah Beririsan
 * 4. Dual-Sourcing Kelompok Rentan: Anak Yatim Piatu & Lansia Sebatang Kara (Auto-Scan KK + Input Lapangan RT)
 * 5. 100% Tabular Nums & Monospace Typography
 * 1. SLA Countdown, Aging Sorting, Quick Inspection Drawer, and SOP 3-Way Decisions (Setujui, Revisi, Tolak).
 * 2. Potensi & Fasilitas Wilayah: Tempat Ibadah Beririsan Multi-RT, Hunian Sewa (Kos/Kontrakan), Faskes, Sekolah.
 * 3. Perlindungan Sosial: Anak Yatim Piatu & Lansia Sebatang Kara (Auto-Scan KK + Input Lapangan RT).
 * 4. 100% Tabular Nums & Monospace Typography.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Sparkles,
  Layers,
  Heart,
  CheckSquare
  MessageCircle,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardKetuaRT() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  // Active Tab State: 'surat' | 'fasilitas' | 'rentan'
  const currentTabParam = searchParams.get('tab') || 'surat';
  const [activeTab, setActiveTab] = useState(currentTabParam);
  // Active Tab: 'surat' | 'fasilitas' | 'rentan'
  const activeTab = searchParams.get('tab') || 'surat';
  const setActiveTab = (tab) => setSearchParams({ tab });

  // Sync tab with URL
  useEffect(() => {
    if (currentTabParam && ['surat', 'fasilitas', 'rentan'].includes(currentTabParam)) {
      setActiveTab(currentTabParam);
    }
  }, [currentTabParam]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // State Data
  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);

  // RT Data
  // RT Document & Dues Data
  // Tab 1: Antrean Dokumen
  const [pendingDocs, setPendingDocs] = useState([]);
  const [docStats, setDocStats] = useState({ pending_rt: 0, total_approved: 0, total_rejected: 0, compliance_rate: '100%' });
  const [iuranSummary, setIuranSummary] = useState({ total_kk: 0, sudah_bayar: 0, belum_bayar: 0, persentase: '0%' });
  const [balitaRisikoCount, setBalitaRisikoCount] = useState(0);
  const [auditSanggahanPending, setAuditSanggahanPending] = useState([]);
  const [docSearch, setDocSearch] = useState('');
  const [sortBy, setSortBy] = useState('aging_desc'); // 'aging_desc' (SLA first) | 'aging_asc'
  const [inspectDoc, setInspectDoc] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Sorting: 'aging_desc' (paling lama di atas) | 'aging_asc' (terbaru di atas)
  const [sortBy, setSortBy] = useState('aging_desc');
  // Modal Aksi SOP (Revisi & Tolak)
  const [actionModal, setActionModal] = useState({
    isOpen: false,
    type: '', // 'REVISE' | 'REJECT'
    doc: null,
    reason: ''
  });

  // Quick Action Modal / State
  // Fasilitas & Potensi Wilayah Data
  // Tab 2: Fasilitas & Hunian Sewa
  const [fasilitasSubTab, setFasilitasSubTab] = useState('keagamaan'); // 'keagamaan' | 'hunian' | 'kesehatan' | 'pendidikan'
  const [keagamaanList, setKeagamaanList] = useState([]);
  const [hunianSewaList, setHunianSewaList] = useState([]);
  const [kesehatanList, setKesehatanList] = useState([]);
  const [pendidikanList, setPendidikanList] = useState([]);
  const [fasilitasSubTab, setFasilitasSubTab] = useState('keagamaan'); // 'keagamaan' | 'hunian' | 'kesehatan' | 'pendidikan'

  // Kelompok Rentan Data (Anak Yatim Piatu & Lansia)
  const [kelompokRentanList, setKelompokRentanList] = useState([]);
  const [rentanFilter, setRentanFilter] = useState('all'); // 'all' | 'yatim' | 'lansia'
  const [scanningKK, setScanningKK] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  // Modals & Action States
  const [processingId, setProcessingId] = useState(null);
  const [inspectDoc, setInspectDoc] = useState(null); // Quick inspection drawer
  const [rejectModalDoc, setRejectModalDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [reviseModalDoc, setReviseModalDoc] = useState(null);
  const [reviseReason, setReviseReason] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState('');
  const [actionErrorToast, setActionErrorToast] = useState('');

  // Fetch all RT Dashboard Data
  // Form Modals
  const [showAddFasilitasModal, setShowAddFasilitasModal] = useState(false);
  const [fasilitasCategory, setFasilitasCategory] = useState('keagamaan');
  const [fasilitasSubmitting, setFasilitasSubmitting] = useState(false);
  const [fasilitasForm, setFasilitasForm] = useState({
    kategori: 'keagamaan',
    nama: '',
    alamat: '',
    kapasitas: '',
    kategori_spesifik: 'Masjid',
    kapasitas: 100,
    status_legalitas: 'Wakaf',
    apakah_beririsan: 0,
    rt_rw_beririsan: ['RT 001 / RW 001', 'RT 002 / RW 001'],
    apakah_beririsan: false,
    rt_rw_beririsan: ['RT 001', 'RT 002'],
    jumlah_kamar: '',
    penghuni_aktif: '',
    nama_kontak: '',
    no_kontak: '',
    jumlah_kamar: 4,
    penghuni_aktif: 4,
    penghuni_pelajar: 0,
    penghuni_pekerja: 4,
    pemilik_di_rt: 0,
    alamat_pemilik: '',
    jumlah_dokter: 1,
    jumlah_bidan: 2,
    jumlah_perawat: 2,
    daya_tampung_kursi: 60,
    jumlah_rombel: 2
    no_kontak: ''
  });

  // Tab 3: Kelompok Rentan
  const [kelompokRentanList, setKelompokRentanList] = useState([]);
  const [rentanFilter, setRentanFilter] = useState('all'); // 'all' | 'yatim' | 'lansia'
  const [scanningKK, setScanningKK] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [showAddRentanModal, setShowAddRentanModal] = useState(false);
  const [rentanSubmitting, setRentanSubmitting] = useState(false);
  const [rentanForm, setRentanForm] = useState({
    kategori: 'ANAK_YATIM_PIATU',
    kategori: 'ANAK_YATIM',
    nik: '',
    nama: '',
    no_kk: '',
    tanggal_lahir: '',
    usia: 10,
    usia: '',
    jenis_kelamin: 'L',
    alamat: 'Jl. Melati No. ',
    status_tempat_tinggal: 'Bersama Kakek/Nenek',
    nama_wali_pengasuh: '',
    no_kontak_wali: '',
    status_sekolah: 'Aktif Sekolah',
    nama_sekolah: '',
    tingkat_kemandirian_adl: 'Tidak Berlaku',
    riwayat_penyakit_kronis: '',
    bansos_diterima: 'Belum Pernah Menerima',
    kebutuhan_mendesak: ''
    alamat: '',
    adl_kemandirian: 'Mandiri',
    kondisi_kesehatan: '',
    bansos_diterima: ''
  });

  // Load All RT Data
  // KPI & Summary Data
  const [iuranSummary, setIuranSummary] = useState({ total_kk: 65, sudah_bayar: 58, belum_bayar: 7, persentase: '89%' });
  const [actionSuccessToast, setActionSuccessToast] = useState('');

  const rtNomor = user?.rt || '001';
  const rwNomor = user?.rw || '001';

  // Fetch Data
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

      // 2. Fetch Core Data Parallel
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
        api.get(`/dokumen/stats?rt=${user?.rt || '001'}&rw=${user?.rw || '001'}`),
        api.get(`/keuangan/iuran?rt=${user?.rt || '001'}&rw=${user?.rw || '001'}`),
        api.get('/bansos/audit-sanggahan'),
        api.get(`/posyandu/balita/stats?rt=${user?.rt || '001'}`),
        api.get('/fasilitas/keagamaan'),
        api.get('/fasilitas/hunian-sewa'),
        api.get('/fasilitas/kesehatan'),
        api.get('/fasilitas/pendidikan'),
        api.get('/fasilitas/kelompok-rentan')
        api.get('/dokumen?approval_step=RT'),
        api.get(`/keuangan/iuran?rt=${rtNomor}&rw=${rwNomor}`),
        api.get(`/fasilitas/keagamaan?rt=${rtNomor}&rw=${rwNomor}`),
        api.get(`/fasilitas/hunian-sewa?rt=${rtNomor}&rw=${rwNomor}`),
        api.get(`/fasilitas/kesehatan?rt=${rtNomor}&rw=${rwNomor}`),
        api.get(`/fasilitas/pendidikan?rt=${rtNomor}&rw=${rwNomor}`),
        api.get(`/fasilitas/kelompok-rentan?rt=${rtNomor}&rw=${rwNomor}`)
      ]);

      // Handle Dokumen Antrean
      // Dokumen Antrean RT
      if (docListRes.status === 'fulfilled' && docListRes.value?.success) {
        const rawDocs = docListRes.value.data || [];
        // Filter specifically documents needing RT verification
        const forRT = rawDocs.filter((d) => d.approval_step === 'RT' && d.status !== 'REJECTED');
        setPendingDocs(forRT);
      if (docListRes.status === 'fulfilled' && docListRes.value) {
        const raw = docListRes.value.data || docListRes.value || [];
        const list = Array.isArray(raw) ? raw : [];
        setPendingDocs(list.filter(d => d.approval_step === 'RT' && d.status !== 'REJECTED'));
      }

      // Handle Stats
      // Stats
      if (docStatsRes.status === 'fulfilled' && docStatsRes.value?.success) {
        setDocStats(docStatsRes.value.data || {});
      }

      // Handle Iuran
      // Iuran RT
      // Iuran
      if (iuranRes.status === 'fulfilled' && iuranRes.value?.data) {
        const iuranList = iuranRes.value.data || [];
        const lunas = iuranList.filter((i) => i.status_bayar === 'LUNAS').length;
        const total = iuranList.length || 1;
        const pct = Math.round((lunas / total) * 100);
        const list = iuranRes.value.data || [];
        const lunas = list.filter(i => i.status_bayar === 'LUNAS').length;
        const total = list.length || 65;
        setIuranSummary({
          total_kk: total,
          sudah_bayar: lunas,
          belum_bayar: total - lunas,
          persentase: `${pct}%`
          persentase: `${Math.round((lunas / total) * 100)}%`
        });
      }

      // Handle Bansos Sanggahan
      // Bansos Sanggahan
      if (bansosRes.status === 'fulfilled' && bansosRes.value?.data) {
        const list = bansosRes.value.data || [];
        const pendingSanggahan = list.filter((s) => s.status_review === 'PENDING_KELURAHAN' && s.rt === (user?.rt || '001'));
        setAuditSanggahanPending(pendingSanggahan);
      // Fasilitas
      if (keagamaanRes.status === 'fulfilled' && keagamaanRes.value?.data) {
        setKeagamaanList(keagamaanRes.value.data);
      }

      // Handle Balita Risiko
      // Balita Risiko
      if (balitaRes.status === 'fulfilled' && balitaRes.value?.data) {
        const bStats = balitaRes.value.data || {};
        setBalitaRisikoCount(bStats.berisiko_stunting || (bStats.gizi_kurang || 0) + (bStats.gizi_buruk || 0));
      if (hunianRes.status === 'fulfilled' && hunianRes.value?.data) {
        setHunianSewaList(hunianRes.value.data);
      }

      // Fasilitas Keagamaan
      if (keagamaanRes.status === 'fulfilled' && keagamaanRes.value?.success) {
        setKeagamaanList(keagamaanRes.value.data || []);
      if (kesehatanRes.status === 'fulfilled' && kesehatanRes.value?.data) {
        setKesehatanList(kesehatanRes.value.data.inventory || kesehatanRes.value.data || []);
      }

      // Hunian Sewa
      if (hunianRes.status === 'fulfilled' && hunianRes.value?.success) {
        setHunianSewaList(hunianRes.value.data || []);
      if (pendidikanRes.status === 'fulfilled' && pendidikanRes.value?.data) {
        setPendidikanList(pendidikanRes.value.data.inventory || pendidikanRes.value.data || []);
      }

      // Kesehatan
      if (kesehatanRes.status === 'fulfilled' && kesehatanRes.value?.success) {
        setKesehatanList(kesehatanRes.value.data?.inventory || []);
      }

      // Pendidikan
      if (pendidikanRes.status === 'fulfilled' && pendidikanRes.value?.success) {
        setPendidikanList(pendidikanRes.value.data?.inventory || []);
      }

      // Kelompok Rentan
      if (rentanRes.status === 'fulfilled' && rentanRes.value?.success) {
        setKelompokRentanList(rentanRes.value.data || []);
      if (rentanRes.status === 'fulfilled' && rentanRes.value?.data) {
        setKelompokRentanList(rentanRes.value.data);
      }

    } catch (err) {
      console.warn('[DashboardRT] Error loading data:', err.message);
      console.warn('[DashboardRT] Gagal memuat data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRTData();
  }, [user?.rt, user?.rw]);
  }, [rtNomor, rwNomor]);

  // ===========================================================================
  // SORTING AGING LOGIC
  // ===========================================================================
  // Aging Sort Logic
  // Filtered & Sorted Dokumen
  const sortedDocs = useMemo(() => {
    const list = [...pendingDocs];
    list.sort((a, b) => {
      const timeA = new Date(a.created_at || a.rt_received_at || 0).getTime();
      const timeB = new Date(b.created_at || b.rt_received_at || 0).getTime();
      // aging_desc: paling lama diajukan (timestamp terkecil) berada di paling atas
      if (sortBy === 'aging_desc') {
        return timeA - timeB;
      }
      // aging_asc: paling baru diajukan di atas
      if (sortBy === 'aging_desc') return timeA - timeB;
      return timeB - timeA;
    return pendingDocs.filter(d => {
      const q = docSearch.toLowerCase();
      return !q || 
        (d.nama_pemohon || '').toLowerCase().includes(q) ||
        (d.nik_pemohon || '').includes(q) ||
        (d.jenis_dokumen || '').toLowerCase().includes(q) ||
        (d.nomor_registrasi || '').toLowerCase().includes(q);
    }).sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return sortBy === 'aging_desc' ? timeA - timeB : timeB - timeA;
    });
    return list;
  }, [pendingDocs, sortBy]);
  }, [pendingDocs, docSearch, sortBy]);

  // ===========================================================================
  // ONE-TOUCH QUICK VERIFICATION
  // ===========================================================================
  // Action Center Items
  const actionItems = useMemo(() => {
    const list = [];

    // 1. Berkas mendekati / melampaui SLA
    sortedDocs.forEach((doc) => {
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
            setReviseModalDoc(doc);
            setReviseReason('');
          }
        }
      });
    });

    // 2. Lansia Sebatang Kara yang Perlu Kunjungan
    const lansiaRentanCount = kelompokRentanList.filter(k => k.kategori === 'LANSIA_SEBATANG_KARA').length;
    if (lansiaRentanCount > 0) {
      list.push({
        id: 'act-lansia-rentan',
        title: `${lansiaRentanCount} Lansia Sebatang Kara di RT ${user?.rt || '001'} Perlu Pemantauan`,
        description: 'Terdapat lansia tinggal sendiri dengan kebutuhan kunjungan sosial / pemeriksaan tensi berkala.',
        severity: 'high',
        icon: 'HeartPulse',
        primaryAction: {
          label: 'Lihat Daftar Lansia',
          onClick: () => handleTabChange('rentan')
        }
      });
  // SLA Calculation (SOP RT: 4 jam kerja)
  const calculateSLA = (createdAt) => {
    if (!createdAt) return { text: 'Baru Masuk', urgent: false, expired: false };
    const diffHours = (new Date() - new Date(createdAt)) / (1000 * 60 * 60);
    const hoursLeft = 4 - diffHours;
    if (hoursLeft <= 0) {
      return { text: 'SLA Terlewati', urgent: true, expired: true };
    }

    // 3. Iuran Warga Menunggak
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
    if (hoursLeft <= 1.5) {
      return { text: `Sisa ${Math.round(hoursLeft * 60)} mnt`, urgent: true, expired: false };
    }
    return { text: `Sisa ${Math.round(hoursLeft)} jam`, urgent: false, expired: false };
  };

    return list;
  }, [sortedDocs, kelompokRentanList, iuranSummary, navigate, user?.rt]);

  // 1. SOP ACTION: SETUJUI (APPROVE)
  const handleQuickApprove = async (docId, docTitle) => {
    if (!window.confirm(`Setujui permohonan surat "${docTitle}" dan teruskan ke Ketua RW?`)) {
      return;
    }

  // SOP 1: Approve
  const handleApprove = async (docId) => {
    setProcessingId(docId);
    try {
      setProcessingId(docId);
      const res = await api.patch(`/dokumen/${docId}/approve`, {
        catatan: 'Disetujui oleh Ketua RT setelah verifikasi faktual.'
        catatan: 'Disetujui oleh Ketua RT setelah verifikasi faktual domisili.'
      });

      if (res.success) {
        setActionSuccessToast(`Surat "${docTitle}" berhasil diverifikasi dan diteruskan ke RW!`);
        setTimeout(() => setActionSuccessToast(''), 4000);
        // Refresh local list
        setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
        setInspectDoc(null);
        loadRTData();
      } else {
        alert(res.message || 'Gagal memproses persetujuan');
        setActionErrorToast(res.message || 'Gagal memproses persetujuan');
      }
    } catch (e) {
      alert(e.message || 'Terjadi kesalahan saat memproses verifikasi');
      setActionErrorToast(e.message || 'Terjadi kesalahan saat memproses verifikasi');
      setActionSuccessToast(res.message || 'Permohonan disetujui & diteruskan ke Ketua RW.');
      setPendingDocs(prev => prev.filter(d => d.id !== docId));
      if (inspectDoc?.id === docId) setInspectDoc(null);
      setTimeout(() => setActionSuccessToast(''), 4000);
    } catch (err) {
      alert(err.message || 'Gagal menyetujui dokumen.');
    } finally {
      setProcessingId(null);
    }
  };

  // 2. SOP ACTION: KEMBALIKAN DENGAN CATATAN (REVISE)
  const handleQuickRevise = async () => {
    if (!reviseModalDoc) return;
    if (!reviseReason.trim() || reviseReason.trim().length < 3) {
      alert('Mohon masukkan petunjuk perbaikan berkas yang jelas untuk warga pemohon.');
  // SOP 2 & 3: Revise & Reject Confirmation
  const handleConfirmAction = async () => {
    if (!actionModal.doc) return;
    if (!actionModal.reason.trim()) {
      alert('Mohon masukkan catatan atau alasan yang jelas.');
      return;
    }

    try {
      setProcessingId(reviseModalDoc.id);
      const res = await api.patch(`/dokumen/${reviseModalDoc.id}/revise`, {
        catatan: reviseReason.trim()
      });
    setProcessingId(actionModal.doc.id);
    const docId = actionModal.doc.id;

      if (res.success) {
        setActionSuccessToast(`Berkas dikembalikan ke pemohon untuk perbaikan tanpa membatalkan nomor surat.`);
        setTimeout(() => setActionSuccessToast(''), 4000);
        setPendingDocs((prev) => prev.filter((d) => d.id !== reviseModalDoc.id));
        setReviseModalDoc(null);
        setReviseReason('');
        setInspectDoc(null);
        loadRTData();
      } else {
        setActionErrorToast(res.message || 'Gagal mengembalikan berkas');
      }
    } catch (e) {
      setActionErrorToast(e.message || 'Terjadi kesalahan saat mengembalikan berkas');
    } finally {
      setProcessingId(null);
    }
  };

  // 3. SOP ACTION: TOLAK PERMANEN (REJECT)
  const handleQuickReject = async () => {
    if (!rejectModalDoc) return;
    if (!rejectReason.trim()) {
      alert('Mohon masukkan alasan penolakan resmi agar tercatat dalam berita acara.');
      return;
    }

    try {
      setProcessingId(rejectModalDoc.id);
      const res = await api.patch(`/dokumen/${rejectModalDoc.id}/reject`, {
        catatan: rejectReason.trim()
      });

      if (res.success) {
        setActionSuccessToast(`Permohonan surat ditolak dengan catatan resmi ke pemohon.`);
        setTimeout(() => setActionSuccessToast(''), 4000);
        setPendingDocs((prev) => prev.filter((d) => d.id !== rejectModalDoc.id));
        setRejectModalDoc(null);
        setRejectReason('');
        setInspectDoc(null);
        loadRTData();
      } else {
        alert(res.message || 'Gagal menolak dokumen');
        setActionErrorToast(res.message || 'Gagal menolak dokumen');
      if (actionModal.type === 'REVISE') {
        const res = await api.patch(`/dokumen/${docId}/revise`, {
          catatan: actionModal.reason
        });
        setActionSuccessToast(res.message || 'Berkas dikembalikan ke pemohon untuk perbaikan.');
      } else if (actionModal.type === 'REJECT') {
        const res = await api.patch(`/dokumen/${docId}/reject`, {
          catatan: actionModal.reason
        });
        setActionSuccessToast(res.message || 'Permohonan surat resmi ditolak.');
      }
    } catch (e) {
      alert(e.message || 'Terjadi kesalahan saat menolak permohonan');
      setActionErrorToast(e.message || 'Terjadi kesalahan saat menolak permohonan');
    } finally {
      setProcessingId(null);
    }
  };

  // ===========================================================================
  // ACTION CENTER DATA
  // ===========================================================================
  const actionItems = useMemo(() => {
    const list = [];

    // 1. Berkas mendekati / melampaui SLA 4 jam
    sortedDocs.forEach((doc) => {
      const created = doc.rt_received_at || doc.created_at;
      const deadline = doc.sla_deadline;
      
      list.push({
        id: `act-doc-${doc.id}`,
        title: `Verifikasi: ${doc.jenis_surat || doc.jenis_dokumen || 'Surat Pengantar'}`,
        description: `Pemohon: ${doc.nama_pemohon || doc.nik_pemohon}. Keperluan: "${doc.keperluan || '-'}"`,
        severity: 'critical',
        deadline: deadline ? `Tenggat SLA: ${new Date(deadline).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'SLA 24 Jam',
        icon: 'FileCheck',
        primaryAction: {
          label: 'Setujui',
          onClick: () => handleQuickApprove(doc.id, doc.jenis_surat || 'Surat')
        },
        secondaryAction: {
          label: 'Tolak / Revisi',
          onClick: () => {
            setRejectModalDoc(doc);
            setRejectReason('');
          }
        }
      });
    });

    // 2. Sanggahan Bansos RT Pending
    if (auditSanggahanPending.length > 0) {
      list.push({
        id: 'act-bansos-sanggahan',
        title: `${auditSanggahanPending.length} Usulan Sanggahan Bansos Menunggu Review`,
        description: 'Laporan lapangan ketidaklayakan penerima bansos sedang dalam peninjauan Kelurahan.',
        severity: 'high',
        icon: 'Gift',
        primaryAction: {
          label: 'Cek Status Sanggahan',
          onClick: () => navigate('/dashboard/bansos')
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
  }, [sortedDocs, auditSanggahanPending, iuranSummary, navigate]);

  // Handle Input Fasilitas Baru
  const handleSaveFasilitas = async (e) => {
    e.preventDefault();
    setFasilitasSubmitting(true);
    try {
      let endpoint = '/fasilitas/keagamaan';
      let payload = {};

      if (fasilitasCategory === 'keagamaan') {
        endpoint = '/fasilitas/keagamaan';
        payload = {
          nama_tempat_ibadah: fasilitasForm.nama,
          jenis_agama: 'Islam',
          jenis_tempat_ibadah: fasilitasForm.kategori_spesifik,
          alamat: fasilitasForm.alamat,
          daya_tampung_jamaah: Number(fasilitasForm.kapasitas) || 100,
          status_tanah: fasilitasForm.status_legalitas,
          apakah_beririsan: fasilitasForm.apakah_beririsan ? 1 : 0,
          rt_rw_beririsan: fasilitasForm.rt_rw_beririsan,
          nama_pengurus_dkm: fasilitasForm.nama_kontak,
          no_kontak_pengurus: fasilitasForm.no_kontak
        };
      } else if (fasilitasCategory === 'hunian') {
        endpoint = '/fasilitas/hunian-sewa';
        payload = {
          nama_hunian: fasilitasForm.nama,
          jenis_hunian: fasilitasForm.kategori_spesifik === 'Kontrakan' ? 'Rumah Kontrakan' : 'Kos-Kosan',
          alamat: fasilitasForm.alamat,
          jumlah_kamar_pintu: Number(fasilitasForm.jumlah_kamar) || 1,
          jumlah_penghuni_aktif: Number(fasilitasForm.penghuni_aktif) || 0,
          jumlah_penghuni_pelajar: Number(fasilitasForm.penghuni_pelajar) || 0,
          jumlah_penghuni_pekerja: Number(fasilitasForm.penghuni_pekerja) || 0,
          nama_pemilik: fasilitasForm.nama_kontak || 'Pemilik Kos',
          no_kontak_pemilik: fasilitasForm.no_kontak || '08123456789',
          apakah_pemilik_tinggal_di_rt: fasilitasForm.pemilik_di_rt ? 1 : 0,
          alamat_pemilik: fasilitasForm.alamat_pemilik
        };
      } else if (fasilitasCategory === 'kesehatan') {
        endpoint = '/fasilitas/kesehatan';
        payload = {
          nama_faskes: fasilitasForm.nama,
          jenis_faskes: fasilitasForm.kategori_spesifik,
          alamat: fasilitasForm.alamat,
          jumlah_dokter: Number(fasilitasForm.jumlah_dokter) || 0,
          jumlah_bidan: Number(fasilitasForm.jumlah_bidan) || 0,
          jumlah_perawat: Number(fasilitasForm.jumlah_perawat) || 0,
          penanggung_jawab: fasilitasForm.nama_kontak,
          no_kontak: fasilitasForm.no_kontak
        };
      } else if (fasilitasCategory === 'pendidikan') {
        endpoint = '/fasilitas/pendidikan';
        payload = {
          nama_sekolah: fasilitasForm.nama,
          jenjang: fasilitasForm.kategori_spesifik,
          alamat: fasilitasForm.alamat,
          daya_tampung_kursi_baru: Number(fasilitasForm.daya_tampung_kursi) || 0,
          jumlah_rombel: Number(fasilitasForm.jumlah_rombel) || 1,
          kepala_sekolah: fasilitasForm.nama_kontak,
          no_telepon: fasilitasForm.no_kontak
        };
      }

      await api.post(endpoint, payload);
      setActionSuccessToast(`Fasilitas "${fasilitasForm.nama}" berhasil didaftarkan dan menunggu verifikasi Kelurahan.`);
      setPendingDocs(prev => prev.filter(d => d.id !== docId));
      if (inspectDoc?.id === docId) setInspectDoc(null);
      setActionModal({ isOpen: false, type: '', doc: null, reason: '' });
      setTimeout(() => setActionSuccessToast(''), 4000);
      setShowAddFasilitasModal(false);
      loadRTData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan fasilitas');
      alert(err.message || 'Gagal memproses aksi.');
    } finally {
      setFasilitasSubmitting(false);
      setProcessingId(null);
    }
  };

  // Handle Input Kelompok Rentan
  const handleSaveRentan = async (e) => {
    e.preventDefault();
    setRentanSubmitting(true);
    try {
      await api.post('/fasilitas/kelompok-rentan', rentanForm);
      setActionSuccessToast(`Data warga rentan "${rentanForm.nama}" berhasil dicatat untuk pemantauan perlindungan sosial.`);
      setTimeout(() => setActionSuccessToast(''), 4000);
      setShowAddRentanModal(false);
      loadRTData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan data kelompok rentan');
    } finally {
      setRentanSubmitting(false);
    }
  };
  // Trigger Algoritma Scan KK Otomatis
  // Scan KK Otomatis
  const handleAutoScanKK = async () => {
    setScanningKK(true);
    try {
      const res = await api.get('/fasilitas/kelompok-rentan/auto-detect');
      if (res.success) {
        setScanResult(res.data);
        setActionSuccessToast(`Pemindaian KK selesai: ${res.data.potensi_yatim_piatu.length} anak & ${res.data.potensi_lansia_rentan.length} lansia terdeteksi.`);
        setTimeout(() => setActionSuccessToast(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Gagal menjalankan pemindaian KK');
    } finally {
      setScanningKK(false);
    }
  };

  // Filtered Kelompok Rentan List
  // Filtered Kelompok Rentan
  const filteredKelompokRentan = useMemo(() => {
    if (rentanFilter === 'yatim') {
      return kelompokRentanList.filter(k => k.kategori.startsWith('ANAK_'));
      return kelompokRentanList.filter(k => k.kategori.includes('YATIM') || k.kategori.includes('PIATU'));
    }
    if (rentanFilter === 'lansia') {
      return kelompokRentanList.filter(k => k.kategori.startsWith('LANSIA_'));
      return kelompokRentanList.filter(k => k.kategori.includes('LANSIA'));
    }
    return kelompokRentanList;
  }, [kelompokRentanList, rentanFilter]);

  return (
    <DashboardShell
      // 1. Header Role Ketua RT
      header={
        <RoleHeader
          role="ketua_rt"
          userName={user?.nama || 'Ketua RT'}
          scopeLabel={`RT ${user?.rt || '001'} / RW ${user?.rw || '001'} · Kelurahan Kebonjati`}
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
            label="Antrean Surat Masuk"
            value={pendingDocs.length}
            unit="berkas"
            icon={<FileCheck size={20} />}
            urgency={pendingDocs.length > 0 ? 'critical' : 'low'}
            onClick={() => {
              const el = document.getElementById('antrean-verifikasi-rt');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onClick={() => handleTabChange('surat')}
          />
          <KPICard
            label="Kepatuhan SLA RT"
            value={pendingDocs.length === 0 ? '100%' : `${Math.max(60, 100 - pendingDocs.length * 10)}%`}
            unit="target"
            unit="target < 4 Jam"
            icon={<Clock size={20} />}
            urgency={pendingDocs.length > 2 ? 'high' : 'low'}
          />
          <KPICard
            label="Kolektivitas Iuran"
            value={iuranSummary.persentase}
            unit={`${iuranSummary.sudah_bayar} KK`}
            unit={`${iuranSummary.sudah_bayar} / ${iuranSummary.total_kk} KK`}
            icon={<Wallet size={20} />}
            urgency="medium"
            onClick={() => navigate('/dashboard/keuangan')}
          />
          <KPICard
            label="Balita Risiko di RT"
            value={balitaRisikoCount}
            unit="anak"
            icon={<Baby size={20} />}
            urgency={balitaRisikoCount > 0 ? 'high' : 'low'}
            onClick={() => navigate('/dashboard/posyandu')}
            label="Warga Rentan & Yatim"
            value={kelompokRentanList.length}
            unit="jiwa terpantau"
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
          title="Tindakan Prioritas Meja Kerja RT"
          actions={actionItems}
          onRefresh={loadRTData}
          isRefreshing={refreshing}
        />
      }
    >
      {/* Toast Notifikasi Berhasil */}
    <div className="space-y-6 pb-16">
      {/* 1. Header Komando Eksekutif RT */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-blue-700/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/30">
                <Home className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Meja Kerja Ketua RT</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    RT {rtNomor} / RW {rwNomor}
                  </span>
                </div>
                <p className="text-sm text-blue-200/80 mt-0.5">
                  Pelayanan Warga Faktual, Sensus Fasilitas Wilayah & Perlindungan Sosial • Kelurahan Kebonjati
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadRTData}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-blue-800/40 hover:bg-blue-700/50 border border-blue-600/40 text-blue-100 transition-colors self-start md:self-auto shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </button>
        </div>

        {/* Metrik Cepat KPI RT */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-blue-800/50">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>Antrean Surat Masuk</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-amber-300">
              {pendingDocs.length} <span className="text-xs font-normal text-amber-200/70 font-sans">Berkas</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs">
              <Wallet className="w-3.5 h-3.5" />
              <span>Kepatuhan Iuran Kas</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-emerald-300">
              {iuranSummary.persentase} <span className="text-xs font-normal text-emerald-200/70 font-sans">({iuranSummary.sudah_bayar}/{iuranSummary.total_kk} KK)</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-rose-300 text-xs">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Kelompok Rentan RT</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-rose-300">
              {kelompokRentanList.length} <span className="text-xs font-normal text-rose-200/70 font-sans">Sasaran</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 text-sky-300 text-xs">
              <Building2 className="w-3.5 h-3.5" />
              <span>Kos & Fasilitas RT</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono tabular-nums text-sky-300">
              {hunianSewaList.length + keagamaanList.length} <span className="text-xs font-normal text-sky-200/70 font-sans">Lokasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifikasi Sukses */}
      <AnimatePresence>
        {actionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm mb-4"
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 shadow-sm"
          >
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{actionSuccessToast}</span>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-medium">{actionSuccessToast}</p>
            </div>
            <button onClick={() => setActionSuccessToast('')} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
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

      {/* ========================================================================= */}
      {/* SECTION ANTREAN VERIFIKASI DOKUMEN RT (DENGAN SORTING AGING)               */}
      {/* KONTROL SUB-TAB UTAMA KETUA RT                                             */}
      {/* ========================================================================= */}
      <div id="antrean-verifikasi-rt" className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
        {/* Header Seksi & Kontrol Sorting */}
        <div className="p-4 sm:p-5 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low/30">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold text-on-surface">
                Daftar Antrean Permohonan Surat Warga
              </h3>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/10 text-primary">
                {pendingDocs.length} berkas
              </span>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-1.5 shadow-2xs flex flex-wrap items-center gap-1.5 mb-6">
      {/* 2. Sub-Tabs Navigasi Meja Kerja RT */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => handleTabChange('surat')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          onClick={() => setActiveTab('surat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'surat'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-surface-container'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck size={16} />
          <span>Antrean Surat Masuk</span>
          <FileCheck className="w-4 h-4" />
          <span>Antrean Surat Warga</span>
          {pendingDocs.length > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
              activeTab === 'surat' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
              activeTab === 'surat' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {pendingDocs.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('fasilitas')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          onClick={() => setActiveTab('fasilitas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'fasilitas'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-surface-container'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 size={16} />
          <Building2 className="w-4 h-4" />
          <span>Potensi & Fasilitas Wilayah</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
            activeTab === 'fasilitas' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {keagamaanList.length + hunianSewaList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('rentan')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
          onClick={() => setActiveTab('rentan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
            activeTab === 'rentan'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-surface-container'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Heart size={16} />
          <HeartPulse className="w-4 h-4" />
          <span>Perlindungan Yatim & Lansia</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
            activeTab === 'rentan' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'
          }`}>
            {kelompokRentanList.length}
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-purple-100 text-purple-800">
            AI Copilot
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEJA ANTREAN VERIFIKASI SURAT RT (SOP 3-KEPUTUSAN)                  */}
      {/* TAB 1: ANTREAN SURAT MASUK (SOP 3 KEPUTUSAN + INSPECTION DRAWER)          */}
      {/* ========================================================================= */}
      {activeTab === 'surat' && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-card overflow-hidden">
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
        <div className="space-y-4">
          {/* Controls Bar: Search & SLA Aging */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Cari nama pemohon, NIK, jenis dokumen, atau no. registrasi..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-xs sm:text-sm bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {docSearch && (
                <button onClick={() => setDocSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Prioritas persetujuan berjenjang. Berkas dengan waktu tunggu paling lama diutamakan.
            </p>

            <div className="flex items-center gap-2 self-start sm:self-center">
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
            <button
              onClick={() => setSortBy(prev => prev === 'aging_desc' ? 'aging_asc' : 'aging_desc')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors self-start sm:self-auto"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortBy === 'aging_desc' ? 'Prioritas SLA Tertua' : 'Terbaru Masuk'}</span>
            </button>
          </div>

          {/* Kontrol Tombol Urutkan Berdasarkan Aging */}
          <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Daftar Antrean Berkas */}
          {/* Daftar Antrean Dokumen */}
          {sortedDocs.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 size={24} />
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-on-surface">Semua Berkas Surat RT Selesai Diverifikasi!</h4>
              <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                Tidak ada permohonan surat warga yang tertahan di tingkat RT {user?.rt || '001'}. Kepatuhan pelayanan prima terjaga.
              <h3 className="text-base font-semibold text-slate-900">Semua Berkas Selesai Diverifikasi!</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                Tidak ada permohonan surat warga yang tertahan di tingkat RT {rtNomor}. Pelayanan berjalan tertib.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/60">
            <div className="grid grid-cols-1 gap-3">
              {sortedDocs.map((doc) => {
                const isProcessingThis = processingId === doc.id;
                const docTitle = doc.jenis_surat || doc.jenis_dokumen || 'Surat Pengantar';
                const createdDate = doc.rt_received_at || doc.created_at;
                const sla = calculateSLA(doc.created_at);

                return (
                  <div
                  <motion.div
                    key={doc.id}
                    className="p-4 sm:p-5 hover:bg-surface-container-low/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 p-4 shadow-sm transition-all"
                  >
                    {/* Info Dokumen & Pemohon */}
                    <div className="space-y-2 flex-1 min-w-0">
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
                        <span>
                          <strong>Pemohon:</strong> {doc.nama_pemohon || 'Warga'} · NIK:{' '}
                          <span className="font-mono font-bold text-slate-800 tabular-nums">
                            {doc.nik_pemohon}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-700">
                            {doc.nomor_registrasi || `REQ-#${doc.id}`}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          KK:{' '}
                          <span className="font-mono tabular-nums">
                            {doc.no_kk || 'Tercatat di Wilayah RT'}
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
                        </span>
                        <span>•</span>
                        <span>Diajukan: {createdDate ? new Date(createdDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</span>
                      </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Iuran RT: Lunas
                          </span>
                        </div>

                      {/* Kotak Keperluan */}
                      <div className="p-2.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/60 text-xs text-slate-800">
                        <span className="font-bold text-slate-500 mr-1.5">Keperluan:</span>
                        <span className="font-medium italic">"{doc.keperluan || 'Keperluan administrasi kependudukan'}"</span>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{doc.jenis_dokumen}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Pemohon: <span className="font-semibold text-slate-700">{doc.nama_pemohon}</span> (NIK:{' '}
                            <span className="font-mono tabular-nums">{doc.nik_pemohon}</span>)
                          </p>
                        </div>

                        {doc.keperluan && (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">Keperluan: </span>
                            {doc.keperluan}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTION BUTTONS: TINJAU, REVISI, TOLAK, SETUJUI */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0 self-end lg:self-center">
                      {/* Tombol Tinjau Berkas & Lampiran (Mengatasi Blind Approval) */}
                      <button
                        type="button"
                        onClick={() => setInspectDoc(doc)}
                        className="px-3 py-2 rounded-xl border border-sky-300 text-sky-800 bg-sky-50 hover:bg-sky-100 active:scale-95 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Periksa foto KTP, Kartu Keluarga, dan riwayat pemohon"
                      >
                        <Eye size={15} />
                        <span>Tinjau Berkas</span>
                      </button>
                      {/* Right: Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <button
                          onClick={() => setInspectDoc(doc)}
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>Tinjau & Berkas</span>
                        </button>

                      {/* Tombol Kembalikan untuk Revisi (SOP Resmi) */}
                      <button
                        type="button"
                        disabled={isProcessingThis}
                        onClick={() => {
                          setReviseModalDoc(doc);
                          setReviseReason('');
                        }}
                        className="px-3 py-2 rounded-xl border border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 active:scale-95 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Kembalikan berkas ke warga untuk perbaikan tanpa membatalkan surat"
                      >
                        <RotateCcw size={15} />
                        <span>Revisi</span>
                      </button>
                        <div className="flex items-center gap-1.5 w-full lg:w-auto">
                          <button
                            onClick={() => handleApprove(doc.id)}
                            disabled={processingId === doc.id}
                            className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui (RT)</span>
                          </button>

                      {/* Tombol Tolak Permanen */}
                      <button
                        type="button"
                        disabled={isProcessingThis}
                        onClick={() => {
                          setRejectModalDoc(doc);
                          setRejectReason('');
                        }}
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 active:scale-95 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        title="Tolak permohonan surat"
                      >
                        <XCircle size={15} />
                        <span>Tolak</span>
                      </button>
                          <button
                            onClick={() => setActionModal({ isOpen: true, type: 'REVISE', doc, reason: '' })}
                            disabled={processingId === doc.id}
                            className="p-2 rounded-lg text-amber-700 hover:bg-amber-50 border border-amber-200 transition-colors"
                            title="Kembalikan untuk Revisi"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                      {/* Tombol Setujui & Teruskan RW */}
                      <button
                        type="button"
                        disabled={isProcessingThis}
                        onClick={() => handleQuickApprove(doc.id, docTitle)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 min-h-[40px]"
                        title="Verifikasi sah dan teruskan ke meja RW"
                      >
                        {isProcessingThis ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                        <span>Setujui (Teruskan RW)</span>
                      </button>
                          <button
                            onClick={() => setActionModal({ isOpen: true, type: 'REJECT', doc, reason: '' })}
                            disabled={processingId === doc.id}
                            className="p-2 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
                            title="Tolak Permohonan"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
      {/* TAB 2: POTENSI & FASILITAS WILAYAH (KOS, IBADAH BERIRISAN, FASKES, SEKOLAH)*/}
      {/* TAB 2: POTENSI & FASILITAS WILAYAH                                        */}
      {/* ========================================================================= */}
      {activeTab === 'fasilitas' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                <span>Peta Potensi & Daya Dukung Wilayah RT {user?.rt || '001'}</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Inventarisasi faskes nakes, sekolah rombel, tempat ibadah beririsan, dan rumah kontrakan/kos warga.
              </p>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFasilitasSubTab('keagamaan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  fasilitasSubTab === 'keagamaan' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Tempat Ibadah ({keagamaanList.length})</span>
              </button>
              <button
                onClick={() => setFasilitasSubTab('hunian')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  fasilitasSubTab === 'hunian' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>Kos & Kontrakan ({hunianSewaList.length})</span>
              </button>
              <button
                onClick={() => setFasilitasSubTab('kesehatan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  fasilitasSubTab === 'kesehatan' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Faskes & Bidan ({kesehatanList.length})</span>
              </button>
              <button
                onClick={() => setFasilitasSubTab('pendidikan')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  fasilitasSubTab === 'pendidikan' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Sekolah & Rombel ({pendidikanList.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSortBy((prev) => (prev === 'aging_desc' ? 'aging_asc' : 'aging_desc'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors cursor-pointer"
              title="Ubah urutan antrean berdasarkan waktu tunggu (aging)"
              onClick={() => {
                setFasilitasCategory('keagamaan');
                setShowAddFasilitasModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-center"
              onClick={() => setShowAddFasilitasModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors self-start sm:self-auto shadow-sm"
            >
              <ArrowUpDown size={14} className="text-primary" />
              <span>
                {sortBy === 'aging_desc' ? 'Paling Lama Diajukan' : 'Paling Baru Diajukan'}
              </span>
              <Plus size={16} />
              <span>+ Daftarkan Fasilitas / Potensi</span>
              <Plus className="w-3.5 h-3.5" />
              <span>+ Daftarkan Fasilitas</span>
            </button>
          </div>

          {/* Sub-kategori Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadRTData}
              disabled={refreshing}
              className="p-1.5 rounded-lg border border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors"
              title="Muat ulang antrean"
              onClick={() => setFasilitasSubTab('keagamaan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                fasilitasSubTab === 'keagamaan' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-slate-700'
              }`}
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <Landmark size={14} />
              <span>Tempat Ibadah ({keagamaanList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFasilitasSubTab('hunian')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                fasilitasSubTab === 'hunian' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-slate-700'
              }`}
            >
              <Home size={14} />
              <span>Kos & Kontrakan ({hunianSewaList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFasilitasSubTab('kesehatan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                fasilitasSubTab === 'kesehatan' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-slate-700'
              }`}
            >
              <HeartPulse size={14} />
              <span>Faskes & Bidan ({kesehatanList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFasilitasSubTab('pendidikan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                fasilitasSubTab === 'pendidikan' ? 'bg-primary text-white shadow-xs' : 'bg-surface-container text-slate-700'
              }`}
            >
              <GraduationCap size={14} />
              <span>Sekolah & Rombel ({pendidikanList.length})</span>
            </button>
          </div>

          {/* Konten Kategori 1: Tempat Ibadah Beririsan */}
          {/* SubTab 1: Tempat Ibadah */}
          {fasilitasSubTab === 'keagamaan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {keagamaanList.map((item) => (
                <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 space-y-2 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                        <Landmark size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{item.nama_tempat_ibadah}</h4>
                        <p className="text-[11px] text-slate-500">{item.jenis_tempat_ibadah} · Status: {item.status_tanah || 'Wakaf'}</p>
                      </div>
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.nama_tempat_ibadah}</h4>
                      <p className="text-xs text-slate-500">{item.jenis_tempat_ibadah} · Status: {item.status_tanah || 'Wakaf'}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {item.status_verifikasi || 'TERVERIFIKASI'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">{item.alamat}</p>

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
                    <span>Kapasitas: <strong className="font-mono tabular-nums">{item.daya_tampung_jamaah}</strong> Jamaah</span>
                    {item.apakah_beririsan === 1 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                        Beririsan Multi-RT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{item.alamat}</p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                    <span>Kapasitas: <strong className="font-mono">{item.daya_tampung_jamaah}</strong> Jamaah</span>
                    <span>Pengurus: <strong>{item.nama_pengurus_dkm || 'DKM'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Konten Kategori 2: Hunian Sewa (Kos & Kontrakan) */}
          {/* SubTab 2: Hunian Sewa */}
          {fasilitasSubTab === 'hunian' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hunianSewaList.map((item) => (
                <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 space-y-2 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                        <Home size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{item.nama_hunian}</h4>
                        <p className="text-[11px] text-slate-500">{item.jenis_hunian} · {item.alamat}</p>
                      </div>
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.nama_hunian}</h4>
                      <p className="text-xs text-slate-500">{item.jenis_hunian} · {item.alamat}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {item.status_verifikasi || 'TERVERIFIKASI'}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.apakah_pemilik_tinggal_di_rt ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {item.apakah_pemilik_tinggal_di_rt ? 'Pemilik di RT' : 'Pemilik Luar'}
                    </span>
                  </div>

                  {/* Metrik Kamar & Penghuni */}
                  <div className="grid grid-cols-3 gap-2 text-center p-2 bg-slate-50 rounded-xl text-xs">
                  <div className="grid grid-cols-3 gap-2 text-center p-2 bg-slate-50 rounded-lg text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kamar/Pintu</span>
                      <strong className="font-mono tabular-nums text-slate-900">{item.jumlah_kamar_pintu} Pintu</strong>
                      <span className="text-[10px] text-slate-400 block">Kamar</span>
                      <strong className="font-mono text-slate-800">{item.jumlah_kamar_pintu} Pintu</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mahasiswa</span>
                      <strong className="font-mono tabular-nums text-sky-700">{item.jumlah_penghuni_pelajar} Jiwa</strong>
                      <strong className="font-mono text-sky-700">{item.jumlah_penghuni_pelajar} Jiwa</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pekerja</span>
                      <strong className="font-mono tabular-nums text-slate-900">{item.jumlah_penghuni_pekerja} Jiwa</strong>
                      <strong className="font-mono text-slate-800">{item.jumlah_penghuni_pekerja} Jiwa</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Pemilik: <strong>{item.nama_pemilik}</strong> ({item.no_kontak_pemilik})</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.apakah_pemilik_tinggal_di_rt ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {item.apakah_pemilik_tinggal_di_rt ? 'Tinggal di RT' : 'Luar Wilayah'}
                    </span>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                    <span>Kontak Pemilik: <strong>{item.nama_pemilik}</strong> ({item.no_kontak_pemilik})</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Konten Kategori 3: Faskes & Bidan */}
          {fasilitasSubTab === 'kesehatan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {kesehatanList.map((item) => (
                <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 space-y-2 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                        <HeartPulse size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{item.nama_faskes}</h4>
                        <p className="text-[11px] text-slate-500">{item.jenis_faskes} · {item.kategori_pengelola}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700">{item.alamat}</p>
                  <div className="p-2 bg-teal-50/50 rounded-xl text-xs flex justify-between font-medium text-teal-950">
                    <span>Dokter: <strong className="font-mono tabular-nums">{item.jumlah_dokter}</strong></span>
                    <span>Bidan: <strong className="font-mono tabular-nums">{item.jumlah_bidan}</strong></span>
                    <span>Perawat: <strong className="font-mono tabular-nums">{item.jumlah_perawat}</strong></span>
                  </div>
                </div>
              ))}
          {/* SubTab 3 & 4: Faskes & Pendidikan */}
          {(fasilitasSubTab === 'kesehatan' || fasilitasSubTab === 'pendidikan') && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              Menampilkan data fasilitas terdaftar untuk wilayah RT {rtNomor}. Hubungi Kelurahan untuk pemutakhiran master faskes & sekolah formal.
            </div>
          )}

          {/* Konten Kategori 4: Sekolah & Rombel */}
          {fasilitasSubTab === 'pendidikan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {pendidikanList.map((item) => (
                <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 space-y-2 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                        <GraduationCap size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900">{item.nama_sekolah}</h4>
                        <p className="text-[11px] text-slate-500">{item.jenjang} · Akreditasi {item.akreditasi || 'B'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700">{item.alamat}</p>
                  <div className="p-2 bg-sky-50/50 rounded-xl text-xs flex justify-between font-medium text-sky-950">
                    <span>Kursi Baru: <strong className="font-mono tabular-nums">{item.daya_tampung_kursi_baru}</strong></span>
                    <span>Jumlah Rombel: <strong className="font-mono tabular-nums">{item.jumlah_rombel}</strong></span>
                    <span>Total Kapasitas: <strong className="font-mono tabular-nums">{item.total_kapasitas_murid}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {/* Tabel / Daftar Antrean Surat */}
        {sortedDocs.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
              <CheckCircle2 size={24} />
      {/* ========================================================================= */}
      {/* TAB 3: PERLINDUNGAN SOSIAL (ANAK YATIM PIATU & LANSIA SEBATANG KARA)      */}
      {/* TAB 3: PERLINDUNGAN SOSIAL (YATIM PIATU & LANSIA)                          */}
      {/* ========================================================================= */}
      {activeTab === 'rentan' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <Heart size={20} className="text-red-500" />
                <span>Pangkalan Data Perlindungan Sosial Anak Yatim & Lansia</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Deteksi ganda berbasis Kartu Keluarga (KK) dan sensor faktual lapangan Ketua RT/RW untuk AI Copilot.
              <h3 className="text-base font-bold text-slate-900">Perlindungan Sosial Anak Yatim & Lansia</h3>
              <p className="text-xs text-slate-500">
                Deteksi ganda dari Kartu Keluarga (KK) dan sensor faktual lapangan Ketua RT untuk AI Copilot.
              </p>
            </div>
            <h4 className="text-sm font-bold text-on-surface">Semua Berkas Surat RT Selesai Diverifikasi!</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              Tidak ada permohonan surat warga yang tertahan di tingkat RT {user?.rt || '001'}. Kepatuhan pelayanan prima terjaga.
            </p>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleAutoScanKK}
                disabled={scanningKK}
                onClick={handleAutoScanKK}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Pindai potensi anak yatim & lansia dari data Kartu Keluarga"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors shadow-sm disabled:opacity-50"
              >
                {scanningKK ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} className="text-purple-600" />}
                {scanningKK ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                <span>Pindai Otomatis KK</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddRentanModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
              >
                <Plus size={16} />
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Warga Rentan</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/60">
            {sortedDocs.map((doc, idx) => {
              const isProcessingThis = processingId === doc.id;
              const docTitle = doc.jenis_surat || doc.jenis_dokumen || 'Surat Pengantar';
              const createdDate = doc.rt_received_at || doc.created_at;

              return (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 hover:bg-surface-container-low/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
          {/* Filter Chips */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRentanFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rentanFilter === 'all' ? 'bg-primary text-white' : 'bg-surface-container text-slate-700'
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                rentanFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({kelompokRentanList.length})
            </button>
            <button
              type="button"
              onClick={() => setRentanFilter('yatim')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rentanFilter === 'yatim' ? 'bg-primary text-white' : 'bg-surface-container text-slate-700'
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                rentanFilter === 'yatim' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Anak Yatim Piatu ({kelompokRentanList.filter(k => k.kategori.startsWith('ANAK_')).length})
              Anak Yatim Piatu
            </button>
            <button
              type="button"
              onClick={() => setRentanFilter('lansia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rentanFilter === 'lansia' ? 'bg-primary text-white' : 'bg-surface-container text-slate-700'
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                rentanFilter === 'lansia' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lansia Sebatang Kara ({kelompokRentanList.filter(k => k.kategori.startsWith('LANSIA_')).length})
              Lansia Sebatang Kara
            </button>
          </div>

          {/* Hasil Scan KK Otomatis (Jika Baru Saja Dipindai) */}
          {/* Hasil Scan KK Otomatis */}
          {scanResult && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
              <h4 className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                <Sparkles size={15} className="text-purple-600" />
                <span>Hasil Pemindaian Algoritma KK: {scanResult.potensi_yatim_piatu.length} Anak Terindikasi & {scanResult.potensi_lansia_rentan.length} Lansia Tunggal</span>
              </h4>
              <p className="text-[11px] text-purple-800">
                Sistem mendeteksi anak di bawah 18 tahun tanpa status orang tua lengkap dan lansia yang tinggal sendiri/berdua di database KK kelurahan.
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-xs text-purple-900">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Hasil Pemindaian Algoritma KK: {scanResult.potensi_yatim_piatu?.length || 0} Anak & {scanResult.potensi_lansia_rentan?.length || 0} Lansia Terdeteksi</span>
              </div>
              <p className="text-purple-800/80 text-[11px]">
                Data ini siap diverifikasi faktual di lapangan oleh RT sebelum direkomendasikan bansos.
              </p>
            </div>
          )}

          {/* Daftar Warga Rentan */}
          {/* Grid Warga Rentan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredKelompokRentan.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      item.kategori.startsWith('ANAK_') ? 'bg-pink-100 text-pink-800' : 'bg-emerald-100 text-emerald-800'
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      item.kategori.includes('LANSIA') ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {item.kategori.startsWith('ANAK_') ? <Baby size={20} /> : <HeartPulse size={20} />}
                      {item.kategori.includes('LANSIA') ? <HeartPulse className="w-4 h-4" /> : <Baby className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{item.nama}</h4>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        NIK: {item.nik} · {item.usia} Thn · {item.jenis_kelamin === 'L' ? 'L' : 'P'}
                      <h4 className="text-sm font-bold text-slate-900">{item.nama_lengkap || item.nama}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">
                        NIK: {item.nik} · {item.usia} Thn
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.kategori.includes('YATIM_PIATU') ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                    {item.kategori.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Kondisi Pengasuhan & Alamat */}
                <div className="text-xs text-slate-700 space-y-1">
                  <p><strong>Alamat:</strong> {item.alamat}</p>
                  <p><strong>Pola Asuh / Tinggal:</strong> {item.status_tempat_tinggal} {item.nama_wali_pengasuh ? `(Wali: ${item.nama_wali_pengasuh})` : ''}</p>
                  {item.status_sekolah !== 'Tidak Berlaku' && (
                    <p><strong>Pendidikan:</strong> {item.status_sekolah} {item.nama_sekolah ? `· ${item.nama_sekolah}` : ''}</p>
                  )}
                  {item.tingkat_kemandirian_adl !== 'Tidak Berlaku' && (
                    <p><strong>Kemandirian Fisik:</strong> {item.tingkat_kemandirian_adl}</p>
                  )}
                  {item.riwayat_penyakit_kronis && (
                    <p className="text-red-700"><strong>Penyakit Kronis:</strong> {item.riwayat_penyakit_kronis}</p>
                  )}
                <p className="text-xs text-slate-600">{item.alamat}</p>
                <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-500">
                  <span>Kemandirian: <strong>{item.adl_kemandirian || 'Mandiri'}</strong></span>
                  <span>Bansos: <strong className="text-emerald-700">{item.bansos_diterima || 'Belum Ada'}</strong></span>
                </div>

                {/* Kebutuhan Mendesak & Bansos */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-2">
                  <span className="text-[11px] text-slate-500">Bansos: <strong>{item.bansos_diterima}</strong></span>
                  {item.kebutuhan_mendesak && (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Kebutuhan: {item.kebutuhan_mendesak}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DRAWER / MODAL QUICK INSPECTION BERKAS KTP & KK (MENGATASI BLIND APPROVAL) */}
      {/* QUICK INSPECTION DRAWER                                                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {inspectDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header Drawer */}
              <div className="p-4 bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <FileCheck size={20} />
                  </div>
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectDoc(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between"
              >
                <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold">Uji Verifikasi Faktual Dokumen</h3>
                    <p className="text-xs text-blue-100 font-mono tabular-nums">
                      {inspectDoc.nomor_registrasi || `REG-${inspectDoc.id}`} · {inspectDoc.jenis_surat || inspectDoc.jenis_dokumen}
                    </p>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-100 text-blue-800">
                      Inspeksi Berkas RT {rtNomor}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">Lembar Verifikasi Faktual</h3>
                  </div>
                  <button onClick={() => setInspectDoc(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectDoc(null)}
                  className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 cursor-pointer"
                >
                  {/* Info Dokumen & Pemohon */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {doc.nomor_registrasi || `REG-${doc.id}`}
                      </span>
                      <StatusBadge status="PENDING_RT" />
                      {/* SLA Countdown Badge */}
                      <SLABadge
                        deadline={doc.sla_deadline}
                        createdAt={createdDate}
                        status={doc.status}
                      />
                  <X size={18} />
                </button>
              </div>

              {/* Konten Pratinjau Lengkap */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* 1. Biodata Pemohon & KK */}
                <div className="p-3.5 bg-surface-container-low rounded-xl border border-outline-variant space-y-2">
                  <h4 className="font-extrabold text-on-surface text-xs uppercase tracking-wider text-slate-500">
                    Biodata Pemohon & Data Keluarga
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Nama Lengkap</span>
                      <strong className="text-slate-900">{inspectDoc.nama_pemohon || 'Warga'}</strong>
                <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                  {/* Identitas Pemohon */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <h4 className="font-bold text-slate-500 uppercase tracking-wider">Identitas Pemohon</h4>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama:</span>
                      <strong className="text-slate-900">{inspectDoc.nama_pemohon}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">NIK Pemohon</span>
                      <strong className="font-mono tabular-nums text-slate-900">{inspectDoc.nik_pemohon}</strong>
                    <div className="flex justify-between">
                      <span className="text-slate-500">NIK:</span>
                      <strong className="font-mono tabular-nums">{inspectDoc.nik_pemohon}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Nomor Kartu Keluarga (KK)</span>
                      <strong className="font-mono tabular-nums text-slate-900">{inspectDoc.no_kk || '3273011802900012'}</strong>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Domisili:</span>
                      <strong>RT {inspectDoc.rt} / RW {inspectDoc.rw}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Domisili Faktual</span>
                      <strong className="text-slate-900">RT {inspectDoc.rt || '001'} / RW {inspectDoc.rw || '001'}</strong>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status Iuran Kas:</span>
                      <strong className="text-emerald-700">Tertib / Lunas</strong>
                    </div>
                  </div>
                </div>

                    <h4 className="text-sm sm:text-base font-extrabold text-on-surface tracking-tight">
                      {docTitle}
                    </h4>
                {/* 2. Keperluan Surat */}
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 text-blue-950 space-y-1">
                  <span className="font-bold text-blue-800 text-[11px]">Keperluan Surat yang Diajukan:</span>
                  <p className="font-medium italic text-xs">"{inspectDoc.keperluan || 'Keperluan pengantar resmi'}"</p>
                </div>

                    <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span><strong>Pemohon:</strong> {doc.nama_pemohon || 'Warga'} (NIK: {doc.nik_pemohon})</span>
                      <span>•</span>
                      <span><strong>Keperluan:</strong> {doc.keperluan || '-'}</span>
                      <span>•</span>
                      <span>Diajukan: {createdDate ? new Date(createdDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</span>
                {/* 3. Status Faktual Lingkungan (Contextual Intelligence) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 font-bold block">Status Iuran Kas RT</span>
                    <p className="text-xs font-extrabold text-emerald-950 mt-0.5">Lunas Bulan Ini (Rp 25.000)</p>
                  </div>
                  <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                    <span className="text-[10px] text-sky-800 font-bold block">Klasifikasi Kesejahteraan</span>
                    <p className="text-xs font-extrabold text-sky-950 mt-0.5">Desil 3 (Pra-Sejahtera)</p>
                  </div>
                </div>

                {/* 4. Pratinjau Lampiran Foto KTP & KK */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800">Pratinjau Berkas Lampiran Warga:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                      <div className="h-28 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-mono text-[11px]">
                        [Foto KTP-el Pemohon]
                  {/* Peruntukan Surat */}
                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-500 uppercase tracking-wider">Peruntukan Surat</h4>
                    <div>
                      <span className="text-slate-500">Jenis Dokumen:</span>
                      <div className="font-bold text-slate-900 text-sm">{inspectDoc.jenis_dokumen}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Keperluan:</span>
                      <div className="p-2 rounded bg-slate-50 text-slate-700 italic border border-slate-100 mt-1">
                        "{inspectDoc.keperluan || 'Keperluan pengantar resmi'}"
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 block">KTP-el Terverifikasi</span>
                    </div>
                  </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                      <div className="h-28 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-mono text-[11px]">
                        [Foto Kartu Keluarga]
                  {/* Lampiran Dokumen */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-500 uppercase tracking-wider">Lampiran Warga</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-semibold text-slate-800">e-KTP</div>
                          <div className="text-[10px] text-emerald-700">Tervalidasi</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 block">KK Resmi Disdukcapil</span>
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <div>
                          <div className="font-semibold text-slate-800">Kartu Keluarga</div>
                          <div className="text-[10px] text-emerald-700">Tervalidasi</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                  {/* ONE-TOUCH QUICK ACTIONS BUTTONS */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 self-end lg:self-center">
                    {/* Tombol Tolak / Kembalikan */}
                    <button
                      type="button"
                      disabled={isProcessingThis}
                      onClick={() => {
                        setRejectModalDoc(doc);
                        setRejectReason('');
                      }}
                      className="px-3 py-2 rounded-xl border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 active:scale-95 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Kembalikan atau tolak permohonan surat"
                    >
                      <XCircle size={15} />
                      <span>Tolak / Catatan</span>
                    </button>
              {/* Footer Aksi Drawer: 3 Pilihan SOP */}
              <div className="p-3.5 bg-slate-50 border-t border-outline-variant flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                {/* Footer SOP 3 Keputusan */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalDoc(inspectDoc);
                      setRejectReason('');
                    }}
                    className="px-3 py-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 font-bold text-xs cursor-pointer"
                    onClick={() => handleApprove(inspectDoc.id)}
                    disabled={processingId === inspectDoc.id}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Tolak Permohonan
                    <Check className="w-4 h-4" />
                    <span>Setujui & Teruskan ke RW</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviseModalDoc(inspectDoc);
                      setReviseReason('');
                    }}
                    className="px-3 py-2 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold text-xs cursor-pointer"
                  >
                    Kembalikan untuk Revisi
                  </button>
                </div>

                    {/* Tombol One-Touch Setujui */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isProcessingThis}
                      onClick={() => handleQuickApprove(doc.id, docTitle)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      title="Verifikasi dengan satu klik dan teruskan ke RW"
                      onClick={() => setActionModal({ isOpen: true, type: 'REVISE', doc: inspectDoc, reason: '' })}
                      disabled={processingId === inspectDoc.id}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center gap-1.5"
                    >
                      {isProcessingThis ? (
                        <RefreshCw size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={15} />
                      )}
                      <span>Setujui (Teruskan RW)</span>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Kembalikan / Revisi</span>
                    </button>
                <button
                  type="button"
                  onClick={() => handleQuickApprove(inspectDoc.id, inspectDoc.jenis_surat || inspectDoc.jenis_dokumen)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={16} />
                  <span>Setujui & Teruskan ke RW</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL KEMBALIKAN UNTUK REVISI (SOP RESMI RT)                              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {reviseModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                    <RotateCcw size={18} />
                    <button
                      onClick={() => setActionModal({ isOpen: true, type: 'REJECT', doc: inspectDoc, reason: '' })}
                      disabled={processingId === inspectDoc.id}
                      className="py-2 px-3 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 flex items-center justify-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Tolak Permohonan</span>
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Kembalikan Berkas untuk Perbaikan</h4>
                    <p className="text-[11px] text-on-surface-variant">Nomor registrasi tidak gugur; warga tinggal melengkapi.</p>
                  </div>
                </div>
              );
            })}
                <button
                  type="button"
                  onClick={() => setReviseModalDoc(null)}
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg space-y-1">
                <p><strong>Dokumen:</strong> {reviseModalDoc.jenis_surat || reviseModalDoc.jenis_dokumen}</p>
                <p><strong>Pemohon:</strong> {reviseModalDoc.nama_pemohon || reviseModalDoc.nik_pemohon}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Catatan Kekurangan / Petunjuk Perbaikan <span className="text-amber-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Foto KTP agak buram, silakan foto ulang di tempat terang agar NIK terbaca jelas."
                  value={reviseReason}
                  onChange={(e) => setReviseReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviseModalDoc(null)}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-surface-container cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleQuickRevise}
                  className="px-4 py-2 text-xs font-extrabold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors shadow-sm cursor-pointer"
                >
                  Kirim Petunjuk Revisi
                </button>
              </div>
            </motion.div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL PENOLAKAN / CATATAN REVISI DOKUMEN                                  */}
      {/* MODAL PENOLAKAN PERMANEN                                                  */}
      {/* MODAL AKSI REVISI & TOLAK                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rejectModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        {actionModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-5 space-y-4"
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
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-bold">
                    <XCircle size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Kembalikan / Tolak Permohonan</h4>
                    <p className="text-[11px] text-on-surface-variant">Sampaikan alasan kekurangan berkas kepada pemohon.</p>
                    <h4 className="text-sm font-bold text-on-surface">Tolak Permohonan Surat</h4>
                    <p className="text-[11px] text-on-surface-variant">Gunakan khusus pemohon fiktif / bukan warga RT.</p>
                  </div>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  actionModal.type === 'REVISE' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {actionModal.type === 'REVISE' ? <RotateCcw className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <button
                  type="button"
                  onClick={() => setRejectModalDoc(null)}
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container"
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <X size={18} />
                </button>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {actionModal.type === 'REVISE' ? 'Kembalikan Berkas untuk Revisi' : 'Tolak Permohonan Surat'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {actionModal.type === 'REVISE' ? 'Catatan instruksi perbaikan akan dikirimkan ke pemohon.' : 'Permohonan akan dibatalkan permanen.'}
                  </p>
                </div>
              </div>

              <div className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg space-y-1">
                <p><strong>Dokumen:</strong> {rejectModalDoc.jenis_surat || rejectModalDoc.jenis_dokumen}</p>
                <p><strong>Pemohon:</strong> {rejectModalDoc.nama_pemohon || rejectModalDoc.nik_pemohon}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Alasan Penolakan / Catatan Perbaikan <span className="text-red-500">*</span>
                  Alasan Penolakan Resmi <span className="text-red-500">*</span>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Alasan / Instruksi Catatan:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Lampiran foto KTP/KK buram, silakan ajukan ulang dengan foto yang jelas."
                  placeholder="Contoh: Pemohon tidak berdomisili fisik di RT 001."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-2 focus:ring-red-500 outline-none"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:ring-2 focus:ring-red-500 outline-none"
                  value={actionModal.reason}
                  onChange={(e) => setActionModal(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder={actionModal.type === 'REVISE' ? 'Contoh: Mohon lengkapi lampiran foto KTP yang lebih jelas...' : 'Contoh: Pemohon bukan warga RT terkait...'}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalDoc(null)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container"
                  className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-surface-container cursor-pointer"
                  onClick={() => setActionModal({ isOpen: false, type: '', doc: null, reason: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleQuickReject}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
                  className="px-4 py-2 text-xs font-extrabold rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm cursor-pointer"
                >
                  Kirim Penolakan
                  Tolak Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL INPUT FASILITAS / POTENSI WILAYAH BARU                              */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddFasilitasModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Pendaftaran Potensi / Fasilitas Wilayah</h4>
                    <p className="text-[11px] text-on-surface-variant">Terverifikasi otomatis jika oleh Kelurahan, atau draf jika oleh RT.</p>
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

              {/* Kategori Pilihan */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-surface-container rounded-xl text-xs font-bold text-center">
                <button
                  type="button"
                  onClick={() => setFasilitasCategory('keagamaan')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    fasilitasCategory === 'keagamaan' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600'
                  onClick={handleConfirmAction}
                  disabled={processingId !== null}
                  className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm disabled:opacity-50 ${
                    actionModal.type === 'REVISE' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Tempat Ibadah
                  {actionModal.type === 'REVISE' ? 'Kirim Instruksi Revisi' : 'Tolak Permohonan'}
                </button>
                <button
                  type="button"
                  onClick={() => setFasilitasCategory('hunian')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    fasilitasCategory === 'hunian' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Kos / Kontrakan
                </button>
                <button
                  type="button"
                  onClick={() => setFasilitasCategory('kesehatan')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    fasilitasCategory === 'kesehatan' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Faskes Nakes
                </button>
                <button
                  type="button"
                  onClick={() => setFasilitasCategory('pendidikan')}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    fasilitasCategory === 'pendidikan' ? 'bg-primary text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Sekolah Rombel
                </button>
              </div>

              <form onSubmit={handleSaveFasilitas} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nama Fasilitas / Bangunan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Masjid Jami' Al-Huda / Kos Berkah 10 Pintu"
                    value={fasilitasForm.nama}
                    onChange={(e) => setFasilitasForm({ ...fasilitasForm, nama: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Alamat Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jl. Melati No. 12 RT 001 / RW 001"
                    value={fasilitasForm.alamat}
                    onChange={(e) => setFasilitasForm({ ...fasilitasForm, alamat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Form Spesifik: Tempat Ibadah */}
                {fasilitasCategory === 'keagamaan' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Jenis Tempat Ibadah</label>
                        <select
                          value={fasilitasForm.kategori_spesifik}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, kategori_spesifik: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none"
                        >
                          <option value="Masjid">Masjid</option>
                          <option value="Musholla">Musholla</option>
                          <option value="Gereja">Gereja</option>
                          <option value="Pura">Pura</option>
                          <option value="Vihara">Vihara</option>
                          <option value="Klenteng">Klenteng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Daya Tampung Jamaah</label>
                        <input
                          type="number"
                          value={fasilitasForm.kapasitas}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, kapasitas: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums outline-none"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-2">
                      <label className="flex items-center gap-2 text-purple-950 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={fasilitasForm.apakah_beririsan === 1}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, apakah_beririsan: e.target.checked ? 1 : 0 })}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>Tempat Ibadah Beririsan (Melayani Lintas RT/RW)</span>
                      </label>
                      <p className="text-[11px] text-purple-800">
                        Jika dicentang, tempat ibadah ini akan otomatis muncul sebagai fasilitas bersama pada dashboard RT tetangga.
                      </p>
                    </div>
                  </div>
                )}

                {/* Form Spesifik: Kos / Kontrakan */}
                {fasilitasCategory === 'hunian' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Jenis Hunian Sewa</label>
                        <select
                          value={fasilitasForm.kategori_spesifik}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, kategori_spesifik: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none"
                        >
                          <option value="Kos-Kosan">Kos-Kosan</option>
                          <option value="Kontrakan">Rumah Kontrakan</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Jumlah Kamar / Pintu</label>
                        <input
                          type="number"
                          value={fasilitasForm.jumlah_kamar}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, jumlah_kamar: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Penghuni Mahasiswa</label>
                        <input
                          type="number"
                          value={fasilitasForm.penghuni_pelajar}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, penghuni_pelajar: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Penghuni Pekerja</label>
                        <input
                          type="number"
                          value={fasilitasForm.penghuni_pekerja}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, penghuni_pekerja: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Nama Pemilik Kos *</label>
                        <input
                          type="text"
                          required
                          value={fasilitasForm.nama_kontak}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, nama_kontak: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">No. HP Pemilik *</label>
                        <input
                          type="text"
                          required
                          value={fasilitasForm.no_kontak}
                          onChange={(e) => setFasilitasForm({ ...fasilitasForm, no_kontak: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddFasilitasModal(false)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-surface-container cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={fasilitasSubmitting}
                    className="px-4 py-2 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {fasilitasSubmitting ? 'Menyimpan...' : 'Simpan & Daftarkan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL INPUT WARGA RENTAN (ANAK YATIM PIATU & LANSIA SEBATANG KARA)        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddRentanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold">
                    <Heart size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">Pencatatan Perlindungan Warga Rentan</h4>
                    <p className="text-[11px] text-on-surface-variant">Sensor sosial RT untuk dukungan intervensi sosial & AI Copilot.</p>
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
                  <label className="block font-bold text-slate-800 mb-1">Kategori Kerentanan *</label>
                  <select
                    value={rentanForm.kategori}
                    onChange={(e) => setRentanForm({
                      ...rentanForm,
                      kategori: e.target.value,
                      status_sekolah: e.target.value.startsWith('ANAK_') ? 'Aktif Sekolah' : 'Tidak Berlaku',
                      tingkat_kemandirian_adl: e.target.value.startsWith('LANSIA_') ? 'Mandiri' : 'Tidak Berlaku'
                    })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none"
                  >
                    <option value="ANAK_YATIM_PIATU">Anak Yatim Piatu (Kedua Orang Tua Tiada)</option>
                    <option value="ANAK_YATIM">Anak Yatim (Ayah Tiada)</option>
                    <option value="ANAK_PIATU">Anak Piatu (Ibu Tiada)</option>
                    <option value="LANSIA_SEBATANG_KARA">Lansia Sebatang Kara (Tinggal Sendiri)</option>
                    <option value="LANSIA_PASANGAN_RENTAN">Pasangan Lansia Rentan (Tanpa Penopang)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Nama Lengkap *</label>
                    <input
                      type="text"
                      required
                      value={rentanForm.nama}
                      onChange={(e) => setRentanForm({ ...rentanForm, nama: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">NIK (16 Digit) *</label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={rentanForm.nik}
                      onChange={(e) => setRentanForm({ ...rentanForm, nik: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Usia (Tahun) *</label>
                    <input
                      type="number"
                      required
                      value={rentanForm.usia}
                      onChange={(e) => setRentanForm({ ...rentanForm, usia: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono tabular-nums outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Pola Asuh / Tinggal</label>
                    <select
                      value={rentanForm.status_tempat_tinggal}
                      onChange={(e) => setRentanForm({ ...rentanForm, status_tempat_tinggal: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none"
                    >
                      <option value="Tinggal Sendiri">Tinggal Sendiri (Sangat Kritis)</option>
                      <option value="Bersama Kakek/Nenek">Bersama Kakek/Nenek (Lansia)</option>
                      <option value="Bersama Saudara/Kerabat">Bersama Saudara/Kerabat</option>
                      <option value="Bersama Pasangan Lansia">Bersama Pasangan Lansia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Alamat Domisili RT 001 *</label>
                  <input
                    type="text"
                    required
                    value={rentanForm.alamat}
                    onChange={(e) => setRentanForm({ ...rentanForm, alamat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  />
                </div>

                {rentanForm.kategori.startsWith('LANSIA_') && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Kemandirian Fisik (ADL)</label>
                    <select
                      value={rentanForm.tingkat_kemandirian_adl}
                      onChange={(e) => setRentanForm({ ...rentanForm, tingkat_kemandirian_adl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold outline-none"
                    >
                      <option value="Mandiri">Mandiri</option>
                      <option value="Ketergantungan Sedang">Ketergantungan Sedang (Butuh Bantuan)</option>
                      <option value="Tirah Baring (Bedridden)">Tirah Baring / Bedridden (Lumpuh)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Kebutuhan Mendesak</label>
                  <input
                    type="text"
                    placeholder="Contoh: Beasiswa seragam sekolah / Paket permakanan lansia"
                    value={rentanForm.kebutuhan_mendesak}
                    onChange={(e) => setRentanForm({ ...rentanForm, kebutuhan_mendesak: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddRentanModal(false)}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-surface-container cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={rentanSubmitting}
                    className="px-4 py-2 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {rentanSubmitting ? 'Menyimpan...' : 'Simpan Data Perlindungan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
    </div>
  );
}

