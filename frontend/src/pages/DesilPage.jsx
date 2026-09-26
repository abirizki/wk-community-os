import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Upload, 
  FileText, 
  AlertTriangle, 
  Award, 
  Search, 
  Filter, 
  Home, 
  Zap, 
  Droplet, 
  Flame, 
  Car, 
  Users, 
  HelpCircle,
  Eye,
  Check, 
  X, 
  Sparkles,
  Camera,
  Layers,
  ShieldCheck,
  Building,
  RefreshCw,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function DesilPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('kuesioner'); // 'kuesioner' | 'bukti' | 'verifikasi' | 'rekonsiliasi'
  const [loading, setLoading] = useState(false);
  const [familyDesil, setFamilyDesil] = useState(null);
  const [verifikasiList, setVerifikasiList] = useState([]);
  const [stats, setStats] = useState(null);

  // Form Kuesioner 11 Indikator DTSEN Faktual Lapangan
  const [formData, setFormData] = useState({
    daya_listrik: '900 VA',
    status_rumah: 'Milik Sendiri',
    sumber_air: 'PDAM/Leding',
    luas_lantai_kategori: '8 - 14 m2',
    bahan_bakar_memasak: 'Gas 3kg',
    kepemilikan_motor: '1 unit',
    kepemilikan_mobil: false,
    ada_disabilitas_lansia_tunggal: false,
    ada_anak_sekolah_pip: false,
    dinding_terluas: 'Tembok/Semen',
    lantai_terluas: 'Keramik/Granit/Ubin',
    // Foto Bukti Faktual
    foto_rumah_depan_url: '',
    foto_rumah_dalam_url: '',
    foto_meteran_listrik_url: '',
    // Data DTKS & Cek Bansos Resmi
    desil_resmi_pemerintah: '',
    id_dtks_resmi: '',
    bansos_diterima_resmi: '',
    bukti_kementerian_url: '',
    nomor_referensi_bukti: '',
    // Pakta Integritas SPTJM Warga
    sptjm_warga_accepted: false
  });

  // Filter Verifikasi Kelurahan & RT/RW
  const [filters, setFilters] = useState({
    rt: '',
    rw: '',
    status_verifikasi: '',
    desil: '',
    search: ''
  });

  // Modal Verifikasi / Ground Check / Rekonsiliasi
  const [selectedItem, setSelectedItem] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [groundCheckModalOpen, setGroundCheckModalOpen] = useState(false);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);

  // Form States for Officers
  const [finalDesil, setFinalDesil] = useState(2);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');
  const [groundCheckForm, setGroundCheckForm] = useState({
    status_faktual: 'SESUAI_LAPANGAN', // 'SESUAI_LAPANGAN' | 'SANGGAHAN_PINDAH' | 'SANGGAHAN_MENINGGAL' | 'SANGGAHAN_MAMPU'
    catatan_ground_check_rt: '',
    sptjm_verifikator_accepted: false
  });
  const [reconcileForm, setReconcileForm] = useState({
    desil_resmi_pemerintah: '',
    id_dtks_resmi: '',
    bansos_diterima_resmi: '',
    status_sinkronisasi: 'SINKRON',
    catatan_komparasi_kelurahan: ''
  });

  const isOfficer = ['superadmin', 'admin_kelurahan', 'admin', 'ketua_rw', 'admin_rw', 'ketua_rt', 'lurah'].includes(user?.role);
  const isRT = user?.role === 'ketua_rt';
  const isRW = ['ketua_rw', 'admin_rw'].includes(user?.role);
  const isKelurahan = ['superadmin', 'admin_kelurahan', 'lurah', 'admin'].includes(user?.role);

  // Load My Family Desil
  const fetchMyFamilyDesil = async () => {
    try {
      setLoading(true);
      const res = await api.get('/desil/my-family');
      if (res.data.success && res.data.data) {
        setFamilyDesil(res.data.data);
        setFormData(prev => ({
          ...prev,
          ...res.data.data,
          kepemilikan_mobil: !!res.data.data.kepemilikan_mobil,
          ada_disabilitas_lansia_tunggal: !!res.data.data.ada_disabilitas_lansia_tunggal,
          ada_anak_sekolah_pip: !!res.data.data.ada_anak_sekolah_pip,
          sptjm_warga_accepted: !!res.data.data.sptjm_warga_accepted
        }));
      }
    } catch (err) {
      console.warn('Info:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Verifikasi List (Petugas)
  const fetchVerifikasiList = async () => {
    if (!isOfficer) return;
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        api.get('/desil/list', { params: filters }),
        api.get('/desil/stats')
      ]);
      if (listRes.data.success) setVerifikasiList(listRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (err) {
      console.error('Gagal memuat data verifikasi:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFamilyDesil();
  }, []);

  useEffect(() => {
    if (activeTab === 'verifikasi' && isOfficer) {
      fetchVerifikasiList();
    }
  }, [activeTab, filters]);

  // Kalkulasi PMT Desil Dinamis 11 Indikator
  const calculatePreviewDesil = () => {
    if (formData.kepemilikan_mobil) return 8;

    let score = 0;
    // 1. Listrik
    if (formData.daya_listrik === 'Tanpa Meteran') score += 2;
    else if (formData.daya_listrik === '450 VA') score += 5;
    else if (formData.daya_listrik === '900 VA') score += 14;
    else if (formData.daya_listrik === '1300 VA') score += 24;
    else score += 30;

    // 2. Status Rumah
    if (formData.status_rumah === 'Bebas Sewa' || formData.status_rumah === 'Menumpang') score += 3;
    else if (formData.status_rumah === 'Sewa/Kontrak') score += 8;
    else score += 16;

    // 3. Sumber Air
    if (formData.sumber_air === 'Sumur Tidak Terlindung') score += 2;
    else if (formData.sumber_air === 'Sumur Terlindung') score += 5;
    else if (formData.sumber_air === 'PDAM/Leding') score += 10;
    else score += 14;

    // 4. Luas Lantai
    if (formData.luas_lantai_kategori === '< 8 m2 (Padat)') score += 3;
    else if (formData.luas_lantai_kategori === '8 - 14 m2') score += 8;
    else score += 15;

    // 5. Bahan Bakar
    if (formData.bahan_bakar_memasak === 'Minyak/Kayu') score += 1;
    else if (formData.bahan_bakar_memasak === 'Gas 3kg') score += 4;
    else score += 10;

    // 6. Sepeda Motor
    if (formData.kepemilikan_motor === '0 unit') score += 0;
    else if (formData.kepemilikan_motor === '1 unit') score += 5;
    else score += 10;

    // 7. Dinding
    if (formData.dinding_terluas === 'Bambu/Anyaman/Lainnya') score += 2;
    else if (formData.dinding_terluas === 'Kayu/Papan') score += 6;
    else score += 12;

    // 8. Lantai
    if (formData.lantai_terluas === 'Tanah/Bambu/Kayu Sederhana') score += 2;
    else if (formData.lantai_terluas === 'Semen/Plester') score += 6;
    else score += 12;

    // 9. Disabilitas / Lansia Tunggal
    if (formData.ada_disabilitas_lansia_tunggal) score -= 6;
    // 10. Anak Sekolah PIP
    if (formData.ada_anak_sekolah_pip) score -= 4;

    score = Math.max(0, Math.min(100, score));

    if (score <= 15) return 1;
    if (score <= 25) return 2;
    if (score <= 36) return 3;
    if (score <= 48) return 4;
    if (score <= 60) return 5;
    if (score <= 70) return 6;
    if (score <= 80) return 7;
    if (score <= 90) return 8;
    if (score <= 95) return 9;
    return 10;
  };

  const previewDesil = calculatePreviewDesil();

  const getDesilBadge = (d) => {
    if (!d) return <span className="px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600 font-semibold">Belum Terkategori</span>;
    if (d === 1) return <span className="px-2.5 py-1 text-xs rounded-full bg-red-100 text-red-700 font-bold border border-red-200">Desil 1 (Ekstrem)</span>;
    if (d === 2) return <span className="px-2.5 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-bold border border-orange-200">Desil 2 (Sangat Miskin)</span>;
    if (d === 3) return <span className="px-2.5 py-1 text-xs rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200">Desil 3 (Miskin)</span>;
    if (d === 4) return <span className="px-2.5 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 font-bold border border-yellow-200">Desil 4 (Rentan)</span>;
    if (d === 5) return <span className="px-2.5 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-bold border border-blue-200">Desil 5 (PBI-JK)</span>;
    return <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">Desil {d} (Mampu)</span>;
  };

  const getSyncBadge = (status) => {
    if (status === 'SINKRON') return <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">Sinkron Sesuai</span>;
    if (status === 'ANOMALI_MAMPU') return <span className="px-2 py-0.5 rounded text-[10px] bg-red-100 text-red-800 font-bold border border-red-200">Anomali Mampu (Graduasi)</span>;
    if (status === 'ANOMALI_BELUM_TERDAFTAR') return <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-bold border border-purple-200">Anomali Inklusi Baru</span>;
    return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-bold">Belum Rekonsiliasi</span>;
  };

  const handlePhotoUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran berkas maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Simpan Draft Usulan Lapangan
  const handleSaveDraft = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/desil/draft', {
        ...formData,
        desil_usulan: previewDesil
      });
      if (res.data.success) {
        alert('Draft usulan 11 indikator faktual berhasil disimpan!');
        fetchMyFamilyDesil();
      }
    } catch (err) {
      alert('Gagal menyimpan draft: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ajukan Pengesahan Resmi ke Kelurahan (Wajib SPTJM)
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!formData.sptjm_warga_accepted) {
      alert('PERINGATAN: Anda wajib menyetujui Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) sebelum mengajukan permohonan!');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/desil/submit-update', {
        ...formData,
        desil_usulan: previewDesil,
        sptjm_warga_accepted: true,
        sptjm_warga_at: new Date().toISOString()
      });
      if (res.data.success) {
        alert('Permohonan data desil dan SPTJM berhasil diajukan! Selanjutnya data akan diverifikasi faktual (ground checking) oleh Ketua RT/RW setempat.');
        fetchMyFamilyDesil();
      }
    } catch (err) {
      alert('Gagal mengajukan permohonan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Petugas RT/RW Melakukan Ground Checking
  const handleSaveGroundCheck = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    if (!groundCheckForm.sptjm_verifikator_accepted) {
      alert('Verifikator wajib menyetujui Pakta Integritas Verifikasi Faktual Lapangan.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.patch(`/desil/${selectedItem.id}/ground-check`, groundCheckForm);
      if (res.data.success) {
        alert('Hasil verifikasi lapangan (ground checking) berhasil dicatat dan diteruskan ke Kelurahan!');
        setGroundCheckModalOpen(false);
        fetchVerifikasiList();
      }
    } catch (err) {
      alert('Gagal menyimpan hasil verifikasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin Kelurahan Melakukan Rekonsiliasi Data Pembanding
  const handleSaveReconcile = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setLoading(true);
      const res = await api.patch(`/desil/${selectedItem.id}/reconcile`, reconcileForm);
      if (res.data.success) {
        alert('Data pembanding resmi dan status sinkronisasi berhasil diperbarui!');
        setReconcileModalOpen(false);
        fetchVerifikasiList();
      }
    } catch (err) {
      alert('Gagal menyimpan rekonsiliasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Admin Kelurahan / Lurah Mengesahkan Desil Resmi
  const handleVerifyKelurahan = async (status) => {
    if (!selectedItem) return;
    try {
      setLoading(true);
      const res = await api.patch(`/desil/${selectedItem.id}/verify`, {
        status,
        desilFinal: finalDesil,
        catatan: catatanVerifikasi
      });
      if (res.data.success) {
        alert(`Status desil berhasil diperbarui menjadi ${status}`);
        setVerifyModalOpen(false);
        fetchVerifikasiList();
      }
    } catch (err) {
      alert('Gagal memverifikasi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                <Sparkles size={12} /> Data Tunggal Sosial & Ekonomi Nasional (DTSEN)
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                Standar BPS & Kemensos (11 Poin Faktual)
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Desil Kesejahteraan & Rekonsiliasi DTKS</h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl leading-relaxed">
              Pemeringkatan desil 1–10 berbasis 11 indikator riil lapangan, validasi bukti kementerian, pakta integritas SPTJM, serta ground checking berjenjang RT/RW dan Kelurahan.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a 
              href="https://cekbansos.kemensos.go.id/" 
              target="_blank" 
              rel="noreferrer"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ExternalLink size={14} /> Cek Bansos Kemensos
            </a>
            <a 
              href="https://dtsen-form.bps.go.id/indonesia-pintar" 
              target="_blank" 
              rel="noreferrer"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center gap-1.5 transition-all shadow-sm"
            >
              <ExternalLink size={14} /> DTSEN BPS PIP
            </a>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('kuesioner')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'kuesioner'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> 11 Indikator Faktual Lapangan
        </button>

        <button
          onClick={() => setActiveTab('bukti')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeTab === 'bukti'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload size={16} /> Data Pembanding & SPTJM Warga
          {familyDesil?.status_verifikasi === 'MENUNGGU_VERIFIKASI_KELURAHAN' && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          )}
        </button>

        {isOfficer && (
          <button
            onClick={() => setActiveTab('verifikasi')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'verifikasi'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck size={16} /> Meja Verifikasi & Rekonsiliasi Wilayah
            {stats?.pending_verifikasi > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-bold">
                {stats.pending_verifikasi}
              </span>
            )}
          </button>
        )}
      </div>

      {/* TAB 1: KUESIONER 11 INDIKATOR FAKTUAL LAPANGAN */}
      {activeTab === 'kuesioner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Kuesioner */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
              <Info size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Pemberitahuan Status Data Ajuan:</strong>
                Data yang Anda isikan di bawah ini merupakan <strong>DATA AJUAN MANDIRI</strong> yang digunakan sebagai estimasi Proxy Means Testing (PMT). Sebelum disahkan dan berhak menerima bantuan sosial, data ini akan melalui verifikasi faktual langsung (Ground Checking) oleh Pengurus RT/RW setempat dan evaluasi Kelurahan.
              </div>
            </div>

            <form onSubmit={handleSaveDraft} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Daya Listrik */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Zap size={14} className="text-amber-500" /> 1. Daya Listrik Terpasang
                  </label>
                  <select
                    value={formData.daya_listrik}
                    onChange={(e) => setFormData({ ...formData, daya_listrik: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Tanpa Meteran">Tanpa Meteran (Menumpang)</option>
                    <option value="450 VA">450 VA (Subsidi)</option>
                    <option value="900 VA">900 VA</option>
                    <option value="1300 VA">1300 VA</option>
                    <option value="> 1300 VA">&gt; 1300 VA</option>
                  </select>
                </div>

                {/* 2. Status Kepemilikan Rumah */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Home size={14} className="text-blue-500" /> 2. Status Kepemilikan Rumah
                  </label>
                  <select
                    value={formData.status_rumah}
                    onChange={(e) => setFormData({ ...formData, status_rumah: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Bebas Sewa">Bebas Sewa / Rumah Dinas</option>
                    <option value="Menumpang">Menumpang dengan Keluarga Lain</option>
                    <option value="Sewa/Kontrak">Sewa / Kontrak</option>
                    <option value="Milik Sendiri">Milik Sendiri</option>
                  </select>
                </div>

                {/* 3. Sumber Air Minum */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Droplet size={14} className="text-cyan-500" /> 3. Sumber Air Minum Utama
                  </label>
                  <select
                    value={formData.sumber_air}
                    onChange={(e) => setFormData({ ...formData, sumber_air: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Sumur Tidak Terlindung">Sumur Tidak Terlindung / Sungai</option>
                    <option value="Sumur Terlindung">Sumur Terlindung / Mata Air</option>
                    <option value="PDAM/Leding">PDAM / Leding Perpipaan</option>
                    <option value="Air Kemasan/Isi Ulang">Air Kemasan / Depot Isi Ulang</option>
                  </select>
                </div>

                {/* 4. Luas Lantai per Kapita */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Users size={14} className="text-indigo-500" /> 4. Luas Lantai per Anggota Keluarga
                  </label>
                  <select
                    value={formData.luas_lantai_kategori}
                    onChange={(e) => setFormData({ ...formData, luas_lantai_kategori: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="< 8 m2 (Padat)">&lt; 8 m² (Sangat Padat / Sempit)</option>
                    <option value="8 - 14 m2">8 - 14 m² (Standar Cukup)</option>
                    <option value="> 14 m2">&gt; 14 m² (Luas / Lapang)</option>
                  </select>
                </div>

                {/* 5. Bahan Bakar Memasak */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Flame size={14} className="text-red-500" /> 5. Bahan Bakar Memasak Utama
                  </label>
                  <select
                    value={formData.bahan_bakar_memasak}
                    onChange={(e) => setFormData({ ...formData, bahan_bakar_memasak: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Minyak/Kayu">Kayu Bakar / Minyak Tanah</option>
                    <option value="Gas 3kg">Gas LPG 3 Kg (Subsidi)</option>
                    <option value="Gas > 3kg">Gas LPG 5.5 Kg / 12 Kg (Non-Subsidi)</option>
                    <option value="Listrik">Kompor Induksi / Listrik</option>
                  </select>
                </div>

                {/* 6. Aset Sepeda Motor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Car size={14} className="text-slate-600" /> 6. Kepemilikan Sepeda Motor
                  </label>
                  <select
                    value={formData.kepemilikan_motor}
                    onChange={(e) => setFormData({ ...formData, kepemilikan_motor: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="0 unit">0 unit (Tidak Memiliki)</option>
                    <option value="1 unit">1 unit</option>
                    <option value=">= 2 unit">&ge; 2 unit</option>
                  </select>
                </div>

                {/* 7. Jenis Dinding Terluas */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Building size={14} className="text-amber-700" /> 7. Jenis Dinding Rumah Terluas
                  </label>
                  <select
                    value={formData.dinding_terluas}
                    onChange={(e) => setFormData({ ...formData, dinding_terluas: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Bambu/Anyaman/Lainnya">Bambu / Anyaman / Rumbia (Rentan)</option>
                    <option value="Kayu/Papan">Kayu / Papan / Seng</option>
                    <option value="Tembok/Semen">Tembok / Semen / Bata Permanen</option>
                  </select>
                </div>

                {/* 8. Jenis Lantai Terluas */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Layers size={14} className="text-emerald-700" /> 8. Jenis Lantai Rumah Terluas
                  </label>
                  <select
                    value={formData.lantai_terluas}
                    onChange={(e) => setFormData({ ...formData, lantai_terluas: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Tanah/Bambu/Kayu Sederhana">Tanah / Bambu / Papan Kayu Rendah</option>
                    <option value="Semen/Plester">Semen / Plester Halus</option>
                    <option value="Keramik/Granit/Ubin">Keramik / Granit / Marmer</option>
                  </select>
                </div>
              </div>

              {/* 9, 10, 11: Checkboxes Khusus */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.kepemilikan_mobil}
                    onChange={(e) => setFormData({ ...formData, kepemilikan_mobil: e.target.checked })}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <span className="font-semibold text-red-600">
                    9. Keluarga memiliki mobil pribadi / kendaraan roda 4 (Otomatis Desil &gt; 6)
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.ada_disabilitas_lansia_tunggal}
                    onChange={(e) => setFormData({ ...formData, ada_disabilitas_lansia_tunggal: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>10. Terdapat penyandang disabilitas berat atau lansia tunggal sebatang kara</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200">
                  <input
                    type="checkbox"
                    checked={formData.ada_anak_sekolah_pip}
                    onChange={(e) => setFormData({ ...formData, ada_anak_sekolah_pip: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>11. Terdapat anak usia sekolah (6–21 tahun) aktif belajar (Calon Penerima PIP)</span>
                </label>
              </div>

              {/* Unggah 3 Foto Faktual Lapangan */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Camera size={16} className="text-blue-600" /> Unggah 3 Foto Faktual Tempat Tinggal (Bukti Ground Check)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Foto Tampak Depan</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handlePhotoUpload(e, 'foto_rumah_depan_url')}
                      className="text-[10px] w-full"
                    />
                    {formData.foto_rumah_depan_url && (
                      <img src={formData.foto_rumah_depan_url} alt="Depan" className="mt-2 h-20 w-full object-cover rounded border" />
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Foto Bagian Dalam</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handlePhotoUpload(e, 'foto_rumah_dalam_url')}
                      className="text-[10px] w-full"
                    />
                    {formData.foto_rumah_dalam_url && (
                      <img src={formData.foto_rumah_dalam_url} alt="Dalam" className="mt-2 h-20 w-full object-cover rounded border" />
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 text-center">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Foto Meteran Listrik</label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handlePhotoUpload(e, 'foto_meteran_listrik_url')}
                      className="text-[10px] w-full"
                    />
                    {formData.foto_meteran_listrik_url && (
                      <img src={formData.foto_meteran_listrik_url} alt="Meteran" className="mt-2 h-20 w-full object-cover rounded border" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Check size={16} /> Simpan Draft Indikator Mandiri
                </button>
              </div>
            </form>
          </div>

          {/* Panel Estimasi Desil Mandiri */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Estimasi Desil Usulan Awal
              </h3>

              <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="inline-block mb-2">
                  {getDesilBadge(previewDesil)}
                </div>
                <p className="text-3xl font-black text-slate-900">Desil {previewDesil}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {previewDesil <= 4 ? 'Kategori 40% Terbawah (Prioritas Bansos)' : 'Kategori Non-Bansos Reguler'}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Status Verifikasi:</span>
                  <span className="font-bold text-amber-600">
                    {familyDesil?.status_verifikasi === 'VERIFIED_KELURAHAN' ? 'Terverifikasi Kelurahan' : 'Draft Usulan Mandiri'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Kelayakan PKH / Sembako:</span>
                  <span className={`font-bold ${previewDesil <= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {previewDesil <= 4 ? 'Berhak Diusulkan' : 'Tidak Berhak'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Kelayakan PBI-JK (BPJS):</span>
                  <span className={`font-bold ${previewDesil <= 5 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {previewDesil <= 5 ? 'Berhak Diusulkan' : 'Tidak Berhak'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
                <strong>Langkah Selanjutnya:</strong> Setelah mengisi 11 indikator ini, buka tab <strong>"Data Pembanding & SPTJM Warga"</strong> untuk menyetujui Pakta Integritas Digital dan melampirkan bukti Cek Bansos Kemensos agar dapat diteruskan ke meja verifikasi RT/RW.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA PEMBANDING CEK BANSOS & SPTJM DIGITAL */}
      {activeTab === 'bukti' && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Upload className="text-blue-600" size={18} /> Data Pembanding Resmi Kemensos & Pakta Integritas SPTJM
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Warga dapat menginputkan data pembanding resmi dari portal <strong>cekbansos.kemensos.go.id</strong> dan wajib menandatangani Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) secara digital.
            </p>
          </div>

          {/* Status Tracker */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-3">Status Pengajuan & Verifikasi Saat Ini:</h4>
            <div className="flex items-center gap-3">
              {familyDesil?.status_verifikasi === 'VERIFIED_KELURAHAN' ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 size={18} /> RESMI TERVERIFIKASI KELURAHAN (Desil {familyDesil.desil_saat_ini})
                </div>
              ) : familyDesil?.status_verifikasi === 'MENUNGGU_VERIFIKASI_KELURAHAN' ? (
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <Clock size={18} className="animate-spin" /> MENUNGGU VERIFIKASI RT / KELURAHAN (Desil Usulan: {familyDesil.desil_usulan})
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <HelpCircle size={18} /> Belum Ada Pengajuan Resmi (Status: Draft Usulan)
                </div>
              )}
            </div>

            {familyDesil?.status_sinkronisasi && (
              <div className="mt-2.5 flex items-center gap-2 text-xs">
                <span className="text-slate-500">Kesesuaian Data:</span>
                {getSyncBadge(familyDesil.status_sinkronisasi)}
              </div>
            )}

            {familyDesil?.catatan_ground_check_rt && (
              <p className="text-xs text-slate-700 mt-2 bg-amber-50 p-2.5 rounded border border-amber-200">
                <strong>Catatan Ground Check RT:</strong> {familyDesil.catatan_ground_check_rt}
              </p>
            )}

            {familyDesil?.catatan_verifikasi && (
              <p className="text-xs text-slate-700 mt-2 bg-white p-2.5 rounded border border-slate-200">
                <strong>Catatan Pengesahan Kelurahan:</strong> {familyDesil.catatan_verifikasi}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Desil Resmi Pemerintah */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Desil Resmi dari Pemerintah / DTSEN (Jika Tahu)
                </label>
                <select
                  value={formData.desil_resmi_pemerintah || ''}
                  onChange={(e) => setFormData({ ...formData, desil_resmi_pemerintah: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Belum Diketahui / Tidak Ada --</option>
                  <option value="1">Desil 1</option>
                  <option value="2">Desil 2</option>
                  <option value="3">Desil 3</option>
                  <option value="4">Desil 4</option>
                  <option value="5">Desil 5</option>
                  <option value="6">Desil 6 ke atas</option>
                </select>
              </div>

              {/* ID DTKS Kemensos */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ID DTKS Resmi Kemensos (Jika Ada)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 3273010101900001 / ID-DTKS-XXXX"
                  value={formData.id_dtks_resmi || formData.id_dtks_kemensos || ''}
                  onChange={(e) => setFormData({ ...formData, id_dtks_resmi: e.target.value, id_dtks_kemensos: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Bansos Resmi yang Pernah/Sedang Diterima */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bantuan Sosial Resmi Kemensos yang Diterima
              </label>
              <input
                type="text"
                placeholder="Contoh: PKH Tahap 1, BPNT Sembako, PBI-JK (BPJS Gratis)"
                value={formData.bansos_diterima_resmi || ''}
                onChange={(e) => setFormData({ ...formData, bansos_diterima_resmi: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Upload Bukti Cek Bansos */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unggah Tangkapan Layar Portal Cek Bansos / DTSEN BPS *
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => handlePhotoUpload(e, 'bukti_kementerian_url')}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Format gambar JPG, PNG, atau PDF. Maksimal 5 MB.</p>
            </div>

            {formData.bukti_kementerian_url && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Pratinjau Bukti Terunggah:</p>
                <img
                  src={formData.bukti_kementerian_url}
                  alt="Bukti Kementerian"
                  className="max-h-52 rounded border border-slate-300 object-contain mx-auto"
                />
              </div>
            )}

            {/* KOTAK PAKTA INTEGRITAS SPTJM DIGITAL WARGA */}
            <div className="p-4 bg-amber-50/80 rounded-xl border-2 border-amber-300 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <ShieldAlert size={18} className="text-amber-600" /> Pakta Integritas & SPTJM Digital Warga
              </div>
              <p className="text-[11px] text-amber-950 leading-relaxed italic">
                "Dengan ini saya menyatakan dengan sesungguhnya bahwa seluruh data 11 indikator kuesioner dan data pembanding yang saya isikan adalah <strong>BENAR SESUAI KENYATAAN DI LAPANGAN</strong>. Saya bersedia menerima kunjungan pemeriksaan faktual (ground checking) oleh Ketua RT/RW dan aparat berwenang, serta siap mempertanggungjawabkan secara hukum apabila di kemudian hari ditemukan ketidakbenaran atau rekayasa data."
              </p>

              <label className="flex items-start gap-2.5 text-xs text-amber-950 font-bold cursor-pointer pt-2 border-t border-amber-200">
                <input
                  type="checkbox"
                  required
                  checked={formData.sptjm_warga_accepted}
                  onChange={(e) => setFormData({ ...formData, sptjm_warga_accepted: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <span>
                  SAYA MENYETUJUI SURAT PERNYATAAN TANGGUNG JAWAB MUTLAK (SPTJM) INI DAN SIAP BERTANGGUNG JAWAB PENUH.
                </span>
              </label>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={loading || !formData.sptjm_warga_accepted}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Upload size={16} /> Ajukan Data & SPTJM ke Meja Verifikasi RT/Kelurahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: MEJA KERJA VERIFIKASI & REKONSILIASI PETUGAS */}
      {activeTab === 'verifikasi' && isOfficer && (
        <div className="space-y-6">
          {/* KPI Sebaran Wilayah */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500">Total KK Terdata</p>
                <p className="text-2xl font-black text-slate-900">{stats.total_kk}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500">Menunggu Verifikasi</p>
                <p className="text-2xl font-black text-amber-600">{stats.pending_verifikasi}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500">Terverifikasi Kelurahan</p>
                <p className="text-2xl font-black text-emerald-600">{stats.verified_kelurahan}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500">Desil 1 (Ekstrem)</p>
                <p className="text-2xl font-black text-red-600">{stats.desil_1}</p>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari No. KK / Kepala Keluarga..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.status_verifikasi}
              onChange={(e) => setFilters({ ...filters, status_verifikasi: e.target.value })}
              className="text-xs rounded-lg border border-slate-300 p-2 outline-none"
            >
              <option value="">Semua Status</option>
              <option value="MENUNGGU_VERIFIKASI_KELURAHAN">Menunggu Verifikasi</option>
              <option value="VERIFIED_KELURAHAN">Terverifikasi Kelurahan</option>
              <option value="DRAFT_USULAN">Draft Usulan</option>
            </select>

            <select
              value={filters.desil}
              onChange={(e) => setFilters({ ...filters, desil: e.target.value })}
              className="text-xs rounded-lg border border-slate-300 p-2 outline-none"
            >
              <option value="">Semua Desil</option>
              <option value="1">Desil 1</option>
              <option value="2">Desil 2</option>
              <option value="3">Desil 3</option>
              <option value="4">Desil 4</option>
              <option value="5">Desil 5</option>
            </select>
          </div>

          {/* Table Verifikasi */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">No. KK & Nama</th>
                  <th className="p-3.5">Wilayah</th>
                  <th className="p-3.5">Desil Lapangan</th>
                  <th className="p-3.5">Desil Kemensos</th>
                  <th className="p-3.5">SPTJM Warga</th>
                  <th className="p-3.5">Ground Check RT</th>
                  <th className="p-3.5">Status Akhir</th>
                  <th className="p-3.5 text-right">Aksi Meja Kerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {verifikasiList.map((item) => (
                  <tr key={item.id || item.no_kk} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-slate-900">{item.no_kk}</div>
                      <div className="font-semibold text-slate-700">{item.kepala_keluarga}</div>
                    </td>
                    <td className="p-3.5 text-slate-600">RT {item.rt} / RW {item.rw}</td>
                    <td className="p-3.5">{getDesilBadge(item.desil_usulan)}</td>
                    <td className="p-3.5">
                      {item.desil_resmi_pemerintah ? getDesilBadge(item.desil_resmi_pemerintah) : (
                        <span className="text-slate-400 italic">Belum Ada</span>
                      )}
                      <div className="mt-1">{getSyncBadge(item.status_sinkronisasi)}</div>
                    </td>
                    <td className="p-3.5">
                      {item.sptjm_warga_accepted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 size={12} /> Disetujui
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                          Belum SPTJM
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {item.sptjm_verifikator_accepted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          <CheckCircle2 size={12} /> Selesai GC
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Perlu GC
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {item.status_verifikasi === 'VERIFIED_KELURAHAN' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">Terverifikasi</span>
                      ) : item.status_verifikasi === 'MENUNGGU_VERIFIKASI_KELURAHAN' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">Menunggu</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600 font-bold">Draft</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {/* Tombol Ground Check untuk RT/RW */}
                      {(isRT || isRW || isKelurahan) && (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setGroundCheckForm({
                              status_faktual: 'SESUAI_LAPANGAN',
                              catatan_ground_check_rt: item.catatan_ground_check_rt || '',
                              sptjm_verifikator_accepted: !!item.sptjm_verifikator_accepted
                            });
                            setGroundCheckModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-all"
                        >
                          Ground Check RT
                        </button>
                      )}

                      {/* Tombol Rekonsiliasi & Pengesahan untuk Kelurahan */}
                      {isKelurahan && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setReconcileForm({
                                desil_resmi_pemerintah: item.desil_resmi_pemerintah || '',
                                id_dtks_resmi: item.id_dtks_resmi || item.id_dtks_kemensos || '',
                                bansos_diterima_resmi: item.bansos_diterima_resmi || '',
                                status_sinkronisasi: item.status_sinkronisasi || 'SINKRON',
                                catatan_komparasi_kelurahan: item.catatan_komparasi_kelurahan || ''
                              });
                              setReconcileModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all"
                          >
                            Rekonsiliasi
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItem(item);
                              setFinalDesil(item.desil_usulan || 2);
                              setCatatanVerifikasi(item.catatan_verifikasi || '');
                              setVerifyModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
                          >
                            Sahkan
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: GROUND CHECK & SANGGAHAN RT/RW */}
      {groundCheckModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-amber-600" size={20} /> Meja Ground Check & Sanggahan RT/RW
              </h3>
              <button onClick={() => setGroundCheckModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500">No. KK:</span>
                <p className="font-mono font-bold text-slate-800">{selectedItem.no_kk}</p>
              </div>
              <div>
                <span className="text-slate-500">Kepala Keluarga:</span>
                <p className="font-bold text-slate-800">{selectedItem.kepala_keluarga}</p>
              </div>
              <div>
                <span className="text-slate-500">Wilayah:</span>
                <p className="font-semibold text-slate-700">RT {selectedItem.rt} / RW {selectedItem.rw}</p>
              </div>
              <div>
                <span className="text-slate-500">Desil Lapangan (PMT):</span>
                <p className="font-bold text-blue-700">Desil {selectedItem.desil_usulan}</p>
              </div>
            </div>

            {/* Galeri 3 Foto Faktual */}
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-2">Foto Pemeriksaan Lapangan Warga:</span>
              <div className="grid grid-cols-3 gap-2">
                <div className="border rounded p-1 text-center bg-slate-50">
                  <span className="text-[10px] text-slate-500 block mb-1">Tampak Depan</span>
                  {selectedItem.foto_rumah_depan_url ? (
                    <img src={selectedItem.foto_rumah_depan_url} alt="Depan" className="h-28 w-full object-cover rounded" />
                  ) : (
                    <div className="h-28 flex items-center justify-center text-slate-400 text-[10px]">Tidak ada foto</div>
                  )}
                </div>
                <div className="border rounded p-1 text-center bg-slate-50">
                  <span className="text-[10px] text-slate-500 block mb-1">Bagian Dalam</span>
                  {selectedItem.foto_rumah_dalam_url ? (
                    <img src={selectedItem.foto_rumah_dalam_url} alt="Dalam" className="h-28 w-full object-cover rounded" />
                  ) : (
                    <div className="h-28 flex items-center justify-center text-slate-400 text-[10px]">Tidak ada foto</div>
                  )}
                </div>
                <div className="border rounded p-1 text-center bg-slate-50">
                  <span className="text-[10px] text-slate-500 block mb-1">Meteran Listrik</span>
                  {selectedItem.foto_meteran_listrik_url ? (
                    <img src={selectedItem.foto_meteran_listrik_url} alt="Meteran" className="h-28 w-full object-cover rounded" />
                  ) : (
                    <div className="h-28 flex items-center justify-center text-slate-400 text-[10px]">Tidak ada foto</div>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveGroundCheck} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kesesuaian Faktual & Sanggahan Lapangan *
                </label>
                <select
                  value={groundCheckForm.status_faktual}
                  onChange={(e) => setGroundCheckForm({ ...groundCheckForm, status_faktual: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="SESUAI_LAPANGAN">Sesuai Lapangan - Layak Diteruskan</option>
                  <option value="SANGGAHAN_PINDAH">Sanggahan: Warga Sudah Pindah Domisili</option>
                  <option value="SANGGAHAN_MENINGGAL">Sanggahan: Kepala Keluarga Meninggal Dunia / Tidak Ada Ahli Waris</option>
                  <option value="SANGGAHAN_MAMPU">Sanggahan: Kondisi Mampu / Memiliki Mobil / Usaha Besar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Lapangan Hasil Kunjungan RT/RW
                </label>
                <textarea
                  rows={2}
                  value={groundCheckForm.catatan_ground_check_rt}
                  onChange={(e) => setGroundCheckForm({ ...groundCheckForm, catatan_ground_check_rt: e.target.value })}
                  placeholder="Contoh: Telah dicek langsung oleh Ketua RT 003, rumah dinding bilik bambu dan tidak ada kendaraan roda 4."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pakta Integritas Verifikator RT */}
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <label className="flex items-start gap-2.5 text-xs text-blue-950 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={groundCheckForm.sptjm_verifikator_accepted}
                    onChange={(e) => setGroundCheckForm({ ...groundCheckForm, sptjm_verifikator_accepted: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 mt-0.5"
                  />
                  <span>
                    PAKTA INTEGRITAS PETUGAS: Saya menyatakan dengan sesungguhnya telah melakukan pengecekan faktual langsung ke kediaman warga pemohon dan hasil catatan ini dapat dipertanggungjawabkan.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGroundCheckModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading || !groundCheckForm.sptjm_verifikator_accepted}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={14} /> Simpan Hasil Ground Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MEJA REKONSILIASI KELURAHAN (DATA PEMBANDING RESMI) */}
      {reconcileModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RefreshCw className="text-purple-600" size={20} /> Rekonsiliasi Data DTKS & Komparasi Resmi
              </h3>
              <button onClick={() => setReconcileModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
              Admin Kelurahan dapat menyesuaikan data resmi pembanding berdasarkan penelusuran SIKS-NG / Cek Bansos Kemensos terbaru.
            </div>

            <form onSubmit={handleSaveReconcile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Desil Resmi Kemensos / DTSEN
                  </label>
                  <select
                    value={reconcileForm.desil_resmi_pemerintah}
                    onChange={(e) => setReconcileForm({ ...reconcileForm, desil_resmi_pemerintah: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                  >
                    <option value="">-- Belum Ada --</option>
                    <option value="1">Desil 1 (Ekstrem)</option>
                    <option value="2">Desil 2 (Sangat Miskin)</option>
                    <option value="3">Desil 3 (Miskin)</option>
                    <option value="4">Desil 4 (Rentan)</option>
                    <option value="5">Desil 5 (PBI-JK)</option>
                    <option value="6">Desil 6 ke atas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ID DTKS Resmi Kemensos
                  </label>
                  <input
                    type="text"
                    value={reconcileForm.id_dtks_resmi}
                    onChange={(e) => setReconcileForm({ ...reconcileForm, id_dtks_resmi: e.target.value })}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bantuan Resmi yang Sedang Aktif Diterima
                </label>
                <input
                  type="text"
                  value={reconcileForm.bansos_diterima_resmi}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, bansos_diterima_resmi: e.target.value })}
                  placeholder="Contoh: BPNT Sembako Saja, Belum Menerima PKH"
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status Sinkronisasi & Rekomendasi
                </label>
                <select
                  value={reconcileForm.status_sinkronisasi}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, status_sinkronisasi: e.target.value })}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-purple-500 font-bold"
                >
                  <option value="SINKRON">SINKRON (Data Lapangan Sesuai Data Resmi)</option>
                  <option value="ANOMALI_MAMPU">ANOMALI MAMPU (Tercatat Bansos tapi di Lapangan Mampu - Usul Graduasi)</option>
                  <option value="ANOMALI_BELUM_TERDAFTAR">ANOMALI BELUM TERDAFTAR (Sangat Miskin tapi Belum Terdaftar di DTKS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Komparasi Kelurahan
                </label>
                <textarea
                  rows={2}
                  value={reconcileForm.catatan_komparasi_kelurahan}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, catatan_komparasi_kelurahan: e.target.value })}
                  placeholder="Contoh: Telah dicocokkan dengan data SIKS-NG Kemensos periode triwulan berjalan."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReconcileModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check size={14} /> Simpan Sinkronisasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PENGESAHAN STATUS DESIL RESMI OLEH KELURAHAN / LURAH */}
      {verifyModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="text-blue-600" size={20} /> Pengesahan Definitif Desil Keluarga
              </h3>
              <button onClick={() => setVerifyModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500">No. KK:</span>
                <p className="font-mono font-bold text-slate-800">{selectedItem.no_kk}</p>
              </div>
              <div>
                <span className="text-slate-500">Kepala Keluarga:</span>
                <p className="font-bold text-slate-800">{selectedItem.kepala_keluarga}</p>
              </div>
              <div>
                <span className="text-slate-500">Wilayah:</span>
                <p className="font-semibold text-slate-700">RT {selectedItem.rt} / RW {selectedItem.rw}</p>
              </div>
              <div>
                <span className="text-slate-500">Desil PMT Lapangan:</span>
                <p className="font-bold text-blue-700">Desil {selectedItem.desil_usulan}</p>
              </div>
            </div>

            {/* Rekap Hasil Ground Check RT */}
            {selectedItem.catatan_ground_check_rt && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <span className="font-bold text-amber-900 block mb-0.5">Catatan Ground Check RT:</span>
                <p className="text-amber-800">{selectedItem.catatan_ground_check_rt}</p>
              </div>
            )}

            {/* Form Penetapan Desil Akhir */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Penetapan Desil Resmi Kelurahan (1 s/d 10) *
                </label>
                <select
                  value={finalDesil}
                  onChange={(e) => setFinalDesil(Number(e.target.value))}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Desil 1 - Kemiskinan Ekstrem (Prioritas PKH/Sembako)</option>
                  <option value={2}>Desil 2 - Sangat Miskin (Prioritas PKH/Sembako)</option>
                  <option value={3}>Desil 3 - Miskin (Prioritas PKH/Sembako)</option>
                  <option value={4}>Desil 4 - Rentan Miskin (Prioritas PKH/Sembako)</option>
                  <option value={5}>Desil 5 - Hampir Mampu (Batas Usulan PBI-JK)</option>
                  <option value={6}>Desil 6 - Menengah Bawah (Non-Bansos)</option>
                  <option value={7}>Desil 7 - Menengah (Non-Bansos)</option>
                  <option value={8}>Desil 8 - Menengah ke Atas</option>
                  <option value={9}>Desil 9 - Mampu</option>
                  <option value={10}>Desil 10 - Sangat Mampu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Pengesahan / Alasan Penolakan
                </label>
                <textarea
                  rows={2}
                  value={catatanVerifikasi}
                  onChange={(e) => setCatatanVerifikasi(e.target.value)}
                  placeholder="Contoh: Bukti faktual telah diverifikasi oleh Ketua RT dan data sinkron dengan Cek Bansos Kemensos."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleVerifyKelurahan('REJECTED')}
                disabled={loading}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-all flex items-center gap-1"
              >
                <X size={14} /> Tolak Usulan
              </button>
              <button
                type="button"
                onClick={() => handleVerifyKelurahan('VERIFIED_KELURAHAN')}
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center gap-1"
              >
                <Check size={14} /> Sahkan Desil Resmi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
