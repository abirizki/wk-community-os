/**
 * src/repositories/analytics.repository.js
 * Data Access Layer for Cross-Sector Analytics & Decision Support
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class AnalyticsRepository {
  /**
   * 1. Demografi & Vitalitas Kependudukan
   */
  async getDemographyStats(scope = {}) {
    let whereClause = "WHERE status_kependudukan != 'Meninggal'";
    const params = [];

    if (scope.rt) {
      whereClause += " AND rt = ?";
      params.push(scope.rt);
    }
    if (scope.rw) {
      whereClause += " AND rw = ?";
      params.push(scope.rw);
    }

    // Hitung total warga aktif, gender, dan distribusi umur
    const [wargaRows] = await pool.execute(
      `SELECT 
        COUNT(*) AS total_warga_aktif,
        SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS total_laki,
        SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS total_perempuan,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN 1 ELSE 0 END) AS total_balita,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 5 AND 17 THEN 1 ELSE 0 END) AS total_anak,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 18 AND 59 THEN 1 ELSE 0 END) AS total_produktif,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS total_lansia,
        SUM(CASE WHEN status_kependudukan = 'Tetap' THEN 1 ELSE 0 END) AS status_tetap,
        SUM(CASE WHEN status_kependudukan = 'Sementara' THEN 1 ELSE 0 END) AS status_sementara
       FROM warga ${whereClause}`,
      params
    );

    // Hitung status kependudukan meninggal & pindah (riwayat)
    let historyWhere = "WHERE 1=1";
    const histParams = [];
    if (scope.rt) {
      historyWhere += " AND rt = ?";
      histParams.push(scope.rt);
    }
    if (scope.rw) {
      historyWhere += " AND rw = ?";
      histParams.push(scope.rw);
    }

    const [eventRows] = await pool.execute(
      `SELECT 
        SUM(CASE WHEN status_kependudukan = 'Meninggal' THEN 1 ELSE 0 END) AS total_meninggal,
        SUM(CASE WHEN status_kependudukan = 'Pindah' THEN 1 ELSE 0 END) AS total_pindah
       FROM warga ${historyWhere}`,
      histParams
    );

    // Hitung total KK
    let kkWhere = "WHERE 1=1";
    const kkParams = [];
    if (scope.rt) {
      kkWhere += " AND rt = ?";
      kkParams.push(scope.rt);
    }
    if (scope.rw) {
      kkWhere += " AND rw = ?";
      kkParams.push(scope.rw);
    }

    const [kkRows] = await pool.execute(
      `SELECT COUNT(*) AS total_kk FROM kartu_keluarga ${kkWhere}`,
      kkParams
    );

    return {
      total_warga_aktif: Number(wargaRows[0]?.total_warga_aktif || 0),
      total_laki: Number(wargaRows[0]?.total_laki || 0),
      total_perempuan: Number(wargaRows[0]?.total_perempuan || 0),
      total_balita: Number(wargaRows[0]?.total_balita || 0),
      total_anak: Number(wargaRows[0]?.total_anak || 0),
      total_produktif: Number(wargaRows[0]?.total_produktif || 0),
      total_lansia: Number(wargaRows[0]?.total_lansia || 0),
      status_tetap: Number(wargaRows[0]?.status_tetap || 0),
      status_sementara: Number(wargaRows[0]?.status_sementara || 0),
      total_meninggal: Number(eventRows[0]?.total_meninggal || 0),
      total_pindah: Number(eventRows[0]?.total_pindah || 0),
      total_kk: Number(kkRows[0]?.total_kk || 0)
    };
  }

  /**
   * 2. Agregasi Kesehatan Balita & Risiko Stunting per Wilayah RT
   */
  async getBalitaNutritionByRT(scope = {}) {
    let whereClause = "WHERE 1=1";
    const params = [];

    if (scope.rt) {
      whereClause += " AND w.rt = ?";
      params.push(scope.rt);
    }
    if (scope.rw) {
      whereClause += " AND w.rw = ?";
      params.push(scope.rw);
    }

    // Ambil data agregat per RT
    const [rtRows] = await pool.execute(
      `SELECT 
        COALESCE(w.rt, '001') AS rt,
        COALESCE(w.rw, '001') AS rw,
        COUNT(p.id) AS total_pemeriksaan,
        COUNT(DISTINCT p.nama_anak) AS total_balita_unik,
        SUM(CASE WHEN p.status_gizi IN ('Gizi Baik', 'Normal') THEN 1 ELSE 0 END) AS gizi_baik,
        SUM(CASE WHEN p.status_gizi = 'Gizi Kurang' THEN 1 ELSE 0 END) AS gizi_kurang,
        SUM(CASE WHEN p.status_gizi = 'Gizi Buruk' THEN 1 ELSE 0 END) AS gizi_buruk,
        SUM(CASE WHEN p.status_gizi = 'Gizi Lebih' THEN 1 ELSE 0 END) AS gizi_lebih
       FROM posyandu p
       LEFT JOIN warga w ON p.nik_warga = w.nik
       ${whereClause}
       GROUP BY w.rt, w.rw
       ORDER BY w.rt ASC`,
      params
    );

    // Ambil daftar balita berisiko stunting untuk data bukti AI
    const [riskRows] = await pool.execute(
      `SELECT 
        p.id,
        p.nama_anak,
        p.umur_bulan,
        p.berat_badan_kg,
        p.tinggi_badan_cm,
        p.status_gizi,
        p.tanggal_pemeriksaan,
        COALESCE(w.nama, 'Warga') AS nama_ortu,
        COALESCE(w.rt, '001') AS rt,
        COALESCE(w.rw, '001') AS rw
       FROM posyandu p
       LEFT JOIN warga w ON p.nik_warga = w.nik
       ${whereClause} AND p.status_gizi IN ('Gizi Kurang', 'Gizi Buruk')
       ORDER BY p.tanggal_pemeriksaan DESC
       LIMIT 50`,
      params
    );

    return {
      per_rt: rtRows.map(r => ({
        rt: r.rt,
        rw: r.rw,
        total_pemeriksaan: Number(r.total_pemeriksaan || 0),
        total_balita_unik: Number(r.total_balita_unik || 0),
        gizi_baik: Number(r.gizi_baik || 0),
        gizi_kurang: Number(r.gizi_kurang || 0),
        gizi_buruk: Number(r.gizi_buruk || 0),
        gizi_lebih: Number(r.gizi_lebih || 0)
      })),
      at_risk_balita: riskRows
    };
  }

  /**
   * 3. Agregasi Kesehatan Geriatri & Lansia Rawan Komorbid per RT
   */
  async getLansiaHealthByRT(scope = {}) {
    let whereClause = "WHERE 1=1";
    const params = [];

    if (scope.rt) {
      whereClause += " AND l.rt = ?";
      params.push(scope.rt);
    }
    if (scope.rw) {
      whereClause += " AND l.rw = ?";
      params.push(scope.rw);
    }

    try {
      // Ambil agregasi per RT dengan join pemeriksaan terbaru
      const [rtRows] = await pool.execute(
        `SELECT 
          l.rt,
          l.rw,
          COUNT(DISTINCT l.id) AS total_lansia,
          SUM(CASE WHEN l.status_tinggal = 'Sebatang Kara' THEN 1 ELSE 0 END) AS sebatang_kara,
          SUM(CASE WHEN latest.tensi_sistolik >= 140 OR latest.tensi_diastolik >= 90 THEN 1 ELSE 0 END) AS hipertensi,
          SUM(CASE WHEN latest.tensi_sistolik >= 160 OR latest.tensi_diastolik >= 100 THEN 1 ELSE 0 END) AS hipertensi_berat,
          SUM(CASE WHEN latest.gula_darah_sewaktu >= 200 THEN 1 ELSE 0 END) AS diabetes,
          SUM(CASE WHEN latest.skor_kemandirian_adl IN ('Ketergantungan Berat', 'Ketergantungan Total') THEN 1 ELSE 0 END) AS ketergantungan_tinggi
         FROM posyandu_lansia l
         LEFT JOIN (
           SELECT p1.*
           FROM posyandu_lansia_pemeriksaan p1
           INNER JOIN (
             SELECT posyandu_lansia_id, MAX(tanggal_pemeriksaan) AS max_date, MAX(id) as max_id
             FROM posyandu_lansia_pemeriksaan
             GROUP BY posyandu_lansia_id
           ) p2 ON p1.posyandu_lansia_id = p2.posyandu_lansia_id AND p1.id = p2.max_id
         ) latest ON l.id = latest.posyandu_lansia_id
         ${whereClause}
         GROUP BY l.rt, l.rw
         ORDER BY l.rt ASC`,
        params
      );

      // Ambil lansia prioritas kritis untuk data bukti AI
      const [criticalRows] = await pool.execute(
        `SELECT 
          l.id,
          l.nik,
          l.nama,
          TIMESTAMPDIFF(YEAR, l.tanggal_lahir, CURDATE()) AS usia,
          l.status_tinggal,
          l.riwayat_penyakit,
          l.alamat,
          l.rt,
          l.rw,
          latest.tensi_sistolik,
          latest.tensi_diastolik,
          latest.gula_darah_sewaktu,
          latest.kolesterol,
          latest.asam_urat,
          latest.skor_kemandirian_adl,
          latest.tanggal_pemeriksaan
         FROM posyandu_lansia l
         INNER JOIN (
           SELECT p1.*
           FROM posyandu_lansia_pemeriksaan p1
           INNER JOIN (
             SELECT posyandu_lansia_id, MAX(id) as max_id
             FROM posyandu_lansia_pemeriksaan
             GROUP BY posyandu_lansia_id
           ) p2 ON p1.id = p2.max_id
         ) latest ON l.id = latest.posyandu_lansia_id
         ${whereClause}
         AND (
           (latest.tensi_sistolik >= 160 OR latest.gula_darah_sewaktu >= 200)
           OR (l.status_tinggal = 'Sebatang Kara')
           OR (latest.skor_kemandirian_adl IN ('Ketergantungan Berat', 'Ketergantungan Total'))
         )
         ORDER BY latest.tensi_sistolik DESC
         LIMIT 50`,
        params
      );

      return {
        per_rt: rtRows.map(r => ({
          rt: r.rt,
          rw: r.rw,
          total_lansia: Number(r.total_lansia || 0),
          sebatang_kara: Number(r.sebatang_kara || 0),
          hipertensi: Number(r.hipertensi || 0),
          hipertensi_berat: Number(r.hipertensi_berat || 0),
          diabetes: Number(r.diabetes || 0),
          ketergantungan_tinggi: Number(r.ketergantungan_tinggi || 0)
        })),
        critical_cases: criticalRows
      };
    } catch (err) {
      console.warn('[AnalyticsRepo] getLansiaHealthRiskOverview fallback:', err.message);
      return { per_rt: [], critical_cases: [] };
    }
  }

  /**
   * 4. Agregasi Keadilan Sosial (Bansos vs SKTM) per RT
   */
  async getBansosEquityByRT(scope = {}) {
    try {
      let whereBansos = "WHERE 1=1";
      let whereSKTM = "WHERE (COALESCE(d.jenis_surat, d.jenis_dokumen, '') LIKE '%Tidak Mampu%') AND d.status = 'APPROVED'";
      const paramsBansos = [];
      const paramsSKTM = [];

      if (scope.rt) {
        whereBansos += " AND rt = ?";
        whereSKTM += " AND w.rt = ?";
        paramsBansos.push(scope.rt);
        paramsSKTM.push(scope.rt);
      }
      if (scope.rw) {
        whereBansos += " AND rw = ?";
        whereSKTM += " AND w.rw = ?";
        paramsBansos.push(scope.rw);
        paramsSKTM.push(scope.rw);
      }

      // Bansos grouped by RT
      let bansosRows = [];
      try {
        const [rows] = await pool.execute(
          `SELECT 
            rt,
            rw,
            COUNT(*) AS total_usulan_bansos,
            SUM(CASE WHEN status = 'APPROVED_KELURAHAN' THEN 1 ELSE 0 END) AS disahkan_bansos,
            SUM(CASE WHEN status != 'REJECTED' AND status != 'APPROVED_KELURAHAN' THEN 1 ELSE 0 END) AS pending_bansos,
            SUM(CASE WHEN status = 'APPROVED_KELURAHAN' THEN nominal_bantuan ELSE 0 END) AS total_nominal_disalurkan
           FROM bansos_pengajuan
           ${whereBansos}
           GROUP BY rt, rw
           ORDER BY rt ASC`,
          paramsBansos
        );
        bansosRows = rows;
      } catch (errBansos) {
        console.warn('[AnalyticsRepo] bansos_pengajuan query fallback:', errBansos.message);
      }

      // SKTM approved grouped by RT
      let sktmRows = [];
      try {
        const [rows] = await pool.execute(
          `SELECT 
            COALESCE(w.rt, '001') AS rt,
            COALESCE(w.rw, '001') AS rw,
            COUNT(*) AS total_sktm_disahkan
           FROM dokumen_request d
           LEFT JOIN warga w ON d.nik_pemohon = w.nik
           ${whereSKTM}
           GROUP BY w.rt, w.rw`,
          paramsSKTM
        );
        sktmRows = rows;
      } catch (errSKTM) {
        console.warn('[AnalyticsRepo] SKTM query fallback:', errSKTM.message);
      }

      // Map by RT
      const sktmMap = {};
      sktmRows.forEach(s => {
        sktmMap[s.rt] = Number(s.total_sktm_disahkan || 0);
      });

      const result = bansosRows.map(b => ({
        rt: b.rt,
        rw: b.rw,
        total_usulan_bansos: Number(b.total_usulan_bansos || 0),
        disahkan_bansos: Number(b.disahkan_bansos || 0),
        pending_bansos: Number(b.pending_bansos || 0),
        total_nominal_disalurkan: Number(b.total_nominal_disalurkan || 0),
        total_sktm: sktmMap[b.rt] || 0
      }));

      // Tangani RT yang ada di SKTM tapi belum ada di bansos
      Object.keys(sktmMap).forEach(rt => {
        if (!result.find(r => r.rt === rt)) {
          result.push({
            rt,
            rw: scope.rw || '001',
            total_usulan_bansos: 0,
            disahkan_bansos: 0,
            pending_bansos: 0,
            total_nominal_disalurkan: 0,
            total_sktm: sktmMap[rt]
          });
        }
      });

      return result;
    } catch (e) {
      console.warn('[AnalyticsRepo] getBansosEquityByRT global error:', e.message);
      return [];
    }
  }

  /**
   * 5. Kecepatan Pelayanan Surat & SLA Operasional
   */
  async getDocumentVelocityStats(scope = {}) {
    let whereClause = "WHERE 1=1";
    const params = [];

    if (scope.rt) {
      whereClause += " AND w.rt = ?";
      params.push(scope.rt);
    }
    if (scope.rw) {
      whereClause += " AND w.rw = ?";
      params.push(scope.rw);
    }

    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) AS total_permohonan,
        SUM(CASE WHEN d.status = 'APPROVED' THEN 1 ELSE 0 END) AS total_disahkan,
        SUM(CASE WHEN d.status = 'REJECTED' THEN 1 ELSE 0 END) AS total_ditolak,
        SUM(CASE WHEN d.status != 'APPROVED' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS total_dalam_proses,
        SUM(CASE WHEN d.approval_step = 'RT' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS pending_di_rt,
        SUM(CASE WHEN d.approval_step = 'RW' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS pending_di_rw,
        SUM(CASE WHEN d.approval_step = 'KELURAHAN' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS pending_di_kelurahan,
        AVG(CASE WHEN d.status = 'APPROVED' THEN TIMESTAMPDIFF(HOUR, d.created_at, d.updated_at) ELSE NULL END) AS rata_durasi_jam
       FROM dokumen_request d
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       ${whereClause}`,
      params
    );

    return {
      total_permohonan: Number(rows[0]?.total_permohonan || 0),
      total_disahkan: Number(rows[0]?.total_disahkan || 0),
      total_ditolak: Number(rows[0]?.total_ditolak || 0),
      total_dalam_proses: Number(rows[0]?.total_dalam_proses || 0),
      pending_di_rt: Number(rows[0]?.pending_di_rt || 0),
      pending_di_rw: Number(rows[0]?.pending_di_rw || 0),
      pending_di_kelurahan: Number(rows[0]?.pending_di_kelurahan || 0),
      rata_durasi_jam: Math.round(Number(rows[0]?.rata_durasi_jam || 0) * 10) / 10
    };
  }

  /**
   * 6. Aspirasi & Pengaduan Warga
   */
  async getComplaintsStats() {
    const [rows] = await pool.execute(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END) AS processing,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected
       FROM pengaduan`
    );

    return {
      total: Number(rows[0]?.total || 0),
      pending: Number(rows[0]?.pending || 0),
      processing: Number(rows[0]?.processing || 0),
      resolved: Number(rows[0]?.resolved || 0),
      rejected: Number(rows[0]?.rejected || 0)
    };
  }
  /**
   * 7. Analisis Demografi Mendalam (Piramida Penduduk, Profesi, Agama, Pendidikan, & Matriks Heatmap RT)
   */
  async getDetailedDemographics(scope = {}) {
    let whereClause = "WHERE (status_kependudukan IS NULL OR status_kependudukan != 'Meninggal')";
    const params = [];

    if (scope.rt) {
      whereClause += " AND rt = ?";
      params.push(scope.rt);
    }
    if (scope.rw) {
      whereClause += " AND rw = ?";
      params.push(scope.rw);
    }

    // 1. Piramida Penduduk (Age Brackets x Gender)
    const [pyramidRows] = await pool.execute(
      `SELECT 
        CASE 
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN '0-4 (Balita)'
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 5 AND 14 THEN '5-14 (Anak/SD)'
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 15 AND 24 THEN '15-24 (Pemuda/Gen-Z)'
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 25 AND 39 THEN '25-39 (Produktif Muda)'
          WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) BETWEEN 40 AND 59 THEN '40-59 (Produktif Matang)'
          ELSE '60+ (Lansia)'
        END AS kelompok_usia,
        SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS pria,
        SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS wanita,
        COUNT(*) AS total
       FROM warga 
       ${whereClause}
       GROUP BY kelompok_usia
       ORDER BY MIN(TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE())) ASC`,
      params
    );

    // 2. Sebaran Pekerjaan (Top 8)
    const [pekerjaanRows] = await pool.execute(
      `SELECT 
        COALESCE(NULLIF(TRIM(pekerjaan), ''), 'Lainnya') AS label,
        COUNT(*) AS count
       FROM warga 
       ${whereClause}
       GROUP BY label
       ORDER BY count DESC
       LIMIT 8`,
      params
    );

    // 3. Sebaran Agama
    const [agamaRows] = await pool.execute(
      `SELECT 
        COALESCE(NULLIF(TRIM(agama), ''), 'Islam') AS label,
        COUNT(*) AS count
       FROM warga 
       ${whereClause}
       GROUP BY label
       ORDER BY count DESC`,
      params
    );

    // 4. Sebaran Pendidikan
    let pendidikanRows = [];
    try {
      const [pRows] = await pool.execute(
        `SELECT 
          COALESCE(NULLIF(TRIM(pendidikan), ''), 'Tidak Diketahui') AS label,
          COUNT(*) AS count
         FROM warga 
         ${whereClause}
         GROUP BY label
         ORDER BY count DESC
         LIMIT 7`,
        params
      );
      pendidikanRows = pRows;
    } catch (e) {
      console.warn('[AnalyticsRepo] pendidikan query note:', e.message);
    }

    // 5. Matriks Heatmap Spasial Wilayah RT (RT 001 s/d RT 005)
    let heatmapWhere = "WHERE (status_kependudukan IS NULL OR status_kependudukan != 'Meninggal')";
    const heatmapParams = [];
    if (scope.rw) {
      heatmapWhere += " AND rw = ?";
      heatmapParams.push(scope.rw);
    }

    const [rtSummaryRows] = await pool.execute(
      `SELECT 
        COALESCE(rt, '001') AS rt,
        COALESCE(rw, '001') AS rw,
        COUNT(*) AS total_warga,
        COUNT(DISTINCT no_kk) AS total_kk,
        SUM(CASE WHEN jenis_kelamin = 'L' THEN 1 ELSE 0 END) AS pria,
        SUM(CASE WHEN jenis_kelamin = 'P' THEN 1 ELSE 0 END) AS wanita,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) < 5 THEN 1 ELSE 0 END) AS balita,
        SUM(CASE WHEN TIMESTAMPDIFF(YEAR, tanggal_lahir, CURDATE()) >= 60 THEN 1 ELSE 0 END) AS lansia
       FROM warga 
       ${heatmapWhere}
       GROUP BY rt, rw
       ORDER BY rt ASC`,
      heatmapParams
    );

    // Dapatkan data PBB per RT untuk komparasi heatmap kepatuhan
    let pbbRtMap = {};
    try {
      const [pbbRows] = await pool.execute(
        `SELECT 
          COALESCE(rt, '001') AS rt,
          COUNT(*) AS total_sppt,
          SUM(CASE WHEN status_pembayaran = 'LUNAS' THEN 1 ELSE 0 END) AS lunas,
          SUM(nominal_pbb) AS total_tagihan,
          SUM(CASE WHEN status_pembayaran = 'LUNAS' THEN nominal_pbb ELSE 0 END) AS total_terbayar
         FROM pbb_sppt
         WHERE 1=1 ${scope.rw ? "AND rw = ?" : ""}
         GROUP BY rt`,
        scope.rw ? [scope.rw] : []
      );
      pbbRows.forEach(p => {
        pbbRtMap[p.rt] = {
          total_sppt: Number(p.total_sppt || 0),
          lunas: Number(p.lunas || 0),
          kepatuhan_persen: p.total_sppt > 0 ? Math.round((p.lunas / p.total_sppt) * 100) : 0
        };
      });
    } catch (e) {
      console.warn('[AnalyticsRepo] pbb heatmap note:', e.message);
    }

    // Dapatkan Desil 1 & 2 (Kelompok Miskin Ekstrem) per RT
    let desilRtMap = {};
    try {
      const [desilRows] = await pool.execute(
        `SELECT 
          COALESCE(w.rt, '001') AS rt,
          COUNT(DISTINCT d.no_kk) AS total_desil_rentan
         FROM desil_keluarga d
         JOIN warga w ON d.no_kk = w.no_kk
         WHERE COALESCE(d.desil_saat_ini, d.desil_resmi_pemerintah) IN (1, 2)
         ${scope.rw ? "AND w.rw = ?" : ""}
         GROUP BY w.rt`,
        scope.rw ? [scope.rw] : []
      );
      desilRows.forEach(d => {
        desilRtMap[d.rt] = Number(d.total_desil_rentan || 0);
      });
    } catch (e) {}

    const spatialHeatmap = rtSummaryRows.map(r => ({
      rt: r.rt,
      rw: r.rw,
      total_warga: Number(r.total_warga || 0),
      total_kk: Number(r.total_kk || 0),
      pria: Number(r.pria || 0),
      wanita: Number(r.wanita || 0),
      balita: Number(r.balita || 0),
      lansia: Number(r.lansia || 0),
      desil_rentan_kk: desilRtMap[r.rt] || 0,
      pbb_kepatuhan_persen: pbbRtMap[r.rt]?.kepatuhan_persen || 0,
      pbb_total_sppt: pbbRtMap[r.rt]?.total_sppt || 0
    }));

    return {
      piramida: pyramidRows.map(p => ({
        kelompok_usia: p.kelompok_usia,
        pria: Number(p.pria || 0),
        wanita: Number(p.wanita || 0),
        total: Number(p.total || 0)
      })),
      pekerjaan: pekerjaanRows.map(p => ({ label: p.label, count: Number(p.count || 0) })),
      agama: agamaRows.map(a => ({ label: a.label, count: Number(a.count || 0) })),
      pendidikan: pendidikanRows.map(p => ({ label: p.label, count: Number(p.count || 0) })),
      spatial_heatmap: spatialHeatmap
    };
  }

  /**
   * 8. Visualisasi Pengajuan Surat: Tren Deret Waktu (Time Series), Kategori, Pipeline SLA, & Bypass
   */
  async getDocumentTimeSeriesAnalytics(scope = {}, period = '30d') {
    let whereClause = "WHERE 1=1";
    const params = [];

    if (scope.rt) {
      whereClause += " AND (d.rt = ? OR (d.rt IS NULL AND w.rt = ?))";
      params.push(scope.rt, scope.rt);
    }
    if (scope.rw) {
      whereClause += " AND (d.rw = ? OR (d.rw IS NULL AND w.rw = ?))";
      params.push(scope.rw, scope.rw);
    }

    let intervalClause = "INTERVAL 30 DAY";
    if (period === '7d') intervalClause = "INTERVAL 7 DAY";
    else if (period === '90d' || period === 'q') intervalClause = "INTERVAL 90 DAY";
    else if (period === 'ytd') intervalClause = "INTERVAL 1 YEAR";

    // 1. Tren Volume Harian / Mingguan
    const [trendRows] = await pool.execute(
      `SELECT 
        DATE(d.created_at) AS tanggal,
        COUNT(*) AS total_diajukan,
        SUM(CASE WHEN d.status = 'APPROVED' THEN 1 ELSE 0 END) AS disahkan,
        SUM(CASE WHEN d.status = 'REJECTED' THEN 1 ELSE 0 END) AS ditolak,
        SUM(CASE WHEN d.is_emergency_bypass = 1 THEN 1 ELSE 0 END) AS bypass_darurat,
        SUM(CASE WHEN d.is_assisted_submission = 1 THEN 1 ELSE 0 END) AS dampingan_warga
       FROM dokumen_request d
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       ${whereClause} AND d.created_at >= DATE_SUB(CURDATE(), ${intervalClause})
       GROUP BY DATE(d.created_at)
       ORDER BY DATE(d.created_at) ASC`,
      params
    );

    // 2. Kategori Dokumen (Breakdown Kategori)
    const [kategoriRows] = await pool.execute(
      `SELECT 
        COALESCE(d.jenis_surat, d.jenis_dokumen, 'Lainnya') AS kategori,
        COUNT(*) AS count,
        SUM(CASE WHEN d.status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_count,
        SUM(CASE WHEN d.status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count,
        AVG(CASE WHEN d.status = 'APPROVED' THEN TIMESTAMPDIFF(HOUR, d.created_at, d.updated_at) ELSE NULL END) AS rata_jam
       FROM dokumen_request d
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       ${whereClause}
       GROUP BY kategori
       ORDER BY count DESC
       LIMIT 10`,
      params
    );

    // 3. Pipeline Funnel (Status & Step Berjalan)
    const [funnelRows] = await pool.execute(
      `SELECT 
        COUNT(*) AS total_pengajuan,
        SUM(CASE WHEN d.approval_step = 'RT' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS step_rt,
        SUM(CASE WHEN d.approval_step = 'RW' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS step_rw,
        SUM(CASE WHEN d.approval_step = 'KELURAHAN' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS step_kelurahan,
        SUM(CASE WHEN d.status = 'APPROVED' THEN 1 ELSE 0 END) AS step_selesai,
        SUM(CASE WHEN d.status = 'REJECTED' THEN 1 ELSE 0 END) AS total_ditolak,
        SUM(CASE WHEN d.is_emergency_bypass = 1 THEN 1 ELSE 0 END) AS total_emergency_bypass,
        SUM(CASE WHEN d.is_assisted_submission = 1 THEN 1 ELSE 0 END) AS total_assisted_submission
       FROM dokumen_request d
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       ${whereClause}`,
      params
    );

    const f = funnelRows[0] || {};

    return {
      period,
      trend: trendRows.map(t => ({
        tanggal: t.tanggal,
        total_diajukan: Number(t.total_diajukan || 0),
        disahkan: Number(t.disahkan || 0),
        ditolak: Number(t.ditolak || 0),
        bypass_darurat: Number(t.bypass_darurat || 0),
        dampingan_warga: Number(t.dampingan_warga || 0)
      })),
      kategori: kategoriRows.map(k => ({
        kategori: k.kategori,
        count: Number(k.count || 0),
        approved_count: Number(k.approved_count || 0),
        rejected_count: Number(k.rejected_count || 0),
        rata_jam: Math.round(Number(k.rata_jam || 0) * 10) / 10
      })),
      pipeline: {
        total_pengajuan: Number(f.total_pengajuan || 0),
        step_rt: Number(f.step_rt || 0),
        step_rw: Number(f.step_rw || 0),
        step_kelurahan: Number(f.step_kelurahan || 0),
        step_selesai: Number(f.step_selesai || 0),
        total_ditolak: Number(f.total_ditolak || 0),
        total_emergency_bypass: Number(f.total_emergency_bypass || 0),
        total_assisted_submission: Number(f.total_assisted_submission || 0)
      }
    };
  }
}

module.exports = new AnalyticsRepository();

