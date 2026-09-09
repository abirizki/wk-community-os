/**
 * src/routes/warga.routes.js
 * Warga API endpoints.
 * Warga API endpoints with Scoped List, Assisted Offline Registration, and Bulk Import.
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const wargaService = require('../services/warga.service');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/warga (opsional: daftar warga dengan paginasi, butuh otentikasi)
router.get('/', async (req, res) => {
// GET /api/warga - Daftar warga dengan pagination, pencarian, dan scoping terpadu
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;
    
    const data = await wargaService.listWarga({ limit, offset });
    res.json({ success: true, data });
    const search = req.query.search || '';
    const rt = req.query.rt || null;
    const rw = req.query.rw || null;

    const data = await wargaService.listWarga({ limit, offset, search, rt, rw }, req.session.user);
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Error fetching list warga:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// GET /api/warga/:nik
router.get('/:nik', async (req, res) => {
// POST /api/warga/assisted - Mode Asistensi RT/RW untuk warga tanpa akses internet
router.post('/assisted', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt', 'admin'), async (req, res) => {
  try {
    const { nik } = req.params;
    const warga = await wargaService.getByNik(nik);
    
    const newWarga = await wargaService.registerAssistedWarga(req.body, req.session.user);
    res.status(201).json({
      success: true,
      message: `Warga ${newWarga.nama} berhasil didaftarkan melalui Asistensi RT/RW.`,
      data: newWarga
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/warga/bulk-import - Import Massal Sensus Warga (Excel / CSV)
router.post('/bulk-import', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin'), async (req, res) => {
  try {
    const records = req.body.records || req.body;
    const summary = await wargaService.bulkImportWarga(records, req.session.user);
    res.json({
      success: true,
      data: warga
      message: `Import massal selesai: ${summary.imported} warga berhasil ditambahkan, ${summary.skipped} dilewati.`,
      summary
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error fetching warga by NIK:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/warga/:nik - Detail profil warga
router.get('/:nik', requireAuth, async (req, res) => {
  try {
    const { nik } = req.params;
    const warga = await wargaService.getByNik(nik);
    res.json({ success: true, data: warga });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;

