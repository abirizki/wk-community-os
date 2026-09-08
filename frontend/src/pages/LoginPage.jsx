import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Landmark,
  HelpCircle,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
  ShieldCheck,
  Gavel,
  ArrowRight,
  UserPlus,
  Headset,
  ChevronDown,
  Info,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [nik, setNik] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberSession, setRememberSession] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  const nikValid = nik.length === 16;

  // Password strength evaluation
  const hasMinLen = password.length >= 8;
  const hasMixedCase = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasSymbol = /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password);
  const strengthScore = [hasMinLen, hasMixedCase, hasSymbol].filter(Boolean).length;
  const strengthLabels = ['Lemah', 'Cukup Aman', 'Kuat', 'Sangat Kuat'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

  const handleNikChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
    setNik(digits);
    if (errorMsg) setErrorMsg(''); // Clear error on typing
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMsg) setErrorMsg(''); // Clear error on typing
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nikValid || !password) return;
    
    setErrorMsg('');
    
    try {
      await login(nik, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'NIK atau Kata Sandi salah.');
      triggerShake();
    }
  };

  // Error Shake Animation Variants
  const shakeVariants = {
    initial: { x: 0 },
    shake: { 
      x: [-10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md mx-auto flex flex-col bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant p-6"
      >
        {/* Header */}
        <header className="flex items-center justify-between pb-4 mb-4 border-b border-outline-variant">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary text-on-primary rounded-lg flex items-center justify-center shadow-card">
              <Landmark size={20} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[17px] tracking-tight text-on-surface leading-tight">
                  Portal Warga
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-container-low text-primary border border-outline-variant">
                  RESMI
                </span>
              </div>
              <span className="text-[11px] font-medium text-on-surface-variant">
                Republik Indonesia
              </span>
            </div>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-label-sm text-on-surface-variant bg-surface-container-low hover:bg-surface-container transition-colors border border-outline-variant"
          >
            <HelpCircle size={16} />
            <span>Bantuan</span>
          </a>
        </header>

        {/* Hero Section */}
        <div className="mb-6">
          <h1 className="text-headline-md tracking-tight text-on-surface leading-snug">
            Portal Layanan Kependudukan Terpadu
          </h1>
          <h2 className="text-body-md font-semibold text-primary mt-0.5 mb-2">
            Masuk ke Akun Warga
          </h2>
          <p className="text-label-sm leading-relaxed text-on-surface-variant bg-surface-container-low p-2.5 rounded-lg border border-outline-variant font-medium">
            Portal Warga merupakan platform pelayanan dokumen publik dalam bentuk digital yang
            dirancang untuk memfasilitasi integrasi administrasi kependudukan secara cepat,
            transparan, dan terenkripsi demi kemudahan akses seluruh warga.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
            className="bg-error-container text-on-error-container p-3 rounded-lg flex items-center gap-2 border border-error/20"
          >
            <AlertCircle size={18} className="text-error flex-shrink-0" />
            <span className="text-label-sm font-medium">{errorMsg}</span>
          </motion.div>
        )}

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-lg p-0"
        >
          <motion.form 
            className="flex flex-col gap-4" 
            onSubmit={handleSubmit}
            variants={shakeVariants}
            initial="initial"
            animate={shake ? "shake" : "initial"}
          >
            {/* NIK Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="nik" className={`text-label-sm font-semibold ${errorMsg ? 'text-error' : 'text-on-surface'}`}>
                  Nomor Induk Kependudukan (NIK)
                </label>
                <span className="text-[11px] font-medium text-on-surface-variant">
                  {nik.length}/16 Digit
                </span>
              </div>
              <div className="relative flex items-center">
                <CreditCard
                  size={20}
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
                  className={`w-full h-12 bg-surface-container-low border rounded-lg pl-11 pr-24 text-[15px] font-medium tracking-wide focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/50 disabled:opacity-60 disabled:cursor-not-allowed
                    ${errorMsg 
                      ? 'border-error text-error focus:border-error focus:ring-error/20 bg-error-container/10' 
                      : nikValid
                        ? 'text-on-surface border-tertiary focus:border-tertiary focus:ring-tertiary/20'
                        : 'text-on-surface border-outline-variant focus:border-primary focus:ring-primary/15'
                    }
                  `}
                />
                <div className="absolute right-2.5 flex items-center">
                  {nikValid && !errorMsg ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-tertiary bg-tertiary-fixed px-2 py-1 rounded-md border border-tertiary/20">
                      <CheckCircle size={14} />
                      Sesuai
                    </span>
                  ) : (!errorMsg && (
                    <span className="text-[11px] font-medium text-on-surface-variant pr-1.5">
                      16 Angka
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5 mt-1">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className={`text-label-sm font-semibold ${errorMsg ? 'text-error' : 'text-on-surface'}`}>
                  Kata Sandi
                </label>
                <a
                  href="#"
                  className="text-label-sm font-semibold text-primary hover:text-surface-tint transition-colors"
                >
                  Lupa kata sandi?
                </a>
              </div>
              <div className="relative flex items-center">
                <Lock
                  size={20}
                  className={`absolute left-3.5 pointer-events-none ${errorMsg ? 'text-error/70' : 'text-on-surface-variant'}`}
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
                  className={`w-full h-12 bg-surface-container-low border rounded-lg pl-11 pr-11 text-[15px] font-medium focus:outline-none focus:ring-2 transition-all placeholder:text-on-surface-variant/50 disabled:opacity-60 disabled:cursor-not-allowed
                    ${errorMsg
                      ? 'border-error text-error focus:border-error focus:ring-error/20 bg-error-container/10'
                      : 'border-outline-variant text-on-surface focus:border-primary focus:ring-primary/15'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className={`absolute right-3 focus:outline-none p-1 transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                    ${errorMsg ? 'text-error/70 hover:text-error' : 'text-on-surface-variant hover:text-on-surface'}
                  `}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && !errorMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-surface-container-low border border-outline-variant rounded-lg p-2.5 mt-1 flex flex-col gap-1.5"
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-medium text-on-surface-variant flex items-center gap-1">
                      <ShieldCheck size={13} className="text-primary" />
                      Kekuatan Kata Sandi:
                    </span>
                    <span className="font-semibold text-on-surface">
                      {strengthLabels[strengthScore]}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 w-full">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          i <= strengthScore ? strengthColors[strengthScore] : 'bg-surface-dim'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-outline-variant text-[10px] font-medium">
                    <CriteriaBadge met={hasMinLen} label="Min. 8 Karakter" />
                    <CriteriaBadge met={hasMixedCase} label="Huruf Besar & Kecil" />
                    <CriteriaBadge met={hasSymbol} label="Angka & Simbol Acak" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Remember Session */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberSession}
                  onChange={(e) => setRememberSession(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <span className="text-label-sm text-on-surface-variant">
                  Ingat sesi perangkat ini
                </span>
              </label>
              <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant font-medium">
                <Shield size={13} className="text-primary" />
                Aman
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !nikValid || !password}
              className="relative w-full h-12 bg-primary hover:bg-surface-tint active:bg-primary text-on-primary rounded-lg text-label-md font-semibold tracking-wide shadow-card hover:shadow-elevated transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none overflow-hidden"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Memverifikasi Identitas...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Portal Layanan</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </motion.form>

          {/* Register CTA */}
          <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col items-center text-center gap-2">
            <p className="text-label-sm text-on-surface-variant">
              Belum memiliki akun warga digital?
            </p>
            <a
              href="#"
              className={`w-full py-2.5 px-4 rounded-lg border border-outline-variant bg-surface-container-low hover:bg-surface-container text-primary text-label-sm font-semibold tracking-wide flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98] ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <UserPlus size={16} />
              <span>Daftar Akun Warga Baru</span>
            </a>
          </div>
        </motion.div>

        {/* Data Privacy Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-5 bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden shadow-card"
        >
          <button
            type="button"
            onClick={() => setDisclaimerOpen(!disclaimerOpen)}
            className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-surface-container"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-surface-container text-primary flex items-center justify-center flex-shrink-0">
                <Shield size={15} />
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm font-bold text-on-surface leading-tight">
                  Deklarasi &amp; Kebijakan Perlindungan Data Pribadi
                </span>
                <span className="text-[10px] font-semibold text-primary tracking-wide">
                  UU No. 27/2022 (UU PDP)
                </span>
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-primary transition-transform duration-200 ${
                disclaimerOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {disclaimerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-3.5 pb-3.5 pt-1 border-t border-outline-variant flex flex-col gap-2.5"
            >
              <p className="text-[11px] leading-relaxed text-on-surface-variant font-normal">
                Seluruh data kependudukan dan NIK diproses sesuai amanat{' '}
                <strong>Undang-Undang Perlindungan Data Pribadi (UU PDP No. 27/2022)</strong>. Data
                disimpan dengan enkripsi <strong>AES-256</strong> dan hanya digunakan secara khusus
                untuk keperluan verifikasi identitas resmi, sinkronisasi data kependudukan wilayah,
                serta pencegahan pemalsuan dokumen adminduk.
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <TrustBadge icon={<Lock size={12} />} label="Enkripsi End-to-End" variant="tertiary" />
                <TrustBadge icon={<ShieldCheck size={12} />} label="Kepatuhan ISO/IEC 27001" variant="primary" />
                <TrustBadge icon={<Gavel size={12} />} label="Audit Resmi Kemendagri" variant="neutral" />
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <footer className="mt-6 pt-4 border-t border-outline-variant flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-4 text-label-sm text-on-surface-variant">
            <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
              <Headset size={15} />
              Pusat Bantuan Kependudukan
            </a>
            <span className="text-outline-variant">•</span>
            <a href="#" className="hover:text-primary transition-colors">
              Panduan NIK
            </a>
          </div>
          <p className="text-[10px] text-on-surface-variant">
            Dikelola secara resmi untuk pelayanan warga terintegrasi © 2025
          </p>
        </footer>
      </motion.div>
    </div>
  );
}

/* ===== Sub-components ===== */

function CriteriaBadge({ met, label }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border transition-all duration-200 ${
        met
          ? 'text-tertiary bg-tertiary-fixed border-tertiary/20'
          : 'text-on-surface-variant bg-surface-container-low border-outline-variant'
      }`}
    >
      {met ? <CheckCircle size={12} /> : <Info size={12} />}
      {label}
    </span>
  );
}

function TrustBadge({ icon, label, variant }) {
  const styles = {
    tertiary:
      'text-tertiary bg-tertiary-fixed border-tertiary/20',
    primary:
      'text-primary bg-surface-container-low border-primary/20',
    neutral:
      'text-on-surface-variant bg-surface-container-lowest border-outline-variant',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${styles[variant]}`}
    >
      {icon}
      {label}
    </span>
  );
}

