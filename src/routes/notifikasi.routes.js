/**
 * src/routes/notifikasi.routes.js
 * In-App Notification API endpoints.
 */

const express = require('express');
const notifikasiService = require('../services/notifikasi.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/notifikasi/me - Ambil semua notifikasi untuk warga
router.get('/me', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.username;
    const notifications = await notifikasiService.getByNik(nik);
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// GET /api/notifikasi/unread-count - Hitung notifikasi belum dibaca
router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.username;
    const result = await notifikasiService.getUnreadCount(nik);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error counting unread notifications:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// PATCH /api/notifikasi/:id/read - Tandai satu notifikasi telah dibaca
router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.username;
    const { id } = req.params;
    await notifikasiService.markRead(Number(id), nik);
    res.json({
      success: true,
      message: 'Notifikasi ditandai dibaca'
    });
  } catch (error) {
    console.error('Error marking notification read:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// PATCH /api/notifikasi/read-all - Tandai semua notifikasi telah dibaca
router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const nik = req.session.user.username;
    await notifikasiService.markAllRead(nik);
    res.json({
      success: true,
      message: 'Semua notifikasi ditandai dibaca'
    });
  } catch (error) {
    console.error('Error marking all notifications read:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

module.exports = router;

