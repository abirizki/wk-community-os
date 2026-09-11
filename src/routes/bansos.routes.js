/**
 * src/routes/bansos.routes.js
 * API Endpoints for Tiered Social Assistance (Bansos) Management.
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const bansosService = require('../services/bansos.service');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/bansos - Ambil daftar usulan bansos sesuai scope pengguna
router.get('/', requireAuth, async (req, res) => {
  try {
    const list = await bansosService.listBansos(req.session.user, req.query);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/bansos/stats - Ringkasan statistik penerima bantuan sosial
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const stats = await bansosService.getBansosStats(req.session.user, req.query);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/bansos - Usulkan calon penerima bansos (RT/RW/Admin)
router.post('/', requireAuth, async (req, res) => {
  try {
    const newBansos = await bansosService.proposeBansos(req.body, req.session.user);
    res.status(201).json({
      success: true,
      message: 'Usulan penerima manfaat bantuan sosial berhasil didaftarkan.',
      data: newBansos
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// PATCH /api/bansos/:id/verify - Verifikasi berjenjang usulan bansos (RW / Kelurahan)
router.patch('/:id/verify', requireAuth, requireRole('ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'), async (req, res) => {
  try {
    const { action, catatan, nominal } = req.body;
    const result = await bansosService.verifyBansos(
      Number(req.params.id),
      req.session.user,
      action,
      catatan,
      nominal
    );
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/bansos/:id/disburse - Penyaluran Lapangan & Serah Terima (Foto Geotag GPS + Canvas Signature)
router.post('/:id/disburse', requireAuth, requireRole('ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'), async (req, res) => {
  try {
    const { foto_penyerahan_url, koordinat_lat_lng, tanda_tangan_penerima_url } = req.body;
    const result = await bansosService.disburseBansos(
      Number(req.params.id),
      { foto_penyerahan_url, koordinat_lat_lng, tanda_tangan_penerima_url },
      req.session.user
    );
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;

