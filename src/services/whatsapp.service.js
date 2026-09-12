/**
 * src/services/whatsapp.service.js
 * Multi-Provider WhatsApp Gateway Service & Civic Notification Engine
 * Providers Supported: Fonnte API, WAHA (WhatsApp HTTP API), & High-Fidelity Simulator
 * Platform: Bumi Warga Enterprise (Jabar Pintar Digital)
 */

const pool = require('../db/pool');

// In-memory buffer fallback untuk log WhatsApp jika MySQL offline
const inMemoryWaLogs = [];

class WhatsAppService {
  /**
   * Normalisasi nomor telepon ke format internasional standar Indonesia (628xxxxxxxxxx)
   */
  formatPhoneNumber(phone) {
    if (!phone) return '';
    let cleaned = String(phone).replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  }

  /**
   * Mengambil status konfigurasi gateway WhatsApp saat ini
   */
  getGatewayStatus() {
    const fonnteToken = process.env.FONNTE_TOKEN;
    const wahaUrl = process.env.WAHA_URL;

    let activeProvider = 'SIMULATOR';
    let isConnected = true;

    if (fonnteToken) {
      activeProvider = 'FONNTE';
    } else if (wahaUrl) {
      activeProvider = 'WAHA';
    }

    return {
      provider: activeProvider,
      is_connected: isConnected,
      sender_number: process.env.WHATSAPP_SENDER_NUMBER || '0812-2223-2026 (Official Kelurahan)',
      total_sent_today: inMemoryWaLogs.length,
      quota_remaining: activeProvider === 'SIMULATOR' ? 'UNLIMITED_SANDBOX' : 1000
    };
  }

  /**
   * Mencatat riwayat pengiriman pesan ke database & in-memory buffer
   */
  async logMessage({ phone, nik, nama, eventType, message, provider, status, responsePayload }) {
    const logEntry = {
      id: inMemoryWaLogs.length + 1,
      target_phone: phone,
      target_nik: nik || null,
      target_nama: nama || null,
      event_type: eventType,
      pesan: message,
      provider: provider || 'SIMULATOR',
      status: status || 'SENT',
      response_payload: responsePayload || { status: true, message: 'Message queued/sent' },
      created_at: new Date().toISOString()
    };

    inMemoryWaLogs.unshift(logEntry);
    if (inMemoryWaLogs.length > 500) inMemoryWaLogs.pop();

    try {
      await pool.query(
        `INSERT INTO whatsapp_logs (target_phone, target_nik, target_nama, event_type, pesan, provider, status, response_payload)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logEntry.target_phone,
          logEntry.target_nik,
          logEntry.target_nama,
          logEntry.event_type,
          logEntry.pesan,
          logEntry.provider,
          logEntry.status,
          JSON.stringify(logEntry.response_payload)
        ]
      );
    } catch (err) {
      // Graceful in-memory fallback
    }

    return logEntry;
  }

  /**
   * Mengirim pesan teks langsung via Fonnte / WAHA / Simulator
   */
  async dispatchMessage({ phone, message, nik = null, nama = null, eventType = 'TEST_DIRECT' }) {
    const normalizedPhone = this.formatPhoneNumber(phone);
    if (!normalizedPhone || normalizedPhone.length < 10) {
      throw new Error('Nomor telepon tujuan tidak valid (minimal 10 digit)');
    }

    const fonnteToken = process.env.FONNTE_TOKEN;
    const wahaUrl = process.env.WAHA_URL;

    let provider = 'SIMULATOR';
    let sendStatus = 'SENT';
    let responseData = null;

    // 1. Jika Fonnte API terkonfigurasi
    if (fonnteToken) {
      provider = 'FONNTE';
      try {
        const response = await fetch('https://api.fonnte.com/send', {
          method: 'POST',
          headers: {
            'Authorization': fonnteToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            target: normalizedPhone,
            message: message,
            countryCode: '62'
          })
        });
        responseData = await response.json().catch(() => ({}));
        sendStatus = response.ok ? 'SENT' : 'FAILED';
      } catch (e) {
        sendStatus = 'FAILED';
        responseData = { error: e.message };
      }
    }
    // 2. Jika WAHA HTTP API terkonfigurasi
    else if (wahaUrl) {
      provider = 'WAHA';
      try {
        const response = await fetch(`${wahaUrl.replace(/\/+$/, '')}/api/sendText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: `${normalizedPhone}@c.us`,
            text: message,
            session: 'default'
          })
        });
        responseData = await response.json().catch(() => ({}));
        sendStatus = response.ok ? 'SENT' : 'FAILED';
      } catch (e) {
        sendStatus = 'FAILED';
        responseData = { error: e.message };
      }
    }
    // 3. Mode Simulator Berstandar Produksi
    else {
      provider = 'SIMULATOR';
      sendStatus = 'SENT';
      responseData = {
        status: true,
        provider: 'SIMULATOR_GATEWAY',
        message_id: `wa_msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        simulated_delivery: 'Delivered to WhatsApp Device'
      };
    }

    const log = await this.logMessage({
      phone: normalizedPhone,
      nik,
      nama,
      eventType,
      message,
      provider,
      status: sendStatus,
      responsePayload: responseData
    });

    return {
      success: sendStatus === 'SENT',
      message_id: log.id,
      target_phone: normalizedPhone,
      provider,
      status: sendStatus,
      timestamp: log.created_at
    };
  }

  /**
   * Notifikasi Pengesahan Surat Digital (dengan TTE QR Code)
   */
  async sendSuratNotification({ phone, nama, jenis_surat, nomor_surat, qr_code_hash, download_url }) {
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) return null;

    const message = 
`🏛️ *LAYANAN SURAT KELURAHAN BUMI WARGA*

Yth. Bpk/Ibu *${nama || 'Warga'}*,

Kabar baik! Permohonan surat keterangan Anda telah disetujui dan disahkan oleh Lurah:

📄 *Jenis Surat:* ${jenis_surat}
🔢 *Nomor Surat:* ${nomor_surat || '470/SKTM/2026'}
🔐 *Validasi TTE QR:* ${qr_code_hash ? qr_code_hash.substring(0, 16) + '...' : 'Terverifikasi Digital'}

Dokumen resmi siap diunduh secara mandiri:
🌐 ${download_url || 'https://bumiwarga.sukabumikota.go.id/dashboard/dokumen'}

_Terima kasih telah menggunakan Layanan Digital Mandiri Warga._
_Pemerintah Kelurahan Kebonjati, Kota Sukabumi_`;

    return await this.dispatchMessage({
      phone: formattedPhone,
      message,
      nama,
      eventType: 'SURAT_SELESAI'
    });
  }

  /**
   * Notifikasi Penyaluran Bantuan Sosial (Bansos Disbursed / Ready)
   */
  async sendBansosNotification({ phone, nama, jenis_bansos, nominal, jadwal_penyerahan, lokasi }) {
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) return null;

    const message = 
`🎁 *PEMBERITAHUAN BANTUAN SOSIAL (BANSOS)*

Yth. Bpk/Ibu *${nama || 'Penerima Manfaat'}*,

Keluarga Anda terdaftar sebagai penerima bantuan sosial:

📦 *Program Bansos:* ${jenis_bansos}
💰 *Nominal Bantuan:* Rp ${(nominal || 0).toLocaleString('id-ID')}
📅 *Jadwal Penyerahan:* ${jadwal_penyerahan || 'Sesuai Jadwal RW'}
📍 *Lokasi Pengambilan:* ${lokasi || 'Kantor Kelurahan / Pos RW Setempat'}

Harap membawa KTP-el asli dan Kartu Keluarga saat pengambilan.
_Sistem Informasi Kesejahteraan Sosial - Bumi Warga Enterprise_`;

    return await this.dispatchMessage({
      phone: formattedPhone,
      message,
      nama,
      eventType: 'BANSOS_PENYERAHAN'
    });
  }

  /**
   * Notifikasi Progres Tindak Lanjut Pengaduan Warga
   */
  async sendPengaduanNotification({ phone, nama, nomor_tiket, status_terbaru, catatan_petugas }) {
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) return null;

    const message = 
`📢 *PEMBARUAN STATUS PENGADUAN WARGA*

Yth. Bpk/Ibu *${nama || 'Pelapor'}*,

Laporan pengaduan Anda dengan nomor tiket:
🔖 *Tiket:* #${nomor_tiket}
⚙️ *Status Terbaru:* *${status_terbaru}*

📝 *Tindak Lanjut Petugas:*
"${catatan_petugas || 'Laporan telah divalidasi dan sedang dalam penanganan petugas teknis wilayah.'}"

Pantau penyelesaian aduan Anda di aplikasi Bumi Warga.
_Pusat Pengaduan & Ketertiban Wilayah Kelurahan_`;

    return await this.dispatchMessage({
      phone: formattedPhone,
      message,
      nama,
      eventType: 'PENGADUAN_UPDATE'
    });
  }

  /**
   * Pengingat Jadwal Posyandu Balita & Posyandu Lansia
   */
  async sendPosyanduReminder({ phone, nama, nama_posyandu, jadwal_tanggal, rt_rw }) {
    const formattedPhone = this.formatPhoneNumber(phone);
    if (!formattedPhone) return null;

    const message = 
`🩺 *PENGINGAT JADWAL POSYANDU KELURAHAN*

Yth. Bpk/Ibu *${nama || 'Keluarga'}*,

Jangan lewatkan jadwal pemeriksaan kesehatan rutin:
🏥 *Posyandu:* ${nama_posyandu || 'Posyandu Melati'}
📍 *Wilayah:* RT ${rt_rw || '001 / RW 001'}
🗓️ *Hari/Tanggal:* ${jadwal_tanggal || 'Sabtu, 08:00 - 11:30 WIB'}

Layanan meliputi: Penimbangan balita, imunisasi, pengukuran tensi & gula darah lansia.
_Kader Kesehatan Kelurahan Kebonjati - Jabar Pintar Digital_`;

    return await this.dispatchMessage({
      phone: formattedPhone,
      message,
      nama,
      eventType: 'POSYANDU_JADWAL'
    });
  }

  /**
   * Mengambil log audit riwayat pengiriman WhatsApp
   */
  async getDeliveryLogs({ limit = 30, target_phone = null }) {
    try {
      let query = 'SELECT * FROM whatsapp_logs ';
      const params = [];
      if (target_phone) {
        query += 'WHERE target_phone = ? ';
        params.push(this.formatPhoneNumber(target_phone));
      }
      query += 'ORDER BY id DESC LIMIT ?';
      params.push(parseInt(limit, 10) || 30);

      const [rows] = await pool.query(query, params);
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      // In-memory fallback
    }

    let filtered = inMemoryWaLogs;
    if (target_phone) {
      const cleanPhone = this.formatPhoneNumber(target_phone);
      filtered = filtered.filter(l => l.target_phone === cleanPhone);
    }
    return filtered.slice(0, parseInt(limit, 10) || 30);
  }
}

module.exports = new WhatsAppService();
