/**
 * src/routes/posyandu.routes.js
 * Comprehensive Posyandu API endpoints (Balita & Lansia Integratif).
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const posyanduService = require('../services/posyandu.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// ==========================================
// BALITA ENDPOINTS
// ==========================================

// GET /api/posyandu/me - Riwayat balita milik persona keluarga aktif
router.get('/me', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.active_nik || req.session.user.username;
    const riwayat = await posyanduService.getHistoryByNik(nik);
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
      message: 'Data pemeriksaan Balita berhasil disimpan',
      data: newRecord
    });
  } catch (error) {
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

// GET /api/posyandu/lansia/my - Lansia milik keluarga yang sedang login
router.get('/lansia/my', requireAuth, async (req, res) => {
  try {
    const familyLansia = await posyanduService.getFamilyLansia(req.session.user);
    res.json({ success: true, data: familyLansia });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

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
      message: 'Lansia berhasil didaftarkan ke Posyandu Lansia',
      data: newLansia
    });
  } catch (error) {
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

// ==========================================
// FASE 1 & 2: PROFIL KADER & PENCARIAN CERDAS WARGA TARGET
// ==========================================

// GET /api/posyandu/kader/my-profile - Profil & cakupan wilayah tugas kader login
router.get('/kader/my-profile', requireAuth, async (req, res) => {
  try {
    const profile = await posyanduService.getKaderProfile(req.session.user);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/posyandu/kader - Daftar seluruh kader posyandu (Admin Kelurahan)
router.get('/kader', requireAuth, async (req, res) => {
  try {
    const list = await posyanduService.listAllKader();
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST & PUT /api/posyandu/kader - Kelola profil kader & penetapan wilayah (Admin Kelurahan)
router.post('/kader', requireAuth, async (req, res) => {
  try {
    const result = await posyanduService.upsertKader(req.body);
    res.status(201).json({ success: true, message: 'Profil kader posyandu berhasil disimpan', data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

router.put('/kader/:id', requireAuth, async (req, res) => {
  try {
    const result = await posyanduService.upsertKader({ ...req.body, id: req.params.id });
    res.json({ success: true, message: 'Penugasan kader berhasil diperbarui', data: result });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/posyandu/warga-target - Pencarian cerdas warga target (balita / lansia di wilayah tugas)
router.get('/warga-target', requireAuth, async (req, res) => {
  try {
    const targets = await posyanduService.searchTargetWarga(req.session.user, req.query);
    res.json({ success: true, data: targets });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// ==========================================
// FASE 3: KARTU KIA DIGITAL & KARTU LANSIA DIGITAL
// ==========================================

// GET /api/posyandu/kia/:identifier - Kartu KIA Digital & Histori Antropometri Balita
router.get('/kia/:identifier', requireAuth, async (req, res) => {
  try {
    const cardData = await posyanduService.getKmsCard(req.session.user, req.params.identifier);
    res.json({ success: true, data: cardData });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/posyandu/lansia-card/:id - Kartu Lansia Digital & Histori Pemeriksaan
router.get('/lansia-card/:id', requireAuth, async (req, res) => {
  try {
    const cardData = await posyanduService.getLansiaCard(req.session.user, req.params.id);
    res.json({ success: true, data: cardData });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;

