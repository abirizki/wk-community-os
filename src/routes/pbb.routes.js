/**
 * src/routes/pbb.routes.js
 * PBB API Endpoints - Pajak Bumi dan Bangunan Digital
 * Kelurahan Kebonjati, Kec. Cikole, Kota Sukabumi - Jabar Pintar Digital
 */

const express = require('express');
const pbbService = require('../services/pbb.service');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/pbb/me - Ambil tagihan PBB milik warga yang login
router.get('/me', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.active_nik || req.session.user.username;
    const tagihan = await pbbService.getTagihanByNik(nik);
    
    res.json({
      success: true,
      data: tagihan
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error fetching PBB by NIK:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

// GET /api/pbb/monitoring - Monitoring daftar PBB kewilayahan (RT, RW, Kelurahan)
router.get('/monitoring', requireAuth, async (req, res) => {
  try {
    const result = await pbbService.getMonitoringList(req.session.user, req.query);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching PBB monitoring list:', error.message);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memuat monitoring PBB' });
  }
});

// GET /api/pbb/stats - Data KPI dan Analitik PBB Wilayah (Charts & Heatmap)
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const result = await pbbService.getStats(req.session.user, req.query.tahun || 2026);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching PBB stats:', error.message);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memuat statistik PBB' });
  }
});

// GET /api/pbb/sppt/:nop/:tahun - Detail E-SPPT Digital Resmi
router.get('/sppt/:nop/:tahun', requireAuth, async (req, res) => {
  try {
    const { nop, tahun } = req.params;
    const sppt = await pbbService.getSpptDetail(nop, tahun);
    res.json({
      success: true,
      data: sppt
    });
  } catch (error) {
    console.error('Error fetching E-SPPT:', error.message);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal memuat dokumen E-SPPT' });
  }
});

// PUT /api/pbb/pay - Simulasi / Verifikasi Pembayaran PBB
router.put('/pay', requireAuth, async (req, res) => {
  try {
    const { nop, tahun, metode_bayar, nomor_transaksi_bank, bukti_bayar_url } = req.body;
    
    const result = await pbbService.bayarTagihan(nop, tahun, req.session.user, {
      metode_bayar,
      nomor_transaksi_bank,
      bukti_bayar_url
    });
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ success: false, message: error.message });
    } else {
      console.error('Error paying PBB:', error.message);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
});

// POST /api/pbb/import - Batch Upload / Rekonsiliasi Acuan DHKP Bapenda
router.post('/import', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin', 'lurah'), async (req, res) => {
  try {
    const { records } = req.body;
    const result = await pbbService.importDhkp(records, req.session.user);
    res.json({
      success: true,
      message: result.message,
      data: result.result
    });
  } catch (error) {
    console.error('Error importing DHKP:', error.message);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Gagal mengimpor data DHKP' });
  }
});

module.exports = router;
