import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Lock, CheckCircle2, XCircle, Eye, EyeOff, KeyRound, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function ForceChangePasswordModal() {
  const { user, markPasswordChanged } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successToast, setSuccessToast] = useState(false);

  // Security Criteria Checklist
  const checks = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      hasUpper: /[A-Z]/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecial: /[@$!%*?&#^_-]/.test(newPassword),
      matchesConfirm: newPassword.length > 0 && newPassword === confirmPassword
    };
  }, [newPassword, confirmPassword]);

  const isAllValid = checks.length && checks.hasUpper && checks.hasLower && checks.hasNumber && checks.hasSpecial && checks.matchesConfirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAllValid || loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.post('/auth/change-initial-password', {
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      if (res.success) {
        setSuccessToast(true);
        setTimeout(() => {
          markPasswordChanged();
        }, 1500);
      } else {
        setErrorMsg(res.message || 'Gagal memperbarui kata sandi');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan kata sandi');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.must_change_password) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-surface-container-lowest rounded-3xl border border-primary/30 shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header Security Badge */}
        <div className="bg-gradient-to-r from-primary via-emerald-800 to-teal-900 p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-inner flex-shrink-0">
              <ShieldAlert size={26} className="text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[10px] font-bold border border-amber-400/30 mb-1">
                <Lock size={10} /> Kebijakan Keamanan BSSN
              </div>
              <h2 className="text-lg font-bold">Wajib Buat Kata Sandi Baru</h2>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Akun: <strong>{user.nama}</strong> ({user.username})
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Selamat datang di <strong>Bumi Warga</strong>! Demi melindungi kerahasiaan data kependudukan dan operasional pelayanan publik, Anda diwajibkan mengganti kata sandi awal dengan kata sandi pribadi Anda sebelum dapat melanjutkan ke sistem.
          </p>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/20 text-xs text-error font-medium flex items-center gap-2">
              <XCircle size={16} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successToast ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 size={48} className="mx-auto text-emerald-600 animate-bounce" />
              <h3 className="text-base font-bold text-on-surface">Kata Sandi Berhasil Disimpan!</h3>
              <p className="text-xs text-on-surface-variant">
                Mengalihkan Anda ke dashboard sistem...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface flex items-center justify-between">
                  <span>Kata Sandi Baru Pribadi</span>
                  <span className="text-[10px] text-on-surface-variant font-normal">Min. 8 karakter</span>
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi baru yang kuat..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-on-surface">
                  Ulangi Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Ketik ulang kata sandi baru Anda..."
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Security Requirements Checklist */}
              <div className="p-3.5 rounded-2xl bg-surface-container/30 border border-outline-variant space-y-1.5 text-[11px]">
                <span className="font-bold text-on-surface block text-[10px] uppercase tracking-wider mb-1">
                  Standar Kekuatan Kata Sandi:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    {checks.length ? <CheckCircle2 size={13} className="text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-outline-variant" />}
                    <span>Minimal 8 karakter</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${checks.hasUpper && checks.hasLower ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    {checks.hasUpper && checks.hasLower ? <CheckCircle2 size={13} className="text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-outline-variant" />}
                    <span>Huruf besar & kecil</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${checks.hasNumber ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    {checks.hasNumber ? <CheckCircle2 size={13} className="text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-outline-variant" />}
                    <span>Memuat angka (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${checks.hasSpecial ? 'text-emerald-700 font-semibold' : 'text-on-surface-variant'}`}>
                    {checks.hasSpecial ? <CheckCircle2 size={13} className="text-emerald-600" /> : <div className="w-3 h-3 rounded-full border border-outline-variant" />}
                    <span>Simbol (@, $, !, %, dll)</span>
                  </div>
                </div>

                {confirmPassword && (
                  <div className={`pt-1 flex items-center gap-1.5 ${checks.matchesConfirm ? 'text-emerald-700 font-semibold' : 'text-error font-medium'}`}>
                    {checks.matchesConfirm ? <CheckCircle2 size={13} className="text-emerald-600" /> : <XCircle size={13} className="text-error" />}
                    <span>{checks.matchesConfirm ? 'Konfirmasi kata sandi cocok' : 'Konfirmasi kata sandi belum sama'}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isAllValid || loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan Kata Sandi...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Simpan Kata Sandi & Masuk ke Sistem
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

