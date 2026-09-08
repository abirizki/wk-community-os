/**
 * src/routes/kk.routes.js
 * Kartu Keluarga API endpoints.
 */

const express = require('express');
const kkService = require('../services/kk.service');

const router = express.Router();

// GET /api/kk/:noKk
router.get('/:noKk', async (req, res) => {
  try {
    const { noKk } = req.params;
    const kk = await kkService.getByNoKk(noKk);
    
    res.json({
      success: true,
      data: kk
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error fetching KK by No KK:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

module.exports = router;
