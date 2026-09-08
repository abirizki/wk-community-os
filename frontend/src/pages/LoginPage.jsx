import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  MapPin,
  BarChart3,
  FileText,
  Users,
  Zap,
  Info
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  const nikValid = nik.length === 16;

  const hasMinLen = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasSymbol = /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password);
  const strengthScore = [hasMinLen, hasMixedCase, hasSymbol].filter(Boolean).length;
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

  const handleNikChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
    setNik(digits);
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
      await login(nik, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'NIK atau kata sandi tidak valid.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const shakeVariants = {
    initial: { x: 0 },
    shake: {
      x: [-10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4 }
    }
  };

  const stats = [
    { icon: <Users size={18} />, label: 'Warga Terdaftar', value: '12.400+' },
    { icon: <FileText size={18} />, label: 'Dokumen Diproses', value: '48.700+' },
    { icon: <BarChart3 size={18} />, label: 'Layanan Aktif', value: '6 Modul' },
    { icon: <Zap size={18} />, label: 'Waktu Respons', value: '< 24 Jam' },
  ];

  const features = [
    { icon: <MapPin size={16} />, text: 'Kelola data kependudukan (NIK, KK) secara digital dari mana saja' },
    { icon: <FileText size={16} />, text: 'Pengajuan & pelacakan dokumen kelurahan tanpa antre' },
    { icon: <BarChart3 size={16} />, text: 'Analitik demografi & kebutuhan warga real-time untuk RT/RW' },
    { icon: <Shield size={16} />, text: 'Perlindungan data pribadi sesuai UU PDP No. 27/2022' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans flex">

      {/* ── Left Panel: Branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-between w-[55%] bg-primary p-12 text-on-primary relative overflow-hidden"
      >
        {/* Background decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />

        {/* Logo & Brand */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <MapPin size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight leading-none">Bumi Warga</h1>
              <p className="text-xs text-white/60 font-medium mt-0.5">Platform Digital Pelayanan Publik</p>
            </div>
          </div>

          {/* Copywriting Headline */}
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Jembatan Digital<br/>
            antara Warga<br/>
            dan Pemerintah
          </h2>
          <p className="text-sm text-white/70 leading-relaxed max-w-xs mb-8">
            <strong className="text-white">Bumi Warga</strong> hadir sebagai platform terintegrasi yang memudahkan 
            warga dalam mengakses layanan kelurahan — dari pengajuan dokumen, pemantauan PBB, 
            hingga pencatatan kesehatan anak — kapan saja, tanpa antre, langsung dari genggaman Anda.
          </p>

          {/* Features */}
          <div className="flex flex-col gap-3 mb-10">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <p className="text-sm text-white/75 leading-snug">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div>
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-4">Dampak Nyata</p>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3.5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="text-white/70">{s.icon}</div>
                  <span className="text-xs text-white/60">{s.label}</span>
                </div>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-white/40 mt-6">
            © 2025 Bumi Warga — Dikelola untuk pelayanan warga terintegrasi
          </p>
        </div>
      </motion.div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-primary text-on-primary rounded-lg flex items-center justify-center">
              <MapPin size={19} />
            </div>
            <div>
              <span className="font-bold text-base text-on-surface leading-none block">Bumi Warga</span>
              <span className="text-[11px] text-on-surface-variant">Platform Digital Pelayanan Publik</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-on-surface leading-tight">Masuk ke Akun</h2>
            <p className="text-sm text-on-surface-variant mt-1.5">
              Gunakan NIK dan kata sandi yang telah terdaftar.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 bg-error-container text-on-error-container p-3 rounded-lg flex items-center gap-2 border border-error/20"
            >
              <AlertCircle size={16} className="text-error flex-shrink-0" />
              <span className="text-sm font-medium">{errorMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            variants={shakeVariants}
            initial="initial"
            animate={shake ? 'shake' : 'initial'}
          >
            {/* NIK */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="nik" className="text-sm font-semibold text-on-surface">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <span className="text-xs text-on-surface-variant">{nik.length}/16</span>
              </div>
              <div className="relative flex items-center">
                <CreditCard
                  size={18}
                  className={`absolute left-3.5 pointer-events-none ${errorMsg ? 'text-error/70' : 'text-on-surface-variant'}`}
                />
                <input
                  id="nik"
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={nik}
                  onChange={handleNikChange}
                  placeholder="3201xxxxxxxxxxxx"
                  autoComplete="username"
                  required
                  disabled={isLoading}
                  className={`w-full h-11 bg-surface-container-low border rounded-lg pl-10 pr-20 text-sm font-medium tracking-wide focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/40 disabled:opacity-60
                    ${errorMsg
                      ? 'border-error text-error focus:ring-error/20'
                      : nikValid
                        ? 'border-tertiary text-on-surface focus:ring-tertiary/20'
                        : 'border-outline-variant text-on-surface focus:border-primary focus:ring-primary/15'
                    }`}
                />
                {nikValid && !errorMsg && (
                  <span className="absolute right-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-tertiary bg-tertiary-fixed px-2 py-0.5 rounded border border-tertiary/20">
                    <CheckCircle size={12} /> Sesuai
                  </span>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-semibold text-on-surface">
                  Kata Sandi
                </label>
                <a href="#" className="text-xs font-semibold text-primary hover:underline">
                  Lupa kata sandi?
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock
                  size={18}
                  className={`absolute left-3.5 pointer-events-none ${errorMsg ? 'text-error/70' : 'text-on-surface-variant'}`}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className={`w-full h-11 bg-surface-container-low border rounded-lg pl-10 pr-11 text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/40 disabled:opacity-60
                    ${errorMsg
                      ? 'border-error text-error focus:ring-error/20'
                      : 'border-outline-variant text-on-surface focus:border-primary focus:ring-primary/15'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 text-on-surface-variant hover:text-on-surface focus:outline-none p-1 transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* Strength indicator (compact) */}
              {password.length > 0 && !errorMsg && (
                <div className="flex gap-1.5 mt-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= strengthScore ? strengthColors[strengthScore] : 'bg-surface-dim'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !nikValid || !password}
              className="mt-1 w-full h-11 bg-primary hover:bg-primary/90 active:scale-[0.98] text-on-primary rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <><Loader2 size={17} className="animate-spin" /> Memverifikasi...</>
              ) : (
                <><span>Masuk ke Bumi Warga</span><ArrowRight size={17} /></>
              )}
            </button>
          </motion.form>

          {/* Register */}
          <div className="mt-5 pt-5 border-t border-outline-variant text-center">
            <p className="text-sm text-on-surface-variant mb-3">Belum punya akun warga digital?</p>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              Daftar Akun Bumi Warga →
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant">
              <ShieldCheck size={11} className="text-primary" /> Enkripsi AES-256
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant">
              <Shield size={11} className="text-primary" /> UU PDP No. 27/2022
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant">
              <Info size={11} className="text-primary" /> ISO/IEC 27001
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Sub-components (kept for possible future reuse) ─── */

function CriteriaBadge({ met, label }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[10px] transition-all ${
        met
          ? 'text-tertiary bg-tertiary-fixed border-tertiary/20'
          : 'text-on-surface-variant bg-surface-container-low border-outline-variant'
      }`}
    >
      {met ? <CheckCircle size={11} /> : <Info size={11} />}
      {label}
    </span>
  );
}
