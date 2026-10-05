import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, RefreshCw, ChevronDown, Check, ArrowRightLeft } from 'lucide-react';

export default function PersonaSwitcher({ className = '' }) {
  const { user, switchPersona } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

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

  const handleSwitch = async (targetMode) => {
    if (user.active_persona === targetMode || switching) return;
    try {
      setSwitching(true);
      await switchPersona(targetMode);
      setIsOpen(false);
    } catch (err) {
      alert('Gagal beralih mode: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setSwitching(false);
    }
  };

  return (
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
        title="Klik untuk beralih antara Mode Warga Mandiri dan Mode Jabatan Pejabat"
      >
        {switching ? (
          <RefreshCw size={14} className="animate-spin text-white" />
        ) : isOfficialMode ? (
          <ShieldCheck size={15} className="text-blue-200" />
        ) : (
          <User size={15} className="text-emerald-700" />
        )}

        <div className="text-left flex flex-col">
          <span className="text-[10px] leading-tight opacity-80 uppercase tracking-wider font-bold">
            {isOfficialMode ? 'Mode Pejabat' : 'Mode Warga'}
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
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-gray-100 mb-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Beralih Peran (Persona Switcher)
                </span>
                <span className="text-xs text-gray-600 block mt-0.5">
                  Satu akun NIK untuk pelayanan warga dan kewenangan dinas.
                </span>
              </div>

              <div className="space-y-1">
                {/* Opsi 1: Mode Pejabat */}
                <button
                  onClick={() => handleSwitch('official')}
                  disabled={switching}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                    isOfficialMode 
                      ? 'bg-blue-50/80 border border-blue-200 text-blue-900' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isOfficialMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <ShieldCheck size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate">{officialJabatan}</span>
                      {isOfficialMode && <Check size={14} className="text-blue-600 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-gray-500 block">{officialWilayah}</span>
                    <span className="text-[10px] text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded mt-1 inline-block font-semibold">
                      Akses Verifikasi & Administrasi
                    </span>
                  </div>
                </button>

                {/* Opsi 2: Mode Warga Biasa */}
                <button
                  onClick={() => handleSwitch('citizen')}
                  disabled={switching}
                  className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                    !isOfficialMode 
                      ? 'bg-emerald-50/80 border border-emerald-200 text-emerald-900' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${!isOfficialMode ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <User size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">Warga Mandiri</span>
                      {!isOfficialMode && <Check size={14} className="text-emerald-600 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-gray-500 block">Identitas Pribadi & Keluarga</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mt-1 inline-block font-semibold">
                      Pengajuan Surat, Bansos & Layanan KK
                    </span>
                  </div>
                </button>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-100 px-2 py-1 flex items-center justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <ArrowRightLeft size={12} /> Beralih tanpa logout
                </span>
                <span className="font-semibold text-gray-500">NIK: {user.active_nik || user.username}</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
