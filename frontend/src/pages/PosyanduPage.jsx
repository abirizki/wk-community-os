import { useState, useEffect, useMemo } from 'react';
import { api } from '../utils/api';
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
  TrendingUp, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { enqueueOfflineAction, cacheData, getCachedData } from '../utils/offlineStorage';

export default function PosyanduPage() {
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
      setLoading(true);
      setError(null);
      if (isOfficer) {
        const [listRes, statsRes] = await Promise.all([
          api.get(`/posyandu/balita?search=${encodeURIComponent(search)}${filterRT ? `&rt=${filterRT}` : ''}`),
          api.get(`/posyandu/balita/stats${filterRT ? `?rt=${filterRT}` : ''}`)
        ]);
        const list = listRes.data || [];
        const stats = statsRes.data || {};
        setBalitaList(list);
        setBalitaStats(stats);
        cacheData('bw_posyandu_balita', { list, stats });
      } else {
        const res = await api.get('/posyandu/me');
        const list = res.data || [];
        setBalitaList(list);
        cacheData('bw_posyandu_me', list);
      }
    } catch (err) {
      // Offline fallback: load from cached snapshot
      const cached = await getCachedData(isOfficer ? 'bw_posyandu_balita' : 'bw_posyandu_me');
      if (cached) {
        if (isOfficer) {
          setBalitaList(cached.list || []);
          setBalitaStats(cached.stats || {});
        } else {
          setBalitaList(cached || []);
        }
        setError('Menampilkan data Posyandu tersimpan (Mode Offline)');
      } else {
        setError(err.message || 'Gagal memuat data Posyandu Balita');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Lansia Data
  const fetchLansia = async () => {
    try {
      setLoading(true);
      setError(null);
      const [listRes, statsRes] = await Promise.all([
        api.get(`/posyandu/lansia?search=${encodeURIComponent(search)}${filterRT ? `&rt=${filterRT}` : ''}`),
        api.get(`/posyandu/lansia/stats${filterRT ? `?rt=${filterRT}` : ''}`)
      ]);
      const list = listRes.data || [];
      const stats = statsRes.data || {};
      setLansiaList(list);
      setLansiaStats(stats);
      cacheData('bw_posyandu_lansia', { list, stats });
    } catch (err) {
      const cached = await getCachedData('bw_posyandu_lansia');
      if (cached) {
        setLansiaList(cached.list || []);
        setLansiaStats(cached.stats || {});
        setError('Menampilkan data Lansia tersimpan (Mode Offline)');
      } else {
        setError(err.message || 'Gagal memuat data Posyandu Lansia');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'balita') {
      fetchBalita();
    } else {
      fetchLansia();
    }
  }, [activeTab, search, filterRT]);

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

  // Submit Catat Balita (Offline Capable)
  const handleSubmitBalita = async (e) => {
    e.preventDefault();
    try {
      setSubmittingBalita(true);
      setError(null);

      // If offline, save into background sync queue
      if (!navigator.onLine) {
        await enqueueOfflineAction({
          type: 'POSYANDU_BALITA',
          endpoint: '/api/posyandu/balita',
          method: 'POST',
          payload: balitaForm,
          label: `Pemeriksaan Balita: ${balitaForm.nama_anak}`
        });
        setSuccessMsg('Tersimpan di antrean offline! Data akan otomatis disinkronkan saat terhubung kembali.');
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
        setTimeout(() => setSuccessMsg(''), 5000);
        return;
      }

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
      fetchBalita();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Gagal mencatat data balita');
    } finally {
      setSubmittingBalita(false);
    }
  };

  // Submit Registrasi Lansia (Offline Capable)
  const handleSubmitRegLansia = async (e) => {
    e.preventDefault();
    try {
      setSubmittingLansia(true);
      setError(null);

      if (!navigator.onLine) {
        await enqueueOfflineAction({
          type: 'POSYANDU_REG_LANSIA',
          endpoint: '/api/posyandu/lansia',
          method: 'POST',
          payload: regLansiaForm,
          label: `Registrasi Lansia: ${regLansiaForm.nama}`
        });
        setSuccessMsg(`Tersimpan di antrean offline! Pendaftaran lansia ${regLansiaForm.nama} akan disinkronkan saat online.`);
        setShowRegLansiaModal(false);
        setTimeout(() => setSuccessMsg(''), 5000);
        return;
      }

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

  // Submit Pemeriksaan Lansia (Offline Capable)
  const handleSubmitCheckupLansia = async (e) => {
    e.preventDefault();
    try {
      setSubmittingLansia(true);
      setError(null);

      if (!navigator.onLine) {
        await enqueueOfflineAction({
          type: 'POSYANDU_CHECKUP_LANSIA',
          endpoint: '/api/posyandu/lansia/pemeriksaan',
          method: 'POST',
          payload: checkupLansiaForm,
          label: `Pemeriksaan Lansia ID: ${checkupLansiaForm.posyandu_lansia_id}`
        });
        setSuccessMsg('Tersimpan di antrean offline! Rekam medis lansia akan disinkronkan otomatis saat online.');
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
        setTimeout(() => setSuccessMsg(''), 5000);
        return;
      }

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
    <div className="max-w-max-width mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
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
          onClick={() => setActiveTab('balita')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'balita'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <Baby size={18} />
          <span>Posyandu Balita (KMS & Stunting)</span>
        </button>
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
        </div>
      )}

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
                <p className="text-[11px] text-on-surface-variant mt-1">Usia &ge; 60 Tahun</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Waspada Hipertensi</p>
                <h3 className="text-2xl font-bold text-rose-600 mt-1">{lansiaStats.total_hipertensi || 0}</h3>
                <p className="text-[11px] text-rose-700 mt-1 font-medium">Tensi &ge; 140/90 mmHg</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
                <p className="text-xs text-on-surface-variant font-medium">Waspada Diabetes</p>
                <h3 className="text-2xl font-bold text-amber-600 mt-1">{lansiaStats.total_diabetes || 0}</h3>
                <p className="text-[11px] text-amber-700 mt-1 font-medium">GDS &ge; 200 mg/dL</p>
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
                    lansiaList.map((row) => (
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
                    ))
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
                  <label className="block font-semibold mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={balitaForm.tanggal_lahir_anak}
                    onChange={(e) => setBalitaForm({ ...balitaForm, tanggal_lahir_anak: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Usia (Bulan)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={balitaForm.umur_bulan}
                    onChange={(e) => setBalitaForm({ ...balitaForm, umur_bulan: e.target.value })}
                    required
                    placeholder="Bulan"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">BB (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="40"
                    value={balitaForm.berat_badan_kg}
                    onChange={(e) => setBalitaForm({ ...balitaForm, berat_badan_kg: e.target.value })}
                    required
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">TB (Cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="30"
                    max="130"
                    value={balitaForm.tinggi_badan_cm}
                    onChange={(e) => setBalitaForm({ ...balitaForm, tinggi_badan_cm: e.target.value })}
                    required
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Lingkar Kepala (Cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={balitaForm.lingkar_kepala_cm}
                    onChange={(e) => setBalitaForm({ ...balitaForm, lingkar_kepala_cm: e.target.value })}
                    placeholder="Opsional"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Vaksin / Imunisasi</label>
                  <input
                    type="text"
                    value={balitaForm.imunisasi}
                    onChange={(e) => setBalitaForm({ ...balitaForm, imunisasi: e.target.value })}
                    placeholder="Contoh: BCG, Polio 1"
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Catatan Tambahan / PMT</label>
                <textarea
                  rows="2"
                  value={balitaForm.catatan_kesehatan}
                  onChange={(e) => setBalitaForm({ ...balitaForm, catatan_kesehatan: e.target.value })}
                  placeholder="Kondisi kesehatan balita..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
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
                  className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {submittingBalita ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Pemeriksaan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: REGISTRASI LANSIA BARU                                       */}
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
                Registrasi Lansia Binaan Baru
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
                <label className="block font-semibold mb-1">Nomor Induk Kependudukan (NIK) *</label>
                <input
                  type="text"
                  maxLength={16}
                  value={regLansiaForm.nik}
                  onChange={(e) => setRegLansiaForm({ ...regLansiaForm, nik: e.target.value })}
                  required
                  placeholder="16 Digit NIK Lansia"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  value={regLansiaForm.nama}
                  onChange={(e) => setRegLansiaForm({ ...regLansiaForm, nama: e.target.value })}
                  required
                  placeholder="Contoh: H. Soleh Santoso"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tanggal Lahir *</label>
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
                <label className="block font-semibold mb-1">Alamat Rumah</label>
                <input
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
                    <option value="Panti Wreda">Panti Wreda</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Riwayat Penyakit (Komorbid)</label>
                  <input
                    type="text"
                    value={regLansiaForm.riwayat_penyakit}
                    onChange={(e) => setRegLansiaForm({ ...regLansiaForm, riwayat_penyakit: e.target.value })}
                    placeholder="Hipertensi, Stroke, Asam Urat..."
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
                  className="px-5 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {submittingLansia ? <Loader2 size={16} className="animate-spin" /> : 'Daftarkan Lansia'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CATAT PEMERIKSAAN LANSIA (SKRINING PTM)                       */}
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
                Skrining PTM & Rekam Medis Lansia
              </h2>
              <button
                onClick={() => setShowCheckupLansiaModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitCheckupLansia} className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Pilih Lansia Binaan *</label>
                  <select
                    required
                    value={checkupLansiaForm.posyandu_lansia_id}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, posyandu_lansia_id: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="">-- Pilih Lansia --</option>
                    {lansiaList.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nama} (RT {l.rt})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Tanggal Pemeriksaan *</label>
                  <input
                    type="date"
                    required
                    value={checkupLansiaForm.tanggal_pemeriksaan}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tanggal_pemeriksaan: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Tensi Darah */}
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                <label className="block font-bold text-rose-900 mb-2">Pemeriksaan Tekanan Darah</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-rose-800 mb-1">Sistolik (mmHg)</label>
                    <input
                      type="number"
                      placeholder="120"
                      value={checkupLansiaForm.tensi_sistolik}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tensi_sistolik: e.target.value })}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-rose-800 mb-1">Diastolik (mmHg)</label>
                    <input
                      type="number"
                      placeholder="80"
                      value={checkupLansiaForm.tensi_diastolik}
                      onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tensi_diastolik: e.target.value })}
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Laboratorium Sederhana */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-xs">Gula Darah (GDS)</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="mg/dL"
                    value={checkupLansiaForm.gula_darah_sewaktu}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, gula_darah_sewaktu: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-xs">Kolesterol</label>
                  <input
                    type="number"
                    step="1"
                    placeholder="mg/dL"
                    value={checkupLansiaForm.kolesterol}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, kolesterol: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-xs">Asam Urat</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="mg/dL"
                    value={checkupLansiaForm.asam_urat}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, asam_urat: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Antropometri & Live IMT */}
              <div className="grid grid-cols-3 gap-3 items-end">
                <div>
                  <label className="block font-semibold mb-1 text-xs">Berat Badan (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={checkupLansiaForm.berat_badan_kg}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, berat_badan_kg: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-xs">Tinggi Badan (Cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={checkupLansiaForm.tinggi_badan_cm}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tinggi_badan_cm: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm"
                  />
                </div>
                <div className="p-2 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                  <span className="text-[11px] text-on-surface-variant block">Indeks Massa Tubuh</span>
                  <span className="font-bold text-sm text-primary">
                    {liveIMT ? `${liveIMT.val} (${liveIMT.category})` : '-'}
                  </span>
                </div>
              </div>

              {/* ADL Kemandirian Barthel */}
              <div>
                <label className="block font-semibold mb-1">Tingkat Kemandirian (Skor ADL Barthel) *</label>
                <select
                  value={checkupLansiaForm.skor_kemandirian_adl}
                  onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, skor_kemandirian_adl: e.target.value })}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg font-medium"
                >
                  <option value="Mandiri">Mandiri (Skor 20: Mampu aktivitas harian penuh)</option>
                  <option value="Ketergantungan Ringan">Ketergantungan Ringan (Skor 12-19)</option>
                  <option value="Ketergantungan Sedang">Ketergantungan Sedang (Skor 9-11)</option>
                  <option value="Ketergantungan Berat">Ketergantungan Berat (Skor 5-8)</option>
                  <option value="Ketergantungan Total">Ketergantungan Total (Skor 0-4)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-xs">Keluhan Fisik Utama</label>
                  <input
                    type="text"
                    placeholder="Pusing, nyeri sendi lutut..."
                    value={checkupLansiaForm.keluhan}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, keluhan: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-xs">Tindakan Petugas / Edukasi</label>
                  <input
                    type="text"
                    placeholder="Konseling diet garam, rujuk PKM..."
                    value={checkupLansiaForm.tindakan_petugas}
                    onChange={(e) => setCheckupLansiaForm({ ...checkupLansiaForm, tindakan_petugas: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm"
                  />
                </div>
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
                  className="px-5 py-2 bg-rose-600 text-white rounded-lg font-semibold hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {submittingLansia ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Rekam Medis'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: RIWAYAT HISTORI PEMERIKSAAN LANSIA                           */}
      {/* ===================================================================== */}
      {showHistoryModal && selectedLansia && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-xl w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
              <div>
                <h2 className="text-lg font-bold text-on-surface">Histori Rekam Medis Lansia</h2>
                <p className="text-xs text-on-surface-variant">
                  {selectedLansia.nama} (NIK: {selectedLansia.nik}) &bull; RT {selectedLansia.rt} / RW {selectedLansia.rw}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            {loadingHistory ? (
              <div className="p-8 text-center text-on-surface-variant flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-primary" />
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
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-surface-container-high rounded-lg font-semibold hover:bg-surface-container-highest transition-colors text-sm"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
