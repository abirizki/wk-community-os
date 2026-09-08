/**
 * src/routes/warga.routes.js
 * Warga API endpoints.
 */

const express = require('express');
const wargaService = require('../services/warga.service');

const router = express.Router();

// GET /api/warga (opsional: daftar warga dengan paginasi, butuh otentikasi)
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;
    
    const data = await wargaService.listWarga({ limit, offset });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching list warga:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// GET /api/warga/:nik
router.get('/:nik', async (req, res) => {
  try {
    const { nik } = req.params;
    const warga = await wargaService.getByNik(nik);
    
    res.json({
      success: true,
      data: warga
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error fetching warga by NIK:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

module.exports = router;
