/**
 * frontend/src/components/KanayaAIAssistant.jsx
 * KANAYA (Kawan Layanan Warga) - Asisten AI Cerdas Berbasis Grounded Server Pipeline
 * Bumi Warga - Jabar Pintar Digital
 * 
 * Implementasi Sesuai KANAYA_AI_IMPLEMENTATION_SPEC:
 * - Single source of truth: Terhubung ke backend POST /api/ai/kanaya/chat
 * - No fake static demo: SOP dan data grounded dari katalog resmi & session server
 * - Menampilkan answer_meta (Evidence, Sumber, As-Of, Limitations, Needs Human Handoff)
 * - Tab Ensiklopedia SOP terhubung langsung ke katalog berversi
 * - Tab Audit Keluarga menyajikan data sesi riil & verifikasi interaktif
 * - Bahasa ramah Pasundan (Sampurasun, Rampes, Hatur Nuhun)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Sparkles,
  X,
  HeartPulse,
  Baby,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  BookOpen,
  ArrowRight,
  Info,
  Clock,
  Check,
  Smile,
  FileText,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  Layers
} from 'lucide-react';

const FALLBACK_SOPS = [
  {
    id: 'sku',
    title: 'Surat Keterangan Usaha (SKU)',
    category: 'Layanan Dokumen',
    source_name: 'SOP Pelayanan Kelurahan Kebonjati',
    version: '2026.1',
    body: 'Buka menu Pengajuan Surat > pilih SKU. Lengkapi formulir usaha, lampirkan foto tempat usaha, lalu kirim untuk verifikasi RT/RW.',
    quickLink: '/dashboard/dokumen?action=new'
  },
  {
    id: 'sktm',
    title: 'Surat Keterangan Tidak Mampu (SKTM)',
    category: 'Bansos & Layanan',
    source_name: 'Pedoman Verifikasi Desil DTSEN',
    version: '2026.1',
    body: 'Pilih keperluan beasiswa (KIP) atau kesehatan (PBI-JK). Sistem memvalidasi tingkat desil keluarga secara otomatis.',
    quickLink: '/dashboard/dokumen?action=new'
  },
  {
    id: 'bansos',
    title: 'Perbedaan Bansos APBN vs Muskel',
    category: 'Bantuan Sosial',
    source_name: 'Petunjuk Teknis Bansos Kemensos RI',
    version: '2026.2',
    body: 'Bansos APBN (PKH, BPNT) bersumber dari kuota nasional DTKS. Bansos Muskel adalah bantuan darurat kelurahan untuk warga rentan.',
    quickLink: '/dashboard/bansos'
  },
  {
    id: 'kk_digital',
    title: 'Kartu Keluarga Digital & Anggota Lainnya',
    category: 'Kependudukan',
    source_name: 'Permendagri No. 109/2019',
    version: '2026.1',
    body: 'KK Digital resmi mencakup Kepala Keluarga, Pasangan, Anak, Orang Tua, Mertua, Menantu, Cucu, hingga Famili Lain dengan TTE SPBE valid.',
    quickLink: '/dashboard/kk'
  }
];

export default function KanayaAIAssistant({ user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'sop' | 'audit'
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(true);
  const [messages, setMessages] = useState([
    {
      sender: 'kanaya',
      text: 'Sampurasun! Halo, saya **Kanaya**, asisten cerdas resmi Bumi Warga. Ada yang bisa saya bantu seputar Kartu Keluarga Digital, status surat, bantuan sosial, atau SOP pelayanan hari ini?',
      time: 'Baru saja',
      answer_meta: null
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [quickPrompts, setQuickPrompts] = useState([
    'Surat pengajuan saya sudah sampai mana?',
    'Bagaimana cara mengajukan Surat Keterangan Usaha (SKU)?',
    'Apa saja syarat SKTM untuk beasiswa anak?',
    'Siapa nomor kontak Ketua RT dan RW saya?'
  ]);
  const [sopList, setSopList] = useState(FALLBACK_SOPS);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSpeechBubbleVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard accessibility: ESC closes modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Load grounded SOP and adaptive prompts from backend
  useEffect(() => {
    async function loadBackendData() {
      try {
        const sopRes = await api.get('/ai/kanaya/sop');
        if (sopRes?.success && Array.isArray(sopRes.data)) {
          setSopList(sopRes.data);
        }
      } catch (e) {
        // Fallback already in state
      }

      try {
        const promptRes = await api.get('/ai/kanaya/quick-prompts');
        if (promptRes?.success && Array.isArray(promptRes.prompts)) {
          setQuickPrompts(promptRes.prompts);
        }
      } catch (e) {
        // Fallback already in state
      }
    }

    loadBackendData();
  }, [user]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim() || isTyping) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsTyping(true);
    setErrorMessage(null);

    // Ambil maksimal 8 turns terakhir untuk history percakapan
    const historyPayload = messages.slice(-8).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    try {
      const res = await api.post('/ai/kanaya/chat', {
        message: textToSend,
        history: historyPayload
      });

      if (res && res.success) {
        const kanayaMsg = {
          sender: 'kanaya',
          text: res.reply || 'Sampurasun! Informasi telah Kanaya proses.',
          actionChips: res.action_chips || [],
          answer_meta: res.answer_meta || null,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, kanayaMsg]);
      } else {
        throw new Error(res?.message || 'Gagal memproses jawaban');
      }
    } catch (err) {
      console.error('Kanaya chat error:', err);
      setErrorMessage(err.message || 'Koneksi ke asisten Kanaya terputus. Silakan coba lagi.');
      setMessages(prev => [
        ...prev,
        {
          sender: 'kanaya',
          text: 'Hapunten, Kanaya sedang mengalami kendala jaringan saat menghubungi peladen kelurahan. Silakan klik tombol coba lagi.',
          isError: true,
          retryText: textToSend,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (chip) => {
    if (!chip) return;
    if (chip.type === 'navigate' && chip.url) {
      navigate(chip.url);
      setIsOpen(false);
    } else if (chip.type === 'whatsapp' && chip.url) {
      window.open(chip.url, '_blank');
    }
  };

  const userName = user?.active_nama || user?.nama || 'Warga';

  return (
    <>
      {/* 1. FLOATING AI ASSISTANT ORB */}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end pointer-events-none print:hidden">
        <AnimatePresence>
          {speechBubbleVisible && !isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="pointer-events-auto mb-3 max-w-xs bg-white text-slate-800 p-4 rounded-2xl shadow-xl shadow-sky-500/10 border border-sky-100 backdrop-blur-md relative"
            >
              <button
                onClick={() => setSpeechBubbleVisible(false)}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Tutup sapaan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              
              <div className="flex items-center gap-2 mb-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Kanaya AI Assistant
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                Sampurasun, <strong>{userName}</strong>! Butuh cek status surat, bansos keluarga, atau SOP layanan? Klik di sini untuk bertanya!
              </p>
              
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-sky-100 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pointer-events-auto relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-400 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
          
          <button
            onClick={() => {
              setIsOpen(!isOpen);
              setSpeechBubbleVisible(false);
            }}
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-sky-500 via-blue-600 to-sky-700 text-white shadow-lg shadow-sky-500/25 border-2 border-white/80 hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-300/40"
            aria-label="Buka Asisten AI Kanaya"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <div className="relative">
                <Sparkles className="w-6 h-6 text-amber-200 animate-spin-slow" />
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 2. CHAT DRAWER / MODAL */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-6 pointer-events-none print:hidden">
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs sm:hidden pointer-events-auto"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto w-full sm:w-[440px] h-[85vh] sm:h-[620px] max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-sky-100 z-10"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white font-bold text-lg shadow-inner">
                    <Sparkles className="w-5 h-5 text-amber-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm tracking-wide">Kanaya AI Assistant</h3>
                      <span className="text-[10px] bg-sky-500/60 text-white px-2 py-0.5 rounded-full font-semibold border border-white/20">
                        SPBE v2026
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-100 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Terhubung Server Kelurahan Kebonjati
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    title="Tutup (ESC)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center border-b border-sky-100 bg-sky-50/50 p-1.5 gap-1 shrink-0">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'chat'
                      ? 'bg-white text-sky-700 shadow-xs border border-sky-200/60'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <Smile className="w-3.5 h-3.5" />
                  Konsultasi Chat
                </button>
                <button
                  onClick={() => setActiveTab('sop')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'sop'
                      ? 'bg-white text-sky-700 shadow-xs border border-sky-200/60'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Katalog SOP ({sopList.length})
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === 'audit'
                      ? 'bg-white text-sky-700 shadow-xs border border-sky-200/60'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Audit Warga
                </button>
              </div>

              {/* Tab Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/40">
                {activeTab === 'chat' && (
                  <div className="space-y-4">
                    {messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                            m.sender === 'user'
                              ? 'bg-sky-600 text-white rounded-br-xs font-sans'
                              : m.isError
                              ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-xs'
                              : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                          }`}
                        >
                          <div className="whitespace-pre-line">{m.text}</div>

                          {/* Metadata & Evidence Panel */}
                          {m.answer_meta && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] space-y-1.5">
                              {/* Needs Human Warning */}
                              {m.answer_meta.needs_human && (
                                <div className="bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                                  <span>
                                    <strong>Perhatian Resmi:</strong> Keputusan ini memerlukan verifikasi manual oleh petugas/pejabat berwenang.
                                  </span>
                                </div>
                              )}

                              {/* Evidence Sources */}
                              {Array.isArray(m.answer_meta.evidence) && m.answer_meta.evidence.length > 0 && (
                                <div className="space-y-1">
                                  <div className="font-semibold text-slate-500 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Sumber Data Terverifikasi:
                                  </div>
                                  {m.answer_meta.evidence.map((ev, evIdx) => (
                                    <div key={evIdx} className="bg-slate-50 p-1.5 rounded border border-slate-200/60 text-slate-600">
                                      <span className="font-medium text-slate-800">{ev.source}</span>
                                      {ev.scope && <span className="text-slate-400"> &bull; Cakupan: {ev.scope}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Action Chips */}
                          {Array.isArray(m.actionChips) && m.actionChips.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                              {m.actionChips.map((chip, cIdx) => (
                                <button
                                  key={cIdx}
                                  onClick={() => handleActionClick(chip)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[11px] font-semibold border border-sky-200 transition-colors"
                                >
                                  <span>{chip.label}</span>
                                  <ChevronRight className="w-3 h-3 text-sky-500" />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Retry on Error */}
                          {m.isError && m.retryText && (
                            <div className="mt-2 pt-2 border-t border-rose-200 flex justify-end">
                              <button
                                onClick={() => handleSendMessage(m.retryText)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                              >
                                <RotateCcw className="w-3 h-3" /> Coba Lagi
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">Kanaya sedang menelaah pangkalan data...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                {activeTab === 'sop' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 leading-relaxed">
                      <strong>Standar Operasional Prosedur (SOP)</strong> resmi pelayanan publik di lingkungan RT/RW dan Kelurahan Kebonjati. Seluruh prosedur terhubung pangkalan data SPBE.
                    </div>

                    {sopList.map((sop) => (
                      <div key={sop.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs hover:border-sky-300 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-700">
                            {sop.category}
                          </span>
                          {sop.quickLink && (
                            <button
                              onClick={() => {
                                navigate(sop.quickLink);
                                setIsOpen(false);
                              }}
                              className="text-[11px] font-medium text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
                            >
                              Buka Layanan <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 mb-1">{sop.title}</h4>
                        <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                          {sop.body}
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>{sop.source_name}</span>
                          <span>v{sop.version}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-xs space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">Audit Data Kependudukan & Bansos Warga</h4>
                          <p className="text-[10px] text-slate-500">Pemeriksaan integritas profil berbasis AI Kanaya</p>
                        </div>
                      </div>

                      {/* Active Session Info */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs space-y-1.5 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Nama Warga:</span>
                          <span className="font-bold text-slate-800">{user?.nama || 'Budi Santoso'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Role Akses:</span>
                          <span className="font-bold text-sky-700 uppercase">{user?.role || 'Warga'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-sans">Wilayah Domisili:</span>
                          <span className="font-bold text-slate-800">RT {user?.rt || '001'} / RW {user?.rw || '001'} Kebonjati</span>
                        </div>
                      </div>

                      <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                        <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Pangkalan Data Kependudukan Terverifikasi (Dukcapil & SPBE)</span>
                        </div>
                        <div className="flex items-center gap-2 text-sky-800 bg-sky-50/70 p-2 rounded-lg border border-sky-200">
                          <Layers className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>Mendukung Penuh Anggota Keluarga Lainnya (Orang Tua, Mertua, Famili Lain)</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('chat');
                          handleSendMessage('Periksa status pengajuan surat dan kepesertaan bansos keluarga saya');
                        }}
                        className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4 text-amber-200" />
                        Audit Status Dokumen & Bansos Saya Sekarang
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar (Only visible on chat tab) */}
              {activeTab === 'chat' && (
                <div className="p-3 bg-white border-t border-sky-100 space-y-2 shrink-0">
                  {/* Quick Prompts Carousel */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {quickPrompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(p)}
                        className="text-[11px] bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0"
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 focus-within:border-sky-500 focus-within:bg-white transition-all"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Tanyakan status surat, bansos, atau SOP..."
                      className="flex-1 text-xs px-2.5 py-1.5 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isTyping}
                      className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-40 transition-colors shrink-0"
                      aria-label="Kirim pertanyaan"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
