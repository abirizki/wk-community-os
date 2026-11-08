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

  const allowedRoles = ['admin_kelurahan', 'admin', 'staf_kelurahan', 'lurah', 'ketua_rt', 'ketua_rw', 'admin_rw', 'camat', 'walikota', 'superadmin'];
  if (!allowedRoles.includes(user.role)) {
    res.status(403).json({ success: false, message: 'Akses analitik hanya tersedia untuk petugas wilayah.' });
    return null;
  }

  const areaScope = user.kelurahan ? { kelurahan: user.kelurahan } : {};
  const requestedRW = req.query.rw && req.query.rw !== 'all' ? String(req.query.rw) : null;
  const requestedRT = req.query.rt && req.query.rt !== 'all' ? String(req.query.rt) : null;

  // 1. Ketua RT: terkunci hanya pada RT & RW sesi
  if (user.role === 'ketua_rt') {
    if (!user.rt || !user.rw) {
      res.status(403).json({ success: false, message: 'Cakupan RT/RW tidak tersedia pada sesi pengguna.' });
      return null;
    }
    if (requestedRT && requestedRT !== user.rt) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya berwenang mengakses data analitik RT ${user.rt}.`
      });
      return null;
    }
    if (requestedRW && requestedRW !== user.rw) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya berwenang mengakses data analitik RW ${user.rw}.`
      });
      return null;
    }
    return { ...areaScope, rt: user.rt, rw: user.rw };
  }

  // 2. Ketua RW / Admin RW: terkunci hanya pada RW sesi. Boleh mempersempit RT.
  if (['ketua_rw', 'admin_rw'].includes(user.role)) {
    if (!user.rw) {
      res.status(403).json({ success: false, message: 'Cakupan RW tidak tersedia pada sesi pengguna.' });
      return null;
    }
    if (requestedRW && requestedRW !== user.rw) {
      res.status(403).json({
        success: false,
        message: `Akses ditolak: Anda hanya berwenang mengakses data analitik RW ${user.rw}.`
      });
      return null;
    }
    return { ...areaScope, rt: requestedRT, rw: user.rw };
  }

  // 3. Petugas kelurahan may filter within their session kelurahan.
  if (['admin_kelurahan', 'admin', 'staf_kelurahan', 'lurah'].includes(user.role)) {
    if (!user.kelurahan) {
      res.status(403).json({ success: false, message: 'Cakupan kelurahan tidak tersedia pada sesi pengguna.' });
      return null;
    }
    return { ...areaScope, rt: requestedRT, rw: requestedRW };
  }

  // 4. Executive roles remain bounded by their active tenant / kecamatan.
  if (user.role === 'camat') {
    if (!user.kelurahan) {
      res.status(403).json({ success: false, message: 'Pilih cakupan kelurahan sebelum membuka analitik.' });
      return null;
    }
    return { ...areaScope, rt: requestedRT, rw: requestedRW };
  }
  if (user.active_tenant?.kode_kelurahan) {
    return {
      ...areaScope,
      kelurahan: user.active_tenant.nama_kelurahan || user.kelurahan,
      rt: requestedRT,
      rw: requestedRW
    };
  }
  return { rt: requestedRT, rw: requestedRW };
}

// GET /api/analytics/executive-summary - Ringkasan Eksekutif & Matriks Kewilayahan
router.get('/executive-summary', requireAuth, async (req, res) => {
  try {
    const scope = resolveAnalyticsScope(req, res);
    if (!scope) return;
    const summary = await aiEngineService.getExecutiveSummary(req.session.user, scope);
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
    const scope = resolveAnalyticsScope(req, res);
    if (!scope) return;
    const insights = await aiEngineService.getAIInsights(req.session.user, scope);
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
    const scope = resolveAnalyticsScope(req, res);
    if (!scope) return;
    const brief = await aiEngineService.getRoleScopedBrief(req.session.user, scope);
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

    if (scope.kelurahan) {
      whereWarga += " AND kelurahan = ?";
      paramsWarga.push(scope.kelurahan);
    }
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
    let territoryWhere = "WHERE status_kependudukan != 'Meninggal' AND rt IS NOT NULL AND rt != ''";
    const territoryParams = [];
    if (scope.kelurahan) {
      territoryWhere += " AND kelurahan = ?";
      territoryParams.push(scope.kelurahan);
    }
    const [rwRows] = await pool.query(
      `SELECT DISTINCT rw FROM warga ${territoryWhere} ORDER BY rw ASC`,
      territoryParams
    );

    let rtOptionsWhere = territoryWhere;
    const rtOptionsParams = [...territoryParams];
    if (scope.rw) {
      rtOptionsWhere += " AND rw = ?";
      rtOptionsParams.push(scope.rw);
    }
    const [rtOptionRows] = await pool.query(
      `SELECT DISTINCT rt FROM warga ${rtOptionsWhere} ORDER BY rt ASC`,
      rtOptionsParams
    );

    let rtWhere = rtOptionsWhere;
    const rtParams = [...rtOptionsParams];
    if (scope.rt) {
      rtWhere += " AND rt = ?";
      rtParams.push(scope.rt);
    }
    const [rtDataRows] = await pool.query(
      `SELECT DISTINCT rw, rt FROM warga ${rtWhere} ORDER BY rw ASC, rt ASC`,
      rtParams
    );
    const rtList = rtDataRows.map(r => ({ rw: r.rw, rt: r.rt }));

    const spatial_heatmap = await Promise.all(rtList.map(async ({ rw, rt }) => {
      let whereRT = "WHERE rt = ? AND rw = ? AND status_kependudukan != 'Meninggal'";
      const paramsRT = [rt, rw];
      if (scope.kelurahan) {
        whereRT += " AND kelurahan = ?";
        paramsRT.push(scope.kelurahan);
      }
      const [[wStats]] = await pool.query(
        `SELECT 
           COUNT(*) as total_warga,
           COUNT(DISTINCT no_kk) as total_kk,
           SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) as pria,
           SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) as wanita,
           SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN 1 ELSE 0 END) as balita,
           SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) as lansia
         FROM warga ${whereRT}`,
        paramsRT
      );

      let whereKK = "WHERE kk.rt = ? AND kk.rw = ? AND COALESCE(dk.desil_saat_ini, dk.desil_usulan) IN (1, 2)";
      const paramsKK = [rt, rw];
      if (scope.kelurahan) {
        whereKK += " AND kk.kelurahan = ?";
        paramsKK.push(scope.kelurahan);
      }
      const [[dStats]] = await pool.query(
        `SELECT COUNT(DISTINCT kk.no_kk) as total
         FROM desil_keluarga dk
         JOIN kartu_keluarga kk ON dk.no_kk = kk.no_kk
         ${whereKK}`,
        paramsKK
      );

      let pbbKepatuhan = null;
      try {
        const [[pStats]] = await pool.query(
          `SELECT COUNT(*) as total_nop,
                  SUM(CASE WHEN p.status_pembayaran = 'PAID' THEN 1 ELSE 0 END) as total_lunas
           FROM pbb p
           LEFT JOIN warga w ON p.nik_warga = w.nik
           WHERE COALESCE(p.rt, w.rt) = ?
             AND (? IS NULL OR COALESCE(p.rw, w.rw) = ?)
             AND (? IS NULL OR w.kelurahan = ?)`,
          [rt, rw, rw, scope.kelurahan || null, scope.kelurahan || null]
        );
        if (pStats?.total_nop > 0) {
          pbbKepatuhan = Math.round((Number(pStats.total_lunas || 0) / Number(pStats.total_nop)) * 100);
        }
      } catch (e) {
        console.warn('[Analytics] PBB summary unavailable:', e.message);
      }

      return {
        rt,
        rw,
        total_warga: Number(wStats?.total_warga || 0),
        total_kk: Number(wStats?.total_kk || 0),
        pria: Number(wStats?.pria || 0),
        wanita: Number(wStats?.wanita || 0),
        balita: Number(wStats?.balita || 0),
        lansia: Number(wStats?.lansia || 0),
        desil_rentan_kk: Number(dStats?.total || 0),
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
        spatial_heatmap,
        rw_options: rwRows.map(r => r.rw),
        rt_options: rtOptionRows.map(r => r.rt)
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
      whereDoc += " AND d.rw = ?";
      paramsDoc.push(scope.rw);
    }
    if (scope.rt) {
      whereDoc += " AND d.rt = ?";
      paramsDoc.push(scope.rt);
    }
    if (scope.kelurahan) {
      whereDoc += " AND w.kelurahan = ?";
      paramsDoc.push(scope.kelurahan);
    }

    const validPeriods = ['7d', '30d', 'q', 'ytd'];
    const period = validPeriods.includes(req.query.period) ? req.query.period : '30d';
    if (period === '7d') {
      whereDoc += " AND d.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
    } else if (period === '30d') {
      whereDoc += " AND d.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
    } else if (period === 'q') {
      whereDoc += " AND d.created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)";
    } else if (period === 'ytd') {
      whereDoc += " AND YEAR(d.created_at) = YEAR(CURDATE())";
    }

    const [[docSummary]] = await pool.query(
      `SELECT 
         COUNT(*) as total_pengajuan,
         SUM(CASE WHEN d.status IN ('APPROVED', 'COMPLETED') THEN 1 ELSE 0 END) as step_selesai,
         SUM(CASE WHEN d.status = 'REJECTED' THEN 1 ELSE 0 END) as ditolak,
         SUM(CASE WHEN d.status NOT IN ('APPROVED', 'COMPLETED', 'REJECTED') AND d.approval_step = 'RT' THEN 1 ELSE 0 END) as pending_rt,
         SUM(CASE WHEN d.status NOT IN ('APPROVED', 'COMPLETED', 'REJECTED') AND d.approval_step = 'RW' THEN 1 ELSE 0 END) as pending_rw,
         SUM(CASE WHEN d.status NOT IN ('APPROVED', 'COMPLETED', 'REJECTED') AND d.approval_step = 'KELURAHAN' THEN 1 ELSE 0 END) as pending_kelurahan,
         AVG(CASE WHEN d.status IN ('APPROVED', 'COMPLETED') THEN TIMESTAMPDIFF(MINUTE, d.created_at, d.updated_at)/60 ELSE NULL END) as avg_sla_jam
       FROM dokumen_request d
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       ${whereDoc}`,
      paramsDoc
    );

    let assistedCount = 0;
    try {
      const [[assistRow]] = await pool.query(
        `SELECT COUNT(*) as total FROM dokumen_request d
         LEFT JOIN warga w ON d.nik_pemohon = w.nik
         ${whereDoc} AND (d.keperluan LIKE '%dampingan%' OR d.keperluan LIKE '%offline%')`,
        paramsDoc
      );
      assistedCount = assistRow?.total || 0;
    } catch (e) {
      console.warn('[Analytics] Assisted submission metric unavailable:', e.message);
    }

    const [byTypeRows] = await pool.query(
      `SELECT COALESCE(NULLIF(d.jenis_dokumen, ''), d.jenis_surat) as jenis_dokumen,
              COUNT(*) as count,
              AVG(CASE WHEN d.status IN ('APPROVED', 'COMPLETED')
                       THEN TIMESTAMPDIFF(MINUTE, d.created_at, d.updated_at)/60
                       ELSE NULL END) as rata_jam
       FROM dokumen_request d
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       ${whereDoc}
       GROUP BY COALESCE(NULLIF(d.jenis_dokumen, ''), d.jenis_surat)
       ORDER BY count DESC`,
      paramsDoc
    );
    const [byRT] = await pool.query(
      `SELECT d.rw, d.rt,
              COUNT(*) AS total,
              SUM(CASE WHEN d.status IN ('APPROVED', 'COMPLETED') THEN 1 ELSE 0 END) AS selesai,
              SUM(CASE WHEN d.status = 'REJECTED' THEN 1 ELSE 0 END) AS ditolak,
              SUM(CASE WHEN d.status NOT IN ('APPROVED', 'COMPLETED', 'REJECTED') THEN 1 ELSE 0 END) AS dalam_proses,
              AVG(CASE WHEN d.status IN ('APPROVED', 'COMPLETED')
                       THEN TIMESTAMPDIFF(MINUTE, d.created_at, d.updated_at)/60
                       ELSE NULL END) AS rata_jam
       FROM dokumen_request d
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       ${whereDoc}
       GROUP BY d.rw, d.rt
       ORDER BY d.rw, d.rt`,
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
          ditolak: Number(docSummary?.ditolak || 0),
          total_assisted_submission: Number(assistedCount),
          pending_rt: Number(docSummary?.pending_rt || 0),
          pending_rw: Number(docSummary?.pending_rw || 0),
          pending_kelurahan: Number(docSummary?.pending_kelurahan || 0),
          rata_sla_jam: docSummary?.avg_sla_jam == null ? null : Number(Number(docSummary.avg_sla_jam).toFixed(1))
        },
        by_type: byTypeRows.map(row => ({
          jenis_dokumen: row.jenis_dokumen,
          count: Number(row.count || 0),
          rata_jam: row.rata_jam == null ? null : Number(Number(row.rata_jam).toFixed(1))
        })),
        by_rt: byRT.map(row => ({
          rw: row.rw,
          rt: row.rt,
          total: Number(row.total || 0),
          selesai: Number(row.selesai || 0),
          ditolak: Number(row.ditolak || 0),
          dalam_proses: Number(row.dalam_proses || 0),
          rata_jam: row.rata_jam == null ? null : Number(Number(row.rata_jam).toFixed(1))
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching analytics dokumen:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat analitik dokumen' });
  }
});


// =========================================================================
// ACTION TRACKING & WORKFLOW DISPATCH (SPRINT 5)
// =========================================================================

// GET /api/analytics/actions - Daftar Status Tindak Lanjut Rekomendasi
router.get('/actions', requireAuth, async (req, res) => {
  try {
    const scope = resolveAnalyticsScope(req, res);
    if (!scope) return;

    let query = "SELECT * FROM analytics_action_tracking WHERE 1=1";
    const params = [];

    if (scope.rw) {
      query += " AND wilayah_rw = ?";
      params.push(scope.rw);
    }
    if (scope.rt) {
      query += " AND wilayah_rt = ?";
      params.push(scope.rt);
    }
    if (req.query.status && req.query.status !== 'all') {
      query += " AND status = ?";
      params.push(req.query.status);
    }

    query += " ORDER BY status ASC, updated_at DESC";

    const [rows] = await pool.execute(query, params);
    res.json({ success: true, data: rows || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memuat status tindak lanjut' });
  }
});

// PATCH /api/analytics/actions/:insightId - Pembaruan Status & Jejak Audit Petugas
router.patch('/actions/:insightId', requireAuth, requireRole('superadmin', 'walikota', 'camat', 'lurah', 'admin_kelurahan', 'admin', 'ketua_rw', 'admin_rw', 'ketua_rt', 'kader_posyandu'), async (req, res) => {
  try {
    const scope = resolveAnalyticsScope(req, res);
    if (!scope) return;

    const { insightId } = req.params;
    const { status, catatan_tindak_lanjut, category, title, wilayah_rw, wilayah_rt } = req.body;
    const user = req.session.user;

    const validStatuses = ['BELUM_DITINDAKLANJUTI', 'DALAM_PROSES', 'SELESAI'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status tidak valid.' });
    }

    const [existing] = await pool.execute("SELECT * FROM analytics_action_tracking WHERE insight_id = ?", [insightId]);

    const isCompleted = status === 'SELESAI';
    const completedAt = isCompleted ? new Date() : null;

    if (existing.length > 0) {
      if (scope.rw && existing[0].wilayah_rw !== scope.rw) {
        return res.status(403).json({ success: false, message: 'Akses ditolak: Anda tidak berwenang atas wilayah tindakan ini.' });
      }
      if (scope.rt && existing[0].wilayah_rt && existing[0].wilayah_rt !== scope.rt) {
        return res.status(403).json({ success: false, message: 'Akses ditolak: Anda tidak berwenang atas RT tindakan ini.' });
      }

      await pool.execute(
        `UPDATE analytics_action_tracking
         SET status = COALESCE(?, status),
             catatan_tindak_lanjut = COALESCE(?, catatan_tindak_lanjut),
             updated_by_user_id = ?,
             updated_by_nama = ?,
             completed_at = CASE WHEN ? = 'SELESAI' THEN NOW() ELSE completed_at END
         WHERE insight_id = ?`,
        [
          status || null,
          catatan_tindak_lanjut || null,
          user.id || null,
          user.nama || user.username,
          status || null,
          insightId
        ]
      );
    } else {
      await pool.execute(
        `INSERT INTO analytics_action_tracking
          (insight_id, category, title, wilayah_rw, wilayah_rt, status, catatan_tindak_lanjut, assigned_role, updated_by_user_id, updated_by_nama, completed_at)
         VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          insightId,
          category || 'UMUM',
          title || 'Tindak Lanjut Rekomendasi Wilayah',
          wilayah_rw || scope.rw || '001',
          wilayah_rt || scope.rt || '001',
          status || 'DALAM_PROSES',
          catatan_tindak_lanjut || 'Tindak lanjut dicatat oleh petugas',
          user.role,
          user.id || null,
          user.nama || user.username,
          completedAt
        ]
      );
    }

    const [updated] = await pool.execute("SELECT * FROM analytics_action_tracking WHERE insight_id = ?", [insightId]);

    res.json({
      success: true,
      message: `Status tindak lanjut berhasil diperbarui menjadi ${status || 'tersimpan'}.`,
      data: updated[0] || null
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Gagal memperbarui status tindak lanjut' });
  }
});

module.exports = router;
