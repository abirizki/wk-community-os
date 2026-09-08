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
  Star,
} from 'lucide-react';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (delay = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut', delay } }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (delay = 0) => ({ opacity: 1, transition: { duration: 0.5, delay } }),
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const featureItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

/* ─── Left Panel Feature & Stat Data ─── */
const features = [
  { icon: <FileText size={14} />, text: 'Pengajuan dokumen kelurahan digital — tanpa antre, tanpa kertas' },
  { icon: <BarChart3 size={14} />, text: 'Analitik demografi & kebutuhan warga real-time untuk RT/RW/Lurah' },
  { icon: <Users size={14} />, text: 'Manajemen data warga, KK, PBB, dan Posyandu dalam satu platform' },
  { icon: <Shield size={14} />, text: 'Keamanan data berlapis sesuai UU PDP No. 27/2022' },
];

const stats = [
  { icon: <Users size={15} />, label: 'Warga Aktif', value: '12.400+' },
  { icon: <FileText size={15} />, label: 'Dokumen Diproses', value: '48.700+' },
  { icon: <Zap size={15} />, label: 'Waktu Respons', value: '< 24 Jam' },
  { icon: <Star size={15} />, label: 'Layanan Tersedia', value: '6 Modul' },
];

/* ─── Main Component ─── */
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
  const strengthColors = ['bg-red-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500'];

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
    shake: { x: [-8, 8, -8, 8, -4, 4, 0], transition: { duration: 0.4 } },
  };

  return (
    <div className="h-screen overflow-hidden bg-background font-sans flex flex-col lg:flex-row">

      {/* ══════════════════════════════════════
          LEFT PANEL — Branding & Copywriting
         ══════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[48%] bg-primary relative overflow-hidden flex-shrink-0">

        {/* Decorative blobs */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.07, 0.12, 0.07] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-36 -left-20 w-80 h-80 rounded-full bg-white pointer-events-none"
        />

        <div className="relative z-10 flex flex-col h-full p-10 text-on-primary">

          {/* Logo */}
          <motion.div
            initial="hidden" animate="show"
            variants={fadeIn} custom={0.1}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-sm">
              <MapPin size={20} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight leading-none">Bumi Warga</p>
              <p className="text-xs text-white/55 mt-0.5">by Jabar Pintar Digital</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial="hidden" animate="show"
            className="mb-6"
          >
            <motion.h2
              variants={fadeUp} custom={0.15}
              initial="hidden" animate="show"
              className="text-[28px] font-bold leading-tight mb-3"
            >
              Jembatan Digital<br />antara Warga<br />dan Pemerintah
            </motion.h2>
            <motion.p
              variants={fadeUp} custom={0.25}
              initial="hidden" animate="show"
              className="text-sm text-white/65 leading-relaxed"
            >
              <strong className="text-white">Bumi Warga</strong> menghadirkan ekosistem pelayanan publik
              berbasis data — dari pengajuan dokumen kelurahan, pemantauan PBB, kesehatan anak di
              Posyandu, hingga pengaduan warga — semuanya terkelola dalam satu platform yang cerdas,
              transparan, dan aman.
            </motion.p>
          </motion.div>

          {/* Features */}
          <motion.ul
            variants={staggerContainer}
            initial="hidden" animate="show"
            className="flex flex-col gap-2.5 mb-8"
          >
            {features.map((f, i) => (
              <motion.li key={i} variants={featureItem} className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/10">
                  <span className="text-white/80">{f.icon}</span>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">{f.text}</p>
              </motion.li>
            ))}
          </motion.ul>

          {/* Stats Grid */}
          <motion.div
            variants={fadeUp} custom={0.5}
            initial="hidden" animate="show"
            className="mt-auto"
          >
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">
              Dampak Nyata di Lapangan
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/8 rounded-xl p-3 border border-white/10"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-white/50">{s.icon}</span>
                    <span className="text-[10px] text-white/50">{s.label}</span>
                  </div>
                  <p className="text-lg font-bold text-white">{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <p className="text-[10px] text-white/30 mt-5 border-t border-white/10 pt-4">
              © 2025 <strong className="text-white/45">Jabar Pintar Digital</strong> · Hak cipta dilindungi undang-undang.
              Bumi Warga adalah platform digital pelayanan publik resmi yang beroperasi di bawah
              kewenangan pemerintah daerah Jawa Barat.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Login Form
         ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 flex items-center justify-center px-6 py-8 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-sm"
          >

            {/* Mobile Logo */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="lg:hidden flex items-center gap-2.5 mb-6"
            >
              <div className="w-9 h-9 bg-primary text-on-primary rounded-xl flex items-center justify-center shadow-sm">
                <MapPin size={18} />
              </div>
              <div>
                <p className="font-bold text-base text-on-surface leading-none">Bumi Warga</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">by Jabar Pintar Digital</p>
              </div>
            </motion.div>

            {/* Form Title */}
            <motion.div
              variants={fadeUp} custom={0.1}
              initial="hidden" animate="show"
              className="mb-6"
            >
              <h1 className="text-xl font-bold text-on-surface">Selamat Datang Kembali</h1>
              <p className="text-sm text-on-surface-variant mt-1">
                Masuk menggunakan NIK dan kata sandi terdaftar Anda.
              </p>
            </motion.div>

            {/* Error */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4 bg-error-container text-on-error-container px-3.5 py-2.5 rounded-lg flex items-center gap-2 border border-error/20"
              >
                <AlertCircle size={15} className="text-error flex-shrink-0" />
                <span className="text-sm font-medium">{errorMsg}</span>
              </motion.div>
            )}

            {/* Form */}
            <motion.form
              className="flex flex-col gap-3.5"
              onSubmit={handleSubmit}
              variants={shakeVariants}
              initial="initial"
              animate={shake ? 'shake' : 'initial'}
            >
              {/* NIK Field */}
              <motion.div variants={fadeUp} custom={0.2} initial="hidden" animate="show">
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="nik" className="text-xs font-semibold text-on-surface">
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  <span className={`text-[10px] font-medium ${nikValid ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                    {nik.length}/16
                  </span>
                </div>
                <div className="relative">
                  <CreditCard
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errorMsg ? 'text-error/70' : 'text-on-surface-variant'}`}
                  />
                  <input
                    id="nik"
                    type="text"
                    inputMode="numeric"
                    maxLength={16}
                    value={nik}
                    onChange={handleNikChange}
                    placeholder="Contoh: 3201xxxxxxxxxxxxxxx"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    className={`w-full h-10 bg-surface-container-low border rounded-lg pl-9 pr-16 text-sm font-medium tracking-wide focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/40 disabled:opacity-60
                      ${errorMsg ? 'border-error text-error focus:ring-error/20'
                        : nikValid ? 'border-tertiary focus:ring-tertiary/15'
                        : 'border-outline-variant focus:border-primary focus:ring-primary/15'}`}
                  />
                  {nikValid && !errorMsg && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-semibold text-tertiary bg-tertiary-fixed px-1.5 py-0.5 rounded border border-tertiary/20"
                    >
                      <CheckCircle size={10} /> Sesuai
                    </motion.span>
                  )}
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={fadeUp} custom={0.28} initial="hidden" animate="show">
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-on-surface">
                    Kata Sandi
                  </label>
                  <a href="#" className="text-[11px] font-semibold text-primary hover:underline">
                    Lupa kata sandi?
                  </a>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errorMsg ? 'text-error/70' : 'text-on-surface-variant'}`}
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Kata sandi akun Anda"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className={`w-full h-10 bg-surface-container-low border rounded-lg pl-9 pr-10 text-sm font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/40 disabled:opacity-60
                      ${errorMsg ? 'border-error text-error focus:ring-error/20'
                        : 'border-outline-variant focus:border-primary focus:ring-primary/15'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && !errorMsg && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex gap-1 mt-1.5"
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                          i <= strengthScore ? strengthColors[strengthScore] : 'bg-outline-variant'
                        }`}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={fadeUp} custom={0.36}
                initial="hidden" animate="show"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !nikValid || !password}
                className="mt-1 w-full h-10 bg-primary hover:bg-primary/90 text-on-primary rounded-lg text-sm font-semibold tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Memverifikasi Identitas...</>
                ) : (
                  <><span>Masuk ke Bumi Warga</span><ArrowRight size={16} /></>
                )}
              </motion.button>
            </motion.form>

            {/* Register Link */}
            <motion.div
              variants={fadeUp} custom={0.44}
              initial="hidden" animate="show"
              className="mt-5 pt-4 border-t border-outline-variant text-center"
            >
              <p className="text-xs text-on-surface-variant mb-2">Belum punya akun warga digital?</p>
              <a href="#" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
                Daftar Akun Bumi Warga <ArrowRight size={12} />
              </a>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={fadeIn} custom={0.55}
              initial="hidden" animate="show"
              className="mt-5 flex items-center justify-center gap-2 flex-wrap"
            >
              {[
                { icon: <ShieldCheck size={10} />, label: 'Enkripsi AES-256' },
                { icon: <Shield size={10} />, label: 'UU PDP No. 27/2022' },
              ].map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant">
                  <span className="text-primary">{b.icon}</span> {b.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Footer */}
        <motion.footer
          variants={fadeIn} custom={0.6}
          initial="hidden" animate="show"
          className="lg:hidden text-center pb-5 px-6"
        >
          <p className="text-[10px] text-on-surface-variant">
            © 2025 <strong>Jabar Pintar Digital</strong> · Hak cipta dilindungi.
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
