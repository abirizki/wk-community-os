/**
 * src/routes/analytics.routes.js
 * API Endpoints for AI Decision Support & Executive Leadership Analytics
 * Kelurahan Kebonjati, Kec. Cikole, Kota Sukabumi - Jabar Pintar Digital
 */

const express = require('express');
const pool = require('../db/pool');
const aiEngineService = require('../services/ai_engine.service');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * Helper: Resolve and enforce territorial scoping for analytics.
 * Ensures RT cannot view other RTs, RW cannot view other RWs, etc.
 */
function resolveAnalyticsScope(req, res) {
  const user = req.session.user;
  if (!user) {
    res.status(401).json({ success: false, message: 'Autentikasi dibutuhkan' });
    return null;
  }

  // 1. Ketua RT: terkunci hanya pada RT & RW sesi
  if (user.role === 'ketua_rt') {
    if (req.query.rt && req.query.rt !== 'all' && req.query.rt !== user.rt) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya berwenang mengakses data analitik RT ${user.rt}.`
      });
      return null;
    }
    if (req.query.rw && req.query.rw !== user.rw) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya berwenang mengakses data analitik RW ${user.rw}.`
      });
      return null;
    }
    return { rt: user.rt || '001', rw: user.rw || '001' };
  }

  // 2. Ketua RW / Admin RW: terkunci hanya pada RW sesi. Boleh mempersempit RT.
  if (['ketua_rw', 'admin_rw'].includes(user.role)) {
    if (req.query.rw && req.query.rw !== user.rw) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya berwenang mengakses data analitik RW ${user.rw}.`
      });
      return null;
    }
    const targetRT = (req.query.rt && req.query.rt !== 'all') ? req.query.rt : null;
    return { rt: targetRT, rw: user.rw || '001' };
  }

  // 3. Admin Kelurahan, Lurah, Camat, Walikota, Superadmin
  const targetRT = (req.query.rt && req.query.rt !== 'all') ? req.query.rt : null;
  const targetRW = req.query.rw || user.rw || '001';
  return { rt: targetRT, rw: targetRW };
}

// GET /api/analytics/executive-summary - Ringkasan Eksekutif & Matriks Kewilayahan
router.get('/executive-summary', requireAuth, async (req, res) => {
  try {
    const summary = await aiEngineService.getExecutiveSummary(req.session.user);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal memuat ringkasan eksekutif'
    });
  }
});

// GET /api/analytics/ai-insights - Rekomendasi Cerdas AI Terperinci
router.get('/ai-insights', requireAuth, async (req, res) => {
  try {
    const insights = await aiEngineService.getAIInsights(req.session.user);
    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal memuat rekomendasi AI'
    });
  }
});

// GET /api/analytics/role-brief - Ringkasan Harian Berbasis Peran (Role-Scoped AI Brief)
router.get('/role-brief', requireAuth, async (req, res) => {
  try {
    const brief = await aiEngineService.getRoleScopedBrief(req.session.user);
    res.json({
      success: true,
      data: brief
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Gagal memuat ringkasan harian'
    });
  }
});

// GET /api/analytics/demografi - Analitik Piramida Penduduk & Matriks Spasial RT
router.get('/demografi', requireAuth, async (req, res) => {
  try {
    const scope = resolveAnalyticsScope(req, res);
    if (!scope) return;

    let whereWarga = "WHERE status_kependudukan != 'Meninggal'";
    const paramsWarga = [];

    if (scope.rw) {
      whereWarga += " AND rw = ?";
      paramsWarga.push(scope.rw);
    }
    if (scope.rt) {
      whereWarga += " AND rt = ?";
      paramsWarga.push(scope.rt);
    }

    // 15 Kelompok Usia Kohort Piramida Standar BPS
    const cohorts = [
      { label: '0 - 4 Thn', min: 0, max: 4 },
      { label: '5 - 9 Thn', min: 5, max: 9 },
      { label: '10 - 14 Thn', min: 10, max: 14 },
      { label: '15 - 19 Thn', min: 15, max: 19 },
      { label: '20 - 24 Thn', min: 20, max: 24 },
      { label: '25 - 29 Thn', min: 25, max: 29 },
      { label: '30 - 34 Thn', min: 30, max: 34 },
      { label: '35 - 39 Thn', min: 35, max: 39 },
      { label: '40 - 44 Thn', min: 40, max: 44 },
      { label: '45 - 49 Thn', min: 45, max: 49 },
      { label: '50 - 54 Thn', min: 50, max: 54 },
      { label: '55 - 59 Thn', min: 55, max: 59 },
      { label: '60 - 64 Thn', min: 60, max: 64 },
      { label: '65 - 69 Thn', min: 65, max: 69 },
      { label: '70+ Thn', min: 70, max: 150 }
    ];

    const cohortSelects = cohorts.map((c, i) => `
      SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN ${c.min} AND ${c.max} AND jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS pria_${i},
      SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN ${c.min} AND ${c.max} AND jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS wanita_${i}
    `).join(',');

    const [cohortRows] = await pool.query(
      `SELECT ${cohortSelects} FROM warga ${whereWarga}`,
      paramsWarga
    );

    const piramida = cohorts.map((c, i) => ({
      kelompok_usia: c.label,
      pria: Number(cohortRows[0]?.[`pria_${i}`] || 0),
      wanita: Number(cohortRows[0]?.[`wanita_${i}`] || 0)
    }));

    // Top Profesi & Pekerjaan
    const [pekerjaanRows] = await pool.query(
      `SELECT pekerjaan as label, COUNT(*) as count 
       FROM warga ${whereWarga} AND pekerjaan IS NOT NULL AND pekerjaan != '' 
       GROUP BY pekerjaan 
       ORDER BY count DESC 
       LIMIT 8`,
      paramsWarga
    );

    // Sebaran Agama
    const [agamaRows] = await pool.query(
      `SELECT agama as label, COUNT(*) as count 
       FROM warga ${whereWarga} AND agama IS NOT NULL AND agama != '' 
       GROUP BY agama 
       ORDER BY count DESC`,
      paramsWarga
    );

    // Jenjang Pendidikan Terakhir
    const [pendidikanRows] = await pool.query(
      `SELECT pendidikan_terakhir as label, COUNT(*) as count 
       FROM warga ${whereWarga} AND pendidikan_terakhir IS NOT NULL AND pendidikan_terakhir != '' 
       GROUP BY pendidikan_terakhir 
       ORDER BY count DESC 
       LIMIT 6`,
      paramsWarga
    );

    // Matriks Heatmap Spasial RT
    const [rtRows] = await pool.query(
      `SELECT DISTINCT rt FROM warga WHERE rw = ? AND rt IS NOT NULL AND rt != '' ORDER BY rt ASC`,
      [scope.rw || '001']
    );
    let rtList = rtRows.map(r => r.rt);
    if (rtList.length === 0) rtList = ['001', '002', '003', '004', '005'];

    const spatial_heatmap = await Promise.all(rtList.map(async (rt) => {
      const [[wStats]] = await pool.query(
        `SELECT 
           COUNT(*) as total_warga,
           COUNT(DISTINCT no_kk) as total_kk,
           SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as pria,
           SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as wanita,
           SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN 1 ELSE 0 END) as balita,
           SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) as lansia
         FROM warga WHERE rw = ? AND rt = ? AND status_kependudukan != 'Meninggal'`,
        [scope.rw || '001', rt]
      );

      let desilCount = 0;
      try {
        const [[dStats]] = await pool.query(
          `SELECT COUNT(DISTINCT w.no_kk) as total 
           FROM desil_keluarga dk 
           JOIN warga w ON dk.no_kk = w.no_kk 
           WHERE w.rw = ? AND w.rt = ? AND COALESCE(dk.desil_saat_ini, dk.desil_usulan) IN (1, 2)`,
          [scope.rw || '001', rt]
        );
        desilCount = dStats?.total || 0;
      } catch (e) {
        // Fallback
      }

      let pbbKepatuhan = 0;
      try {
        const [[pStats]] = await pool.query(
          `SELECT COUNT(*) as total_nop, SUM(CASE WHEN status_pembayaran = 'Lunas' THEN 1 ELSE 0 END) as total_lunas 
           FROM pbb_sppt WHERE rw = ? AND rt = ?`,
          [scope.rw || '001', rt]
        );
        if (pStats?.total_nop > 0) {
          pbbKepatuhan = Math.round((Number(pStats.total_lunas || 0) / Number(pStats.total_nop)) * 100);
        }
      } catch (e) {
        // Fallback
      }

      return {
        rt,
        rw: scope.rw || '001',
        total_warga: Number(wStats?.total_warga || 0),
        total_kk: Number(wStats?.total_kk || 0),
        pria: Number(wStats?.pria || 0),
        wanita: Number(wStats?.wanita || 0),
        balita: Number(wStats?.balita || 0),
        lansia: Number(wStats?.lansia || 0),
        desil_rentan_kk: Number(desilCount),
        pbb_kepatuhan_persen: pbbKepatuhan
      };
    }));

    res.json({
      success: true,
      data: {
        scope,
        piramida,
        pekerjaan: pekerjaanRows,
        agama: agamaRows,
        pendidikan: pendidikanRows,
        spatial_heatmap
      }
    });
  } catch (error) {
    console.error('Error fetching analytics demografi:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat analitik demografi' });
  }
});

// GET /api/analytics/dokumen - Analitik Pipeline Permohonan Dokumen & Kecepatan Layanan
router.get('/dokumen', requireAuth, async (req, res) => {
  try {
    const scope = resolveAnalyticsScope(req, res);
    if (!scope) return;

    let whereDoc = "WHERE 1=1";
    const paramsDoc = [];
    if (scope.rw) {
      whereDoc += " AND rw = ?";
      paramsDoc.push(scope.rw);
    }
    if (scope.rt) {
      whereDoc += " AND rt = ?";
      paramsDoc.push(scope.rt);
    }

    const period = req.query.period || '30d';
    if (period === '7d') {
      whereDoc += " AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === '30d') {
      whereDoc += " AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    } else if (period === 'q') {
      whereDoc += " AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
    } else if (period === 'ytd') {
      whereDoc += " AND created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)";
    }

    const [[docSummary]] = await pool.query(
      `SELECT 
         COUNT(*) as total_pengajuan,
         SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as step_selesai,
         SUM(CASE WHEN approval_step = 'RT' THEN 1 ELSE 0 END) as pending_rt,
         SUM(CASE WHEN approval_step = 'RW' THEN 1 ELSE 0 END) as pending_rw,
         SUM(CASE WHEN approval_step = 'KELURAHAN' THEN 1 ELSE 0 END) as pending_kelurahan,
         AVG(CASE WHEN status = 'APPROVED' THEN TIMESTAMPDIFF(MINUTE, created_at, updated_at)/60 ELSE NULL END) as avg_sla_jam
       FROM dokumen_request ${whereDoc}`,
      paramsDoc
    );

    let assistedCount = 0;
    try {
      const [[assistRow]] = await pool.query(
        `SELECT COUNT(*) as total FROM dokumen_request ${whereDoc} AND (keperluan LIKE '%dampingan%' OR keperluan LIKE '%offline%')`,
        paramsDoc
      );
      assistedCount = assistRow?.total || 0;
    } catch (e) {
      // Fallback
    }

    const [byTypeRows] = await pool.query(
      `SELECT jenis_dokumen, COUNT(*) as count FROM dokumen_request ${whereDoc} GROUP BY jenis_dokumen ORDER BY count DESC`,
      paramsDoc
    );

    res.json({
      success: true,
      data: {
        scope,
        period,
        pipeline: {
          total_pengajuan: Number(docSummary?.total_pengajuan || 0),
          step_selesai: Number(docSummary?.step_selesai || 0),
          total_assisted_submission: Number(assistedCount),
          pending_rt: Number(docSummary?.pending_rt || 0),
          pending_rw: Number(docSummary?.pending_rw || 0),
          pending_kelurahan: Number(docSummary?.pending_kelurahan || 0),
          rata_sla_jam: Number((Number(docSummary?.avg_sla_jam || 0)).toFixed(1))
        },
        by_type: byTypeRows
      }
    });
  } catch (error) {
    console.error('Error fetching analytics dokumen:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat analitik dokumen' });
  }
});

module.exports = router;
