/**
 * src/routes/dokumen.routes.js
 * Dokumen Request API endpoints (Pelayanan Surat Kelurahan).
 * Dokumen Request API endpoints (Pelayanan Surat Kelurahan & Event Triggers).
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const dokumenService = require('../services/dokumen.service');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/dokumen/prefill-data - AI Auto-Fill Data Profil Warga
router.get('/prefill-data', requireAuth, async (req, res) => {
  try {
    const data = await dokumenService.getPrefillData(req.session.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/dokumen - Warga mengajukan permohonan surat baru
router.post('/', requireAuth, async (req, res) => {
  try {
    const newDoc = await dokumenService.requestDokumen(req.body, req.session.user);
    res.status(201).json({
      success: true,
      message: 'Permohonan surat berhasil diajukan.',
      data: newDoc
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/dokumen/me - Warga melihat riwayat permohonan surat miliknya & keluarganya
router.get('/me', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.active_nik || req.session.user.username;
    const docs = await dokumenService.getByNik(nik);
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    console.error('Error fetching my dokumen:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/dokumen - Operator/Admin melihat semua permohonan surat warga
// GET /api/dokumen - Operator/RT/RW/Admin melihat permohonan surat sesuai hierarki
router.get('/', requireAuth, async (req, res) => {
  try {
    const docs = await dokumenService.getAll();
    if (req.session.user.role === 'warga') {
      const nik = req.session.user.active_nik || req.session.user.username;
      const docs = await dokumenService.getByNik(nik);
      return res.json({ success: true, data: docs });
    }

    const docs = await dokumenService.listByScope(req.session.user, req.query);
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    console.error('Error fetching all dokumen:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// PATCH /api/dokumen/:id/status - Operator/Admin update status verifikasi dokumen
router.patch('/:id/status', requireAuth, async (req, res) => {
// PATCH /api/dokumen/:id/approve - Persetujuan berjenjang (RT -> RW -> Kelurahan)
router.patch('/:id/approve', requireAuth, requireRole('ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin, file_hasil } = req.body;
    const { catatan } = req.body;
    const result = await dokumenService.approveDokumen(Number(req.params.id), req.session.user, catatan);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

    const updated = await dokumenService.updateStatus(Number(id), status, catatan_admin, file_hasil);
    res.json({
      success: true,
      message: `Status permohonan berhasil diubah menjadi ${status}`,
      data: updated
    });
// PATCH /api/dokumen/:id/reject - Penolakan permohonan surat
router.patch('/:id/reject', requireAuth, requireRole('ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'), async (req, res) => {
  try {
    const { catatan } = req.body;
    const result = await dokumenService.rejectDokumen(Number(req.params.id), req.session.user, catatan);
    res.json(result);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error updating dokumen status:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// PATCH /api/dokumen/:id/status - Kompatibilitas mundur
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status, catatan_admin } = req.body;
    if (status === 'APPROVED') {
      const result = await dokumenService.approveDokumen(Number(req.params.id), req.session.user, catatan_admin);
      return res.json(result);
    } else if (status === 'REJECTED') {
      const result = await dokumenService.rejectDokumen(Number(req.params.id), req.session.user, catatan_admin);
      return res.json(result);
    }
    res.json({ success: true, message: `Status diperbarui menjadi ${status}` });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;

