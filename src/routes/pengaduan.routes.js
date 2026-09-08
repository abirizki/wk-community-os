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

// GET /api/pengaduan - Ambil semua pengaduan (misal untuk admin)
router.get('/', requireAuth, async (req, res) => {
  try {
    // Di aplikasi nyata, Anda mungkin memvalidasi apakah req.session.user.role === 'admin' di sini
    // menggunakan middleware `requireAdmin`
    const pengaduanList = await pengaduanService.getAll();
    
    res.json({
      success: true,
      data: pengaduanList
    });
  } catch (error) {
    console.error('Error fetching all pengaduan:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;
