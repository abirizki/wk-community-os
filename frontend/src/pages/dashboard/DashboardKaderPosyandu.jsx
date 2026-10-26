/**
 * frontend/src/pages/dashboard/DashboardKaderPosyandu.jsx
 * Super App Bento Grid Kader Posyandu — Digital KIA & Integrated Community Health
 * Menyelaraskan konsep UI/UX dengan Dashboard RT & RW:
 * 1. Persona Header (Mode Kader Posyandu Aktif + Dual Persona ke Layanan Warga Mandiri)
 * 2. Kanaya AI Strategic Health Copilot Bento Card (Evidence-Based Health Recommendations)
 * 3. Super Apps Bento Hub (Buku KIA Balita, Ibu Hamil & 1000 HPK, Skrining Lansia, Distribusi PMT & Vitamin, Antrean Offline)
 * 4. 1-Click WhatsApp Broadcast Undangan Posyandu ke Grup RT
 * 5. 100% Offline-First (IndexedDB & offlineQueue) + Sanity Bounds
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { offlineQueue } from '../../utils/offlineQueue';
import { cacheData, getCachedData } from '../../utils/offlineStorage';
import {
  StatusBadge,
  KartuKIADigital,
  KartuLansiaDigital
} from '../../components/design-system';
import {
  Baby,
  HeartPulse,
  Activity,
  Plus,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  X,
  FileCheck,
  ChevronRight,
  Database,
  ArrowRight,
  Search,
  Filter,
  Award,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
  UserCheck,
  HelpCircle,
  UserPlus,
  FileText,
  Send,
  Check,
  Sparkles,
  MessageCircle,
  Home,
  Heart,
  ShieldCheck,
  Scale,
  ExternalLink,
  Share2,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardKaderPosyandu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State Data & Profil Kader
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);
  const [kaderProfile, setKaderProfile] = useState(null);
  const [kaderTeam, setKaderTeam] = useState([]);

  // Target Warga Lists (Scoped by Wilayah Tugas)
  const [targetBalita, setTargetBalita] = useState([]);
  const [targetLansia, setTargetLansia] = useState([]);
  const [targetBumil, setTargetBumil] = useState([]);
  const [pmtList, setPmtList] = useState([]);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);
  const [offlineQueueItems, setOfflineQueueItems] = useState([]);

  // Active Bento Pillar: 'balita' | 'bumil' | 'lansia' | 'pmt' | 'offline' | 'riwayat'
  const activePillar = searchParams.get('tab') || 'balita';
  const handlePillarChange = (newPillar) => {
    setSearchParams({ tab: newPillar });
    setTimeout(() => {
      const el = document.getElementById('bento-pillar-content');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Sub-filters
  const [balitaFilter, setBalitaFilter] = useState('all'); // 'all' | 'unweighed' | 'at_risk'
  const [bumilFilter, setBumilFilter] = useState('all'); // 'all' | 'unexamined' | 'kek'
  const [lansiaFilter, setLansiaFilter] = useState('all'); // 'all' | 'unexamined' | 'at_risk'

  // Modals State
  const [showBalitaModal, setShowBalitaModal] = useState(false);
  const [showLansiaModal, setShowLansiaModal] = useState(false);
  const [showBumilModal, setShowBumilModal] = useState(false);
  const [showPmtModal, setShowPmtModal] = useState(false);
  const [showDaftarSasaranModal, setShowDaftarSasaranModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

  const [savingRecord, setSavingRecord] = useState(false);
  const [submittingSasaran, setSubmittingSasaran] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [actionSuccessToast, setActionSuccessToast] = useState('');

  // Selected Warga State for Measurement Form
  const [selectedBalita, setSelectedBalita] = useState(null);
  const [balitaSearchQuery, setBalitaSearchQuery] = useState('');
  const [selectedLansia, setSelectedLansia] = useState(null);
  const [lansiaSearchQuery, setLansiaSearchQuery] = useState('');
  const [selectedBumil, setSelectedBumil] = useState(null);
  const [bumilSearchQuery, setBumilSearchQuery] = useState('');

  // Form State: Pendaftaran Sasaran Baru (Bayi / Bumil / Lansia)
  const [daftarSasaranForm, setDaftarSasaranForm] = useState({
    tipe: 'balita', // 'balita' | 'bumil' | 'lansia'
    nama: '',
    jenis_kelamin: 'L',
    tanggal_lahir: '',
    tempat_lahir: 'Bandung',
    rt: '001',
    rw: '001',
    alamat: 'Jl. Kebonjati',
    nama_ibu: '',
    nama_ayah: '',
    nama_suami: '',
    no_kontak: '',
    no_kk: '',
    nik: '',
    usia_kehamilan_minggu: 12,
    lila_cm: 24.0,
    status_tinggal: 'Bersama Keluarga',
    riwayat_penyakit: ''
  });

  // Form State: Antropometri Balita
  const [balitaForm, setBalitaForm] = useState({
    berat_badan_kg: '',
    tinggi_badan_cm: '',
    lingkar_kepala_cm: '',
    status_gizi: 'Auto',
    imunisasi: '',
    catatan_kesehatan: ''
  });

  // Form State: Skrining Lansia
  const [lansiaForm, setLansiaForm] = useState({
    tensi_sistolik: '',
    tensi_diastolik: '',
    gula_darah_sewaktu: '',
    kolesterol: '',
    asam_urat: '',
    berat_badan_kg: '',
    tinggi_badan_cm: '',
    skor_kemandirian_adl: 'Mandiri',
    keluhan: '',
    tindakan_petugas: ''
  });

  // Form State: Pemeriksaan Ibu Hamil
  const [bumilForm, setBumilForm] = useState({
    usia_kehamilan_minggu: '',
    berat_badan_kg: '',
    tensi_sistolik: '120',
    tensi_diastolik: '80',
    lila_cm: '24.0',
    tinggi_fundus_cm: '',
    djj: '',
    hb_g_dl: '12.0',
    ttd_diberikan: 30,
    keluhan: '',
    tindakan_petugas: ''
  });

  // Form State: Distribusi PMT
  const [pmtForm, setPmtForm] = useState({
    target_kategori: 'BALITA_GIZI_KURANG',
    nama_penerima: '',
    nik_penerima: '',
    rt: '001',
    rw: '001',
    jenis_bantuan: 'Biskuit Balita Kemenkes & Susu',
    jumlah_paket: 1,
    catatan: ''
  });

  // Form State: Undangan WhatsApp Broadcast
  const [waBroadcastForm, setWaBroadcastForm] = useState({
    hari_tanggal: 'Selasa, 20 Oktober 2026',
    jam: '08:30 - 11:30 WIB',
    tempat: 'Pos RW 001 Kelurahan Kebonjati',
    target_rt: 'RT 001 & RT 002',
    catatan_khusus: 'Membawa Buku KIA / KMS dan fotokopi KK'
  });

  // Load all dashboard data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // 1. Fetch AI Brief
      setLoadingBrief(true);
      api.get('/analytics/role-brief')
        .then((res) => {
          if (res.success) setAiBrief(res.data);
        })
        .catch((err) => console.warn('[KaderDashboard] AI brief err:', err.message))
        .finally(() => setLoadingBrief(false));

      // 2. Fetch Kader Profile & Wilayah Tugas
      api.get('/posyandu/kader/my-profile')
        .then((res) => {
          if (res.success && res.data) {
            setKaderProfile(res.data);
            cacheData('bw_kader_profile', res.data);
          }
        })
        .catch(() => {});

      // 3. Fetch Targets (Balita, Lansia, Bumil, PMT)
      const [bTargetRes, lTargetRes, bumilRes, pmtRes] = await Promise.allSettled([
        api.get('/posyandu/warga-target?category=balita'),
        api.get('/posyandu/warga-target?category=lansia'),
        api.get('/posyandu/bumil'),
        api.get('/posyandu/pmt')
      ]);

      if (bTargetRes.status === 'fulfilled' && bTargetRes.value?.success) {
        const list = bTargetRes.value.data || [];
        setTargetBalita(list);
        cacheData('bw_kader_target_balita', list);
      }

      if (lTargetRes.status === 'fulfilled' && lTargetRes.value?.success) {
        const list = lTargetRes.value.data || [];
        setTargetLansia(list);
        cacheData('bw_kader_target_lansia', list);
      }

      if (bumilRes.status === 'fulfilled' && bumilRes.value?.success) {
        const list = bumilRes.value.data || [];
        setTargetBumil(list);
        cacheData('bw_kader_target_bumil', list);
      }

      if (pmtRes.status === 'fulfilled' && pmtRes.value?.success) {
        const list = pmtRes.value.data || [];
        setPmtList(list);
        cacheData('bw_kader_pmt_list', list);
      }

      // 4. Check offline queue
      const count = await offlineQueue.getPendingCount();
      setOfflinePendingCount(count);
      const queue = await offlineQueue.getQueue();
      setOfflineQueueItems(queue || []);

      // 5. Fetch Kader Team Members
      api.get('/posyandu/tim-kader')
        .then((res) => {
          if (res.success && res.data) setKaderTeam(res.data);
        })
        .catch(() => {});

    } catch (e) {
      console.warn('[KaderDashboard] Network fetch failed, loading offline cache:', e.message);
      const cachedProfile = await getCachedData('bw_kader_profile');
      if (cachedProfile) setKaderProfile(cachedProfile);

      const cachedBalita = await getCachedData('bw_kader_target_balita');
      if (cachedBalita) setTargetBalita(cachedBalita);

      const cachedLansia = await getCachedData('bw_kader_target_lansia');
      if (cachedLansia) setTargetLansia(cachedLansia);

      const cachedBumil = await getCachedData('bw_kader_target_bumil');
      if (cachedBumil) setTargetBumil(cachedBumil);

      const cachedPmt = await getCachedData('bw_kader_pmt_list');
      if (cachedPmt) setPmtList(cachedPmt);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const updateQueue = async () => {
      const count = await offlineQueue.getPendingCount();
      setOfflinePendingCount(count);
      const queue = await offlineQueue.getQueue();
      setOfflineQueueItems(queue || []);
    };

    window.addEventListener('offline-queue-updated', updateQueue);
    window.addEventListener('bw-offline-queue-changed', updateQueue);

    return () => {
      window.removeEventListener('offline-queue-updated', updateQueue);
      window.removeEventListener('bw-offline-queue-changed', updateQueue);
    };
  }, []);

  // Format Wilayah Tugas Teks
  const wilayahTugasLabel = useMemo(() => {
    if (!kaderProfile?.wilayah_tugas || kaderProfile.wilayah_tugas.length === 0) {
      return `RW ${user?.rw || '001'} Kelurahan Kebonjati`;
    }
    const rts = kaderProfile.wilayah_tugas.map((w) => `RT ${w.rt}`).join(', ');
    const rw = kaderProfile.wilayah_tugas[0]?.rw || user?.rw || '001';
    return `${kaderProfile.nama_posyandu || 'Posyandu Melati'} · Binaan: ${rts} / RW ${rw}`;
  }, [kaderProfile, user]);

  // Kalkulasi KPI Posyandu
  const kpiMetrics = useMemo(() => {
    const totalBalita = targetBalita.length;
    const sudahTimbangBalita = targetBalita.filter((b) => b.sudah_ditimbang_bulan_ini === 1).length;
    const persenTimbangBalita = totalBalita > 0 ? Math.round((sudahTimbangBalita / totalBalita) * 100) : 0;
    const balitaGiziKurang = targetBalita.filter((b) =>
      b.last_status_gizi === 'Gizi Kurang' || b.last_status_gizi === 'Gizi Buruk' || b.last_status_gizi === 'Perlu Perhatian Gizi'
    ).length;

    const totalBumil = targetBumil.length;
    const bumilKek = targetBumil.filter((b) => b.status_kek === 'Risiko KEK' || (b.lila_cm && b.lila_cm < 23.5)).length;

    const totalLansia = targetLansia.length;
    const lansiaRisiko = targetLansia.filter((l) =>
      (l.last_tensi_sistolik && l.last_tensi_sistolik >= 140) ||
      l.status_tinggal === 'Sebatang Kara' ||
      (l.last_gds && l.last_gds >= 200)
    ).length;

    return {
      totalBalita,
      sudahTimbangBalita,
      persenTimbangBalita,
      balitaGiziKurang,
      totalBumil,
      bumilKek,
      totalLansia,
      lansiaRisiko,
      totalPmt: pmtList.length
    };
  }, [targetBalita, targetBumil, targetLansia, pmtList]);

  // Action Center Items
  const actionItems = useMemo(() => {
    const list = [];

    // 1. Alert Offline Queue
    if (offlinePendingCount > 0) {
      list.push({
        id: 'act-offline-queue',
        title: `${offlinePendingCount} Data Pemeriksaan Tersimpan Offline`,
        description: 'Perubahan dicatat saat offline. Klik untuk sinkronkan segera ke server kelurahan.',
        severity: 'high',
        icon: 'Database',
        actionLabel: 'Sinkronkan Sekarang',
        onClick: async () => {
          await offlineQueue.flush(api);
          setActionSuccessToast('Sinkronisasi offline berhasil!');
          setTimeout(() => setActionSuccessToast(''), 3000);
          loadDashboardData();
        }
      });
    }

    // 2. Balita Belum Ditimbang Bulan Ini
    const unweighedBalita = targetBalita.filter((b) => b.sudah_ditimbang_bulan_ini === 0);
    if (unweighedBalita.length > 0) {
      const sample = unweighedBalita[0];
      list.push({
        id: 'act-unweighed-balita',
        title: `${unweighedBalita.length} Balita Belum Ditimbang Bulan Ini`,
        description: `Contoh: ${sample.nama_anak} (RT ${sample.rt}). Terakhir ditimbang ${sample.last_tanggal_pemeriksaan || 'Belum ada data'}.`,
        severity: unweighedBalita.length > 3 ? 'high' : 'medium',
        icon: 'Baby',
        actionLabel: `Timbang ${sample.nama_anak}`,
        onClick: () => {
          setSelectedBalita(sample);
          setFormError('');
          setShowBalitaModal(true);
        }
      });
    }

    // 3. Bumil Risiko KEK (LILA < 23.5 cm)
    const kekBumil = targetBumil.filter((b) => b.status_kek === 'Risiko KEK' || (b.lila_cm && b.lila_cm < 23.5));
    if (kekBumil.length > 0) {
      const b = kekBumil[0];
      list.push({
        id: 'act-kek-bumil',
        title: `Prioritas 1000 HPK: ${b.nama} (LILA ${b.lila_cm || '-'} cm)`,
        description: `Usia kehamilan ${b.usia_kehamilan_minggu} minggu (RT ${b.rt}). Membutuhkan distribusi PMT pemulihan & suplementasi TTD.`,
        severity: 'high',
        icon: 'Heart',
        actionLabel: 'Catat Skrining Bumil',
        onClick: () => {
          setSelectedBumil(b);
          setFormError('');
          setShowBumilModal(true);
        }
      });
    }

    // 4. Lansia Hipertensi / Sebatang Kara Belum Diperiksa
    const unexaminedLansia = targetLansia.filter((l) =>
      l.sudah_diperiksa_bulan_ini === 0 &&
      (l.status_tinggal === 'Sebatang Kara' || (l.last_tensi_sistolik && l.last_tensi_sistolik >= 140))
    );
    if (unexaminedLansia.length > 0) {
      const l = unexaminedLansia[0];
      list.push({
        id: `act-lansia-${l.nik}`,
        title: `Kunjungan Lansia: ${l.nama} (${l.usia} thn)`,
        description: `${l.status_tinggal === 'Sebatang Kara' ? 'Sebatang Kara · ' : ''}Tensi terakhir: ${l.last_tensi_sistolik || '-'}/${l.last_tensi_diastolik || '-'} mmHg. Belum diperiksa bulan ini.`,
        severity: 'high',
        icon: 'HeartPulse',
        actionLabel: `Periksa ${l.nama}`,
        onClick: () => {
          setSelectedLansia(l);
          setFormError('');
          setShowLansiaModal(true);
        }
      });
    }

    return list;
  }, [offlinePendingCount, targetBalita, targetBumil, targetLansia]);

  // Filtered Display Lists
  const displayedBalita = useMemo(() => {
    return targetBalita.filter((b) => {
      if (balitaFilter === 'unweighed') return b.sudah_ditimbang_bulan_ini === 0;
      if (balitaFilter === 'at_risk') {
        return b.last_status_gizi === 'Gizi Kurang' || b.last_status_gizi === 'Gizi Buruk' || b.last_status_gizi === 'Perlu Perhatian Gizi';
      }
      return true;
    });
  }, [targetBalita, balitaFilter]);

  const displayedBumil = useMemo(() => {
    return targetBumil.filter((b) => {
      if (bumilFilter === 'unexamined') return b.sudah_diperiksa_bulan_ini === 0;
      if (bumilFilter === 'kek') return b.status_kek === 'Risiko KEK' || (b.lila_cm && b.lila_cm < 23.5);
      return true;
    });
  }, [targetBumil, bumilFilter]);

  const displayedLansia = useMemo(() => {
    return targetLansia.filter((l) => {
      if (lansiaFilter === 'unexamined') return l.sudah_diperiksa_bulan_ini === 0;
      if (lansiaFilter === 'at_risk') {
        return (l.last_tensi_sistolik && l.last_tensi_sistolik >= 140) || l.status_tinggal === 'Sebatang Kara';
      }
      return true;
    });
  }, [targetLansia, lansiaFilter]);

  // Candidate Search Results in Modals
  const balitaCandidates = useMemo(() => {
    if (!balitaSearchQuery.trim()) return targetBalita;
    const q = balitaSearchQuery.toLowerCase();
    return targetBalita.filter((b) =>
      b.nama_anak.toLowerCase().includes(q) ||
      b.nik_anak.includes(q) ||
      (b.nama_ibu && b.nama_ibu.toLowerCase().includes(q)) ||
      b.rt.includes(q)
    );
  }, [targetBalita, balitaSearchQuery]);

  const bumilCandidates = useMemo(() => {
    if (!bumilSearchQuery.trim()) return targetBumil;
    const q = bumilSearchQuery.toLowerCase();
    return targetBumil.filter((b) =>
      b.nama.toLowerCase().includes(q) ||
      b.nik.includes(q) ||
      (b.nama_suami && b.nama_suami.toLowerCase().includes(q)) ||
      b.rt.includes(q)
    );
  }, [targetBumil, bumilSearchQuery]);

  const lansiaCandidates = useMemo(() => {
    if (!lansiaSearchQuery.trim()) return targetLansia;
    const q = lansiaSearchQuery.toLowerCase();
    return targetLansia.filter((l) =>
      l.nama.toLowerCase().includes(q) ||
      l.nik.includes(q) ||
      l.rt.includes(q) ||
      (l.alamat && l.alamat.toLowerCase().includes(q))
    );
  }, [targetLansia, lansiaSearchQuery]);

  // ===========================================================================
  // SUBMISSION HANDLERS: OFFLINE-FIRST WITH SANITY BOUNDS
  // ===========================================================================

  // 1. Simpan Balita
  const handleSaveBalita = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedBalita) {
      setFormError('Silakan cari dan pilih balita terlebih dahulu.');
      return;
    }

    const bb = parseFloat(balitaForm.berat_badan_kg);
    const tb = parseFloat(balitaForm.tinggi_badan_cm);
    const lk = balitaForm.lingkar_kepala_cm ? parseFloat(balitaForm.lingkar_kepala_cm) : null;

    if (isNaN(bb) || bb < 1.0 || bb > 35.0) {
      setFormError('Sanity Bounds: Berat badan balita harus berada dalam rentang 1.0 – 35.0 kg.');
      return;
    }
    if (isNaN(tb) || tb < 35.0 || tb > 130.0) {
      setFormError('Sanity Bounds: Tinggi badan balita harus berada dalam rentang 35.0 – 130.0 cm.');
      return;
    }
    if (lk !== null && (lk < 25.0 || lk > 60.0)) {
      setFormError('Sanity Bounds: Lingkar kepala harus berada dalam rentang 25.0 – 60.0 cm.');
      return;
    }

    const payload = {
      nik_warga: selectedBalita.nik_ibu || selectedBalita.nik_anak,
      nik_anak: selectedBalita.nik_anak,
      nama_anak: selectedBalita.nama_anak,
      tanggal_lahir_anak: selectedBalita.tanggal_lahir_anak,
      jenis_kelamin_anak: selectedBalita.jenis_kelamin_anak,
      umur_bulan: selectedBalita.umur_bulan,
      berat_badan_kg: bb,
      tinggi_badan_cm: tb,
      lingkar_kepala_cm: lk,
      status_gizi: balitaForm.status_gizi,
      imunisasi: balitaForm.imunisasi,
      catatan_kesehatan: balitaForm.catatan_kesehatan,
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      petugas: user?.nama || 'Kader Posyandu'
    };

    setSavingRecord(true);
    try {
      if (!navigator.onLine) {
        await offlineQueue.enqueue({
          type: 'POSYANDU_CHECKUP_BALITA',
          endpoint: '/api/posyandu/balita',
          method: 'POST',
          payload,
          label: `Penimbangan Balita: ${selectedBalita.nama_anak} (${bb} kg / ${tb} cm)`
        });

        setModalSuccessMsg(`Disimpan secara offline. Data penimbangan ${selectedBalita.nama_anak} akan disinkronkan saat online.`);
        setTimeout(() => {
          setShowBalitaModal(false);
          setSelectedBalita(null);
          setModalSuccessMsg('');
          loadDashboardData();
        }, 2000);
        return;
      }

      await api.post('/posyandu/balita', payload);
      setModalSuccessMsg(`Penimbangan ${selectedBalita.nama_anak} berhasil disimpan!`);
      setTimeout(() => {
        setShowBalitaModal(false);
        setSelectedBalita(null);
        setModalSuccessMsg('');
        loadDashboardData();
      }, 1500);
    } catch (err) {
      const isNetworkErr = !navigator.onLine || err.status === 0 || err.status === 503 || err.code === 'ERR_NETWORK';
      if (isNetworkErr) {
        await offlineQueue.enqueue({
          type: 'POSYANDU_CHECKUP_BALITA',
          endpoint: '/api/posyandu/balita',
          method: 'POST',
          payload,
          label: `Penimbangan Balita: ${selectedBalita.nama_anak} (${bb} kg)`
        });
        setModalSuccessMsg(`Koneksi terputus. Penimbangan ${selectedBalita.nama_anak} tersimpan secara offline.`);
        setTimeout(() => {
          setShowBalitaModal(false);
          setSelectedBalita(null);
          setModalSuccessMsg('');
        }, 2000);
      } else {
        setFormError(err.message || 'Gagal menyimpan data balita.');
      }
    } finally {
      setSavingRecord(false);
    }
  };

  // 2. Simpan Pemeriksaan Ibu Hamil
  const handleSaveBumil = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedBumil) {
      setFormError('Silakan cari dan pilih ibu hamil terlebih dahulu.');
      return;
    }

    const bb = parseFloat(bumilForm.berat_badan_kg);
    const sis = parseInt(bumilForm.tensi_sistolik, 10);
    const dia = parseInt(bumilForm.tensi_diastolik, 10);
    const lila = parseFloat(bumilForm.lila_cm);
    const usiaMinggu = parseInt(bumilForm.usia_kehamilan_minggu, 10);

    if (isNaN(bb) || bb < 30.0 || bb > 150.0) {
      setFormError('Sanity Bounds: Berat badan ibu hamil harus dalam rentang 30.0 – 150.0 kg.');
      return;
    }
    if (isNaN(sis) || sis < 70 || sis > 240 || isNaN(dia) || dia < 40 || dia > 140) {
      setFormError('Sanity Bounds: Tekanan darah tidak wajar (Sistolik 70-240, Diastolik 40-140).');
      return;
    }
    if (isNaN(lila) || lila < 15.0 || lila > 45.0) {
      setFormError('Sanity Bounds: Lingkar Lengan Atas (LILA) harus dalam rentang 15.0 – 45.0 cm.');
      return;
    }

    const payload = {
      ibu_hamil_id: selectedBumil.id,
      usia_kehamilan_minggu: usiaMinggu || selectedBumil.usia_kehamilan_minggu || 12,
      berat_badan_kg: bb,
      tensi_sistolik: sis,
      tensi_diastolik: dia,
      lila_cm: lila,
      tinggi_fundus_cm: bumilForm.tinggi_fundus_cm ? parseFloat(bumilForm.tinggi_fundus_cm) : null,
      djj: bumilForm.djj ? parseInt(bumilForm.djj, 10) : null,
      hb_g_dl: bumilForm.hb_g_dl ? parseFloat(bumilForm.hb_g_dl) : null,
      ttd_diberikan: parseInt(bumilForm.ttd_diberikan, 10) || 30,
      keluhan: bumilForm.keluhan,
      tindakan_petugas: bumilForm.tindakan_petugas,
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      petugas: user?.nama || 'Kader Posyandu'
    };

    setSavingRecord(true);
    try {
      if (!navigator.onLine) {
        await offlineQueue.enqueue({
          type: 'POSYANDU_CHECKUP_BUMIL',
          endpoint: '/api/posyandu/bumil/pemeriksaan',
          method: 'POST',
          payload,
          label: `Pemeriksaan Bumil: ${selectedBumil.nama} (LILA ${lila} cm, Tensi ${sis}/${dia})`
        });

        setModalSuccessMsg(`Disimpan secara offline. Pemeriksaan bumil ${selectedBumil.nama} akan disinkronkan saat online.`);
        setTimeout(() => {
          setShowBumilModal(false);
          setSelectedBumil(null);
          setModalSuccessMsg('');
          loadDashboardData();
        }, 2000);
        return;
      }

      await api.post('/posyandu/bumil/pemeriksaan', payload);
      setModalSuccessMsg(`Pemeriksaan ibu hamil ${selectedBumil.nama} berhasil disimpan!`);
      setTimeout(() => {
        setShowBumilModal(false);
        setSelectedBumil(null);
        setModalSuccessMsg('');
        loadDashboardData();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan pemeriksaan ibu hamil.');
    } finally {
      setSavingRecord(false);
    }
  };

  // 3. Simpan Lansia
  const handleSaveLansia = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedLansia) {
      setFormError('Silakan cari dan pilih lansia terlebih dahulu.');
      return;
    }

    const sis = parseInt(lansiaForm.tensi_sistolik, 10);
    const dia = parseInt(lansiaForm.tensi_diastolik, 10);
    const bb = parseFloat(lansiaForm.berat_badan_kg);
    const tb = parseFloat(lansiaForm.tinggi_badan_cm);

    if (isNaN(sis) || sis < 70 || sis > 260 || isNaN(dia) || dia < 40 || dia > 150) {
      setFormError('Sanity Bounds: Tekanan darah harus dalam rentang wajar (Sistolik 70-260, Diastolik 40-150 mmHg).');
      return;
    }
    if (isNaN(bb) || bb < 20.0 || bb > 180.0) {
      setFormError('Sanity Bounds: Berat badan harus dalam rentang 20.0 – 180.0 kg.');
      return;
    }
    if (isNaN(tb) || tb < 100.0 || tb > 220.0) {
      setFormError('Sanity Bounds: Tinggi badan harus dalam rentang 100.0 – 220.0 cm.');
      return;
    }

    const payload = {
      posyandu_lansia_id: selectedLansia.posyandu_lansia_id || selectedLansia.id,
      nik: selectedLansia.nik,
      nama: selectedLansia.nama,
      tensi_sistolik: sis,
      tensi_diastolik: dia,
      gula_darah_sewaktu: lansiaForm.gula_darah_sewaktu ? parseInt(lansiaForm.gula_darah_sewaktu, 10) : null,
      kolesterol: lansiaForm.kolesterol ? parseInt(lansiaForm.kolesterol, 10) : null,
      asam_urat: lansiaForm.asam_urat ? parseFloat(lansiaForm.asam_urat) : null,
      berat_badan_kg: bb,
      tinggi_badan_cm: tb,
      skor_kemandirian_adl: lansiaForm.skor_kemandirian_adl,
      keluhan: lansiaForm.keluhan,
      tindakan_petugas: lansiaForm.tindakan_petugas,
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      petugas: user?.nama || 'Kader Posyandu'
    };

    setSavingRecord(true);
    try {
      if (!navigator.onLine) {
        await offlineQueue.enqueue({
          type: 'POSYANDU_CHECKUP_LANSIA',
          endpoint: '/api/posyandu/lansia/pemeriksaan',
          method: 'POST',
          payload,
          label: `Pemeriksaan Lansia: ${selectedLansia.nama} (Tensi ${sis}/${dia})`
        });
        setModalSuccessMsg(`Disimpan secara offline. Pemeriksaan lansia ${selectedLansia.nama} akan disinkronkan saat online.`);
        setTimeout(() => {
          setShowLansiaModal(false);
          setSelectedLansia(null);
          setModalSuccessMsg('');
          loadDashboardData();
        }, 2000);
        return;
      }

      await api.post('/posyandu/lansia/pemeriksaan', payload);
      setModalSuccessMsg(`Pemeriksaan lansia ${selectedLansia.nama} berhasil disimpan!`);
      setTimeout(() => {
        setShowLansiaModal(false);
        setSelectedLansia(null);
        setModalSuccessMsg('');
        loadDashboardData();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan pemeriksaan lansia.');
    } finally {
      setSavingRecord(false);
    }
  };

  // 4. Simpan Distribusi PMT
  const handleSavePmt = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!pmtForm.nama_penerima.trim()) {
      setFormError('Nama penerima PMT wajib diisi.');
      return;
    }

    const payload = {
      ...pmtForm,
      tanggal_distribusi: new Date().toISOString().split('T')[0],
      petugas: user?.nama || 'Kader Posyandu'
    };

    setSavingRecord(true);
    try {
      if (!navigator.onLine) {
        await offlineQueue.enqueue({
          type: 'POSYANDU_DISTRIBUSI_PMT',
          endpoint: '/api/posyandu/pmt',
          method: 'POST',
          payload,
          label: `Distribusi PMT: ${payload.nama_penerima} (${payload.jenis_bantuan})`
        });
        setModalSuccessMsg(`Tersimpan offline. Distribusi PMT ${payload.nama_penerima} akan disinkronkan saat online.`);
      } else {
        await api.post('/posyandu/pmt', payload);
        setModalSuccessMsg(`Distribusi PMT untuk ${payload.nama_penerima} berhasil dicatat!`);
      }

      setTimeout(() => {
        setShowPmtModal(false);
        setModalSuccessMsg('');
        loadDashboardData();
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan distribusi PMT.');
    } finally {
      setSavingRecord(false);
    }
  };

  // 5. Pendaftaran Sasaran Baru (Bayi / Bumil / Lansia)
  const handleSaveSasaranBaru = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!daftarSasaranForm.nama.trim()) {
      setFormError('Nama lengkap sasaran wajib diisi.');
      return;
    }
    if (!daftarSasaranForm.tanggal_lahir) {
      setFormError('Tanggal lahir sasaran wajib diisi.');
      return;
    }

    setSubmittingSasaran(true);
    try {
      const payload = {
        ...daftarSasaranForm,
        nama_posyandu: kaderProfile?.nama_posyandu || 'Posyandu Melati RW 001',
        rt: daftarSasaranForm.rt || (kaderProfile?.wilayah_tugas?.[0]?.rt) || '001',
        rw: daftarSasaranForm.rw || (kaderProfile?.wilayah_tugas?.[0]?.rw) || '001'
      };

      if (!navigator.onLine) {
        await offlineQueue.enqueue({
          type: 'POSYANDU_SASARAN_BARU',
          endpoint: '/api/posyandu/sasaran-baru',
          method: 'POST',
          payload,
          label: `Daftar Sasaran Baru (${payload.tipe}): ${payload.nama}`
        });
        setModalSuccessMsg(`Disimpan secara offline. Sasaran baru ${payload.nama} akan disinkronkan saat online.`);
      } else {
        await api.post('/posyandu/sasaran-baru', payload);
        setModalSuccessMsg(`Sasaran baru ${payload.nama} berhasil didaftarkan!`);
      }

      await loadDashboardData();

      setTimeout(() => {
        setShowDaftarSasaranModal(false);
        setModalSuccessMsg('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Gagal mendaftarkan sasaran baru.');
    } finally {
      setSubmittingSasaran(false);
    }
  };

  // 6. Buat Teks WhatsApp Broadcast Undangan Posyandu
  const generateWhatsAppMessage = () => {
    const text = `*UNDANGAN PELAYANAN POSYANDU & KESEHATAN KELUARGA* 🌸👶👵
*${kaderProfile?.nama_posyandu || 'Posyandu Melati RW 001'}*

Kepada Yth. Bapak/Ibu Warga ${waBroadcastForm.target_rt},
Mari periksakan tumbuh kembang buah hati dan kesehatan keluarga pada:

📅 *Hari/Tanggal:* ${waBroadcastForm.hari_tanggal}
⏰ *Waktu:* ${waBroadcastForm.jam}
📍 *Tempat:* ${waBroadcastForm.tempat}

*Layanan Tersedia:*
1. 👶 Penimbangan & Pengukuran Balita (Buku KIA / KMS Digital)
2. 🤰 Pemeriksaan Ibu Hamil, Pantau 1000 HPK & Tablet Tambah Darah (TTD)
3. 👵 Skrining Kesehatan Lansia (Tensi Darah & Gula Darah)
4. 🥗 Distribusi PMT Pemulihan, Vitamin A & Obat Cacing

*Catatan:*
- Mohon membawa Buku KIA / Kartu Posyandu
- ${waBroadcastForm.catatan_khusus}

_Mari bersama wujudkan generasi bebas stunting & lingkungan sehat!_
*Tim Kader Posyandu & Pengurus RT/RW*`;

    return text;
  };

  const handleOpenWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const encoded = encodeURIComponent(message);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyWhatsApp = () => {
    const message = generateWhatsAppMessage();
    navigator.clipboard.writeText(message);
    setActionSuccessToast('Teks undangan disalin ke clipboard!');
    setTimeout(() => setActionSuccessToast(''), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 p-3 sm:p-5 lg:p-7 max-w-7xl mx-auto space-y-6 pb-28">

      {/* Action Success Toast */}
      <AnimatePresence>
        {actionSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccessToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 1. TOP PERSONA BAR & DUAL-PERSONA SWITCHER                                */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 rounded-3xl p-4 sm:p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-teal-600/30">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-black border border-white/20 text-white shrink-0">
            <HeartPulse className="w-6 h-6 text-teal-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-300 text-teal-950">
                Mode Kader Posyandu Aktif
              </span>
              <span className="text-xs text-teal-100 font-mono">{wilayahTugasLabel}</span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {kaderProfile?.nama_lengkap || user?.nama || 'Kader Posyandu'} · Meja Kerja Digital Posyandu
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1-Click WhatsApp Broadcast Undangan */}
          <button
            type="button"
            onClick={() => setShowWhatsAppModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="Kirim Undangan Posyandu ke Grup WhatsApp RT"
          >
            <Share2 className="w-4 h-4 text-emerald-300" />
            <span>Broadcast Undangan WA</span>
          </button>

          {/* Daftarkan Sasaran Baru */}
          <button
            type="button"
            onClick={() => {
              setFormError('');
              setModalSuccessMsg('');
              setShowDaftarSasaranModal(true);
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/15 hover:bg-white/25 border border-white/25 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
            title="Daftarkan Bayi, Bumil, atau Lansia Baru"
          >
            <UserPlus className="w-4 h-4 text-teal-200" />
            <span>+ Sasaran Baru</span>
          </button>

          {/* Dual Persona Switcher */}
          <Link
            to="/dashboard/dokumen?mode=dampingan"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Buka Layanan Mandiri Warga Saya (Urus Surat, PBB & Profil Pribadi)"
          >
            <Home className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">Layanan Mandiri Warga Saya</span>
            <span className="sm:hidden">Warga Saya</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </div>

      {/* Multi-Kader Active Team Banner */}
      {kaderTeam.length > 1 && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-sky-700 shrink-0" />
            <span>
              <strong>Tim Posyandu Aktif ({kaderProfile?.nama_posyandu || 'Posyandu Melati'}):</strong>{' '}
              {kaderTeam.map((k) => `${k.nama_lengkap} (${k.wilayah_tugas?.map((w) => `RT ${w.rt}`).join(', ') || 'Semua RT'})`).join(' · ')}
            </span>
          </div>
          <span className="text-[11px] font-bold text-sky-800 bg-white px-2.5 py-0.5 rounded-full border border-sky-200 shrink-0 self-start sm:self-auto">
            {kaderTeam.length} Kader Bertugas
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. KANAYA AI STRATEGIC HEALTH COPILOT BENTO CARD                          */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-gradient-to-br from-teal-50 via-emerald-50/80 to-sky-50/60 border border-teal-200/70 shadow-sm relative overflow-hidden group">
        <div className="absolute right-0 top-0 w-48 h-48 bg-teal-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-36 h-36 bg-emerald-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase tracking-wider border border-teal-200">
                  Kanaya AI Strategic Health Policy
                </span>
                <span className="text-[11px] font-semibold text-slate-500 font-mono">1000 HPK & Posyandu Integratif</span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                Radar Deteksi Dini & Rekomendasi Kesehatan Wilayah
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-white hover:bg-teal-50 text-teal-800 text-xs font-bold border border-teal-200 shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Perbarui Analitik</span>
          </button>
        </div>

        <div className="relative z-10 mt-4 pt-3.5 border-t border-teal-100">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {loadingBrief ? (
              <span className="flex items-center gap-2 text-teal-700">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menganalisis pertumbuhan balita, status gizi ibu hamil, dan lansia...
              </span>
            ) : (
              aiBrief?.summary || `Halo, ${user?.nama || "Ibu Kader"}. Cakupan penimbangan balita tercatat ${kpiMetrics.persenTimbangBalita}% (${kpiMetrics.sudahTimbangBalita} dari ${kpiMetrics.totalBalita} anak). Terdapat ${kpiMetrics.balitaGiziKurang} balita perlu evaluasi PMT, ${kpiMetrics.bumilKek} ibu hamil terindikasi risiko KEK (LILA < 23.5 cm), serta ${kpiMetrics.lansiaRisiko} lansia risiko tinggi yang memerlukan pemantauan tensi & kunjungan rumah.`
            )}
          </p>
        </div>

        {/* 4 Micro KPI Badges */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-teal-100/60">
          <div className="p-2.5 rounded-xl bg-white/90 border border-teal-100 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-slate-500">Cakupan Timbang (D/S)</span>
            <span className="text-xs sm:text-sm font-extrabold text-teal-800 font-mono mt-0.5">
              {kpiMetrics.persenTimbangBalita}% ({kpiMetrics.sudahTimbangBalita}/{kpiMetrics.totalBalita})
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/90 border border-teal-100 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-slate-500">Perhatian Gizi Balita</span>
            <span className="text-xs sm:text-sm font-extrabold text-rose-600 font-mono mt-0.5">
              {kpiMetrics.balitaGiziKurang} balita
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/90 border border-teal-100 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-slate-500">Bumil Risiko KEK</span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-600 font-mono mt-0.5">
              {kpiMetrics.bumilKek} dari {kpiMetrics.totalBumil} ibu
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/90 border border-teal-100 flex flex-col justify-center">
            <span className="text-[10px] font-semibold text-slate-500">Lansia Berisiko / PTM</span>
            <span className="text-xs sm:text-sm font-extrabold text-purple-700 font-mono mt-0.5">
              {kpiMetrics.lansiaRisiko} jiwa
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SUPER APPS BENTO HUB SELECTOR (5 PILLARS)                              */}
      {/* ========================================================================= */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
            <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-700">
              Pilar Meja Kerja Super App Kader Posyandu
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">Pilih modul tugas lapangan</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Pillar 1: KIA Balita */}
          <button
            type="button"
            onClick={() => handlePillarChange('balita')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              activePillar === 'balita'
                ? 'bg-teal-600 text-white border-teal-700 shadow-md ring-2 ring-teal-400/40'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activePillar === 'balita' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'}`}>
                <Baby size={18} />
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activePillar === 'balita' ? 'bg-teal-700 text-teal-100' : 'bg-slate-100 text-slate-700'}`}>
                {targetBalita.length} Anak
              </span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold leading-tight">Buku KIA Balita</p>
            <p className={`text-[11px] mt-0.5 ${activePillar === 'balita' ? 'text-teal-100' : 'text-slate-500'}`}>
              {kpiMetrics.sudahTimbangBalita} ditimbang · {kpiMetrics.totalBalita - kpiMetrics.sudahTimbangBalita} belum
            </p>
          </button>

          {/* Pillar 2: Ibu Hamil & 1000 HPK */}
          <button
            type="button"
            onClick={() => handlePillarChange('bumil')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              activePillar === 'bumil'
                ? 'bg-pink-600 text-white border-pink-700 shadow-md ring-2 ring-pink-400/40'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activePillar === 'bumil' ? 'bg-white/20 text-white' : 'bg-pink-50 text-pink-700'}`}>
                <Heart size={18} />
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activePillar === 'bumil' ? 'bg-pink-700 text-pink-100' : 'bg-slate-100 text-slate-700'}`}>
                {targetBumil.length} Bumil
              </span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold leading-tight">Ibu Hamil & 1000 HPK</p>
            <p className={`text-[11px] mt-0.5 ${activePillar === 'bumil' ? 'text-pink-100' : 'text-slate-500'}`}>
              LILA, KEK & Suplemen TTD
            </p>
          </button>

          {/* Pillar 3: Skrining Lansia */}
          <button
            type="button"
            onClick={() => handlePillarChange('lansia')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              activePillar === 'lansia'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activePillar === 'lansia' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                <HeartPulse size={18} />
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activePillar === 'lansia' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-700'}`}>
                {targetLansia.length} Jiwa
              </span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold leading-tight">Skrining Lansia</p>
            <p className={`text-[11px] mt-0.5 ${activePillar === 'lansia' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Hipertensi, GDS & ADL
            </p>
          </button>

          {/* Pillar 4: PMT & Suplementasi */}
          <button
            type="button"
            onClick={() => handlePillarChange('pmt')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
              activePillar === 'pmt'
                ? 'bg-amber-600 text-white border-amber-700 shadow-md ring-2 ring-amber-400/40'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activePillar === 'pmt' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>
                <Scale size={18} />
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${activePillar === 'pmt' ? 'bg-amber-700 text-amber-100' : 'bg-slate-100 text-slate-700'}`}>
                {pmtList.length} Distribusi
              </span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold leading-tight">PMT & Suplementasi</p>
            <p className={`text-[11px] mt-0.5 ${activePillar === 'pmt' ? 'text-amber-100' : 'text-slate-500'}`}>
              Biskuit, Vit A & Cacing
            </p>
          </button>

          {/* Pillar 5: Antrean Offline & Sync */}
          <button
            type="button"
            onClick={() => handlePillarChange('offline')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group col-span-2 sm:col-span-1 lg:col-span-1 ${
              activePillar === 'offline'
                ? 'bg-slate-800 text-white border-slate-900 shadow-md ring-2 ring-slate-400/40'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activePillar === 'offline' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <Database size={18} />
              </div>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${offlinePendingCount > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-800'}`}>
                {offlinePendingCount} Antrean
              </span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold leading-tight">Offline & Sync</p>
            <p className={`text-[11px] mt-0.5 ${activePillar === 'offline' ? 'text-slate-200' : 'text-slate-500'}`}>
              IndexedDB Aktif
            </p>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ACTION CENTER: PRIORITAS TUGAS LAPANGAN                                */}
      {/* ========================================================================= */}
      {actionItems.length > 0 && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                Tindakan Prioritas Lapangan ({actionItems.length})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">Penyelesaian cepat</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actionItems.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-3 ${
                  item.severity === 'high' ? 'bg-rose-50/60 border-rose-200' : 'bg-amber-50/60 border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                      item.severity === 'high' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {item.severity === 'high' ? 'PENTING' : 'PERHATIAN'}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                </div>
                <button
                  type="button"
                  onClick={item.onClick}
                  className={`self-start px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                    item.severity === 'high'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <span>{item.actionLabel}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MAIN CONTENT PANELS (DRIVEN BY BENTO PILLAR)                           */}
      {/* ========================================================================= */}
      <div id="bento-pillar-content" className="space-y-4">

        {/* --------------------------------------------------------------------- */}
        {/* PILLAR 1: BUKU KIA BALITA                                             */}
        {/* --------------------------------------------------------------------- */}
        {activePillar === 'balita' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Baby size={18} className="text-teal-600" />
                  <span>Buku KIA Balita ({targetBalita.length} Anak Terdaftar di Wilayah Tugas)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Data otomatis terhubung dengan hasil input KK oleh RT & Kelurahan. Bebas ketik manual.
                </p>
              </div>

              {/* Sub-Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setBalitaFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    balitaFilter === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua ({targetBalita.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBalitaFilter('unweighed')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    balitaFilter === 'unweighed' ? 'bg-amber-500 text-amber-950 shadow-xs' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                  }`}
                >
                  Belum Ditimbang ({targetBalita.filter(b => b.sudah_ditimbang_bulan_ini === 0).length})
                </button>
                <button
                  type="button"
                  onClick={() => setBalitaFilter('at_risk')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    balitaFilter === 'at_risk' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  Perhatian Gizi ({kpiMetrics.balitaGiziKurang})
                </button>
              </div>
            </div>

            {displayedBalita.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <Baby size={36} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Tidak ada balita yang sesuai filter.</p>
                <p className="text-xs text-slate-400">Pencatatan penimbangan balita akan langsung memperbarui kartu.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedBalita.map((b) => (
                  <KartuKIADigital
                    key={b.nik_anak}
                    data={{
                      nik_anak: b.nik_anak,
                      no_kk: b.no_kk,
                      nama_anak: b.nama_anak,
                      jenis_kelamin_anak: b.jenis_kelamin_anak,
                      tanggal_lahir_anak: b.tanggal_lahir_anak,
                      tempat_lahir: b.tempat_lahir,
                      rt: b.rt,
                      rw: b.rw,
                      nama_ibu: b.nama_ibu,
                      nama_ayah: b.nama_ayah,
                      nama_posyandu: kaderProfile?.nama_posyandu || 'Posyandu Melati RW 001',
                      umur_bulan: b.umur_bulan,
                      latest_checkup: {
                        tanggal: b.last_tanggal_pemeriksaan,
                        umur_bulan: b.umur_bulan,
                        berat_badan_kg: b.last_berat_badan,
                        tinggi_badan_cm: b.last_tinggi_badan,
                        lingkar_kepala_cm: b.last_lingkar_kepala,
                        status_gizi: b.last_status_gizi || 'Normal'
                      },
                      growth_trend: {
                        tren_bb: b.last_status_gizi === 'Gizi Kurang' ? 'turun' : 'naik',
                        delta_bb: b.last_status_gizi === 'Gizi Kurang' ? -0.2 : 0.4,
                        label: b.last_status_gizi === 'Gizi Kurang' ? 'Berat Badan Cenderung Turun (-0.2 kg)' : 'Berat Badan Naik (+0.4 kg)',
                        status_pertumbuhan: b.last_status_gizi === 'Gizi Kurang' ? 'Perlu Perhatian Gizi' : 'Pertumbuhan Baik'
                      },
                      history: [
                        {
                          id: 1,
                          tanggal_pemeriksaan: b.last_tanggal_pemeriksaan || '2026-08-18',
                          umur_bulan: b.umur_bulan,
                          berat_badan_kg: b.last_berat_badan || 12.0,
                          tinggi_badan_cm: b.last_tinggi_badan || 88.0,
                          lingkar_kepala_cm: b.last_lingkar_kepala || 48.0,
                          status_gizi: b.last_status_gizi || 'Normal',
                          imunisasi: 'Campak / Booster',
                          catatan_kesehatan: 'Tumbuh kembang aktif dan normal.'
                        }
                      ]
                    }}
                    onCatatBaru={() => {
                      setSelectedBalita(b);
                      setFormError('');
                      setShowBalitaModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* PILLAR 2: IBU HAMIL & 1000 HPK                                        */}
        {/* --------------------------------------------------------------------- */}
        {activePillar === 'bumil' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Heart size={18} className="text-pink-600" />
                  <span>Pemantauan Ibu Hamil & 1000 HPK ({targetBumil.length} Ibu Hamil)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pemantauan Lingkar Lengan Atas (LILA), risiko Kurang Energi Kronis (KEK), dan kepatuhan konsumsi TTD.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBumil(null);
                    setBumilSearchQuery('');
                    setFormError('');
                    setShowBumilModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>+ Catat Bumil</span>
                </button>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setBumilFilter('all')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      bumilFilter === 'all' ? 'bg-pink-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Semua ({targetBumil.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBumilFilter('kek')}
                    className={`px-2.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      bumilFilter === 'kek' ? 'bg-amber-500 text-amber-950' : 'bg-amber-50 text-amber-900'
                    }`}
                  >
                    Risiko KEK ({kpiMetrics.bumilKek})
                  </button>
                </div>
              </div>
            </div>

            {displayedBumil.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <Heart size={36} className="mx-auto text-pink-300" />
                <p className="text-sm font-bold text-slate-700">Belum ada data ibu hamil yang terdaftar.</p>
                <p className="text-xs text-slate-400">Klik "+ Sasaran Baru" di atas untuk mendaftarkan ibu hamil baru di wilayah tugas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedBumil.map((bumil) => {
                  const isKek = bumil.status_kek === 'Risiko KEK' || (bumil.lila_cm && bumil.lila_cm < 23.5);
                  return (
                    <div
                      key={bumil.nik}
                      className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between hover:border-pink-300 transition-all space-y-3"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-extrabold text-slate-900">{bumil.nama}</span>
                              <span className="text-xs text-slate-500 font-mono">({bumil.usia || 28} thn)</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Suami: {bumil.nama_suami || '-'} · RT {bumil.rt}/RW {bumil.rw}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              isKek ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isKek ? 'Risiko KEK' : 'Status Gizi Baik'}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                          <div className="p-2 rounded-xl bg-pink-50/60 border border-pink-100">
                            <span className="text-[10px] font-bold text-pink-800 block">Usia Kehamilan</span>
                            <span className="text-xs font-black text-slate-800 font-mono">
                              {bumil.usia_kehamilan_minggu || 12} Minggu
                            </span>
                          </div>
                          <div className={`p-2 rounded-xl border ${isKek ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
                            <span className={`text-[10px] font-bold block ${isKek ? 'text-rose-700' : 'text-slate-600'}`}>LILA Terakhir</span>
                            <span className={`text-xs font-black font-mono ${isKek ? 'text-rose-800' : 'text-slate-800'}`}>
                              {bumil.lila_cm ? `${bumil.lila_cm} cm` : '-'}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100">
                            <span className="text-[10px] font-bold text-purple-800 block">Konsumsi TTD</span>
                            <span className="text-xs font-black text-slate-800 font-mono">
                              {bumil.jumlah_konsumsi_ttd || 30}/90 Tab
                            </span>
                          </div>
                        </div>

                        {bumil.hpl && (
                          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 font-mono">
                            <span>Taksiran Lahir (HPL):</span>
                            <strong className="text-slate-800">{bumil.hpl}</strong>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">
                          {bumil.last_tanggal_pemeriksaan ? `Diperiksa ${bumil.last_tanggal_pemeriksaan}` : 'Belum diperiksa bulan ini'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBumil(bumil);
                            setFormError('');
                            setShowBumilModal(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-800 font-extrabold text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Catat Pemeriksaan</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* PILLAR 3: SKRINING LANSIA & PTM                                       */}
        {/* --------------------------------------------------------------------- */}
        {activePillar === 'lansia' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <HeartPulse size={18} className="text-emerald-700" />
                  <span>Kartu Lansia & Skrining PTM ({targetLansia.length} Warga Senior)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pemantauan rutin tekanan darah, gula darah sewaktu (GDS), asam urat, dan tingkat kemandirian ADL.
                </p>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setLansiaFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    lansiaFilter === 'all' ? 'bg-emerald-700 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua ({targetLansia.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLansiaFilter('unexamined')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    lansiaFilter === 'unexamined' ? 'bg-amber-500 text-amber-950 shadow-xs' : 'bg-amber-50 text-amber-900'
                  }`}
                >
                  Belum Diperiksa ({targetLansia.filter(l => l.sudah_diperiksa_bulan_ini === 0).length})
                </button>
                <button
                  type="button"
                  onClick={() => setLansiaFilter('at_risk')}
                  className={`px-3 py-1.5 rounded-xl font-extrabold transition-all cursor-pointer ${
                    lansiaFilter === 'at_risk' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 text-rose-900'
                  }`}
                >
                  Hipertensi / Risiko ({kpiMetrics.lansiaRisiko})
                </button>
              </div>
            </div>

            {displayedLansia.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
                <HeartPulse size={36} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">Tidak ada data lansia yang sesuai filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedLansia.map((l) => (
                  <KartuLansiaDigital
                    key={l.nik}
                    data={{
                      nik: l.nik,
                      nama: l.nama,
                      usia: l.usia,
                      jenis_kelamin: l.jenis_kelamin,
                      rt: l.rt,
                      rw: l.rw,
                      alamat: l.alamat,
                      status_tinggal: l.status_tinggal,
                      riwayat_penyakit: l.riwayat_penyakit,
                      last_tanggal_pemeriksaan: l.last_tanggal_pemeriksaan,
                      last_tensi_sistolik: l.last_tensi_sistolik,
                      last_tensi_diastolik: l.last_tensi_diastolik,
                      last_gds: l.last_gds,
                      last_adl: l.last_adl || 'Mandiri',
                      posyandu_lansia_id: l.posyandu_lansia_id,
                      history: [
                        {
                          id: 1,
                          tanggal_pemeriksaan: l.last_tanggal_pemeriksaan || '2026-08-19',
                          tensi_sistolik: l.last_tensi_sistolik || 130,
                          tensi_diastolik: l.last_tensi_diastolik || 85,
                          gula_darah_sewaktu: l.last_gds || 120,
                          berat_badan_kg: l.last_berat_badan || 55,
                          tinggi_badan_cm: l.last_tinggi_badan || 158,
                          keluhan: l.riwayat_penyakit || 'Pemeriksaan rutin berkala'
                        }
                      ]
                    }}
                    onCatatPemeriksaan={() => {
                      setSelectedLansia(l);
                      setFormError('');
                      setShowLansiaModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* PILLAR 4: DISTRIBUSI PMT & SUPLEMENTASI                               */}
        {/* --------------------------------------------------------------------- */}
        {activePillar === 'pmt' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Scale size={18} className="text-amber-600" />
                  <span>Log Distribusi PMT & Suplementasi Kesehatan</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan penyerahan paket PMT Pemulihan, Vitamin A Kemenkes, dan Obat Cacing Albendazole.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFormError('');
                  setModalSuccessMsg('');
                  setShowPmtModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus size={15} />
                <span>+ Catat Distribusi PMT</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 overflow-x-auto shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Kategori Sasaran</th>
                    <th className="py-2.5 px-3">Nama Penerima</th>
                    <th className="py-2.5 px-3">Wilayah</th>
                    <th className="py-2.5 px-3">Jenis Bantuan</th>
                    <th className="py-2.5 px-3">Jumlah</th>
                    <th className="py-2.5 px-3">Petugas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {pmtList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{item.tanggal_distribusi}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          item.target_kategori.includes('BALITA') ? 'bg-teal-50 text-teal-800' : 'bg-pink-50 text-pink-800'
                        }`}>
                          {item.target_kategori}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.nama_penerima}</td>
                      <td className="py-2.5 px-3 text-slate-600">RT {item.rt}/RW {item.rw}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{item.jenis_bantuan}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{item.jumlah_paket} paket</td>
                      <td className="py-2.5 px-3 text-slate-500">{item.petugas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------------------- */}
        {/* PILLAR 5: ANTREAN OFFLINE & SINKRONISASI                              */}
        {/* --------------------------------------------------------------------- */}
        {activePillar === 'offline' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Antrean Offline Lapangan (IndexedDB)</h3>
                  <p className="text-xs text-slate-500">
                    Pencatatan tetap aman dan tersimpan di memori perangkat meskipun berada di lokasi tanpa sinyal internet.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await offlineQueue.flush(api);
                    setActionSuccessToast('Sinkronisasi offline selesai!');
                    setTimeout(() => setActionSuccessToast(''), 3000);
                    await loadDashboardData();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                <span>Sinkronkan Sekarang</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Menunggu Sinkronisasi</span>
                <p className="text-lg font-mono tabular-nums font-extrabold text-slate-900">{offlinePendingCount} data</p>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-700 block">Status Koneksi Lapangan</span>
                <p className="text-sm font-extrabold text-emerald-900 mt-0.5">
                  {typeof navigator !== 'undefined' && navigator.onLine ? '🟢 Online (Terhubung Server)' : '🔴 Offline (Tanpa Sinyal)'}
                </p>
              </div>
              <div className="p-3.5 bg-sky-50 rounded-2xl border border-sky-200">
                <span className="text-xs text-sky-700 block">Kapasitas Cache Browser</span>
                <p className="text-sm font-extrabold text-sky-900 mt-0.5">IndexedDB Siap</p>
              </div>
            </div>

            {offlineQueueItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Daftar Antrean Data Menunggu:</h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {offlineQueueItems.map((item, idx) => (
                    <div key={item.id || idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{item.title || item.label || item.type}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{item.endpoint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 6. THUMB-ZONE FLOATING ACTIONS (MOBILE-FIRST)                             */}
      {/* ========================================================================= */}
      <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center gap-2 pointer-events-auto">
          {/* Quick Catat Balita */}
          <button
            type="button"
            onClick={() => {
              setSelectedBalita(null);
              setBalitaSearchQuery('');
              setFormError('');
              setShowBalitaModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-xs shadow-lg border border-teal-500 transition-all cursor-pointer"
          >
            <Baby size={16} />
            <span>+ Timbang Balita</span>
          </button>

          {/* Quick Catat Bumil */}
          <button
            type="button"
            onClick={() => {
              setSelectedBumil(null);
              setBumilSearchQuery('');
              setFormError('');
              setShowBumilModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-2xl bg-pink-600 hover:bg-pink-700 active:scale-95 text-white font-extrabold text-xs shadow-lg border border-pink-500 transition-all cursor-pointer"
          >
            <Heart size={16} />
            <span>+ Catat Bumil</span>
          </button>

          {/* Quick Catat Lansia */}
          <button
            type="button"
            onClick={() => {
              setSelectedLansia(null);
              setLansiaSearchQuery('');
              setFormError('');
              setShowLansiaModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-3.5 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-xs shadow-lg border border-emerald-600 transition-all cursor-pointer"
          >
            <HeartPulse size={16} />
            <span>+ Catat Lansia</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FORM PENCATATAN BALITA                                           */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBalitaModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-teal-600 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Baby size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Pencatatan Balita (KIA Digital)</h3>
                    <p className="text-[11px] text-teal-100">Bebas ketik NIK manual · Terintegrasi Master Warga</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBalitaModal(false)}
                  className="p-1.5 rounded-lg text-teal-100 hover:bg-white/10 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-24 sm:pb-6">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}
                {modalSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{modalSuccessMsg}</span>
                  </div>
                )}

                {!selectedBalita ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Cari Balita di Wilayah Tugas <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Ketik nama anak, nama ibu, atau RT..."
                          value={balitaSearchQuery}
                          onChange={(e) => setBalitaSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {balitaCandidates.map((b) => (
                        <div
                          key={b.nik_anak}
                          onClick={() => setSelectedBalita(b)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{b.nama_anak}</p>
                            <p className="text-[11px] text-slate-500">
                              {b.umur_bulan} Bln ({b.jenis_kelamin_anak === 'L' ? 'Laki-laki' : 'Perempuan'}) · Ibu: {b.nama_ibu || '-'} · RT {b.rt}
                            </p>
                          </div>
                          <span className="text-xs text-teal-700 font-bold">Pilih</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveBalita} className="space-y-3.5">
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-teal-800 uppercase block">Sasaran Terpilih</span>
                        <p className="text-xs font-extrabold text-teal-950">{selectedBalita.nama_anak} ({selectedBalita.umur_bulan} Bulan)</p>
                        <p className="text-[11px] text-teal-800">Ibu: {selectedBalita.nama_ibu} · RT {selectedBalita.rt}/RW {selectedBalita.rw}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBalita(null)}
                        className="text-xs text-teal-700 font-bold hover:underline cursor-pointer"
                      >
                        Ganti
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Berat Badan (kg) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          required
                          placeholder="Contoh: 12.4"
                          value={balitaForm.berat_badan_kg}
                          onChange={(e) => setBalitaForm({ ...balitaForm, berat_badan_kg: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                        <span className="text-[10px] text-slate-400">Rentang aman: 1.0 - 35.0 kg</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tinggi Badan (cm) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="Contoh: 88.5"
                          value={balitaForm.tinggi_badan_cm}
                          onChange={(e) => setBalitaForm({ ...balitaForm, tinggi_badan_cm: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                        <span className="text-[10px] text-slate-400">Rentang: 35 - 130 cm</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Lingkar Kepala (cm)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Contoh: 48.0"
                          value={balitaForm.lingkar_kepala_cm}
                          onChange={(e) => setBalitaForm({ ...balitaForm, lingkar_kepala_cm: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Status Gizi (KMS)</label>
                        <select
                          value={balitaForm.status_gizi}
                          onChange={(e) => setBalitaForm({ ...balitaForm, status_gizi: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                        >
                          <option value="Auto">Auto (Kalkulasi WHO)</option>
                          <option value="Gizi Baik (Normal)">Gizi Baik (Normal)</option>
                          <option value="Gizi Kurang">Gizi Kurang</option>
                          <option value="Gizi Buruk">Gizi Buruk</option>
                          <option value="Risiko Lebih">Risiko Lebih</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Imunisasi / Suplementasi Bulan Ini</label>
                      <input
                        type="text"
                        placeholder="Contoh: DPT-HB-Hib 3, Polio 4, Vitamin A Kapsul Biru"
                        value={balitaForm.imunisasi}
                        onChange={(e) => setBalitaForm({ ...balitaForm, imunisasi: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tumbuh Kembang</label>
                      <textarea
                        rows={2}
                        placeholder="Nafsu makan baik, motorik aktif..."
                        value={balitaForm.catatan_kesehatan}
                        onChange={(e) => setBalitaForm({ ...balitaForm, catatan_kesehatan: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingRecord}
                      className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {savingRecord && <RefreshCw size={14} className="animate-spin" />}
                      <span>Simpan Hasil Timbang (KMS Digital)</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: FORM PENCATATAN IBU HAMIL & 1000 HPK                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBumilModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-pink-600 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Heart size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Pemeriksaan Ibu Hamil (1000 HPK)</h3>
                    <p className="text-[11px] text-pink-100">Pemantauan LILA, KEK, dan Suplementasi Tablet Tambah Darah</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBumilModal(false)}
                  className="p-1.5 rounded-lg text-pink-100 hover:bg-white/10 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-24 sm:pb-6">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}
                {modalSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{modalSuccessMsg}</span>
                  </div>
                )}

                {!selectedBumil ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Cari Ibu Hamil di Wilayah Tugas <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Ketik nama ibu, suami, atau RT..."
                          value={bumilSearchQuery}
                          onChange={(e) => setBumilSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {bumilCandidates.map((b) => (
                        <div
                          key={b.nik}
                          onClick={() => {
                            setSelectedBumil(b);
                            setBumilForm({
                              ...bumilForm,
                              usia_kehamilan_minggu: b.usia_kehamilan_minggu || 12,
                              lila_cm: b.lila_cm || '24.0'
                            });
                          }}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-pink-500 hover:bg-pink-50/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{b.nama}</p>
                            <p className="text-[11px] text-slate-500">
                              Usia Hamil: {b.usia_kehamilan_minggu || 12} Minggu · Suami: {b.nama_suami || '-'} · RT {b.rt}
                            </p>
                          </div>
                          <span className="text-xs text-pink-700 font-bold">Pilih</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveBumil} className="space-y-3.5">
                    <div className="p-3 bg-pink-50 rounded-xl border border-pink-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-pink-800 uppercase block">Ibu Hamil Terpilih</span>
                        <p className="text-xs font-extrabold text-pink-950">{selectedBumil.nama}</p>
                        <p className="text-[11px] text-pink-800">RT {selectedBumil.rt}/RW {selectedBumil.rw} · Suami: {selectedBumil.nama_suami}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBumil(null)}
                        className="text-xs text-pink-700 font-bold hover:underline cursor-pointer"
                      >
                        Ganti
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Usia Kehamilan (Minggu) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          placeholder="Contoh: 24"
                          value={bumilForm.usia_kehamilan_minggu}
                          onChange={(e) => setBumilForm({ ...bumilForm, usia_kehamilan_minggu: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Berat Badan (kg) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="Contoh: 54.5"
                          value={bumilForm.berat_badan_kg}
                          onChange={(e) => setBumilForm({ ...bumilForm, berat_badan_kg: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Lingkar Lengan Atas / LILA (cm) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="Contoh: 23.0"
                          value={bumilForm.lila_cm}
                          onChange={(e) => setBumilForm({ ...bumilForm, lila_cm: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                        <span className="text-[10px] text-slate-400">&lt; 23.5 cm = Risiko KEK</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tablet Tambah Darah (TTD)</label>
                        <input
                          type="number"
                          placeholder="Contoh: 30"
                          value={bumilForm.ttd_diberikan}
                          onChange={(e) => setBumilForm({ ...bumilForm, ttd_diberikan: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                        <span className="text-[10px] text-slate-400">Target minimal 90 tablet</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tensi Darah (mmHg)</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            placeholder="Sis"
                            value={bumilForm.tensi_sistolik}
                            onChange={(e) => setBumilForm({ ...bumilForm, tensi_sistolik: e.target.value })}
                            className="w-full px-2 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center font-mono"
                          />
                          <span>/</span>
                          <input
                            type="number"
                            placeholder="Dia"
                            value={bumilForm.tensi_diastolik}
                            onChange={(e) => setBumilForm({ ...bumilForm, tensi_diastolik: e.target.value })}
                            className="w-full px-2 py-2 rounded-xl border border-slate-300 text-xs font-bold text-center font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kadar Hemoglobin (Hb g/dL)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Contoh: 11.5"
                          value={bumilForm.hb_g_dl}
                          onChange={(e) => setBumilForm({ ...bumilForm, hb_g_dl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Keluhan / Catatan Bidan Kader</label>
                      <textarea
                        rows={2}
                        placeholder="Keluhan pusing, mual, gerak janin aktif..."
                        value={bumilForm.keluhan}
                        onChange={(e) => setBumilForm({ ...bumilForm, keluhan: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingRecord}
                      className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {savingRecord && <RefreshCw size={14} className="animate-spin" />}
                      <span>Simpan Pemeriksaan Bumil (1000 HPK)</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: FORM SKRINING LANSIA                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showLansiaModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-700 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <HeartPulse size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Skrining Kesehatan Lansia (PTM)</h3>
                    <p className="text-[11px] text-emerald-100">Tekanan darah, Gula Darah, dan Indeks Kemandirian ADL</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLansiaModal(false)}
                  className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-24 sm:pb-6">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-xl text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}
                {modalSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{modalSuccessMsg}</span>
                  </div>
                )}

                {!selectedLansia ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Cari Lansia di Wilayah Tugas <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Ketik nama lansia, NIK, atau RT..."
                          value={lansiaSearchQuery}
                          onChange={(e) => setLansiaSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                      {lansiaCandidates.map((l) => (
                        <div
                          key={l.nik}
                          onClick={() => setSelectedLansia(l)}
                          className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between"
                        >
                          <div>
                            <p className="text-xs font-bold text-slate-900">{l.nama}</p>
                            <p className="text-[11px] text-slate-500">
                              {l.usia} Tahun · {l.status_tinggal} · RT {l.rt}
                            </p>
                          </div>
                          <span className="text-xs text-emerald-700 font-bold">Pilih</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSaveLansia} className="space-y-3.5">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Lansia Terpilih</span>
                        <p className="text-xs font-extrabold text-emerald-950">{selectedLansia.nama} ({selectedLansia.usia} Tahun)</p>
                        <p className="text-[11px] text-emerald-800">Status: {selectedLansia.status_tinggal} · RT {selectedLansia.rt}/RW {selectedLansia.rw}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLansia(null)}
                        className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                      >
                        Ganti
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tensi Darah (Sistolik / Diastolik) <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            required
                            placeholder="130"
                            value={lansiaForm.tensi_sistolik}
                            onChange={(e) => setLansiaForm({ ...lansiaForm, tensi_sistolik: e.target.value })}
                            className="w-full px-2 py-2 rounded-xl border border-slate-300 text-sm font-bold text-center font-mono"
                          />
                          <span>/</span>
                          <input
                            type="number"
                            required
                            placeholder="85"
                            value={lansiaForm.tensi_diastolik}
                            onChange={(e) => setLansiaForm({ ...lansiaForm, tensi_diastolik: e.target.value })}
                            className="w-full px-2 py-2 rounded-xl border border-slate-300 text-sm font-bold text-center font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Gula Darah Sewaktu (mg/dL)</label>
                        <input
                          type="number"
                          placeholder="Contoh: 110"
                          value={lansiaForm.gula_darah_sewaktu}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, gula_darah_sewaktu: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Berat Badan (kg)</label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          placeholder="55.0"
                          value={lansiaForm.berat_badan_kg}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, berat_badan_kg: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tinggi Badan (cm)</label>
                        <input
                          type="number"
                          step="0.5"
                          required
                          placeholder="158.0"
                          value={lansiaForm.tinggi_badan_cm}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, tinggi_badan_cm: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kemandirian (ADL)</label>
                        <select
                          value={lansiaForm.skor_kemandirian_adl}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, skor_kemandirian_adl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800"
                        >
                          <option value="Mandiri">Mandiri Penuh</option>
                          <option value="Ketergantungan Ringan">Ketergantungan Ringan</option>
                          <option value="Ketergantungan Sedang">Ketergantungan Sedang</option>
                          <option value="Ketergantungan Berat">Ketergantungan Berat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kolesterol (mg/dL)</label>
                        <input
                          type="number"
                          placeholder="Opsional: 190"
                          value={lansiaForm.kolesterol}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, kolesterol: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Keluhan Lansia & Tindakan</label>
                      <textarea
                        rows={2}
                        placeholder="Sering pusing, nyeri sendi..."
                        value={lansiaForm.keluhan}
                        onChange={(e) => setLansiaForm({ ...lansiaForm, keluhan: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingRecord}
                      className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      {savingRecord && <RefreshCw size={14} className="animate-spin" />}
                      <span>Simpan Rekam Medis Lansia</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: CATAT DISTRIBUSI PMT                                             */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPmtModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-extrabold text-slate-900">Catat Penyerahan PMT</h3>
                </div>
                <button type="button" onClick={() => setShowPmtModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-2.5 bg-red-50 text-red-900 rounded-xl text-xs font-semibold">{formError}</div>
              )}
              {modalSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold">{modalSuccessMsg}</div>
              )}

              <form onSubmit={handleSavePmt} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Sasaran</label>
                  <select
                    value={pmtForm.target_kategori}
                    onChange={(e) => setPmtForm({ ...pmtForm, target_kategori: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                  >
                    <option value="BALITA_GIZI_KURANG">Balita Gizi Kurang / Stunting</option>
                    <option value="IBU_HAMIL_KEK">Ibu Hamil Risiko KEK (1000 HPK)</option>
                    <option value="BALITA">Balita Umum (Vitamin A & Cacing)</option>
                    <option value="LANSIA">Lansia Kurang Energi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Penerima <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nama anak atau ibu hamil..."
                    value={pmtForm.nama_penerima}
                    onChange={(e) => setPmtForm({ ...pmtForm, nama_penerima: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Wilayah RT</label>
                    <input
                      type="text"
                      value={pmtForm.rt}
                      onChange={(e) => setPmtForm({ ...pmtForm, rt: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Wilayah RW</label>
                    <input
                      type="text"
                      value={pmtForm.rw}
                      onChange={(e) => setPmtForm({ ...pmtForm, rw: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Bantuan PMT / Suplemen</label>
                  <select
                    value={pmtForm.jenis_bantuan}
                    onChange={(e) => setPmtForm({ ...pmtForm, jenis_bantuan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  >
                    <option value="Biskuit Balita Kemenkes & Susu">Biskuit Balita Kemenkes & Susu</option>
                    <option value="Susu Ibu Hamil & Tablet Tambah Darah">Susu Ibu Hamil & Tablet Tambah Darah (TTD)</option>
                    <option value="Telur & Kacang Hijau Swadaya">Telur & Kacang Hijau Swadaya RW</option>
                    <option value="Vitamin A Kapsul Biru (100.000 IU)">Vitamin A Kapsul Biru (100.000 IU)</option>
                    <option value="Vitamin A Kapsul Merah (200.000 IU)">Vitamin A Kapsul Merah (200.000 IU)</option>
                    <option value="Obat Cacing Albendazole 400mg">Obat Cacing Albendazole 400mg</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
                  <input
                    type="text"
                    placeholder="Tahap 1 pemulihan..."
                    value={pmtForm.catatan}
                    onChange={(e) => setPmtForm({ ...pmtForm, catatan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingRecord}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  Simpan Bukti Distribusi PMT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: DAFTARKAN SASARAN BARU (BALITA / BUMIL / LANSIA)                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDaftarSasaranModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-teal-700" />
                  <h3 className="text-sm font-extrabold text-slate-900">Pendaftaran Sasaran Baru</h3>
                </div>
                <button type="button" onClick={() => setShowDaftarSasaranModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-2.5 bg-red-50 text-red-900 rounded-xl text-xs font-semibold">{formError}</div>
              )}
              {modalSuccessMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold">{modalSuccessMsg}</div>
              )}

              <form onSubmit={handleSaveSasaranBaru} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Sasaran</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDaftarSasaranForm({ ...daftarSasaranForm, tipe: 'balita' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        daftarSasaranForm.tipe === 'balita' ? 'bg-teal-600 text-white border-teal-700' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      Bayi / Balita
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaftarSasaranForm({ ...daftarSasaranForm, tipe: 'bumil' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        daftarSasaranForm.tipe === 'bumil' ? 'bg-pink-600 text-white border-pink-700' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      Ibu Hamil
                    </button>
                    <button
                      type="button"
                      onClick={() => setDaftarSasaranForm({ ...daftarSasaranForm, tipe: 'lansia' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        daftarSasaranForm.tipe === 'lansia' ? 'bg-emerald-700 text-white border-emerald-800' : 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      Lansia
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap..."
                    value={daftarSasaranForm.nama}
                    onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, nama: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={daftarSasaranForm.tanggal_lahir}
                      onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, tanggal_lahir: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      value={daftarSasaranForm.jenis_kelamin}
                      onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, jenis_kelamin: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                {daftarSasaranForm.tipe === 'balita' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ibu</label>
                      <input
                        type="text"
                        placeholder="Nama ibu..."
                        value={daftarSasaranForm.nama_ibu}
                        onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, nama_ibu: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ayah</label>
                      <input
                        type="text"
                        placeholder="Nama ayah..."
                        value={daftarSasaranForm.nama_ayah}
                        onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, nama_ayah: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                )}

                {daftarSasaranForm.tipe === 'bumil' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nama Suami</label>
                      <input
                        type="text"
                        placeholder="Nama suami..."
                        value={daftarSasaranForm.nama_suami}
                        onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, nama_suami: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. WhatsApp</label>
                      <input
                        type="text"
                        placeholder="0812..."
                        value={daftarSasaranForm.no_kontak}
                        onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, no_kontak: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">RT</label>
                    <input
                      type="text"
                      value={daftarSasaranForm.rt}
                      onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, rt: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">RW</label>
                    <input
                      type="text"
                      value={daftarSasaranForm.rw}
                      onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, rw: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
                  <input
                    type="text"
                    value={daftarSasaranForm.alamat}
                    onChange={(e) => setDaftarSasaranForm({ ...daftarSasaranForm, alamat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingSasaran}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {submittingSasaran && <RefreshCw size={14} className="animate-spin" />}
                  <span>Daftarkan Sasaran Baru</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 6: 1-CLICK WHATSAPP BROADCAST UNDANGAN POSYANDU                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showWhatsAppModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Share2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">Broadcast Undangan WhatsApp</h3>
                    <p className="text-[11px] text-slate-500">Kirim jadwal penimbangan & pemeriksaan ke grup RT</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowWhatsAppModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hari & Tanggal</label>
                    <input
                      type="text"
                      value={waBroadcastForm.hari_tanggal}
                      onChange={(e) => setWaBroadcastForm({ ...waBroadcastForm, hari_tanggal: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Waktu Pelaksanaan</label>
                    <input
                      type="text"
                      value={waBroadcastForm.jam}
                      onChange={(e) => setWaBroadcastForm({ ...waBroadcastForm, jam: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tempat / Lokasi</label>
                  <input
                    type="text"
                    value={waBroadcastForm.tempat}
                    onChange={(e) => setWaBroadcastForm({ ...waBroadcastForm, tempat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Wilayah RT</label>
                    <input
                      type="text"
                      value={waBroadcastForm.target_rt}
                      onChange={(e) => setWaBroadcastForm({ ...waBroadcastForm, target_rt: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Tambahan</label>
                    <input
                      type="text"
                      value={waBroadcastForm.catatan_khusus}
                      onChange={(e) => setWaBroadcastForm({ ...waBroadcastForm, catatan_khusus: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* Preview Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pratinjau Pesan WhatsApp:</label>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-mono whitespace-pre-line text-slate-800 max-h-40 overflow-y-auto">
                    {generateWhatsAppMessage()}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyWhatsApp}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Copy size={14} />
                    <span>Salin Teks</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Share2 size={14} />
                    <span>Buka WhatsApp</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
