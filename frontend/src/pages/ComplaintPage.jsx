import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import DataTable from '../components/ui/DataTable';
import { Loader2, MessageSquare, AlertCircle, Clock, Wrench, CheckCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComplaintPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'Infrastruktur',
    lampiran_url: ''
  });

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/pengaduan/me');
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data aduan masyarakat.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

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
      
      // Reset form and refetch
      setFormData({
        judul: '',
        deskripsi: '',
        kategori: 'Infrastruktur',
        lampiran_url: ''
      });
      setShowForm(false);
      fetchComplaints();
    } catch (err) {
      setError(err.message || 'Gagal mengirim pengaduan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const complaintColumns = [
    { label: 'Tanggal Aduan', className: '' },
    { label: 'Judul/Topik', className: '' },
    { label: 'Kategori', className: '' },
    { label: 'Status', className: 'text-center' }
  ];

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'menunggu':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-amber-100 text-amber-700 border border-amber-200">
            <Clock size={14} />
            {status}
          </span>
        );
      case 'diproses':
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <Wrench size={14} />
            {status}
          </span>
        );
      case 'selesai':
      case 'resolved':
      case 'done':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle size={14} />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-surface-variant text-on-surface-variant border border-outline-variant">
            {status || 'PENDING'}
          </span>
        );
    }
  };

  const renderComplaintRow = (row) => (
    <>
      <td className="px-5 py-4 font-medium text-label-md">
        {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID') : '-'}
      </td>
      <td className="px-5 py-4 font-medium text-on-surface">{row.judul}</td>
      <td className="px-5 py-4 text-on-surface-variant text-label-sm">{row.kategori}</td>
      <td className="px-5 py-4 text-center">
        {getStatusBadge(row.status)}
      </td>
    </>
  );

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg-mobile lg:text-headline-lg font-bold text-on-surface flex items-center gap-2">
            <MessageSquare className="text-primary" size={32} />
            Layanan Pengaduan
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Lacak status penyelesaian aduan warga dan masalah lingkungan.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Batal' : <><Plus size={20} /> Buat Aduan Baru</>}
        </button>
      </header>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-container text-on-error-container p-4 rounded-lg flex items-start gap-3 border border-error/20"
        >
          <AlertCircle size={20} className="text-error mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-label-md">Informasi</h3>
            <p className="text-label-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant shadow-sm mb-8"
        >
          <h2 className="text-headline-sm font-bold text-on-surface mb-4">Form Pengaduan Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">Judul Pengaduan</label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: Jalan rusak di RT 01"
              />
            </div>
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">Kategori</label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="Infrastruktur">Infrastruktur</option>
                <option value="Keamanan">Keamanan</option>
                <option value="Layanan">Layanan Kependudukan</option>
                <option value="Lingkungan">Lingkungan Bersih</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label className="block text-label-sm font-semibold text-on-surface mb-1">Deskripsi Lengkap</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                rows="4"
                className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Jelaskan detail aduan Anda secara rinci (min. 10 karakter)..."
              ></textarea>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Mengirim...</>
                ) : (
                  'Kirim Pengaduan'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {isLoading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-48 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card flex flex-col items-center justify-center text-on-surface-variant gap-3"
        >
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className="text-label-md font-medium">Memuat data aduan...</p>
        </motion.div>
      ) : data.length === 0 && !error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full py-16 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card flex flex-col items-center justify-center text-on-surface-variant gap-3 text-center px-4"
        >
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-2">
            <MessageSquare size={32} className="text-outline" />
          </div>
          <h3 className="text-headline-md font-semibold text-on-surface">Belum ada aduan yang diajukan</h3>
          <p className="text-body-md">
            Anda belum pernah mengirimkan laporan pengaduan masyarakat.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DataTable data={data} columns={complaintColumns} renderRow={renderComplaintRow} />
        </motion.div>
      )}
    </div>
  );
}
