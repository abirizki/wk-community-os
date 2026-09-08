/**
 * src/routes/auth.routes.js
 * Authentication API endpoints.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    // Cari user berdasarkan username
    const user = await userRepository.findByUsername(username);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Akun tidak aktif' });
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Username atau password salah' });
    }

    // Simpan data user di session (tanpa password_hash)
    const userData = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role
    };

    req.session.user = userData;

    res.json({
      success: true,
      message: 'Login berhasil',
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Gagal logout' });
    }
    res.clearCookie('connect.sid'); // Nama cookie default express-session
    res.json({ success: true, message: 'Logout berhasil' });
  });
});

// GET /api/auth/me (Optional: untuk verifikasi session)
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Tidak ada sesi aktif' });
  }
});

module.exports = router;

