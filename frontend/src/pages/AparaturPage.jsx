import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Phone,
  MessageCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Users,
  HeartPulse,
  User,
  ExternalLink,
  Info
} from 'lucide-react';

export default function AparaturPage() {
  const { user } = useAuth();
  const [aparaturList, setAparaturList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelurahan, setSelectedKelurahan] = useState(user?.kelurahan || 'Cikole');

  // Modal State for Admin Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    kelurahan: user?.kelurahan || 'Cikole',
    kecamatan: user?.kecamatan || 'Cikole',
    kota: 'Kota Sukabumi',
    kategori: 'KELURAHAN',
    jabatan: '',
    wilayah_rw: '',
    wilayah_rt: '',
    nama_posyandu: '',
    nik_pejabat: '',
    nama_pejabat: '',
    nip_nrp: '',
    pangkat_golongan: '',
    no_telp: '',
    no_wa: '',
    email: '',
    alamat_kantor: '',
    jam_layanan: 'Senin - Jumat, 08.00 - 15.00 WIB',
    is_active: 1
  });

  // Candidate Search State for NIK auto-fill
  const [candidateQuery, setCandidateQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);

  const normalizedRole = user?.role === 'admin' ? 'admin_kelurahan' : (user?.role || 'warga');
  const isAdmin = ['admin_kelurahan', 'superadmin', 'camat', 'lurah', 'admin'].includes(normalizedRole);

  const fetchAparatur = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/aparatur', {
        params: {
          kelurahan: selectedKelurahan,
          kategori: activeTab === 'ALL' ? undefined : activeTab,
          search: searchQuery || undefined
        }
      });
      if (res.data?.success) {
        setAparaturList(res.data.data || []);
      }
    } catch (err) {
      console.error('Gagal memuat aparatur:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAparatur();
  }, [activeTab, searchQuery, selectedKelurahan]);

  // Search Warga Candidate Debounce
  useEffect(() => {
    if (!candidateQuery || candidateQuery.length < 2) {
      setCandidates([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setCandidateLoading(true);
        const res = await api.get('/api/aparatur/search-candidates', {
          params: { q: candidateQuery }
        });
        if (res.data?.success) {
          setCandidates(res.data.data || []);
        }
      } catch (err) {
        console.error('Search candidate error:', err);
      } finally {
        setCandidateLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [candidateQuery]);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        kelurahan: item.kelurahan || 'Cikole',
        kecamatan: item.kecamatan || 'Cikole',
        kota: item.kota || 'Kota Sukabumi',
        kategori: item.kategori || 'KELURAHAN',
        jabatan: item.jabatan || '',
        wilayah_rw: item.wilayah_rw || '',
        wilayah_rt: item.wilayah_rt || '',
        nama_posyandu: item.nama_posyandu || '',
        nik_pejabat: item.nik_pejabat || '',
        nama_pejabat: item.nama_pejabat || '',
        nip_nrp: item.nip_nrp || '',
        pangkat_golongan: item.pangkat_golongan || '',
        no_telp: item.no_telp || '',
        no_wa: item.no_wa || '',
        email: item.email || '',
        alamat_kantor: item.alamat_kantor || '',
        jam_layanan: item.jam_layanan || 'Senin - Jumat, 08.00 - 15.00 WIB',
        is_active: item.is_active !== undefined ? item.is_active : 1
      });
    } else {
      setEditingItem(null);
      setFormData({
        kelurahan: selectedKelurahan || 'Cikole',
        kecamatan: 'Cikole',
        kota: 'Kota Sukabumi',
        kategori: 'KELURAHAN',
        jabatan: '',
        wilayah_rw: '',
        wilayah_rt: '',
        nama_posyandu: '',
        nik_pejabat: '',
        nama_pejabat: '',
        nip_nrp: '',
        pangkat_golongan: '',
        no_telp: '',
        no_wa: '',
        email: '',
        alamat_kantor: '',
        jam_layanan: 'Senin - Jumat, 08.00 - 15.00 WIB',
        is_active: 1
      });
    }
    setCandidateQuery('');
    setCandidates([]);
    setFeedbackMsg({ type: '', text: '' });
    setIsModalOpen(true);
  };

  const handleSelectCandidate = (warga) => {
    setFormData(prev => ({
      ...prev,
      nik_pejabat: warga.nik,
      nama_pejabat: warga.nama,
      wilayah_rw: warga.rw || prev.wilayah_rw,
      wilayah_rt: warga.rt || prev.wilayah_rt,
      no_wa: warga.no_telepon || prev.no_wa,
      alamat_kantor: warga.alamat ? `Kediaman Pejabat: ${warga.alamat}` : prev.alamat_kantor
    }));
    setCandidates([]);
    setCandidateQuery('');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setFeedbackMsg({ type: '', text: '' });

    try {
      if (editingItem) {
        await api.put(`/api/aparatur/${editingItem.id}`, formData);
        setFeedbackMsg({ type: 'success', text: 'Data aparatur berhasil diperbarui!' });
      } else {
        await api.post('/api/aparatur', formData);
        setFeedbackMsg({ type: 'success', text: 'Aparatur baru berhasil ditambahkan!' });
      }
      setTimeout(() => {
        setIsModalOpen(false);
        fetchAparatur();
      }, 800);
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Gagal menyimpan data.'
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin ingin menghapus ${item.nama_pejabat} (${item.jabatan})?`)) {
      return;
    }
    try {
      await api.delete(`/api/aparatur/${item.id}`);
      fetchAparatur();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus data aparatur.');
    }
  };

  const getKategoriBadge = (kategori) => {
    switch (kategori) {
      case 'KEAMANAN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">🛡️ Mitra Keamanan (Babinsa / Bhabinkamtibmas)</span>;
      case 'KELURAHAN':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">🏛️ Aparatur Kelurahan</span>;
      case 'RW':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">🏘️ Pimpinan RW</span>;
      case 'RT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">🏡 Ketua RT Setempat</span>;
      case 'POSYANDU':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">👶 Kader Posyandu</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">{kategori}</span>;
    }
  };

  const formatWhatsAppUrl = (noWa, nama, jabatan) => {
    let cleanWa = (noWa || '').replace(/\D/g, '');
    if (cleanWa.startsWith('0')) {
      cleanWa = '62' + cleanWa.slice(1);
    }
    const message = encodeURIComponent(`Sampurasun Yth. Bapak/Ibu ${nama} (${jabatan}), perkenalkan saya warga Kelurahan ${selectedKelurahan}. Mohon informasi dan koordinasi terkait pelayanan warga.`);
    return `https://wa.me/${cleanWa}?text=${message}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-cyan-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-8 h-8 text-emerald-300" />
              <h1 className="text-2xl font-bold">Direktori Aparatur & Kontak Pelayanan Wilayah</h1>
            </div>
            <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
              Pusat informasi resmi struktur organisasi kelurahan, Mitra Keamanan (Babinsa TNI & Bhabinkamtibmas Polri), 
              Ketua RT/RW, dan Posyandu. Terhubung langsung via WhatsApp dinamis & verifikasi terpercaya.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Kelurahan */}
            <select
              value={selectedKelurahan}
              onChange={(e) => setSelectedKelurahan(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="Cikole" className="text-gray-900">Kelurahan Cikole (Sukabumi)</option>
              <option value="Kebonjati" className="text-gray-900">Kelurahan Kebonjati (Bandung)</option>
            </select>

            {isAdmin && (
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95"
              >
                <Plus size={18} />
                <span>Tambah / Tunjuk Pejabat</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'ALL', label: 'Semua Pejabat' },
            { id: 'KEAMANAN', label: '🛡️ Babinsa & Bhabinkamtibmas' },
            { id: 'KELURAHAN', label: '🏛️ Kelurahan' },
            { id: 'RW', label: '🏘️ Ketua RW' },
            { id: 'RT', label: '🏡 Ketua RT' },
            { id: 'POSYANDU', label: '👶 Posyandu' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Cari nama, jabatan, atau nomor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Aparatur Card Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-3 text-sm text-gray-500">Memuat direktori aparatur resmi...</p>
        </div>
      ) : aparaturList.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-700">Belum Ada Data Aparatur</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Tidak ditemukan data aparatur untuk kategori atau kata kunci yang dipilih.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {aparaturList.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5">
                {/* Header Card: Category Badge & Actions */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>{getKategoriBadge(item.kategori)}</div>
                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit Data"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Data"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Profile Title & Position */}
                <h3 className="text-lg font-bold text-gray-800 leading-snug">{item.nama_pejabat}</h3>
                <p className="text-xs font-medium text-emerald-700 mt-0.5">{item.jabatan}</p>

                {/* NIP/NRP or Pangkat */}
                {(item.nip_nrp || item.pangkat_golongan) && (
                  <p className="text-[11px] text-gray-500 mt-1">
                    {item.pangkat_golongan && <span>{item.pangkat_golongan} • </span>}
                    {item.nip_nrp && <span>Identitas: {item.nip_nrp}</span>}
                  </p>
                )}

                {/* Scope Wilayah */}
                {(item.wilayah_rw || item.wilayah_rt || item.nama_posyandu) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.wilayah_rw && (
                      <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        Wilayah RW {item.wilayah_rw}
                      </span>
                    )}
                    {item.wilayah_rt && (
                      <span className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                        Wilayah RT {item.wilayah_rt}
                      </span>
                    )}
                    {item.nama_posyandu && (
                      <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                        {item.nama_posyandu}
                      </span>
                    )}
                  </div>
                )}

                {/* Office Info & Hours */}
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                  {item.alamat_kantor && (
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{item.alamat_kantor}</span>
                    </div>
                  )}
                  {item.jam_layanan && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400 shrink-0" />
                      <span>{item.jam_layanan}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Quick Contact Bar */}
              <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="text-xs">
                  <span className="text-gray-400 block text-[10px]">Kontak WhatsApp</span>
                  <span className="font-semibold text-gray-800">{item.no_wa}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.no_telp && (
                    <a
                      href={`tel:${item.no_telp}`}
                      className="p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl border border-gray-200 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Panggilan Telepon"
                    >
                      <Phone size={14} />
                    </a>
                  )}
                  <a
                    href={formatWhatsAppUrl(item.no_wa, item.nama_pejabat, item.jabatan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                  >
                    <MessageCircle size={15} />
                    <span>Chat WA</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Admin Management Modal (Tambah / Edit Pejabat) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 size={20} className="text-emerald-300" />
                  <h2 className="text-lg font-bold">
                    {editingItem ? 'Edit Data Aparatur / Pejabat' : 'Penugasan / Tambah Aparatur Wilayah'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/70 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Feedback Alert */}
              {feedbackMsg.text && (
                <div className={`p-4 text-xs font-medium ${feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-red-50 text-red-800 border-b border-red-200'}`}>
                  {feedbackMsg.text}
                </div>
              )}

              {/* Modal Form */}
              <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
                {/* Kategori & Jabatan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Kategori Peran *</label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="KELURAHAN">🏛️ Aparatur Kelurahan</option>
                      <option value="KEAMANAN">🛡️ Mitra Keamanan (Babinsa / Bhabinkamtibmas)</option>
                      <option value="RW">🏘️ Pimpinan RW</option>
                      <option value="RT">🏡 Pimpinan RT</option>
                      <option value="POSYANDU">👶 Kader Posyandu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nama Jabatan *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Babinsa TNI AD / Ketua RT 001"
                      value={formData.jabatan}
                      onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                {/* Fitur Cerdas: Autofill dari Warga Setempat untuk RT/RW/Kader */}
                {['RT', 'RW', 'POSYANDU'].includes(formData.kategori) && (
                  <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs">
                      <UserCheck size={16} />
                      <span>Tunjuk dari Database Warga Setempat (Otomatis & Terverifikasi)</span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      Cari nama atau NIK warga untuk otomatis mengisi nama lengkap, RT/RW domisili, dan nomor WhatsApp.
                    </p>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-2.5 text-emerald-600" />
                      <input
                        type="text"
                        placeholder="Ketik nama atau NIK warga..."
                        value={candidateQuery}
                        onChange={(e) => setCandidateQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-emerald-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                      />
                      {candidateLoading && (
                        <div className="absolute right-3 top-2.5 text-xs text-emerald-600 animate-pulse">
                          Mencari...
                        </div>
                      )}
                    </div>

                    {/* Candidate Suggestion Dropdown */}
                    {candidates.length > 0 && (
                      <div className="max-h-36 overflow-y-auto bg-white border border-emerald-200 rounded-lg divide-y divide-gray-100 shadow-md">
                        {candidates.map(c => (
                          <div
                            key={c.nik}
                            onClick={() => handleSelectCandidate(c)}
                            className="p-2 hover:bg-emerald-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                          >
                            <div>
                              <span className="font-semibold text-gray-800">{c.nama}</span>
                              <span className="text-gray-500 text-[11px] ml-2">NIK: {c.nik}</span>
                            </div>
                            <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              RT {c.rt}/RW {c.rw}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Nama Pejabat & NIK/NRP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nama Pejabat *</label>
                    <input
                      type="text"
                      placeholder="Nama lengkap beserta gelar"
                      value={formData.nama_pejabat}
                      onChange={(e) => setFormData({ ...formData, nama_pejabat: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {['KEAMANAN', 'KELURAHAN'].includes(formData.kategori) ? 'NIP / NRP / Pangkat' : 'NIK Pejabat'}
                    </label>
                    <input
                      type="text"
                      placeholder={['KEAMANAN', 'KELURAHAN'].includes(formData.kategori) ? 'Contoh: 31980245120876' : '16 Digit NIK'}
                      value={['KEAMANAN', 'KELURAHAN'].includes(formData.kategori) ? formData.nip_nrp : formData.nik_pejabat}
                      onChange={(e) => {
                        if (['KEAMANAN', 'KELURAHAN'].includes(formData.kategori)) {
                          setFormData({ ...formData, nip_nrp: e.target.value });
                        } else {
                          setFormData({ ...formData, nik_pejabat: e.target.value });
                        }
                      }}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Wilayah RT/RW & Nama Posyandu */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Wilayah RW</label>
                    <input
                      type="text"
                      placeholder="Contoh: 001"
                      value={formData.wilayah_rw}
                      onChange={(e) => setFormData({ ...formData, wilayah_rw: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Wilayah RT</label>
                    <input
                      type="text"
                      placeholder="Contoh: 001"
                      value={formData.wilayah_rt}
                      onChange={(e) => setFormData({ ...formData, wilayah_rt: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nama Posyandu (Opsional)</label>
                    <input
                      type="text"
                      placeholder="Posyandu Melati"
                      value={formData.nama_posyandu}
                      onChange={(e) => setFormData({ ...formData, nama_posyandu: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Kontak WhatsApp & Telepon Kantor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Nomor WhatsApp Resmi *</label>
                    <input
                      type="text"
                      placeholder="081234567890"
                      value={formData.no_wa}
                      onChange={(e) => setFormData({ ...formData, no_wa: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Telepon Kantor / Siaga</label>
                    <input
                      type="text"
                      placeholder="0266-221133"
                      value={formData.no_telp}
                      onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Alamat & Jam Layanan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Alamat Kantor / Pos Pelayanan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Balai Warga RW 001"
                      value={formData.alamat_kantor}
                      onChange={(e) => setFormData({ ...formData, alamat_kantor: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Jam Operasional / Layanan</label>
                    <input
                      type="text"
                      placeholder="Senin - Jumat, 08.00 - 15.00 WIB"
                      value={formData.jam_layanan}
                      onChange={(e) => setFormData({ ...formData, jam_layanan: e.target.value })}
                      className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Status Aktif */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active_check"
                    checked={formData.is_active === 1}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="is_active_check" className="text-gray-700 font-semibold cursor-pointer">
                    Pejabat / Aparatur Aktif Bertugas
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={modalLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50"
                  >
                    {modalLoading ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambahkan Pejabat'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
