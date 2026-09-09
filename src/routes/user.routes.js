/**
 * src/routes/user.routes.js
 * Multi-Tier User Management Endpoints
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const userService = require('../services/user.service');
const { requireAuth, canManageUserRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Semua rute manajemen user mewajibkan autentikasi
router.use(requireAuth);

// GET /api/users - Daftar user berdasarkan scope caller
router.get('/', async (req, res) => {
  try {
    const users = await userService.listUsers(req.session.user, req.query);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat daftar pengguna' });
  }
});

// POST /api/users - Buat akun baru dengan validasi hirarki & wilayah
router.post('/', canManageUserRole, async (req, res) => {
  try {
    const newUser = await userService.createUser(req.session.user, req.body);
    res.status(201).json({
      success: true,
      message: `Pengguna '${newUser.nama}' (${newUser.role}) berhasil didaftarkan.`,
      data: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal membuat pengguna' });
  }
});

// PATCH /api/users/:id/status - Update status aktif/nonaktif
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });
    }

    const result = await userService.updateUserStatus(req.session.user, req.params.id, status);
    res.json({
      success: true,
      message: `Status pengguna berhasil diubah menjadi ${status}.`,
      data: result
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(403).json({ success: false, message: error.message || 'Gagal mengubah status pengguna' });
  }
});

// POST /api/users/:id/reset-password - Reset password pengguna oleh pimpinan
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { new_password } = req.body;
    if (!new_password || new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
    }

    const result = await userService.resetPassword(req.session.user, req.params.id, new_password);
    res.json(result);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(403).json({ success: false, message: error.message || 'Gagal mereset password' });
  }
});

module.exports = router;
