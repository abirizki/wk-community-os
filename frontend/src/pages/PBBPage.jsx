import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import DataTable from '../components/ui/DataTable';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PBBPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchPBB = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/pbb');
        if (isMounted) {
          setData(response.data || response || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Gagal mengambil data tagihan PBB.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPBB();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-headline-lg-mobile lg:text-headline-lg font-bold text-on-surface flex items-center gap-2">
          <FileText className="text-primary" size={32} />
          Layanan PBB
        </h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Pantau status tagihan dan pembayaran Pajak Bumi dan Bangunan Anda.
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
          <p className="text-label-md font-medium">Memuat data tagihan...</p>
        </motion.div>
      ) : data.length === 0 && !error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full py-16 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-card flex flex-col items-center justify-center text-on-surface-variant gap-3 text-center px-4"
        >
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-2">
            <FileText size={32} className="text-outline" />
          </div>
          <h3 className="text-headline-md font-semibold text-on-surface">Tidak ada data</h3>
          <p className="text-body-md">
            Tidak ada tagihan PBB yang terkait dengan akun ini.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DataTable data={data} />
        </motion.div>
      )}
    </div>
  );
}

