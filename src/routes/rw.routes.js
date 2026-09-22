/**
 * src/routes/rw.routes.js
 * Endpoints for Ketua RW / Admin RW coordination, cross-RT scorecard, and bansos equity oversight.
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * GET /api/rw/rekap-rt
 * Rekapitulasi agregat metrik komparatif per RT di bawah naungan RW
 */
router.get('/rekap-rt', requireAuth, requireRole('ketua_rw', 'admin_rw', 'superadmin', 'admin_kelurahan', 'lurah', 'admin'), async (req, res) => {
  try {
    const targetRW = req.query.rw || req.session.user.rw || '001';

    // 1. Ambil daftar RT yang terdaftar di bawah RW ini
    let [rtRows] = await pool.query(
      `SELECT DISTINCT rt FROM warga WHERE rw = ? AND rt IS NOT NULL AND rt != '' ORDER BY rt ASC`,
      [targetRW]
    );

    let rtList = rtRows.map(r => r.rt);
    if (rtList.length === 0) {
      rtList = ['001', '002', '003'];
    }

    // 2. Loop & aggregasi metrik per RT
    const scorecard = await Promise.all(rtList.map(async (rt) => {
      // a. Demografi warga & KK
      const [[wargaStats]] = await pool.query(
        `SELECT 
           COUNT(*) as total_warga,
           COUNT(DISTINCT no_kk) as total_kk,
           SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as pria,
           SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as wanita,
           SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) as lansia_total
         FROM warga WHERE rw = ? AND rt = ?`,
        [targetRW, rt]
      );

      // b. Antrean dokumen pending
      const [[docStats]] = await pool.query(
        `SELECT 
           SUM(CASE WHEN approval_step = 'RW' AND status = 'VERIFYING' THEN 1 ELSE 0 END) as pending_rw,
           SUM(CASE WHEN approval_step = 'RT' THEN 1 ELSE 0 END) as pending_rt,
           COUNT(*) as total_surat_masuk
         FROM dokumen_request WHERE rw = ? AND rt = ?`,
        [targetRW, rt]
      );

      // c. Kelompok rentan (Anak Yatim Piatu & Lansia Sebatang Kara)
      const [[rentanStats]] = await pool.query(
        `SELECT 
           SUM(CASE WHEN kategori IN ('YATIM', 'PIATU', 'YATIM_PIATU') THEN 1 ELSE 0 END) as total_yatim,
           SUM(CASE WHEN kategori = 'LANSIA_SEBATANG_KARA' THEN 1 ELSE 0 END) as total_lansia_rentan,
           SUM(CASE WHEN adl_kemandirian = 'Tirah Baring' THEN 1 ELSE 0 END) as lansia_bedridden
         FROM kelompok_rentan_rt WHERE rw = ? AND rt = ?`,
        [targetRW, rt]
      ).catch(() => [[{ total_yatim: 0, total_lansia_rentan: 0, lansia_bedridden: 0 }]]);

      // d. Hunian sewa (Kos & Kontrakan)
      const [[sewaStats]] = await pool.query(
        `SELECT 
           COUNT(*) as total_hunian,
           COALESCE(SUM(jumlah_kamar), 0) as total_kamar,
           COALESCE(SUM(kamar_terisi), 0) as kamar_terisi
         FROM hunian_sewa WHERE rw = ? AND rt = ?`,
        [targetRW, rt]
      ).catch(() => [[{ total_hunian: 0, total_kamar: 0, kamar_terisi: 0 }]]);

      // e. Informasi Ketua RT aktif
      const [ketuaRows] = await pool.query(
        `SELECT 
           u.id, u.username, u.nama, u.nomor_telepon,
           w.nama as warga_nama, w.no_telepon as warga_telp
         FROM users u
         LEFT JOIN warga w ON u.username = w.nik
         WHERE u.role = 'ketua_rt' AND u.rw = ? AND u.rt = ?
         LIMIT 1`,
        [targetRW, rt]
      );

      const ketuaInfo = ketuaRows.length > 0 ? {
        nama: ketuaRows[0].nama || ketuaRows[0].warga_nama || `Ketua RT ${rt}`,
        telepon: ketuaRows[0].nomor_telepon || ketuaRows[0].warga_telp || '08123456789'
      } : {
        nama: `Ketua RT ${rt}`,
        telepon: '08123456789'
      };

      const kamarTotal = Number(sewaStats?.total_kamar || 0);
      const kamarTerisi = Number(sewaStats?.kamar_terisi || 0);
      const occupancyRate = kamarTotal > 0 ? Math.round((kamarTerisi / kamarTotal) * 100) : 0;

      return {
        rt,
        rw: targetRW,
        ketua_rt: ketuaInfo,
        demografi: {
          total_warga: Number(wargaStats?.total_warga || 0),
          total_kk: Number(wargaStats?.total_kk || 0),
          pria: Number(wargaStats?.pria || 0),
          wanita: Number(wargaStats?.wanita || 0),
          lansia_total: Number(wargaStats?.lansia_total || 0)
        },
        pelayanan: {
          pending_rw: Number(docStats?.pending_rw || 0),
          pending_rt: Number(docStats?.pending_rt || 0),
          total_surat: Number(docStats?.total_surat_masuk || 0)
        },
        sosial: {
          total_yatim: Number(rentanStats?.total_yatim || 0),
          total_lansia_rentan: Number(rentanStats?.total_lansia_rentan || 0),
          lansia_bedridden: Number(rentanStats?.lansia_bedridden || 0)
        },
        hunian_sewa: {
          total_hunian: Number(sewaStats?.total_hunian || 0),
          total_kamar: kamarTotal,
          kamar_terisi: kamarTerisi,
          occupancy_rate: occupancyRate
        }
      };
    }));

    res.json({
      success: true,
      rw: targetRW,
      total_rt: rtList.length,
      data: scorecard
    });
  } catch (error) {
    console.error('Error fetching RW scorecard:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/rw/kpi
 * Ringkasan metrik eksekutif tingkat RW
 */
router.get('/kpi', requireAuth, requireRole('ketua_rw', 'admin_rw', 'superadmin', 'admin_kelurahan', 'lurah', 'admin'), async (req, res) => {
  try {
    const targetRW = req.query.rw || req.session.user.rw || '001';

    // Total RT
    const [rtRows] = await pool.query(
      `SELECT COUNT(DISTINCT rt) as total_rt FROM warga WHERE rw = ? AND rt IS NOT NULL AND rt != ''`,
      [targetRW]
    );

    // Total Jiwa & KK
    const [[wargaSum]] = await pool.query(
      `SELECT COUNT(*) as total_jiwa, COUNT(DISTINCT no_kk) as total_kk FROM warga WHERE rw = ?`,
      [targetRW]
    );

    // Antrean Surat Butuh Validasi RW
    const [[docSum]] = await pool.query(
      `SELECT COUNT(*) as pending_rw FROM dokumen_request WHERE rw = ? AND approval_step = 'RW' AND status = 'VERIFYING'`,
      [targetRW]
    );

    // Total Kelompok Rentan
    const [[rentanSum]] = await pool.query(
      `SELECT 
         SUM(CASE WHEN kategori IN ('YATIM', 'PIATU', 'YATIM_PIATU') THEN 1 ELSE 0 END) as total_yatim,
         SUM(CASE WHEN kategori = 'LANSIA_SEBATANG_KARA' THEN 1 ELSE 0 END) as total_lansia
       FROM kelompok_rentan_rt WHERE rw = ?`,
      [targetRW]
    ).catch(() => [[{ total_yatim: 0, total_lansia: 0 }]]);

    // Total Hunian Sewa
    const [[sewaSum]] = await pool.query(
      `SELECT COUNT(*) as total_kos, COALESCE(SUM(jumlah_kamar), 0) as total_kamar, COALESCE(SUM(kamar_terisi), 0) as total_terisi FROM hunian_sewa WHERE rw = ?`,
      [targetRW]
    ).catch(() => [[{ total_kos: 0, total_kamar: 0, total_terisi: 0 }]]);

    res.json({
      success: true,
      data: {
        rw: targetRW,
        total_rt: Number(rtRows[0]?.total_rt || 3),
        total_jiwa: Number(wargaSum?.total_jiwa || 0),
        total_kk: Number(wargaSum?.total_kk || 0),
        pending_rw: Number(docSum?.pending_rw || 0),
        kelompok_rentan: {
          total_yatim: Number(rentanSum?.total_yatim || 0),
          total_lansia: Number(rentanSum?.total_lansia || 0),
          total: Number(rentanSum?.total_yatim || 0) + Number(rentanSum?.total_lansia || 0)
        },
        hunian_sewa: {
          total_kos: Number(sewaSum?.total_kos || 0),
          total_kamar: Number(sewaSum?.total_kamar || 0),
          total_terisi: Number(sewaSum?.total_terisi || 0)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching RW KPI:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/rw/bansos-equity
 * Matriks sebaran penerima bansos antar-RT untuk pengawasan keadilan/ekuitas
 */
router.get('/bansos-equity', requireAuth, requireRole('ketua_rw', 'admin_rw', 'superadmin', 'admin_kelurahan', 'lurah', 'admin'), async (req, res) => {
  try {
    const targetRW = req.query.rw || req.session.user.rw || '001';

    const [rows] = await pool.query(
      `SELECT 
         rt, 
         jenis_bansos,
         COUNT(*) as total_penerima,
         COALESCE(SUM(nominal_bantuan), 0) as total_nominal
       FROM bansos_penerima 
       WHERE rw = ? 
       GROUP BY rt, jenis_bansos
       ORDER BY rt ASC`,
      [targetRW]
    ).catch(() => [[]]);

    res.json({
      success: true,
      rw: targetRW,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching RW bansos equity:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

