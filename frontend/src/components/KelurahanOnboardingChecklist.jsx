import React, { useState, useMemo } from 'react';
import { 
  Rocket, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Building2, 
  Users, 
  Upload, 
  UserPlus, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Sparkles, 
  FileSpreadsheet, 
  ShieldCheck, 
  HelpCircle,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * KelurahanOnboardingChecklist
 * 
 * Interactive 4-step onboarding checklist for newly registered or expanding kelurahan.
 * Helps administrators complete territorial profiles, establish RW/RT boundaries,
 * import citizen family cards (KK), and distribute credentials to neighborhood heads.
 */
export default function KelurahanOnboardingChecklist({
  govProfile = {},
  userList = [],
  executiveData = null,
  onOpenGovModal,
  onOpenUserModal,
  onNavigateTab,
  onLoadSampleData,
  className = ''
}) {
  const kelKey = (govProfile?.nama_kelurahan || 'kelurahan').toLowerCase().replace(/\s+/g, '');
  const storageKey = `bw_onboarding_dismissed_${kelKey}`;

  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem(storageKey) === 'true';
  });
  const [isMinimized, setIsMinimized] = useState(() => {
    return localStorage.getItem(`bw_onboarding_minimized_${kelKey}`) === 'true';
  });

  // Calculate Checklist Completion Criteria
  const steps = useMemo(() => {
    // 1. Profil Wilayah & Kop
    const step1Done = Boolean(
      govProfile?.nama_kelurahan &&
      govProfile?.nama_kecamatan &&
      govProfile?.nama_kota &&
      govProfile?.nama_lurah &&
      govProfile?.nama_lurah !== 'Drs. H. Mulyadi, M.Si' // Bukan default placeholder
    );

    // 2. Struktur Wilayah Binaan
    const step2Done = Boolean(
      govProfile?.wilayah_binaan && 
      govProfile?.wilayah_binaan.trim().length > 3
    );

    // 3. Inisiasi Data Kependudukan (KK & Warga)
    const totalWarga = executiveData?.demografi?.total_warga || 0;
    const totalKK = executiveData?.demografi?.total_kk || 0;
    const step3Done = totalWarga > 0 || totalKK > 0;

    // 4. Akun Aparatur Lingkungan (Ketua RW / RT)
    const hasAparaturAccount = userList.some(
      u => u.role === 'ketua_rw' || u.role === 'ketua_rt' || u.role === 'admin_rw'
    );
    const step4Done = hasAparaturAccount;

    return [
      {
        id: 'profil',
        stepNumber: 1,
        title: 'Profil Wilayah & Kop Surat Resmi',
        description: 'Lengkapi identitas kelurahan, nama & NIP Lurah, serta pastikan logo kota terpasang untuk kop naskah dinas resmi.',
        isDone: step1Done,
        actionLabel: 'Atur Profil Wilayah',
        actionIcon: Building2,
        onAction: onOpenGovModal
      },
      {
        id: 'wilayah',
        stepNumber: 2,
        title: 'Struktur Lingkungan (Cakupan RW & RT)',
        description: 'Tentukan rentang RW binaan aktif (misal: RW 001 s.d RW 008) untuk pembagian zonasi pelaporan dan posyandu.',
        isDone: step2Done,
        actionLabel: 'Kelola Wilayah Binaan',
        actionIcon: ShieldCheck,
        onAction: onOpenGovModal
      },
      {
        id: 'kependudukan',
        stepNumber: 3,
        title: 'Inisiasi Data Kependudukan (KK Masal)',
        description: 'Impor data buku induk kependudukan via berkas Excel (.xlsx) atau CSV dari kecamatan/Dukcapil.',
        isDone: step3Done,
        actionLabel: 'Buka Impor Massal KK',
        actionIcon: Upload,
        onAction: () => onNavigateTab && onNavigateTab('bulk_kk'),
        allowSampleData: true
      },
      {
        id: 'aparatur',
        stepNumber: 4,
        title: 'Penerbitan Akun Pengurus RT / RW',
        description: 'Terbitkan akun atau kupon aktivasi untuk Ketua RW dan RT agar dapat memverifikasi pengantar warga secara digital.',
        isDone: step4Done,
        actionLabel: 'Buat Akun RT / RW',
        actionIcon: UserPlus,
        onAction: onOpenUserModal
      }
    ];
  }, [govProfile, userList, executiveData, onOpenGovModal, onOpenUserModal, onNavigateTab]);

  const completedCount = steps.filter(s => s.isDone).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const isAllCompleted = completedCount === steps.length;

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsDismissed(true);
  };

  const handleToggleMinimize = () => {
    const nextVal = !isMinimized;
    setIsMinimized(nextVal);
    localStorage.setItem(`bw_onboarding_minimized_${kelKey}`, String(nextVal));
  };

  const handleReopen = () => {
    localStorage.removeItem(storageKey);
    setIsDismissed(false);
    setIsMinimized(false);
  };

  // If dismissed by user, render a subtle shortcut pill in case they want to check it again
  if (isDismissed) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleReopen}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-xs font-medium border border-outline-variant/40 transition-colors shadow-xs"
          title="Tampilkan kembali Panduan Aktivasi Kelurahan Baru"
        >
          <Rocket size={13} className="text-sky-600" />
          <span>Panduan Kesiapan Wilayah ({progressPercent}%)</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-br from-sky-50/70 via-white to-sky-50/40 dark:from-slate-900/90 dark:via-slate-900 dark:to-sky-950/40 shadow-sm overflow-hidden ${className}`.trim()}
    >
      {/* Header Banner */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-900/40">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-sky-500/20">
            <Rocket size={20} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-on-surface tracking-tight">
                Aktivasi Kelurahan Baru: Kesiapan Operasional SPBE
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isAllCompleted 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40' 
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/40'
              }`}>
                {isAllCompleted ? 'Siap Operasional 100%' : `${completedCount} dari 4 Selesai`}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              Panduan 4 langkah praktis mempersiapkan tata kelola administrasi digital sebelum melayani permohonan surat warga.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={handleToggleMinimize}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            title={isMinimized ? "Perluas Panduan" : "Perkecil Panduan"}
          >
            {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Sembunyikan Panduan Kesiapan"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 sm:px-5 pt-3 pb-1">
        <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-1.5">
          <span>Tingkat Kesiapan Kelurahan:</span>
          <span className="font-mono text-sky-700 dark:text-sky-300 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full transition-all ${
              isAllCompleted 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                : 'bg-gradient-to-r from-sky-500 to-teal-500'
            }`}
          />
        </div>
      </div>

      {/* Expandable Step List */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 sm:p-5 pt-3 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {steps.map((step) => {
                const IconComponent = step.actionIcon;
                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      step.isDone
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40'
                        : 'bg-white dark:bg-surface-container border-sky-200/70 dark:border-sky-900/40 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5">
                        {step.isDone ? (
                          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-400 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {step.stepNumber}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-on-surface">
                            {step.title}
                          </h4>
                          {step.isDone && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                              Selesai
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 justify-end flex-wrap">
                      {step.allowSampleData && !step.isDone && onLoadSampleData && (
                        <button
                          type="button"
                          onClick={onLoadSampleData}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-200 text-[11px] font-semibold border border-teal-200 transition-colors cursor-pointer"
                          title="Muat 5 Data KK Contoh untuk menguji alur layanan langsung"
                        >
                          <PlayCircle size={13} className="text-teal-600 dark:text-teal-400" />
                          <span>Muat 5 KK Contoh (Demo)</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={step.onAction}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                          step.isDone
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                        }`}
                      >
                        <IconComponent size={13} />
                        <span>{step.actionLabel}</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Sandbox / Simulation Notice Footer */}
            <div className="p-3 rounded-xl bg-sky-100/60 dark:bg-sky-950/30 border border-sky-200/60 dark:border-sky-900/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200">
                <Sparkles size={15} className="text-amber-500 shrink-0" />
                <span>
                  <strong>Tips Uji Coba Lapangan:</strong> Anda dapat menggunakan tombol <em>Muat 5 KK Contoh</em> untuk langsung menguji pengajuan surat, verifikasi lurah, dan cetak TTE tanpa harus menyiapkan file asli terlebih dahulu.
                </span>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs text-sky-700 hover:text-sky-900 dark:text-sky-300 font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
              >
                Tutup Sementara
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
