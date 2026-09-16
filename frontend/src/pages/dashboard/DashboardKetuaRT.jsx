/**
 * frontend/src/pages/dashboard/DashboardKetuaRT.jsx
 * Dedicated Action-Oriented Dashboard for Ketua RT (Sprint 2)
 * Features: SLA Countdown, Aging Sorting, Quick One-Touch Verification, Action Center
 * Bumi Warga - Jabar Pintar Digital
 * Modern Action-Oriented Dashboard for Ketua RT (Bumi Warga - Jabar Pintar Digital)
 * Features:
 * 1. SLA Countdown & Aging Sorting with One-Touch Verification & SOP 3-Way Decisions (Setujui, Revisi, Tolak)
 * 2. Quick Inspection Drawer/Modal (Tinjau Berkas & KTP/KK Pemohon)
 * 3. Potensi & Daya Dukung Wilayah: Faskes (Nakes), Sekolah (Rombel), Hunian Sewa (Kos/Kontrakan), Tempat Ibadah Beririsan
 * 4. Dual-Sourcing Kelompok Rentan: Anak Yatim Piatu & Lansia Sebatang Kara (Auto-Scan KK + Input Lapangan RT)
 * 5. 100% Tabular Nums & Monospace Typography
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  X
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
  Phone,
  Calendar,
  Sparkles,
  Layers,
  Heart,
  CheckSquare
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);

  // RT Data
  // RT Document & Dues Data
  const [pendingDocs, setPendingDocs] = useState([]);
  const [docStats, setDocStats] = useState({ pending_rt: 0, total_approved: 0, total_rejected: 0, compliance_rate: '100%' });
  const [iuranSummary, setIuranSummary] = useState({ total_kk: 0, sudah_bayar: 0, belum_bayar: 0, persentase: '0%' });
  const [balitaRisikoCount, setBalitaRisikoCount] = useState(0);
  const [auditSanggahanPending, setAuditSanggahanPending] = useState([]);

  // Sorting: 'aging_desc' (paling lama di atas) | 'aging_asc' (terbaru di atas)
  const [sortBy, setSortBy] = useState('aging_desc');

  // Quick Action Modal / State
  // Fasilitas & Potensi Wilayah Data
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
    nama: '',
    alamat: '',
    kategori_spesifik: 'Masjid',
    kapasitas: 100,
    status_legalitas: 'Wakaf',
    apakah_beririsan: 0,
    rt_rw_beririsan: ['RT 001 / RW 001', 'RT 002 / RW 001'],
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
  });

  const [showAddRentanModal, setShowAddRentanModal] = useState(false);
  const [rentanSubmitting, setRentanSubmitting] = useState(false);
  const [rentanForm, setRentanForm] = useState({
    kategori: 'ANAK_YATIM_PIATU',
    nik: '',
    nama: '',
    no_kk: '',
    tanggal_lahir: '',
    usia: 10,
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
  });

  // Load All RT Data
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

      // 2. Pending Dokumen di RT
      const [docListRes, docStatsRes, iuranRes, bansosRes, balitaRes] = await Promise.allSettled([
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
        api.get(`/posyandu/balita/stats?rt=${user?.rt || '001'}`)
        api.get(`/posyandu/balita/stats?rt=${user?.rt || '001'}`),
        api.get('/fasilitas/keagamaan'),
        api.get('/fasilitas/hunian-sewa'),
        api.get('/fasilitas/kesehatan'),
        api.get('/fasilitas/pendidikan'),
        api.get('/fasilitas/kelompok-rentan')
      ]);

      // Handle Dokumen Antrean
      // Dokumen Antrean RT
      if (docListRes.status === 'fulfilled' && docListRes.value?.success) {
        const rawDocs = docListRes.value.data || [];
        // Filter specifically documents needing RT verification
        const forRT = rawDocs.filter((d) => d.approval_step === 'RT' && d.status !== 'REJECTED');
        setPendingDocs(forRT);
      }

      // Handle Stats
      // Stats
      if (docStatsRes.status === 'fulfilled' && docStatsRes.value?.success) {
        setDocStats(docStatsRes.value.data || {});
      }

      // Handle Iuran
      // Iuran RT
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
      // Bansos Sanggahan
      if (bansosRes.status === 'fulfilled' && bansosRes.value?.data) {
        const list = bansosRes.value.data || [];
        const pendingSanggahan = list.filter((s) => s.status_review === 'PENDING_KELURAHAN' && s.rt === (user?.rt || '001'));
        setAuditSanggahanPending(pendingSanggahan);
      }

      // Handle Balita Risiko
      // Balita Risiko
      if (balitaRes.status === 'fulfilled' && balitaRes.value?.data) {
        const bStats = balitaRes.value.data || {};
        setBalitaRisikoCount(bStats.berisiko_stunting || (bStats.gizi_kurang || 0) + (bStats.gizi_buruk || 0));
      }

      // Fasilitas Keagamaan
      if (keagamaanRes.status === 'fulfilled' && keagamaanRes.value?.success) {
        setKeagamaanList(keagamaanRes.value.data || []);
      }

      // Hunian Sewa
      if (hunianRes.status === 'fulfilled' && hunianRes.value?.success) {
        setHunianSewaList(hunianRes.value.data || []);
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
  // SORTING AGING LOGIC
  // ===========================================================================
  // Aging Sort Logic
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
    });
    return list;
  }, [pendingDocs, sortBy]);

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
    }

    return list;
  }, [sortedDocs, kelompokRentanList, iuranSummary, navigate, user?.rt]);

  // 1. SOP ACTION: SETUJUI (APPROVE)
  const handleQuickApprove = async (docId, docTitle) => {
    if (!window.confirm(`Setujui permohonan surat "${docTitle}" dan teruskan ke Ketua RW?`)) {
      return;
    }

    try {
      setProcessingId(docId);
      const res = await api.patch(`/dokumen/${docId}/approve`, {
        catatan: 'Disetujui oleh Ketua RT melalui Verifikasi Cepat (One-Touch).'
        catatan: 'Disetujui oleh Ketua RT setelah verifikasi faktual.'
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
    } finally {
      setProcessingId(null);
    }
  };

  // 2. SOP ACTION: KEMBALIKAN DENGAN CATATAN (REVISE)
  const handleQuickRevise = async () => {
    if (!reviseModalDoc) return;
    if (!reviseReason.trim() || reviseReason.trim().length < 3) {
      alert('Mohon masukkan petunjuk perbaikan berkas yang jelas untuk warga pemohon.');
      return;
    }

    try {
      setProcessingId(reviseModalDoc.id);
      const res = await api.patch(`/dokumen/${reviseModalDoc.id}/revise`, {
        catatan: reviseReason.trim()
      });

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
      alert('Mohon masukkan alasan penolakan agar pemohon dapat memperbaiki.');
      alert('Mohon masukkan alasan penolakan resmi agar tercatat dalam berita acara.');
      return;
    }

    try {
      setProcessingId(rejectModalDoc.id);
      const res = await api.patch(`/dokumen/${rejectModalDoc.id}/reject`, {
        catatan: rejectReason.trim()
      });

      if (res.success) {
        setActionSuccessToast(`Permohonan surat berhasil ditolak dengan pemberitahuan ke warga.`);
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
  // Handle Input Fasilitas Baru
  const handleSaveFasilitas = async (e) => {
    e.preventDefault();
    setFasilitasSubmitting(true);
    try {
      let endpoint = '/fasilitas/keagamaan';
      let payload = {};

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
      await api.post(endpoint, payload);
      setActionSuccessToast(`Fasilitas "${fasilitasForm.nama}" berhasil didaftarkan dan menunggu verifikasi Kelurahan.`);
      setTimeout(() => setActionSuccessToast(''), 4000);
      setShowAddFasilitasModal(false);
      loadRTData();
    } catch (err) {
      alert(err.message || 'Gagal menyimpan fasilitas');
    } finally {
      setFasilitasSubmitting(false);
    }
  };

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

    return list;
  }, [sortedDocs, auditSanggahanPending, iuranSummary, navigate]);
  // Trigger Algoritma Scan KK Otomatis
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
  const filteredKelompokRentan = useMemo(() => {
    if (rentanFilter === 'yatim') {
      return kelompokRentanList.filter(k => k.kategori.startsWith('ANAK_'));
    }
    if (rentanFilter === 'lansia') {
      return kelompokRentanList.filter(k => k.kategori.startsWith('LANSIA_'));
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
      <AnimatePresence>
        {actionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
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
            {keagamaanList.length + hunianSewaList.length}
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
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEJA ANTREAN VERIFIKASI SURAT RT (SOP 3-KEPUTUSAN)                  */}
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
          </div>

          {/* Kontrol Tombol Urutkan Berdasarkan Aging */}
          <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Daftar Antrean Berkas */}
          {sortedDocs.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
                <CheckCircle2 size={24} />
              </div>
              <h4 className="text-sm font-bold text-on-surface">Semua Berkas Surat RT Selesai Diverifikasi!</h4>
              <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                Tidak ada permohonan surat warga yang tertahan di tingkat RT {user?.rt || '001'}. Kepatuhan pelayanan prima terjaga.
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
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          KK:{' '}
                          <span className="font-mono tabular-nums">
                            {doc.no_kk || 'Tercatat di Wilayah RT'}
                          </span>
                        </span>
                        <span>•</span>
                        <span>Diajukan: {createdDate ? new Date(createdDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}</span>
                      </div>

                      {/* Kotak Keperluan */}
                      <div className="p-2.5 bg-surface-container-low/60 rounded-xl border border-outline-variant/60 text-xs text-slate-800">
                        <span className="font-bold text-slate-500 mr-1.5">Keperluan:</span>
                        <span className="font-medium italic">"{doc.keperluan || 'Keperluan administrasi kependudukan'}"</span>
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POTENSI & FASILITAS WILAYAH (KOS, IBADAH BERIRISAN, FASKES, SEKOLAH)*/}
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
            >
              <ArrowUpDown size={14} className="text-primary" />
              <span>
                {sortBy === 'aging_desc' ? 'Paling Lama Diajukan' : 'Paling Baru Diajukan'}
              </span>
              <Plus size={16} />
              <span>+ Daftarkan Fasilitas / Potensi</span>
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
                        Beririsan Multi-RT
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Konten Kategori 2: Hunian Sewa (Kos & Kontrakan) */}
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
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {item.status_verifikasi || 'TERVERIFIKASI'}
                    </span>
                  </div>

                  {/* Metrik Kamar & Penghuni */}
                  <div className="grid grid-cols-3 gap-2 text-center p-2 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Kamar/Pintu</span>
                      <strong className="font-mono tabular-nums text-slate-900">{item.jumlah_kamar_pintu} Pintu</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Mahasiswa</span>
                      <strong className="font-mono tabular-nums text-sky-700">{item.jumlah_penghuni_pelajar} Jiwa</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Pekerja</span>
                      <strong className="font-mono tabular-nums text-slate-900">{item.jumlah_penghuni_pekerja} Jiwa</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>Pemilik: <strong>{item.nama_pemilik}</strong> ({item.no_kontak_pemilik})</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.apakah_pemilik_tinggal_di_rt ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {item.apakah_pemilik_tinggal_di_rt ? 'Tinggal di RT' : 'Luar Wilayah'}
                    </span>
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
      {/* ========================================================================= */}
      {activeTab === 'rentan' && (
        <div className="space-y-4">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-on-surface flex items-center gap-2">
                <Heart size={20} className="text-red-500" />
                <span>Pangkalan Data Perlindungan Sosial Anak Yatim & Lansia</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Deteksi ganda berbasis Kartu Keluarga (KK) dan sensor faktual lapangan Ketua RT/RW untuk AI Copilot.
              </p>
            </div>
            <h4 className="text-sm font-bold text-on-surface">Semua Berkas Surat RT Selesai Diverifikasi!</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
              Tidak ada permohonan surat warga yang tertahan di tingkat RT {user?.rt || '001'}. Kepatuhan pelayanan prima terjaga.
            </p>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                disabled={scanningKK}
                onClick={handleAutoScanKK}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Pindai potensi anak yatim & lansia dari data Kartu Keluarga"
              >
                {scanningKK ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} className="text-purple-600" />}
                <span>Pindai Otomatis KK</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAddRentanModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} />
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
              }`}
            >
              Semua ({kelompokRentanList.length})
            </button>
            <button
              type="button"
              onClick={() => setRentanFilter('yatim')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rentanFilter === 'yatim' ? 'bg-primary text-white' : 'bg-surface-container text-slate-700'
              }`}
            >
              Anak Yatim Piatu ({kelompokRentanList.filter(k => k.kategori.startsWith('ANAK_')).length})
            </button>
            <button
              type="button"
              onClick={() => setRentanFilter('lansia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                rentanFilter === 'lansia' ? 'bg-primary text-white' : 'bg-surface-container text-slate-700'
              }`}
            >
              Lansia Sebatang Kara ({kelompokRentanList.filter(k => k.kategori.startsWith('LANSIA_')).length})
            </button>
          </div>

          {/* Hasil Scan KK Otomatis (Jika Baru Saja Dipindai) */}
          {scanResult && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-2">
              <h4 className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5">
                <Sparkles size={15} className="text-purple-600" />
                <span>Hasil Pemindaian Algoritma KK: {scanResult.potensi_yatim_piatu.length} Anak Terindikasi & {scanResult.potensi_lansia_rentan.length} Lansia Tunggal</span>
              </h4>
              <p className="text-[11px] text-purple-800">
                Sistem mendeteksi anak di bawah 18 tahun tanpa status orang tua lengkap dan lansia yang tinggal sendiri/berdua di database KK kelurahan.
              </p>
            </div>
          )}

          {/* Daftar Warga Rentan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredKelompokRentan.map((item) => (
              <div key={item.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                      item.kategori.startsWith('ANAK_') ? 'bg-pink-100 text-pink-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {item.kategori.startsWith('ANAK_') ? <Baby size={20} /> : <HeartPulse size={20} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{item.nama}</h4>
                      <p className="text-[11px] text-slate-500 font-mono tabular-nums">
                        NIK: {item.nik} · {item.usia} Thn · {item.jenis_kelamin === 'L' ? 'L' : 'P'}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.kategori.includes('YATIM_PIATU') ? 'bg-red-100 text-red-900 border border-red-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
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
      {/* ========================================================================= */}
      <AnimatePresence>
        {inspectDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
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
                  <div>
                    <h3 className="text-sm font-extrabold">Uji Verifikasi Faktual Dokumen</h3>
                    <p className="text-xs text-blue-100 font-mono tabular-nums">
                      {inspectDoc.nomor_registrasi || `REG-${inspectDoc.id}`} · {inspectDoc.jenis_surat || inspectDoc.jenis_dokumen}
                    </p>
                  </div>
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
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">NIK Pemohon</span>
                      <strong className="font-mono tabular-nums text-slate-900">{inspectDoc.nik_pemohon}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Nomor Kartu Keluarga (KK)</span>
                      <strong className="font-mono tabular-nums text-slate-900">{inspectDoc.no_kk || '3273011802900012'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Domisili Faktual</span>
                      <strong className="text-slate-900">RT {inspectDoc.rt || '001'} / RW {inspectDoc.rw || '001'}</strong>
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
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 block">KTP-el Terverifikasi</span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-2">
                      <div className="h-28 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-mono text-[11px]">
                        [Foto Kartu Keluarga]
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 block">KK Resmi Disdukcapil</span>
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
                  <button
                    type="button"
                    onClick={() => {
                      setRejectModalDoc(inspectDoc);
                      setRejectReason('');
                    }}
                    className="px-3 py-2 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 font-bold text-xs cursor-pointer"
                  >
                    Tolak Permohonan
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
          </div>
        )}
      </div>
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL PENOLAKAN / CATATAN REVISI DOKUMEN                                  */}
      {/* MODAL PENOLAKAN PERMANEN                                                  */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {rejectModalDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated p-5 space-y-4"
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
                </div>
                <button
                  type="button"
                  onClick={() => setRejectModalDoc(null)}
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container"
                  className="p-1 rounded text-on-surface-variant hover:bg-surface-container cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-lg space-y-1">
                <p><strong>Dokumen:</strong> {rejectModalDoc.jenis_surat || rejectModalDoc.jenis_dokumen}</p>
                <p><strong>Pemohon:</strong> {rejectModalDoc.nama_pemohon || rejectModalDoc.nik_pemohon}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Alasan Penolakan / Catatan Perbaikan <span className="text-red-500">*</span>
                  Alasan Penolakan Resmi <span className="text-red-500">*</span>
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
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectModalDoc(null)}
                  className="px-3 py-2 text-xs font-semibold rounded-lg text-on-surface-variant hover:bg-surface-container"
                  className="px-3.5 py-2 text-xs font-bold rounded-xl text-slate-600 hover:bg-surface-container cursor-pointer"
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
                  }`}
                >
                  Tempat Ibadah
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
  );
}

