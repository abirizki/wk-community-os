import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  Gift, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Check, 
  X, 
  User, 
  Users, 
  Building2, 
  ShieldCheck, 
  Coins, 
  FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JENIS_BANSOS_OPTIONS = [
  'PKH',
  'BPNT',
  'BLT BBM',
  'Bantuan Lansia',
  'Bantuan Balita Stunting',
  'SKTM'
];

export default function BansosPage() {
  const { user } = useAuth();
  const isOfficer = user && ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'].includes(user.role);
  const isRW = user && ['ketua_rw', 'admin_rw'].includes(user.role);
  const isKelurahan = user && ['admin_kelurahan', 'superadmin', 'admin'].includes(user.role);

  const [bansosList, setBansosList] = useState([]);
  const [stats, setStats] = useState({
    total_usulan: 0,
    total_disetujui: 0,
    pending_rw: 0,
    pending_kelurahan: 0,
    total_ditolak: 0,
    total_dana_tersalurkan: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending_my_action'
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterRT, setFilterRT] = useState('');

  // Modals
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedBansos, setSelectedBansos] = useState(null);
  const [verifyAction, setVerifyAction] = useState('APPROVE'); // 'APPROVE' | 'REJECT'
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifyNominal, setVerifyNominal] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Propose Form State
  const [proposeForm, setProposeForm] = useState({
    nik_penerima: '',
    no_kk: '',
    nama_penerima: '',
    jenis_bansos: 'Bantuan Lansia',
    nominal_bantuan: '600000',
    alasan_pengajuan: '',
    rt: user?.rt || '001',
    rw: user?.rw || '001'
  });

  const fetchBansos = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterJenis) params.append('jenis_bansos', filterJenis);
      if (filterRT) params.append('rt', filterRT);

      const [listRes, statsRes] = await Promise.all([
        api.get(`/bansos?${params.toString()}`),
        isOfficer ? api.get('/bansos/stats') : Promise.resolve({ data: {} })
      ]);

      setBansosList(listRes.data || []);
      if (statsRes.data) setStats(statsRes.data);
    } catch (err) {
      setError(err.message || 'Gagal memuat data bantuan sosial');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBansos();
  }, [search, filterJenis, filterRT]);

  // Submit Usulan Bansos
  const handleProposeSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      setError('');
      await api.post('/bansos', proposeForm);
      setSuccessMsg('Usulan calon penerima bansos berhasil didaftarkan!');
      setShowProposeModal(false);
      setProposeForm({
        nik_penerima: '',
        no_kk: '',
        nama_penerima: '',
        jenis_bansos: 'Bantuan Lansia',
        nominal_bantuan: '600000',
        alasan_pengajuan: '',
        rt: user?.rt || '001',
        rw: user?.rw || '001'
      });
      fetchBansos();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal mendaftarkan usulan bansos');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Verify Modal
  const openVerifyModal = (item, action) => {
    setSelectedBansos(item);
    setVerifyAction(action);
    setVerifyNotes('');
    setVerifyNominal(String(item.nominal_bantuan || ''));
    setShowVerifyModal(true);
  };

  // Submit Verify / Approve
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      setError('');
      const res = await api.patch(`/bansos/${selectedBansos.id}/verify`, {
        action: verifyAction,
        catatan: verifyNotes,
        nominal: verifyNominal ? Number(verifyNominal) : null
      });
      setSuccessMsg(res.message || 'Verifikasi bansos berhasil disimpan!');
      setShowVerifyModal(false);
      fetchBansos();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal memproses verifikasi bansos');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Filtered List based on tab
  const displayedList = bansosList.filter((item) => {
    if (activeTab === 'pending_my_action') {
      if (isRW) return item.status === 'PENDING_RW' || item.approval_step === 'RW';
      if (isKelurahan) return item.status === 'PENDING_KELURAHAN' || item.approval_step === 'KELURAHAN';
    }
    return true;
  });

  const renderStatusBadge = (item) => {
    switch (item.status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Disahkan Kelurahan
          </span>
        );
      case 'PENDING_KELURAHAN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 size={13} /> Verifikasi Kelurahan
          </span>
        );
      case 'PENDING_RW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} /> Menunggu Verifikasi RW
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} /> Ditolak
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {item.status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-max-width mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <ShieldCheck size={14} /> Tata Kelola Bantuan Berbasis Evidensi
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface flex items-center gap-3">
            <Gift className="text-primary" size={32} />
            Penyaluran Bantuan Sosial (Bansos)
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Mekanisme usulan dan persetujuan penerima manfaat secara berjenjang (RT &rarr; RW &rarr; Kelurahan).
          </p>
        </div>

        {isOfficer && (
          <button
            onClick={() => setShowProposeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-semibold shadow-sm hover:bg-primary/90 transition-colors text-sm self-start md:self-auto"
          >
            <Plus size={18} /> Usulkan Penerima Bansos
          </button>
        )}
      </header>

      {/* ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center gap-3 text-sm font-medium"
          >
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
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

      {/* STATS CARDS (OFFICER) */}
      {isOfficer && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium">Total Usulan</p>
            <h3 className="text-2xl font-bold text-on-surface mt-1">{stats.total_usulan || 0}</h3>
            <p className="text-[11px] text-on-surface-variant mt-1">Seluruh Program Bantuan</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium">Penerima Disahkan</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.total_disetujui || 0}</h3>
            <p className="text-[11px] text-emerald-700 mt-1 font-medium">Tervalidasi Kelurahan</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium">Proses Verifikasi</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {(Number(stats.pending_rw) || 0) + (Number(stats.pending_kelurahan) || 0)}
            </h3>
            <p className="text-[11px] text-amber-700 mt-1 font-medium">Tahap RW & Kelurahan</p>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm">
            <p className="text-xs text-on-surface-variant font-medium">Total Bantuan Tersalur</p>
            <h3 className="text-xl font-bold text-primary mt-1">
              Rp {Number(stats.total_dana_tersalurkan || 0).toLocaleString('id-ID')}
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-1">Dana Bantuan Terverifikasi</p>
          </div>
        </div>
      )}

      {/* TABS (FOR RW & KELURAHAN OFFICERS) */}
      {(isRW || isKelurahan) && (
        <div className="flex border-b border-outline-variant bg-surface-container-lowest rounded-t-xl overflow-hidden p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <Users size={16} />
            <span>Semua Usulan & Penerima Bansos</span>
          </button>
          <button
            onClick={() => setActiveTab('pending_my_action')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pending_my_action'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <Clock size={16} />
            <span>
              Menunggu Verifikasi Anda ({
                isRW ? (stats.pending_rw || 0) : (stats.pending_kelurahan || 0)
              })
            </span>
          </button>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari penerima, NIK, atau No KK..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-on-surface-variant" />
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="px-3 py-2 text-sm bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Semua Jenis Bansos</option>
            {JENIS_BANSOS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          {isOfficer && user?.role !== 'ketua_rt' && (
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
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold">
              <tr>
                <th className="p-4">No. Pengajuan / Tgl</th>
                <th className="p-4">Penerima Manfaat</th>
                <th className="p-4">Jenis Program</th>
                <th className="p-4 text-right">Estimasi Bantuan</th>
                <th className="p-4 text-center">Status Verifikasi</th>
                <th className="p-4">Alasan & Catatan</th>
                {isOfficer && <th className="p-4 text-center">Aksi Petugas</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {loading ? (
                <tr>
                  <td colSpan={isOfficer ? 7 : 6} className="p-8 text-center text-on-surface-variant">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat data bantuan sosial...
                  </td>
                </tr>
              ) : displayedList.length === 0 ? (
                <tr>
                  <td colSpan={isOfficer ? 7 : 6} className="p-8 text-center text-on-surface-variant">
                    Tidak ada data penerima bantuan sosial.
                  </td>
                </tr>
              ) : (
                displayedList.map((item) => {
                  const canAct = (isRW && (item.status === 'PENDING_RW' || item.approval_step === 'RW')) ||
                                 (isKelurahan && (item.status === 'PENDING_KELURAHAN' || item.approval_step === 'KELURAHAN'));

                  return (
                    <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4 text-xs font-mono whitespace-nowrap text-on-surface">
                        <div className="font-semibold">{item.nomor_pengajuan}</div>
                        <div className="text-on-surface-variant text-[11px]">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-on-surface">{item.nama_penerima}</div>
                        <div className="text-xs text-on-surface-variant font-mono">NIK: {item.nik_penerima}</div>
                        <div className="text-[11px] text-on-surface-variant font-medium">RT {item.rt} / RW {item.rw}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          {item.jenis_bansos}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold whitespace-nowrap">
                        Rp {Number(item.nominal_bantuan || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        {renderStatusBadge(item)}
                      </td>
                      <td className="p-4 max-w-xs text-xs text-on-surface-variant">
                        <div className="truncate font-medium text-on-surface" title={item.alasan_pengajuan}>
                          {item.alasan_pengajuan}
                        </div>
                        {item.catatan_verifikasi && (
                          <div className="italic text-[11px] text-amber-700 truncate" title={item.catatan_verifikasi}>
                            Catatan: {item.catatan_verifikasi}
                          </div>
                        )}
                      </td>
                      {isOfficer && (
                        <td className="p-4 text-center whitespace-nowrap">
                          {canAct ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => openVerifyModal(item, 'APPROVE')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <Check size={14} /> {isKelurahan ? 'Sahkan' : 'Verifikasi'}
                              </button>
                              <button
                                onClick={() => openVerifyModal(item, 'REJECT')}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-on-surface-variant italic">-</span>
                          )}
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

      {/* ===================================================================== */}
      {/* MODAL USULKAN BANSOS                                                  */}
      {/* ===================================================================== */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Gift className="text-primary" size={20} />
                Usulkan Calon Penerima Bansos
              </h2>
              <button
                onClick={() => setShowProposeModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleProposeSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold mb-1">NIK Calon Penerima Manfaat</label>
                <input
                  type="text"
                  maxLength={16}
                  value={proposeForm.nik_penerima}
                  onChange={(e) => setProposeForm({ ...proposeForm, nik_penerima: e.target.value })}
                  required
                  placeholder="16 Digit NIK"
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Nama Lengkap (Opsional, otomatis dari NIK)</label>
                <input
                  type="text"
                  value={proposeForm.nama_penerima}
                  onChange={(e) => setProposeForm({ ...proposeForm, nama_penerima: e.target.value })}
                  placeholder="Nama warga..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Program Bansos</label>
                  <select
                    value={proposeForm.jenis_bansos}
                    onChange={(e) => setProposeForm({ ...proposeForm, jenis_bansos: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-medium"
                  >
                    {JENIS_BANSOS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Estimasi Nominal (Rp)</label>
                  <input
                    type="number"
                    value={proposeForm.nominal_bantuan}
                    onChange={(e) => setProposeForm({ ...proposeForm, nominal_bantuan: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">RT</label>
                  <input
                    type="text"
                    disabled={user?.role === 'ketua_rt'}
                    value={proposeForm.rt}
                    onChange={(e) => setProposeForm({ ...proposeForm, rt: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-surface-container-high"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">RW</label>
                  <input
                    type="text"
                    disabled={user?.role === 'ketua_rt' || user?.role === 'ketua_rw'}
                    value={proposeForm.rw}
                    onChange={(e) => setProposeForm({ ...proposeForm, rw: e.target.value })}
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-surface-container-high"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Alasan Evidensi Kebutuhan Bantuan</label>
                <textarea
                  rows="3"
                  value={proposeForm.alasan_pengajuan}
                  onChange={(e) => setProposeForm({ ...proposeForm, alasan_pengajuan: e.target.value })}
                  required
                  placeholder="Sebutkan kondisi nyata warga (misal: lansia sebatang kara, balita berat badan di bawah garis merah, buruh harian lepas)..."
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  {submittingAction ? <Loader2 size={16} className="animate-spin" /> : 'Kirim Usulan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL VERIFIKASI / PENGESAHAN BANSOS                                  */}
      {/* ===================================================================== */}
      {showVerifyModal && selectedBansos && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                {verifyAction === 'APPROVE' ? (
                  <CheckCircle2 className="text-emerald-600" size={20} />
                ) : (
                  <XCircle className="text-rose-600" size={20} />
                )}
                {verifyAction === 'APPROVE' ? (isKelurahan ? 'Pengesahan Bansos' : 'Verifikasi Usulan Bansos') : 'Tolak Usulan Bansos'}
              </h2>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant text-xs space-y-1 mb-4">
              <div className="font-semibold text-on-surface">{selectedBansos.nama_penerima}</div>
              <div className="text-on-surface-variant">NIK: {selectedBansos.nik_penerima} &bull; RT {selectedBansos.rt}/RW {selectedBansos.rw}</div>
              <div className="font-medium text-primary">Program: {selectedBansos.jenis_bansos}</div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-3.5 text-sm">
              {verifyAction === 'APPROVE' && isKelurahan && (
                <div>
                  <label className="block font-semibold mb-1">Nominal Bantuan Final (Rp)</label>
                  <input
                    type="number"
                    value={verifyNominal}
                    onChange={(e) => setVerifyNominal(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none font-bold text-primary"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">
                  {verifyAction === 'APPROVE' ? 'Catatan Verifikasi / Keterangan' : 'Alasan Penolakan'}
                </label>
                <textarea
                  rows="3"
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder={verifyAction === 'APPROVE' ? 'Memenuhi syarat berdasarkan survei lapangan...' : 'Belum memenuhi kriteria prioritas...'}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`px-5 py-2 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                    verifyAction === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingAction ? <Loader2 size={16} className="animate-spin" /> : (verifyAction === 'APPROVE' ? 'Konfirmasi Setujui' : 'Konfirmasi Tolak')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

