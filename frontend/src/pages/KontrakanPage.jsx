import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Building2, 
  KeyRound, 
  Users, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  MessageSquare, 
  FileText, 
  Check, 
  Clock, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function KontrakanPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('daftar'); // 'daftar' | 'status_saya' | 'tambah' | 'tatatertib'
  const [hunianList, setHunianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Form State
  const [formData, setFormData] = useState({
    nama_hunian: '',
    jenis_hunian: 'Rumah Kontrakan',
    alamat: '',
    rt: user?.rt || '001',
    rw: user?.rw || '001',
    jumlah_kamar_pintu: 1,
    jumlah_penghuni_aktif: 1,
    jumlah_penghuni_pelajar: 0,
    jumlah_penghuni_pekerja: 1,
    nama_pemilik: user?.nama || '',
    no_kontak_pemilik: user?.no_hp || '',
    apakah_pemilik_tinggal_di_rt: 1,
    alamat_pemilik: '',
    kepatuhan_wajib_lapor_24jam: 1
  });

  const fetchHunian = async () => {
    try {
      setLoading(true);
      const res = await api.get('/fasilitas/hunian-sewa');
      if (res.data) {
        setHunianList(res.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data hunian sewa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHunian();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.post('/fasilitas/hunian-sewa', formData);
      setFeedback({
        type: 'success',
        message: res.message || 'Data kontrakan/kos berhasil didaftarkan! Ketua RT telah menerima notifikasi registrasi.'
      });
      // Reset form
      setFormData({
        nama_hunian: '',
        jenis_hunian: 'Rumah Kontrakan',
        alamat: '',
        rt: user?.rt || '001',
        rw: user?.rw || '001',
        jumlah_kamar_pintu: 1,
        jumlah_penghuni_aktif: 1,
        jumlah_penghuni_pelajar: 0,
        jumlah_penghuni_pekerja: 1,
        nama_pemilik: user?.nama || '',
        no_kontak_pemilik: user?.no_hp || '',
        apakah_pemilik_tinggal_di_rt: 1,
        alamat_pemilik: '',
        kepatuhan_wajib_lapor_24jam: 1
      });
      fetchHunian();
      setActiveTab('daftar');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Gagal mendaftarkan hunian sewa. Pastikan data lengkap.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLaporWhatsAppRT = (hunian) => {
    const text = encodeURIComponent(
      `Halo Bapak/Ibu Ketua RT ${hunian.rt || user?.rt || '001'} / RW ${hunian.rw || user?.rw || '001'} Kelurahan Kebonjati.\n\n` +
      `Saya ingin melaporkan informasi penghuni sewa/tamu kontrakan sesuai ketentuan Wajib Lapor 1x24 Jam:\n` +
      `• Nama Hunian/Kontrakan: ${hunian.nama_hunian}\n` +
      `• Alamat: ${hunian.alamat}\n` +
      `• Pemilik/Pengelola: ${hunian.nama_pemilik} (${hunian.no_kontak_pemilik})\n` +
      `• Jumlah Penghuni: ${hunian.jumlah_penghuni_aktif || 1} orang\n\n` +
      `Mohon dicatat dalam buku register kependudukan lingkungan RT. Terima kasih!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredHunian = hunianList.filter(item => {
    const matchesSearch = item.nama_hunian?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.alamat?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.nama_pemilik?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesJenis = filterJenis === 'ALL' || item.jenis_hunian === filterJenis;
    return matchesSearch && matchesJenis;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <KeyRound size={14} className="text-emerald-400" />
              <span>Tertib Hunian & Wajib Lapor RT/RW 1x24 Jam</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Rumah Sewa, Kontrakan & Kos-Kosan
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Layanan terpadu bagi warga pemilik kontrakan untuk mendaftarkan unit sewa, serta bagi penyewa/pengontrak untuk memastikan domisili tercatat resmi dan tertib administrasi di Kelurahan Kebonjati.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="text-center sm:text-left pr-4 sm:border-r border-white/20">
              <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-semibold block">Total Terdata</span>
              <span className="text-2xl sm:text-3xl font-black text-white">{hunianList.length} Unit</span>
            </div>
            <div className="text-center sm:text-left">
              <span className="text-[10px] uppercase tracking-wider text-emerald-200 font-semibold block">Kepatuhan Wajib Lapor</span>
              <span className="text-sm font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                <ShieldCheck size={16} /> 100% Terintegrasi RT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      <AnimatePresence>
        {feedback.message && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium border ${
              feedback.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant pb-2">
        <button
          onClick={() => setActiveTab('daftar')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'daftar'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Building2 size={16} />
          <span>Daftar Rumah Sewa Lingkungan</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/20 font-mono">
            {filteredHunian.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tambah')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tambah'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <Plus size={16} />
          <span>Daftarkan Kontrakan/Kos Baru</span>
        </button>

        <button
          onClick={() => setActiveTab('tatatertib')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tatatertib'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          <FileText size={16} />
          <span>Tata Tertib & Wajib Lapor RT</span>
        </button>
      </div>

      {/* TAB 1: DAFTAR UNIT KONTRAKAN & KOS */}
      {activeTab === 'daftar' && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60" size={16} />
              <input
                type="text"
                placeholder="Cari nama hunian, alamat, atau nama pemilik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-container-high/40 border border-outline-variant rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="px-3 py-2 bg-surface-container-high/40 border border-outline-variant rounded-xl text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Semua Jenis Hunian</option>
                <option value="Rumah Kontrakan">Rumah Kontrakan</option>
                <option value="Kos-Kosan">Kos-Kosan</option>
                <option value="Paviliun">Paviliun</option>
              </select>
            </div>
          </div>

          {/* LIST CARDS */}
          {loading ? (
            <div className="py-12 text-center text-xs text-on-surface-variant">
              Memuat data hunian sewa...
            </div>
          ) : filteredHunian.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <Home size={24} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Belum Ada Unit Kontrakan/Kos yang Terdaftar</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Jika Anda memiliki rumah kontrakan atau kamar kos yang disewakan di wilayah ini, silakan daftarkan melalui tab &ldquo;Daftarkan Kontrakan/Kos Baru&rdquo;.
              </p>
              <button
                onClick={() => setActiveTab('tambah')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                <Plus size={14} /> Daftarkan Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredHunian.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">
                        <Home size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.nama_hunian}</h4>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                          {item.jenis_hunian}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {item.status_verifikasi || 'TERVERIFIKASI'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <span>{item.alamat} &bull; RT {item.rt} / RW {item.rw}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-slate-400 flex-shrink-0" />
                      <span>
                        Kapasitas: <strong>{item.jumlah_kamar_pintu} Pintu/Kamar</strong> &bull; Penghuni Aktif: <strong>{item.jumlah_penghuni_aktif} Jiwa</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400 flex-shrink-0" />
                      <span>
                        Pemilik: <strong>{item.nama_pemilik}</strong> ({item.no_kontak_pemilik || '-'})
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      <span>Wajib Lapor 1x24 Jam Aktif</span>
                    </div>
                    <button
                      onClick={() => handleLaporWhatsAppRT(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold transition-colors"
                      title="Lapor Tamu/Penyewa ke Ketua RT via WhatsApp"
                    >
                      <MessageSquare size={13} />
                      <span>Lapor RT</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDAFTARAN RUMAH KONTRAKAN / KOS */}
      {activeTab === 'tambah' && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Form Pendaftaran Hunian Sewa Warga</h2>
              <p className="text-xs text-slate-500">
                Daftarkan rumah kontrakan, kamar kos, atau paviliun yang Anda miliki agar tercatat dalam buku inventaris wilayah RT/RW dan mendapatkan dukungan layanan keamanan lingkungan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Hunian / Kontrakan *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kontrakan Berkah Barokah"
                    value={formData.nama_hunian}
                    onChange={(e) => setFormData({ ...formData, nama_hunian: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Jenis Hunian *</label>
                  <select
                    value={formData.jenis_hunian}
                    onChange={(e) => setFormData({ ...formData, jenis_hunian: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Rumah Kontrakan">Rumah Kontrakan (1 Rumah Utuh)</option>
                    <option value="Kos-Kosan">Kos-Kosan (Kamar-kamar)</option>
                    <option value="Paviliun">Paviliun / Rumah Petak</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Alamat Lengkap Hunian Sewa *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Jl. Pelabuhan II No. 45, Gg. Mesjid"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Wilayah RT *</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={formData.rt}
                    onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 text-center font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Wilayah RW *</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    value={formData.rw}
                    onChange={(e) => setFormData({ ...formData, rw: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 text-center font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Jml Pintu/Kamar</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.jumlah_kamar_pintu}
                    onChange={(e) => setFormData({ ...formData, jumlah_kamar_pintu: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 text-center font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Jml Penghuni</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.jumlah_penghuni_aktif}
                    onChange={(e) => setFormData({ ...formData, jumlah_penghuni_aktif: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 text-center font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nama Pemilik / Pengelola *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap pemilik"
                    value={formData.nama_pemilik}
                    onChange={(e) => setFormData({ ...formData, nama_pemilik: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nomor WhatsApp Pemilik *</label>
                  <input
                    type="text"
                    required
                    placeholder="0812xxxxxxxx"
                    value={formData.no_kontak_pemilik}
                    onChange={(e) => setFormData({ ...formData, no_kontak_pemilik: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-outline-variant bg-surface-container-high/20 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* CHECKBOX KOMITMEN 1x24 JAM */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3">
                <input
                  type="checkbox"
                  id="wajibLapor"
                  checked={formData.kepatuhan_wajib_lapor_24jam === 1}
                  onChange={(e) => setFormData({ ...formData, kepatuhan_wajib_lapor_24jam: e.target.checked ? 1 : 0 })}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="wajibLapor" className="text-xs text-emerald-950 font-medium">
                  <strong>Komitmen Tertib Administrasi:</strong> Bersedia mewajibkan setiap penghuni/penyewa baru untuk menyerahkan salinan identitas (KTP) dan melaporkan kedatangan dalam 1x24 jam kepada Ketua RT setempat.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('daftar')}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Data Kontrakan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: TATA TERTIB & WAJIB LAPOR 1X24 JAM */}
      {activeTab === 'tatatertib' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Ketentuan Bagi Pemilik Kontrakan</h3>
                <p className="text-[11px] text-slate-500">Kewajiban Pengelola Hunian Non-Permanen</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">1</span>
                <span><strong>Pencatatan Identitas:</strong> Wajib meminta fotokopi KTP dan Kartu Keluarga setiap calon penyewa sebelum kunci diserahkan.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">2</span>
                <span><strong>Lapor 1x24 Jam ke RT:</strong> Melaporkan data identitas penyewa ke Ketua RT baik secara langsung maupun melalui fitur WhatsApp di aplikasi ini.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">3</span>
                <span><strong>Iuran Lingkungan:</strong> Menegaskan pembayaran iuran kebersihan dan keamanan lingkungan RT sesuai kesepakatan warga.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">4</span>
                <span><strong>Menjaga Ketertiban:</strong> Memastikan penyewa tidak melakukan kegiatan yang mengganggu ketenangan tetangga dan mematuhi norma sosial setempat.</span>
              </li>
            </ul>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-outline-variant">
              <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hak & Kewajiban Penyewa / Pengontrak</h3>
                <p className="text-[11px] text-slate-500">Ketentuan Warga Pendatang & Domisili Sementara</p>
              </div>
            </div>

            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">1</span>
                <span><strong>Penyambutan Hangat:</strong> Berhak mendapatkan perlindungan keamanan dan keramahan dari seluruh warga lingkungan RT.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">2</span>
                <span><strong>Surat Domisili:</strong> Berhak mengajukan Surat Keterangan Domisili Tinggal Sementara dari RT/Kelurahan untuk keperluan kerja atau sekolah.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">3</span>
                <span><strong>Jam Bertamu:</strong> Mematuhi jam bertamu lingkungan maksimal pukul 22:00 WIB demi kenyamanan warga sekitar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">4</span>
                <span><strong>Tamu Menginap:</strong> Jika menerima tamu keluarga yang menginap lebih dari 1x24 jam, wajib mengabari Ketua RT setempat.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

