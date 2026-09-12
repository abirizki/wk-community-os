import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Plus, 
  Printer, 
  Building2, 
  Sparkles, 
  QrCode, 
  Check, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JENIS_SURAT_OPTIONS = [
  'Surat Keterangan Domisili',
  'Surat Pengantar SKCK',
  'Surat Keterangan Tidak Mampu (SKTM)',
  'Surat Keterangan Usaha (SKU)',
  'Surat Keterangan Kematian',
  'Surat Keterangan Pindah Domisili',
  'Surat Keterangan Belum Menikah'
];

export default function DokumenPage() {
  const { user } = useAuth();

  const isRT = user && user.role === 'ketua_rt';
  const isRW = user && ['ketua_rw', 'admin_rw'].includes(user.role);
  const isKelurahan = user && ['admin_kelurahan', 'superadmin', 'admin'].includes(user.role);
  const isOfficer = isRT || isRW || isKelurahan;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Tab State
  const [activeTab, setActiveTab] = useState(isOfficer ? 'pending_approval' : 'all');

  // Request Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefillInfo, setPrefillInfo] = useState(null);
  const [formData, setFormData] = useState({
    jenis_dokumen: 'Surat Keterangan Domisili',
    keperluan: ''
  });

  // Action (Approval/Rejection) Modal State
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [actionType, setActionType] = useState('APPROVE');
  const [actionNotes, setActionNotes] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // Print Preview Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printDoc, setPrintDoc] = useState(null);

  const fetchDokumen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = isOfficer ? await api.get('/dokumen') : await api.get('/dokumen/me');
      setData(res.data || []);
      // Ambil status prefill AI kelengkapan profil warga
      api.get('/dokumen/prefill-data')
        .then(res => {
          if (res.data) setPrefillInfo(res.data);
        })
        .catch(() => {});
    } catch (err) {
      setError(err.message || 'Gagal mengambil data permohonan surat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumen();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.keperluan || formData.keperluan.trim().length < 5) {
      setError('Mohon sebutkan keperluan surat dengan jelas (minimal 5 karakter)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.post('/dokumen', {
        ...formData,
        is_auto_filled_by_ai: Boolean(prefillInfo?.eligible)
      });
      setSuccessMsg('Permohonan surat berhasil diajukan dan masuk ke antrean verifikasi RT!');
      setFormData({
        jenis_dokumen: 'Surat Keterangan Domisili',
        keperluan: ''
      });
      setShowModal(false);
      await fetchDokumen();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal mengajukan permohonan surat');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Approval / Rejection Modal
  const openActionModal = (doc, type) => {
    setSelectedDoc(doc);
    setActionType(type);
    setActionNotes('');
    setShowActionModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;

    try {
      setSubmittingAction(true);
      setError(null);
      const endpoint = actionType === 'APPROVE' ? `/dokumen/${selectedDoc.id}/approve` : `/dokumen/${selectedDoc.id}/reject`;
      const res = await api.patch(endpoint, { catatan: actionNotes });
      setSuccessMsg(res.message || 'Pembaruan status dokumen berhasil disimpan!');
      setShowActionModal(false);
      await fetchDokumen();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Gagal memproses aksi verifikasi dokumen');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Open Print Modal
  const handlePrint = (doc) => {
    setPrintDoc(doc);
    setShowPrintModal(true);
  };

  // Filter list based on tab
  const displayedData = data.filter((doc) => {
    if (activeTab === 'pending_approval') {
      if (isRT) return doc.approval_step === 'RT' && doc.status !== 'REJECTED';
      if (isRW) return doc.approval_step === 'RW' && doc.status !== 'REJECTED';
      if (isKelurahan) return doc.approval_step === 'KELURAHAN' && doc.status !== 'REJECTED';
    }
    return true;
  });

  const renderStatusBadge = (doc) => {
    if (doc.status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle size={13} /> Ditolak
        </span>
      );
    }

    if (doc.status === 'APPROVED') {
      return (
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Disahkan Kelurahan
          </span>
          {doc.trigger_executed === 1 && (
            <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5">
              <Sparkles size={10} /> Data Diperbarui
            </span>
          )}
        </div>
      );
    }

    let currentStepText = 'Verifikasi RT';
    let stepColor = 'bg-amber-50 text-amber-700 border-amber-200';
    if (doc.approval_step === 'RW') {
      currentStepText = 'Verifikasi RW';
      stepColor = 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (doc.approval_step === 'KELURAHAN') {
      currentStepText = 'Pengesahan Kelurahan';
      stepColor = 'bg-purple-50 text-purple-700 border-purple-200';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${stepColor}`}>
        <Clock size={13} /> {currentStepText}
      </span>
    );
  };

  return (
    <div className="max-w-max-width mx-auto space-y-6 pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <Building2 size={16} />
            <span>Pelayanan Administrasi Terpadu Kelurahan Kebonjati</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <FileCheck className="text-primary" size={28} />
            Pengajuan Dokumen & Surat Warga
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Layanan permohonan surat keterangan dengan alur persetujuan berjenjang (RT &rarr; RW &rarr; Kelurahan) dan otomasi update data.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto text-sm"
        >
          <Plus size={18} />
          Ajukan Surat Baru
        </button>
      </div>

      {/* ALERTS */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl flex items-center justify-between shadow-sm text-sm"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
              <X size={16} />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-xl flex items-center justify-between shadow-sm text-sm"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-800">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS (OFFICERS ONLY) */}
      {isOfficer && (
        <div className="flex border-b border-outline-variant bg-surface-container-lowest rounded-t-xl overflow-hidden p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('pending_approval')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pending_approval'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <Clock size={16} />
            <span>
              Menunggu Tindakan Anda ({
                data.filter((d) => {
                  if (isRT) return d.approval_step === 'RT' && d.status !== 'REJECTED';
                  if (isRW) return d.approval_step === 'RW' && d.status !== 'REJECTED';
                  if (isKelurahan) return d.approval_step === 'KELURAHAN' && d.status !== 'REJECTED';
                  return false;
                }).length
              })
            </span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-low'
            }`}
          >
            <FileText size={16} />
            <span>Semua Dokumen ({data.length})</span>
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-container-low border-b border-outline-variant text-on-surface font-semibold">
              <tr>
                <th className="p-4">No. Registrasi & Tanggal</th>
                <th className="p-4">Identitas Pemohon</th>
                <th className="p-4">Jenis Surat</th>
                <th className="p-4">Keperluan</th>
                <th className="p-4 text-center">Status / Progress</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat antrean dokumen...
                  </td>
                </tr>
              ) : displayedData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    Tidak ada pengajuan permohonan surat.
                  </td>
                </tr>
              ) : (
                displayedData.map((doc) => {
                  const canAct = (
                    (isRT && doc.approval_step === 'RT') ||
                    (isRW && doc.approval_step === 'RW') ||
                    (isKelurahan && doc.approval_step === 'KELURAHAN')
                  ) && doc.status !== 'REJECTED';

                  return (
                    <tr key={doc.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-on-surface text-xs">{doc.nomor_registrasi || `REG-${doc.id}`}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">
                          {doc.created_at ? new Date(doc.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-on-surface">{doc.nama_pemohon || 'Warga'}</div>
                        <div className="text-xs text-on-surface-variant font-mono">NIK: {doc.nik_pemohon}</div>
                        <div className="text-[11px] text-on-surface-variant">RT {doc.rt || '001'} / RW {doc.rw || '001'}</div>
                      </td>
                      <td className="p-4 font-medium text-primary text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{doc.jenis_dokumen || doc.jenis_surat}</span>
                          {doc.is_auto_filled_by_ai ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200" title="Diisi otomatis via AI Auto-Fill">
                              <Sparkles size={10} className="text-blue-500" /> AI
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant max-w-xs truncate" title={doc.keperluan}>
                        {doc.keperluan}
                      </td>
                      <td className="p-4 text-center">
                        {renderStatusBadge(doc)}
                      </td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {doc.status === 'APPROVED' && (
                            <button
                              onClick={() => handlePrint(doc)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                            >
                              <Printer size={14} /> Cetak
                            </button>
                          )}

                          {canAct && (
                            <>
                              <button
                                onClick={() => openActionModal(doc, 'APPROVE')}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                              >
                                <Check size={14} /> {isKelurahan ? 'Sahkan' : 'Setujui'}
                              </button>
                              <button
                                onClick={() => openActionModal(doc, 'REJECT')}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors border border-rose-200"
                              >
                                <X size={14} /> Tolak
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: AJUKAN SURAT BARU */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <FileText className="text-primary" size={20} />
                Permohonan Surat Keterangan Warga
              </h2>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>

            {/* AI Auto-Fill Alert Banner */}
            {prefillInfo?.eligible && (
              <div className="mb-4 p-3.5 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles size={15} className="text-emerald-600" /> AI Smart Auto-Fill Aktif (Profil {prefillInfo.score}% Lengkap)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                    Terverifikasi
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  Profil Anda terverifikasi lengkap. Identitas resmi ({prefillInfo.profile?.nama}, NIK: {prefillInfo.profile?.nik}, No. KK: {prefillInfo.profile?.no_kk}, RT {prefillInfo.profile?.rt}/RW {prefillInfo.profile?.rw}) akan otomatis dilampirkan ke surat resmi.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold mb-1">Jenis Surat Yang Dibutuhkan *</label>
                <select
                  name="jenis_dokumen"
                  value={formData.jenis_dokumen}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                >
                  {JENIS_SURAT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tujuan & Keperluan Surat *</label>
                <textarea
                  name="keperluan"
                  value={formData.keperluan}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Contoh: Persyaratan pembukaan rekening bank / pendaftaran sekolah anak / beasiswa..."
                  className="w-full p-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Jelaskan secara rinci agar petugas RT/RW dan Kelurahan dapat segera menerbitkan pengantar resmi.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Kirim Permohonan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: VERIFIKASI / PENGESAHAN / PENOLAKAN OLEH PETUGAS */}
      {showActionModal && selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 border border-outline-variant shadow-xl my-8"
          >
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-outline-variant">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                {actionType === 'APPROVE' ? (
                  <CheckCircle2 className="text-emerald-600" size={20} />
                ) : (
                  <XCircle className="text-rose-600" size={20} />
                )}
                {actionType === 'APPROVE' ? (isKelurahan ? 'Pengesahan Surat Resmi' : 'Persetujuan Surat') : 'Tolak Permohonan Surat'}
              </h2>
              <button onClick={() => setShowActionModal(false)} className="text-on-surface-variant hover:text-on-surface">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant text-xs space-y-1 mb-4">
              <div className="font-semibold text-on-surface">{selectedDoc.nama_pemohon || selectedDoc.nik_pemohon}</div>
              <div className="text-on-surface-variant font-mono">No. Reg: {selectedDoc.nomor_registrasi || `REG-${selectedDoc.id}`}</div>
              <div className="font-medium text-primary">{selectedDoc.jenis_dokumen || selectedDoc.jenis_surat}</div>
              <div className="text-on-surface-variant">Keperluan: {selectedDoc.keperluan}</div>
            </div>

            {/* Demography trigger alert for Kelurahan */}
            {actionType === 'APPROVE' && isKelurahan && (
              <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-xs flex items-start gap-2 mb-4">
                <Sparkles size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Otomasi Trigger Demografi Aktif:</strong>
                  <span>
                    Pengesahan surat ini akan secara otomatis memperbarui status kependudukan dan basis data terkait di seluruh sistem secara real-time.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold mb-1">
                  {actionType === 'APPROVE' ? 'Catatan Petugas (Opsional)' : 'Alasan Penolakan (Wajib)'}
                </label>
                <textarea
                  rows="3"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  required={actionType === 'REJECT'}
                  placeholder={actionType === 'APPROVE' ? 'Berkas lengkap dan sesuai kriteria...' : 'Sebutkan kekurangan berkas/alasan penolakan...'}
                  className="w-full p-2.5 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-high transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`px-5 py-2 rounded-lg font-semibold text-white transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 ${
                    actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submittingAction ? <Loader2 size={16} className="animate-spin" /> : (actionType === 'APPROVE' ? 'Konfirmasi Persetujuan' : 'Tolak Permohonan')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL 3: PREVIEW CETAK SURAT RESMI */}
      {showPrintModal && printDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white text-slate-900 rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-8 border border-slate-300"
          >
            {/* Kop Surat Kelurahan Kebonjati */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Pemerintah Kota Bandung</h3>
              <h2 className="text-lg font-extrabold uppercase tracking-wide">Kecamatan Andir &bull; Kelurahan Kebonjati</h2>
              <p className="text-xs text-slate-600 mt-1">
                Jl. Kebonjati No. 120, Kec. Andir, Kota Bandung, Jawa Barat 40181
              </p>
            </div>

            {/* Nomor & Judul Surat */}
            <div className="text-center mb-6">
              <h4 className="text-base font-bold underline uppercase tracking-wider">
                {printDoc.jenis_dokumen || printDoc.jenis_surat}
              </h4>
              <p className="text-xs font-mono text-slate-600 mt-1">
                Nomor: {printDoc.nomor_registrasi || `500/REG-${printDoc.id}/KBJ/${new Date().getFullYear()}`}
              </p>
            </div>

            {/* Isi Surat */}
            <div className="space-y-3 text-sm leading-relaxed text-slate-800">
              <p>
                Yang bertanda tangan di bawah ini, Kepala Kelurahan Kebonjati, Kecamatan Andir, Kota Bandung, menerangkan dengan sebenarnya bahwa:
              </p>
              <div className="pl-6 space-y-1.5 font-sans">
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Nama Lengkap</span>
                  <span className="col-span-2 font-bold">: {printDoc.nama_pemohon}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">NIK</span>
                  <span className="col-span-2 font-mono">: {printDoc.nik_pemohon}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Alamat Domisili</span>
                  <span className="col-span-2">: RT {printDoc.rt || '001'} / RW {printDoc.rw || '001'}, Kelurahan Kebonjati</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-600">Keperluan</span>
                  <span className="col-span-2 font-medium">: {printDoc.keperluan}</span>
                </div>
              </div>
              <p className="pt-2">
                Surat keterangan ini diberikan atas permohonan yang bersangkutan setelah melalui verifikasi berjenjang oleh Pengurus RT dan RW setempat.
              </p>
            </div>

            {/* Tanda Tangan & QR Code */}
            <div className="mt-8 pt-4 flex justify-between items-end border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-slate-300 rounded-lg bg-slate-50">
                  <QrCode size={48} className="text-slate-800" />
                </div>
                <div className="text-[11px] text-slate-500">
                  <p className="font-bold text-slate-700">Tersertifikasi Digital</p>
                  <p>Bumi Warga - Jabar Pintar Digital</p>
                  <p className="font-mono text-[10px]">ID: {printDoc.id}-{Date.now().toString(36)}</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <p>Bandung, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
                <p className="font-bold mt-1">Lurah Kebonjati</p>
                <div className="h-12 flex items-center justify-end">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    [SIGNED DIGITALLY]
                  </span>
                </div>
                <p className="font-bold underline text-sm">H. Dedi Mulyadi, S.Sos., M.Si</p>
                <p className="text-[10px] text-slate-500">NIP. 19780412 200501 1 008</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition-colors text-sm"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm flex items-center gap-2"
              >
                <Printer size={16} /> Cetak Sekarang
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
