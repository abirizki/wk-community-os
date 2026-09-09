/**
 * src/routes/posyandu.routes.js
 * Posyandu API endpoints.
 * Comprehensive Posyandu API endpoints (Balita & Lansia Integratif).
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const posyanduService = require('../services/posyandu.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/posyandu/me - Ambil riwayat posyandu milik keluarga yang sedang login
// ==========================================
// BALITA ENDPOINTS
// ==========================================

// GET /api/posyandu/me - Riwayat balita milik persona keluarga aktif
router.get('/me', requireAuth, async (req, res) => {
  try {
    // Ekstrak NIK mutlak dari sesi server demi privasi
    const nik = req.session.user.username; 
    
    const nik = req.session.user.active_nik || req.session.user.username;
    const riwayat = await posyanduService.getHistoryByNik(nik);
    
    res.json({
    res.json({ success: true, data: riwayat });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/posyandu/balita - Daftar balita berhierarki (Kader, RT, RW, Kelurahan)
router.get('/balita', requireAuth, async (req, res) => {
  try {
    const list = await posyanduService.listBalita(req.session.user, req.query);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/posyandu/balita/stats - Statistik gizi & stunting balita
router.get('/balita/stats', requireAuth, async (req, res) => {
  try {
    const stats = await posyanduService.getBalitaStats(req.session.user, req.query);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/posyandu & POST /api/posyandu/balita - Tambah catatan posyandu balita baru
const handleCreateBalita = async (req, res) => {
  try {
    const newRecord = await posyanduService.createRecord(req.body, req.session.user);
    res.status(201).json({
      success: true,
      data: riwayat
      message: 'Data pemeriksaan Balita berhasil disimpan',
      data: newRecord
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error fetching posyandu history by NIK:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

router.post('/', requireAuth, handleCreateBalita);
router.post('/balita', requireAuth, handleCreateBalita);

// ==========================================
// LANSIA ENDPOINTS
// ==========================================

// GET /api/posyandu/lansia - Daftar lansia beserta rekam medis terbaru
router.get('/lansia', requireAuth, async (req, res) => {
  try {
    const list = await posyanduService.listLansia(req.session.user, req.query);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/posyandu - Tambah catatan posyandu baru
router.post('/', requireAuth, async (req, res) => {
// GET /api/posyandu/lansia/my - Lansia milik keluarga yang sedang login
router.get('/lansia/my', requireAuth, async (req, res) => {
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
    const familyLansia = await posyanduService.getFamilyLansia(req.session.user);
    res.json({ success: true, data: familyLansia });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

    const newRecord = await posyanduService.createRecord(payload);
    
// GET /api/posyandu/lansia/stats - Statistik kesehatan lansia (Hipertensi, GDS, ADL)
router.get('/lansia/stats', requireAuth, async (req, res) => {
  try {
    const stats = await posyanduService.getLansiaStats(req.session.user, req.query);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/posyandu/lansia/history/:id - Riwayat detail pemeriksaan satu lansia
router.get('/lansia/history/:id', requireAuth, async (req, res) => {
  try {
    const history = await posyanduService.getLansiaHistory(req.params.id);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/posyandu/lansia - Daftarkan lansia baru ke database Posyandu Lansia
router.post('/lansia', requireAuth, async (req, res) => {
  try {
    const newLansia = await posyanduService.registerLansia(req.body, req.session.user);
    res.status(201).json({
      success: true,
      message: 'Data Posyandu berhasil dicatat',
      data: newRecord
      message: 'Lansia berhasil didaftarkan ke Posyandu Lansia',
      data: newLansia
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error creating posyandu record:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/posyandu/lansia/pemeriksaan - Catat rekam medis pemeriksaan lansia baru
router.post('/lansia/pemeriksaan', requireAuth, async (req, res) => {
  try {
    const newPemeriksaan = await posyanduService.recordPemeriksaanLansia(req.body, req.session.user);
    res.status(201).json({
      success: true,
      message: 'Pemeriksaan Posyandu Lansia berhasil dicatat',
      data: newPemeriksaan
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;

