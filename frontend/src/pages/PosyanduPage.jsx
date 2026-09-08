import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import DataTable from '../components/ui/DataTable';
import { Loader2, Baby, AlertCircle, CheckCircle, Info, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PosyanduPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_anak: '',
    umur_bulan: '',
    berat_badan_kg: '',
    tinggi_badan_cm: '',
    catatan_kesehatan: ''
  });

  const fetchPosyandu = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/posyandu/me');
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data rekam medis Posyandu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosyandu();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Extra Frontend Validation
    if (Number(formData.umur_bulan) < 0 || Number(formData.berat_badan_kg) < 0 || Number(formData.tinggi_badan_cm) < 0) {
      setError('Nilai umur, berat, dan tinggi badan tidak boleh negatif.');
      return;
    }

    try {
      setIsSubmitting(true);
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
        nama_anak: '',
        umur_bulan: '',
        berat_badan_kg: '',
        tinggi_badan_cm: '',
        catatan_kesehatan: ''
      });
      setShowForm(false);
      fetchPosyandu();
    } catch (err) {
      setError(err.message || 'Gagal mencatat pemeriksaan Posyandu.');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-headline-lg-mobile lg:text-headline-lg font-bold text-on-surface flex items-center gap-2">
            <Baby className="text-primary" size={32} />
            Layanan Posyandu
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Pantau riwayat layanan pemeriksaan dan rekam medis anak Anda.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Batal' : <><Plus size={20} /> Catat Pemeriksaan</>}
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
            <h3 className="font-semibold text-label-md">Pemberitahuan</h3>
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
          <h2 className="text-headline-sm font-bold text-on-surface mb-4">Pencatatan Pemeriksaan Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">Nama Anak</label>
                <input
                  type="text"
                  name="nama_anak"
                  value={formData.nama_anak}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">Umur (Bulan)</label>
                <input
                  type="number"
                  name="umur_bulan"
                  value={formData.umur_bulan}
                  onChange={handleInputChange}
                  required
                  min="0"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">Berat Badan (Kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="berat_badan_kg"
                  value={formData.berat_badan_kg}
                  onChange={handleInputChange}
                  required
                  min="0"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="block text-label-sm font-semibold text-on-surface mb-1">Tinggi Badan (Cm)</label>
                <input
                  type="number"
                  step="0.1"
                  name="tinggi_badan_cm"
                  value={formData.tinggi_badan_cm}
                  onChange={handleInputChange}
                  required
                  min="0"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-outline-variant rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0.0"
                />
              </div>
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Menyimpan...</>
                ) : (
                  'Simpan Data'
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
