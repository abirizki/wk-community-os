/**
 * src/routes/dokumen.routes.js
 * Dokumen Request API endpoints (Pelayanan Surat Kelurahan).
 */

const express = require('express');
const dokumenService = require('../services/dokumen.service');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/dokumen - Warga mengajukan permohonan surat baru
router.post('/', requireAuth, async (req, res) => {
  try {
    const nik_pemohon = req.session.user.username;
    const { jenis_dokumen, keperluan } = req.body;

    const newDoc = await dokumenService.requestDokumen({
      nik_pemohon,
      jenis_dokumen,
      keperluan
    });

    res.status(201).json({
      success: true,
      message: 'Permohonan surat berhasil diajukan',
      data: newDoc
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error requesting dokumen:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

// GET /api/dokumen/me - Warga melihat riwayat permohonan surat miliknya
router.get('/me', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.username;
    const docs = await dokumenService.getByNik(nik);
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    console.error('Error fetching my dokumen:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// GET /api/dokumen - Operator/Admin melihat semua permohonan surat warga
router.get('/', requireAuth, async (req, res) => {
  try {
    const docs = await dokumenService.getAll();
    res.json({
      success: true,
      data: docs
    });
  } catch (error) {
    console.error('Error fetching all dokumen:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// PATCH /api/dokumen/:id/status - Operator/Admin update status verifikasi dokumen
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin, file_hasil } = req.body;

    const updated = await dokumenService.updateStatus(Number(id), status, catatan_admin, file_hasil);
    res.json({
      success: true,
      message: `Status permohonan berhasil diubah menjadi ${status}`,
      data: updated
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error updating dokumen status:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

module.exports = router;

