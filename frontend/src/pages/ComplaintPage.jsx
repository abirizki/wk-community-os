import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import DataTable from '../components/ui/DataTable';
import { Loader2, MessageSquare, AlertCircle, Clock, Wrench, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComplaintPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchComplaints = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/complaints');
        if (isMounted) {
          setData(response.data || response || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal mengambil data aduan masyarakat.');
          // Dummy fallback data if backend is offline
          // setData([
          //   { date: '10 Okt 2026', title: 'Lampu jalan mati', category: 'Infrastruktur', status: 'Menunggu' },
          //   { date: '08 Okt 2026', title: 'Ronda malam tidak aktif', category: 'Keamanan', status: 'Diproses' },
          //   { date: '01 Okt 2026', title: 'Pembuatan KK lambat', category: 'Layanan', status: 'Selesai' }
          // ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchComplaints();

    return () => {
      isMounted = false;
    };
  }, []);

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
            {status}
          </span>
        );
    }
  };

  const renderComplaintRow = (row) => (
    <>
      <td className="px-5 py-4 font-medium text-label-md">{row.date || row.createdAt}</td>
      <td className="px-5 py-4 font-medium text-on-surface">{row.title}</td>
      <td className="px-5 py-4 text-on-surface-variant text-label-sm">{row.category}</td>
      <td className="px-5 py-4 text-center">
        {getStatusBadge(row.status)}
      </td>
    </>
  );

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-headline-lg-mobile lg:text-headline-lg font-bold text-on-surface flex items-center gap-2">
          <MessageSquare className="text-primary" size={32} />
          Layanan Pengaduan
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Lacak status penyelesaian aduan warga dan masalah lingkungan.
        </p>
      </header>

      {error && data.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-error-container text-on-error-container p-4 rounded-lg flex items-start gap-3 border border-error/20"
        >
          <AlertCircle size={20} className="text-error mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-label-md">Gangguan Koneksi</h3>
            <p className="text-label-sm mt-1">{error}</p>
          </div>
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

