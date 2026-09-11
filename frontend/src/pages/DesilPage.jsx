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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function DesilPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('kuesioner'); // 'kuesioner' | 'bukti' | 'verifikasi'
  const [loading, setLoading] = useState(false);
  const [familyDesil, setFamilyDesil] = useState(null);
  const [verifikasiList, setVerifikasiList] = useState([]);
  const [stats, setStats] = useState(null);

  // Form Kuesioner DTSEN
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
    id_dtks_kemensos: '',
    bukti_kementerian_url: '',
    nomor_referensi_bukti: ''
  });

  // Filter Verifikasi Kelurahan
  const [filters, setFilters] = useState({
    rt: '',
    rw: '',
    status_verifikasi: '',
    desil: '',
    search: ''
  });

  // Modal Verifikasi Kelurahan
  const [selectedItem, setSelectedItem] = useState(null);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [finalDesil, setFinalDesil] = useState(2);
  const [catatanVerifikasi, setCatatanVerifikasi] = useState('');

  const isStaff = ['superadmin', 'admin_kelurahan', 'admin', 'ketua_rw', 'admin_rw', 'ketua_rt'].includes(user?.role);
  const isKelurahan = ['superadmin', 'admin_kelurahan', 'admin'].includes(user?.role);

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
          ada_anak_sekolah_pip: !!res.data.data.ada_anak_sekolah_pip
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
    if (!isStaff) return;
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
    if (activeTab === 'verifikasi' && isStaff) {
      fetchVerifikasiList();
    }
  }, [activeTab, filters]);

  // Kalkulasi PMT Desil Dinamis di Frontend untuk Preview
  const calculatePreviewDesil = () => {
    if (formData.kepemilikan_mobil) return 8;

    let score = 0;
    if (formData.daya_listrik === 'Tanpa Meteran') score += 2;
    else if (formData.daya_listrik === '450 VA') score += 5;
    else if (formData.daya_listrik === '900 VA') score += 14;
    else if (formData.daya_listrik === '1300 VA') score += 24;
    else score += 30;

    if (formData.status_rumah === 'Bebas Sewa' || formData.status_rumah === 'Menumpang') score += 3;
    else if (formData.status_rumah === 'Sewa/Kontrak') score += 8;
    else score += 16;

    if (formData.sumber_air === 'Sumur Tidak Terlindung') score += 2;
    else if (formData.sumber_air === 'Sumur Terlindung') score += 5;
    else if (formData.sumber_air === 'PDAM/Leding') score += 10;
    else score += 14;

    if (formData.luas_lantai_kategori === '< 8 m2 (Padat)') score += 3;
    else if (formData.luas_lantai_kategori === '8 - 14 m2') score += 8;
    else score += 15;

    if (formData.bahan_bakar_memasak === 'Minyak/Kayu') score += 1;
    else if (formData.bahan_bakar_memasak === 'Gas 3kg') score += 4;
    else score += 10;

    if (formData.kepemilikan_motor === '0 unit') score += 0;
    else if (formData.kepemilikan_motor === '1 unit') score += 5;
    else score += 10;

    if (formData.ada_disabilitas_lansia_tunggal) score -= 6;
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

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/desil/draft', {
        ...formData,
        desil_usulan: previewDesil
      });
      if (res.data.success) {
        alert('Draft kuesioner desil mandiri berhasil disimpan!');
        fetchMyFamilyDesil();
      }
    } catch (err) {
      alert('Gagal menyimpan draft: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran berkas maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, bukti_kementerian_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (!formData.bukti_kementerian_url && !formData.id_dtks_kemensos) {
      alert('Wajib melampirkan berkas bukti (tangkapan layar Cek Bansos / DTSEN BPS) atau ID DTKS Kemensos!');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/desil/submit-update', {
        ...formData,
        desil_usulan: previewDesil
      });
      if (res.data.success) {
        alert('Permohonan verifikasi desil resmi berhasil diajukan ke Kantor Kelurahan!');
        fetchMyFamilyDesil();
      }
    } catch (err) {
      alert('Gagal mengajukan permohonan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
                Standar BPS & Kemensos
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Desil Kesejahteraan Keluarga</h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl">
              Pemeringkatan desil 1–10 berbasis bukti objektif untuk penentuan sasaran Bantuan Sosial (PKH, Sembako/BPNT, PIP, dan PBI-JK) secara transparan dan akuntabel.
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
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('kuesioner')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'kuesioner'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText size={16} /> Kuesioner Indikator Mandiri
        </button>

        <button
          onClick={() => setActiveTab('bukti')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'bukti'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload size={16} /> Pengajuan & Bukti Kementerian
          {familyDesil?.status_verifikasi === 'MENUNGGU_VERIFIKASI_KELURAHAN' && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {isStaff && (
          <button
            onClick={() => setActiveTab('verifikasi')}
            className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'verifikasi'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award size={16} /> Verifikasi Kelurahan & Rekap
            {stats?.pending_verifikasi > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-600 text-white font-bold">
                {stats.pending_verifikasi}
              </span>
            )}
          </button>
        )}
      </div>

      {/* TAB 1: KUESIONER INDIKATOR MANDIRI */}
      {activeTab === 'kuesioner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Kuesioner */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={18} /> Formulir Indikator DTSEN Mandiri
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Data ini diisi sesuai kondisi riil rumah tangga sebagai bahan estimasi Proxy Means Testing (PMT) awal.
              </p>
            </div>

            <form onSubmit={handleSaveDraft} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Daya Listrik */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Zap size={14} className="text-amber-500" /> Daya Listrik Terpasang
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

                {/* Status Kepemilikan Rumah */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Home size={14} className="text-blue-500" /> Status Kepemilikan Rumah
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

                {/* Sumber Air Minum */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Droplet size={14} className="text-cyan-500" /> Sumber Air Minum Utama
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

                {/* Luas Lantai per Kapita */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Users size={14} className="text-indigo-500" /> Luas Lantai per Anggota Keluarga
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

                {/* Bahan Bakar Memasak */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Flame size={14} className="text-red-500" /> Bahan Bakar Memasak Utama
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

                {/* Aset Sepeda Motor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Car size={14} className="text-slate-600" /> Kepemilikan Sepeda Motor
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
              </div>

              {/* Checkboxes Khusus */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.kepemilikan_mobil}
                    onChange={(e) => setFormData({ ...formData, kepemilikan_mobil: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-red-600">
                    Keluarga memiliki mobil pribadi / kendaraan roda 4
                  </span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ada_disabilitas_lansia_tunggal}
                    onChange={(e) => setFormData({ ...formData, ada_disabilitas_lansia_tunggal: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Terdapat penyandang disabilitas berat atau lansia sebatang kara dalam keluarga</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.ada_anak_sekolah_pip}
                    onChange={(e) => setFormData({ ...formData, ada_anak_sekolah_pip: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Terdapat anak usia sekolah (6–21 tahun) aktif sekolah (Calon Penerima PIP)</span>
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  <Check size={16} /> Simpan Draft Usulan Mandiri
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
                <strong>Catatan Penting:</strong> Agar desil ini resmi disahkan oleh Kelurahan dan masuk dalam kuota bantuan sosial, silakan buka tab <strong>"Pengajuan & Bukti Kementerian"</strong> untuk melampirkan tangkapan layar bukti resmi.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENGAJUAN & BUKTI KEMENTERIAN */}
      {activeTab === 'bukti' && (
        <div className="max-w-3xl mx-auto bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Upload className="text-blue-600" size={18} /> Permohonan Update Desil & Bukti Kementerian
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Lampirkan bukti perubahan mandiri yang Anda peroleh dari portal Cek Bansos Kemensos atau DTSEN BPS agar Admin Kelurahan dapat memverifikasi dan mengesahkan status desil resmi keluarga Anda.
            </p>
          </div>

          {/* Status Tracker */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-3">Status Permohonan Terakhir:</h4>
            <div className="flex items-center gap-3">
              {familyDesil?.status_verifikasi === 'VERIFIED_KELURAHAN' ? (
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 size={18} /> RESMI TERVERIFIKASI KELURAHAN (Desil {familyDesil.desil_saat_ini})
                </div>
              ) : familyDesil?.status_verifikasi === 'MENUNGGU_VERIFIKASI_KELURAHAN' ? (
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <Clock size={18} className="animate-spin" /> MENUNGGU VERIFIKASI ADMIN KELURAHAN (Desil Usulan: {familyDesil.desil_usulan})
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <HelpCircle size={18} /> Belum Ada Pengajuan Resmi (Status: Draft Usulan)
                </div>
              )}
            </div>
            {familyDesil?.catatan_verifikasi && (
              <p className="text-xs text-slate-500 mt-2 bg-white p-2.5 rounded border border-slate-200">
                <strong>Catatan Petugas:</strong> {familyDesil.catatan_verifikasi}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            {/* ID DTKS Kemensos */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor ID DTKS Kemensos (Jika Ada)
              </label>
              <input
                type="text"
                placeholder="Contoh: 3273010101900001 / ID-DTKS-XXXX"
                value={formData.id_dtks_kemensos || ''}
                onChange={(e) => setFormData({ ...formData, id_dtks_kemensos: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Nomor Referensi / Tiket Pengaduan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Tiket / Referensi Bukti Perubahan Mandiri
              </label>
              <input
                type="text"
                placeholder="Contoh: BPS-PIP-2026-XXXX atau CekBansos Ref"
                value={formData.nomor_referensi_bukti || ''}
                onChange={(e) => setFormData({ ...formData, nomor_referensi_bukti: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Upload Tangkapan Layar Bukti */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unggah Foto Bukti (Tangkapan Layar Cek Bansos / DTSEN BPS / Surat DTKS) *
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="w-full text-xs rounded-lg border border-slate-300 p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Format gambar JPG, PNG, atau PDF. Maksimal 5 MB.</p>
            </div>

            {formData.bukti_kementerian_url && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2">Pratinjau Berkas Terunggah:</p>
                <img
                  src={formData.bukti_kementerian_url}
                  alt="Bukti Kementerian"
                  className="max-h-60 rounded border border-slate-300 object-contain mx-auto"
                />
              </div>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Upload size={16} /> Ajukan Verifikasi Resmi ke Kelurahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: VERIFIKASI & AUDIT KELURAHAN (PETUGAS) */}
      {activeTab === 'verifikasi' && isStaff && (
        <div className="space-y-6">
          {/* KPI Mini */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500">Total KK Terdaftar</p>
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
              <option value="VERIFIED_KELURAHAN">Terverifikasi</option>
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

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3.5">No. Kartu Keluarga</th>
                  <th className="p-3.5">Kepala Keluarga</th>
                  <th className="p-3.5">Wilayah</th>
                  <th className="p-3.5">Desil Usulan</th>
                  <th className="p-3.5">Desil Resmi</th>
                  <th className="p-3.5">Bukti Kementerian</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {verifikasiList.map((item) => (
                  <tr key={item.id || item.no_kk} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{item.no_kk}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{item.kepala_keluarga}</td>
                    <td className="p-3.5 text-slate-600">RT {item.rt} / RW {item.rw}</td>
                    <td className="p-3.5">{getDesilBadge(item.desil_usulan)}</td>
                    <td className="p-3.5">{getDesilBadge(item.desil_saat_ini)}</td>
                    <td className="p-3.5">
                      {item.bukti_kementerian_url ? (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setVerifyModalOpen(true);
                          }}
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Eye size={14} /> Lihat Bukti
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">Belum Ada</span>
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
                    <td className="p-3.5 text-right">
                      {isKelurahan && (
                        <button
                          onClick={() => {
                            setSelectedItem(item);
                            setFinalDesil(item.desil_usulan || 2);
                            setVerifyModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all"
                        >
                          Verifikasi
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI KELURAHAN */}
      {verifyModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="text-blue-600" size={20} /> Verifikasi Pengesahan Desil Keluarga
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
                <span className="text-slate-500">Desil Usulan Mandiri:</span>
                <p className="font-bold text-blue-700">Desil {selectedItem.desil_usulan}</p>
              </div>
            </div>

            {/* Validasi Silang Kementerian */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-blue-900">Validasi Silang Portal Resmi:</span>
              <div className="flex gap-2">
                <a
                  href={`https://cekbansos.kemensos.go.id/`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded text-xs font-bold bg-white text-blue-700 border border-blue-300 hover:bg-blue-100 flex items-center gap-1 shadow-sm"
                >
                  <ExternalLink size={12} /> Cek Bansos Kemensos
                </a>
                <a
                  href={`https://dtsen-form.bps.go.id/indonesia-pintar`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded text-xs font-bold bg-white text-blue-700 border border-blue-300 hover:bg-blue-100 flex items-center gap-1 shadow-sm"
                >
                  <ExternalLink size={12} /> DTSEN BPS
                </a>
              </div>
            </div>

            {/* Berkas Bukti yang Diunggah */}
            {selectedItem.bukti_kementerian_url ? (
              <div>
                <span className="block text-xs font-bold text-slate-700 mb-1">Bukti Dokumen Terlampir:</span>
                <img
                  src={selectedItem.bukti_kementerian_url}
                  alt="Bukti Kementerian"
                  className="max-h-60 rounded border border-slate-300 object-contain mx-auto"
                />
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Tidak ada berkas gambar yang dilampirkan.</p>
            )}

            {/* Form Penetapan Desil Akhir */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
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
                  placeholder="Contoh: Bukti status DTKS terverifikasi sah melalui Cek Bansos Kemensos."
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

