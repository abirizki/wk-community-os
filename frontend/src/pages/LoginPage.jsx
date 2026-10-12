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
  Loader2,
  AlertCircle,
  Users,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserPlus,
  LogIn,
  Calendar,
  Phone,
  FileText,
  CheckCircle2
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode/Tab: 'login' | 'claim' | 'register'
  const initialTab = searchParams.get('tab') || 'login';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Success Feedback
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Tab Login State
  const [identifier, setIdentifier] = useState(searchParams.get('nik') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);

  // 2. Tab Klaim Kupon RT State
  const [claimNik, setClaimNik] = useState(searchParams.get('nik') || '');
  const [claimToken, setClaimToken] = useState(searchParams.get('token') || '');
  const [claimPassword, setClaimPassword] = useState('');
  const [claimConfirmPassword, setClaimConfirmPassword] = useState('');
  const [showClaimPassword, setShowClaimPassword] = useState(false);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [verifiedResident, setVerifiedResident] = useState(null);

  // 3. Tab Aktivasi Mandiri State
  const [regNik, setRegNik] = useState('');
  const [regKK, setRegKK] = useState('');
  const [regBirthdate, setRegBirthdate] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');

  // Auto-switch tab if query params change
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['login', 'claim', 'register'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const tokenParam = searchParams.get('token');
    if (tokenParam) setClaimToken(tokenParam);
    const nikParam = searchParams.get('nik');
    if (nikParam) {
      setClaimNik(nikParam);
      setIdentifier(nikParam);
    }
  }, [searchParams]);

  // Validation Helpers
  const isNik = /^\d+$/.test(identifier);
  const identifierValid = isNik ? identifier.length === 16 : identifier.trim().length >= 3;
  const hasMinLen = password.length >= 6;

  // Handler Tab Switcher
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
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
      setLoginError(err.message || 'Identitas atau kata sandi tidak sesuai.');
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
        setActiveTab('login');
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
        setActiveTab('login');
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
    hidden: { opacity: 0, y: 15 },
    show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut', delay } }),
  };

  return (
    <div className="min-h-screen bg-sky-50 font-sans flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Soft Sky Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-200/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-300/30 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-[1020px] flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-sky-100 min-h-[620px]">
        
        {/* Left Panel: Kanaya AI Welcome */}
        <div className="hidden lg:flex flex-col justify-between w-[42%] bg-gradient-to-br from-sky-500 via-sky-600 to-sky-700 p-10 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.1} className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-[1rem] bg-white/20 backdrop-blur-md p-1 flex items-center justify-center shadow-inner border border-white/20">
                <img src="/icon-bumi-warga.png" alt="Bumi Warga" className="w-full h-full object-contain rounded-xl" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Bumi Warga</h2>
                <p className="text-sky-100 text-xs font-medium tracking-wide">Jabar Pintar Digital</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.2} className="relative z-10 my-auto">
            {/* Kanaya Avatar Representation */}
            <div className="w-20 h-20 rounded-[1.2rem] bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-6 shadow-lg">
              <div className="relative">
                 <span className="text-5xl drop-shadow-md" role="img" aria-label="Sundanese Woman">👩🏻</span>
                 <div className="absolute -bottom-1 -right-2 bg-sky-400 rounded-full p-1.5 border-2 border-sky-600 shadow-sm">
                    <Sparkles size={12} className="text-white" />
                 </div>
              </div>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight mb-3">
              Sampurasun!
            </h1>
            <p className="text-sky-100 leading-relaxed text-sm">
              Saya <strong>Kanaya</strong>, asisten virtual Anda di Bumi Warga. Silakan masuk atau aktivasi akun untuk mengakses layanan kependudukan, bansos, dan iuran lingkungan.
            </p>

            {/* Keunggulan 3 Jalur Keamanan */}
            <div className="mt-6 pt-6 border-t border-white/15 space-y-2 text-xs text-sky-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-sky-300 shrink-0" />
                <span>Kupon Aktivasi 24 Jam dari RT/RW</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-sky-300 shrink-0" />
                <span>Verifikasi Identitas Resmi KK & NIK</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-sky-300 shrink-0" />
                <span>Kata Sandi Pribadi Terenkripsi Standar BSSN</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.3} className="relative z-10 mt-8">
            <div className="flex items-center gap-2 text-sky-200 text-xs bg-black/10 w-fit px-4 py-2 rounded-[1rem] backdrop-blur-sm">
              <ShieldCheck size={16} />
              <span>Terenkripsi & Sesuai UU PDP No. 27/2022</span>
            </div>
          </motion.div>
        </div>

        {/* Right Panel: Forms */}
        <div className="flex-1 flex flex-col p-6 sm:p-10 justify-center bg-white relative">
          
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.1} className="max-w-md w-full mx-auto relative z-10">
            
            {/* Mobile Branding */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-[1rem] bg-sky-50 border border-sky-100 p-1 flex items-center justify-center">
                <img src="/icon-bumi-warga.png" alt="Bumi Warga" className="w-full h-full object-contain rounded-xl" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Bumi Warga</h2>
                <p className="text-sky-600 text-xs font-bold">Jabar Pintar Digital</p>
              </div>
            </div>

            {/* Header Tab Switcher (Mobile First Pill Buttons) */}
            <div className="mb-6 p-1.5 bg-slate-100/80 rounded-2xl flex gap-1 border border-slate-200/60">
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn size={14} />
                <span>Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('claim')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'claim'
                    ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Ticket size={14} />
                <span>Kupon RT</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('register')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-white text-sky-700 shadow-sm border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus size={14} />
                <span>Aktivasi Mandiri</span>
              </button>
            </div>

            {/* Success Message Banner */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{successMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ========================================================================= */}
            {/* 1. TAB LOGIN                                                              */}
            {/* ========================================================================= */}
            {activeTab === 'login' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-2xl font-extrabold text-slate-800 mb-1">Selamat Datang</h3>
                  <p className="text-xs text-slate-500">
                    Masukkan NIK atau Username Anda untuk mengakses layanan.
                  </p>
                </div>

                <AnimatePresence>
                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-5 overflow-hidden"
                    >
                      <div className="p-3.5 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-xs text-red-600 font-medium">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
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
                  <div className="space-y-1.5">
                    <label htmlFor="identifier" className="flex justify-between text-xs font-bold text-slate-700 px-1">
                      <span>NIK / Username</span>
                      {isNik && (
                        <span className={`transition-colors ${identifierValid ? 'text-sky-600' : 'text-slate-400'}`}>
                          {identifier.length}/16
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <CreditCard size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${loginError ? 'text-red-400' : 'text-slate-400'}`} />
                      <input
                        id="identifier"
                        type="text"
                        value={identifier}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIdentifier(/^\d+$/.test(val) ? val.slice(0, 16) : val);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="Contoh: 3272xxxxxxxxxxxx"
                        autoComplete="username"
                        required
                        disabled={isLoading}
                        className={`w-full h-12 bg-slate-50 border rounded-2xl pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400
                          ${loginError ? 'border-red-200 focus:border-red-400 focus:ring-red-100 text-red-700' 
                            : identifierValid ? 'border-sky-200 focus:border-sky-500 focus:ring-sky-100 text-slate-800' 
                            : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100 text-slate-800'}`}
                      />
                      {identifierValid && !loginError && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-sky-100 p-1 rounded-full text-sky-600">
                          <CheckCircle size={14} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className="flex justify-between text-xs font-bold text-slate-700 px-1">
                      <span>Kata Sandi / PIN</span>
                      <button
                        type="button"
                        onClick={() => handleTabChange('claim')}
                        className="text-sky-600 hover:text-sky-700 transition-colors"
                      >
                        Punya Kupon RT?
                      </button>
                    </label>
                    <div className="relative">
                      <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${loginError ? 'text-red-400' : 'text-slate-400'}`} />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (loginError) setLoginError('');
                        }}
                        placeholder="Masukkan kata sandi"
                        autoComplete="current-password"
                        required
                        disabled={isLoading}
                        className={`w-full h-12 bg-slate-50 border rounded-2xl pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400
                          ${loginError ? 'border-red-200 focus:border-red-400 focus:ring-red-100 text-red-700' : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100 text-slate-800'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Family Access Info */}
                  <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-3 flex gap-2.5 items-start hover:bg-sky-50 transition-colors">
                    <div className="bg-sky-100 p-1.5 rounded-lg shrink-0">
                      <Users size={16} className="text-sky-600" />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 block mb-0.5">Akses Keluarga Terpadu</strong>
                      Gunakan NIK dan <strong>Sandi KK</strong> atau PIN Tanggal Lahir (DDMMYYYY) untuk login anggota keluarga.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || !identifierValid || !hasMinLen}
                    className="mt-2 w-full h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                  >
                    {isLoading ? (
                      <><Loader2 size={18} className="animate-spin" /> Sedang Memproses...</>
                    ) : (
                      <>Mulai Sesi <ArrowRight size={18} /></>
                    )}
                  </motion.button>
                </motion.form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. TAB KLAIM KUPON DARI RT/RW (JALUR VOUCHING)                           */}
            {/* ========================================================================= */}
            {activeTab === 'claim' && (
              <div>
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                      Jalur Vouching RT/RW
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">Klaim Kupon Aktivasi</h3>
                  <p className="text-xs text-slate-500">
                    Masukkan NIK dan Kode Kupon 8-Karakter yang diberikan oleh Ketua RT/RW Anda.
                  </p>
                </div>

                <AnimatePresence>
                  {claimError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="p-3 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-xs text-red-600 font-medium">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{claimError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleClaimSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 px-1">NIK Warga (16 Digit)</label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={16}
                        value={claimNik}
                        onChange={(e) => setClaimNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 3272030101700001"
                        required
                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 text-xs font-mono font-medium focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 px-1">Kode Kupon RT (Format: BW-XXXXXX)</label>
                    <div className="relative">
                      <Ticket size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={9}
                        value={claimToken}
                        onChange={(e) => setClaimToken(e.target.value.toUpperCase())}
                        placeholder="Contoh: BW-9X7M2K"
                        required
                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 px-1">Buat Kata Sandi Pribadi Baru</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showClaimPassword ? 'text' : 'password'}
                        value={claimPassword}
                        onChange={(e) => setClaimPassword(e.target.value)}
                        placeholder="Minimal 8 karakter kombinasi"
                        required
                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-12 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowClaimPassword(!showClaimPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showClaimPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 px-1">Ulangi Kata Sandi Baru</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showClaimPassword ? 'text' : 'password'}
                        value={claimConfirmPassword}
                        onChange={(e) => setClaimConfirmPassword(e.target.value)}
                        placeholder="Ketik ulang kata sandi"
                        required
                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-sky-100 focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={claimLoading || !claimNik || !claimToken || !claimPassword}
                    className="mt-3 w-full h-11 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {claimLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Mengaktifkan Akun...</>
                    ) : (
                      <>Aktifkan Akun & Buat Kata Sandi <ArrowRight size={16} /></>
                    )}
                  </motion.button>
                </form>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. TAB AKTIVASI MANDIRI (e-KYC RINGAN)                                    */}
            {/* ========================================================================= */}
            {activeTab === 'register' && (
              <div>
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      e-KYC Verifikasi KK Mandiri
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800">Aktivasi Mandiri Online</h3>
                  <p className="text-xs text-slate-500">
                    Cocokkan NIK, Nomor KK, dan Tanggal Lahir yang terdaftar di kelurahan.
                  </p>
                </div>

                <AnimatePresence>
                  {regError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-4 overflow-hidden"
                    >
                      <div className="p-3 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-2.5 text-xs text-red-600 font-medium">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>{regError}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleRegSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">NIK Warga</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={regNik}
                        onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
                        placeholder="16 Digit NIK"
                        required
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Nomor Kartu Keluarga</label>
                      <input
                        type="text"
                        maxLength={16}
                        value={regKK}
                        onChange={(e) => setRegKK(e.target.value.replace(/\D/g, ''))}
                        placeholder="16 Digit No KK"
                        required
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Tanggal Lahir Warga</label>
                      <input
                        type="date"
                        value={regBirthdate}
                        onChange={(e) => setRegBirthdate(e.target.value)}
                        required
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">No. WhatsApp (Opsional)</label>
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-mono focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Kata Sandi Baru</label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 8 karakter"
                        required
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700 px-1">Konfirmasi Sandi</label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi sandi"
                        required
                        className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showRegPassword}
                        onChange={(e) => setShowRegPassword(e.target.checked)}
                        className="rounded text-sky-600 focus:ring-0"
                      />
                      <span>Tampilkan kata sandi</span>
                    </label>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={regLoading || !regNik || !regKK || !regBirthdate || !regPassword}
                    className="mt-3 w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {regLoading ? (
                      <><Loader2 size={16} className="animate-spin" /> Verifikasi Dokumen...</>
                    ) : (
                      <>Verifikasi Identitas & Aktifkan Akun <ArrowRight size={16} /></>
                    )}
                  </motion.button>
                </form>
              </div>
            )}

            <div className="mt-8 text-center border-t border-slate-100 pt-5">
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                Sistem Informasi Terpadu Bumi Warga<br/>
                Kecamatan Cikole, Kota Sukabumi • © 2026 Jabar Pintar Digital
              </p>
            </div>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
