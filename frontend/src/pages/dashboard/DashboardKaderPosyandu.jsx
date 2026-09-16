/**
 * frontend/src/pages/dashboard/DashboardKaderPosyandu.jsx
 * Model Baru Kader Posyandu — Digital KIA & Actionable Cadre Dashboard
 * Sesuai praktik lapangan: Cari Warga di Wilayah Tugas (Bebas NIK manual), Kartu KIA Digital,
 * Actionable ActionCenter, KPIGrid, Thumb Zone, dan 100% Offline-First (IndexedDB).
 * Bumi Warga - Jabar Pintar Digital
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { offlineQueue } from '../../utils/offlineQueue';
import { cacheData, getCachedData } from '../../utils/offlineStorage';
import {
  DashboardShell,
  RoleHeader,
  AIBriefCard,
  KPIGrid,
  KPICard,
  ActionCenter,
  StatusBadge,
  OfflineSyncBanner,
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
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardKaderPosyandu() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State Data & Profil Kader
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiBrief, setAiBrief] = useState(null);
  const [loadingBrief, setLoadingBrief] = useState(true);
  const [kaderProfile, setKaderProfile] = useState(null);

  // Target Warga Lists (Scoped by Wilayah Tugas)
  const [targetBalita, setTargetBalita] = useState([]);
  const [targetLansia, setTargetLansia] = useState([]);
  const [offlinePendingCount, setOfflinePendingCount] = useState(0);

  // Active View Tab on Dashboard
  const [activeTab, setActiveTab] = useState('balita'); // 'balita' | 'lansia'
  const [balitaFilter, setBalitaFilter] = useState('all'); // 'all' | 'unweighed' | 'at_risk'
  const [lansiaFilter, setLansiaFilter] = useState('all'); // 'all' | 'unexamined' | 'at_risk'

  // Modals State
  const [showBalitaModal, setShowBalitaModal] = useState(false);
  const [showLansiaModal, setShowLansiaModal] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [modalSuccessMsg, setModalSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  // Selected Warga State for Measurement Form
  const [selectedBalita, setSelectedBalita] = useState(null);
  const [balitaSearchQuery, setBalitaSearchQuery] = useState('');
  const [selectedLansia, setSelectedLansia] = useState(null);
  const [lansiaSearchQuery, setLansiaSearchQuery] = useState('');

  // Form State: Antropometri Balita (Kader hanya input hasil timbang)
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

      // 3. Fetch Target Citizens (Scoped RT/RW) & Offline Sync Count
      const [bTargetRes, lTargetRes] = await Promise.allSettled([
        api.get('/posyandu/warga-target?category=balita'),
        api.get('/posyandu/warga-target?category=lansia')
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

      // 4. Check offline queue count
      const count = await offlineQueue.getPendingCount();
      setOfflinePendingCount(count);

    } catch (e) {
      console.warn('[KaderDashboard] Network fetch failed, loading offline cache:', e.message);
      // Load offline cached data
      const cachedProfile = await getCachedData('bw_kader_profile');
      if (cachedProfile) setKaderProfile(cachedProfile);

      const cachedBalita = await getCachedData('bw_kader_target_balita');
      if (cachedBalita) setTargetBalita(cachedBalita);

      const cachedLansia = await getCachedData('bw_kader_target_lansia');
      if (cachedLansia) setTargetLansia(cachedLansia);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Listen to queue changes
    const updateQueue = async () => {
      const count = await offlineQueue.getPendingCount();
      setOfflinePendingCount(count);
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
    return `${kaderProfile.nama_posyandu || 'Posyandu Melati'} · Wilayah: ${rts} / RW ${rw}`;
  }, [kaderProfile, user]);

  // Kalkulasi KPI Posyandu
  const kpiMetrics = useMemo(() => {
    const totalBalita = targetBalita.length;
    const sudahTimbang = targetBalita.filter((b) => b.sudah_ditimbang_bulan_ini === 1).length;
    const persenTimbang = totalBalita > 0 ? Math.round((sudahTimbang / totalBalita) * 100) : 0;

    const totalLansia = targetLansia.length;
    const lansiaRisiko = targetLansia.filter((l) => 
      (l.last_tensi_sistolik && l.last_tensi_sistolik >= 140) || 
      l.status_tinggal === 'Sebatang Kara' ||
      (l.last_gds && l.last_gds >= 200)
    ).length;

    return {
      totalBalita,
      sudahTimbang,
      persenTimbang,
      totalLansia,
      lansiaRisiko
    };
  }, [targetBalita, targetLansia]);

  // Action Center Items
  const actionItems = useMemo(() => {
    const list = [];

    // 1. Alert Offline Queue
    if (offlinePendingCount > 0) {
      list.push({
        id: 'act-offline-queue',
        title: `${offlinePendingCount} Data Pemeriksaan Tersimpan Offline`,
        description: 'Perubahan dicatat saat offline. Klik untuk sinkronkan segera ke server kelurahan.',
        severity: 'medium',
        icon: 'Database',
        primaryAction: {
          label: 'Sinkronkan Sekarang',
          onClick: async () => {
            const res = await offlineQueue.flush(api);
            loadDashboardData();
          }
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
        primaryAction: {
          label: `Timbang ${sample.nama_anak}`,
          onClick: () => {
            setSelectedBalita(sample);
            setFormError('');
            setShowBalitaModal(true);
          }
        }
      });
    }

    // 3. Balita Perlu Perhatian Gizi
    const atRiskBalita = targetBalita.filter((b) => 
      b.last_status_gizi === 'Gizi Kurang' || 
      b.last_status_gizi === 'Gizi Buruk' || 
      b.last_status_gizi === 'Perlu Perhatian Gizi'
    );
    if (atRiskBalita.length > 0) {
      const b = atRiskBalita[0];
      list.push({
        id: 'act-at-risk-balita',
        title: `Pemantauan Khusus: ${b.nama_anak} (RT ${b.rt})`,
        description: `Status: ${b.last_status_gizi}. Berat terakhir: ${b.last_berat_badan || '-'} kg. Perlu evaluasi PMT pemulihan.`,
        severity: 'high',
        icon: 'AlertTriangle',
        primaryAction: {
          label: 'Catat Timbang Rutin',
          onClick: () => {
            setSelectedBalita(b);
            setFormError('');
            setShowBalitaModal(true);
          }
        }
      });
    }

    // 4. Lansia Risiko Tinggi / Sebatang Kara Belum Diperiksa
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
        primaryAction: {
          label: `Periksa ${l.nama}`,
          onClick: () => {
            setSelectedLansia(l);
            setFormError('');
            setShowLansiaModal(true);
          }
        }
      });
    }

    return list;
  }, [offlinePendingCount, targetBalita, targetLansia]);

  // Filtered Lists for Tabs
  const displayedBalita = useMemo(() => {
    return targetBalita.filter((b) => {
      if (balitaFilter === 'unweighed') return b.sudah_ditimbang_bulan_ini === 0;
      if (balitaFilter === 'at_risk') {
        return b.last_status_gizi === 'Gizi Kurang' || b.last_status_gizi === 'Gizi Buruk' || b.last_status_gizi === 'Perlu Perhatian Gizi';
      }
      return true;
    });
  }, [targetBalita, balitaFilter]);

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
      (b.kepala_keluarga && b.kepala_keluarga.toLowerCase().includes(q)) ||
      b.rt.includes(q)
    );
  }, [targetBalita, balitaSearchQuery]);

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
  // SANITY BOUNDS & SUBMISSION: BALITA
  // ===========================================================================
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
      // 1. Offline-First Check
      if (!navigator.onLine) {
        await offlineQueue.enqueue({
          type: 'POSYANDU_BALITA',
          endpoint: '/api/posyandu/balita',
          method: 'POST',
          payload,
          label: `Penimbangan: ${selectedBalita.nama_anak} (${bb} kg)`
        });

        // Optimistic update state
        setTargetBalita((prev) => prev.map((b) => b.nik_anak === selectedBalita.nik_anak ? {
          ...b,
          last_berat_badan: bb,
          last_tinggi_badan: tb,
          sudah_ditimbang_bulan_ini: 1
        } : b));

        setModalSuccessMsg(`Disimpan secara offline. Data penimbangan ${selectedBalita.nama_anak} akan disinkronkan saat online.`);
        setTimeout(() => {
          setShowBalitaModal(false);
          setSelectedBalita(null);
          setModalSuccessMsg('');
        }, 2500);
        return;
      }

      // 2. Online Post with Fallback
      try {
        await api.post('/posyandu/balita', payload);
        // Optimistic update state
        setTargetBalita((prev) => prev.map((b) => b.nik_anak === selectedBalita.nik_anak ? {
          ...b,
          last_berat_badan: bb,
          last_tinggi_badan: tb,
          sudah_ditimbang_bulan_ini: 1
        } : b));

        setModalSuccessMsg(`Penimbangan ${selectedBalita.nama_anak} berhasil dicatat!`);
        setTimeout(() => {
          setShowBalitaModal(false);
          setSelectedBalita(null);
          setModalSuccessMsg('');
          loadDashboardData();
        }, 2000);
      } catch (postErr) {
        const isNetworkErr = !navigator.onLine || 
          postErr.status === 0 || 
          postErr.status === 503 || 
          postErr.code === 'ERR_NETWORK' || 
          postErr.message?.includes('Network') || 
          postErr.message?.includes('Failed to fetch');

        if (isNetworkErr) {
          await offlineQueue.enqueue({
            type: 'POSYANDU_BALITA',
            endpoint: '/api/posyandu/balita',
            method: 'POST',
            payload,
            label: `Penimbangan: ${selectedBalita.nama_anak} (${bb} kg)`
          });
          setModalSuccessMsg(`Koneksi terputus. Data ${selectedBalita.nama_anak} tersimpan secara offline.`);
          setTimeout(() => {
            setShowBalitaModal(false);
            setSelectedBalita(null);
            setModalSuccessMsg('');
          }, 2500);
        } else {
          throw postErr;
        }
      }
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data penimbangan.');
    } finally {
      setSavingRecord(false);
    }
  };

  // ===========================================================================
  // SUBMISSION: LANSIA
  // ===========================================================================
  const handleSaveLansia = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!selectedLansia) {
      setFormError('Silakan cari dan pilih lansia terlebih dahulu.');
      return;
    }

    const sis = parseInt(lansiaForm.tensi_sistolik, 10);
    const dia = parseInt(lansiaForm.tensi_diastolik, 10);

    if (isNaN(sis) || sis < 60 || sis > 260 || isNaN(dia) || dia < 40 || dia > 160) {
      setFormError('Sanity Bounds: Nilai tensi sistolik/diastolik berada di luar rentang fisiologis wajar.');
      return;
    }

    const payload = {
      posyandu_lansia_id: selectedLansia.posyandu_lansia_id || selectedLansia.id || 1,
      nik: selectedLansia.nik,
      nama: selectedLansia.nama,
      tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
      tensi_sistolik: sis,
      tensi_diastolik: dia,
      gula_darah_sewaktu: lansiaForm.gula_darah_sewaktu ? parseInt(lansiaForm.gula_darah_sewaktu, 10) : null,
      kolesterol: lansiaForm.kolesterol ? parseInt(lansiaForm.kolesterol, 10) : null,
      asam_urat: lansiaForm.asam_urat ? parseFloat(lansiaForm.asam_urat) : null,
      berat_badan_kg: lansiaForm.berat_badan_kg ? parseFloat(lansiaForm.berat_badan_kg) : 50,
      tinggi_badan_cm: lansiaForm.tinggi_badan_cm ? parseFloat(lansiaForm.tinggi_badan_cm) : 155,
      skor_kemandirian_adl: lansiaForm.skor_kemandirian_adl,
      keluhan: lansiaForm.keluhan,
      tindakan_petugas: lansiaForm.tindakan_petugas,
      petugas: user?.nama || 'Kader Posyandu Lansia'
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

        setTargetLansia((prev) => prev.map((l) => l.nik === selectedLansia.nik ? {
          ...l,
          last_tensi_sistolik: sis,
          last_tensi_diastolik: dia,
          sudah_diperiksa_bulan_ini: 1
        } : l));

        setModalSuccessMsg(`Disimpan secara offline. Data pemeriksaan ${selectedLansia.nama} akan disinkronkan saat online.`);
        setTimeout(() => {
          setShowLansiaModal(false);
          setSelectedLansia(null);
          setModalSuccessMsg('');
        }, 2500);
        return;
      }

      try {
        await api.post('/posyandu/lansia/pemeriksaan', payload);
        setTargetLansia((prev) => prev.map((l) => l.nik === selectedLansia.nik ? {
          ...l,
          last_tensi_sistolik: sis,
          last_tensi_diastolik: dia,
          sudah_diperiksa_bulan_ini: 1
        } : l));

        setModalSuccessMsg(`Pemeriksaan lansia ${selectedLansia.nama} berhasil disimpan!`);
        setTimeout(() => {
          setShowLansiaModal(false);
          setSelectedLansia(null);
          setModalSuccessMsg('');
          loadDashboardData();
        }, 2000);
      } catch (postErr) {
        const isNetworkErr = !navigator.onLine || postErr.status === 0 || postErr.status === 503 || postErr.code === 'ERR_NETWORK';
        if (isNetworkErr) {
          await offlineQueue.enqueue({
            type: 'POSYANDU_CHECKUP_LANSIA',
            endpoint: '/api/posyandu/lansia/pemeriksaan',
            method: 'POST',
            payload,
            label: `Pemeriksaan Lansia: ${selectedLansia.nama} (Tensi ${sis}/${dia})`
          });
          setModalSuccessMsg(`Koneksi terputus. Pemeriksaan lansia ${selectedLansia.nama} disimpan secara offline.`);
          setTimeout(() => {
            setShowLansiaModal(false);
            setSelectedLansia(null);
            setModalSuccessMsg('');
          }, 2500);
        } else {
          throw postErr;
        }
      }
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan pemeriksaan lansia.');
    } finally {
      setSavingRecord(false);
    }
  };

  return (
    <DashboardShell
      // 1. Role Header Berdasarkan Profil Kader
      header={
        <RoleHeader
          role="kader_posyandu"
          userName={kaderProfile?.nama_lengkap || user?.nama || 'Kader Posyandu'}
          scopeLabel={wilayahTugasLabel}
          onRefresh={loadDashboardData}
          loading={refreshing}
        />
      }
      // 2. AI Brief Card
      briefCard={
        <AIBriefCard
          brief={aiBrief}
          loading={loadingBrief}
          onRetry={loadDashboardData}
        />
      }
      // 3. Grid KPI (Maksimal 4 Metrik Actionable)
      kpiGrid={
        <KPIGrid columns={4}>
          <KPICard
            label="Balita di Wilayah"
            value={kpiMetrics.totalBalita}
            unit="anak"
            icon={<Baby size={20} />}
            urgency="low"
            onClick={() => setActiveTab('balita')}
          />
          <KPICard
            label="Ditimbang Bulan Ini"
            value={`${kpiMetrics.sudahTimbang} (${kpiMetrics.persenTimbang}%)`}
            unit="balita"
            icon={<UserCheck size={20} />}
            urgency={kpiMetrics.persenTimbang < 50 ? 'high' : 'low'}
            onClick={() => {
              setActiveTab('balita');
              setBalitaFilter('unweighed');
            }}
          />
          <KPICard
            label="Lansia Terpantau"
            value={kpiMetrics.totalLansia}
            unit="jiwa"
            icon={<HeartPulse size={20} />}
            urgency={kpiMetrics.lansiaRisiko > 0 ? 'medium' : 'low'}
            onClick={() => setActiveTab('lansia')}
          />
          <KPICard
            label="Antrean Offline"
            value={offlinePendingCount}
            unit="data"
            icon={<Database size={20} />}
            urgency={offlinePendingCount > 0 ? 'high' : 'low'}
          />
        </KPIGrid>
      }
      // 4. Action Center
      actionCenter={
        <ActionCenter
          title="Tugas & Prioritas Posyandu Lapangan"
          actions={actionItems}
          onRefresh={loadDashboardData}
          isRefreshing={refreshing}
        />
      }
    >
      {/* ========================================================================= */}
      {/* SECTION TABS & REGISTER KARTU DIGITAL                                     */}
      {/* ========================================================================= */}
      <div className="space-y-4 pb-20">
        {/* Tab Navigation Header */}
        <div className="bg-surface-container-lowest p-3 sm:p-4 rounded-2xl border border-outline-variant shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('balita')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'balita'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Baby size={16} />
              <span>Kartu KIA Balita ({targetBalita.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('lansia')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'lansia'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <HeartPulse size={16} />
              <span>Kartu Lansia ({targetLansia.length})</span>
            </button>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs pb-1 sm:pb-0">
            {activeTab === 'balita' ? (
              <>
                <button
                  type="button"
                  onClick={() => setBalitaFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                    balitaFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua ({targetBalita.length})
                </button>
                <button
                  type="button"
                  onClick={() => setBalitaFilter('unweighed')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                    balitaFilter === 'unweighed' ? 'bg-amber-500 text-amber-950' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  Belum Ditimbang Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setBalitaFilter('at_risk')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                    balitaFilter === 'at_risk' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-900 hover:bg-red-200'
                  }`}
                >
                  Perlu Perhatian Gizi
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setLansiaFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                    lansiaFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua ({targetLansia.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLansiaFilter('unexamined')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                    lansiaFilter === 'unexamined' ? 'bg-amber-500 text-amber-950' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  Belum Diperiksa Bulan Ini
                </button>
                <button
                  type="button"
                  onClick={() => setLansiaFilter('at_risk')}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                    lansiaFilter === 'at_risk' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-900 hover:bg-red-200'
                  }`}
                >
                  Hipertensi / Sebatang Kara
                </button>
              </>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* GRID KARTU KIA DIGITAL / KARTU LANSIA DIGITAL                              */}
        {/* ========================================================================= */}
        {activeTab === 'balita' ? (
          <div>
            {displayedBalita.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-2">
                <Baby size={32} className="mx-auto text-slate-400" />
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
                    onCatatBaru={(selected) => {
                      setSelectedBalita(b);
                      setFormError('');
                      setShowBalitaModal(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {displayedLansia.length === 0 ? (
              <div className="p-8 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant space-y-2">
                <HeartPulse size={32} className="mx-auto text-slate-400" />
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
                    onCatatPemeriksaan={(selected) => {
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
      </div>

      {/* ========================================================================= */}
      {/* THUMB-ZONE FLOATING ACTIONS (Khusus Mobile-First)                          */}
      {/* ========================================================================= */}
      <div className="fixed bottom-16 lg:bottom-6 left-0 right-0 z-30 px-4 pointer-events-none">
        <div className="max-w-md mx-auto flex items-center gap-2 pointer-events-auto">
          {/* Tombol Utama: Catat Balita */}
          <button
            type="button"
            onClick={() => {
              setSelectedBalita(null);
              setBalitaSearchQuery('');
              setFormError('');
              setShowBalitaModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-sm shadow-elevated border border-teal-500 transition-all cursor-pointer"
            aria-label="Catat Balita Baru"
          >
            <Baby size={18} className="shrink-0" />
            <span>+ Catat Balita (KIA)</span>
          </button>

          {/* Tombol Utama: Catat Lansia */}
          <button
            type="button"
            onClick={() => {
              setSelectedLansia(null);
              setLansiaSearchQuery('');
              setFormError('');
              setShowLansiaModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-extrabold text-sm shadow-elevated border border-emerald-600 transition-all cursor-pointer"
            aria-label="Catat Pemeriksaan Lansia"
          >
            <HeartPulse size={18} className="shrink-0" />
            <span>+ Catat Lansia</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: FORM PENCATATAN BALITA (SEARCH WARGA FIRST + SANITY BOUNDS)       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBalitaModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl border border-outline-variant shadow-elevated max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-teal-600 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
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
                  className="p-1.5 rounded-lg text-teal-100 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-24 sm:pb-6">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-lg text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}
                {modalSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{modalSuccessMsg}</span>
                  </div>
                )}

                {/* STEP 1: PILIH / CARI WARGA (Jika belum terpilih) */}
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
                          autoFocus
                          placeholder="Ketik nama anak, nama ibu, atau RT..."
                          value={balitaSearchQuery}
                          onChange={(e) => setBalitaSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Pilih anak dari daftar warga resmi kelurahan. Data NIK dan orang tua akan terisi otomatis.
                      </p>
                    </div>

                    {/* Daftar Hasil Pencarian Balita */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {balitaCandidates.length === 0 ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <HelpCircle size={15} className="text-amber-700" />
                            <span>Balita tidak ditemukan di wilayah tugas Anda</span>
                          </p>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Pastikan data keluarga sudah tercatat resmi di sistem kelurahan. Jika keluarga baru pindah, silakan hubungi <strong>Admin Kelurahan</strong> untuk pendaftaran/mutasi kependudukan.
                          </p>
                        </div>
                      ) : (
                        balitaCandidates.map((b) => (
                          <div
                            key={b.nik_anak}
                            onClick={() => {
                              setSelectedBalita(b);
                              setFormError('');
                            }}
                            className="p-3 bg-white hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                                b.jenis_kelamin_anak === 'L' ? 'bg-sky-100 text-sky-800' : 'bg-pink-100 text-pink-800'
                              }`}>
                                <Baby size={16} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-extrabold text-slate-900 truncate">{b.nama_anak}</h4>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {b.umur_bulan} Bln · Ibu: {b.nama_ibu || b.kepala_keluarga || '-'} · RT {b.rt}/RW {b.rw}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.sudah_ditimbang_bulan_ini === 1 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : 'bg-amber-100 text-amber-900'
                              }`}>
                                {b.sudah_ditimbang_bulan_ini === 1 ? 'Sudah Timbang' : 'Belum Timbang'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* STEP 2: INPUT HASIL PENIMBANGAN */
                  <form onSubmit={handleSaveBalita} className="space-y-4">
                    {/* Header Balita Terpilih (Kunci Identitas) */}
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <Baby size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-teal-950 truncate">{selectedBalita.nama_anak}</h4>
                          <p className="text-[11px] text-teal-800 truncate">
                            NIK: {selectedBalita.nik_anak} · Usia: {selectedBalita.umur_bulan} Bln · RT {selectedBalita.rt}/RW {selectedBalita.rw}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBalita(null)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white text-teal-800 border border-teal-300 rounded-lg hover:bg-teal-100/50 shrink-0"
                      >
                        Ganti
                      </button>
                    </div>

                    {/* NUMPAD BESAR & SANITY BOUNDS: BERAT & TINGGI BADAN */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-teal-950">Berat (kg) *</label>
                          <span className="text-[10px] text-teal-700 font-mono">1.0–35.0 kg</span>
                        </div>
                        <input
                          type="number"
                          step="0.05"
                          inputMode="decimal"
                          required
                          placeholder="0.00"
                          value={balitaForm.berat_badan_kg}
                          onChange={(e) => setBalitaForm({ ...balitaForm, berat_badan_kg: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-teal-300 text-xl font-extrabold text-teal-950 focus:ring-2 focus:ring-teal-600 outline-none text-center"
                        />
                      </div>

                      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-extrabold text-teal-950">Tinggi (cm) *</label>
                          <span className="text-[10px] text-teal-700 font-mono">35–130 cm</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          inputMode="decimal"
                          required
                          placeholder="0.0"
                          value={balitaForm.tinggi_badan_cm}
                          onChange={(e) => setBalitaForm({ ...balitaForm, tinggi_badan_cm: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-teal-300 text-xl font-extrabold text-teal-950 focus:ring-2 focus:ring-teal-600 outline-none text-center"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800">
                          Lingkar Kepala (cm)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          inputMode="decimal"
                          placeholder="25–60 cm"
                          value={balitaForm.lingkar_kepala_cm}
                          onChange={(e) => setBalitaForm({ ...balitaForm, lingkar_kepala_cm: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800">
                          Imunisasi / Vitamin
                        </label>
                        <input
                          type="text"
                          placeholder="Vit A / DPT / Campak"
                          value={balitaForm.imunisasi}
                          onChange={(e) => setBalitaForm({ ...balitaForm, imunisasi: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        Catatan Kesehatan
                      </label>
                      <input
                        type="text"
                        placeholder="Nafsu makan baik, aktif bergerak..."
                        value={balitaForm.catatan_kesehatan}
                        onChange={(e) => setBalitaForm({ ...balitaForm, catatan_kesehatan: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingRecord}
                        className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {savingRecord ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Menyimpan Hasil Timbang...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Simpan ke Kartu KIA Digital</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: FORM PENCATATAN LANSIA (SEARCH WARGA FIRST)                       */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showLansiaModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-surface-container-lowest rounded-t-2xl sm:rounded-2xl border border-outline-variant shadow-elevated max-h-[92vh] flex flex-col overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-emerald-700 text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold">
                    <HeartPulse size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Pencatatan Kesehatan Lansia</h3>
                    <p className="text-[11px] text-emerald-100">Bebas ketik NIK manual · Terintegrasi Master Warga</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLansiaModal(false)}
                  className="p-1.5 rounded-lg text-emerald-100 hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-24 sm:pb-6">
                {formError && (
                  <div className="p-3 bg-red-50 text-red-900 border border-red-200 rounded-lg text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}
                {modalSuccessMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{modalSuccessMsg}</span>
                  </div>
                )}

                {/* STEP 1: PILIH LANSIA (Jika belum terpilih) */}
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
                          autoFocus
                          placeholder="Ketik nama lansia atau RT..."
                          value={lansiaSearchQuery}
                          onChange={(e) => setLansiaSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {lansiaCandidates.length === 0 ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <HelpCircle size={15} className="text-amber-700" />
                            <span>Data lansia tidak ditemukan di wilayah tugas</span>
                          </p>
                          <p className="text-[11px] text-amber-800">
                            Silakan hubungi Admin Kelurahan untuk verifikasi data kependudukan lansia.
                          </p>
                        </div>
                      ) : (
                        lansiaCandidates.map((l) => (
                          <div
                            key={l.nik}
                            onClick={() => {
                              setSelectedLansia(l);
                              setFormError('');
                            }}
                            className="p-3 bg-white hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 shadow-2xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                <HeartPulse size={16} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-extrabold text-slate-900 truncate">{l.nama}</h4>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {l.usia} Thn · {l.status_tinggal || 'Bersama Keluarga'} · RT {l.rt}/RW {l.rw}
                                </p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              l.sudah_diperiksa_bulan_ini === 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {l.sudah_diperiksa_bulan_ini === 1 ? 'Sudah Diperiksa' : 'Belum Diperiksa'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  /* STEP 2: INPUT REKAM MEDIS LANSIA */
                  <form onSubmit={handleSaveLansia} className="space-y-4">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          <HeartPulse size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-extrabold text-emerald-950 truncate">{selectedLansia.nama}</h4>
                          <p className="text-[11px] text-emerald-800 truncate">
                            NIK: {selectedLansia.nik} · {selectedLansia.usia} Thn · RT {selectedLansia.rt}/RW {selectedLansia.rw}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedLansia(null)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-white text-emerald-800 border border-emerald-300 rounded-lg hover:bg-emerald-100/50 shrink-0"
                      >
                        Ganti
                      </button>
                    </div>

                    {/* Vitals Input */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                        <label className="text-xs font-extrabold text-emerald-950">Tensi Sistolik *</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          required
                          placeholder="Contoh: 120"
                          value={lansiaForm.tensi_sistolik}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, tensi_sistolik: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-emerald-300 text-xl font-extrabold text-emerald-950 focus:ring-2 focus:ring-emerald-600 outline-none text-center"
                        />
                      </div>

                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                        <label className="text-xs font-extrabold text-emerald-950">Tensi Diastolik *</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          required
                          placeholder="Contoh: 80"
                          value={lansiaForm.tensi_diastolik}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, tensi_diastolik: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-white border border-emerald-300 text-xl font-extrabold text-emerald-950 focus:ring-2 focus:ring-emerald-600 outline-none text-center"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-800">
                          Gula Darah Sewaktu (GDS)
                        </label>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="mg/dL"
                          value={lansiaForm.gula_darah_sewaktu}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, gula_darah_sewaktu: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800">
                          Kemandirian (ADL)
                        </label>
                        <select
                          value={lansiaForm.skor_kemandirian_adl}
                          onChange={(e) => setLansiaForm({ ...lansiaForm, skor_kemandirian_adl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="Mandiri">Mandiri</option>
                          <option value="Ketergantungan Ringan">Ketergantungan Ringan</option>
                          <option value="Ketergantungan Sedang">Ketergantungan Sedang</option>
                          <option value="Ketergantungan Berat">Ketergantungan Berat</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800">
                        Keluhan & Tindakan Petugas
                      </label>
                      <input
                        type="text"
                        placeholder="Keluhan pusing, anjuran kurangi garam..."
                        value={lansiaForm.keluhan}
                        onChange={(e) => setLansiaForm({ ...lansiaForm, keluhan: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingRecord}
                        className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {savingRecord ? (
                          <>
                            <RefreshCw size={16} className="animate-spin" />
                            <span>Menyimpan Rekam Medis...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Simpan Rekam Medis Lansia</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
