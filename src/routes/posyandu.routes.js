/**
 * src/routes/posyandu.routes.js
 * Posyandu API endpoints.
 */

const express = require('express');
const posyanduService = require('../services/posyandu.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/posyandu/me - Ambil riwayat posyandu milik keluarga yang sedang login
router.get('/me', requireAuth, async (req, res) => {
  try {
    // Ekstrak NIK mutlak dari sesi server demi privasi
    const nik = req.session.user.username; 
    
    const riwayat = await posyanduService.getHistoryByNik(nik);
    
    res.json({
      success: true,
      data: riwayat
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error fetching posyandu history by NIK:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

// POST /api/posyandu - Tambah catatan posyandu baru
router.post('/', requireAuth, async (req, res) => {
  try {
    // Sebagai perlindungan, pencatat dikunci menggunakan NIK dari sesi login aktif.
    const nik_warga = req.session.user.username;
    
    const payload = {
      nik_warga,
      nama_anak: req.body.nama_anak,
      umur_bulan: req.body.umur_bulan,
      berat_badan_kg: req.body.berat_badan_kg,
      tinggi_badan_cm: req.body.tinggi_badan_cm,
      tanggal_pemeriksaan: req.body.tanggal_pemeriksaan || new Date(),
      catatan_kesehatan: req.body.catatan_kesehatan
    };

    const newRecord = await posyanduService.createRecord(payload);
    
    res.status(201).json({
      success: true,
      message: 'Data Posyandu berhasil dicatat',
      data: newRecord
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error creating posyandu record:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

module.exports = router;

