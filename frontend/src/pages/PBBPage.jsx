import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import DataTable from '../components/ui/DataTable';
import { Loader2, FileText, AlertCircle, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PBBPage() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingNop, setProcessingNop] = useState(null);

  const fetchPBB = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/pbb/me');
      setData(response.data || []);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data tagihan PBB.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPBB();
  }, []);

  const handlePay = async (nop, tahun) => {
    const key = `${nop}-${tahun}`;
    setProcessingNop(key);
    try {
      await api.post('/pbb/pay', { nop, tahun }, { method: 'PUT' }); // Assuming the API is actually PUT or handles post wrapper
      // Actually we should use api.request with method PUT, or api.post works since the backend is PUT and api wrapper only has post/get
      // Wait, api.js doesn't have put. Let me use api.request.
      await api.request('/pbb/pay', {
        method: 'PUT',
        body: JSON.stringify({ nop, tahun })
      });
      // Refresh data
      await fetchPBB();
    } catch (err) {
      alert(err.message || 'Gagal melakukan pembayaran');
    } finally {
      setProcessingNop(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const pbbColumns = [
    { label: 'Tahun', className: '' },
    { label: 'NOP', className: '' },
    { label: 'Nominal (Rp)', className: '' },
    { label: 'Status', className: 'text-center' },
    { label: 'Aksi', className: 'text-center' }
  ];

  const renderPbbRow = (row) => {
    const isPaid = row.status_pembayaran === 'PAID';
    const isProcessing = processingNop === `${row.nop}-${row.tahun}`;

    return (
      <>
        <td className="px-5 py-4 font-medium text-label-md">{row.tahun}</td>
        <td className="px-5 py-4 font-mono text-label-sm">{row.nop}</td>
        <td className="px-5 py-4 text-on-surface">{formatCurrency(row.nominal)}</td>
        <td className="px-5 py-4 text-center">
          {isPaid ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-tertiary-fixed text-tertiary border border-tertiary/20">
              <ShieldCheck size={14} />
              Lunas
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-label-sm font-semibold bg-error-container text-on-error-container border border-error/20">
              <AlertCircle size={14} />
              Belum Bayar
            </span>
          )}
        </td>
        <td className="px-5 py-4 text-center">
          {!isPaid && (
            <button
              onClick={() => handlePay(row.nop, row.tahun)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary text-label-sm font-semibold rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <><Loader2 size={14} className="animate-spin" /> Proses...</>
              ) : (
                <><CreditCard size={14} /> Bayar</>
              )}
            </button>
          )}
        </td>
      </>
    );
  };

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
            Tidak ada tagihan PBB yang terkait dengan NIK Anda.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <DataTable data={data} columns={pbbColumns} renderRow={renderPbbRow} />
        </motion.div>
      )}
    </div>
  );
}
