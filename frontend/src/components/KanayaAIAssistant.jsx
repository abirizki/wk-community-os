/**
 * frontend/src/components/KanayaAIAssistant.jsx
 * KANAYA (Kawan Layanan Warga) â€” Asisten Cerdas Bumi Warga
 * Berbasis Budaya Kasundaan (Someah Hade ka Semoh) & SOP Pelayanan Publik Jabar Pintar Digital
 * 
 * Fitur:
 * - Tema Visual: Soft Blue & Putih Elegan dengan siluet motif Mega Mendung Pasundan
 * - Animasi Premium: Floating Glassmorphic Holographic Orb, Breathing Aura Ring & Smooth Transition
 * - SOP Lengkap Bumi Warga: SKU, SKTM, Pengantar Nikah N1-N4, Kelahiran/Kematian, 
 *   Sanggah 11 Indikator DTSEN, Bansos APBN vs Muskel, Posyandu KIA KMS & Lansia, Iuran RT QRIS
 * - Interactive Chatbot dengan Quick Chips, Natural Kasundaan Greetings, & AI Welfare Diagnostic
 */

import React, { useState, useEffect, useRef } from 'react';
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
  Bot,
  Send,
  BookOpen,
  ArrowRight,
  Info,
  Clock,
  Check,
  Coins,
  Smile
} from 'lucide-react';

// Basis Pengetahuan Resmi SOP Bumi Warga (Knowledge Base)
const BUMI_WARGA_SOP_KNOWLEDGE = [
  {
    id: 'sku',
    title: 'Surat Keterangan Usaha (SKU)',
    category: 'Layanan Surat',
    keywords: ['sku', 'usaha', 'umkm', 'modal', 'bank', 'dagang', 'surat usaha'],
    answer: 'Sampurasun! Kanggo ngadamel Surat Keterangan Usaha (SKU), ieu alur resmi SOP Bumi Warga:\n\n1. Buka menu **Layanan Surat** > Pilih **Surat Keterangan Usaha (SKU)**.\n2. Eusi formulir: Nami Usaha, Jenis Dagang/Jasa, Alamat Lokasi Usaha, & Lama Berdiri.\n3. Unggah foto tempat/produk usaha.\n4. Ajukan ka RT. Sistem bakal otomatis ngirim notifikasi ka Ketua RT & RW kanggo verifikasi digital (TTE QR-Code).\n5. Saatos disatujuan, surat tiasa langsung diunduh PDF resmi ber-QR Code SPBE.',
    quickLink: '/surat'
  },
  {
    id: 'sktm',
    title: 'Surat Keterangan Tidak Mampu (SKTM)',
    category: 'Bansos & Layanan',
    keywords: ['sktm', 'tidak mampu', 'miskin', 'beasiswa', 'kip', 'pip', 'keringanan'],
    answer: 'Wilujeng sumping! Pengajuan SKTM di Bumi Warga parantos terintegrasi sareng sistem DTSEN (Desil Kesejahteraan):\n\n1. Pilih jenis kaperluan: **Pendidikan (KIP/Kuliah)** atanapi **Kesehatan (Rujukan RS/BPJS PBI-JK)**.\n2. Data bakal otomatis dikomparasi sareng Desil KK anjeun (Desil 1-3 prioritas otomatis).\n3. Lampirkeun foto bumi (tampak payun & lebet) upami dipundut verifikasi lapangan.\n4. RT bakal ngalakukeun konfirmasi ground check sateuacan pengesahan Kelurahan.',
    quickLink: '/surat'
  },
  {
    id: 'bansos',
    title: 'Bansos APBN vs Bansos Muskel (Kelurahan)',
    category: 'Bantuan Sosial',
    keywords: ['bansos', 'pkh', 'bpnt', 'blt', 'muskel', 'bantuan', 'dtks', 'desil'],
    answer: 'Ieu bédana Bantuan Sosial di Bumi Warga supados henteu lepat paham:\n\nâ€¢ **Bansos APBN (Pusat)**: PKH, BPNT, & PBI-JK dumasar kana DTKS Kemensos RI & kuota nasional.\nâ€¢ **Bansos Muskel (Musyawarah Kelurahan)**: Bantuan darurat lokal kanggo warga rentan anu teu acan ka-cover Pusat.\nâ€¢ Di menu **Bansos Mandiri**, anjeun tiasa marios riwayat panarimaan sareng ngajukeun sanggahan anomali upami aya anu teu tepat sasaran.',
    quickLink: '/bansos'
  },
  {
    id: 'sanggah',
    title: 'Sanggah Desil & Anomali 11 Indikator DTSEN',
    category: 'Kesejahteraan',
    keywords: ['sanggah', 'desil', 'dtsen', 'anomali', 'tidak layak', '11 indikator', 'salah sasaran'],
    answer: 'Upami aya panarima bansos anu parantos mampu atanapi data Desil KK anjeun henteu saluyu:\n\n1. Buka menu **Audit Bansos & Desil**.\n2. Pilih tombol **Ajukan Sanggah / Usulan Koreksi**.\n3. Eusi 11 Indikator DTSEN: Daya Listrik, Sumber Cai, Status Bumi, Bahan Bakar, Aset Kandaraan, & Anggota Rentan.\n4. Unggah bukti foto KTP/KK & kondisi faktual.\n5. Berkas bakal direview dina Musyawarah RT/RW salajengna.',
    quickLink: '/kk'
  },
  {
    id: 'posyandu',
    title: 'Posyandu KIA KMS & Lansia',
    category: 'Kesehatan Warga',
    keywords: ['posyandu', 'balita', 'kms', 'kia', 'stunting', 'imunisasi', 'lansia', 'timbang'],
    answer: 'Layanan Kaséhatan Posyandu di Bumi Warga nyadiakeun:\n\nâ€¢ **Kartu Balita Sehat (KMS Digital)**: Pantauan beurat awak, jangkungna, status stunting, & jadwal imunisasi rutin tiap sasih.\nâ€¢ **Posbindu Lansia**: Rekam médis tensi darah, gula darah, asam urat, & senam bugar warga sepuh.\nâ€¢ Sadaya anggota kulawarga di KK anu yuswana balita atanapi lansia otomatis kacatet dina buku kaséhatan digital.',
    quickLink: '/kartu-sehat'
  },
  {
    id: 'nikah',
    title: 'Surat Pengantar Nikah (N1 - N4)',
    category: 'Kependudukan',
    keywords: ['nikah', 'kawin', 'n1', 'n2', 'n4', 'kua', 'pengantar nikah'],
    answer: 'Kanggo ngurus Surat Pengantar Nikah (N1-N4) ka KUA/Disdukcapil:\n\n1. Siapkeun scan KTP Calon Penganten, KTP Sepuh/Wali, & KK.\n2. Pilih **Pengantar Nikah (Model N1)** dina menu Layanan Surat.\n3. Eusi data calon pasangan & tanggal akad anu direncanakeun.\n4. RT/RW bakal ngaluarkeun Surat Keterangan Asal-Usul & Kesiapan Administrasi.',
    quickLink: '/surat'
  },
  {
    id: 'iuran',
    title: 'Iuran RT QRIS & Kas Lingkungan',
    category: 'Keuangan Warga',
    keywords: ['iuran', 'kas', 'qris', 'bayar iuran', 'sampah', 'keamanan', 'pbb'],
    answer: 'Transparansi Kas & Iuran di Bumi Warga:\n\nâ€¢ Unggal KK tiasa mayar iuran bulanan (kaamanan & kabersihan) nganggo **QRIS Standar** atanapi tunai ka Bendahara RT.\nâ€¢ Status bayar otomatis robah janten **LUNAS** sacara real-time.\nâ€¢ Warga tiasa ningali laporan Kas Masuk & Kas Keluar RT sacara kabuka dina tab Keuangan Lingkungan.',
    quickLink: '/keuangan'
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
      text: 'Sampurasun! Wilujeng sumping. Simkuring **Kanaya**, asisten pinter Bumi Warga. Aya anu tiasa dibantos perkawis KK Digital, Bansos, atanapi SOP Pelayanan Surat dinten ieu?',
      time: 'Ayeuna'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Sembunyikan bubble otomatis setelah beberapa saat
  useEffect(() => {
    const timer = setTimeout(() => {
      setSpeechBubbleVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim()) return;

    // Tambah pesan user
    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsTyping(true);

    // AI Matcher berbasis SOP Knowledge Base
    setTimeout(() => {
      const query = textToSend.toLowerCase();
      let matchedSop = BUMI_WARGA_SOP_KNOWLEDGE.find(sop => 
        sop.keywords.some(k => query.includes(k)) || query.includes(sop.title.toLowerCase())
      );

      let replyText = '';
      let actionLink = null;

      if (matchedSop) {
        replyText = matchedSop.answer;
        actionLink = matchedSop.quickLink;
      } else if (query.includes('salam') || query.includes('halo') || query.includes('hai') || query.includes('sampurasun')) {
        replyText = 'Rampes! Wilujeng tepang deui. Kanaya siap ngabantosan sagala urusan kependudukan, bansos, kas posyandu, dugi ka panyuratan di Bumi Warga.';
      } else if (query.includes('terima kasih') || query.includes('nuhun')) {
        replyText = 'Sami-sami! Hatur nuhun parantos nganggo aplikasi Bumi Warga. Mugia kulawarga salawasna sehat sareng walagri.';
      } else {
        replyText = `Hatur nuhun kana patarosan anjeun. Perkawis "${textToSend}", Kanaya nyarankeun anjeun mariksa langsung panduan dina Tab SOP resmi atanapi ngahubungi Pengurus RT satempat.\n\nAnjeun oge tiasa milih topik populér di handap ieu:`;
      }

      setMessages(prev => [
        ...prev, 
        {
          sender: 'kanaya',
          text: replyText,
          actionLink: actionLink,
          time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const userName = user?.active_nama || user?.nama || 'Warga';

  return (
    <>
      {/* 1. FLOATING AI ASSISTANT ORB (Pojok Kanan Bawah Layar) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none print:hidden">
        {/* Balon Bicara Interaktif Kanaya dengan Nuansa Pasundan */}
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
                  Kanaya AI Pasundan
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                Sampurasun, <strong>{userName}</strong>! Butuh bantosan mariksa KK, BPJS/KIP, atanapi SOP Surat? Klik abdi di dieu!
              </p>
              
              {/* Panah Balon Bicara */}
              <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-sky-100 transform rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tombol Orb Holographic dengan Breathing Animation */}
        <div className="pointer-events-auto relative group">
          {/* Subtle Outer Glow Rings */}
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
              <div className="relative flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-sky-100 animate-spin-slow" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 2. SLIDE-IN KANAYA AI MODAL / DRAWER (Soft Blue & Putih Elegan) */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end print:hidden">
            {/* Backdrop dengan Blur Lembut */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 border-l border-sky-100"
            >
              {/* Header Kanaya: Nuansa Pasundan Soft Blue */}
              <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white p-5 relative overflow-hidden flex-shrink-0">
                {/* Background Pattern Lembut (Mega Mendung feel) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,50 Q25,20 50,50 T100,50 L100,100 L0,100 Z" fill="currentColor"></path>
                  </svg>
                </div>

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                      <Sparkles className="w-6 h-6 text-sky-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg text-white tracking-wide">Kanaya AI</h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-400/25 border border-sky-300/40 text-sky-100">
                          Sunda Pasundan
                        </span>
                      </div>
                      <p className="text-xs text-sky-100/90">Kawan Layanan & SOP Cerdas Bumi Warga</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-sky-100 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mt-4 pt-2 border-t border-sky-500/40">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'chat' 
                        ? 'bg-white text-sky-700 shadow-sm font-semibold' 
                        : 'text-sky-100 hover:bg-white/10'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Tanya Kanaya
                  </button>
                  <button
                    onClick={() => setActiveTab('sop')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'sop' 
                        ? 'bg-white text-sky-700 shadow-sm font-semibold' 
                        : 'text-sky-100 hover:bg-white/10'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Ensiklopedia SOP
                  </button>
                  <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'audit' 
                        ? 'bg-white text-sky-700 shadow-sm font-semibold' 
                        : 'text-sky-100 hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Audit Bansos & KK
                  </button>
                </div>
              </div>

              {/* Body Content Tab */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
                {/* TAB 1: INTERACTIVE CHATBOT */}
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full justify-between">
                    <div className="space-y-3.5">
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                              msg.sender === 'user'
                                ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none shadow-sm'
                                : 'bg-white text-slate-800 rounded-tl-none border border-sky-100 shadow-sm'
                            }`}
                          >
                            {msg.sender === 'kanaya' && (
                              <div className="flex items-center gap-1.5 mb-1.5 text-sky-600 font-semibold text-[11px]">
                                <Smile className="w-3 h-3 text-sky-500" />
                                Kanaya Pasundan
                              </div>
                            )}
                            <div className="whitespace-pre-line">{msg.text}</div>
                            {msg.actionLink && (
                              <button
                                onClick={() => {
                                  navigate(msg.actionLink);
                                  setIsOpen(false);
                                }}
                                className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-200 transition-colors w-full justify-center"
                              >
                                Buka Modul Terkait
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <div className={`text-[9px] mt-1 text-right ${msg.sender === 'user' ? 'text-sky-200' : 'text-slate-400'}`}>
                              {msg.time}
                            </div>
                          </div>
                        </div>
                      ))}

                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white rounded-2xl rounded-tl-none p-3 border border-sky-100 shadow-sm flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce [animation-delay:0.4s]"></span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Question Chips */}
                    <div className="pt-3">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-500" />
                        Patarosan Populer (SOP Kasundaan):
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <button
                          onClick={() => handleSendMessage('Kumaha carana ngadamel SKU (Surat Keterangan Usaha)?')}
                          className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                        >
                          ðŸ“  Cara Buat SKU
                        </button>
                        <button
                          onClick={() => handleSendMessage('Naon wae syarat pengajuan SKTM pikeun beasiswa?')}
                          className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                        >
                          ðŸŽ“ SKTM Beasiswa / KIP
                        </button>
                        <button
                          onClick={() => handleSendMessage('Kumaha bédana Bansos APBN sareng Muskel?')}
                          className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                        >
                          ðŸŽ Bansos APBN vs Muskel
                        </button>
                        <button
                          onClick={() => handleSendMessage('Kumaha carana sanggah Desil DTSEN anu teu saluyu?')}
                          className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                        >
                          âš–ï¸  Sanggah Desil DTSEN
                        </button>
                      </div>

                      {/* Chat Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-sky-200 shadow-sm"
                      >
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="Taroskeun ka Kanaya perkawis layanan..."
                          className="flex-1 text-xs px-3 py-2 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                        />
                        <button
                          type="submit"
                          disabled={!inputValue.trim()}
                          className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-40 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* TAB 2: ENSIKLOPEDIA SOP BUMI WARGA */}
                {activeTab === 'sop' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 leading-relaxed">
                      <strong>Standar Operasional Prosedur (SOP)</strong> resmi pelayanan publik di lingkungan RT/RW & Kelurahan. Sadaya surat parantos nganggo legalitas TTE QR-Code sah SPBE.
                    </div>

                    {BUMI_WARGA_SOP_KNOWLEDGE.map((sop) => (
                      <div key={sop.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:border-sky-300 transition-colors">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-700">
                            {sop.category}
                          </span>
                          <button
                            onClick={() => {
                              navigate(sop.quickLink);
                              setIsOpen(false);
                            }}
                            className="text-[11px] font-medium text-sky-600 hover:text-sky-700 flex items-center gap-0.5"
                          >
                            Buka Layanan <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 mb-1">{sop.title}</h4>
                        <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">
                          {sop.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: AUDIT BANSOS & KK */}
                {activeTab === 'audit' && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">Pamariksaan Kesejahteraan KK</h4>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                        Sistem AI Kanaya ngabantosan mariksa kelengkapan administrasi anggota keluarga kalebet status kepesertaan jaminan sosial.
                      </p>

                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            BPJS Kesehatan / KIS
                          </span>
                          <span className="font-semibold text-emerald-600">Terdaftar Aktif</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                            BPJS Ketenagakerjaan
                          </span>
                          <span className="font-semibold text-blue-600">Tercatat di KK</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                            Program KIP (Pendidikan)
                          </span>
                          <span className="font-semibold text-amber-600">Tercatat</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                            Legalitas TTE QR SPBE
                          </span>
                          <span className="font-semibold text-purple-600">Valid</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button
                          onClick={() => {
                            navigate('/kk');
                            setIsOpen(false);
                          }}
                          className="w-full py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                        >
                          Lihat Kartu Keluarga Digital Lengkap
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Panel */}
              <div className="p-3 bg-white border-t border-slate-200 text-center text-[10px] text-slate-400">
                Kanaya AI Â· Jabar Pintar Digital Â· Bumi Warga Pasundan
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
