/**
 * src/routes/rw.routes.js
 * Endpoints for Ketua RW / Admin RW coordination, cross-RT scorecard, and bansos equity oversight.
 * Bumi Warga - Jabar Pintar Digital
 */

const express = require('express');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const { generateCsv, generateExcelXml } = require('../utils/export.util');

const router = express.Router();

/**
 * Helper: Resolve and enforce RW territorial scoping.
 * - Ketua RW & Admin RW can ONLY access their own session RW.
 * - Higher roles (superadmin, lurah, admin_kelurahan, camat, walikota, admin) may narrow via ?rw=
 */
function resolveRWScope(req, res) {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Autentikasi dibutuhkan' });
    return null;
  }

  const isPrivileged = ['superadmin', 'admin_kelurahan', 'lurah', 'admin', 'camat', 'walikota'].includes(user.role);

  if (!isPrivileged) {
    // ketua_rw or admin_rw
    if (req.query.rw && req.query.rw !== user.rw) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya berwenang mengakses data wilayah RW ${user.rw}.`
      });
      return null;
    }
    return user.rw || '001';
  }

  // Privileged user can query specific RW or defaults to session RW or '001'
  return req.query.rw || user.rw || '001';
}

/**
 * GET /api/rw/rekap-rt
 * Rekapitulasi agregat metrik komparatif per RT di bawah naungan RW
 */
router.get('/rekap-rt', requireAuth, requireRole('ketua_rw', 'admin_rw', 'superadmin', 'admin_kelurahan', 'lurah', 'admin'), async (req, res) => {
  try {
    const targetRW = resolveRWScope(req, res);
    if (!targetRW) return; // Response handled by resolveRWScope

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

      // f. Kesehatan & Stunting Balita
      let stuntingBalita = 0;
      let totalBalita = 0;
      try {
        const [[posyanduStats]] = await pool.query(
          `SELECT 
             COUNT(p.id) as total_balita,
             SUM(CASE WHEN p.status_gizi IN ('Gizi Kurang', 'Gizi Buruk') THEN 1 ELSE 0 END) as total_stunting
           FROM posyandu p
           LEFT JOIN warga w ON p.nik_warga = w.nik
           WHERE w.rw = ? AND w.rt = ?`,
          [targetRW, rt]
        );
        totalBalita = Number(posyanduStats?.total_balita || 0);
        stuntingBalita = Number(posyanduStats?.total_stunting || 0);
      } catch (e) {
        // Fallback
      }

      // g. Pendidikan & Anak Usia Sekolah (7-18 tahun)
      let usiaSekolah = 0;
      let anakBalita = 0;
      try {
        const [[eduStats]] = await pool.query(
          `SELECT 
             SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 7 AND 18 THEN 1 ELSE 0 END) as usia_sekolah,
             SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 7 THEN 1 ELSE 0 END) as balita
           FROM warga
           WHERE rw = ? AND rt = ? AND status_kependudukan != 'Meninggal'`,
          [targetRW, rt]
        );
        usiaSekolah = Number(eduStats?.usia_sekolah || 0);
        anakBalita = Number(eduStats?.balita || 0);
      } catch (e) {
        // Fallback
      }

      // h. Desil 1 & 2 Kemiskinan Ekstrem
      let desilCount = 0;
      try {
        const [[dStats]] = await pool.query(
          `SELECT COUNT(DISTINCT w.no_kk) as total
           FROM desil_keluarga dk
           JOIN warga w ON dk.no_kk = w.no_kk
           WHERE w.rw = ? AND w.rt = ? AND COALESCE(dk.desil_saat_ini, dk.desil_usulan) IN (1, 2)`,
          [targetRW, rt]
        );
        desilCount = Number(dStats?.total || 0);
      } catch (e) {
        // Fallback
      }

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
        kesehatan: {
          total_balita: totalBalita,
          stunting: stuntingBalita,
          lansia_total: Number(wargaStats?.lansia_total || 0)
        },
        pendidikan: {
          usia_sekolah: usiaSekolah,
          anak_balita: anakBalita
        },
        kesejahteraan: {
          desil_1_2: desilCount,
          total_yatim: Number(rentanStats?.total_yatim || 0),
          total_lansia_rentan: Number(rentanStats?.total_lansia_rentan || 0)
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
 * GET /api/rw/export/scorecard
 * Ekspor Buku Putih Rekapitulasi RT se-RW ke XLSX / CSV
 */
router.get('/export/scorecard', requireAuth, requireRole('ketua_rw', 'admin_rw', 'superadmin', 'admin_kelurahan', 'lurah', 'admin'), async (req, res) => {
  try {
    const targetRW = resolveRWScope(req, res);
    if (!targetRW) return;

    const format = (req.query.format || 'xlsx').toLowerCase();

    // Ambil daftar RT
    let [rtRows] = await pool.query(
      `SELECT DISTINCT rt FROM warga WHERE rw = ? AND rt IS NOT NULL AND rt != '' ORDER BY rt ASC`,
      [targetRW]
    );
    let rtList = rtRows.map(r => r.rt);
    if (rtList.length === 0) rtList = ['001', '002', '003'];

    const headers = [
      'No',
      'Wilayah RT',
      'Ketua RT',
      'Total Jiwa',
      'Total KK',
      'Anak Usia Sekolah',
      'Balita Posyandu',
      'Kasus Stunting',
      'Lansia',
      'Keluarga Desil 1-2',
      'Surat Pending RT/RW',
      'Hunian Sewa / Kos'
    ];

    const rows = await Promise.all(rtList.map(async (rt, idx) => {
      const [[wargaStats]] = await pool.query(
        `SELECT 
           COUNT(*) as total_warga,
           COUNT(DISTINCT no_kk) as total_kk,
           SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 7 AND 18 THEN 1 ELSE 0 END) as usia_sekolah,
           SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) as lansia_total
         FROM warga WHERE rw = ? AND rt = ?`,
        [targetRW, rt]
      );

      const [[posyanduStats]] = await pool.query(
        `SELECT 
           COUNT(p.id) as total_balita,
           SUM(CASE WHEN p.status_gizi IN ('Gizi Kurang', 'Gizi Buruk') THEN 1 ELSE 0 END) as total_stunting
         FROM posyandu p
         LEFT JOIN warga w ON p.nik_warga = w.nik
         WHERE w.rw = ? AND w.rt = ?`,
        [targetRW, rt]
      ).catch(() => [[{ total_balita: 0, total_stunting: 0 }]]);

      const [[dStats]] = await pool.query(
        `SELECT COUNT(DISTINCT w.no_kk) as total
         FROM desil_keluarga dk
         JOIN warga w ON dk.no_kk = w.no_kk
         WHERE w.rw = ? AND w.rt = ? AND COALESCE(dk.desil_saat_ini, dk.desil_usulan) IN (1, 2)`,
        [targetRW, rt]
      ).catch(() => [[{ total: 0 }]]);

      const [[docStats]] = await pool.query(
        `SELECT COUNT(*) as pending FROM dokumen_request WHERE rw = ? AND rt = ? AND status != 'APPROVED' AND status != 'REJECTED'`,
        [targetRW, rt]
      ).catch(() => [[{ pending: 0 }]]);

      const [[sewaStats]] = await pool.query(
        `SELECT COUNT(*) as total_hunian FROM hunian_sewa WHERE rw = ? AND rt = ?`,
        [targetRW, rt]
      ).catch(() => [[{ total_hunian: 0 }]]);

      const [ketuaRows] = await pool.query(
        `SELECT u.nama FROM users u WHERE u.role = 'ketua_rt' AND u.rw = ? AND u.rt = ? LIMIT 1`,
        [targetRW, rt]
      );
      const namaKetua = ketuaRows.length > 0 ? (ketuaRows[0].nama || `Ketua RT ${rt}`) : `Ketua RT ${rt}`;

      return [
        idx + 1,
        `RT ${rt}`,
        namaKetua,
        { value: Number(wargaStats?.total_warga || 0), type: 'Number' },
        { value: Number(wargaStats?.total_kk || 0), type: 'Number' },
        { value: Number(wargaStats?.usia_sekolah || 0), type: 'Number' },
        { value: Number(posyanduStats?.total_balita || 0), type: 'Number' },
        { value: Number(posyanduStats?.total_stunting || 0), type: 'Number' },
        { value: Number(wargaStats?.lansia_total || 0), type: 'Number' },
        { value: Number(dStats?.total || 0), type: 'Number' },
        { value: Number(docStats?.pending || 0), type: 'Number' },
        { value: Number(sewaStats?.total_hunian || 0), type: 'Number' }
      ];
    }));

    if (format === 'csv') {
      const csvRows = rows.map(r => r.map(c => typeof c === 'object' && c !== null ? c.value : c));
      const csv = generateCsv(headers, csvRows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=Buku_Putih_RW${targetRW}_${Date.now()}.csv`);
      return res.send(csv);
    }

    const xml = generateExcelXml(`Buku Putih Rekapitulasi RW ${targetRW}`, [
      {
        name: `Buku Putih RW ${targetRW}`,
        headers,
        rows
      }
    ]);

    res.setHeader('Content-Type', 'application/vnd.ms-excel');
    res.setHeader('Content-Disposition', `attachment; filename=Buku_Putih_RW${targetRW}_${Date.now()}.xls`);
    return res.send(xml);
  } catch (err) {
    console.error('Error exporting RW scorecard:', err);
    res.status(500).json({ success: false, message: 'Gagal mengekspor data buku putih RW' });
  }
});

/**
 * GET /api/rw/kpi
 * Ringkasan metrik eksekutif tingkat RW
 */
router.get('/kpi', requireAuth, requireRole('ketua_rw', 'admin_rw', 'superadmin', 'admin_kelurahan', 'lurah', 'admin'), async (req, res) => {
  try {
    const targetRW = resolveRWScope(req, res);
    if (!targetRW) return;

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
    const targetRW = resolveRWScope(req, res);
    if (!targetRW) return;

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

