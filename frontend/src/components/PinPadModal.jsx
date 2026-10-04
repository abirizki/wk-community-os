import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Lock, Delete, X, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { api } from '../utils/api';

export default function PinPadModal({ isOpen, onClose, onSuccess, title = 'PIN Keamanan Jabatan', subtitle = 'Masukkan 6-digit PIN untuk membuka Meja Kerja Jabatan RT/RW' }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
      setLoading(false);
    }
  }, [isOpen]);

  // Listener keyboard fisik
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (loading) return;

      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 6) {
          const next = pin + e.key;
          setPin(next);
          if (next.length === 6) {
            handleVerify(next);
          }
        }
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
        setErrorMsg('');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, loading]);

  const handleDigit = (digit) => {
    if (pin.length >= 6 || loading) return;
    const next = pin + digit;
    setPin(next);
    setErrorMsg('');
    if (next.length === 6) {
      handleVerify(next);
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    if (loading) return;
    setPin('');
    setErrorMsg('');
  };

  const handleVerify = async (codeToVerify) => {
    const finalPin = codeToVerify || pin;
    if (finalPin.length !== 6) {
      setErrorMsg('PIN harus terdiri tepat dari 6 digit.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.post('/auth/verify-pin', { pin: finalPin });
      if (res.success) {
        if (onSuccess) onSuccess(res);
        onClose();
      } else {
        throw new Error(res.message || 'PIN salah');
      }
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setErrorMsg(err.message || 'PIN salah. Silakan coba lagi.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={!loading ? onClose : undefined} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: shake ? [-10, 10, -8, 8, -4, 4, 0] : 0 
          }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-900 text-white p-6 pb-8 text-center relative">
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/20">
              <ShieldCheck size={28} className="text-blue-200" />
            </div>

            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            <p className="text-xs text-blue-100/80 mt-1 max-w-[260px] mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* PIN Input Dots */}
          <div className="px-6 pt-6 pb-2 text-center -mt-4 bg-white rounded-t-3xl relative z-10">
            <div className="flex justify-center items-center gap-3.5 mb-2">
              {[0, 1, 2, 3, 4, 5].map((idx) => {
                const isFilled = pin.length > idx;
                return (
                  <motion.div
                    key={idx}
                    animate={{ scale: isFilled ? 1.15 : 1 }}
                    className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                      isFilled 
                        ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/30' 
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  />
                );
              })}
            </div>

            {errorMsg ? (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-xs text-rose-600 font-semibold mt-2"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            ) : (
              <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-2">
                <KeyRound size={12} />
                <span>PIN Bawaan Akun: <strong className="text-gray-600">123456</strong></span>
              </div>
            )}
          </div>

          {/* Keypad Grid (3x4) */}
          <div className="p-6 pt-2">
            <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                <button
                  key={digit}
                  onClick={() => handleDigit(String(digit))}
                  disabled={loading}
                  className="h-14 rounded-2xl bg-gray-50 hover:bg-blue-50 active:bg-blue-100 border border-gray-100 hover:border-blue-200 text-xl font-bold text-gray-800 transition-all flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {digit}
                </button>
              ))}

              <button
                onClick={handleClear}
                disabled={loading || pin.length === 0}
                className="h-14 rounded-2xl text-xs font-semibold text-gray-500 hover:text-gray-700 active:bg-gray-100 transition-all flex items-center justify-center disabled:opacity-30"
              >
                Reset
              </button>

              <button
                onClick={() => handleDigit('0')}
                disabled={loading}
                className="h-14 rounded-2xl bg-gray-50 hover:bg-blue-50 active:bg-blue-100 border border-gray-100 hover:border-blue-200 text-xl font-bold text-gray-800 transition-all flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-50"
              >
                0
              </button>

              <button
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                className="h-14 rounded-2xl bg-gray-50 hover:bg-rose-50 active:bg-rose-100 border border-gray-100 hover:border-rose-200 text-gray-700 transition-all flex items-center justify-center shadow-sm active:scale-95 disabled:opacity-30"
              >
                <Delete size={20} />
              </button>
            </div>

            {/* Quick Helper */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => handleVerify('123456')}
                disabled={loading}
                className="text-[11px] text-blue-600 hover:underline font-medium"
              >
                Gunakan PIN Default (123456)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
