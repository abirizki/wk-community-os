import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Printer, 
  ArrowLeft,
  Building2,
  Award,
  AlertTriangle
} from 'lucide-react';

export default function VerifySuratPage() {
  const { hash } = useParams();
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function verifyDoc() {
      if (!hash) {
        setError('Kode QR Hash verifikasi tidak ditemukan.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/dokumen/verify/${encodeURIComponent(hash)}`);
        const json = await res.json();

        if (res.ok && json.success && json.valid) {
          setDoc(json.dokumen);
        } else {
          setError(json.message || 'Dokumen atau TTE tidak ditemukan dalam pangkalan data resmi.');
        }
      } catch (err) {
        console.error('Verify error:', err);
        setError('Gagal menghubungi peladen verifikasi. Periksa koneksi internet Anda.');
      } finally {
        setLoading(false);
      }
    }

    verifyDoc();
  }, [hash]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto w-full">
        {/* Top Branding Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-bold text-lg">
              BW
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Bumi Warga - Jabar Pintar Digital</h1>
              <p className="text-xs text-slate-500">Portal Publik Verifikasi Keabsahan Tanda Tangan Elektronik (TTE)</p>
            </div>
          </div>
          <Link
            to="/login"
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Masuk Portal
          </Link>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-800">Memvalidasi Keabsahan TTE...</h3>
            <p className="text-sm text-slate-500 mt-1">Menghubungkan ke buku kas & tanda tangan kriptografis Kelurahan Kebonjati.</p>
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-rose-200">
            <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <XCircle className="w-9 h-9" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">TTE Tidak Sah / Dokumen Tidak Ditemukan</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">{error}</p>
            <div className="bg-amber-50 rounded-xl p-4 text-left border border-amber-200 text-xs text-amber-800 mb-6 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Hati-hati terhadap pemalsuan dokumen!</strong>
                <p className="mt-0.5">Seluruh surat resmi yang diterbitkan oleh Pemerintah Kelurahan Kebonjati memiliki tanda tangan kriptografis unik yang tercatat di server resmi Kota Sukabumi.</p>
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
        {!loading && doc && (
          <div className="bg-white rounded-2xl shadow-md border border-emerald-100 overflow-hidden">
            {/* Verification Banner */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 mb-4 sm:mb-0">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shrink-0 border border-white/30">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-1 backdrop-blur-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> TTE RESMI TERVERIFIKASI
                  </div>
                  <h2 className="text-xl font-bold leading-tight">Dokumen Asli & Sah</h2>
                  <p className="text-xs text-emerald-100 mt-0.5">Tercatat dalam Buku Register Pelayanan Kelurahan Kebonjati</p>
                </div>
              </div>
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" /> Cetak Bukti Verifikasi
              </button>
            </div>

            {/* Official Letterhead Representation */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Kop Kelurahan */}
              <div className="text-center pb-6 border-b-2 border-slate-800 space-y-1">
                <div className="flex items-center justify-center gap-2 text-slate-700 font-semibold text-xs tracking-wider uppercase">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Pemerintah Kota Sukabumi &bull; Kecamatan Cikole
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                  Kelurahan Kebonjati
                </h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Jl. Surya Kencana No. 42, Kebonjati, Cikole, Kota Sukabumi, Jawa Barat 43111 | Telp: (0266) 221155
                </p>
              </div>

              {/* Document Identity */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Jenis Dokumen / Surat</span>
                    <span className="text-base font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      {doc.jenis_dokumen || doc.jenis_surat || 'Surat Keterangan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Nomor Surat Resmi</span>
                    <span className="text-base font-bold text-emerald-700 font-mono mt-0.5 block">
                      {doc.nomor_surat || doc.nomor_registrasi || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Citizen Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Identitas Pemohon</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500">Nama Lengkap</div>
                      <div className="font-semibold text-slate-800">{doc.nama_pemohon}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500">Nomor Induk Kependudukan (NIK)</div>
                      <div className="font-semibold text-slate-800 font-mono">
                        {doc.nik_pemohon ? `${doc.nik_pemohon.substring(0, 6)}******${doc.nik_pemohon.substring(12)}` : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500">Wilayah Domisili</div>
                      <div className="font-semibold text-slate-800">
                        RT {doc.rt || '001'} / RW {doc.rw || '001'}, Kelurahan Kebonjati, Cikole, Sukabumi
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    <div>
                      <div className="text-xs text-slate-500">Tanggal Pengesahan Dokumen</div>
                      <div className="font-semibold text-slate-800">
                        {doc.approved_at ? new Date(doc.approved_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              {doc.keperluan && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Keperluan Permohonan</h4>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm text-slate-700 italic">
                    "{doc.keperluan}"
                  </div>
                </div>
              )}

              {/* TTE Cryptographic Seal */}
              <div className="pt-4 border-t border-slate-200">
                <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 justify-center sm:justify-start">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Tanda Tangan Elektronik Disahkan Secara Digital
                    </div>
                    <p className="text-xs text-emerald-800">
                      Disahkan oleh <strong>Lurah Kebonjati</strong> menggunakan Sertifikat Elektronik BSrE / BSSN Republik Indonesia.
                    </p>
                    <div className="text-[11px] font-mono text-emerald-700 break-all pt-1">
                      SHA256: {doc.qr_code_hash || hash}
                    </div>
                  </div>
                  <div className="w-20 h-20 bg-white rounded-lg border border-emerald-300 p-1 flex items-center justify-center shrink-0 shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.href)}`}
                      alt="QR TTE"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-400 space-y-1">
          <p>&copy; {new Date().getFullYear()} Pemerintah Kelurahan Kebonjati, Kecamatan Cikole, Kota Sukabumi.</p>
          <p>Sistem Layanan Mandiri Terpadu Bumi Warga - Jabar Pintar Digital</p>
        </div>
      </div>
    </div>
  );
}
