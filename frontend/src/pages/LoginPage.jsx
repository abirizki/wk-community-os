import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import {
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  ShieldCheck,
  Ticket,
  UserPlus,
  LogIn,
  KeyRound,
  HelpCircle,
  X,
  Building2,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode/View: 'login' | 'claim' | 'register'
  const initialView = searchParams.get('tab') || 'login';
  const [activeView, setActiveView] = useState(initialView);

  // Recovery Help Modal State
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryInfo, setRecoveryInfo] = useState(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  // Success Feedback
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Login State
  const [identifier, setIdentifier] = useState(searchParams.get('nik') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);

  // 2. Klaim Kupon RT State
  const [claimNik, setClaimNik] = useState(searchParams.get('nik') || '');
  const [claimToken, setClaimToken] = useState(searchParams.get('token') || '');
  const [claimPassword, setClaimPassword] = useState('');
  const [claimConfirmPassword, setClaimConfirmPassword] = useState('');
  const [showClaimPassword, setShowClaimPassword] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');

  // 3. Aktivasi Mandiri State
  const [regNik, setRegNik] = useState('');
  const [regKK, setRegKK] = useState('');
  const [regBirthdate, setRegBirthdate] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Synchronize view from URL searchParams
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['login', 'claim', 'register'].includes(tabParam)) {
      setActiveView(tabParam);
    }
    const tokenParam = searchParams.get('token');
    if (tokenParam) setClaimToken(tokenParam);
    const nikParam = searchParams.get('nik');
    if (nikParam) {
      setClaimNik(nikParam);
      setIdentifier(nikParam);
    }
  }, [searchParams]);

  // Fetch official recovery info when modal is opened
  const handleOpenRecovery = async () => {
    setShowRecoveryModal(true);
    if (!recoveryInfo) {
      setRecoveryLoading(true);
      try {
        const res = await api.get('/auth/recovery-info');
        if (res.success && res.data) {
          setRecoveryInfo(res.data);
        }
      } catch (err) {
        // Fallback structured official recovery info
        setRecoveryInfo({
          title: 'Pemulihan Akses Akun & Reset Kata Sandi Warga',
          methods: [
            {
              id: 'rt_voucher',
              title: 'Kupon Aktivasi Baru dari Ketua RT',
              description: 'Hubungi Ketua RT setempat untuk meminta Kupon Aktivasi satu-kali-pakai (format BW-XXXXXX). Kupon ini memungkinkan Anda membuat kata sandi baru secara instan.',
              badge: 'Rekomendasi Utama'
            },
            {
              id: 'kelurahan_helpdesk',
              title: 'Loket Pelayanan Kantor Kelurahan',
              description: 'Kunjungi loket administrasi Kelurahan Kebonjati, Kec. Cikole dengan membawa fisik e-KTP dan Kartu Keluarga asli untuk verifikasi data kependudukan langsung.',
              badge: 'Pelayanan Tatap Muka'
            }
          ],
          notice: 'Demi melindungi privasi data kependudukan (UU PDP No. 27/2022), sistem tidak menyediakan tautan reset otomatis tanpa kontak terverifikasi.'
        });
      } finally {
        setRecoveryLoading(false);
      }
    }
  };

  // Validation Helpers
  const isNik = /^\d+$/.test(identifier);
  const identifierValid = isNik ? identifier.length === 16 : identifier.trim().length >= 3;
  const hasMinLen = password.length >= 6;

  // View Switcher Helper
  const switchView = (newView) => {
    setActiveView(newView);
    setLoginError('');
    setClaimError('');
    setRegError('');
    setSuccessMessage('');
  };

  // --- 1. Submit Login ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await login(identifier.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      // Generic message to prevent account enumeration
      setLoginError(err.message || 'Identitas (NIK/Username) atau kata sandi tidak sesuai. Periksa kembali data Anda.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // --- 2. Verify & Claim Kupon RT ---
  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');

    if (claimPassword !== claimConfirmPassword) {
      setClaimError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (claimPassword.length < 8) {
      setClaimError('Kata sandi baru minimal 8 karakter (kombinasi huruf & angka).');
      return;
    }

    setClaimLoading(true);
    try {
      const res = await api.post('/activation/claim-coupon', {
        token: claimToken.trim(),
        nik: claimNik.trim(),
        new_password: claimPassword,
        confirm_password: claimConfirmPassword
      });

      if (res.success) {
        setSuccessMessage(res.message || 'Kupon berhasil diklaim! Silakan masuk dengan kata sandi baru Anda.');
        setIdentifier(claimNik.trim());
        setPassword('');
        switchView('login');
      }
    } catch (err) {
      setClaimError(err.message || 'Gagal mengklaim kupon aktivasi.');
    } finally {
      setClaimLoading(false);
    }
  };

  // --- 3. Self-Registration Submit ---
  const handleRegSubmit = async (e) => {
    e.preventDefault();
    setRegError('');

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (regPassword.length < 8) {
      setRegError('Kata sandi baru minimal 8 karakter (kombinasi huruf & angka).');
      return;
    }

    setRegLoading(true);
    try {
      const res = await api.post('/activation/self-register', {
        nik: regNik.trim(),
        no_kk: regKK.trim(),
        tanggal_lahir: regBirthdate.trim(),
        no_telepon: regPhone.trim(),
        new_password: regPassword,
        confirm_password: regConfirmPassword
      });

      if (res.success) {
        setSuccessMessage(res.message || 'Pendaftaran mandiri berhasil! Silakan masuk dengan kata sandi baru Anda.');
        setIdentifier(regNik.trim());
        setPassword('');
        switchView('login');
      }
    } catch (err) {
      setRegError(err.message || 'Gagal memproses pendaftaran mandiri.');
    } finally {
      setRegLoading(false);
    }
  };

  const shakeVariants = {
    initial: { x: 0 },
    shake: { x: [-8, 8, -8, 8, -4, 4, 0], transition: { duration: 0.4 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut', delay } }),
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center p-3 sm:p-6 md:p-8 relative">
      {/* Soft Sky Background Tone */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50/70 via-slate-50 to-slate-100 pointer-events-none" />

      {/* Main Civic Container */}
      <div className="w-full max-w-[1020px] flex flex-col lg:flex-row bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative z-10 border border-slate-200/80 min-h-[600px]">
        
        {/* Left Side: Kanaya & Civic Service Identity (Desktop only) */}
        <div className="hidden lg:flex flex-col justify-between w-[40%] bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 p-10 text-white relative">
          <div className="relative z-10">
            {/* Logo & Civic Title */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md p-1.5 flex items-center justify-center border border-white/20">
                <Building2 size={24} className="text-sky-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Bumi Warga</h2>
                <p className="text-sky-200/90 text-xs font-medium">Kota Sukabumi • Jabar Pintar</p>
              </div>
            </div>

            {/* Kanaya Public Assistant Intro */}
            <div className="space-y-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl shadow-sm">
                👩🏻
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-snug">
                Sampurasun!
              </h1>
              <p className="text-sky-100/90 text-xs leading-relaxed">
                Saya <strong>Kanaya</strong>, asisten virtual pelayanan publik terpadu Bumi Warga. Masuk untuk mengelola administrasi kependudukan, pengajuan surat pengantar, pantau bansos, dan iuran lingkungan.
              </p>
            </div>

            {/* Factual Security Architecture */}
            <div className="border-t border-white/15 pt-5 space-y-2.5 text-xs text-sky-100/80">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-sky-300 shrink-0 mt-0.5" />
                <span>Kredensial individual terenkripsi Bcrypt (10 rounds).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-sky-300 shrink-0 mt-0.5" />
                <span>Sesi aman berbasis cookie HttpOnly dengan kontrol masa kedaluwarsa.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={15} className="text-sky-300 shrink-0 mt-0.5" />
                <span>Audit trail dan pembatasan kewenangan wilayah bertingkat (RT, RW, Kelurahan).</span>
              </div>
            </div>
          </div>

          {/* Privacy Law Compliance */}
          <div className="relative z-10 pt-6">
            <div className="inline-flex items-center gap-2 text-[11px] text-sky-200 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck size={14} className="text-sky-300 shrink-0" />
              <span>Prinsip Perlindungan Data Pribadi (UU PDP No. 27/2022)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Civic Forms */}
        <div className="flex-1 flex flex-col p-5 sm:p-8 md:p-10 justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto">
            
            {/* Mobile Header Branding */}
            <div className="lg:hidden flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                  <Building2 size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Bumi Warga</h2>
                  <p className="text-[11px] text-sky-700 font-semibold">Kota Sukabumi</p>
                </div>
              </div>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Layanan Publik
              </span>
            </div>

            {/* Back Button for Secondary Views */}
            {activeView !== 'login' && (
              <button
                type="button"
                onClick={() => switchView('login')}
                className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-100 min-h-[44px]"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Halaman Masuk</span>
              </button>
            )}

            {/* Success Feedback Banner */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* 1. PRIMARY VIEW: LOGIN FORM                                              */}
            {/* ========================================================================= */}
            {activeView === 'login' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1.5 tracking-tight">Masuk Layanan Warga</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Masukkan NIK (16 digit) atau nama pengguna dinas beserta kata sandi pribadi Anda.
                  </p>
                </div>

                {/* Generic Login Error Alert */}
                <AnimatePresence>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                      role="alert"
                    >
                      <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 font-medium">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
                        <span>{loginError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form
                  className="flex flex-col gap-4"
                  onSubmit={handleLoginSubmit}
                  variants={shakeVariants}
                  initial="initial"
                  animate={shake ? 'shake' : 'initial'}
                >
                  {/* NIK / Username Field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-0.5">
                      <label htmlFor="login-identifier" className="text-xs font-bold text-slate-700">
                        NIK / Username Kedinasan
                      </label>
                      {isNik && (
                        <span className={`text-[11px] font-medium ${identifierValid ? 'text-sky-700 font-semibold' : 'text-slate-400'}`}>
                          {identifier.length}/16 Digit
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <CreditCard size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${loginError ? 'text-red-500' : 'text-slate-400'}`} />
                      <input
                        id="login-identifier"
                        name="username"
                        type="text"
                        inputMode={isNik || /^\d*$/.test(identifier) ? 'numeric' : 'text'}
                        value={identifier}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIdentifier(/^\d+$/.test(val) ? val.slice(0, 16) : val);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="Contoh: 3272030101700001"
                        autoComplete="username"
                        required
                        disabled={isLoading}
                        className={`w-full min-h-[48px] h-12 bg-slate-50/80 border rounded-xl pl-11 pr-11 text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400
                          ${loginError 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 text-red-900 bg-red-50/30' 
                            : identifierValid 
                              ? 'border-sky-300 focus:border-sky-600 focus:ring-sky-100 text-slate-900 bg-white' 
                              : 'border-slate-300 focus:border-sky-600 focus:ring-sky-100 text-slate-900'}`}
                      />
                      {identifierValid && !loginError && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-600">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-0.5">
                      <label htmlFor="login-password" className="text-xs font-bold text-slate-700">
                        Kata Sandi Akun
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenRecovery}
                        className="text-xs font-semibold text-sky-700 hover:text-sky-800 hover:underline min-h-[32px] flex items-center"
                      >
                        Bantuan Lupa Sandi
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={18} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${loginError ? 'text-red-500' : 'text-slate-400'}`} />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="Masukkan kata sandi pribadi Anda"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                        className={`w-full min-h-[48px] h-12 bg-slate-50/80 border rounded-xl pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400
                          ${loginError 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 text-red-900 bg-red-50/30' 
                            : 'border-slate-300 focus:border-sky-600 focus:ring-sky-100 text-slate-900'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        aria-pressed={showPassword}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Individual Account Info Card */}
                  <div className="bg-sky-50/60 border border-sky-200/80 rounded-xl p-3 flex gap-2.5 items-start">
                    <ShieldCheck size={16} className="text-sky-700 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 block mb-0.5">Akun Pribadi Terverifikasi</strong>
                      Setiap warga wajib memiliki akun individu dengan kata sandi terverifikasi. Jika baru pertama kali mengakses atau belum memiliki sandi, pilih jalur aktivasi di bawah.
                    </p>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !identifierValid || !hasMinLen}
                    className="mt-1 w-full min-h-[48px] h-12 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-sm font-bold shadow-md shadow-sky-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600"
                  >
                    {isLoading ? (
                      <><Loader2 size={18} className="animate-spin" /> Memeriksa Kredensial...</>
                    ) : (
                      <>Masuk ke Layanan <ArrowRight size={18} /></>
                    )}
                  </button>
                </motion.form>

                {/* Progressive Secondary Actions */}
                <div className="mt-6 pt-5 border-t border-slate-200/80 space-y-3">
                  <p className="text-center text-xs font-semibold text-slate-500">
                    Belum Memiliki Kata Sandi Akun?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Action 1: Klaim Kupon RT */}
                    <button
                      type="button"
                      onClick={() => switchView('claim')}
                      className="min-h-[44px] p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/50 transition-all flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Ticket size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 leading-tight">Klaim Kupon RT</div>
                        <div className="text-[11px] text-slate-500 truncate">Kode dari Ketua RT</div>
                      </div>
                    </button>

                    {/* Action 2: Aktivasi Mandiri */}
                    <button
                      type="button"
                      onClick={() => switchView('register')}
                      className="min-h-[44px] p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/50 transition-all flex items-center gap-2.5 text-left group focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <UserPlus size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 leading-tight">Aktivasi Mandiri</div>
                        <div className="text-[11px] text-slate-500 truncate">Cocokkan NIK & No. KK</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. SECONDARY VIEW: KLAIM KUPON RT/RW (JALUR VOUCHING)                      */}
            {/* ========================================================================= */}
            {activeView === 'claim' && (
              <div>
                <div className="mb-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mb-2">
                    <Ticket size={12} />
                    <span>Jalur Vouching Resmi RT/RW</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Klaim Kupon Aktivasi</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Masukkan NIK dan Kode Kupon (format BW-XXXXXX) yang diterbitkan oleh Ketua RT/RW Anda untuk membuat kata sandi baru.
                  </p>
                </div>

                <AnimatePresence>
                  {claimError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                      role="alert"
                    >
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 font-medium">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
                        <span>{claimError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleClaimSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label htmlFor="claim-nik" className="text-xs font-bold text-slate-700">
                      NIK Warga (16 Digit)
                    </label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="claim-nik"
                        name="nik"
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        value={claimNik}
                        onChange={(e) => setClaimNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 3272030101700001"
                        required
                        className="w-full min-h-[44px] h-11 bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-3 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="claim-token" className="text-xs font-bold text-slate-700">
                      Kode Kupon RT (Format: BW-XXXXXX)
                    </label>
                    <div className="relative">
                      <Ticket size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="claim-token"
                        name="token"
                        type="text"
                        maxLength={9}
                        value={claimToken}
                        onChange={(e) => setClaimToken(e.target.value.toUpperCase())}
                        placeholder="Contoh: BW-9X7M2K"
                        required
                        className="w-full min-h-[44px] h-11 bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-3 text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="claim-password" className="text-xs font-bold text-slate-700">
                      Buat Kata Sandi Pribadi Baru
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="claim-password"
                        name="new_password"
                        type={showClaimPassword ? 'text' : 'password'}
                        value={claimPassword}
                        onChange={(e) => setClaimPassword(e.target.value)}
                        placeholder="Minimal 8 karakter (kombinasi huruf & angka)"
                        required
                        className="w-full min-h-[44px] h-11 bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-11 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaimPassword(!showClaimPassword)}
                        aria-label={showClaimPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-700 rounded-lg"
                      >
                        {showClaimPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="claim-confirm-password" className="text-xs font-bold text-slate-700">
                      Ulangi Kata Sandi Baru
                    </label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="claim-confirm-password"
                        name="confirm_password"
                        type={showClaimPassword ? 'text' : 'password'}
                        value={claimConfirmPassword}
                        onChange={(e) => setClaimConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi baru"
                        required
                        className="w-full min-h-[44px] h-11 bg-slate-50 border border-slate-300 rounded-xl pl-11 pr-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={claimLoading || !claimNik || !claimToken || !claimPassword}
                    className="mt-3 w-full min-h-[44px] h-11 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-600"
                  >
                    {claimLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Mengaktifkan Akun...</>
                    ) : (
                      <>Aktifkan Akun & Buat Kata Sandi <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. SECONDARY VIEW: AKTIVASI MANDIRI KEPENDUDUKAN (NIK + NO KK)            */}
            {/* ========================================================================= */}
            {activeView === 'register' && (
              <div>
                <div className="mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                    <UserPlus size={12} />
                    <span>Verifikasi Data Kependudukan Mandiri</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Aktivasi Mandiri Online</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    Cocokkan NIK, Nomor KK, dan Tanggal Lahir sesuai data yang tercatat di kelurahan.
                  </p>
                </div>

                <AnimatePresence>
                  {regError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                      role="alert"
                    >
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 font-medium">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-600" />
                        <span>{regError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRegSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label htmlFor="reg-nik" className="text-[11px] font-bold text-slate-700">NIK Warga</label>
                      <input
                        id="reg-nik"
                        name="nik"
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        value={regNik}
                        onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="16 Digit NIK"
                        required
                        className="w-full min-h-[44px] h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-kk" className="text-[11px] font-bold text-slate-700">Nomor Kartu Keluarga</label>
                      <input
                        id="reg-kk"
                        name="no_kk"
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        value={regKK}
                        onChange={(e) => setRegKK(e.target.value.replace(/\D/g, ''))}
                        placeholder="16 Digit No. KK"
                        required
                        className="w-full min-h-[44px] h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label htmlFor="reg-birthdate" className="text-[11px] font-bold text-slate-700">Tanggal Lahir</label>
                      <input
                        id="reg-birthdate"
                        name="tanggal_lahir"
                        type="date"
                        value={regBirthdate}
                        onChange={(e) => setRegBirthdate(e.target.value)}
                        required
                        className="w-full min-h-[44px] h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-phone" className="text-[11px] font-bold text-slate-700">No. Telepon / WhatsApp (Opsional)</label>
                      <input
                        id="reg-phone"
                        name="no_telepon"
                        type="tel"
                        inputMode="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full min-h-[44px] h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label htmlFor="reg-password" className="text-[11px] font-bold text-slate-700">Kata Sandi Baru</label>
                      <input
                        id="reg-password"
                        name="new_password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                        required
                        className="w-full min-h-[44px] h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-confirm-password" className="text-[11px] font-bold text-slate-700">Konfirmasi Sandi</label>
                      <input
                        id="reg-confirm-password"
                        name="confirm_password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi sandi baru"
                        required
                        className="w-full min-h-[44px] h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-600"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
                      <input
                        type="checkbox"
                        checked={showRegPassword}
                        onChange={(e) => setShowRegPassword(e.target.checked)}
                        className="rounded text-sky-700 focus:ring-0 w-4 h-4"
                      />
                      <span>Tampilkan kata sandi</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading || !regNik || !regKK || !regBirthdate || !regPassword}
                    className="mt-2 w-full min-h-[44px] h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
                  >
                    {regLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Mencocokkan Data...</>
                    ) : (
                      <>Verifikasi Identitas & Aktifkan Akun <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Footer Institutional Attribution */}
            <div className="mt-8 text-center border-t border-slate-200/80 pt-5">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Pemerintah Kota Sukabumi • Kecamatan Cikole • Kelurahan Kebonjati<br/>
                Sistem Tata Kelola Lingkungan Terpadu © 2026 Bumi Warga
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL BANTUAN PEMULIHAN AKUN (OFFICIAL RECOVERY GUIDANCE)                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showRecoveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="recovery-modal-title">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 flex items-center justify-center">
                      <HelpCircle size={20} />
                    </div>
                    <div>
                      <h4 id="recovery-modal-title" className="text-base font-bold text-slate-900">
                        Bantuan Pemulihan Akun Warga
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Prosedur resmi pemulihan kata sandi & akses login
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label="Tutup jendela bantuan"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 space-y-3.5">
                  {recoveryLoading ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                      <Loader2 size={24} className="animate-spin text-sky-600" />
                      <span>Memuat panduan resmi...</span>
                    </div>
                  ) : (
                    <>
                      {recoveryInfo?.methods?.map((m) => (
                        <div key={m.id} className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-white hover:border-sky-200 transition-colors">
                          <div className="flex items-center justify-between mb-1.5">
                            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              {m.id === 'rt_voucher' ? <Ticket size={14} className="text-amber-600" /> : <Building2 size={14} className="text-sky-600" />}
                              <span>{m.title}</span>
                            </h5>
                            {m.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                                {m.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      ))}

                      <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs leading-relaxed flex items-start gap-2.5">
                        <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block mb-0.5">Kepatuhan Privasi Data</span>
                          {recoveryInfo?.notice || 'Demi melindungi privasi data kependudukan (UU PDP No. 27/2022), sistem tidak menyediakan tautan reset otomatis tanpa verifikasi fisik/kontak resmi.'}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Tutup Panduan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
