import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import DataTable from '../components/ui/DataTable';
import { Loader2, Baby, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PosyanduPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPosyandu = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/posyandu');
        if (isMounted) {
          setData(response.data || response || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal mengambil data rekam medis Posyandu.');
          // Provide fallback dummy data for testing UI states when backend isn't linked
          // setData([
          //   { date: '12 Okt 2026', name: 'Budi (Balita)', service: 'Imunisasi Polio', status: 'Normal' },
          //   { date: '12 Sep 2026', name: 'Budi (Balita)', service: 'Timbang Berat Badan', status: 'Stunting Warning' }
          // ]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPosyandu();

    return () => {
      isMounted = false;
    };
  }, []);

  const posyanduColumns = [
    { label: 'Tanggal Kunjungan', className: '' },
    { label: 'Nama Anak/Lansia', className: '' },
    { label: 'Layanan', className: '' },
    { label: 'Status Gizi', className: 'text-center' }
  ];

  const renderPosyanduRow = (row) => (
    <>
      <td className="px-5 py-4 font-medium text-label-md">{row.date}</td>
      <td className="px-5 py-4 font-medium text-on-surface">{row.name}</td>
      <td className="px-5 py-4 text-on-surface-variant text-label-sm">{row.service}</td>
      <td className="px-5 py-4 text-center">
        {row.status === 'Normal' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-tertiary-fixed text-tertiary border border-tertiary/20">
            <CheckCircle size={14} />
            {row.status}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-surface-variant text-on-surface-variant border border-outline-variant">
            <Info size={14} />
            {row.status}
          </span>
        )}
      </td>
    </>
  );

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-headline-lg-mobile lg:text-headline-lg font-bold text-on-surface flex items-center gap-2">
          <Baby className="text-primary" size={32} />
          Layanan Posyandu
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Pantau riwayat layanan imunisasi dan rekam gizi anggota keluarga.
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
          <h3 className="text-headline-md font-semibold text-on-surface">Tidak ada catatan Posyandu</h3>
          <p className="text-body-md">
            Anda belum memiliki riwayat kunjungan Posyandu.
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

