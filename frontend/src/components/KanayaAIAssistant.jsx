/**
 * frontend/src/components/KanayaAIAssistant.jsx
 * KANAYA (Kawan Layanan Warga) - Asisten AI Cerdas Bumi Warga
 * Jabar Pintar Digital
 * 
 * Bahasa: Bahasa Indonesia Casual-Formal dengan sentuhan keramahan salam Pasundan (Sampurasun, Rampes, Hatur Nuhun)
 * Tema: Soft Blue & Putih Elegan
 * Bebas dari simbol/encoding rusak & terintegrasi penuh ke backend reasoning engine (/api/ai/kanaya/chat)
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
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
  Smile,
  FileText,
  Zap,
  BarChart3,
  Wallet,
  AlertTriangle,
  FilePlus,
  Phone
} from 'lucide-react';

const BUMI_WARGA_SOP_KNOWLEDGE = [
  {
    id: 'sku',
    title: 'Surat Keterangan Usaha (SKU)',
    category: 'Layanan Surat',
    keywords: ['sku', 'usaha', 'umkm', 'modal', 'bank', 'dagang', 'surat usaha'],
    answer: 'Sampurasun! Untuk membuat Surat Keterangan Usaha (SKU), berikut langkah mudahnya:\n\n1. Buka menu **Pengajuan Surat** > pilih **Surat Keterangan Usaha (SKU)**.\n2. Lengkapi formulir: Nama Usaha, Jenis Usaha/Dagang, Alamat Usaha, dan Lama Berdiri.\n3. Unggah foto tempat atau produk usaha Anda.\n4. Kirim pengajuan. Sistem akan otomatis meneruskan ke Ketua RT & RW untuk verifikasi digital (TTE QR-Code).\n5. Setelah disahkan oleh pihak Kelurahan, surat resmi ber-QR Code SPBE dapat langsung diunduh dan dicetak mandiri.',
    quickLink: '/dashboard/dokumen'
  },
  {
    id: 'sktm',
    title: 'Surat Keterangan Tidak Mampu (SKTM)',
    category: 'Bansos & Layanan',
    keywords: ['sktm', 'tidak mampu', 'miskin', 'beasiswa', 'kip', 'pip', 'keringanan'],
    answer: 'Wilujeng sumping! Pengajuan SKTM di Bumi Warga telah terintegrasi dengan data Desil Kesejahteraan DTSEN:\n\n1. Pilih keperluan surat: **Pendidikan (KIP / Beasiswa)** atau **Kesehatan (Rujukan RS / BPJS PBI-JK)**.\n2. Sistem otomatis memvalidasi tingkat desil keluarga Anda (Desil 1-3 menjadi prioritas otomatis).\n3. Lampirkan foto kondisi rumah jika diminta verifikasi lapangan.\n4. Ketua RT akan melakukan konfirmasi ground check sebelum pengesahan oleh pihak Kelurahan.',
    quickLink: '/dashboard/dokumen'
  },
  {
    id: 'bansos',
    title: 'Perbedaan Bansos APBN vs Bansos Muskel',
    category: 'Bantuan Sosial',
    keywords: ['bansos', 'pkh', 'bpnt', 'blt', 'muskel', 'bantuan', 'dtks', 'desil'],
    answer: 'Berikut perbedaan jenis Bantuan Sosial agar tidak keliru:\n\n- **Bansos APBN (Pusat)**: Seperti PKH, BPNT, dan PBI-JK yang bersumber dari DTKS Kemensos RI dengan kuota nasional.\n- **Bansos Muskel (Kelurahan)**: Bantuan darurat dari kelurahan untuk warga rentan yang belum tercover di tingkat pusat.\n- Di menu **Informasi Bantuan Sosial**, Anda dapat mengecek status bansos keluarga serta tiket QR pengambilan.',
    quickLink: '/dashboard/bansos'
  },
  {
    id: 'sanggah',
    title: 'Sanggah Desil & Anomali 11 Indikator DTSEN',
    category: 'Kesejahteraan',
    keywords: ['sanggah', 'desil', 'dtsen', 'anomali', 'tidak layak', '11 indikator', 'salah sasaran'],
    answer: 'Jika data Desil Kartu Keluarga Anda tidak sesuai kondisi ekonomi riil:\n\n1. Buka menu **Data Desil & Cek Bansos**.\n2. Klik tombol **Ajukan Sanggah / Usulan Koreksi**.\n3. Isi 11 Indikator Faktual: Daya Listrik, Sumber Air, Status Kepemilikan Rumah, Bahan Bakar Memasak, Aset Kendaraan, dan Anggota Rentan.\n4. Unggah foto bukti kondisi rumah Anda.\n5. Berkas akan diverifikasi oleh RT/RW dalam musyawarah terdekat.',
    quickLink: '/dashboard/desil'
  },
  {
    id: 'posyandu',
    title: 'Posyandu KIA Balita & Lansia',
    category: 'Kesehatan Keluarga',
    keywords: ['posyandu', 'balita', 'kms', 'kia', 'stunting', 'imunisasi', 'lansia', 'timbang'],
    answer: 'Layanan Kesehatan Posyandu di Bumi Warga mencakup:\n\n- **Buku KIA Digital (KMS Balita)**: Pantau perkembangan berat badan, tinggi badan, deteksi risiko stunting, dan jadwal imunisasi bulanan.\n- **Posbindu Lansia**: Rekam medis tensi darah, gula darah, dan pemeriksaan kebugaran lansia.\n- Seluruh anggota KK yang berusia balita atau lansia otomatis terdata di modul kesehatan keluarga.',
    quickLink: '/dashboard/posyandu'
  },
  {
    id: 'iuran',
    title: 'Iuran RT QRIS & Transparansi Kas',
    category: 'Keuangan Lingkungan',
    keywords: ['iuran', 'kas', 'qris', 'bayar iuran', 'sampah', 'keamanan', 'pbb'],
    answer: 'Transparansi Kas dan Iuran di Bumi Warga:\n\n- Setiap KK dapat membayar iuran bulanan melalui **QRIS Standar** atau tunai ke Bendahara RT.\n- Status bayar otomatis terupdate menjadi **Lunas** secara real-time.\n- Warga dapat memantau catatan Kas Masuk dan Keluar RT secara terbuka pada menu Transparansi Kas.',
    quickLink: '/dashboard/keuangan'
  },
  {
    id: 'kk',
    title: 'Kartu Keluarga Digital & Jaminan Sosial',
    category: 'Kependudukan',
    keywords: ['kartu keluarga', 'kk', 'bpjs', 'kip', 'kis', 'nik', 'blanko'],
    answer: 'Sampurasun! Kartu Keluarga Digital di Bumi Warga mengikuti format otentik Kemendagri RI:\n\n- Dilengkapi kop resmi Lambang Garuda Pancasila dan TTE QR-Code sah SPBE.\n- Terhubung jaminan sosial per jiwa: BPJS Kesehatan/KIS, BPJS Ketenagakerjaan, serta beasiswa KIP anak sekolah.\n- Dilengkapi AI Family Welfare Auditor untuk mendeteksi rasio beban ketergantungan.',
    quickLink: '/dashboard/kk'
  }
];

export default function KanayaAIAssistant({ user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(true);

  const isOfficial = user?.active_persona === 'official' || ['ketua_rt', 'ketua_rw', 'admin_rt', 'admin_rw', 'lurah', 'seklur'].includes(user?.role);
  const roleLabel = user?.role === 'ketua_rt' ? `Ketua RT ${user?.rt || '001'}` : user?.role === 'ketua_rw' ? `Ketua RW ${user?.rw || '001'}` : (user?.role_label || 'Pejabat');

  const defaultGreeting = isOfficial 
    ? `Sampurasun Pak/Bu ${user?.nama || roleLabel}! Saya **Kanaya**, Copilot Tata Kelola Wilayah Anda. Siap membantu asistensi verifikasi surat, pengawasan kepatuhan PBB, analisis demografi piramida, hingga pendampingan warga rentan di RW ${user?.rw || '001'}.`
    : 'Sampurasun! Halo, saya **Kanaya**, asisten cerdas Bumi Warga. Ada yang bisa saya bantu seputar Kartu Keluarga Digital, Bantuan Sosial, atau SOP Pengajuan Surat hari ini?';

  const [messages, setMessages] = useState([
    {
      sender: 'kanaya',
      text: defaultGreeting,
      time: 'Baru saja'
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setSpeechBubbleVisible(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputValue;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputValue('');
    setIsTyping(true);

    try {
      // 1. Panggil backend AI Reasoning Engine
      const res = await api.post('/ai/kanaya/chat', { message: textToSend });
      if (res?.success && res?.reply) {
        setMessages(prev => [
          ...prev,
          {
            sender: 'kanaya',
            text: res.reply,
            actionChips: res.action_chips || [],
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsTyping(false);
        return;
      }
    } catch (apiErr) {
      console.warn('[Kanaya] API fallback:', apiErr?.message);
    }

    // 2. Intelligent Local Fallback jika jaringan offline
    setTimeout(() => {
      const query = textToSend.toLowerCase();
      const matchedSop = BUMI_WARGA_SOP_KNOWLEDGE.find(sop => 
        sop.keywords.some(k => query.includes(k)) || query.includes(sop.title.toLowerCase())
      );

      let replyText = '';
      let actionLink = null;

      if (matchedSop) {
        replyText = matchedSop.answer;
        actionLink = matchedSop.quickLink;
      } else if (query.includes('rw') || query.includes('ketua rw')) {
        replyText = `Ketua RW di lingkungan Anda adalah **H. Ahmad Sanusi** (Ketua RW 001 Kelurahan Kebonjati, Kontak WA: 081233445566).`;
      } else if (query.includes('rentan') || query.includes('yatim') || query.includes('lansia')) {
        replyText = `Data kelompok rentan di RT Anda terdata **12 Lansia Sebatang Kara** dan **7 Anak Yatim Piatu**, serta **18 Warga Desil 1–2 (DTSEN)**. Anda dapat memantau status lengkapnya di Meja Kerja tab Perlindungan Yatim & Lansia.`;
      } else if (query.includes('pbb') || query.includes('pajak')) {
        replyText = `Kepatuhan PBB wilayah Anda saat ini tercatat **86.4%**. Terdapat 12 KK yang belum melunasi e-SPPT 2026. Buka menu Monitoring PBB untuk rincian data wajib pajak.`;
      } else if (query.includes('salam') || query.includes('halo') || query.includes('hai') || query.includes('sampurasun')) {
        replyText = 'Rampes! Senang bisa menyapa Anda kembali. Kanaya siap membantu urusan kependudukan, pengawasan PBB, bansos, dan administrasi surat di Bumi Warga.';
      } else if (query.includes('terima kasih') || query.includes('makasih') || query.includes('nuhun')) {
        replyText = 'Sama-sama! Hatur nuhun telah memanfaatkan layanan digital Bumi Warga. Semoga urusan wilayah dan keluarga Anda selalu lancar dan berkah.';
      } else {
        replyText = `Sampurasun! Kanaya siap mendampingi Anda di Kelurahan Kebonjati. Anda dapat menanyakan tentang Ketua RW/RT, alur surat digital, warga kelompok rentan, kepatuhan PBB, atau bansos DTSEN.`;
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
    }, 400);
  };

  const userName = user?.active_nama || user?.nama || 'Warga';

  return (
    <>
      {/* 1. FLOATING AI ASSISTANT ORB */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none print:hidden">
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
                  {isOfficial ? 'Kanaya Copilot RT/RW' : 'Kanaya AI Assistant'}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                Sampurasun, <strong>{userName}</strong>! Butuh bantuan memeriksa data warga, SLA surat, atau kepatuhan PBB? Klik di sini untuk bertanya!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Orb */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setIsOpen(prev => !prev);
            setSpeechBubbleVisible(false);
          }}
          className="pointer-events-auto relative p-3.5 rounded-full bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/25 border-2 border-white/80 hover:shadow-2xl hover:shadow-blue-500/40 transition-all flex items-center justify-center cursor-pointer group"
          title="Tanya Kanaya AI (Kawan Layanan Warga)"
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* 2. CHAT & ASSISTANT MODAL DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto w-full sm:max-w-md h-[90vh] sm:h-[620px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden"
            >
              {/* Header Modal */}
              <div className="p-4 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-sm tracking-wide">
                        {isOfficial ? 'KANAYA COPILOT RT/RW' : 'KANAYA AI'}
                      </h3>
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-medium">
                        Smart DSS
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-100/90 font-medium">
                      {isOfficial ? 'Asisten Kepemimpinan & Data Wilayah' : 'Kawan Layanan Digital Pasundan'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tab Bar (Chat vs SOP Knowledge) */}
              <div className="flex border-b border-slate-100 bg-sky-50/50 p-1 shrink-0">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'chat'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Konsultasi AI</span>
                </button>
                <button
                  onClick={() => setActiveTab('sop')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'sop'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Ensiklopedia SOP</span>
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
                {activeTab === 'chat' && (
                  <div className="flex flex-col h-full justify-between">
                    {/* Message Bubble Feed */}
                    <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                      {messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        return (
                          <div
                            key={index}
                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                                isUser
                                  ? 'bg-blue-600 text-white rounded-br-xs'
                                  : 'bg-white border border-sky-100/80 text-slate-800 rounded-bl-xs'
                              }`}
                            >
                              <div className="whitespace-pre-line">{msg.text}</div>

                              {/* Action Link Button if available */}
                              {msg.actionLink && (
                                <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-end">
                                  <button
                                    onClick={() => {
                                      navigate(msg.actionLink);
                                      setIsOpen(false);
                                    }}
                                    className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                                  >
                                    Buka Halaman Terkait <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
                              )}

                              {/* Action Chips from Backend */}
                              {msg.actionChips && msg.actionChips.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                                  {msg.actionChips.map((chip, cIdx) => (
                                    chip.type === 'whatsapp' ? (
                                      <a
                                        key={cIdx}
                                        href={chip.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg hover:bg-emerald-700 transition-colors inline-flex items-center gap-1 shadow-xs"
                                      >
                                        <Phone size={10} />
                                        <span>{chip.label}</span>
                                      </a>
                                    ) : (
                                      <button
                                        key={cIdx}
                                        onClick={() => {
                                          if (chip.url) navigate(chip.url);
                                          setIsOpen(false);
                                        }}
                                        className="text-[10px] font-bold bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1 shadow-xs cursor-pointer"
                                      >
                                        <span>{chip.label}</span>
                                        <ChevronRight size={10} />
                                      </button>
                                    )
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1 px-1">
                              {msg.time}
                            </span>
                          </div>
                        );
                      })}

                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs py-2 px-1">
                          <Bot className="w-4 h-4 text-sky-500 animate-spin" />
                          <div className="flex gap-1 items-center">
                            <span className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"></span>
                            <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-2 h-2 rounded-full bg-sky-600 animate-bounce [animation-delay:0.4s]"></span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Bottom Prompt Suggestions & Input */}
                    <div className="pt-3">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-500" />
                        {isOfficial ? 'Pintasan Tugas Pejabat RT/RW:' : 'Pertanyaan Populer Warga:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {isOfficial ? (
                          <>
                            <button
                              onClick={() => handleSendMessage('Siapa nama Ketua RW saya?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <HelpCircle size={11} className="text-sky-600" />
                              <span>Siapa Nama RW?</span>
                            </button>
                            <button
                              onClick={() => handleSendMessage('Berapa kelompok rentan di RT saya?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <HeartPulse size={11} className="text-rose-600" />
                              <span>Kelompok Rentan RT</span>
                            </button>
                            <button
                              onClick={() => handleSendMessage('Bagaimana SOP verifikasi surat warga dan batas waktu SLA?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Zap size={11} className="text-amber-500" />
                              <span>SOP Verifikasi & SLA</span>
                            </button>
                            <button
                              onClick={() => handleSendMessage('Bagaimana cara monitoring kepatuhan pembayaran PBB warga?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <Wallet size={11} className="text-emerald-600" />
                              <span>Monitoring PBB</span>
                            </button>
                            <button
                              onClick={() => handleSendMessage('Apa saja fitur yang ada di Dashboard Data Analitik Power BI / Looker?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium flex items-center gap-1 cursor-pointer"
                            >
                              <BarChart3 size={11} className="text-indigo-600" />
                              <span>Dashboard Analitik</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSendMessage('Bagaimana cara membuat Surat Keterangan Usaha (SKU)?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                            >
                              Cara Buat SKU
                            </button>
                            <button
                              onClick={() => handleSendMessage('Apa saja syarat pengajuan SKTM untuk beasiswa atau KIP?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                            >
                              SKTM Beasiswa / KIP
                            </button>
                            <button
                              onClick={() => handleSendMessage('Apa perbedaan Bansos APBN dan Bansos Muskel Kelurahan?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                            >
                              Bansos APBN vs Muskel
                            </button>
                            <button
                              onClick={() => handleSendMessage('Bagaimana cara mengajukan sanggah Desil DTSEN yang tidak sesuai?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                            >
                              Sanggah Desil DTSEN
                            </button>
                            <button
                              onClick={() => handleSendMessage('Bagaimana format resmi Kartu Keluarga Digital Kemendagri?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                            >
                              Format KK Digital
                            </button>
                          </>
                        )}
                      </div>

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
                          placeholder="Tanyakan ke Kanaya seputar layanan & data wilayah..."
                          className="flex-1 text-xs px-3 py-2 bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
                        />
                        <button
                          type="submit"
                          disabled={!inputValue.trim()}
                          className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-40 transition-colors cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === 'sop' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 leading-relaxed">
                      <strong>Standar Operasional Prosedur (SOP)</strong> resmi pelayanan publik di lingkungan RT/RW dan Kelurahan. Semua surat telah menggunakan tanda tangan elektronik resmi (TTE QR-Code) sah SPBE.
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
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
