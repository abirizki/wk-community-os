import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  FileCheck, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  Building2,
  Download,
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function KartuKeluargaPage() {
  const { user, selectProfile } = useAuth();
  const navigate = useNavigate();
  const [kkData, setKkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [switchingNik, setSwitchingNik] = useState(null);

  useEffect(() => {
    async function fetchKK() {
      try {
        setLoading(true);
        const res = await api.get('/kk/my/card');
        if (res.data) {
          setKkData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat Kartu Keluarga Digital.');
      } finally {
        setLoading(false);
      }
    }

    fetchKK();
  }, [user]);

  const handleSelectPersona = async (nik) => {
    try {
      setSwitchingNik(nik);
      await selectProfile(nik);
    } catch (err) {
      alert('Gagal berganti persona: ' + err.message);
    } finally {
      setSwitchingNik(null);
    }
  };

  const handleAjukanSurat = async (member) => {
    try {
      if (user?.active_nik !== member.nik) {
        await selectProfile(member.nik);
      }
      navigate('/dashboard/dokumen');
    } catch (e) {
      console.error(e);
      navigate('/dashboard/dokumen');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-xs text-on-surface-variant font-medium">Memuat Kartu Keluarga Digital...</p>
      </div>
    );
  }

  if (error || !kkData) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-on-surface">Data Kartu Keluarga Tidak Ditemukan</h2>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto mt-1 mb-5">
          {error || 'Akun Anda belum terhubung dengan nomor Kartu Keluarga resmi. Hubungi Ketua RT untuk sinkronisasi data.'}
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Users size={14} />
            <span>Portal Kependudukan Keluarga</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface">Kartu Keluarga Digital</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Dokumen resmi digital keluarga terdaftar Kelurahan Kebonjati, Kec. Andir, Kota Bandung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2 bg-surface-container text-on-surface text-xs font-semibold rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
          >
            <Download size={15} /> Cetak Salinan KK
          </button>
        </div>
      </div>

      {/* Persona Active Banner */}
      {user?.active_nik && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
              <Sparkles size={16} />
            </div>
            <div>
              <p className="font-bold text-blue-900">
                Persona Aktif: {user.active_nama || user.nama} ({user.active_hubungan || 'Anggota'})
              </p>
              <p className="text-blue-700/80 text-[11px]">
                NIK Aktif: <span className="font-mono">{user.active_nik}</span> · Setiap permohonan surat akan diproses atas nama anggota ini.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Official Digital Family Card Frame */}
      <div className="bg-surface-container-lowest rounded-2xl border-2 border-slate-300 shadow-elevated p-6 sm:p-10 relative overflow-hidden">
        {/* Background Watermark Garuda Effect */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Building2 size={320} />
        </div>

        {/* Card Header */}
        <div className="text-center border-b-2 border-slate-800 pb-5 mb-6 relative z-10">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-widest text-slate-900 uppercase">
            KARTU KELUARGA
          </h2>
          <p className="text-sm font-bold text-slate-700 tracking-wider mt-1">
            No. <span className="font-mono text-base font-extrabold text-slate-900">{kkData.no_kk}</span>
          </p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs mb-8 text-slate-800 relative z-10">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Nama Kepala Keluarga</span>
              <span className="font-bold">: {kkData.kepala_keluarga}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Alamat</span>
              <span>: {kkData.alamat}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">RT / RW</span>
              <span className="font-mono font-bold">: {kkData.rt} / {kkData.rw}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Kelurahan</span>
              <span>: {kkData.kelurahan}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Kecamatan</span>
              <span>: {kkData.kecamatan}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Kabupaten / Kota</span>
              <span>: {kkData.kota}</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Kode Pos</span>
              <span className="font-mono">: 40181</span>
            </div>
            <div className="flex">
              <span className="w-36 font-semibold text-slate-600">Provinsi</span>
              <span>: {kkData.provinsi}</span>
            </div>
          </div>
        </div>

        {/* Family Members Table */}
        <div className="relative z-10 overflow-x-auto rounded-xl border border-slate-300 mb-6">
          <table className="w-full text-left border-collapse text-[11px] text-slate-800">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold uppercase tracking-wider">
                <th className="p-2.5 text-center w-10">No</th>
                <th className="p-2.5">Nama Lengkap</th>
                <th className="p-2.5 font-mono">NIK</th>
                <th className="p-2.5">JK</th>
                <th className="p-2.5">Tempat, Tgl Lahir</th>
                <th className="p-2.5">Hubungan</th>
                <th className="p-2.5">Pekerjaan</th>
                <th className="p-2.5">Pendidikan</th>
                <th className="p-2.5">Gol</th>
                <th className="p-2.5 text-center">Aksi Persona</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {kkData.anggota && kkData.anggota.map((member, idx) => {
                const isActive = user?.active_nik === member.nik;
                return (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isActive ? 'bg-blue-50/70 font-medium' : ''
                    }`}
                  >
                    <td className="p-2.5 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900">
                      {member.nama}
                      {isActive && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] bg-primary text-on-primary font-bold">
                          Aktif
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-slate-700">{member.nik}</td>
                    <td className="p-2.5">{member.jenis_kelamin}</td>
                    <td className="p-2.5">
                      {member.tempat_lahir}, {new Date(member.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-2.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        member.status_hubungan_keluarga === 'Kepala Keluarga' 
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {member.status_hubungan_keluarga}
                      </span>
                    </td>
                    <td className="p-2.5">{member.pekerjaan || '-'}</td>
                    <td className="p-2.5">{member.pendidikan_terakhir || '-'}</td>
                    <td className="p-2.5 font-semibold text-center">{member.golongan_darah || '-'}</td>
                    <td className="p-2.5 text-center space-x-1 whitespace-nowrap">
                      {!isActive ? (
                        <button
                          onClick={() => handleSelectPersona(member.nik)}
                          disabled={switchingNik === member.nik}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-primary hover:text-white text-[10px] font-semibold text-slate-700 transition-colors inline-flex items-center gap-1"
                          title="Ganti persona aktif ke anggota ini"
                        >
                          <UserCheck size={12} />
                          <span>Pilih</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-primary font-bold inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Sedang Aktif
                        </span>
                      )}

                      <button
                        onClick={() => handleAjukanSurat(member)}
                        className="px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-[10px] font-semibold transition-colors inline-flex items-center gap-1"
                        title="Ajukan surat resmi atas nama anggota ini"
                      >
                        <FileCheck size={12} />
                        <span>Surat</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Verification Badge */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-slate-500 text-[11px] relative z-10">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Dokumen Terautentikasi Sistem Terpadu Bumi Warga · Kelurahan Kebonjati</span>
          </div>
          <p className="font-mono text-[10px]">Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
