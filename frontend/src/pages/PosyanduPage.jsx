import { useState, useEffect } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
import DataTable from '../components/ui/DataTable';
import { Loader2, Baby, AlertCircle, CheckCircle, Info, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Baby, 
  HeartPulse, 
  Activity, 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Filter, 
  History, 
  UserPlus, 
  ShieldAlert, 
  ChevronRight,
  TrendingUp,
  Award,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PosyanduPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isOfficer = user && ['kader_posyandu', 'ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'].includes(user.role);

  // Tab State: 'balita' | 'lansia'
  const [activeTab, setActiveTab] = useState('balita');

  // Common UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterRT, setFilterRT] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
  // ---------------------------------------------------------------------------
  // BALITA STATE
  // ---------------------------------------------------------------------------
  const [balitaList, setBalitaList] = useState([]);
  const [balitaStats, setBalitaStats] = useState({
    total_balita: 0,
    gizi_baik: 0,
    berisiko_stunting: 0,
    gizi_lebih: 0
  });
  const [showBalitaModal, setShowBalitaModal] = useState(false);
  const [submittingBalita, setSubmittingBalita] = useState(false);
  const [balitaForm, setBalitaForm] = useState({
    nik_warga: '',
    nama_anak: '',
    tanggal_lahir_anak: '',
    jenis_kelamin_anak: 'L',
    umur_bulan: '',
    berat_badan_kg: '',
    tinggi_badan_cm: '',
    lingkar_kepala_cm: '',
    status_gizi: 'Auto',
    imunisasi: '',
    catatan_kesehatan: ''
  });

  const fetchPosyandu = async () => {
  // ---------------------------------------------------------------------------
  // LANSIA STATE
  // ---------------------------------------------------------------------------
  const [lansiaList, setLansiaList] = useState([]);
  const [lansiaStats, setLansiaStats] = useState({
    total_lansia: 0,
    total_hipertensi: 0,
    total_diabetes: 0,
    total_ketergantungan: 0
  });
  const [showRegLansiaModal, setShowRegLansiaModal] = useState(false);
  const [showCheckupLansiaModal, setShowCheckupLansiaModal] = useState(false);
  const [selectedLansia, setSelectedLansia] = useState(null);
  const [lansiaHistory, setLansiaHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [submittingLansia, setSubmittingLansia] = useState(false);
  const [regLansiaForm, setRegLansiaForm] = useState({
    nik: '',
    nama: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    alamat: 'Jl. Kebonjati',
    rt: user?.rt || '001',
    rw: user?.rw || '001',
    status_tinggal: 'Bersama Keluarga',
    riwayat_penyakit: ''
  });

  const [checkupLansiaForm, setCheckupLansiaForm] = useState({
    posyandu_lansia_id: '',
    tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
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

  // Fetch Balita Data
  const fetchBalita = async () => {
    try {
      setIsLoading(true);
      setLoading(true);
      setError(null);
      const response = await api.get('/posyandu/me');
      setData(response.data || []);
      if (isOfficer) {
        const [listRes, statsRes] = await Promise.all([
          api.get(`/posyandu/balita?search=${encodeURIComponent(search)}${filterRT ? `&rt=${filterRT}` : ''}`),
          api.get(`/posyandu/balita/stats${filterRT ? `?rt=${filterRT}` : ''}`)
        ]);
        setBalitaList(listRes.data || []);
        setBalitaStats(statsRes.data || {});
      } else {
        const res = await api.get('/posyandu/me');
        setBalitaList(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal mengambil data rekam medis Posyandu.');
      setError(err.message || 'Gagal memuat data Posyandu Balita');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Fetch Lansia Data
  const fetchLansia = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isOfficer) {
        const [listRes, statsRes] = await Promise.all([
          api.get(`/posyandu/lansia?search=${encodeURIComponent(search)}${filterRT ? `&rt=${filterRT}` : ''}`),
          api.get(`/posyandu/lansia/stats${filterRT ? `?rt=${filterRT}` : ''}`)
        ]);
        setLansiaList(listRes.data || []);
        setLansiaStats(statsRes.data || {});
      } else {
        const res = await api.get('/posyandu/lansia/my');
        setLansiaList(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data Posyandu Lansia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosyandu();
  }, []);
    if (activeTab === 'balita') {
      fetchBalita();
    } else {
      fetchLansia();
    }
  }, [activeTab, search, filterRT]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // Live IMT preview for Lansia Checkup
  const liveIMT = useMemo(() => {
    const bb = parseFloat(checkupLansiaForm.berat_badan_kg);
    const tb = parseFloat(checkupLansiaForm.tinggi_badan_cm);
    if (!bb || !tb || tb <= 0) return null;
    const tbM = tb / 100;
    const val = (bb / (tbM * tbM)).toFixed(1);
    let category = 'Normal';
    if (val < 18.5) category = 'Kurus';
    else if (val > 27.0) category = 'Obesitas';
    else if (val > 25.0) category = 'Gemuk';
    return { val, category };
  }, [checkupLansiaForm.berat_badan_kg, checkupLansiaForm.tinggi_badan_cm]);

  const handleSubmit = async (e) => {
  // Submit Catat Balita
  const handleSubmitBalita = async (e) => {
    e.preventDefault();
    
    // Extra Frontend Validation
    if (Number(formData.umur_bulan) < 0 || Number(formData.berat_badan_kg) < 0 || Number(formData.tinggi_badan_cm) < 0) {
      setError('Nilai umur, berat, dan tinggi badan tidak boleh negatif.');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmittingBalita(true);
      setError(null);
      await api.post('/posyandu', {
        nama_anak: formData.nama_anak,
        umur_bulan: Number(formData.umur_bulan),
        berat_badan_kg: Number(formData.berat_badan_kg),
        tinggi_badan_cm: Number(formData.tinggi_badan_cm),
        catatan_kesehatan: formData.catatan_kesehatan
      });
      
      // Reset form and refetch
      setFormData({
      await api.post('/posyandu/balita', balitaForm);
      setSuccessMsg('Pemeriksaan Balita berhasil dicatat!');
      setShowBalitaModal(false);
      setBalitaForm({
        nik_warga: '',
        nama_anak: '',
        tanggal_lahir_anak: '',
        jenis_kelamin_anak: 'L',
        umur_bulan: '',
        berat_badan_kg: '',
        tinggi_badan_cm: '',
        lingkar_kepala_cm: '',
        status_gizi: 'Auto',
        imunisasi: '',
        catatan_kesehatan: ''
      });
      setShowForm(false);
      fetchPosyandu();
      fetchBalita();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal mencatat pemeriksaan Posyandu.');
      setError(err.message || 'Gagal mencatat data balita');
    } finally {
      setIsSubmitting(false);
      setSubmittingBalita(false);
    }
  };

  const posyanduColumns = [
    { label: 'Tanggal Pemeriksaan', className: '' },
    { label: 'Nama Anak', className: '' },
    { label: 'Umur (Bulan)', className: 'text-center' },
    { label: 'Berat (Kg)', className: 'text-center' },
    { label: 'Tinggi (Cm)', className: 'text-center' },
    { label: 'Catatan', className: '' }
  ];
  // Submit Registrasi Lansia
  const handleSubmitRegLansia = async (e) => {
    e.preventDefault();
    try {
      setSubmittingLansia(true);
      setError(null);
      await api.post('/posyandu/lansia', regLansiaForm);
      setSuccessMsg(`Lansia ${regLansiaForm.nama} berhasil didaftarkan!`);
      setShowRegLansiaModal(false);
      fetchLansia();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan lansia');
    } finally {
      setSubmittingLansia(false);
    }
  };

  const renderPosyanduRow = (row) => (
    <>
      <td className="px-5 py-4 font-medium text-label-md">
        {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
      </td>
      <td className="px-5 py-4 font-medium text-on-surface">{row.nama_anak}</td>
      <td className="px-5 py-4 text-center text-on-surface-variant text-label-sm">{row.umur_bulan}</td>
      <td className="px-5 py-4 text-center text-on-surface-variant text-label-sm">{row.berat_badan_kg}</td>
      <td className="px-5 py-4 text-center text-on-surface-variant text-label-sm">{row.tinggi_badan_cm}</td>
      <td className="px-5 py-4 text-on-surface-variant text-label-sm max-w-[200px] truncate" title={row.catatan_kesehatan}>
        {row.catatan_kesehatan || '-'}
      </td>
    </>
  );
  // Submit Pemeriksaan Lansia
  const handleSubmitCheckupLansia = async (e) => {
    e.preventDefault();
    try {
      setSubmittingLansia(true);
      setError(null);
      await api.post('/posyandu/lansia/pemeriksaan', checkupLansiaForm);
      setSuccessMsg('Rekam medis pemeriksaan lansia berhasil dicatat!');
      setShowCheckupLansiaModal(false);
      setCheckupLansiaForm({
        posyandu_lansia_id: '',
        tanggal_pemeriksaan: new Date().toISOString().split('T')[0],
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
      fetchLansia();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal mencatat pemeriksaan lansia');
    } finally {
      setSubmittingLansia(false);
    }
  };

  // View Lansia History Modal
  const handleOpenHistory = async (lansia) => {
    setSelectedLansia(lansia);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/posyandu/lansia/history/${lansia.id}`);
      setLansiaHistory(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat histori lansia');
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="mb-8 flex justify-between items-start">
    <div className="max-w-max-width mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg-mobile lg:text-headline-lg font-bold text-on-surface flex items-center gap-2">
            <Baby className="text-primary" size={32} />
            Layanan Posyandu
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold mb-2">
            <Activity size={14} /> Posyandu Integratif Siklus Hidup
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface flex items-center gap-3">
            {activeTab === 'balita' ? (
              <Baby className="text-primary" size={32} />
            ) : (
              <HeartPulse className="text-rose-600" size={32} />
            )}
            Layanan Posyandu Kebonjati
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Pantau riwayat layanan pemeriksaan dan rekam medis anak Anda.
            Surveilans kesehatan balita (KMS & Stunting) dan lansia (Skrining PTM & Kemandirian ADL).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'balita' ? (
            <button
              onClick={() => setShowBalitaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold shadow-sm hover:bg-primary/90 transition-colors text-sm"
            >
              <Plus size={18} /> Catat Balita
            </button>
          ) : (
            isOfficer && (
              <>
                <button
                  onClick={() => setShowRegLansiaModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-high text-on-surface rounded-xl font-semibold hover:bg-surface-container-highest transition-colors text-sm border border-outline-variant"
                >
                  <UserPlus size={16} /> Daftar Lansia
                </button>
                <button
                  onClick={() => setShowCheckupLansiaModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl font-semibold shadow-sm hover:bg-rose-700 transition-colors text-sm"
                >
                  <Plus size={18} /> Catat Pemeriksaan
                </button>
              </>
            )
          )}
        </div>
      </header>

      {/* SUCCESS / ERROR ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
            {successMsg}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center gap-3 text-sm font-medium"
          >
            <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-outline-variant bg-surface-container-lowest rounded-t-xl overflow-hidden p-1.5 gap-1.5">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors"
          onClick={() => setActiveTab('balita')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'balita'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          {showForm ? 'Batal' : <><Plus size={20} /> Catat Pemeriksaan</>}
          <Baby size={18} />
          <span>Posyandu Balita (KMS & Stunting)</span>
        </button>
      </header>
        <button
          onClick={() => setActiveTab('lansia')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'lansia'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <HeartPulse size={18} />
          <span>Posyandu Lansia (Geriatri & PTM)</span>
        </button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-container text-on-error-container p-4 rounded-lg flex items-start gap-3 border border-error/20"
        >
          <AlertCircle size={20} className="text-error mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-label-md">Pemberitahuan</h3>
            <p className="text-label-sm mt-1">{error}</p>
      {/* ===================================================================== */}
      {/* TAB 1: BALITA VIEW                                                    */}
      {/* ===================================================================== */}
      {activeTab === 'balita' && (
        <div className="space-y-6">
          {/* STATS CARDS (OFFICER ONLY) */}
          {isOfficer && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Total Balita</p>
                <h3 className="text-2xl font-bold text-on-surface mt-1">{balitaStats.total_balita || 0}</h3>
                <p className="text-[11px] text-emerald-600 mt-1 font-medium flex items-center gap-1">
                  <TrendingUp size={12} /> Pemantauan Rutin
                </p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Status Gizi Baik</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{balitaStats.gizi_baik || 0}</h3>
                <p className="text-[11px] text-on-surface-variant mt-1">Normal & Sehat</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Waspada Stunting</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{balitaStats.berisiko_stunting || 0}</h3>
                <p className="text-[11px] text-amber-700 mt-1 font-medium">Perlu PMT Tambahan</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Gizi Lebih / Obesitas</p>
                <h3 className="text-2xl font-bold text-indigo-600 mt-1">{balitaStats.gizi_lebih || 0}</h3>
                <p className="text-[11px] text-on-surface-variant mt-1">Edukasi Pola Makan</p>
              </div>
            </div>
          )}

          {/* FILTER & SEARCH */}
          {isOfficer && (
            <div className="flex flex-col sm:flex-row gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama balita atau NIK orang tua..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-on-surface-variant" />
                <select
                  value={filterRT}
                  onChange={(e) => setFilterRT(e.target.value)}
                  className="px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua RT</option>
                  <option value="001">RT 001</option>
                  <option value="002">RT 002</option>
                  <option value="003">RT 003</option>
                </select>
              </div>
            </div>
          )}

          {/* TABLE OF BALITA */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold">
                  <tr>
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Nama Balita</th>
                    <th className="p-4 text-center">Usia</th>
                    <th className="p-4 text-center">BB / TB</th>
                    <th className="p-4 text-center">Status Gizi</th>
                    <th className="p-4">Imunisasi / Catatan</th>
                    {isOfficer && <th className="p-4">Orang Tua (RT/RW)</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={isOfficer ? 7 : 6} className="p-8 text-center text-on-surface-variant">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                        Memuat data pemeriksaan balita...
                      </td>
                    </tr>
                  ) : balitaList.length === 0 ? (
                    <tr>
                      <td colSpan={isOfficer ? 7 : 6} className="p-8 text-center text-on-surface-variant">
                        Belum ada data pemeriksaan balita yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    balitaList.map((row) => {
                      const isStuntingRisk = row.status_gizi === 'Gizi Kurang' || row.status_gizi === 'Gizi Buruk';
                      return (
                        <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="p-4 whitespace-nowrap text-on-surface-variant">
                            {row.tanggal_pemeriksaan ? new Date(row.tanggal_pemeriksaan).toLocaleDateString('id-ID') : '-'}
                          </td>
                          <td className="p-4">
                            <div className="font-semibold text-on-surface">{row.nama_anak}</div>
                            <div className="text-xs text-on-surface-variant">{row.jenis_kelamin_anak === 'P' ? 'Perempuan' : 'Laki-laki'}</div>
                          </td>
                          <td className="p-4 text-center font-medium">{row.umur_bulan} bln</td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <span className="font-semibold">{row.berat_badan_kg} kg</span>
                            <span className="text-xs text-on-surface-variant ml-1">/ {row.tinggi_badan_cm} cm</span>
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                isStuntingRisk
                                  ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                  : row.status_gizi === 'Normal' || row.status_gizi === 'Gizi Baik'
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {row.status_gizi || 'Normal'}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs truncate">
                            {row.imunisasi && (
                              <div className="text-xs font-semibold text-primary">{row.imunisasi}</div>
                            )}
                            <div className="text-xs text-on-surface-variant truncate" title={row.catatan_kesehatan}>
                              {row.catatan_kesehatan || '-'}
                            </div>
                          </td>
                          {isOfficer && (
                            <td className="p-4 text-xs text-on-surface-variant whitespace-nowrap">
                              <div className="font-medium text-on-surface">{row.nama_ortu || row.nik_warga}</div>
                              <div>RT {row.rt || '001'} / RW {row.rw || '001'}</div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
        </div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant shadow-sm mb-8"
        >
          <h2 className="text-headline-sm font-bold text-on-surface mb-4">Pencatatan Pemeriksaan Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* ===================================================================== */}
      {/* TAB 2: LANSIA VIEW                                                    */}
      {/* ===================================================================== */}
      {activeTab === 'lansia' && (
        <div className="space-y-6">
          {/* STATS CARDS (OFFICER ONLY) */}
          {isOfficer && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Total Lansia Binaan</p>
                <h3 className="text-2xl font-bold text-on-surface mt-1">{lansiaStats.total_lansia || 0}</h3>
                <p className="text-[11px] text-on-surface-variant mt-1">Usia $\ge 60$ Tahun</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Waspada Hipertensi</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{lansiaStats.total_hipertensi || 0}</h3>
                <p className="text-[11px] text-rose-700 mt-1 font-medium">Tensi $\ge 140/90$ mmHg</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Waspada Diabetes</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{lansiaStats.total_diabetes || 0}</h3>
                <p className="text-[11px] text-amber-700 mt-1 font-medium">GDS $\ge 200$ mg/dL</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Ketergantungan ADL</p>
                <h3 className="text-2xl font-bold text-purple-600 mt-1">{lansiaStats.total_ketergantungan || 0}</h3>
                <p className="text-[11px] text-on-surface-variant mt-1">Butuh Pendampingan</p>
              </div>
            </div>
          )}

          {/* FILTER & SEARCH */}
          {isOfficer && (
            <div className="flex flex-col sm:flex-row gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama lansia atau NIK..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-on-surface-variant" />
                <select
                  value={filterRT}
                  onChange={(e) => setFilterRT(e.target.value)}
                  className="px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Semua RT</option>
                  <option value="001">RT 001</option>
                  <option value="002">RT 002</option>
                  <option value="003">RT 003</option>
                </select>
              </div>
            </div>
          )}

          {/* TABLE OF LANSIA */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold">
                  <tr>
                    <th className="p-4">Identitas Lansia</th>
                    <th className="p-4">Wilayah</th>
                    <th className="p-4 text-center">Tekanan Darah</th>
                    <th className="p-4 text-center">Gula Darah</th>
                    <th className="p-4 text-center">IMT</th>
                    <th className="p-4 text-center">Kemandirian ADL</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                        Memuat data Posyandu Lansia...
                      </td>
                    </tr>
                  ) : lansiaList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                        Belum ada lansia yang terdaftar di sistem.
                      </td>
                    </tr>
                  ) : (
                    lansiaList.map((row) => {
                      return (
                        <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="p-4">
                            <div className="font-semibold text-on-surface">{row.nama}</div>
                            <div className="text-xs text-on-surface-variant">
                              {row.jenis_kelamin === 'P' ? 'Perempuan' : 'Laki-laki'}, {row.usia || '-'} thn (NIK: {row.nik})
                            </div>
                            {row.riwayat_penyakit && (
                              <div className="text-[11px] text-rose-600 font-medium mt-0.5">
                                Rwy: {row.riwayat_penyakit}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-xs text-on-surface-variant">
                            <div>RT {row.rt} / RW {row.rw}</div>
                            <div className="truncate max-w-[120px]">{row.alamat}</div>
                          </td>
                          <td className="p-4 text-center">
                            {row.tensi_sistolik ? (
                              <>
                                <div className="font-bold">{row.tensi_sistolik}/{row.tensi_diastolik}</div>
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                                    row.is_hipertensi
                                      ? 'bg-rose-100 text-rose-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {row.status_tensi || 'Normal'}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-on-surface-variant">Belum diperiksa</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {row.gula_darah_sewaktu ? (
                              <>
                                <div className="font-bold">{row.gula_darah_sewaktu} <span className="text-[10px] font-normal text-on-surface-variant">mg/dL</span></div>
                                <span
                                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                                    row.is_diabetes
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-emerald-100 text-emerald-700'
                                  }`}
                                >
                                  {row.status_gds || 'Normal'}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-on-surface-variant">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {row.imt ? (
                              <>
                                <div className="font-bold">{row.imt}</div>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold mt-0.5 bg-surface-container-high text-on-surface">
                                  {row.status_imt}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs text-on-surface-variant">-</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                row.skor_kemandirian_adl === 'Mandiri'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {row.skor_kemandirian_adl || 'Mandiri'}
                            </span>
                          </td>
                          <td className="p-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleOpenHistory(row)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-high hover:bg-surface-container-highest transition-colors text-primary border border-outline-variant"
                            >
                              <History size={14} /> Riwayat
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: CATAT PEMERIKSAAN BALITA                                     */}
      {/* ===================================================================== */}
      {showBalitaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Baby className="text-primary" size={20} />
                Catat Pemeriksaan Balita
              </h2>
              <button
                onClick={() => setShowBalitaModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitBalita} className="space-y-3.5 text-sm">
              {isOfficer && (
                <div>
                  <label className="block font-semibold mb-1">NIK Orang Tua / Pelapor</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={balitaForm.nik_warga}
                    onChange={(e) => setBalitaForm({ ...balitaForm, nik_warga: e.target.value })}
                    required
                    placeholder="16 Digit NIK Orang Tua"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold mb-1">Nama Lengkap Anak</label>
                  <input
                    type="text"
                    value={balitaForm.nama_anak}
                    onChange={(e) => setBalitaForm({ ...balitaForm, nama_anak: e.target.value })}
                    required
                    placeholder="Contoh: Muhammad Rizki"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={balitaForm.jenis_kelamin_anak}
                    onChange={(e) => setBalitaForm({ ...balitaForm, jenis_kelamin_anak: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Umur (Bulan)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={balitaForm.umur_bulan}
                    onChange={(e) => setBalitaForm({ ...balitaForm, umur_bulan: e.target.value })}
                    required
                    placeholder="Contoh: 18"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">BB (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={balitaForm.berat_badan_kg}
                    onChange={(e) => setBalitaForm({ ...balitaForm, berat_badan_kg: e.target.value })}
                    required
                    placeholder="10.5"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">TB (Cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    value={balitaForm.tinggi_badan_cm}
                    onChange={(e) => setBalitaForm({ ...balitaForm, tinggi_badan_cm: e.target.value })}
                    required
                    placeholder="82.0"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Li. Kepala (Cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={balitaForm.lingkar_kepala_cm}
                    onChange={(e) => setBalitaForm({ ...balitaForm, lingkar_kepala_cm: e.target.value })}
                    placeholder="47.0"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">Nama Anak</label>
                <label className="block font-semibold mb-1">Imunisasi / Vitamin yang Diberikan</label>
                <input
                  type="text"
                  name="nama_anak"
                  value={formData.nama_anak}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Contoh: Budi Santoso"
                  value={balitaForm.imunisasi}
                  onChange={(e) => setBalitaForm({ ...balitaForm, imunisasi: e.target.value })}
                  placeholder="Contoh: Polio 3, Vitamin A Merah, DPT-HB"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">Umur (Bulan)</label>
                <label className="block font-semibold mb-1">Catatan Tambahan & Saran Kader</label>
                <textarea
                  rows="2"
                  value={balitaForm.catatan_kesehatan}
                  onChange={(e) => setBalitaForm({ ...balitaForm, catatan_kesehatan: e.target.value })}
                  placeholder="Anak aktif, nafsu makan baik..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowBalitaModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingBalita}
                  className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {submittingBalita ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Pemeriksaan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: PENDAFTARAN LANSIA BARU                                      */}
      {/* ===================================================================== */}
      {showRegLansiaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <UserPlus className="text-rose-600" size={20} />
                Pendaftaran Lansia Binaan Baru
              </h2>
              <button
                onClick={() => setShowRegLansiaModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRegLansia} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold mb-1">Nomor Induk Kependudukan (NIK)</label>
                <input
                  type="number"
                  name="umur_bulan"
                  value={formData.umur_bulan}
                  onChange={handleInputChange}
                  type="text"
                  maxLength={16}
                  value={regLansiaForm.nik}
                  onChange={(e) => setRegLansiaForm({ ...regLansiaForm, nik: e.target.value })}
                  required
                  min="0"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                  placeholder="16 Digit NIK Lansia"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">Berat Badan (Kg)</label>
                <label className="block font-semibold mb-1">Nama Lengkap</label>
                <input
                  type="number"
                  step="0.1"
                  name="berat_badan_kg"
                  value={formData.berat_badan_kg}
                  onChange={handleInputChange}
                  type="text"
                  value={regLansiaForm.nama}
                  onChange={(e) => setRegLansiaForm({ ...regLansiaForm, nama: e.target.value })}
                  required
                  min="0"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.0"
                  placeholder="Contoh: H. Soleh Santoso"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={regLansiaForm.tanggal_lahir}
                    onChange={(e) => setRegLansiaForm({ ...regLansiaForm, tanggal_lahir: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={regLansiaForm.jenis_kelamin}
                    onChange={(e) => setRegLansiaForm({ ...regLansiaForm, jenis_kelamin: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">RT</label>
                  <input
                    type="text"
                    value={regLansiaForm.rt}
                    onChange={(e) => setRegLansiaForm({ ...regLansiaForm, rt: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">RW</label>
                  <input
                    type="text"
                    value={regLansiaForm.rw}
                    onChange={(e) => setRegLansiaForm({ ...regLansiaForm, rw: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">Tinggi Badan (Cm)</label>
                <label className="block font-semibold mb-1">Alamat Rumah</label>
                <input
                  type="number"
                  step="0.1"
                  name="tinggi_badan_cm"
                  value={formData.tinggi_badan_cm}
                  onChange={handleInputChange}
                  type="text"
                  value={regLansiaForm.alamat}
                  onChange={(e) => setRegLansiaForm({ ...regLansiaForm, alamat: e.target.value })}
                  placeholder="Jl. Kebonjati No. ..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Status Tinggal</label>
                  <select
                    value={regLansiaForm.status_tinggal}
                    onChange={(e) => setRegLansiaForm({ ...regLansiaForm, status_tinggal: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="Bersama Keluarga">Bersama Keluarga</option>
                    <option value="Sebatang Kara">Sebatang Kara</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Riwayat Penyakit</label>
                  <input
                    type="text"
                    value={regLansiaForm.riwayat_penyakit}
                    onChange={(e) => setRegLansiaForm({ ...regLansiaForm, riwayat_penyakit: e.target.value })}
                    placeholder="Hipertensi / DM..."
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowRegLansiaModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingLansia}
                  className="px-5 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2"
                >
                  {submittingLansia ? <Loader2 size={16} className="animate-spin" /> : 'Daftarkan Lansia'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CATAT PEMERIKSAAN LANSIA (SKRINING PTM & ADL)                 */}
      {/* ===================================================================== */}
      {showCheckupLansiaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <HeartPulse className="text-rose-600" size={20} />
                Catat Pemeriksaan & Skrining PTM Lansia
              </h2>
              <button
                onClick={() => setShowCheckupLansiaModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCheckupLansia} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold mb-1">Pilih Lansia Binaan</label>
                <select
                  value={checkupLansiaForm.posyandu_lansia_id}
                  onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, posyandu_lansia_id: e.target.value })}
                  required
                  min="0"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.0"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
                >
                  <option value="">-- Pilih Lansia --</option>
                  {lansiaList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nama} (NIK: {l.nik}) - RT {l.rt}/RW {l.rw}
                    </option>
                  ))}
                </select>
              </div>

              {/* Biomarkers */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant space-y-3">
                <div className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={14} className="text-rose-600" /> Tanda Vital & Biomarker
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tensi Sistolik (mmHg)</label>
                    <input
                      type="number"
                      value={checkupLansiaForm.tensi_sistolik}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tensi_sistolik: e.target.value })}
                      required
                      placeholder="120"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tensi Diastolik (mmHg)</label>
                    <input
                      type="number"
                      value={checkupLansiaForm.tensi_diastolik}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tensi_diastolik: e.target.value })}
                      required
                      placeholder="80"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Gula Darah (mg/dL)</label>
                    <input
                      type="number"
                      value={checkupLansiaForm.gula_darah_sewaktu}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, gula_darah_sewaktu: e.target.value })}
                      placeholder="140"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Kolesterol (mg/dL)</label>
                    <input
                      type="number"
                      value={checkupLansiaForm.kolesterol}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, kolesterol: e.target.value })}
                      placeholder="190"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Asam Urat (mg/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={checkupLansiaForm.asam_urat}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, asam_urat: e.target.value })}
                      placeholder="6.0"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Antropometri & Live IMT */}
              <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant space-y-3">
                <div className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center justify-between">
                  <span>Antropometri & Kemandirian</span>
                  {liveIMT && (
                    <span className="text-xs font-bold text-primary">
                      IMT: {liveIMT.val} ({liveIMT.category})
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Berat Badan (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={checkupLansiaForm.berat_badan_kg}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, berat_badan_kg: e.target.value })}
                      required
                      placeholder="60"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Tinggi Badan (Cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={checkupLansiaForm.tinggi_badan_cm}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tinggi_badan_cm: e.target.value })}
                      required
                      placeholder="160"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Skor Kemandirian ADL (Barthel Index)</label>
                  <select
                    value={checkupLansiaForm.skor_kemandirian_adl}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, skor_kemandirian_adl: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Mandiri">Mandiri (Bisa beraktivitas sendiri)</option>
                    <option value="Ketergantungan Ringan">Ketergantungan Ringan</option>
                    <option value="Ketergantungan Sedang">Ketergantungan Sedang</option>
                    <option value="Ketergantungan Berat">Ketergantungan Berat (Total di tempat tidur)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Keluhan Utama</label>
                <input
                  type="text"
                  value={checkupLansiaForm.keluhan}
                  onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, keluhan: e.target.value })}
                  placeholder="Sering pusing, leher kaku, cepat letih..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Tindakan Petugas / Rekomendasi Rujukan</label>
                <input
                  type="text"
                  value={checkupLansiaForm.tindakan_petugas}
                  onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tindakan_petugas: e.target.value })}
                  placeholder="Edukasi diet rendah garam, rujukan ke Puskesmas Andir..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowCheckupLansiaModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingLansia}
                  className="px-5 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2"
                >
                  {submittingLansia ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Rekam Medis'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: RIWAYAT PEMERIKSAAN LANSIA                                   */}
      {/* ===================================================================== */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <History className="text-primary" size={20} />
                  Riwayat Pemeriksaan: {selectedLansia?.nama}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  NIK: {selectedLansia?.nik} &bull; RT {selectedLansia?.rt}/RW {selectedLansia?.rw}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">Catatan Kesehatan</label>
              <textarea
                name="catatan_kesehatan"
                value={formData.catatan_kesehatan}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows="3"
                className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Catatan tambahan hasil pemeriksaan..."
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">

            {loadingHistory ? (
              <div className="p-8 text-center text-on-surface-variant">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                Memuat riwayat pemeriksaan...
              </div>
            ) : lansiaHistory.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant">
                Belum ada rekam medis sebelumnya untuk lansia ini.
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {lansiaHistory.map((item) => (
                  <div key={item.id} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm">
                        {new Date(item.tanggal_pemeriksaan).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {item.skor_kemandirian_adl}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs mb-2">
                      <div className="bg-surface-container-lowest p-2 rounded border border-outline-variant">
                        <span className="text-on-surface-variant block text-[10px]">Tensi Darah</span>
                        <span className="font-bold text-rose-600">{item.tensi_sistolik}/{item.tensi_diastolik}</span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded border border-outline-variant">
                        <span className="text-on-surface-variant block text-[10px]">Gula Darah</span>
                        <span className="font-bold text-amber-600">{item.gula_darah_sewaktu || '-'} mg/dL</span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded border border-outline-variant">
                        <span className="text-on-surface-variant block text-[10px]">Kolesterol</span>
                        <span className="font-bold">{item.kolesterol || '-'} mg/dL</span>
                      </div>
                      <div className="bg-surface-container-lowest p-2 rounded border border-outline-variant">
                        <span className="text-on-surface-variant block text-[10px]">IMT / BB</span>
                        <span className="font-bold">{item.imt || '-'} ({item.berat_badan_kg}kg)</span>
                      </div>
                    </div>
                    {item.keluhan && (
                      <div className="text-xs text-on-surface-variant">
                        <strong className="text-on-surface">Keluhan:</strong> {item.keluhan}
                      </div>
                    )}
                    {item.tindakan_petugas && (
                      <div className="text-xs text-on-surface-variant mt-0.5">
                        <strong className="text-on-surface">Tindakan / Saran:</strong> {item.tindakan_petugas}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-outline-variant mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-surface-container-high rounded-lg font-semibold hover:bg-surface-container-highest transition-colors text-sm"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                ) : (
                  'Simpan Data'
                )}
                Tutup
              </button>
            </div>
          </form>
        </motion.div>
          </motion.div>
        </div>
      )}

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card flex flex-col items-center justify-center text-on-surface-variant gap-3"
        >
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-label-md font-medium">Memuat data rekam medis...</p>
        </motion.div>
      ) : data.length === 0 && !error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full py-16 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card flex flex-col items-center justify-center text-on-surface-variant gap-3 text-center px-4"
        >
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-2">
            <Baby size={32} className="text-outline" />
          </div>
          <h3 className="text-headline-md font-semibold text-on-surface">Belum ada catatan Posyandu</h3>
          <p className="text-body-md">
            Anda belum memiliki riwayat kunjungan Posyandu untuk anak Anda.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DataTable data={data} columns={posyanduColumns} renderRow={renderPosyanduRow} />
        </motion.div>
      )}
    </div>
  );
}
