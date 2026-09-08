import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../utils/api';
import { Loader2, User, AlertCircle, MapPin, Calendar, Briefcase } from 'lucide-react';

export default function WargaDetail() {
  const { nik } = useParams();
  const [warga, setWarga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (nik) {
      fetchWargaDetail();
    }
  }, [nik]);

  const fetchWargaDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/warga/${nik}`);
      if (response.success && response.data) {
        setWarga(response.data);
      } else {
        setError('Data warga tidak ditemukan');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat detail warga');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-on-surface-variant font-medium">Memuat detail warga...</span>
      </div>
    );
  }

  if (error || !warga) {
    return (
      <div className="bg-error-container text-on-error-container p-4 rounded-lg flex items-center gap-3">
        <AlertCircle size={24} />
        <p className="font-medium">{error || 'Warga tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-surface-container-lowest p-6 rounded-lg border border-outline-variant shadow-sm">
        <div className="flex items-center gap-4 border-b border-outline-variant pb-6 mb-6">
          <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center text-2xl font-bold">
            {warga.nama?.charAt(0) || <User size={32} />}
          </div>
          <div>
            <h1 className="text-headline-sm font-bold text-on-surface">{warga.nama}</h1>
            <p className="text-body-md text-on-surface-variant flex items-center gap-2">
              NIK: {warga.nik} <span className="text-outline-variant">•</span> KK: {warga.no_kk}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-label-sm font-medium text-on-surface-variant flex items-center gap-1.5">
                <Calendar size={16} />
                Tempat, Tanggal Lahir
              </p>
              <p className="text-body-md font-medium text-on-surface mt-1">
                {warga.tempat_lahir}, {new Date(warga.tanggal_lahir).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-medium text-on-surface-variant flex items-center gap-1.5">
                <User size={16} />
                Jenis Kelamin & Agama
              </p>
              <p className="text-body-md font-medium text-on-surface mt-1">
                {warga.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'} - {warga.agama}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-medium text-on-surface-variant flex items-center gap-1.5">
                <Briefcase size={16} />
                Pekerjaan
              </p>
              <p className="text-body-md font-medium text-on-surface mt-1">
                {warga.pekerjaan || '-'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-label-sm font-medium text-on-surface-variant flex items-center gap-1.5">
                <MapPin size={16} />
                Alamat Lengkap
              </p>
              <p className="text-body-md font-medium text-on-surface mt-1">
                {warga.alamat}<br/>
                RT {warga.rt} / RW {warga.rw}<br/>
                {warga.kelurahan}, {warga.kecamatan}<br/>
                {warga.kota}, {warga.provinsi}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-medium text-on-surface-variant">Status Kependudukan</p>
              <span className="inline-block mt-1 px-2.5 py-1 rounded text-label-sm font-semibold bg-tertiary-container text-on-tertiary-container">
                {warga.status_kependudukan}
              </span>
            </div>
            <div>
              <p className="text-label-sm font-medium text-on-surface-variant">Status Perkawinan</p>
              <p className="text-body-md font-medium text-on-surface mt-1">
                {warga.status_perkawinan}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

