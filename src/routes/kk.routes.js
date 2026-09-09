/**
 * src/routes/kk.routes.js
 * Kartu Keluarga API Endpoints
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const kkService = require('../services/kk.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/kk/my/card - Kartu Keluarga Digital untuk akun yang sedang login (Anti-IDOR)
router.get('/my/card', requireAuth, async (req, res) => {
  try {
    const card = await kkService.getMyFamilyCard(req.session.user);
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memuat Kartu Keluarga' });
  }
});

// GET /api/kk/:noKk - Cari KK spesifik (untuk petugas / admin)
router.get('/:noKk', requireAuth, async (req, res) => {
  try {
    const { noKk } = req.params;
    const kk = await kkService.getByNoKk(noKk);
    
    res.json({
      success: true,
      data: kk
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;
