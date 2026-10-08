import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  Sparkles
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  const isNik = /^\d+$/.test(identifier);
  const identifierValid = isNik ? identifier.length === 16 : identifier.trim().length >= 3;
  const hasMinLen = password.length >= 6;

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    if (/^\d+$/.test(val)) {
      setIdentifier(val.slice(0, 16));
    } else {
      setIdentifier(val);
    }
    if (errorMsg) setErrorMsg('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await login(identifier.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Identitas atau kata sandi tidak sesuai.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
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
      
      <div className="w-full max-w-[1000px] flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative z-10 border border-sky-100 min-h-[600px]">
        
        {/* Left Panel: Kanaya AI Welcome (Mobile-first: Hidden on very small screens, or stacked) */}
        <div className="hidden lg:flex flex-col justify-between w-[45%] bg-gradient-to-br from-sky-500 to-sky-700 p-10 text-white relative overflow-hidden">
          {/* Decorative subtle patterns */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
          
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.1} className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
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
            <h1 className="text-3xl font-extrabold leading-tight mb-4">
              Sampurasun!
            </h1>
            <p className="text-sky-100 leading-relaxed text-sm">
              Saya <strong>Kanaya</strong>, asisten virtual Anda di Bumi Warga. Silakan masuk untuk mengurus administrasi lingkungan dengan lebih cepat, mudah, dan aman.
            </p>
          </motion.div>

          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.3} className="relative z-10 mt-10">
            <div className="flex items-center gap-2 text-sky-200 text-xs bg-black/10 w-fit px-4 py-2 rounded-[1rem] backdrop-blur-sm">
              <ShieldCheck size={16} />
              <span>Terenkripsi & Sesuai UU PDP No. 27/2022</span>
            </div>
          </motion.div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="flex-1 flex flex-col p-8 sm:p-12 justify-center bg-white relative">
          
          <motion.div initial="hidden" animate="show" variants={fadeUp} custom={0.1} className="max-w-sm w-full mx-auto relative z-10">
            
            {/* Mobile Branding (Visible only on mobile) */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-[1rem] bg-sky-50 border border-sky-100 p-1 flex items-center justify-center">
                <img src="/icon-bumi-warga.png" alt="Bumi Warga" className="w-full h-full object-contain rounded-xl" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">Bumi Warga</h2>
                <p className="text-sky-600 text-xs font-bold">Jabar Pintar Digital</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Selamat Datang</h3>
              <p className="text-sm text-slate-500">
                Gunakan NIK atau Username Anda untuk masuk ke layanan.
              </p>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="p-3.5 rounded-[1.25rem] bg-red-50 border border-red-100 flex items-start gap-2.5 text-xs text-red-600 font-medium">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form
              className="flex flex-col gap-5"
              onSubmit={handleSubmit}
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
                  <CreditCard size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errorMsg ? 'text-red-400' : 'text-slate-400'}`} />
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder="Contoh: 3273xxxxxxxxxxxx"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    className={`w-full h-12 bg-slate-50 border rounded-[1.25rem] pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400
                      ${errorMsg ? 'border-red-200 focus:border-red-400 focus:ring-red-100 text-red-700' 
                        : identifierValid ? 'border-sky-200 focus:border-sky-500 focus:ring-sky-100 text-slate-800' 
                        : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100 text-slate-800'}`}
                  />
                  {identifierValid && !errorMsg && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-sky-100 p-1 rounded-full text-sky-600">
                      <CheckCircle size={14} />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="flex justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Kata Sandi / PIN</span>
                  <a href="#" className="text-sky-600 hover:text-sky-700 transition-colors">Lupa Sandi?</a>
                </label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${errorMsg ? 'text-red-400' : 'text-slate-400'}`} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className={`w-full h-12 bg-slate-50 border rounded-[1.25rem] pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400
                      ${errorMsg ? 'border-red-200 focus:border-red-400 focus:ring-red-100 text-red-700' : 'border-slate-200 focus:border-sky-500 focus:ring-sky-100 text-slate-800'}`}
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
              <div className="bg-sky-50/50 border border-sky-100 rounded-[1.25rem] p-3.5 flex gap-3 items-start mt-2 hover:bg-sky-50 transition-colors">
                <div className="bg-sky-100 p-1.5 rounded-lg shrink-0">
                  <Users size={16} className="text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-800 block mb-0.5">Akses Keluarga Terpadu</strong>
                  Gunakan NIK dan <strong>Sandi KK</strong> atau PIN Tanggal Lahir (DDMMYYYY) untuk anggota keluarga dalam 1 KK.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !identifierValid || !hasMinLen}
                className="mt-4 w-full h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-[1.25rem] text-sm font-bold shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
              >
                {isLoading ? (
                  <><Loader2 size={18} className="animate-spin" /> Sedang Memproses...</>
                ) : (
                  <>Mulai Sesi <ArrowRight size={18} /></>
                )}
              </motion.button>
            </motion.form>

            <div className="mt-8 text-center">
              <p className="text-[11px] text-slate-400 font-medium">
                Sistem Informasi Terpadu Bumi Warga<br/>
                © 2026 Jabar Pintar Digital
              </p>
            </div>
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
