import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/ui/DataTable';
import { 
  Loader2, 
  MessageSquare, 
  AlertCircle, 
  Clock, 
  Wrench, 
  CheckCircle, 
  Plus, 
  X, 
  Users, 
  ShieldCheck,
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComplaintPage() {
  const { user } = useAuth();
  const isRT = user?.role === 'ketua_rt';
  const isRW = user && ['ketua_rw', 'admin_rw'].includes(user.role);
  const isKelurahan = user && ['admin_kelurahan', 'superadmin', 'admin', 'lurah'].includes(user.role);
  const isOfficer = isRT || isRW || isKelurahan;

  const [activeTab, setActiveTab] = useState(isOfficer ? 'wilayah' : 'me'); // 'wilayah' | 'me'
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Infrastruktur',
    lampiran_url: ''
  });

  // Action / Mediation Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showMediationModal, setShowMediationModal] = useState(false);
  const [submittingMediation, setSubmittingMediation] = useState(false);
  const [mediationForm, setMediationForm] = useState({
    status: 'PROCESSING',
    catatan_admin: ''
  });

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = (isOfficer && activeTab === 'wilayah') ? '/pengaduan' : '/pengaduan/me';
      const response = await api.get(endpoint);
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data aduan masyarakat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [activeTab, isOfficer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError(null);
      await api.post('/pengaduan', formData);
      
      setFormData({
        judul: '',
        deskripsi: '',
        kategori: 'Infrastruktur',
        lampiran_url: ''
      });
      setShowForm(false);
      setSuccessMsg('Aduan Anda berhasil dikirimkan ke aparatur lingkungan.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchComplaints();
    } catch (err) {
      setError(err.message || 'Gagal mengirim pengaduan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenMediation = (complaint) => {
    setSelectedComplaint(complaint);
    setMediationForm({
      status: complaint.status === 'PENDING' ? 'PROCESSING' : complaint.status,
      catatan_admin: complaint.catatan_admin || ''
    });
    setShowMediationModal(true);
  };

  const handleSaveMediation = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    try {
      setSubmittingMediation(true);
      setError(null);
      await api.patch(`/pengaduan/${selectedComplaint.id}/status`, mediationForm);
      setSuccessMsg(`Status aduan "${selectedComplaint.judul}" berhasil diperbarui.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowMediationModal(false);
      fetchComplaints();
    } catch (err) {
      setError(err.message || 'Gagal memperbarui status pengaduan.');
    } finally {
      setSubmittingMediation(false);
    }
  };

  const complaintColumns = [
    { label: 'Tanggal Aduan', className: '' },
    ...(isOfficer && activeTab === 'wilayah' ? [{ label: 'Warga Pelapor', className: '' }] : []),
    { label: 'Judul & Deskripsi', className: '' },
    { label: 'Kategori', className: '' },
    { label: 'Status', className: 'text-center' },
    ...(isOfficer && activeTab === 'wilayah' ? [{ label: 'Aksi Tindak Lanjut', className: 'text-right' }] : [])
  ];

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
      case 'MENUNGGU':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock size={13} /> Menunggu Verifikasi
          </span>
        );
      case 'PROCESSING':
      case 'DIPROSES':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
            <Wrench size={13} /> Sedang Ditindaklanjuti
          </span>
        );
      case 'RESOLVED':
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle size={13} /> Selesai / Tuntas
          </span>
        );
      case 'REJECTED':
      case 'DITOLAK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <X size={13} /> Ditolak / Tidak Sesuai
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status || 'PENDING'}
          </span>
        );
    }
  };

  const renderComplaintRow = (row) => (
    <>
      <td className="px-5 py-4 font-mono text-xs text-slate-500 whitespace-nowrap">
        {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
      </td>
      {isOfficer && activeTab === 'wilayah' && (
        <td className="px-5 py-4 text-xs">
          <p className="font-bold text-slate-900">{row.nama_pelapor || 'Warga Terdata'}</p>
          <p className="text-[11px] font-mono text-slate-500">
            RT {row.rt || '—'} / RW {row.rw || '—'}
          </p>
          {row.telepon_pelapor && (
            <p className="text-[10px] text-sky-700 font-mono mt-0.5">{row.telepon_pelapor}</p>
          )}
        </td>
      )}
      <td className="px-5 py-4 text-xs">
        <p className="font-bold text-slate-900">{row.judul}</p>
        <p className="text-slate-600 line-clamp-2 mt-0.5 text-[11px] leading-relaxed">{row.deskripsi}</p>
        {row.catatan_admin && (
          <div className="mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-700">
            <span className="font-semibold text-slate-800 block">Tanggapan Aparatur:</span>
            {row.catatan_admin}
          </div>
        )}
      </td>
      <td className="px-5 py-4 text-slate-600 text-xs whitespace-nowrap">
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200">
          {row.kategori}
        </span>
      </td>
      <td className="px-5 py-4 text-center whitespace-nowrap">
        {getStatusBadge(row.status)}
      </td>
      {isOfficer && activeTab === 'wilayah' && (
        <td className="px-5 py-4 text-right whitespace-nowrap">
          <button
            onClick={() => handleOpenMediation(row)}
            className="px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-300 rounded-lg text-xs font-semibold hover:bg-sky-100 transition cursor-pointer"
          >
            Tanggapi / Mediasi
          </button>
        </td>
      )}
    </>
  );

  return (
    <div className="max-w-max-width mx-auto space-y-6 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-semibold mb-2 border border-sky-200">
            <ShieldCheck size={14} /> Kanal Aspirasi & Aduan Warga Lingkungan
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare className="text-sky-600" size={32} />
            Layanan Pengaduan & Ketertiban
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {isOfficer
              ? `Pusat penanganan dan mediasi aduan ketertiban lingkungan untuk wilayah ${isRT ? `RT ${user?.rt} / RW ${user?.rw}` : isRW ? `RW ${user?.rw}` : 'Kelurahan Kebonjati'}.`
              : 'Sampaikan aduan fasilitas, sampah, kebersihan, atau ketertiban lingkungan secara langsung ke pengurus.'}
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-sky-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {showForm ? 'Tutup Formulir' : <><Plus size={16} /> Buat Aduan Baru</>}
        </button>
      </header>

      {/* TABS UNTUK APARATUR (RT / RW / KELURAHAN) */}
      {isOfficer && (
        <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 gap-1">
          <button
            onClick={() => setActiveTab('wilayah')}
            className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'wilayah'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users size={15} />
            <span>Aduan Warga Lingkungan {isRT ? `RT ${user?.rt}` : isRW ? `RW ${user?.rw}` : 'Kelurahan'}</span>
          </button>

          <button
            onClick={() => setActiveTab('me')}
            className={`py-2 px-4 rounded-lg font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'me'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText size={15} />
            <span>Aduan Pribadi Saya</span>
          </button>
        </div>
      )}

      {/* NOTIFICATIONS */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <CheckCircle size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-50 text-rose-800 p-3.5 rounded-xl flex items-start gap-3 border border-rose-200 text-xs"
        >
          <AlertCircle size={16} className="text-rose-600 mt-0.5 shrink-0" />
          <p className="font-medium">{error}</p>
        </motion.div>
      )}

      {/* FORM PENGADUAN BARU */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Plus size={16} className="text-sky-600" /> Form Laporan Pengaduan Baru
          </h2>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Judul / Pokok Masalah *</label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                placeholder="Contoh: Lampu PJU Mati di Dekat Pos Ronda / Sampah Liar di Saluran Air"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Masalah *</label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white text-xs"
                >
                  <option value="Infrastruktur">Infrastruktur (Jalan, Lampu, Drainase)</option>
                  <option value="Keamanan">Keamanan & Ketertiban Lingkungan</option>
                  <option value="Kebersihan">Kebersihan & Pengangkutan Sampah</option>
                  <option value="Layanan">Pelayanan Administrasi Warga</option>
                  <option value="Sosial">Sosial & Ketetanggaan</option>
                  <option value="Lainnya">Lain-lain</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tautan Foto Pendukung (Opsional)</label>
                <input
                  type="text"
                  name="lampiran_url"
                  value={formData.lampiran_url}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                  placeholder="Contoh: https://... / URL foto bukti lapangan"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deskripsi & Lokasi Faktual Rinci *</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                rows="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-sky-500 text-xs"
                placeholder="Jelaskan secara jelas duduk perkara masalah, lokasi patokan kejadian, dan pihak terkait (minimal 10 karakter)..."
              ></textarea>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 bg-sky-600 text-white rounded-xl font-bold shadow-xs hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <><Loader2 size={15} className="animate-spin" /> Mengirim...</>
                ) : (
                  <><Send size={15} /> Kirim Pengaduan</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* TABEL DAFTAR ADUAN */}
      {isLoading ? (
        <div className="w-full h-48 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-2">
          <Loader2 size={28} className="animate-spin text-sky-600" />
          <p className="text-xs font-semibold">Memuat data pengaduan...</p>
        </div>
      ) : data.length === 0 && !error ? (
        <div className="w-full py-14 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-500 gap-2 text-center px-4">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-1">
            <MessageSquare size={24} className="text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Belum ada aduan tercatat</h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {isOfficer && activeTab === 'wilayah'
              ? 'Seluruh lingkungan terpantau kondusif, belum ada laporan aduan masuk dari warga.'
              : 'Anda belum pernah mengirimkan laporan pengaduan masyarakat.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <DataTable data={data} columns={complaintColumns} renderRow={renderComplaintRow} />
        </div>
      )}

      {/* MODAL TINDAK LANJUT / MEDIASI RW & RT */}
      {showMediationModal && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 text-xs"
          >
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                  Meja Mediasi & Tindak Lanjut
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedComplaint.judul}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediationModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-slate-600">
              <p><strong>Pelapor:</strong> {selectedComplaint.nama_pelapor || 'Warga'} (RT {selectedComplaint.rt}/RW {selectedComplaint.rw})</p>
              <p><strong>Kategori:</strong> {selectedComplaint.kategori}</p>
              <p className="italic text-slate-700 pt-1 border-t border-slate-200/80">"{selectedComplaint.deskripsi}"</p>
            </div>

            <form onSubmit={handleSaveMediation} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Status Penanganan *</label>
                <select
                  value={mediationForm.status}
                  onChange={(e) => setMediationForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs"
                  required
                >
                  <option value="PROCESSING">Sedang Ditindaklanjuti / Dalam Mediasi RT/RW</option>
                  <option value="RESOLVED">Selesai / Kesepakatan Damai Tercapai</option>
                  <option value="REJECTED">Ditolak / Laporan Tidak Berdasar</option>
                  <option value="PENDING">Menunggu Tindak Lanjut</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Catatan Tanggapan / Hasil Mediasi *</label>
                <textarea
                  rows="3"
                  value={mediationForm.catatan_admin}
                  onChange={(e) => setMediationForm(prev => ({ ...prev, catatan_admin: e.target.value }))}
                  placeholder="Tuliskan catatan tindak lanjut, hasil koordinasi dengan warga, atau solusi penanganan..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMediationModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingMediation}
                  className="px-5 py-2 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingMediation ? 'Menyimpan...' : 'Simpan Status Penanganan'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
