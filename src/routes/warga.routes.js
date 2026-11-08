/**
 * src/routes/warga.routes.js
 * Warga API endpoints with Scoped List, Assisted Offline Registration, and Bulk Import.
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const wargaService = require('../services/warga.service');
const { requireAuth, requireRole, requireFamilyOrStaffScope } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/warga - Daftar warga dengan pagination, pencarian, dan scoping terpadu
router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.session.user.role === 'warga') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Akun warga mandiri hanya berwenang mengakses data keluarga sendiri melalui menu profil / KK.'
      });
    }

    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;
    const search = req.query.search || '';
    const rt = req.query.rt || null;
    const rw = req.query.rw || null;

    const data = await wargaService.listWarga({ limit, offset, search, rt, rw }, req.session.user);
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Error fetching list warga:', error.message);
    res.status(error.status || 500).json({ success: false, message: error.message || 'Terjadi kesalahan pada server' });
  }
});

// POST /api/warga/assisted - Mode Asistensi RT/RW untuk warga tanpa akses internet
router.post('/assisted', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin_rw', 'ketua_rw', 'ketua_rt', 'admin'), async (req, res) => {
  try {
    const newWarga = await wargaService.registerAssistedWarga(req.body, req.session.user);
    res.status(201).json({
      success: true,
      message: `Warga ${newWarga.nama} berhasil didaftarkan melalui Asistensi RT/RW.`,
      data: newWarga
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// POST /api/warga/bulk-import - Import Massal Sensus Warga (Excel / CSV)
router.post('/bulk-import', requireAuth, requireRole('superadmin', 'admin_kelurahan', 'admin'), async (req, res) => {
  try {
    const records = req.body.records || req.body;
    const summary = await wargaService.bulkImportWarga(records, req.session.user);
    res.json({
      success: true,
      message: `Import massal selesai: ${summary.imported} warga berhasil ditambahkan, ${summary.skipped} dilewati.`,
      summary
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// GET /api/warga/:nik - Detail profil warga (Anti-IDOR: dilindungi Scope Guard)
router.get('/:nik', requireAuth, requireFamilyOrStaffScope('nik'), async (req, res) => {
  try {
    const { nik } = req.params;
    const warga = await wargaService.getByNik(nik);
    res.json({ success: true, data: warga });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
});

// PATCH /api/warga/mandiri-asuransi-bansos - Input mandiri BPJS / Asuransi dan Bukti Bantuan Sosial
router.patch('/mandiri-asuransi-bansos', requireAuth, async (req, res) => {
  try {
    const {
      nik,
      kategori_asuransi,
      nomor_asuransi,
      bukti_bansos_url,
      catatan_bansos_mandiri
    } = req.body;

    const user = req.session.user;
    // Warga hanya boleh mengubah datanya sendiri atau keluarga; aparatur boleh mengubah siapapun
    let targetNik = nik || user.active_nik || user.username;
    if (user.role === 'warga' && targetNik !== user.active_nik && targetNik !== user.username) {
      // Cek apakah targetNik masih dalam satu Kartu Keluarga
      const wargaRepo = require('../repositories/warga.repository');
      const callerWarga = await wargaRepo.findByNik(user.active_nik || user.username);
      const targetWarga = await wargaRepo.findByNik(targetNik);
      if (!callerWarga || !targetWarga || callerWarga.no_kk !== targetWarga.no_kk) {
        return res.status(403).json({ success: false, message: 'Anda hanya berwenang memperbarui data jaminan sosial keluarga sendiri.' });
      }
    }

    const pool = require('../db/pool');
    await pool.execute(
      `UPDATE warga 
       SET kategori_asuransi = COALESCE(?, kategori_asuransi),
           nomor_asuransi = COALESCE(?, nomor_asuransi),
           bukti_bansos_url = COALESCE(?, bukti_bansos_url),
           catatan_bansos_mandiri = COALESCE(?, catatan_bansos_mandiri)
       WHERE nik = ?`,
      [
        kategori_asuransi || null,
        nomor_asuransi || null,
        bukti_bansos_url || null,
        catatan_bansos_mandiri || null,
        targetNik
      ]
    );

    const [updatedWarga] = await pool.execute('SELECT * FROM warga WHERE nik = ? LIMIT 1', [targetNik]);

    res.json({
      success: true,
      message: 'Data jaminan kesehatan & bukti bantuan sosial berhasil diperbarui.',
      data: updatedWarga[0] || null
    });
  } catch (error) {
    console.error('Update mandiri asuransi bansos error:', error);
    res.status(500).json({ success: false, message: error.message || 'Gagal memperbarui data jaminan sosial' });
  }
});


// PATCH /api/warga/update-nik-bayi - Orang tua memperbarui NIK sementara bayi menjadi NIK resmi definitif dari Akta Lahir
router.patch('/update-nik-bayi', requireAuth, async (req, res) => {
  try {
    const { nik_sementara, nik_definitif, catatan } = req.body;
    const user = req.session.user;

    if (!nik_sementara || !nik_definitif) {
      return res.status(400).json({ success: false, message: 'NIK sementara dan NIK definitif wajib diisi.' });
    }

    // Validasi format NIK definitif: tepat 16 digit angka, tidak boleh diawali 0000
    if (!/^\d{16}$/.test(nik_definitif) || nik_definitif.startsWith('0000')) {
      return res.status(400).json({ success: false, message: 'Format NIK definitif tidak valid (harus 16 digit angka resmi).' });
    }

    const pool = require('../db/pool');

    // Cek apakah bayi ada di database dan benar berstatus NIK sementara
    const [targetBaby] = await pool.execute('SELECT * FROM warga WHERE nik = ?', [nik_sementara]);
    if (targetBaby.length === 0) {
      return res.status(404).json({ success: false, message: 'Data bayi dengan NIK sementara tidak ditemukan.' });
    }

    const baby = targetBaby[0];

    // Otorisasi: Warga yang mengupdate harus memiliki No KK yang sama (orang tua / kepala keluarga)
    // Atau jika petugas (ketua_rt, ketua_rw, admin_kelurahan, superadmin)
    const isStaff = ['superadmin', 'admin_kelurahan', 'admin', 'lurah', 'ketua_rw', 'ketua_rt'].includes(user.role);
    if (!isStaff && user.no_kk && user.no_kk !== baby.no_kk) {
      return res.status(403).json({ success: false, message: 'Akses ditolak: Anda hanya dapat memperbarui data bayi dalam satu Kartu Keluarga.' });
    }

    // Cek apakah NIK definitif sudah dipakai oleh warga lain
    const [existingNik] = await pool.execute('SELECT id FROM warga WHERE nik = ? AND id != ?', [nik_definitif, baby.id]);
    if (existingNik.length > 0) {
      return res.status(400).json({ success: false, message: 'NIK definitif ini sudah terdaftar atas nama warga lain.' });
    }

    // Lakukan pembaruan NIK secara terpadu (Cascade ke posyandu)
    await pool.execute(
      `UPDATE warga 
       SET nik = ?, is_nik_sementara = 0, nik_definitif_updated_at = NOW() 
       WHERE id = ?`,
      [nik_definitif, baby.id]
    );

    // Update foreign reference di tabel posyandu balita
    try {
      await pool.execute('UPDATE posyandu SET nik_warga = ? WHERE nik_warga = ?', [nik_definitif, nik_sementara]);
    } catch (e) {}

    res.json({
      success: true,
      message: `NIK bayi ${baby.nama} berhasil diperbarui menjadi NIK resmi definitif (${nik_definitif}).`,
      data: {
        nama: baby.nama,
        nik_lama: nik_sementara,
        nik_baru: nik_definitif,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error update-nik-bayi:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui NIK definitif bayi: ' + error.message });
  }
});

module.exports = router;
