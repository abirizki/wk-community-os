import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Users, 
  User, 
  MapPin, 
  Printer, 
  ArrowLeft,
  Building2,
  Calendar,
  AlertTriangle,
  QrCode,
  FileCheck2,
  HeartHandshake
} from 'lucide-react';

export default function VerifyKkPage() {
  const { noKk } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verifyKk() {
      if (!noKk) {
        setError('Nomor Kartu Keluarga tidak ditemukan dalam tautan verifikasi.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/kk/verify/${encodeURIComponent(noKk)}`);
        const json = await res.json();

        if (res.ok && json.success && json.valid) {
          setData(json.data);
        } else {
          setError(json.message || 'Kartu Keluarga tidak ditemukan atau belum terdaftar dalam pangkalan data resmi.');
        }
      } catch (err) {
        console.error('Verify KK error:', err);
        setError('Gagal menghubungi peladen verifikasi. Periksa koneksi internet Anda.');
      } finally {
        setLoading(false);
      }
    }

    verifyKk();
  }, [noKk]);

  const handlePrint = () => {
    window.print();
  };

  const getRelationBadge = (rel) => {
    const r = (rel || '').toLowerCase();
    if (r.includes('kepala')) {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">Kepala Keluarga</span>;
    }
    if (r.includes('istri')) {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">Istri</span>;
    }
    if (r.includes('anak')) {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">Anak</span>;
    }
    if (r.includes('orang tua') || r.includes('mertua')) {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">Orang Tua / Mertua</span>;
    }
    if (r.includes('famili') || r.includes('cucu') || r.includes('menantu')) {
      return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">{rel}</span>;
    }
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">{rel || 'Anggota'}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto w-full">
        {/* Top Branding Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-bold text-lg">
              BW
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Bumi Warga - Jabar Pintar Digital</h1>
              <p className="text-xs text-slate-500">Portal Publik Verifikasi Keabsahan Kartu Keluarga & Kependudukan Sah</p>
            </div>
          </div>
          <Link
            to="/login"
            className="text-xs font-medium text-sky-700 hover:text-sky-800 flex items-center gap-1 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Masuk Portal
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-800">Memverifikasi Keabsahan Kartu Keluarga...</h3>
            <p className="text-sm text-slate-500 mt-1">Menghubungkan ke pangkalan data kependudukan resmi Kelurahan Kebonjati, Kota Sukabumi.</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-rose-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <XCircle className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Kartu Keluarga Tidak Terdaftar / Tidak Valid</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">{error}</p>
            <div className="bg-amber-50 rounded-xl p-4 text-left border border-amber-200 text-xs text-amber-800 mb-6 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Perhatian Keabsahan Dokumen Kependudukan!</strong>
                <p className="mt-0.5">
                  Seluruh Kartu Keluarga resmi yang terdaftar di lingkungan Kelurahan Kebonjati diterbitkan oleh Dinas Kependudukan dan Pencatatan Sipil serta tercatat pada buku register digital wilayah Kota Sukabumi.
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        )}

        {/* Valid Certificate View */}
        {!loading && data && (
          <div className="bg-white rounded-2xl shadow-md border border-sky-100 overflow-hidden">
            {/* Verification Banner */}
            <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-blue-700 p-6 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 border border-white/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-1 backdrop-blur-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DOKUMEN RESMI TERVERIFIKASI
                  </div>
                  <h2 className="text-xl font-bold leading-tight">Kartu Keluarga Sah & Aktif</h2>
                  <p className="text-xs text-sky-100 mt-0.5">
                    Terdaftar di Pangkalan Data Kependudukan Pemerintah Kelurahan Kebonjati
                  </p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-sky-800 hover:bg-sky-50 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" /> Cetak Bukti Verifikasi
              </button>
            </div>

            {/* Official Details */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Kop Instansi */}
              <div className="text-center pb-6 border-b-2 border-slate-800 space-y-1">
                <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold text-xs tracking-wider uppercase">
                  <Building2 className="w-4 h-4 text-sky-600" />
                  Pemerintah Kota Sukabumi &bull; Dinas Kependudukan & Pencatatan Sipil
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Ringkasan Verifikasi Kartu Keluarga Digital
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Wilayah Pelayanan: Kelurahan Kebonjati, Kecamatan Sukabumi, Kota Sukabumi, Jawa Barat
                </p>
              </div>

              {/* Family & Address Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Nomor Kartu Keluarga (No. KK)</span>
                  <span className="text-lg font-mono font-bold text-sky-800 block mt-1">
                    {data.no_kk_masked || data.no_kk}
                  </span>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>Status Arsip:</span>
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {data.penerbit?.status_arsip || 'AKTIF & SAH'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Kepala Keluarga</span>
                  <span className="text-lg font-bold text-slate-900 block mt-1 uppercase">
                    {data.kepala_keluarga}
                  </span>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <span>Jumlah Anggota:</span>
                    <span className="font-semibold text-slate-800">{data.total_jiwa} Jiwa Terdaftar</span>
                  </div>
                </div>
              </div>

              {/* Domisili */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-600 mt-0.5 shrink-0" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                  <div>
                    <span className="text-slate-400 block">Alamat Domisili:</span>
                    <span className="font-semibold text-slate-800">{data.alamat}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">RT / RW:</span>
                    <span className="font-semibold text-slate-800">RT {data.rt} / RW {data.rw}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kelurahan & Kota:</span>
                    <span className="font-semibold text-slate-800">{data.kelurahan}, {data.kota}</span>
                  </div>
                </div>
              </div>

              {/* Family Members Table (Including Extended Family) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-600" />
                    Daftar Anggota Keluarga Terdaftar ({data.anggota?.length || 0} Jiwa)
                  </h4>
                  <span className="text-[11px] text-slate-500 italic">
                    Termasuk Kepala Keluarga, Pasangan, Anak, Orang Tua, & Famili Lain
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 text-center w-10">No</th>
                        <th className="py-2.5 px-3">Nama Lengkap</th>
                        <th className="py-2.5 px-3 font-mono">NIK (Masked)</th>
                        <th className="py-2.5 px-3">Hubungan Keluarga</th>
                        <th className="py-2.5 px-3">Jenis Kelamin</th>
                        <th className="py-2.5 px-3">Pekerjaan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(data.anggota || []).map((m) => (
                        <tr key={m.no} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-bold text-slate-500">{m.no}</td>
                          <td className="py-3 px-3 font-bold text-slate-900 uppercase">{m.nama}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{m.nik_masked}</td>
                          <td className="py-3 px-3">{getRelationBadge(m.status_hubungan_keluarga)}</td>
                          <td className="py-3 px-3 text-slate-700">{m.jenis_kelamin}</td>
                          <td className="py-3 px-3 text-slate-700">{m.pekerjaan}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal Notes */}
              <div className="bg-sky-50/70 rounded-xl p-4 border border-sky-200 text-xs text-sky-900 flex items-start gap-3">
                <FileCheck2 className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Keabsahan Tanda Tangan Elektronik & Verifikasi SPBE</p>
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    Dokumen ini adalah ringkasan verifikasi digital Kartu Keluarga resmi yang disahkan melalui Sistem Pemerintahan Berbasis Elektronik (SPBE). Sesuai dengan Permendagri No. 109 Tahun 2019, pencatatan mencakup seluruh anggota keluarga yang bertempat tinggal bersama (termasuk orang tua, mertua, anak, dan famili lain).
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    Waktu Verifikasi: {new Date(data.verified_at).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'medium' })} WIB
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Pemerintah Kota Sukabumi &bull; Aplikasi Super Apps Bumi Warga
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to="/scanner"
                  className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 font-medium transition-colors"
                >
                  Pindai Dokumen Lain
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 bg-sky-600 text-white hover:bg-sky-700 rounded-lg font-medium transition-colors"
                >
                  Masuk ke Portal
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} Pemerintah Kelurahan Kebonjati, Kecamatan Sukabumi, Kota Sukabumi. Seluruh hak cipta dilindungi.
      </footer>
    </div>
  );
}
