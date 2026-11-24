/**
 * src/routes/kanaya.routes.js
 * API Endpoints for Kanaya AI Reasoning Engine
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const kanayaService = require('../services/kanaya.service');
const { BUMI_WARGA_SOP_REGISTRY } = require('../services/kanaya.sop');
const { requireAuth } = require('../middleware/auth.middleware');

// GET /api/ai/kanaya/sop - Single Source of Truth SOP Knowledge Catalog
router.get('/sop', (req, res) => {
  res.json({
    success: true,
    data: BUMI_WARGA_SOP_REGISTRY
  });
});

// POST /api/ai/kanaya/chat - Interaksi reasoning AI Kanaya (Mendukung Tamu Publik & Sesi Terdaftar)
router.post('/chat', async (req, res) => {
  const reqId = crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
  try {
    const { message, history } = req.body;

    // 1. Validasi Ketat Message (1 - 2000 karakter)
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Pesan wajib berupa teks (string) dan tidak boleh kosong.',
        request_id: reqId
      });
    }

    const trimmedMsg = message.trim();
    if (trimmedMsg.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Pesan tidak boleh hanya berisi spasi kosong.',
        request_id: reqId
      });
    }

    if (trimmedMsg.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Pesan melebihi batas maksimum 2000 karakter.',
        request_id: reqId
      });
    }

    // 2. Validasi History (Maksimal 8 turn terakhir)
    let sanitizedHistory = [];
    if (Array.isArray(history)) {
      sanitizedHistory = history.slice(-8).map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: typeof h.content === 'string' ? h.content.substring(0, 1000) : ''
      }));
    }

    // 3. Keamanan: Role dan Scope HANYA diambil dari req.session.user jika login, atau default guest aman
    const sessionUser = req.session && req.session.user;
    const userPrincipal = sessionUser ? {
      id: sessionUser.id,
      username: sessionUser.username,
      nama: sessionUser.nama,
      role: sessionUser.role,
      active_nik: sessionUser.active_nik,
      no_kk: sessionUser.no_kk,
      rt: sessionUser.rt,
      rw: sessionUser.rw,
      kelurahan: sessionUser.kelurahan,
      kecamatan: sessionUser.kecamatan,
      kota: sessionUser.kota
    } : {
      id: null,
      username: 'tamu',
      nama: 'Wargi',
      role: 'guest',
      active_nik: null,
      no_kk: null,
      rt: null,
      rw: null,
      kelurahan: null,
      kecamatan: null,
      kota: null
    };

    const result = await kanayaService.processQuery({
      message: trimmedMsg,
      history: sanitizedHistory,
      user: userPrincipal
    });

    res.json({
      success: true,
      reply: result.reply,
      action_chips: result.action_chips,
      answer_meta: {
        ...result.answer_meta,
        request_id: reqId
      }
    });
  } catch (error) {
    console.error(`[KanayaRoutes][${reqId}] Error processing chat:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Layanan Kanaya sedang mengalami kendala. Silakan coba sesaat lagi.',
      request_id: reqId
    });
  }
});

// GET /api/ai/kanaya/quick-prompts - Saran pertanyaan cepat adaptif berdasarkan role
router.get('/quick-prompts', (req, res) => {
  const sessionUser = req.session && req.session.user;
  const role = sessionUser ? (sessionUser.role || 'warga').toLowerCase() : 'guest';

  let prompts = [];
  if (role === 'guest') {
    prompts = [
      'Bagaimana cara aktivasi akun dengan Kupon RT?',
      'Apa yang harus dilakukan jika lupa kata sandi?',
      'Apa saja syarat Surat Keterangan Usaha (SKU)?',
      'Bagaimana cara daftar bantuan sosial (bansos)?'
    ];
  } else if (role === 'warga') {
    prompts = [
      'Surat pengajuan saya sudah sampai mana?',
      'Bagaimana cara mengajukan Surat Keterangan Usaha (SKU)?',
      'Apa saja syarat SKTM untuk beasiswa anak?',
      'Apakah keluarga saya terdaftar sebagai penerima bansos?',
      'Siapa nomor kontak Ketua RT dan RW saya?'
    ];
  } else if (role === 'ketua_rt') {
    prompts = [
      'Berapa berkas surat yang sedang menunggu verifikasi RT saya?',
      'Siapa nomor kontak Babinsa dan Bhabinkamtibmas?',
      'Bagaimana prosedur ground check sanggah desil warga?',
      'Bagaimana alur pengesahan surat pengantar nikah?'
    ];
  } else if (role === 'ketua_rw') {
    prompts = [
      'Apakah ada berkas antrean yang menunggu rekomendasi RW?',
      'Berapa ringkasan statistik warga dan bansos di RW saya?',
      'Kontak koordinasi aparatur tiga pilar kelurahan'
    ];
  } else if (role === 'kader_posyandu') {
    prompts = [
      'Bagaimana standar pencatatan KMS Balita & Posbindu Lansia?',
      'Kriteria berat badan dan deteksi dini risiko stunting',
      'Jadwal imunisasi dan koordinasi rujukan ke Puskesmas'
    ];
  } else if (['admin_kelurahan', 'lurah', 'walikota'].includes(role)) {
    prompts = [
      'Bagaimana ringkasan analitik dan capaian pelayanan kelurahan?',
      'Berapa volume pengajuan surat tersertifikasi TTE SPBE bulan ini?',
      'Tampilkan indeks kematangan data dan kelengkapan profil warga'
    ];
  } else {
    prompts = [
      'Siapa nama Lurah, Babinsa, dan Bhabinkamtibmas?',
      'Bagaimana alur pengajuan Surat Keterangan Usaha (SKU)?',
      'Bagaimana format resmi Kartu Keluarga Digital Kemendagri?',
      'Apa perbedaan Bansos APBN dan Bansos Muskel Kelurahan?'
    ];
  }

  res.json({
    success: true,
    role,
    prompts
  });
});

module.exports = router;
