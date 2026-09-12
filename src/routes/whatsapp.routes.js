/**
 * src/routes/whatsapp.routes.js
 * API Endpoints for WhatsApp Gateway & Citizen Messaging Engine
 * Platform: Bumi Warga Enterprise (Jabar Pintar Digital)
 */

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const whatsappService = require('../services/whatsapp.service');

const router = express.Router();

// GET /api/whatsapp/status - Cek status koneksi dan kuota gateway
router.get('/status', requireAuth, async (req, res) => {
  try {
    const status = whatsappService.getGatewayStatus();
    res.json({ success: true, data: status });
  } catch (err) {
    console.error('Error fetching WhatsApp status:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat status WhatsApp Gateway' });
  }
});

// POST /api/whatsapp/send-test - Kirim pesan pengujian langsung dari dashboard
router.post('/send-test', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'ketua_rw'), async (req, res) => {
  try {
    const { phone, message, target_nama, event_type } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ success: false, message: 'Nomor telepon dan isi pesan wajib diisi' });
    }

    const result = await whatsappService.dispatchMessage({
      phone,
      message,
      nama: target_nama,
      eventType: event_type || 'TEST_DIRECT'
    });

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error sending test WhatsApp:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/whatsapp/send-surat - Notifikasi pengesahan surat digital
router.post('/send-surat', requireAuth, async (req, res) => {
  try {
    const { phone, nama, jenis_surat, nomor_surat, qr_code_hash, download_url } = req.body;
    const result = await whatsappService.sendSuratNotification({
      phone,
      nama,
      jenis_surat,
      nomor_surat,
      qr_code_hash,
      download_url
    });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error sending surat WhatsApp:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/whatsapp/send-bansos - Notifikasi penyaluran bansos
router.post('/send-bansos', requireAuth, async (req, res) => {
  try {
    const { phone, nama, jenis_bansos, nominal, jadwal_penyerahan, lokasi } = req.body;
    const result = await whatsappService.sendBansosNotification({
      phone,
      nama,
      jenis_bansos,
      nominal,
      jadwal_penyerahan,
      lokasi
    });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error sending bansos WhatsApp:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/whatsapp/logs - Riwayat pengiriman notifikasi WhatsApp
router.get('/logs', requireAuth, async (req, res) => {
  try {
    const { limit, target_phone } = req.query;
    const logs = await whatsappService.getDeliveryLogs({ limit, target_phone });
    res.json({ success: true, data: logs });
  } catch (err) {
    console.error('Error fetching WhatsApp logs:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat log WhatsApp' });
  }
});

module.exports = router;
