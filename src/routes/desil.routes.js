/**
 * src/routes/desil.routes.js
 * API Endpoints for Desil Kesejahteraan Warga (DTSEN BPS & Kemensos)
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const express = require('express');
const desilService = require('../services/desil.service');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/desil/my-family - Status Desil Keluarga Warga
router.get('/my-family', requireAuth, async (req, res) => {
  try {
    const data = await desilService.getMyFamilyDesil(req.session.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/desil/draft - Simpan Kuesioner Awal Indikator DTSEN Mandiri
router.post('/draft', requireAuth, async (req, res) => {
  try {
    const data = await desilService.saveDraft(req.body, req.session.user);
    res.json({ success: true, message: 'Draft usulan indikator desil berhasil disimpan.', data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// POST /api/desil/submit-update - Ajukan Permohonan Pengesahan Desil + Bukti Kementerian
router.post('/submit-update', requireAuth, async (req, res) => {
  try {
    const data = await desilService.submitUpdateWithBukti(req.body, req.session.user);
    res.json({ success: true, message: 'Permohonan update desil berhasil diajukan ke kelurahan.', data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/desil/list - Daftar Status Desil Keluarga (RT / RW / Kelurahan)
router.get('/list', requireAuth, async (req, res) => {
  try {
    const filters = {
      rt: req.query.rt,
      rw: req.query.rw,
      status_verifikasi: req.query.status_verifikasi,
      desil: req.query.desil,
      search: req.query.search
    };
    const data = await desilService.listDesil(filters, req.session.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/desil/stats - Statistik Sebaran Desil Kewilayahan
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const data = await desilService.getDesilStats(req.session.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/desil/:id/verify - Pengesahan Status Desil oleh Admin Kelurahan
router.patch('/:id/verify', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin'), async (req, res) => {
  try {
    const { status, desilFinal, catatan } = req.body;
    const data = await desilService.verifyDesil(req.params.id, { status, desilFinal, catatan }, req.session.user);
    res.json({ success: true, message: `Status desil berhasil diperbarui menjadi ${status}.`, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;

