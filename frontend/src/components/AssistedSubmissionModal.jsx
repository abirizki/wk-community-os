import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, FileText, X, CheckCircle2, AlertCircle, Search, Sparkles, Send, ShieldCheck, HeartHandshake } from 'lucide-react';
import { api } from '../utils/api';

export default function AssistedSubmissionModal({ isOpen, onClose, onSuccess, currentRole = 'ketua_rt', rt = '001', rw = '001' }) {
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [jenisDokumen, setJenisDokumen] = useState('Surat Keterangan Pengantar');
  const [keperluan, setKeperluan] = useState('');
  const [alasanDampingan, setAlasanDampingan] = useState('Warga lansia / tidak memiliki smartphone atau akses internet mandiri.');
  const [loading, setLoading] = useState(false);
  const [searchingNik, setSearchingNik] = useState(false);
  const [foundWarga, setFoundWarga] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const isRW = currentRole === 'ketua_rw' || currentRole === 'admin_rw';

  const jenisSuratOptions = [
    'Surat Keterangan Pengantar',
    'Surat Keterangan Tidak Mampu (SKTM)',
    'Surat Keterangan Usaha (SKU)',
    'Surat Keterangan Domisili',
    'Surat Keterangan Kematian',
    'Surat Keterangan Kelahiran',
    'Surat Pengantar Nikah (N1-N4)',
    'Surat Keterangan Belum Menikah',
    'Surat Keterangan Penghasilan'
  ];

  const handleSearchNik = async () => {
    if (!nik || nik.length < 16) {
      setErrorMsg('Masukkan 16 digit NIK warga.');
      return;
    }

    setSearchingNik(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/warga/${nik.trim()}`);
      if (res.success && res.data) {
        setFoundWarga(res.data);
        setNama(res.data.nama);
      } else {
        setFoundWarga(null);
      }
    } catch (e) {
      setFoundWarga(null);
    } finally {
      setSearchingNik(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nik || nik.length < 16) {
      setErrorMsg('NIK warga pemohon wajib 16 digit angka.');
      return;
    }
    if (!nama || nama.trim().length < 3) {
      setErrorMsg('Nama lengkap warga pemohon wajib diisi.');
      return;
    }
    if (!keperluan || keperluan.trim().length < 5) {
      setErrorMsg('Keperluan permohonan surat minimal 5 karakter.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const fullKeperluan = `${keperluan.trim()} (Didampingi ${isRW ? 'Ketua RW' : 'Ketua RT'}: ${alasanDampingan})`;
      const payload = {
        nik_pemohon: nik.trim(),
        nama_subjek: nama.trim(),
        jenis_dokumen: jenisDokumen,
        keperluan: fullKeperluan,
        is_assisted_submission: 1,
        rt: foundWarga?.rt || rt,
        rw: foundWarga?.rw || rw
      };

      const res = await api.post('/dokumen', payload);
      if (res.success) {
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        throw new Error(res.message || 'Gagal mengajukan surat dampingan.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memproses pengajuan dampingan.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="fixed inset-0" onClick={!loading ? onClose : undefined} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-6 relative">
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-1.5 text-blue-200 text-xs font-semibold">
              <HeartHandshake size={16} className="text-cyan-300" />
              <span>Loket Pelayanan Dampingan Warga</span>
            </div>
            <h3 className="text-xl font-black">Ajukan Surat Atas Nama Warga</h3>
            <p className="text-xs text-blue-100 mt-1 leading-relaxed">
              Fasilitasi warga lansia, disabilitas, atau yang tidak memiliki akses internet/smartphone. Surat otomatis diverifikasi oleh {isRW ? 'Ketua RT & RW' : 'Ketua RT'}.
            </p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Input NIK & Search Button */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                NIK Warga Pemohon (16 Digit) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="Contoh: 3272030101900001"
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={handleSearchNik}
                  disabled={searchingNik || nik.length < 16}
                  className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-blue-50 text-blue-700 text-xs font-bold border border-gray-200 hover:border-blue-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Search size={14} className={searchingNik ? 'animate-spin' : ''} />
                  <span>Cek NIK</span>
                </button>
              </div>
            </div>

            {/* Nama Warga */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Nama Lengkap Warga <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama sesuai KTP"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {foundWarga && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                  <CheckCircle2 size={12} />
                  <span>Ditemukan di database: RT {foundWarga.rt} / RW {foundWarga.rw} ({foundWarga.pekerjaan || 'Warga'})</span>
                </div>
              )}
            </div>

            {/* Pilihan Jenis Dokumen */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Jenis Dokumen / Surat <span className="text-rose-500">*</span>
              </label>
              <select
                value={jenisDokumen}
                onChange={(e) => setJenisDokumen(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {jenisSuratOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Keperluan */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Keperluan Surat <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={keperluan}
                onChange={(e) => setKeperluan(e.target.value)}
                placeholder="Contoh: Mengurus pendaftaran bantuan BPJS PBI di Puskesmas"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Alasan Dampingan */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Keterangan Dampingan
              </label>
              <input
                type="text"
                value={alasanDampingan}
                onChange={(e) => setAlasanDampingan(e.target.value)}
                placeholder="Alasan pendampingan"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Auto-Approval Note */}
            <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-blue-900 text-xs">
              <span className="font-bold block flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-600" />
                Workflow Dampingan Otomatis:
              </span>
              <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">
                {isRW 
                  ? 'Surat akan otomatis ditandai disetujui oleh RT dan RW, langsung diteruskan ke Kelurahan untuk pengesahan TTE.'
                  : 'Surat akan otomatis ditandai disetujui oleh Ketua RT, langsung diteruskan ke tingkat RW.'}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Search size={14} className="animate-spin" /> : <Send size={14} />}
                <span>Kirim Permohonan Dampingan</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
