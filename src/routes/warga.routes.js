/**
 * src/routes/warga.routes.js
 * Warga API endpoints with Scoped List, Assisted Offline Registration, and Bulk Import.
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const wargaService = require('../services/warga.service');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/warga - Daftar warga dengan pagination, pencarian, dan scoping terpadu
router.get('/', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = parseInt(req.query.offset, 10) || 0;
    const search = req.query.search || '';
    const rt = req.query.rt || null;
    const rw = req.query.rw || null;

    const data = await wargaService.listWarga({ limit, offset, search, rt, rw }, req.session.user);
    res.json({ success: true, ...data });
  } catch (error) {
    console.error('Error fetching list warga:', error.message);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
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

// GET /api/warga/:nik - Detail profil warga
router.get('/:nik', requireAuth, async (req, res) => {
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

module.exports = router;
