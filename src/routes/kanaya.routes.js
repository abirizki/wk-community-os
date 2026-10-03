/**
 * src/routes/kanaya.routes.js
 * API Endpoints for Kanaya AI Reasoning Engine
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const router = express.Router();
const kanayaService = require('../services/kanaya.service');
const { requireAuth } = require('../middleware/auth.middleware');

// POST /api/ai/kanaya/chat - Interaksi reasoning AI Kanaya
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Pesan tidak boleh kosong' });
    }

    const result = await kanayaService.processQuery({
      message,
      user: req.session.user
    });

    res.json({
      success: true,
      reply: result.reply,
      action_chips: result.action_chips
    });
  } catch (error) {
    console.error('[KanayaRoutes] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ai/kanaya/quick-prompts - Saran pertanyaan cepat
router.get('/quick-prompts', (req, res) => {
  res.json({
    success: true,
    prompts: [
      'Siapa nama Lurah, Babinsa, dan Bhabinkamtibmas Kebonjati?',
      'Berapa nomor kontak Ketua RT 001 dan RW 001?',
      'Bagaimana alur pengajuan Surat Keterangan Domisili?',
      'Bagaimana cara mendaftarkan UMKM melalui SKU?'
    ]
  });
});

module.exports = router;
