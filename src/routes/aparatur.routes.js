/**
 * src/routes/aparatur.routes.js
 * API Endpoints for Direktori Aparatur Kelurahan & Mitra Keamanan
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const router = express.Router();
const aparaturService = require('../services/aparatur.service');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

// GET /api/aparatur - Direktori publik aparatur & mitra kewilayahan
router.get('/', async (req, res) => {
  try {
    const list = await aparaturService.getDirectory(req.query);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/aparatur/:id - Detail pejabat
router.get('/:id', async (req, res) => {
  try {
    const item = await aparaturService.getById(Number(req.params.id));
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/aparatur - Tambah aparatur (Admin only)
router.post('/', requireAuth, requireRole('superadmin', 'admin', 'admin_kelurahan', 'lurah'), async (req, res) => {
  try {
    const item = await aparaturService.createPejabat(req.body);
    res.status(201).json({ success: true, message: 'Data pejabat aparatur berhasil ditambahkan', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT /api/aparatur/:id - Update data pejabat
router.put('/:id', requireAuth, requireRole('superadmin', 'admin', 'admin_kelurahan', 'lurah'), async (req, res) => {
  try {
    await aparaturService.updatePejabat(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Data pejabat aparatur berhasil diperbarui' });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
});

// DELETE /api/aparatur/:id - Hapus pejabat
router.delete('/:id', requireAuth, requireRole('superadmin', 'admin', 'admin_kelurahan', 'lurah'), async (req, res) => {
  try {
    await aparaturService.deletePejabat(Number(req.params.id));
    res.json({ success: true, message: 'Data pejabat aparatur berhasil dinonaktifkan' });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  }
});

module.exports = router;
