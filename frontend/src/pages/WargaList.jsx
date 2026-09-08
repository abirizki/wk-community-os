import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Loader2, Users, Search, AlertCircle } from 'lucide-react';

export default function WargaList() {
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWarga();
  }, []);

  const fetchWarga = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/warga');
      if (response.success) {
        setWargaList(response.data);
      } else {
        setError('Gagal memuat data warga');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat data warga');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-on-surface-variant font-medium">Memuat data warga...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container text-on-error-container p-4 rounded-lg flex items-center gap-3">
        <AlertCircle size={24} />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-max-width mx-auto space-y-6">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface flex items-center gap-3">
            <Users className="text-primary" size={32} />
            Data Warga
          </h1>
          <p className="text-body-md text-on-surface-variant mt-1">
            Daftar seluruh warga yang terdaftar di sistem.
          </p>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-lg border border-outline-variant shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="p-4 text-label-sm font-semibold text-on-surface">NIK</th>
                <th className="p-4 text-label-sm font-semibold text-on-surface">No KK</th>
                <th className="p-4 text-label-sm font-semibold text-on-surface">Nama Lengkap</th>
                <th className="p-4 text-label-sm font-semibold text-on-surface">L/P</th>
                <th className="p-4 text-label-sm font-semibold text-on-surface">Alamat</th>
              </tr>
            </thead>
            <tbody>
              {wargaList.length > 0 ? (
                wargaList.map((warga) => (
                  <tr key={warga.nik} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                    <td className="p-4 text-body-sm font-medium text-on-surface">{warga.nik}</td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{warga.no_kk}</td>
                    <td className="p-4 text-body-sm font-semibold text-on-surface">{warga.nama}</td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{warga.jenis_kelamin}</td>
                    <td className="p-4 text-body-sm text-on-surface-variant">{warga.alamat}, RT {warga.rt}/RW {warga.rw}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-on-surface-variant">
                    Tidak ada data warga.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

