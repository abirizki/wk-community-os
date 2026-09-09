import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import DataTable from '../components/ui/DataTable';
import { 
  FileCheck, 
  Plus, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  FileText,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const JENIS_SURAT_OPTIONS = [
  'Surat Keterangan Domisili',
  'Surat Pengantar KTP',
  'Surat Keterangan Tidak Mampu',
  'Surat Keterangan Usaha',
  'Surat Keterangan Lahir',
  'Surat Keterangan Meninggal',
  'Lainnya'
];

export default function DokumenPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    jenis_dokumen: 'Surat Keterangan Domisili',
    keperluan: ''
  });

  const fetchDokumen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/dokumen/me');
      setData(res.data || []);
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
      alert('Mohon sebutkan keperluan surat dengan jelas (minimal 5 karakter)');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await api.post('/dokumen', formData);
      setFormData({
        jenis_dokumen: 'Surat Keterangan Domisili',
        keperluan: ''
      });
      setShowModal(false);
      await fetchDokumen();
    } catch (err) {
      alert(err.message || 'Gagal mengajukan permohonan surat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} /> Diajukan
          </span>
        );
      case 'VERIFYING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Loader2 size={13} className="animate-spin text-blue-600" /> Sedang Diverifikasi
          </span>
        );
      case 'APPROVED':
      case 'READY_PICKUP':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Siap Diambil
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
            {status}
          </span>
        );
    }
  };

  const columns = [
    { label: 'Tanggal Pengajuan', className: 'w-44' },
    { label: 'Jenis Dokumen', className: '' },
    { label: 'Keperluan', className: '' },
    { label: 'Status Dokumen', className: 'text-center w-40' },
    { label: 'Catatan Petugas', className: 'w-56' }
  ];

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
            <Building2 size={18} />
            <span>Pelayanan Administrasi Kelurahan Kebonjati</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Pengajuan Dokumen Warga</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Layanan permohonan surat keterangan dan pengantar resmi tanpa antre di kantor kelurahan.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-all active:scale-[0.98] w-full sm:w-auto"
        >
          <Plus size={18} />
          Ajukan Surat Baru
        </button>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-3">
        <ShieldCheck size={20} className="text-primary flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="font-bold">Proses Verifikasi Cepat & Transparan</p>
          <p className="text-blue-800/80 mt-0.5">
            Petugas kelurahan memproses permohonan dalam waktu 1x24 jam kerja. Anda akan menerima notifikasi otomatis di aplikasi setelah surat selesai ditandatangani dan siap diambil.
          </p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={fetchDokumen}
          renderRow={(doc) => (
            <tr key={doc.id} className="border-b border-outline-variant/60 hover:bg-surface-container-low/40 transition-colors">
              <td className="p-4 text-xs font-medium text-on-surface">
                {new Date(doc.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>
              <td className="p-4 text-sm font-semibold text-on-surface flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                {doc.jenis_dokumen}
              </td>
              <td className="p-4 text-xs text-on-surface-variant max-w-xs truncate">
                {doc.keperluan}
              </td>
              <td className="p-4 text-center">
                {renderStatusBadge(doc.status)}
              </td>
              <td className="p-4 text-xs text-on-surface-variant italic">
                {doc.catatan_admin || '-'}
              </td>
            </tr>
          )}
        />
      </div>

      {/* Modal Form Pengajuan */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-elevated w-full max-w-lg overflow-hidden"
            >
              <div className="p-5 border-b border-outline-variant flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-on-surface">Permohonan Surat Baru</h3>
                  <p className="text-xs text-on-surface-variant">Lengkapi data untuk keperluan administrasi resmi.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Jenis Surat yang Dibutuhkan *
                  </label>
                  <select
                    name="jenis_dokumen"
                    value={formData.jenis_dokumen}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    {JENIS_SURAT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">
                    Tujuan & Keperluan Surat *
                  </label>
                  <textarea
                    name="keperluan"
                    value={formData.keperluan}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Contoh: Persyaratan pembukaan rekening bank / pendaftaran sekolah anak / pengajuan beasiswa..."
                    className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/50"
                    required
                  />
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Jelaskan secara rinci agar petugas kelurahan dapat segera menerbitkan format pengantar yang tepat.
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-end gap-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-primary text-on-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow-sm"
                  >
                    {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                    Kirim Permohonan
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

