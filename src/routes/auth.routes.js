/**
 * src/routes/auth.routes.js
 * Authentication & Family Profile Switching API
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const pool = require('../db/pool');

const router = express.Router();

// POST /api/auth/login (Mendukung Username, NIK, dan Nomor KK)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username/NIK/No KK dan password wajib diisi' });
    }

    const cleanUsername = String(username).trim();

    // 1. Cari user di tabel users
    let user = await userRepository.findByUsername(cleanUsername);

    // 2. Jika tidak ditemukan langsung tapi cleanUsername adalah 16 digit No KK:
    // Cek apakah ada akun KK yang terdaftar di users, atau cari akun kepala keluarga
    if (!user && cleanUsername.length === 16) {
      const kk = await userRepository.findKartuKeluarga(cleanUsername);
      if (kk) {
        // Cari apakah kepala keluarga memiliki akun
        const [wargaRows] = await pool.execute(
          'SELECT user_id, nik, nama FROM warga WHERE no_kk = ? AND status_hubungan_keluarga = "Kepala Keluarga" LIMIT 1',
          [cleanUsername]
        );
        if (wargaRows.length > 0 && wargaRows[0].user_id) {
          user = await userRepository.findById(wargaRows[0].user_id);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Identitas atau password salah' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Akun dinonaktifkan atau ditangguhkan. Hubungi petugas kelurahan.' });
    }

    // 3. Verifikasi password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Identitas atau password salah' });
    }

    // 4. Periksa apakah user terafiliasi dengan Nomor KK
    let no_kk = null;
    let familyMembers = [];
    let isFamilyAccount = false;

    // Cek jika username langsung merupakan No KK
    const kkDirect = await userRepository.findKartuKeluarga(cleanUsername);
    if (kkDirect) {
      no_kk = cleanUsername;
      isFamilyAccount = true;
    } else if (user.role === 'warga') {
      // Cari No KK dari profil warga
      const [wargaProfil] = await pool.execute(
        'SELECT no_kk, nama, nik FROM warga WHERE nik = ? OR user_id = ? LIMIT 1',
        [user.username, user.id]
      );
      if (wargaProfil.length > 0) {
        no_kk = wargaProfil[0].no_kk;
      }
    }

    if (no_kk) {
      familyMembers = await userRepository.findFamilyMembersByNoKK(no_kk);
      if (familyMembers.length > 1) {
        isFamilyAccount = true;
      }
    }

    // 5. Tentukan Persona Aktif Pertama Kali
    let activeNik = user.username;
    let activeNama = user.nama;
    let activeHubungan = 'Pengguna';

    if (familyMembers.length > 0) {
      const match = familyMembers.find(m => m.nik === user.username) || familyMembers[0];
      activeNik = match.nik;
      activeNama = match.nama;
      activeHubungan = match.status_hubungan_keluarga;
    }

    const userData = {
      id: user.id,
      username: user.username,
      nama: user.nama,
      role: user.role === 'admin' ? 'admin_kelurahan' : user.role,
      rt: user.rt || (familyMembers[0]?.rt ?? null),
      rw: user.rw || (familyMembers[0]?.rw ?? null),
      no_kk,
      is_family_account: isFamilyAccount,
      active_nik: activeNik,
      active_nama: activeNama,
      active_hubungan: activeHubungan,
      family_members: familyMembers
    };

    req.session.user = userData;

    // Catat last login
    await pool.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

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

// POST /api/auth/select-profile (Ganti Persona Anggota Keluarga)
router.post('/select-profile', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Tidak ada sesi aktif' });
    }

    const { nik } = req.body;
    if (!nik) {
      return res.status(400).json({ success: false, message: 'NIK anggota keluarga wajib dipilih' });
    }

    const user = req.session.user;
    if (!user.no_kk) {
      return res.status(400).json({ success: false, message: 'Akun ini tidak terikat pada Kartu Keluarga' });
    }

    // Pastikan NIK yang dipilih benar-benar anggota dari KK tersebut
    const members = await userRepository.findFamilyMembersByNoKK(user.no_kk);
    const selected = members.find(m => m.nik === nik);

    if (!selected) {
      return res.status(403).json({ success: false, message: 'Anggota keluarga tidak ditemukan dalam KK ini' });
    }

    // Update sesi aktif
    req.session.user.active_nik = selected.nik;
    req.session.user.active_nama = selected.nama;
    req.session.user.active_hubungan = selected.status_hubungan_keluarga;

    res.json({
      success: true,
      message: `Beralih profil ke ${selected.nama} (${selected.status_hubungan_keluarga})`,
      active_persona: {
        nik: selected.nik,
        nama: selected.nama,
        hubungan: selected.status_hubungan_keluarga
      }
    });
  } catch (error) {
    console.error('Select profile error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengganti profil keluarga' });
  }
});

// GET /api/auth/family-members (Ambil anggota keluarga dari akun saat ini)
router.get('/family-members', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: 'Harap login terlebih dahulu' });
    }

    const no_kk = req.session.user.no_kk;
    if (!no_kk) {
      return res.json({ success: true, data: [] });
    }

    const members = await userRepository.findFamilyMembersByNoKK(no_kk);
    res.json({ success: true, data: members });
  } catch (error) {
    console.error('Fetch family members error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat data keluarga' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ success: false, message: 'Gagal logout' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logout berhasil' });
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({ success: true, user: req.session.user });
  } else {
    res.status(401).json({ success: false, message: 'Tidak ada sesi aktif' });
  }
});

module.exports = router;
