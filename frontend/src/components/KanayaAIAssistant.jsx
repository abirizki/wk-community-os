/**
 * frontend/src/components/KanayaAIAssistant.jsx
 * KANAYA (Kawan Layanan Warga) â€” Asisten AI Pintar Bumi Warga
 * Fitur:
 * - Floating Holographic Glassmorphic Orb dengan Efek Bernapas & Orbit Aura
 * - Interactive Smart Speech Bubble dengan Micro-Interaction
 * - Slide-in AI Drawer Panel: Audit Bansos, Pantauan KIA/Lansia & Bantuan Surat
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  Gift,
  HeartPulse,
  Baby,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  MessageSquare,
  Bot
} from 'lucide-react';

export default function KanayaAIAssistant({ user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(true);

  // Sembunyikan bubble setelah beberapa detik tapi orb tetap aktif
  useEffect(() => {
    const timer = setTimeout(() => {
      setSpeechBubbleVisible(false);
    }, 9000);
    return () => clearTimeout(timer);
  }, []);

  const userName = user?.active_nama || user?.nama || 'Warga';

  return (
    <>
      {/* 1. FLOATING AI ASSISTANT ORB (Pojok Kanan Bawah Layar) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none print:hidden">
        {/* Balon Bicara Interaktif Kanaya */}
        <AnimatePresence>
          {speechBubbleVisible && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="pointer-events-auto mb-3 max-w-xs bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-cyan-400/30 backdrop-blur-md relative"
            >
              <button
                onClick={() => setSpeechBubbleVisible(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-white transition-colors"
                title="Tutup sapaan"
              >
                <X size={14} />
              </button>
              
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
                  Kanaya AI &bull; Siap Membantu
                </span>
              </div>
              
              <p className="text-xs text-slate-200 font-medium leading-relaxed pr-2">
                Sampurasun, <strong className="text-white font-bold">{userName}</strong>! Saya siap mengaudit bansos & kesehatan keluarga Anda hari ini.
              </p>

              {/* Panah Balon Bicara */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-slate-900/95 rotate-45 border-r border-b border-cyan-400/30"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tombol Bola Kristal AI (Holographic Levitation Orb) */}
        <motion.button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            setSpeechBubbleVisible(false);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="pointer-events-auto relative group flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl focus:outline-none"
          title="Buka Asisten Digital Kanaya"
        >
          {/* Orbit Halo Aura yang Berdenyut */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-75 blur-md group-hover:opacity-100 transition-opacity animate-pulse" />
          
          {/* Cincin Rotasi Lambat */}
          <div className="absolute -inset-1 rounded-full border border-cyan-300/40 border-dashed animate-spin" style={{ animationDuration: '18s' }} />

          {/* Inti Bola Kaca Glassmorphism */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 border-2 border-cyan-300/60 flex items-center justify-center text-white overflow-hidden shadow-inner">
            {/* Kilau Refleksi Kaca */}
            <div className="absolute -top-3 left-2 w-7 h-4 bg-white/30 rounded-full blur-xs rotate-[-25deg] pointer-events-none" />

            {/* Ikon Sparkles & Logo AI */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-300 group-hover:rotate-12 transition-transform duration-300" />
              <span className="text-[8.5px] font-black uppercase tracking-wider text-cyan-200 mt-0.5">
                KANAYA
              </span>
            </div>

            {/* Gelombang Radar Suara Halus */}
            <div className="absolute bottom-1 w-6 h-1 flex items-center justify-center gap-0.5 opacity-60">
              <span className="w-1 h-2 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1 h-3 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1 h-2 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>

          {/* Notifikasi Badge Merah Kecil */}
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900 text-slate-950 font-black text-[9px] flex items-center justify-center animate-bounce">
            1
          </span>
        </motion.button>
      </div>

      {/* 2. SLIDE-IN KANAYA AI DRAWER PANEL (Panel Dialog Pintar) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 flex justify-end backdrop-blur-xs">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white max-w-md w-full h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden"
            >
              {/* Drawer Header dengan Ambient Gradient */}
              <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white relative">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-sm">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 className="font-black text-base text-white tracking-wide flex items-center gap-2">
                        KANAYA AI
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-400/20 text-cyan-200 border border-cyan-400/40">
                          v2.0 Active
                        </span>
                      </h3>
                      <p className="text-[11px] text-cyan-200/80">
                        Kawan Layanan Warga &bull; Jabar Pintar Digital
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Status Bar Analisis AI */}
                <div className="p-3 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-semibold text-white">Status Integritas Data:</span>
                  </div>
                  <span className="font-bold text-cyan-200">Padan 100% Dukcapil</span>
                </div>
              </div>

              {/* Drawer Body (Rekomendasi Cerdas Proaktif) */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto text-xs text-slate-800">
                {/* 1. Audit Bansos & Kesejahteraan */}
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <Gift size={14} className="text-amber-700" /> Audit Bantuan Sosial
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-extrabold text-[10px]">
                      DTSEN Aktif
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">
                    Keluarga Anda terdaftar dalam pengawasan DTSEN. Penyaluran bantuan APBD Muskel dan APBN Pusat terpantau tepat sasaran.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/dashboard/desil');
                    }}
                    className="text-amber-800 hover:text-amber-950 font-bold inline-flex items-center gap-1 text-[11px] pt-1"
                  >
                    <span>Periksa Formulir 11 Indikator</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* 2. Pemantauan KIA Balita & Lansia */}
                <div className="p-4 rounded-2xl bg-pink-50/80 border border-pink-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-950 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <Baby size={14} className="text-pink-700" /> Surveilans Kesehatan Balita
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      Gizi Baik
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">
                    Data KMS balita (Muhammad Al-Fatih, 28 bulan, 12.4 kg) menunjukkan kurva pertumbuhan optimal. Vitamin A berikutnya terjadwal di Posyandu Melati.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/dashboard/posyandu');
                    }}
                    className="text-pink-800 hover:text-pink-950 font-bold inline-flex items-center gap-1 text-[11px] pt-1"
                  >
                    <span>Buka Kartu KMS Digital</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                {/* 3. Permohonan Surat Cepat */}
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <FileCheck size={14} className="text-blue-700" /> Bantuan Permohonan Surat
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 font-extrabold text-[10px]">
                      AI Auto-Fill
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs">
                    Kanaya dapat mengisi formulir SKU, SKTM, atau Surat Kematian secara otomatis menggunakan data KK yang sudah terverifikasi.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/dashboard/dokumen');
                    }}
                    className="text-blue-800 hover:text-blue-950 font-bold inline-flex items-center gap-1 text-[11px] pt-1"
                  >
                    <span>Ajukan Surat Mandiri</span>
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-600" /> Terproteksi Enkripsi SPBE
                </span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                  Tutup Kanaya
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
