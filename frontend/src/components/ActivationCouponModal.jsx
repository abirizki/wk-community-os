import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  Ticket,
  X,
  Copy,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  QrCode,
  Camera
} from 'lucide-react';

export default function ActivationCouponModal({ isOpen, onClose, defaultNik = '', onGenerated }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [nik, setNik] = useState(defaultNik);
  const [searchWarga, setSearchWarga] = useState('');
  const [wargaSuggestions, setWargaSuggestions] = useState([]);
  const [selectedWarga, setSelectedWarga] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [showQrScanner, setShowQrScanner] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // History Tab
  const [couponsList, setCouponsList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (defaultNik) {
      setNik(defaultNik);
    }
  }, [defaultNik]);

  // Search Warga for autocomplete
  useEffect(() => {
    if (searchWarga.trim().length < 2) {
      setWargaSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await api.get(`/warga?search=${encodeURIComponent(searchWarga)}&limit=5`);
        if (res.success && res.data) {
          setWargaSuggestions(res.data);
        }
      } catch (err) {
        console.warn('Search warga error:', err);
      } finally {
        setLoadingSearch(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchWarga]);

  // Load history when tab changes
  useEffect(() => {
    if (activeTab === 'history' && isOpen) {
      loadHistory();
    }
  }, [activeTab, isOpen]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get('/activation/list');
      if (res.success) {
        setCouponsList(res.data || []);
      }
    } catch (err) {
      console.warn('Load coupon history error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectWarga = (w) => {
    setSelectedWarga(w);
    setNik(w.nik);
    setSearchWarga(w.nama);
    setWargaSuggestions([]);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!nik || nik.length !== 16) {
      setErrorMsg('NIK harus terdiri dari 16 digit angka.');
      return;
    }
    setErrorMsg('');
    setIsGenerating(true);

    try {
      const res = await api.post('/activation/generate-coupon', { nik });
      if (res.success) {
        setGeneratedResult(res.data);
        if (onGenerated) onGenerated(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal menerbitkan kupon aktivasi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = () => {
    if (!generatedResult?.token) return;
    navigator.clipboard.writeText(generatedResult.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Selalu rakit URL secara aman dari domain browser aktif untuk menghindari broken link
  const getEffectiveClaimUrl = () => {
    if (!generatedResult) return '';
    const origin = (typeof window !== 'undefined' && window.location?.origin)
      ? window.location.origin
      : 'https://bumiwarga.online';
    return `${origin}/login?tab=claim&token=${encodeURIComponent(generatedResult.token)}&nik=${encodeURIComponent(generatedResult.nik)}`;
  };

  const handleShareWhatsApp = () => {
    if (!generatedResult) return;
    const claimUrl = getEffectiveClaimUrl();
    const msg = `Sampurasun Bpk/Ibu ${generatedResult.nama},\n\nBerikut adalah *Kode Kupon Aktivasi Resmi* akun Bumi Warga Anda:\n🎫 *KODE KUPON:* ${generatedResult.token}\n🆔 *NIK:* ${generatedResult.nik}\n⏳ *Masa Berlaku:* 24 Jam\n\nSilakan buka aplikasi atau tautan berikut untuk membuat kata sandi pribadi Anda:\n${claimUrl}\n\nSalam,\nPengurus RT ${generatedResult.rt} / RW ${generatedResult.rw}`;
    
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  };

  // Handler Scan QR KK langsung di dalam modal
  const handleScanInsideModal = (detectedCodes) => {
    let rawText = '';
    if (Array.isArray(detectedCodes) && detectedCodes.length > 0) {
      rawText = detectedCodes[0]?.rawValue || detectedCodes[0];
    } else if (typeof detectedCodes === 'string') {
      rawText = detectedCodes;
    } else if (detectedCodes?.rawValue) {
      rawText = detectedCodes.rawValue;
    }

    if (!rawText) return;

    // Cari angka 16 digit
    const matches = rawText.match(/\b\d{16}\b/g);
    if (matches && matches.length > 0) {
      const detectedNik = matches[matches.length > 1 ? 1 : 0];
      setNik(detectedNik);
      setShowQrScanner(false);
      setErrorMsg('');
    } else {
      const clean = rawText.replace(/\D/g, '');
      if (clean.length >= 16) {
        setNik(clean.slice(0, 16));
        setShowQrScanner(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-sky-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 p-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Ticket className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Kupon Aktivasi Warga</h3>
              <p className="text-xs text-sky-100">Pemberian Akses Sekali Pakai (One-Time Claim Pass)</p>
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
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Terbitkan Kupon</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Riwayat Kupon</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'create' && (
            <>
              {!generatedResult ? (
                <form onSubmit={handleGenerate} className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-100 text-xs text-sky-800 flex gap-2.5 items-start">
                    <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Sistem akan menerbitkan <strong>Kode Kupon 8-Karakter</strong> yang berlaku selama <strong>24 jam</strong>. Warga menggunakan kupon ini untuk membuat kata sandi pribadi secara mandiri tanpa mengetahui password oleh pihak lain.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Cari Warga Autocomplete */}
                  <div className="space-y-1.5 relative">
                    <label className="text-xs font-bold text-slate-700">Cari Nama Warga (Opsional)</label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchWarga}
                        onChange={(e) => setSearchWarga(e.target.value)}
                        placeholder="Ketik nama warga di RT/RW Anda..."
                        className="w-full h-10 pl-9 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                      />
                      {loadingSearch && (
                        <Loader2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-slate-400" />
                      )}
                    </div>

                    {/* Autocomplete dropdown */}
                    {wargaSuggestions.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                        {wargaSuggestions.map((w) => (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => handleSelectWarga(w)}
                            className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-sky-50 border-b border-slate-100 last:border-0 flex items-center justify-between group"
                          >
                            <div>
                              <p className="font-bold text-slate-800 group-hover:text-sky-700">{w.nama}</p>
                              <p className="text-[10px] text-slate-400 font-mono">NIK: {w.nik} • RT {w.rt}/RW {w.rw}</p>
                            </div>
                            <UserCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Kamera Scanner QR KK di dalam Modal */}
                  {showQrScanner && (
                    <div className="p-3 bg-slate-900 rounded-2xl space-y-2 animate-fade-in">
                      <div className="flex justify-between items-center text-white text-xs px-1">
                        <span className="font-bold flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-emerald-400" />
                          Arahkan ke QR KK / KTP Warga
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowQrScanner(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          Tutup Kamera
                        </button>
                      </div>
                      <div className="rounded-xl overflow-hidden aspect-video max-h-48">
                        <Scanner
                          onScan={(res) => handleScanInsideModal(res)}
                          onError={(err) => console.warn(err)}
                          styles={{ container: { width: '100%', height: '100%' } }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Input NIK & Tombol Scan QR */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-slate-700">NIK Warga (16 Digit) *</label>
                      <button
                        type="button"
                        onClick={() => setShowQrScanner(!showQrScanner)}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>{showQrScanner ? 'Tutup Scanner' : 'Pindai QR KK'}</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={16}
                      value={nik}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setNik(val);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Contoh: 3272030101700001"
                      required
                      className="w-full h-11 px-3.5 text-sm font-mono tracking-wider bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all"
                    />
                  </div>

                  {selectedWarga && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <strong>{selectedWarga.nama}</strong> terkonfirmasi di RT {selectedWarga.rt} / RW {selectedWarga.rw}.
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isGenerating || nik.length !== 16}
                    className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menerbitkan Kupon...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Terbitkan Kupon Aktivasi Sekarang</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Tampilan Kupon Sukses Diterbitkan */
                <div className="space-y-5 animate-fade-in text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      Kupon Aktif • Masa Berlaku 24 Jam
                    </span>
                    <h4 className="text-base font-extrabold text-slate-800 mt-2">
                      {generatedResult.nama}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">
                      NIK: {generatedResult.nik} • RT {generatedResult.rt}/RW {generatedResult.rw}
                    </p>
                  </div>

                  {/* Badge Kode Kupon Besar */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-dashed border-sky-300 relative group">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 mb-1">
                      KODE KUPON AKTIVASI WARGA
                    </p>
                    <div className="text-3xl font-black font-mono tracking-widest text-slate-800 my-2 select-all">
                      {generatedResult.token}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Salin Kode</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* QR Code Scan Langsung untuk Warga (Menggunakan origin aman) */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col items-center">
                    <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-sky-600" />
                      <span>Scan Langsung dari HP Warga</span>
                    </p>
                    <div className="w-36 h-36 bg-slate-50 border border-slate-100 rounded-xl p-2 flex items-center justify-center shadow-inner">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          getEffectiveClaimUrl()
                        )}`}
                        alt="QR Aktivasi"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      Arahkan kamera HP warga ke QR code di atas untuk membuka formulir pembuatan password.
                    </p>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Send className="w-4 h-4" />
                      <span>Kirim ke WhatsApp Warga</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedResult(null);
                        setNik('');
                        setSelectedWarga(null);
                        setSearchWarga('');
                      }}
                      className="px-4 h-11 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-all"
                    >
                      Buat Lagi
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
                  <p className="text-xs">Memuat daftar kupon...</p>
                </div>
              ) : couponsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Ticket className="w-10 h-10 mx-auto mb-2 opacity-40 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Belum Ada Kupon Diterbitkan</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Kupon yang Anda terbitkan akan tercatat di sini.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {couponsList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 text-sm tracking-wide">
                            {item.token}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              item.status === 'used'
                                ? 'bg-slate-200 text-slate-700'
                                : item.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {item.status === 'used' ? 'Sudah Diklaim' : item.status === 'active' ? 'Aktif' : 'Kedaluwarsa'}
                          </span>
                        </div>
                        <p className="font-medium text-slate-700 mt-1">{item.nama}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NIK: {item.nik}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
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
