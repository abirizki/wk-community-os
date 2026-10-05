/**
 * frontend/src/components/KanayaAIAssistant.jsx
 * KANAYA (Kawan Layanan Warga) - Asisten AI Cerdas Bumi Warga
 * Jabar Pintar Digital
 * 
 * Bahasa: Bahasa Indonesia Casual-Formal dengan sentuhan keramahan salam Pasundan (Sampurasun, Rampes, Hatur Nuhun)
 * Tema: Soft Blue & Putih Elegan
 * Bebas dari simbol/encoding rusak
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
  Smile,
  FileText
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
    id: 'nikah',
    title: 'Surat Pengantar Nikah (Model N1 - N4)',
    category: 'Kependudukan',
    keywords: ['nikah', 'kawin', 'n1', 'n2', 'n4', 'kua', 'pengantar nikah'],
    answer: 'Untuk pengurusan Surat Pengantar Nikah (N1-N4) ke KUA atau Disdukcapil:\n\n1. Siapkan foto KTP calon pengantin, KTP orang tua/wali, dan Kartu Keluarga.\n2. Pilih **Surat Pengantar Nikah** pada menu Pengajuan Surat.\n3. Lengkapi identitas calon pasangan serta rencana tanggal dan lokasi akad.\n4. RT dan RW akan menerbitkan rekomendasi pengantar resmi secara digital.',
    quickLink: '/dashboard/dokumen'
  },
  {
    id: 'iuran',
    title: 'Iuran RT QRIS & Transparansi Kas',
    category: 'Keuangan Lingkungan',
    keywords: ['iuran', 'kas', 'qris', 'bayar iuran', 'sampah', 'keamanan', 'pbb'],
    answer: 'Transparansi Kas dan Iuran di Bumi Warga:\n\n- Setiap KK dapat membayar iuran bulanan (keamanan dan kebersihan) melalui **QRIS Standar** atau tunai ke Bendahara RT.\n- Status bayar otomatis terupdate menjadi **Lunas** secara real-time.\n- Warga dapat memantau catatan Kas Masuk dan Keluar RT secara terbuka pada menu Transparansi Kas.',
    quickLink: '/dashboard/keuangan'
  },
  {
    id: 'kk',
    title: 'Kartu Keluarga Digital & Jaminan Sosial',
    category: 'Kependudukan',
    keywords: ['kartu keluarga', 'kk', 'bpjs', 'kip', 'kis', 'nik', 'blanko'],
    answer: 'Sampurasun! Kartu Keluarga Digital di Bumi Warga mengikuti format otentik Kemendagri RI:\n\n- Dilengkapi kop resmi Lambang Garuda Pancasila dan TTE QR-Code sah SPBE.\n- Terhubung jaminan sosial per jiwa: BPJS Kesehatan/KIS, BPJS Ketenagakerjaan, serta beasiswa KIP anak sekolah.\n- Dilengkapi AI Family Welfare Auditor untuk mendeteksi rasio beban ketergantungan dan status perlindungan keluarga.',
    quickLink: '/dashboard/kk'
  },
  {
    id: 'verifikasi_surat',
    title: 'SOP Verifikasi Surat RT/RW & SLA',
    category: 'Tata Kelola Jabatan',
    keywords: ['verifikasi', 'setujui surat', 'tolak surat', 'revisi surat', 'sla', 'tinjau berkas'],
    answer: 'Panduan Verifikasi Surat untuk Pengurus RT/RW:\n\n1. Buka Meja Kerja > Tab **Antrean Surat Warga**.\n2. Periksa kelengkapan berkas: identitas pemohon, kesesuaian NIK, dan dokumen pendukung.\n3. Opsi Keputusan: **Setujui** (langsung diteruskan berjenjang), **Minta Revisi** (sertakan catatan perbaikan), atau **Tolak** (apabila syarat tidak terpenuhi).\n4. Batas SLA Pelayanan Prima Kelurahan Kebonjati adalah **4 jam kerja** sejak diajukan.',
    quickLink: '/dashboard/rt'
  },
  {
    id: 'loket_dampingan',
    title: 'Loket Dampingan Warga Gaptek & Offline',
    category: 'Tata Kelola Jabatan',
    keywords: ['dampingan', 'loket dampingan', 'gaptek', 'offline', 'bantu warga', 'wakilkan'],
    answer: 'Fasilitas Loket Dampingan Surat untuk Warga Rentan / Tanpa Smartphone:\n\n1. Klik tombol **+ Loket Dampingan Warga** pada Meja Kerja Anda.\n2. Masukkan NIK warga yang dibantu â€” data nama & KK akan terisi otomatis.\n3. Pilih jenis surat yang dibutuhkan dan unggah berkas fisik bila ada.\n4. **Otorisasi Instan**: Jika diajukan Ketua RT, otomatis terverifikasi RT (langsung ke RW). Jika diajukan Ketua RW, otomatis terverifikasi RT & RW (langsung ke Kelurahan).',
    quickLink: '/dashboard/dokumen'
  },
  {
    id: 'bypass_darurat',
    title: 'Protokol Bypass Verifikasi Darurat RW',
    category: 'Tata Kelola Jabatan',
    keywords: ['bypass', 'darurat', 'jalur darurat', 'rt sakit', 'bypass rw'],
    answer: 'Ketentuan Penggunaan Jalur Darurat RW (*Emergency Bypass*):\n\n- Digunakan khusus saat Ketua RT sedang sakit keras, dinas luar kota, atau berhalangan mendesak demi melayani kebutuhan krusial warga (misal: rujukan RS darurat, beasiswa batas waktu).\n- Masuk ke Dashboard RW > Tab **Antrean di RT / Jalur Darurat** > Klik **Bypass RW (Darurat)**.\n- Masukkan PIN Pejabat 6 Digit dan pilih alasan resmi untuk menjaga transparansi audit trail.',
    quickLink: '/dashboard/rw'
  },
  {
    id: 'pbb_wilayah',
    title: 'Monitoring Kepatuhan PBB & e-SPPT',
    category: 'Keuangan Lingkungan',
    keywords: ['pbb', 'sppt', 'pajak', 'kepatuhan pbb', 'tunggakan pbb'],
    answer: 'Pengawasan Pajak Bumi & Bangunan (PBB) Kewilayahan:\n\n- Akses menu **Monitoring PBB** pada bilah samping atau dashboard analitik.\n- Anda dapat memantau persentase realisasi pembayaran PBB per RT (RT 001 - RT 005).\n- Warga yang belum lunas dapat diidentifikasi untuk sosialisasi e-SPPT dan kanal pembayaran digital.',
    quickLink: '/dashboard/pbb'
  },
  {
    id: 'analitik_wilayah',
    title: 'Dashboard Data Analitik & Looker Power BI',
    category: 'Analitik & Keputusan',
    keywords: ['analitik', 'power bi', 'looker', 'piramida', 'heatmap', 'demografi', 'statistik'],
    answer: 'Dashboard Data Analitik menyajikan visualisasi data eksekutif setara Power BI & Looker Studio:\n\n- **Piramida Penduduk Interaktif**: Distribusi usia dan gender per kohort.\n- **Heatmap Spasial Wilayah (RT 001 - RT 005)**: Kepadatan penduduk, sebaran desil 1-2, dan kepatuhan PBB.\n- **Analitik Layanan Surat**: Tren time-series volume pengajuan dan SLA kecepatan verifikasi.\n- Buka menu **Dashboard Data Analitik** untuk eksplorasi drill-down lengkap.',
    quickLink: '/dashboard/analitik'
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

  const handleSendMessage = (customText = null) => {
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
      } else if (query.includes('salam') || query.includes('halo') || query.includes('hai') || query.includes('sampurasun')) {
        replyText = 'Rampes! Senang bisa menyapa Anda kembali. Kanaya siap membantu urusan kependudukan, bansos, kas posyandu, hingga administrasi surat di Bumi Warga.';
      } else if (query.includes('terima kasih') || query.includes('makasih') || query.includes('nuhun')) {
        replyText = 'Sama-sama! Hatur nuhun telah memanfaatkan layanan digital Bumi Warga. Semoga urusan keluarga Anda selalu lancar dan berkah.';
      } else {
        replyText = `Terima kasih atas pertanyaannya. Terkait "${textToSend}", Anda dapat meninjau panduan resmi di Tab Ensiklopedia SOP atau langsung berkonsultasi dengan Pengurus RT setempat.\n\nAnda juga bisa memilih topik populer di bawah ini:`;
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
    }, 500);
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
                  Kanaya AI Assistant
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700">
                Sampurasun, <strong>{userName}</strong>! Butuh bantuan memeriksa KK Digital, BPJS, KIP, atau SOP pengajuan surat? Klik di sini untuk bertanya!
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

      {/* 2. SLIDE-IN KANAYA AI PANEL */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end print:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 border-l border-sky-100"
            >
              <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 text-white p-5 relative overflow-hidden flex-shrink-0">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
                      <Sparkles className="w-6 h-6 text-sky-200" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-lg text-white tracking-wide">Kanaya AI</h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-400/25 border border-sky-300/40 text-sky-100">
                          Asisten Warga
                        </span>
                      </div>
                      <p className="text-xs text-sky-100/90">Layanan & SOP Cerdas Bumi Warga</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-sky-100 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

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

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
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
                                Kanaya AI
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

                    <div className="pt-3">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-sky-500" />
                        {isOfficial ? 'Pintasan Tugas Pejabat RT/RW:' : 'Pertanyaan Populer Warga:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {isOfficial ? (
                          <>
                            <button
                              onClick={() => handleSendMessage('Bagaimana SOP verifikasi surat warga dan batas waktu SLA?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium"
                            >
                              âš¡ SOP Verifikasi & SLA
                            </button>
                            <button
                              onClick={() => handleSendMessage('Bagaimana cara menggunakan Loket Dampingan Warga gaptek?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium"
                            >
                              âœï¸ Loket Dampingan Warga
                            </button>
                            <button
                              onClick={() => handleSendMessage('Kapan Ketua RW boleh menggunakan Bypass Verifikasi Darurat?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium"
                            >
                              ðŸš¨ Bypass Darurat RW
                            </button>
                            <button
                              onClick={() => handleSendMessage('Bagaimana cara monitoring kepatuhan pembayaran PBB warga?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium"
                            >
                              ðŸ’° Monitoring PBB RT/RW
                            </button>
                            <button
                              onClick={() => handleSendMessage('Apa saja fitur yang ada di Dashboard Data Analitik Power BI / Looker?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors font-medium"
                            >
                              ðŸ“Š Dashboard Analitik
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleSendMessage('Bagaimana cara membuat Surat Keterangan Usaha (SKU)?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                            >
                              Cara Buat SKU
                            </button>
                            <button
                              onClick={() => handleSendMessage('Apa saja syarat pengajuan SKTM untuk beasiswa atau KIP?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                            >
                              SKTM Beasiswa / KIP
                            </button>
                            <button
                              onClick={() => handleSendMessage('Apa perbedaan Bansos APBN dan Bansos Muskel Kelurahan?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                            >
                              Bansos APBN vs Muskel
                            </button>
                            <button
                              onClick={() => handleSendMessage('Bagaimana cara mengajukan sanggah Desil DTSEN yang tidak sesuai?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                            >
                              Sanggah Desil DTSEN
                            </button>
                            <button
                              onClick={() => handleSendMessage('Bagaimana format resmi Kartu Keluarga Digital Kemendagri?')}
                              className="text-[11px] bg-white border border-sky-200 hover:bg-sky-50 text-sky-800 px-2.5 py-1 rounded-full transition-colors"
                            >
                              Format KK Digital & BPJS
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
                          placeholder="Tanyakan ke Kanaya seputar layanan warga..."
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

                {activeTab === 'audit' && (
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 rounded-lg bg-sky-100 text-sky-600">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-xs text-slate-900">Pemeriksaan Kesejahteraan Keluarga</h4>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
                        Sistem AI Kanaya membantu memeriksa kelengkapan data administrasi anggota keluarga termasuk status kepesertaan jaminan sosial dan pendidikan.
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
                            navigate('/dashboard/kk');
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

              <div className="p-3 bg-white border-t border-slate-200 text-center text-[10px] text-slate-400">
                Kanaya AI - Jabar Pintar Digital - Bumi Warga
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
