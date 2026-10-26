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

// GET /api/users/:id - Ambil detail pengguna
router.get('/:id', async (req, res) => {
  try {
    const user = await userService.getUserById(req.session.user, req.params.id);
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message || 'Pengguna tidak ditemukan' });
  }
});

// PUT /api/users/:id - Update data profil & peran pengguna
router.put('/:id', async (req, res) => {
  try {
    const updated = await userService.updateUser(req.session.user, req.params.id, req.body);
    res.json({
      success: true,
      message: `Data pengguna '${updated.nama}' berhasil diperbarui.`,
      data: updated
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(400).json({ success: false, message: error.message || 'Gagal memperbarui pengguna' });
  }
});

// DELETE /api/users/:id - Hapus akun pengguna
router.delete('/:id', async (req, res) => {
  try {
    const result = await userService.deleteUser(req.session.user, req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(403).json({ success: false, message: error.message || 'Gagal menghapus pengguna' });
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

    // 7. Agregasi Daya Dukung Demografi & Makro Kelurahan (Khusus Admin Kelurahan / Lurah)
    let demografiKelurahan = null;
    const isKelurahanAdmin = ['admin_kelurahan', 'lurah', 'superadmin', 'admin'].includes(currentUser.role);
    if (isKelurahanAdmin) {
      try {
        const [wargaGeneral] = await pool.query(`
          SELECT 
            COUNT(*) AS total_warga,
            COUNT(DISTINCT no_kk) AS total_kk,
            SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS pria,
            SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS wanita,
            SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) <= 5 THEN 1 ELSE 0 END) AS usia_balita,
            SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 6 AND 18 THEN 1 ELSE 0 END) AS usia_sekolah,
            SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 19 AND 59 THEN 1 ELSE 0 END) AS usia_produktif,
            SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS usia_lansia
          FROM warga
        `);

        // Distribusi Wilayah RT & RW
        const [sebaranWilayah] = await pool.query(`
          SELECT rw, rt, COUNT(*) AS jumlah_warga, COUNT(DISTINCT no_kk) AS jumlah_kk
          FROM warga
          WHERE rw IS NOT NULL AND rt IS NOT NULL
          GROUP BY rw, rt
          ORDER BY rw ASC, rt ASC
        `);

        // Distribusi Desil Kesejahteraan
        let desilStats = { desil_1: 0, desil_2: 0, desil_3_4: 0, non_desil: 0 };
        try {
          const [dRows] = await pool.query(`
            SELECT 
              SUM(CASE WHEN desil_saat_ini = 1 THEN 1 ELSE 0 END) AS desil_1,
              SUM(CASE WHEN desil_saat_ini = 2 THEN 1 ELSE 0 END) AS desil_2,
              SUM(CASE WHEN desil_saat_ini IN (3, 4) THEN 1 ELSE 0 END) AS desil_3_4,
              SUM(CASE WHEN desil_saat_ini > 4 OR desil_saat_ini IS NULL THEN 1 ELSE 0 END) AS non_desil
            FROM desil_keluarga
          `);
          if (dRows.length > 0) desilStats = dRows[0];
        } catch (e) {}

        // Potensi & Kepatuhan PBB
        let pbbStats = { total_nop: 0, total_lunas: 0, total_tertunggak: 0, total_pokok: 0 };
        try {
          const [pRows] = await pool.query(`
            SELECT 
              COUNT(*) AS total_nop,
              SUM(CASE WHEN status_bayar = 'LUNAS' OR verifikasi_rt = 1 THEN 1 ELSE 0 END) AS total_lunas,
              SUM(CASE WHEN status_bayar != 'LUNAS' AND (verifikasi_rt = 0 OR verifikasi_rt IS NULL) THEN 1 ELSE 0 END) AS total_tertunggak,
              COALESCE(SUM(nominal_ketetapan), 0) AS total_pokok
            FROM pbb
          `);
          if (pRows.length > 0) pbbStats = pRows[0];
        } catch (e) {}

        // Statistik Bansos Kelurahan
        let bansosSummary = { total_penerima: 0, total_disalurkan: 0, total_anggaran: 0 };
        try {
          const [bRows] = await pool.query(`
            SELECT 
              COUNT(*) AS total_penerima,
              SUM(CASE WHEN status = 'DISBURSED' THEN 1 ELSE 0 END) AS total_disalurkan,
              COALESCE(SUM(nominal_bantuan), 0) AS total_anggaran
            FROM bansos_pengajuan
            WHERE status IN ('APPROVED', 'DISBURSED')
          `);
          if (bRows.length > 0) bansosSummary = bRows[0];
        } catch (e) {}

        const statsRow = wargaGeneral[0] || {};
        const totalWarga = Number(statsRow.total_warga || 0);
        const usiaProduktif = Number(statsRow.usia_produktif || 0);
        const nonProduktif = Number(statsRow.usia_balita || 0) + Number(statsRow.usia_sekolah || 0) + Number(statsRow.usia_lansia || 0);
        const dependencyRatio = usiaProduktif > 0 ? Math.round((nonProduktif / usiaProduktif) * 100) : 0;

        demografiKelurahan = {
          total_warga: totalWarga,
          total_kk: Number(statsRow.total_kk || 0),
          pria: Number(statsRow.pria || 0),
          wanita: Number(statsRow.wanita || 0),
          usia_balita: Number(statsRow.usia_balita || 0),
          usia_sekolah: Number(statsRow.usia_sekolah || 0),
          usia_produktif: usiaProduktif,
          usia_lansia: Number(statsRow.usia_lansia || 0),
          dependency_ratio: dependencyRatio,
          sebaran_wilayah: sebaranWilayah || [],
          desil: desilStats,
          pbb: pbbStats,
          bansos: bansosSummary,
          kantor: {
            nama_kelurahan: 'Kelurahan Kebonjati',
            kecamatan: 'Kecamatan Cikole',
            kota: 'Kota Sukabumi',
            provinsi: 'Jawa Barat',
            kode_pos: '43111',
            alamat: 'Jl. Kebonjati No. 1, Kota Sukabumi',
            nama_lurah: 'H. Rahmat Hidayat, S.IP, M.Si',
            nip_lurah: '19760815 200212 1 003',
            telepon: '(0266) 221-123',
            email: 'kelurahan.kebonjati@sukabumikota.go.id'
          }
        };
      } catch (e) {
        console.warn('Demografi kelurahan lookup warning:', e.message);
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
        rekapKinerja,
        demografiKelurahan
      }
    });
  } catch (error) {
    console.error('Profile history error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat riwayat layanan profil.' });
  }
});

module.exports = router;
