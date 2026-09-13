/**
 * src/routes/keuangan.routes.js
 * API Endpoints for Pembukuan Kas Lingkungan & Iuran Warga RT/RW.
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const keuanganService = require('../services/keuangan.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/keuangan/summary - Saldo berjalan dan breakdown kas
router.get('/summary', requireAuth, async (req, res) => {
  try {
    const result = await keuanganService.getKasSummary(req.session.user);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/keuangan/transaksi - Daftar riwayat kas masuk & keluar
router.get('/transaksi', requireAuth, async (req, res) => {
  try {
    const list = await keuanganService.getTransaksiList(req.query, req.session.user);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/keuangan/transaksi - Catat transaksi kas baru
router.post('/transaksi', requireAuth, async (req, res) => {
  try {
    const result = await keuanganService.catatTransaksi(req.body, req.session.user);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/keuangan/transaksi/:id/kuitansi - Format cetak kuitansi kas
router.get('/transaksi/:id/kuitansi', requireAuth, async (req, res) => {
  try {
    const data = await keuanganService.getKuitansiTransaksi(req.params.id, req.session.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/keuangan/iuran - Daftar status iuran bulanan warga per KK
router.get('/iuran', requireAuth, async (req, res) => {
  try {
    const list = await keuanganService.getIuranList(req.query, req.session.user);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/keuangan/iuran/:id/bayar - Tandai iuran lunas
router.post('/iuran/:id/bayar', requireAuth, async (req, res) => {
  try {
    const result = await keuanganService.bayarIuran(req.params.id, req.body, req.session.user);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/keuangan/iuran/generate - Generate tagihan bulanan KK di RT
router.post('/iuran/generate', requireAuth, async (req, res) => {
  try {
    const result = await keuanganService.generateTagihanBulanan(req.body, req.session.user);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

module.exports = router;

