import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import KanayaAIAssistant from '../components/KanayaAIAssistant';
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
  PhoneCall,
  Sparkles
} from 'lucide-react';

/**
 * Gedung Sate Sunda Architectural Icon (SVG Vector)
 * Dilengkapi animasi shimmer/pulse halus pada puncak menara tusuk sate melati.
 */
function GedungSateIcon({ className = "w-6 h-6", glow = true }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-current"
      >
        {/* Puncak Menara Tusuk Sate (6 Melati) */}
        <line x1="24" y1="2" x2="24" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="24" cy="4" r="1.5" fill="currentColor" />
        <ellipse cx="24" cy="7" rx="3" ry="1.2" fill="currentColor" opacity="0.9" />
        <ellipse cx="24" cy="9.5" rx="3.5" ry="1.3" fill="currentColor" opacity="0.9" />
        <ellipse cx="24" cy="12" rx="4" ry="1.4" fill="currentColor" opacity="0.9" />
        
        {/* Atap Utama Bertingkat Khas Gedung Sate */}
        <path
          d="M19 15L24 12L29 15V18H19V15Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path
          d="M15 18L24 14L33 18V21H15V18Z"
          fill="currentColor"
          opacity="0.9"
        />
        <path
          d="M10 21L24 16L38 21V24H10V21Z"
          fill="currentColor"
          opacity="0.85"
        />

        {/* Fasad Badan Gedung Utama Simetris */}
        <rect x="8" y="24" width="32" height="18" rx="1.5" fill="currentColor" opacity="0.25" stroke="currentColor" strokeWidth="1.6" />
        <line x1="8" y1="33" x2="40" y2="33" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />

        {/* Lengkungan Jendela Busur Khas Hindia Belanda / Priangan */}
        <path d="M12 28C12 26.5 13 25.5 14.5 25.5C16 25.5 17 26.5 17 28V31H12V28Z" fill="currentColor" opacity="0.85" />
        <path d="M19 28C19 26.5 20 25.5 21.5 25.5C23 25.5 24 26.5 24 28V31H19V28Z" fill="currentColor" opacity="0.85" />
        <path d="M26 28C26 26.5 27 25.5 28.5 25.5C30 25.5 31 26.5 31 28V31H26V28Z" fill="currentColor" opacity="0.85" />
        <path d="M33 28C33 26.5 34 25.5 35.5 25.5C37 25.5 38 26.5 38 28V31H33V28Z" fill="currentColor" opacity="0.85" />

        {/* Pintu Gerbang Pilar Tengah */}
        <path d="M21 35C21 33.5 22 33 24 33C26 33 27 33.5 27 35V42H21V35Z" fill="currentColor" opacity="0.95" />
        
        {/* Kolom / Pondasi Lantai */}
        <rect x="6" y="42" width="36" height="3" rx="1" fill="currentColor" opacity="0.9" />
      </svg>

      {/* Sinyal Menara Shimmer / Ambient Glow */}
      {glow && (
        <motion.span
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1 w-2.5 h-2.5 rounded-full bg-amber-400 blur-xs pointer-events-none"
        />
      )}
    </div>
  );
}

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
              description: 'Kunjungi loket administrasi kantor kelurahan setempat dengan membawa fisik e-KTP dan Kartu Keluarga asli untuk verifikasi data kependudukan langsung.',
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
    <div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-b from-sky-100/70 via-sky-50/50 to-slate-50 font-sans flex items-center justify-center p-3 sm:p-6 lg:p-8 relative">
      {/* Soft Sky Background Tone dengan Watermark Nuansa Pasundan */}
      <div className="fixed inset-0 bg-gradient-to-b from-sky-100/60 via-sky-50/30 to-slate-50 pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Civic Container (Mobile-First Responsive) */}
      <div className="w-full max-w-[960px] flex flex-col lg:flex-row bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl shadow-sky-900/5 overflow-hidden relative z-10 border border-sky-100">
        
        {/* Left Side: Kanaya & Identity Gedung Sate (Desktop Only - Soft Blue Sky) */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 p-8 text-white relative overflow-hidden">
          {/* Subtle Watermark Silhouette */}
          <div className="absolute -right-6 -bottom-10 opacity-15 pointer-events-none text-white">
            <GedungSateIcon className="w-72 h-72" glow={false} />
          </div>

          <div className="relative z-10">
            {/* Logo & Civic Title dengan Gedung Sate Icon */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md p-2 flex items-center justify-center border border-white/30 text-white shadow-inner">
                <GedungSateIcon className="w-8 h-8 text-amber-200" glow={true} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">Bumi Warga</h2>
                <p className="text-sky-100 text-xs font-semibold">Jabar Pintar Digital</p>
              </div>
            </div>

            {/* Kanaya Public Assistant Intro (Khusus Sapaan Wargi) */}
            <div className="space-y-3 my-6 p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center text-xl shadow-sm border border-white/25">
                  👩🏻
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-200 flex items-center gap-1">
                    <Sparkles size={12} /> Asisten Cerdas Kanaya
                  </span>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    Sampurasun, Wargi!
                  </h3>
                </div>
              </div>
              <p className="text-sky-50 text-xs leading-relaxed font-normal">
                Saya <strong>Kanaya</strong>, asisten pintar layanan publik terpadu Bumi Warga. Masuk untuk mengakses administrasi kependudukan, pengajuan surat pengantar, pantau bansos, dan iuran lingkungan.
              </p>
            </div>

            {/* Factual Security Architecture */}
            <div className="border-t border-white/20 pt-4 space-y-2 text-xs text-sky-50/90">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-sky-200 shrink-0 mt-0.5" />
                <span>Kredensial terenkripsi standar industri Bcrypt (10 rounds).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-sky-200 shrink-0 mt-0.5" />
                <span>Sesi aman berbasis cookie HttpOnly terverifikasi.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={14} className="text-sky-200 shrink-0 mt-0.5" />
                <span>Audit trail berjenjang (RT, RW, dan Kelurahan).</span>
              </div>
            </div>
          </div>

          {/* Privacy Law Compliance */}
          <div className="relative z-10 pt-4">
            <div className="inline-flex items-center gap-2 text-[11px] text-sky-50 bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
              <ShieldCheck size={13} className="text-sky-100 shrink-0" />
              <span>Prinsip Perlindungan Data Pribadi (UU PDP No. 27/2022)</span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Forms (Clean & Mobile-First) */}
        <div className="flex-1 flex flex-col p-5 sm:p-8 justify-between bg-white relative">
          <div className="max-w-md w-full mx-auto my-auto space-y-4">
            
            {/* Mobile Header Branding dengan Animasi Gedung Sate */}
            <div className="lg:hidden flex items-center justify-between -mx-5 -mt-5 px-5 py-3.5 bg-gradient-to-r from-sky-50 via-sky-50/60 to-white border-b border-sky-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-sky-200 shadow-xs flex items-center justify-center text-sky-600">
                  <GedungSateIcon className="w-5 h-5 text-sky-600" glow={true} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Bumi Warga</h2>
                  <p className="text-[10px] text-sky-700 font-semibold">Jabar Pintar Digital</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white text-sky-700 border border-sky-200 shadow-2xs">
                Layanan Publik
              </span>
            </div>

            {/* Segmented Control Tabs (Mobile-First Touch Target) */}
            <div className="grid grid-cols-3 p-1 bg-sky-50/80 rounded-xl border border-sky-100 gap-1 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => switchView('login')}
                className={`min-h-[40px] py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeView === 'login'
                    ? 'bg-white text-sky-700 shadow-xs border border-sky-100'
                    : 'hover:text-sky-900'
                }`}
              >
                <LogIn size={14} />
                <span>Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => switchView('claim')}
                className={`min-h-[40px] py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeView === 'claim'
                    ? 'bg-white text-amber-700 shadow-xs border border-amber-100'
                    : 'hover:text-sky-900'
                }`}
              >
                <Ticket size={14} />
                <span>Kupon RT</span>
              </button>

              <button
                type="button"
                onClick={() => switchView('register')}
                className={`min-h-[40px] py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeView === 'register'
                    ? 'bg-white text-emerald-700 shadow-xs border border-emerald-100'
                    : 'hover:text-sky-900'
                }`}
              >
                <UserPlus size={14} />
                <span>Aktivasi</span>
              </button>
            </div>

            {/* Success Feedback Banner */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-xs text-emerald-800 font-medium">
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* 1. PRIMARY VIEW: LOGIN FORM                                              */}
            {/* ========================================================================= */}
            {activeView === 'login' && (
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Masuk Layanan Warga
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
                    Gunakan NIK (16 digit) atau nama pengguna dinas beserta kata sandi pribadi Anda.
                  </p>
                </div>

                {/* Generic Login Error Alert */}
                <AnimatePresence>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                      role="alert"
                    >
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-medium">
                        <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                        <span>{loginError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.form
                  className="flex flex-col gap-2.5 sm:gap-3"
                  onSubmit={handleLoginSubmit}
                  variants={shakeVariants}
                  initial="initial"
                  animate={shake ? 'shake' : 'initial'}
                >
                  {/* NIK / Username Field */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-0.5">
                      <label htmlFor="login-identifier" className="text-xs font-bold text-slate-700">
                        NIK / Nama Pengguna
                      </label>
                      {isNik && (
                        <span className={`text-[10px] font-mono font-medium ${identifierValid ? 'text-sky-700 font-semibold' : 'text-slate-400'}`}>
                          {identifier.length}/16 Digit
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <CreditCard size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${loginError ? 'text-red-500' : 'text-slate-400'}`} />
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
                        placeholder="Masukkan 16 digit NIK atau username"
                        autoComplete="username"
                        required
                        disabled={isLoading}
                        className={`w-full min-h-[44px] bg-sky-50/30 border rounded-xl pl-9.5 pr-9 text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400
                          ${loginError 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 text-red-900 bg-red-50/30' 
                            : identifierValid 
                              ? 'border-sky-300 focus:border-sky-500 focus:ring-sky-500/20 text-slate-900 bg-white' 
                              : 'border-sky-200/80 focus:bg-white focus:border-sky-500 focus:ring-sky-500/20 text-slate-900'}`}
                      />
                      {identifierValid && !loginError && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sky-600">
                          <CheckCircle size={15} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center px-0.5">
                      <label htmlFor="login-password" className="text-xs font-bold text-slate-700">
                        Kata Sandi Akun
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenRecovery}
                        className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 hover:underline flex items-center cursor-pointer"
                      >
                        Lupa Sandi?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${loginError ? 'text-red-500' : 'text-slate-400'}`} />
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="Masukkan kata sandi akun pribadi"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                        className={`w-full min-h-[44px] bg-sky-50/30 border rounded-xl pl-9.5 pr-10 text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400
                          ${loginError 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-100 text-red-900 bg-red-50/30' 
                            : 'border-sky-200/80 focus:bg-white focus:border-sky-500 focus:ring-sky-500/20 text-slate-900'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Micro Privacy & Security Badge */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 px-0.5">
                    <ShieldCheck size={13} className="text-sky-700 shrink-0" />
                    <span>Terenkripsi Bcrypt & Dilindungi UU PDP No. 27/2022</span>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || !identifierValid || !hasMinLen}
                    className="w-full min-h-[46px] bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Memeriksa Kredensial...</>
                    ) : (
                      <>Masuk ke Layanan <ArrowRight size={16} /></>
                    )}
                  </button>
                </motion.form>

                {/* Kanaya Public Assistant Trigger Chip */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleOpenRecovery}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-sky-800 transition-colors p-1 rounded-lg cursor-pointer"
                  >
                    <Sparkles size={13} className="text-amber-500 shrink-0" />
                    <span>Belum memiliki akun atau kupon RT? <strong>Tanya Panduan Resmi</strong></span>
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. SECONDARY VIEW: KLAIM KUPON RT/RW                                      */}
            {/* ========================================================================= */}
            {activeView === 'claim' && (
              <div className="space-y-2.5 sm:space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Klaim Kupon RT
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Masukkan NIK dan Kode Kupon (format: BW-XXXXXX) yang diterbitkan oleh Ketua RT.
                  </p>
                </div>

                <AnimatePresence>
                  {claimError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                      role="alert"
                    >
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-medium">
                        <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                        <span>{claimError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleClaimSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="claim-nik" className="text-xs font-bold text-slate-700">
                      NIK Warga (16 Digit)
                    </label>
                    <div className="relative">
                      <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="claim-nik"
                        name="nik"
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        value={claimNik}
                        onChange={(e) => setClaimNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="3272xxxxxxxxxxxx"
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl pl-9 pr-3 text-sm font-mono font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="claim-token" className="text-xs font-bold text-slate-700">
                      Kode Kupon RT (BW-XXXXXX)
                    </label>
                    <div className="relative">
                      <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="claim-token"
                        name="token"
                        type="text"
                        maxLength={9}
                        value={claimToken}
                        onChange={(e) => setClaimToken(e.target.value.toUpperCase())}
                        placeholder="BW-9X7M2K"
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl pl-9 pr-3 text-sm font-mono font-bold tracking-wider uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="claim-password" className="text-xs font-bold text-slate-700">
                        Kata Sandi Baru
                      </label>
                      <input
                        id="claim-password"
                        name="new_password"
                        type={showClaimPassword ? 'text' : 'password'}
                        value={claimPassword}
                        onChange={(e) => setClaimPassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl px-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="claim-confirm-password" className="text-xs font-bold text-slate-700">
                        Ulangi Sandi
                      </label>
                      <input
                        id="claim-confirm-password"
                        name="confirm_password"
                        type={showClaimPassword ? 'text' : 'password'}
                        value={claimConfirmPassword}
                        onChange={(e) => setClaimConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi"
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl px-3 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={claimLoading || !claimNik || !claimToken || !claimPassword}
                    className="mt-2 w-full min-h-[46px] bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {claimLoading ? (
                      <><Loader2 size={15} className="animate-spin" /> Mengaktifkan Akun...</>
                    ) : (
                      <>Aktifkan Akun & Buat Kata Sandi <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. SECONDARY VIEW: AKTIVASI MANDIRI ONLINE                                */}
            {/* ========================================================================= */}
            {activeView === 'register' && (
              <div className="space-y-2.5 sm:space-y-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    Aktivasi Mandiri
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                    Cocokkan NIK, Nomor KK, dan Tanggal Lahir sesuai data resmi Anda.
                  </p>
                </div>

                <AnimatePresence>
                  {regError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                      role="alert"
                    >
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-medium">
                        <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                        <span>{regError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRegSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="reg-nik" className="text-xs font-bold text-slate-700">NIK (16 Digit)</label>
                      <input
                        id="reg-nik"
                        name="nik"
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        value={regNik}
                        onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="3272xxxxxxxxxxxx"
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl px-3 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-kk" className="text-xs font-bold text-slate-700">Nomor KK</label>
                      <input
                        id="reg-kk"
                        name="no_kk"
                        type="text"
                        inputMode="numeric"
                        maxLength={16}
                        value={regKK}
                        onChange={(e) => setRegKK(e.target.value.replace(/\D/g, ''))}
                        placeholder="3272xxxxxxxxxxxx"
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl px-3 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="reg-birthdate" className="text-xs font-bold text-slate-700">Tanggal Lahir</label>
                      <input
                        id="reg-birthdate"
                        name="tanggal_lahir"
                        type="date"
                        value={regBirthdate}
                        onChange={(e) => setRegBirthdate(e.target.value)}
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl px-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-phone" className="text-xs font-bold text-slate-700">No. WhatsApp</label>
                      <input
                        id="reg-phone"
                        name="no_telepon"
                        type="tel"
                        inputMode="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl px-3 text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="reg-password" className="text-xs font-bold text-slate-700">Kata Sandi</label>
                      <input
                        id="reg-password"
                        name="new_password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl px-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="reg-confirm-password" className="text-xs font-bold text-slate-700">Ulangi Sandi</label>
                      <input
                        id="reg-confirm-password"
                        name="confirm_password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi sandi"
                        required
                        className="w-full min-h-[44px] bg-sky-50/30 border border-sky-200/80 rounded-xl px-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={regLoading || !regNik || !regKK || !regBirthdate || !regPassword}
                    className="mt-2 w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {regLoading ? (
                      <><Loader2 size={15} className="animate-spin" /> Mencocokkan Data...</>
                    ) : (
                      <>Verifikasi Identitas & Aktifkan <ArrowRight size={15} /></>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Footer Institutional Attribution (Formal & Baku Jabar Pintar Digital) */}
            <div className="pt-2 text-center border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-medium">
                Dikembangkan oleh Jabar Pintar Digital • Sistem Tata Kelola Lingkungan Terpadu © 2026
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

      {/* Floating & Draggable Kanaya AI Assistant (Guest & Onboarding Support) */}
      <KanayaAIAssistant />
    </div>
  );
}
