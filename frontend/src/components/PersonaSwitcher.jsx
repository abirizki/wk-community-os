import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, RefreshCw, ChevronDown, Check, ArrowRightLeft, Lock, Unlock } from 'lucide-react';
import PinPadModal from './PinPadModal';
import { api } from '../utils/api';

export default function PersonaSwitcher({ className = '' }) {
  const { user, setUser, switchPersona } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  if (!user || !user.has_official_role || !user.official_role_info) {
    return null;
  }

  const isOfficialMode = user.active_persona === 'official';
  const officialJabatan = user.official_role_info.jabatan || 'Aparatur Wilayah';
  const officialWilayah = user.official_role_info.wilayah_rt 
    ? `RT ${user.official_role_info.wilayah_rt}/RW ${user.official_role_info.wilayah_rw}` 
    : user.official_role_info.wilayah_rw 
    ? `RW ${user.official_role_info.wilayah_rw}` 
    : user.official_role_info.kelurahan;

  const handleSelectOfficial = async () => {
    if (isOfficialMode) return;

    try {
      setSwitching(true);
      // Cek apakah Meja Kerja sudah tidak terkunci
      const statusRes = await api.get('/auth/pin-status');
      if (statusRes.success && statusRes.is_unlocked) {
        // Sudah tidak terkunci dalam 30 menit
        await switchPersona('official');
        setIsOpen(false);
      } else {
        // Butuh verifikasi PIN
        setIsOpen(false);
        setShowPinModal(true);
      }
    } catch (e) {
      setShowPinModal(true);
      setIsOpen(false);
    } finally {
      setSwitching(false);
    }
  };

  const handleSelectCitizen = async () => {
    if (!isOfficialMode) return;
    try {
      setSwitching(true);
      await api.post('/auth/lock-pin', {});
      await switchPersona('citizen');
      setIsOpen(false);
    } catch (err) {
      console.warn('Lock pin error:', err);
      await switchPersona('citizen');
      setIsOpen(false);
    } finally {
      setSwitching(false);
    }
  };

  const handlePinSuccess = (verifyResult) => {
    if (verifyResult?.user) {
      setUser(verifyResult.user);
    } else {
      switchPersona('official');
    }
  };

  return (
    <>
      <div className={`relative inline-block text-left ${className}`}>
        {/* Switcher Pill Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={switching}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all shadow-sm active:scale-95 ${
            isOfficialMode
              ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white border-blue-800 hover:brightness-105'
              : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
          }`}
          title="Klik untuk beralih antara Mode Warga Mandiri dan Meja Kerja Jabatan"
        >
          {switching ? (
            <RefreshCw size={14} className="animate-spin text-white" />
          ) : isOfficialMode ? (
            <ShieldCheck size={15} className="text-blue-200" />
          ) : (
            <User size={15} className="text-emerald-700" />
          )}

          <div className="text-left flex flex-col">
            <span className="text-[10px] leading-tight opacity-80 uppercase tracking-wider font-bold flex items-center gap-1">
              {isOfficialMode ? (
                <>
                  <Unlock size={10} className="text-emerald-300" />
                  Meja Kerja Aktif
                </>
              ) : (
                <>
                  <Lock size={10} className="text-gray-400" />
                  Mode Warga
                </>
              )}
            </span>
            <span className="font-extrabold leading-tight truncate max-w-[140px] sm:max-w-[180px]">
              {isOfficialMode ? officialJabatan : 'Warga Mandiri'}
            </span>
          </div>

          <ChevronDown size={14} className={`opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Switcher Dropdown Modal */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop click to close */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)} 
              />

              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-gray-100 mb-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Beralih Peran (Dual Persona)
                  </span>
                  <span className="text-xs text-gray-600 block mt-0.5">
                    Ketua RT/RW adalah warga dengan tugas tambahan melayani wilayah.
                  </span>
                </div>

                <div className="space-y-1.5">
                  {/* Opsi 1: Meja Kerja Jabatan (PIN Protected) */}
                  <button
                    onClick={handleSelectOfficial}
                    disabled={switching}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                      isOfficialMode 
                        ? 'bg-blue-50/90 border border-blue-200 text-blue-900' 
                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${isOfficialMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <ShieldCheck size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{officialJabatan}</span>
                        {isOfficialMode ? (
                          <Check size={15} className="text-blue-600 shrink-0" />
                        ) : (
                          <Lock size={13} className="text-amber-500 shrink-0" title="Dilindungi PIN 6-Digit" />
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-0.5">{officialWilayah}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-semibold">
                          Meja Kerja Administrasi
                        </span>
                        {!isOfficialMode && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                            Perlu PIN
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Opsi 2: Mode Warga Biasa */}
                  <button
                    onClick={handleSelectCitizen}
                    disabled={switching}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                      !isOfficialMode 
                        ? 'bg-emerald-50/90 border border-emerald-200 text-emerald-900' 
                        : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${!isOfficialMode ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">Mode Warga Mandiri</span>
                        {!isOfficialMode && <Check size={15} className="text-emerald-600 shrink-0" />}
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-0.5">Identitas Pribadi & KK Anda</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block font-semibold">
                        PBB, Dokumen Keluarga, Posyandu
                      </span>
                    </div>
                  </button>
                </div>

                {/* Footer Status */}
                <div className="mt-2 pt-2 border-t border-gray-100 px-2 py-1 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <ArrowRightLeft size={12} /> Beralih tanpa logout
                  </span>
                  {isOfficialMode ? (
                    <button
                      onClick={handleSelectCitizen}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Lock size={11} /> Kunci Sekarang
                    </button>
                  ) : (
                    <span className="font-semibold text-gray-500">NIK: {user.active_nik || user.username}</span>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* PIN Pad Modal */}
      <PinPadModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={handlePinSuccess}
        title="Kunci Keamanan Meja Kerja"
        subtitle={`Masukkan PIN 6-digit untuk membuka Meja Kerja ${officialJabatan}`}
      />
    </>
  );
}
