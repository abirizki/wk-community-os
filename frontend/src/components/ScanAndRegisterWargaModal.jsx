import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  QrCode,
  UserPlus,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  CreditCard,
  FileText,
  MapPin,
  Ticket,
  ArrowRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function ScanAndRegisterWargaModal({
  isOpen,
  onClose,
  onSuccessRegistered,
  onOpenActivationCoupon
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'form'
  const [cameraActive, setCameraActive] = useState(true);

  // Scan state
  const [scanningLoading, setScanningLoading] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);
  const [scanError, setScanError] = useState('');

  // Form Asistensi State
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState('');

  const [assistedForm, setAssistedForm] = useState({
    nik: '',
    no_kk: '',
    nama: '',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '',
    agama: 'Islam',
    status_perkawinan: 'Belum Kawin',
    status_hubungan_keluarga: 'Kepala Keluarga',
    pekerjaan: 'Wiraswasta',
    pendidikan_terakhir: 'SMA/SMK',
    golongan_darah: 'Tidak Tahu',
    alamat: 'Jl. Kebonjati',
    rt: user?.rt || '001',
    rw: user?.rw || '001',
    no_telepon: ''
  });

  if (!isOpen) return null;

  // Handle QR Scan Result
  const handleScan = async (detectedCodes) => {
    // @yudiel/react-qr-scanner can return array or single object/string
    let rawText = '';
    if (Array.isArray(detectedCodes) && detectedCodes.length > 0) {
      rawText = detectedCodes[0]?.rawValue || detectedCodes[0];
    } else if (typeof detectedCodes === 'string') {
      rawText = detectedCodes;
    } else if (detectedCodes?.rawValue) {
      rawText = detectedCodes.rawValue;
    }

    if (!rawText || scanningLoading) return;

    setScanningLoading(true);
    setScanError('');
    setCameraActive(false);

    try {
      // 1. Ekstrak kode 16 digit atau payload JSON
      let candidateNik = '';
      let candidateKk = '';

      if (rawText.startsWith('{') && rawText.endsWith('}')) {
        try {
          const parsed = JSON.parse(rawText);
          candidateNik = parsed.nik || '';
          candidateKk = parsed.no_kk || '';
        } catch (e) {}
      }

      if (!candidateNik && !candidateKk) {
        // Cari seluruh kumpulan 16 digit dalam teks
        const matches = rawText.match(/\b\d{16}\b/g);
        if (matches && matches.length > 0) {
          candidateKk = matches[0];
          if (matches.length > 1) candidateNik = matches[1];
        } else {
          // Cari angka apa pun yang panjangnya 16 digit
          const cleanNumbers = rawText.replace(/\D/g, '');
          if (cleanNumbers.length >= 16) {
            candidateKk = cleanNumbers.slice(0, 16);
          }
        }
      }

      const lookupCode = candidateNik || candidateKk || rawText;

      // 2. Kueri ke API scanner untuk cek apakah sudah terdaftar di database kelurahan
      const res = await api.post('/scanner/lookup', { code: lookupCode, mode: 'loket' });

      if (res.success && res.warga) {
        // Warga SUDAH ada di database!
        setScannedResult({
          status: 'FOUND',
          warga: res.warga,
          familyMembers: res.familyMembers || [],
          raw: rawText
        });
      } else {
        // Belum terdaftar -> Alihkan ke Tab Form dengan NIK/KK terisi
        handleUnregisteredScan(candidateNik, candidateKk, rawText);
      }
    } catch (err) {
      // 404 Not Found -> Warga belum terdata
      const matches = rawText.match(/\b\d{16}\b/g) || [];
      const cKk = matches[0] || '';
      const cNik = matches[1] || '';
      handleUnregisteredScan(cNik, cKk, rawText);
    } finally {
      setScanningLoading(false);
    }
  };

  const handleUnregisteredScan = (nikCandidate, kkCandidate, raw) => {
    setAssistedForm((prev) => ({
      ...prev,
      nik: nikCandidate || prev.nik,
      no_kk: kkCandidate || prev.no_kk
    }));

    setScannedResult({
      status: 'NEW',
      nik: nikCandidate,
      no_kk: kkCandidate,
      raw
    });

    setActiveTab('form');
  };

  const handleSubmitAssisted = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const res = await api.post('/warga/assisted', assistedForm);
      if (res.success) {
        setFormSuccess(res.data || assistedForm);
        if (onSuccessRegistered) onSuccessRegistered(res.data || assistedForm);
      }
    } catch (err) {
      setFormError(err.message || 'Gagal mendaftarkan warga ke database.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueCouponForWarga = (targetNik) => {
    onClose();
    if (onOpenActivationCoupon) {
      onOpenActivationCoupon(targetNik);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-700 p-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Camera className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Pindai KK & Input Data Warga</h3>
              <p className="text-xs text-emerald-100">Registrasi Cepat & Verifikasi Dokumen RT/RW</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors relative z-10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveTab('scan');
              setCameraActive(true);
            }}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'scan'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pindai QR Dokumen KK</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'form'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Formulir Input Warga Baru</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* ========================================================================= */}
          {/* TAB 1: SCANNER KAMERA QR KK                                              */}
          {/* ========================================================================= */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              {scanningLoading && (
                <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-xs font-bold">Menganalisis Kode QR Dokumen KK...</p>
                </div>
              )}

              {!scanningLoading && !scannedResult && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Arahkan kamera ke <strong>QR Code TTE</strong> pada lembar Kartu Keluarga atau ponsel warga. Sistem akan otomatis mendeteksi identitas keluarga.
                    </p>
                  </div>

                  {cameraActive ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 shadow-inner bg-black aspect-video max-h-64 flex items-center justify-center">
                      <Scanner
                        onScan={(result) => handleScan(result)}
                        onError={(err) => console.warn('QR Scanner warn:', err)}
                        styles={{
                          container: { width: '100%', height: '100%' },
                          video: { objectFit: 'cover' }
                        }}
                      />
                      <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/60 m-8 rounded-xl" />
                      <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/90 bg-black/40 py-1 backdrop-blur-xs">
                        Posisikan QR Code di dalam kotak
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setCameraActive(true)}
                      className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/40 text-slate-600 text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all"
                    >
                      <Camera className="w-6 h-6 text-emerald-600" />
                      <span>Nyalakan Kamera Pemindai</span>
                    </button>
                  )}

                  {scanError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{scanError}</span>
                    </div>
                  )}
                </div>
              )}

              {/* TAMPILAN KETIKA WARGA DITEMUKAN DI DATABASE */}
              {scannedResult?.status === 'FOUND' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 text-emerald-900">
                        Warga Terverifikasi di Database
                      </span>
                      <h4 className="text-base font-extrabold text-slate-800 mt-1">
                        {scannedResult.warga.nama}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        NIK: {scannedResult.warga.nik} • No KK: {scannedResult.warga.no_kk}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Alamat Lingkungan:</span>
                      <span className="font-bold text-slate-700">RT {scannedResult.warga.rt} / RW {scannedResult.warga.rw}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-500">Status Hubungan:</span>
                      <span className="font-bold text-slate-700">{scannedResult.warga.status_hubungan_keluarga || 'Anggota'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Anggota Keluarga 1 KK:</span>
                      <span className="font-bold text-emerald-700">{scannedResult.familyMembers.length || 1} Jiwa</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleIssueCouponForWarga(scannedResult.warga.nik)}
                      className="flex-1 h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Ticket className="w-4 h-4 text-slate-950" />
                      <span>Terbitkan Kupon Aktivasi Langsung</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScannedResult(null);
                        setCameraActive(true);
                      }}
                      className="px-4 h-11 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Scan Lagi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: FORMULIR INPUT DATA WARGA BARU                                    */}
          {/* ========================================================================= */}
          {activeTab === 'form' && (
            <div>
              {scannedResult?.status === 'NEW' && (
                <div className="p-3 mb-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Data dari Scan QR Terbaca!</strong> NIK dan Nomor KK telah diisikan otomatis ke formulir di bawah. Silakan lengkapi nama dan data lainnya.
                  </div>
                </div>
              )}

              {formSuccess ? (
                <div className="py-6 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-slate-800">
                      Warga Berhasil Ditambahkan ke Database RT!
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {formSuccess.nama} (NIK: {formSuccess.nik})
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800">
                    Warga kini resmi terdata di basis data kependudukan RT {assistedForm.rt} / RW {assistedForm.rw}.
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleIssueCouponForWarga(formSuccess.nik)}
                      className="flex-1 h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Ticket className="w-4 h-4 text-slate-950" />
                      <span>Terbitkan Kupon Aktivasi Sekarang</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormSuccess(null);
                        setScannedResult(null);
                        setAssistedForm({
                          nik: '',
                          no_kk: '',
                          nama: '',
                          jenis_kelamin: 'L',
                          tempat_lahir: 'Bandung',
                          tanggal_lahir: '',
                          agama: 'Islam',
                          status_perkawinan: 'Belum Kawin',
                          status_hubungan_keluarga: 'Kepala Keluarga',
                          pekerjaan: 'Wiraswasta',
                          pendidikan_terakhir: 'SMA/SMK',
                          golongan_darah: 'Tidak Tahu',
                          alamat: 'Jl. Kebonjati',
                          rt: user?.rt || '001',
                          rw: user?.rw || '001',
                          no_telepon: ''
                        });
                      }}
                      className="px-4 h-11 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                    >
                      Tambah Lain
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitAssisted} className="space-y-3.5">
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">NIK Warga (16 Digit) *</label>
                      <input
                        type="text"
                        maxLength={16}
                        required
                        value={assistedForm.nik}
                        onChange={(e) => setAssistedForm({ ...assistedForm, nik: e.target.value.replace(/\D/g, '') })}
                        placeholder="Contoh: 3272030101700001"
                        className="w-full h-10 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Nomor Kartu Keluarga (No KK) *</label>
                      <input
                        type="text"
                        maxLength={16}
                        required
                        value={assistedForm.no_kk}
                        onChange={(e) => setAssistedForm({ ...assistedForm, no_kk: e.target.value.replace(/\D/g, '') })}
                        placeholder="Contoh: 3272030101900101"
                        className="w-full h-10 px-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 px-1">Nama Lengkap Sesuai KTP/KK *</label>
                    <input
                      type="text"
                      required
                      value={assistedForm.nama}
                      onChange={(e) => setAssistedForm({ ...assistedForm, nama: e.target.value })}
                      placeholder="Masukkan nama lengkap warga"
                      className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Jenis Kelamin *</label>
                      <select
                        value={assistedForm.jenis_kelamin}
                        onChange={(e) => setAssistedForm({ ...assistedForm, jenis_kelamin: e.target.value })}
                        className="w-full h-10 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Tanggal Lahir *</label>
                      <input
                        type="date"
                        required
                        value={assistedForm.tanggal_lahir}
                        onChange={(e) => setAssistedForm({ ...assistedForm, tanggal_lahir: e.target.value })}
                        className="w-full h-10 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Hubungan Keluarga</label>
                      <select
                        value={assistedForm.status_hubungan_keluarga}
                        onChange={(e) => setAssistedForm({ ...assistedForm, status_hubungan_keluarga: e.target.value })}
                        className="w-full h-10 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 outline-none"
                      >
                        <option value="Kepala Keluarga">Kepala Keluarga</option>
                        <option value="Istri">Istri</option>
                        <option value="Anak">Anak</option>
                        <option value="Orang Tua">Orang Tua</option>
                        <option value="Famili Lain">Famili Lain</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Wilayah RT</label>
                      <input
                        type="text"
                        value={assistedForm.rt}
                        onChange={(e) => setAssistedForm({ ...assistedForm, rt: e.target.value })}
                        className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Wilayah RW</label>
                      <input
                        type="text"
                        value={assistedForm.rw}
                        onChange={(e) => setAssistedForm({ ...assistedForm, rw: e.target.value })}
                        className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">No. WhatsApp/HP</label>
                      <input
                        type="tel"
                        value={assistedForm.no_telepon}
                        onChange={(e) => setAssistedForm({ ...assistedForm, no_telepon: e.target.value })}
                        placeholder="08xxxxxxxx"
                        className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 px-1">Alamat Tinggal</label>
                    <input
                      type="text"
                      value={assistedForm.alamat}
                      onChange={(e) => setAssistedForm({ ...assistedForm, alamat: e.target.value })}
                      className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || assistedForm.nik.length !== 16 || !assistedForm.nama}
                    className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan ke Database...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Simpan Data Warga ke Database RT</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-all"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </div>
  );
}
