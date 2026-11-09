/**
 * src/routes/pengaduan.routes.js
 * Pengaduan API endpoints.
 */

const express = require('express');
const pengaduanService = require('../services/pengaduan.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/pengaduan - Buat pengaduan baru (wajib login)
router.post('/', requireAuth, async (req, res) => {
  try {
    // Ambil NIK dari data sesi (asumsi username adalah NIK)
    const nik_pelapor = req.session.user.username; 
    
    const payload = {
      nik_pelapor,
      judul: req.body.judul,
      deskripsi: req.body.deskripsi,
      kategori: req.body.kategori,
      lampiran_url: req.body.lampiran_url
    };

    const newPengaduan = await pengaduanService.createPengaduan(payload);
    
    res.status(201).json({
      success: true,
      message: 'Pengaduan berhasil dikirim',
      data: newPengaduan
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error creating pengaduan:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

// GET /api/pengaduan/me - Ambil pengaduan milik warga yang sedang login
router.get('/me', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.username;
    const pengaduanList = await pengaduanService.getByNik(nik);
    
    res.json({
      success: true,
      data: pengaduanList
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error fetching pengaduan by NIK:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

// GET /api/pengaduan - Ambil semua pengaduan warga ter-scope wilayah RT/RW
router.get('/', requireAuth, async (req, res) => {
  try {
    const pengaduanList = await pengaduanService.getAll(req.session.user);
    
    res.json({
      success: true,
      data: pengaduanList
    });
  } catch (error) {
    console.error('Error fetching all pengaduan:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// PATCH /api/pengaduan/:id/status - Tindak lanjut / mediasi pengaduan oleh RT/RW/Kelurahan
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;
    const result = await pengaduanService.updateStatus(id, { status, catatan_admin }, req.session.user);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;

