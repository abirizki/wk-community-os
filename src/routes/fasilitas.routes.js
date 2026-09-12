/**
 * src/routes/fasilitas.routes.js
 * API Endpoints for Public Facilities, Regional Carrying Capacity & Local Economy Ecosystem
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const fasilitasRepository = require('../repositories/fasilitas.repository');
const dayaDukungService = require('../services/daya_dukung.service');

const router = express.Router();

/**
 * Helper untuk menentukan scope wilayah user
 */
function resolveScope(user) {
  if (!user) return {};
  if (user.role === 'ketua_rt') {
    return { rt: user.rt || '001', rw: user.rw || '001' };
  }
  if (['ketua_rw', 'admin_rw'].includes(user.role)) {
    return { rw: user.rw || '001' };
  }
  return {};
}

// =========================================================================
// 1. RINGKASAN DAYA DUKUNG KOMPREHENSIF
// =========================================================================

// GET /api/fasilitas/summary - 4 Pilar Daya Dukung Wilayah
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const result = await dayaDukungService.getComprehensiveCarryingCapacity(scope);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching carrying capacity summary:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat ringkasan daya dukung wilayah' });
  }
});

// =========================================================================
// 2. SEKTOR PENDIDIKAN
// =========================================================================

// GET /api/fasilitas/pendidikan - Inventaris & Analisis Zonasi PPDB
router.get('/pendidikan', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const [inventory, summary] = await Promise.all([
      fasilitasRepository.getPendidikanInventory(scope),
      fasilitasRepository.getPendidikanSummary(scope)
    ]);
    const analysis = dayaDukungService.analyzeEducation(summary);

    res.json({
      success: true,
      data: {
        inventory,
        analysis
      }
    });
  } catch (error) {
    console.error('Error fetching pendidikan:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data fasilitas pendidikan' });
  }
});

// POST /api/fasilitas/pendidikan - Tambah Fasilitas Sekolah (Admin/Kelurahan)
router.post('/pendidikan', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin'), async (req, res) => {
  try {
    const { nama_sekolah, jenjang, alamat } = req.body;
    if (!nama_sekolah || !jenjang || !alamat) {
      return res.status(400).json({ success: false, message: 'Nama sekolah, jenjang, dan alamat wajib diisi' });
    }
    const created = await fasilitasRepository.createPendidikan(req.body);
    res.status(201).json({ success: true, message: 'Fasilitas pendidikan berhasil ditambahkan', data: created });
  } catch (error) {
    console.error('Error creating pendidikan:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan fasilitas pendidikan' });
  }
});

// =========================================================================
// 3. SEKTOR KESEHATAN
// =========================================================================

// GET /api/fasilitas/kesehatan - Inventaris & Rasio Daya Dukung Medis
router.get('/kesehatan', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const [inventory, summary] = await Promise.all([
      fasilitasRepository.getKesehatanInventory(scope),
      fasilitasRepository.getKesehatanSummary(scope)
    ]);
    const analysis = dayaDukungService.analyzeHealth(summary);

    res.json({
      success: true,
      data: {
        inventory,
        analysis
      }
    });
  } catch (error) {
    console.error('Error fetching kesehatan:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data fasilitas kesehatan' });
  }
});

// POST /api/fasilitas/kesehatan - Tambah Faskes (Admin/Kelurahan)
router.post('/kesehatan', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin'), async (req, res) => {
  try {
    const { nama_faskes, jenis_faskes, alamat } = req.body;
    if (!nama_faskes || !jenis_faskes || !alamat) {
      return res.status(400).json({ success: false, message: 'Nama faskes, jenis faskes, dan alamat wajib diisi' });
    }
    const created = await fasilitasRepository.createKesehatan(req.body);
    res.status(201).json({ success: true, message: 'Fasilitas kesehatan berhasil didaftarkan', data: created });
  } catch (error) {
    console.error('Error creating kesehatan:', error);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan fasilitas kesehatan' });
  }
});

// =========================================================================
// 4. SEKTOR EKONOMI LOKAL & UMKM
// =========================================================================

// GET /api/fasilitas/usaha - Direktori UMKM & Analisis Serapan Naker
router.get('/usaha', requireAuth, async (req, res) => {
  try {
    const scope = resolveScope(req.session.user);
    const { kategori, is_pangan_murah } = req.query;
    const [inventory, summary] = await Promise.all([
      fasilitasRepository.getEntitasUsahaList(scope, { kategori, is_pangan_murah }),
      fasilitasRepository.getEntitasUsahaSummary(scope)
    ]);
    const analysis = dayaDukungService.analyzeEconomy(summary);

    res.json({
      success: true,
      data: {
        inventory,
        analysis
      }
    });
  } catch (error) {
    console.error('Error fetching usaha:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data direktori UMKM' });
  }
});

// POST /api/fasilitas/usaha - Pendaftaran UMKM Warga Mandiri / Petugas
router.post('/usaha', requireAuth, async (req, res) => {
  try {
    const { nama_usaha, nama_pemilik, kategori_usaha, alamat } = req.body;
    const nik = req.session.user.active_nik || req.session.user.username;
    if (!nama_usaha || !alamat) {
      return res.status(400).json({ success: false, message: 'Nama usaha dan alamat wajib diisi' });
    }

    const payload = {
      ...req.body,
      nik_pemilik: nik,
      nama_pemilik: nama_pemilik || req.session.user.nama || 'Warga',
      rt: req.body.rt || req.session.user.rt || '001',
      rw: req.body.rw || req.session.user.rw || '001',
      status_verifikasi: ['admin_kelurahan', 'superadmin', 'admin'].includes(req.session.user.role) 
        ? 'TERVERIFIKASI' 
        : 'MENUNGGU_VERIFIKASI'
    };

    const created = await fasilitasRepository.createEntitasUsaha(payload);
    res.status(201).json({ success: true, message: 'Usaha berhasil didaftarkan', data: created });
  } catch (error) {
    console.error('Error creating usaha:', error);
    res.status(500).json({ success: false, message: 'Gagal mendaftarkan usaha' });
  }
});

// =========================================================================
// 5. SEKTOR SANITASI & KORELASI STUNTING
// =========================================================================

// GET /api/fasilitas/sanitasi - Profil Sanitasi Lingkungan & Matriks Risiko Stunting
router.get('/sanitasi', requireAuth, async (req, res) => {
  try {
    const rawData = await fasilitasRepository.getSanitasiSummaryByRT();
    const analysis = dayaDukungService.analyzeSanitation(rawData);
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error('Error fetching sanitasi:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat profil sanitasi lingkungan' });
  }
});

module.exports = router;

