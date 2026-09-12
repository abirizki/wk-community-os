import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  FileCheck2,
  Gift,
  HeartPulse,
  Radio,
  Copy,
  ExternalLink,
  MessageCircle,
  Hash,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function WhatsAppGatewayPage() {
  const { user } = useAuth();
  const [gatewayStatus, setGatewayStatus] = useState({
    provider: 'SIMULATOR',
    is_connected: true,
    sender_number: '0812-2223-2026 (Official Kelurahan)',
    total_sent_today: 0,
    quota_remaining: 'UNLIMITED_SANDBOX'
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [recipientPhone, setRecipientPhone] = useState('081234567890');
  const [recipientNama, setRecipientNama] = useState('Budi Santoso');
  const [selectedTemplate, setSelectedTemplate] = useState('surat');
  const [messageText, setMessageText] = useState('');

  // Presets
  const templates = {
    surat: `🏛️ *LAYANAN SURAT KELURAHAN BUMI WARGA*\n\nYth. Bpk/Ibu *Budi Santoso*,\n\nKabar baik! Permohonan surat keterangan Anda telah disetujui dan disahkan oleh Lurah:\n\n📄 *Jenis Surat:* Surat Keterangan Tidak Mampu (SKTM)\n🔢 *Nomor Surat:* 470/08/SKTM/KBJ/2026\n🔐 *Validasi TTE QR:* 9f86d081884c7d65...\n\nDokumen resmi siap diunduh secara mandiri:\n🌐 https://bumiwarga.sukabumikota.go.id/dashboard/dokumen\n\n_Terima kasih telah menggunakan Layanan Digital Mandiri Warga._\n_Pemerintah Kelurahan Kebonjati, Kota Sukabumi_`,
    bansos: `🎁 *PEMBERITAHUAN BANTUAN SOSIAL (BANSOS)*\n\nYth. Bpk/Ibu *Budi Santoso*,\n\nKeluarga Anda terdaftar sebagai penerima manfaat bantuan sosial:\n\n📦 *Program Bansos:* PKH Triwulan III\n💰 *Nominal Bantuan:* Rp 750.000\n📅 *Jadwal Penyerahan:* Jumat, 09:30 WIB\n📍 *Lokasi Pengambilan:* Balai RW 001 Kelurahan Kebonjati\n\nHarap membawa KTP-el asli dan Kartu Keluarga saat pengambilan.\n_Sistem Informasi Kesejahteraan Sosial - Bumi Warga Enterprise_`,
    pengaduan: `📢 *PEMBARUAN STATUS PENGADUAN WARGA*\n\nYth. Bpk/Ibu *Budi Santoso*,\n\nLaporan pengaduan Anda dengan nomor tiket:\n🔖 *Tiket:* #ADUAN-2026-0042\n⚙️ *Status Terbaru:* *DALAM TINDAK LANJUT*\n\n📝 *Tindak Lanjut Petugas:*\n"Petugas seksi kebersihan telah meninjau lokasi penumpukan sampah di Jl. Kebonjati RT 001 dan armada pengangkut sedang menuju lokasi."\n\n_Pusat Pengaduan & Ketertiban Wilayah Kelurahan_`,
    posyandu: `🩺 *PENGINGAT JADWAL POSYANDU KELURAHAN*\n\nYth. Bpk/Ibu *Budi Santoso*,\n\nJangan lewatkan jadwal pemeriksaan kesehatan rutin keluarga Anda:\n🏥 *Posyandu:* Posyandu Melati RW 001\n📍 *Wilayah:* RT 001 / RW 001\n🗓️ *Hari/Tanggal:* Sabtu, 08:30 - 11:30 WIB\n\nLayanan: Penimbangan balita, pemberian vitamin A, dan pemeriksaan tensi/gula darah lansia.\n_Kader Kesehatan Kelurahan Kebonjati - Jabar Pintar Digital_`
  };

  useEffect(() => {
    setMessageText(templates[selectedTemplate]);
  }, [selectedTemplate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, logsRes] = await Promise.allSettled([
        api.get('/whatsapp/status'),
        api.get('/whatsapp/logs?limit=20')
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value?.data) {
        setGatewayStatus(statusRes.value.data);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value?.data) {
        setLogs(logsRes.value.data);
      }
    } catch (e) {
      console.warn('Gagal memuat data WhatsApp gateway:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendTest = async (e) => {
    e.preventDefault();
    setSending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.post('/whatsapp/send-test', {
        phone: recipientPhone,
        target_nama: recipientNama,
        message: messageText,
        event_type: selectedTemplate === 'surat' ? 'SURAT_SELESAI' :
                    selectedTemplate === 'bansos' ? 'BANSOS_PENYERAHAN' :
                    selectedTemplate === 'pengaduan' ? 'PENGADUAN_UPDATE' : 'POSYANDU_JADWAL'
      });

      if (res?.success) {
        setSuccessMsg(`Pesan WhatsApp berhasil dikirim ke ${res.data.target_phone}!`);
        fetchData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengirim pesan WhatsApp');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ══════════════════════════════════════
          HERO BANNER
         ══════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-6 lg:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                <MessageSquare size={13} className="animate-pulse" />
                WhatsApp Civic Notifications
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20">
                <ShieldCheck size={13} />
                Multi-Provider (Fonnte / WAHA / Simulator)
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              Pusat Notifikasi & WhatsApp Gateway Warga
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-2xl">
              Pengiriman notifikasi otomatis langsung ke ponsel warga saat surat selesai, bantuan sosial siap salur, aduan ditindaklanjuti, dan jadwal Posyandu.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Segarkan Status
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STATUS ALERTS
         ══════════════════════════════════════ */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ══════════════════════════════════════
          GATEWAY KPI CARDS
         ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Provider Aktif</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              CONNECTED
            </span>
          </div>
          <p className="text-xl font-bold text-on-surface mt-2 flex items-center gap-2">
            <Radio size={20} className="text-emerald-600 animate-pulse" />
            {gatewayStatus.provider}
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">Status Gateway Normal (42ms)</p>
        </div>

        <div className="p-4 rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Nomor Pengirim Resmi</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
              OFFICIAL
            </span>
          </div>
          <p className="text-sm font-bold text-on-surface mt-2 flex items-center gap-2 truncate">
            <Smartphone size={18} className="text-teal-600 flex-shrink-0" />
            {gatewayStatus.sender_number}
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">Centang Hijau Layanan Publik</p>
        </div>

        <div className="p-4 rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Pesan Terkirim Hari Ini</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              REAL-TIME
            </span>
          </div>
          <p className="text-xl font-bold text-on-surface mt-2 flex items-center gap-2">
            <MessageCircle size={20} className="text-blue-600" />
            {gatewayStatus.total_sent_today} Pesan
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">Tingkat keberhasilan kirim 100%</p>
        </div>

        <div className="p-4 rounded-xl border border-outline-variant bg-surface shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-on-surface-variant">Sisa Kuota Gateway</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
              ACTIVE
            </span>
          </div>
          <p className="text-xl font-bold text-on-surface mt-2 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            {gatewayStatus.quota_remaining}
          </p>
          <p className="text-xs text-on-surface-variant/80 mt-1">Auto-Renewal Terjadwal</p>
        </div>
      </div>

      {/* ══════════════════════════════════════
          SIMULATOR DISPATCHER & MESSAGE PREVIEW
         ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Pengiriman Uji Coba (Col 6) */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant pb-3">
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Send size={18} className="text-emerald-600" />
              Simulator Kirim Pesan Cepat
            </h2>
            <span className="text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
              Live Dispatch
            </span>
          </div>

          {/* Template Selector */}
          <div>
            <label className="text-xs font-semibold text-on-surface block mb-1.5">
              Pilih Kategori Pesan Otomatis:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedTemplate('surat')}
                className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedTemplate === 'surat'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <FileCheck2 size={16} />
                <span>Surat Selesai</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('bansos')}
                className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedTemplate === 'bansos'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <Gift size={16} />
                <span>Salur Bansos</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('pengaduan')}
                className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedTemplate === 'pengaduan'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <MessageSquare size={16} />
                <span>Aduan Update</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate('posyandu')}
                className={`p-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedTemplate === 'posyandu'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                    : 'bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <HeartPulse size={16} />
                <span>Posyandu</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSendTest} className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Nomor WhatsApp Penerima
                </label>
                <input
                  type="text"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  required
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-on-surface block mb-1">
                  Nama Warga
                </label>
                <input
                  type="text"
                  value={recipientNama}
                  onChange={(e) => setRecipientNama(e.target.value)}
                  placeholder="Nama Lengkap"
                  className="w-full h-10 px-3 rounded-lg border border-outline-variant bg-surface text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface block mb-1">
                Isi Pesan WhatsApp (Mendukung Markdown WhatsApp *tebal*, _miring_):
              </label>
              <textarea
                rows={7}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                required
                className="w-full p-3 rounded-lg border border-outline-variant bg-surface font-sans text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={sending || !recipientPhone || !messageText}
              className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {sending ? (
                <><RefreshCw size={15} className="animate-spin" /> Mengirim Pesan WhatsApp...</>
              ) : (
                <><Send size={15} /> Kirimkan Sekarang via Gateway</>
              )}
            </button>
          </form>
        </div>

        {/* Visual Preview Handphone WhatsApp (Col 6) */}
        <div className="lg:col-span-6 p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant pb-3 mb-3">
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-600" />
                Pratinjau Tampilan di Gawai Warga
              </h2>
              <span className="text-[11px] text-on-surface-variant font-mono">
                {recipientPhone || '628xxxx'}
              </span>
            </div>

            {/* Mock Chat Bubble WhatsApp */}
            <div className="rounded-2xl p-4 bg-[#e5ddd5] dark:bg-slate-900 border border-outline-variant max-w-md mx-auto shadow-inner space-y-3">
              <div className="flex items-center gap-2 bg-[#075e54] text-white p-2.5 rounded-xl shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  BW
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">Kelurahan Kebonjati Official</p>
                  <p className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Online
                  </p>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700 text-xs text-on-surface whitespace-pre-wrap font-sans leading-relaxed">
                {messageText}
                <div className="flex items-center justify-end gap-1 text-[10px] text-on-surface-variant/70 mt-2">
                  <span>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-emerald-600 font-bold">✓✓</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-outline-variant text-center text-xs text-on-surface-variant">
            Pesan terkirim menggunakan integrasi resmi WhatsApp Business API Gateway
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DELIVERY AUDIT TRAIL TABLE
         ══════════════════════════════════════ */}
      <div className="p-6 rounded-2xl border border-outline-variant bg-surface space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <Clock size={18} className="text-emerald-600" />
              Riwayat Pengiriman Pesan (*Delivery Audit Trail*)
            </h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Seluruh transaksi notifikasi keluar dicatat secara kronologis untuk audit transparansi dan kendali mutu layanan.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            className="px-3 py-1.5 rounded-lg border border-outline-variant text-xs font-semibold hover:bg-surface-container flex items-center gap-1.5"
          >
            <RefreshCw size={12} /> Segarkan Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant font-semibold">
              <tr>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">No. Tujuan</th>
                <th className="py-2.5 px-3">Nama Penerima</th>
                <th className="py-2.5 px-3">Jenis Event</th>
                <th className="py-2.5 px-3">Pratinjau Pesan</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant/60">
                    Belum ada riwayat pengiriman pesan WhatsApp
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/50">
                    <td className="py-2.5 px-3 whitespace-nowrap text-on-surface-variant">
                      {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-on-surface">
                      {log.target_phone}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-on-surface">
                      {log.target_nama || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-semibold">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px]">
                        {log.event_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-on-surface-variant max-w-xs truncate">
                      {log.pesan}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-on-surface-variant">
                      {log.provider}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        log.status === 'SENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
