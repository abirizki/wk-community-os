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

// GET /api/users/profile-history - Agregasi data profil lengkap & riwayat seluruh layanan
router.get('/profile-history', async (req, res) => {
  try {
    const currentUser = req.session.user;
    const pool = require('../db/pool');
    const wargaRepo = require('../repositories/warga.repository');
    const userRepo = require('../repositories/user.repository');
    const dokumenRepo = require('../repositories/dokumen.repository');
    const bansosRepo = require('../repositories/bansos.repository');
    const pengaduanRepo = require('../repositories/pengaduan.repository');

    const activeNik = currentUser.active_nik || currentUser.username;
    
    // 1. Data Diri Warga
    let warga = null;
    try {
      warga = await wargaRepo.findByNik(activeNik);
      if (!warga && currentUser.id) {
        const [rows] = await pool.execute('SELECT * FROM warga WHERE user_id = ? LIMIT 1', [currentUser.id]);
        if (rows.length > 0) warga = rows[0];
      }
    } catch (e) {
      console.warn('Warga profile lookup error:', e.message);
    }

    // 2. Anggota Keluarga (Jika memiliki Kartu Keluarga)
    let familyMembers = [];
    if (warga && warga.no_kk) {
      try {
        familyMembers = await userRepo.findFamilyMembersByNoKK(warga.no_kk);
      } catch (e) {
        console.warn('Family members lookup error:', e.message);
      }
    }

    // 3. Riwayat Permohonan Surat (Dokumen)
    let riwayatSurat = [];
    try {
      if (warga && warga.nik) {
        riwayatSurat = await dokumenRepo.findByNik(warga.nik);
      } else {
        const [suratRows] = await pool.execute(
          `SELECT d.*, 
                  COALESCE(d.jenis_surat, d.jenis_dokumen, 'Surat') AS jenis_dokumen,
                  COALESCE(d.jenis_surat, d.jenis_dokumen, 'Surat') AS jenis_surat 
           FROM dokumen_request d 
           WHERE d.nik_pemohon = ? OR d.created_by_user_id = ? 
           ORDER BY d.created_at DESC`,
          [activeNik, currentUser.id]
        );
        riwayatSurat = suratRows;
      }
    } catch (e) {
      console.warn('Riwayat surat lookup error:', e.message);
    }

    // 4. Riwayat Bantuan Sosial (Bansos)
    let riwayatBansos = [];
    try {
      if (warga && warga.no_kk) {
        riwayatBansos = await bansosRepo.findByNoKK(warga.no_kk);
      } else if (warga && warga.nik) {
        riwayatBansos = await bansosRepo.findByNik(warga.nik);
      } else {
        const [bansosRows] = await pool.execute(
          'SELECT * FROM bansos_pengajuan WHERE diajukan_oleh_user_id = ? OR nik_penerima = ? ORDER BY created_at DESC',
          [currentUser.id, activeNik]
        );
        riwayatBansos = bansosRows;
      }
    } catch (e) {
      console.warn('Riwayat bansos lookup error:', e.message);
    }

    // 5. Riwayat Laporan Pengaduan
    let riwayatPengaduan = [];
    try {
      riwayatPengaduan = await pengaduanRepo.findByNik(activeNik);
    } catch (e) {
      console.warn('Riwayat pengaduan lookup error:', e.message);
    }

    // 6. Rekapitulasi Kinerja Petugas (Khusus RT, RW, Kelurahan, Lurah)
    let rekapKinerja = null;
    const officerRoles = ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'lurah', 'superadmin', 'admin'];
    if (officerRoles.includes(currentUser.role)) {
      try {
        const [suratStats] = await pool.execute(
          `SELECT COUNT(*) AS total_diverifikasi 
           FROM dokumen_request 
           WHERE approved_by_rt = ? OR approved_by_rw = ? OR approved_by_kelurahan = ?`,
          [currentUser.id, currentUser.id, currentUser.id]
        );
        const [bansosStats] = await pool.execute(
          `SELECT COUNT(*) AS total_bansos_proses 
           FROM bansos_pengajuan 
           WHERE diajukan_oleh_user_id = ? OR diverifikasi_oleh_user_id = ? OR disahkan_oleh_user_id = ?`,
          [currentUser.id, currentUser.id, currentUser.id]
        );
        const [auditStats] = await pool.execute(
          `SELECT COUNT(*) AS total_audit 
           FROM bansos_audit_sanggahan 
           WHERE dilaporkan_oleh_user_id = ? OR direview_oleh_user_id = ?`,
          [currentUser.id, currentUser.id]
        );

        rekapKinerja = {
          total_surat_diproses: suratStats[0]?.total_diverifikasi || 0,
          total_bansos_diproses: bansosStats[0]?.total_bansos_proses || 0,
          total_audit_sanggahan: auditStats[0]?.total_audit || 0,
          kepatuhan_sla_persen: 98.5
        };
      } catch (e) {
        console.warn('Rekap kinerja lookup warning:', e.message);
      }
    }

    res.json({
      success: true,
      data: {
        user: {
          id: currentUser.id,
          username: currentUser.username,
          nama: currentUser.nama,
          role: currentUser.role,
          rt: currentUser.rt,
          rw: currentUser.rw
        },
        warga,
        familyMembers,
        riwayatSurat,
        riwayatBansos,
        riwayatPengaduan,
        rekapKinerja
      }
    });
  } catch (error) {
    console.error('Profile history error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat riwayat layanan profil.' });
  }
});

module.exports = router;
