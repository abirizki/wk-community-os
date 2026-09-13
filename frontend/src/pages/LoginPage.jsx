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
  Sparkles,
  Bot
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

/* ─── Left Panel Feature & Stat Data (Role-Based AI & Civic Tech) ─── */
const features = [
  { 
    icon: <Bot size={15} />, 
    title: 'Kecerdasan Buatan Terarah (Role-Based AI)', 
    text: 'Asisten cerdas yang memvalidasi permohonan surat otomatis, mendeteksi kelayakan bansos, dan menyajikan rekomendasi sesuai peran jabatan Anda.' 
  },
  { 
    icon: <FileText size={15} />, 
    title: 'Pelayanan Publik Nirkertas (100% Paperless)', 
    text: 'Pengesahan surat resmi kelurahan menggunakan Tanda Tangan Elektronik (TTE) ber-QR Code kriptografis yang sah di mata hukum.' 
  },
  { 
    icon: <BarChart3 size={15} />, 
    title: 'Dasbor Eksekutif & Pemetaan Presisi', 
    text: 'Pemantauan indikator kemiskinan (Desil 1–10), pencegahan stunting balita, dan ketertiban tata naskah dinas dalam satu kendali.' 
  },
  { 
    icon: <Shield size={15} />, 
    title: 'Keamanan Data Tingkat Tinggi (UU PDP)', 
    text: 'Enkripsi data pribadi berlapis sesuai amanat Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi.' 
  },
];

const stats = [
  { icon: <Users size={15} />, label: 'Warga Terdata', value: '12.400+' },
  { icon: <FileText size={15} />, label: 'Dokumen Sah', value: '48.700+' },
  { icon: <Zap size={15} />, label: 'Waktu Layanan', value: '< 24 Jam' },
  { icon: <Sparkles size={15} />, label: 'Akurasi AI', value: '99.4%' },
];

/* ─── Main Component ─── */
export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  // Cek apakah input berupa 16 digit NIK atau username biasa (min 3 char)
  const isNik = /^\d+$/.test(identifier);
  const identifierValid = isNik ? identifier.length === 16 : identifier.trim().length >= 3;
  const hasMinLen = password.length >= 6;

  const handleIdentifierChange = (e) => {
    const val = e.target.value;
    // Jika angka murni batasi 16 digit, jika username biasa izinkan karakter
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

  return (
    <div className="h-screen overflow-hidden bg-background font-sans flex flex-col lg:flex-row">

      {/* ══════════════════════════════════════
          LEFT PANEL — Branding & Copywriting Promosi Formal
         ══════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col justify-between w-[50%] bg-gradient-to-br from-primary via-[#16382b] to-[#0f281e] relative overflow-hidden flex-shrink-0">

        {/* Decorative elements */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.07, 0.14, 0.07] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-28 -right-28 w-96 h-96 rounded-full bg-white pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.04, 0.09, 0.04] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-36 -left-20 w-80 h-80 rounded-full bg-emerald-300 pointer-events-none"
        />

        <div className="relative z-10 flex flex-col h-full p-10 text-on-primary">

          {/* Logo & Sub-Brand */}
          <motion.div
            initial="hidden" animate="show"
            variants={fadeUp} custom={0.05}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-extrabold text-base shadow-inner">
              BW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight">Bumi Warga</span>
                <span className="text-[10px] font-semibold bg-emerald-400/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  AI Enterprise OS
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-0.5 font-medium tracking-wide">
                Pemerintah Kota Sukabumi · Kelurahan Kebonjati
              </p>
            </div>
          </motion.div>

          {/* Headline Promosi Iklan Formal */}
          <motion.div
            initial="hidden" animate="show"
            variants={fadeUp} custom={0.15}
            className="my-auto space-y-4 max-w-lg"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
              <Sparkles size={13} className="text-emerald-300 animate-pulse" />
              Platform Smart Governance Masa Depan
            </div>

            <h1 className="text-2xl xl:text-3xl font-extrabold leading-tight tracking-tight text-white">
              Transformasi Layanan Publik Cerdas, Akuntabel & Terintegrasi
            </h1>

            <p className="text-xs text-emerald-100/80 leading-relaxed">
              Nikmati efisiensi birokrasi tanpa tatap muka dengan dukungan <strong>Role-Based Artificial Intelligence</strong> yang dirancang khusus untuk memenuhi kebutuhan Warga, Pengurus RT/RW, Kader Posyandu, hingga Pembuat Kebijakan Eksekutif.
            </p>

            {/* Feature List */}
            <motion.div
              variants={staggerContainer}
              initial="hidden" animate="show"
              className="space-y-3 pt-2"
            >
              {features.map((f, i) => (
                <motion.div key={i} variants={featureItem} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 flex-shrink-0 mt-0.5">
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white leading-snug">{f.title}</h3>
                    <p className="text-[11px] text-emerald-100/70 leading-relaxed">{f.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Live Stats Counter */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-white/10">
              {stats.map((s, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-xs rounded-xl p-2 border border-white/10 text-center">
                  <span className="text-xs font-extrabold text-white block">{s.value}</span>
                  <span className="text-[10px] text-emerald-200/70 block mt-0.5 truncate">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Footer Kiri */}
          <div className="flex items-center justify-between text-[11px] text-emerald-200/60 pt-4 border-t border-white/10">
            <span>© 2026 Pemerintah Kota Sukabumi</span>
            <span>Standar Nasional SPBE & UU PDP</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Form Login Kredensial & NIK
         ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto bg-surface">

        {/* Mobile Header */}
        <div className="lg:hidden p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
              BW
            </div>
            <div>
              <span className="text-sm font-bold text-on-surface leading-none block">Bumi Warga</span>
              <span className="text-[10px] text-primary font-semibold">AI Smart Governance</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
            Kota Sukabumi
          </span>
        </div>

        {/* Center Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Form Title */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-on-surface tracking-tight">
                Pintu Masuk Pelayanan Terpadu
              </h2>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Silakan masukkan <strong>NIK KTP-el</strong> bagi warga, atau <strong>Username Dinas</strong> bagi Pengurus RT, RW, dan Aparatur Kelurahan.
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-error font-medium"
              >
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-error" />
                <span>{errorMsg}</span>
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
              {/* NIK / Username Field */}
              <motion.div variants={fadeUp} custom={0.2} initial="hidden" animate="show">
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="identifier" className="text-xs font-semibold text-on-surface">
                    NIK (16 Digit) / Username Dinas
                  </label>
                  {isNik && (
                    <span className={`text-[10px] font-medium ${identifierValid ? 'text-emerald-600 font-bold' : 'text-on-surface-variant'}`}>
                      {identifier.length}/16 Digit
                    </span>
                  )}
                </div>
                <div className="relative">
                  <CreditCard
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${errorMsg ? 'text-error/70' : 'text-on-surface-variant'}`}
                  />
                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={handleIdentifierChange}
                    placeholder="Contoh: 3272xxxxxxxxxxxx atau rt01_rw01_kbj"
                    autoComplete="username"
                    required
                    disabled={isLoading}
                    className={`w-full h-11 bg-surface-container-low border rounded-xl pl-10 pr-20 text-xs font-medium tracking-wide focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/50 disabled:opacity-60
                      ${errorMsg ? 'border-error text-error focus:ring-error/20'
                        : identifierValid ? 'border-emerald-500 focus:ring-emerald-500/20'
                        : 'border-outline-variant focus:border-primary focus:ring-primary/15'}`}
                  />
                  {identifierValid && !errorMsg && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                    >
                      <CheckCircle size={11} className="text-emerald-600" /> Siap
                    </motion.span>
                  )}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-1 italic">
                  *Warga gunakan NIK pada e-KTP. Pengurus gunakan username kedinasan.
                </p>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={fadeUp} custom={0.28} initial="hidden" animate="show">
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-on-surface">
                    Kata Sandi
                  </label>
                  <a href="#" className="text-[11px] font-semibold text-primary hover:underline">
                    Bantuan Akses?
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
                    placeholder="Masukkan kata sandi akun"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                    className={`w-full h-11 bg-surface-container-low border rounded-xl pl-10 pr-10 text-xs font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/50 disabled:opacity-60
                      ${errorMsg ? 'border-error text-error focus:ring-error/20' : 'border-outline-variant focus:border-primary focus:ring-primary/15'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                variants={fadeUp} custom={0.36}
                initial="hidden" animate="show"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !identifierValid || !hasMinLen}
                className="mt-2 w-full h-11 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-bold tracking-wide shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Memvalidasi Kredensial...</>
                ) : (
                  <><span>Masuk ke Layanan</span><ArrowRight size={16} /></>
                )}
              </motion.button>
            </motion.form>

            {/* Petunjuk Bantuan Mandiri */}
            <motion.div
              variants={fadeUp} custom={0.44}
              initial="hidden" animate="show"
              className="mt-6 pt-5 border-t border-outline-variant text-center"
            >
              <p className="text-xs text-on-surface-variant mb-1">Butuh bantuan pendaftaran warga?</p>
              <p className="text-[11px] text-on-surface-variant/70">
                Silakan hubungi Ketua RT setempat untuk aktivasi Kartu Keluarga digital Anda.
              </p>
            </motion.div>

            {/* Trust Badges Kepatuhan Hukum */}
            <motion.div
              variants={fadeIn} custom={0.55}
              initial="hidden" animate="show"
              className="mt-6 flex items-center justify-center gap-2 flex-wrap"
            >
              {[
                { icon: <ShieldCheck size={11} />, label: 'Standar SPBE Kemendagri' },
                { icon: <Shield size={11} />, label: 'Kepatuhan UU PDP No. 27/2022' },
              ].map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-md border border-outline-variant">
                  <span className="text-primary">{b.icon}</span> {b.label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile Footer */}
        <footer className="lg:hidden text-center pb-6 px-6 text-[10px] text-on-surface-variant border-t border-outline-variant pt-3">
          <p>© 2026 Bumi Warga OS · Tata Kelola Pelayanan Publik Digital</p>
        </footer>
      </div>
    </div>
  );
}
