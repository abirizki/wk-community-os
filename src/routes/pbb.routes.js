/**
 * src/routes/pbb.routes.js
 * PBB API endpoints.
 */

const express = require('express');
const pbbService = require('../services/pbb.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/pbb/me - Ambil tagihan PBB milik warga yang login
router.get('/me', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.username; // NIK diekstrak dari sesi server
    const tagihan = await pbbService.getTagihanByNik(nik);
    
    res.json({
      success: true,
      data: tagihan
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error fetching PBB by NIK:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

// PUT /api/pbb/pay - Simulasi pembayaran PBB
router.put('/pay', requireAuth, async (req, res) => {
  try {
    const nikPelapor = req.session.user.username;
    const { nop, tahun } = req.body;
    
    const result = await pbbService.bayarTagihan(nop, tahun, nikPelapor);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error paying PBB:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

module.exports = router;

