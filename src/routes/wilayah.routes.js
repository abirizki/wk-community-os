/**
 * src/routes/wilayah.routes.js
 * API Endpoints for Master Wilayah, Multi-Tenancy Scoping, and Executive Command Center
 * Kota Sukabumi (32.72) - Jabar Pintar Digital
 */

const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const wilayahRepository = require('../repositories/wilayah.repository');

const router = express.Router();

// GET /api/wilayah/kecamatan - Daftar 7 Kecamatan Kota Sukabumi
router.get('/kecamatan', requireAuth, async (req, res) => {
  try {
    const list = await wilayahRepository.getAllKecamatan();
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('Error fetching kecamatan:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat master kecamatan' });
  }
});

// GET /api/wilayah/kelurahan - Daftar 33 Kelurahan Kota Sukabumi
router.get('/kelurahan', requireAuth, async (req, res) => {
  try {
    const { kode_kecamatan } = req.query;
    const list = await wilayahRepository.getAllKelurahan(kode_kecamatan);
    res.json({ success: true, data: list });
  } catch (err) {
    console.error('Error fetching kelurahan:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat master kelurahan' });
  }
});

// GET /api/wilayah/command-center - Executive Command Center Heatmap 33 Kelurahan
router.get('/command-center', requireAuth, async (req, res) => {
  try {
    const { kode_kecamatan } = req.query;
    const result = await wilayahRepository.getCommandCenterHeatmap(kode_kecamatan);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error fetching command center heatmap:', err);
    res.status(500).json({ success: false, message: 'Gagal memuat peta komando eksekutif' });
  }
});

// POST /api/wilayah/switch-tenant - Simulasi / Beralih Tenant Kelurahan
router.post('/switch-tenant', requireAuth, async (req, res) => {
  try {
    const { kode_kelurahan } = req.body;
    const currentUser = req.session.user;

    // Hanya superadmin, walikota, dan camat yang dapat beralih tenant
    const allowedRoles = ['superadmin', 'walikota', 'camat'];
    if (!allowedRoles.includes(currentUser.role)) {
      return res.status(403).json({
        success: false,
        message: 'Hanya Pimpinan Kota / Camat yang berhak mengganti perspektif tenant wilayah.'
      });
    }

    if (!kode_kelurahan) {
      // Reset ke mode makro kota
      delete req.session.user.active_tenant;
      return res.json({ success: true, message: 'Kembali ke perspektif makro Kota Sukabumi.', active_tenant: null });
    }

    const kelurahan = await wilayahRepository.getKelurahanByKode(kode_kelurahan);
    if (!kelurahan) {
      return res.status(404).json({ success: false, message: 'Kode kelurahan tidak valid.' });
    }

    // Jika camat, verifikasi bahwa kelurahan berada di kecamatannya
    if (currentUser.role === 'camat' && currentUser.kode_kecamatan && currentUser.kode_kecamatan !== kelurahan.kode_kecamatan) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Camat hanya dapat beralih ke kelurahan di dalam kecamatannya.'
      });
    }

    req.session.user.active_tenant = {
      kode_kecamatan: kelurahan.kode_kecamatan,
      kode_kelurahan: kelurahan.kode_kelurahan,
      nama_kelurahan: kelurahan.nama_kelurahan,
      nama_kecamatan: kelurahan.nama_kecamatan,
      nama_lurah: kelurahan.nama_lurah
    };

    res.json({
      success: true,
      message: `Perspektif berhasil dialihkan ke Kelurahan ${kelurahan.nama_kelurahan}, Kec. ${kelurahan.nama_kecamatan}`,
      active_tenant: req.session.user.active_tenant
    });
  } catch (err) {
    console.error('Error switching tenant:', err);
    res.status(500).json({ success: false, message: 'Gagal beralih tenant kelurahan' });
  }
});

// GET /api/wilayah/active-tenant - Ambil status tenant aktif di sesi
router.get('/active-tenant', requireAuth, (req, res) => {
  res.json({
    success: true,
    active_tenant: req.session.user.active_tenant || {
      kode_kecamatan: req.session.user.kode_kecamatan || '32.72.03',
      kode_kelurahan: req.session.user.kode_kelurahan || '32.72.03.1004',
      nama_kelurahan: 'Kebonjati',
      nama_kecamatan: 'Cikole',
      nama_kota: 'Kota Sukabumi'
    }
  });
});

module.exports = router;

