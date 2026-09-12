/**
 * src/repositories/completeness.repository.js
 * Data Access Layer for Profiling Completeness & Multi-Role AI Assistants
 * Kelurahan Kebonjati, Kec. Andir, Kota Bandung - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class CompletenessRepository {
  /**
   * Ambil data lengkap seorang warga beserta relasi KK, Desil, dan Posyandu
   */
  async getCitizenRawData(nik) {
    const [wargaRows] = await pool.execute(
      `SELECT w.*, 
              u.id AS user_account_id, u.status AS user_status, u.username AS user_username,
              kk.kepala_keluarga, kk.alamat AS alamat_kk,
              d.desil_saat_ini, d.desil_usulan, d.status_verifikasi AS desil_status_verifikasi
       FROM warga w
       LEFT JOIN users u ON (w.user_id = u.id OR u.username = w.nik)
       LEFT JOIN kartu_keluarga kk ON w.no_kk = kk.no_kk
       LEFT JOIN desil_keluarga d ON w.no_kk = d.no_kk
       WHERE w.nik = ? LIMIT 1`,
      [nik]
    );

    if (wargaRows.length === 0) return null;
    const warga = wargaRows[0];

    // Cek rekam posyandu balita jika usia < 5 tahun
    let posyanduBalita = [];
    try {
      const [pbRows] = await pool.execute(
        'SELECT * FROM posyandu WHERE nik_balita = ? LIMIT 5',
        [nik]
      );
      posyanduBalita = pbRows;
    } catch (e) {
      // fallback jika tabel belum ada
    }

    // Cek rekam posyandu lansia jika usia >= 60 tahun
    let posyanduLansia = [];
    try {
      const [plRows] = await pool.execute(
        'SELECT * FROM posyandu_lansia_pemeriksaan WHERE nik_lansia = ? LIMIT 5',
        [nik]
      );
      posyanduLansia = plRows;
    } catch (e) {
      // fallback jika tabel belum ada
    }

    return {
      warga,
      desil: {
        desil_saat_ini: warga.desil_saat_ini,
        desil_usulan: warga.desil_usulan,
        status_verifikasi: warga.desil_status_verifikasi
      },
      posyanduBalita,
      posyanduLansia,
      user: warga.user_account_id ? { id: warga.user_account_id, status: warga.user_status } : null
    };
  }

  /**
   * Update cache skor kelengkapan pada tabel warga
   */
  async updateScoreCache(nik, score, rincian) {
    try {
      await pool.execute(
        `UPDATE warga 
         SET skor_kelengkapan = ?, rincian_kelengkapan = ?, terakhir_dihitung_at = NOW()
         WHERE nik = ?`,
        [score, JSON.stringify(rincian), nik]
      );
    } catch (err) {
      console.warn('Warning: Gagal menyimpan cache skor kelengkapan:', err.message);
    }
  }

  /**
   * Ambil ringkasan statistik kesiapan data per RT
   */
  async getRTReadinessStats(scope = {}) {
    let whereClause = "WHERE w.status_kependudukan != 'Meninggal'";
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
        w.rt,
        w.rw,
        COUNT(w.id) AS total_warga,
        COUNT(DISTINCT w.no_kk) AS total_kk,
        COALESCE(AVG(w.skor_kelengkapan), 0) AS rata_rata_skor,
        SUM(CASE WHEN w.skor_kelengkapan >= 80 THEN 1 ELSE 0 END) AS warga_lengkap,
        SUM(CASE WHEN w.skor_kelengkapan BETWEEN 50 AND 79 THEN 1 ELSE 0 END) AS warga_sedang,
        SUM(CASE WHEN w.skor_kelengkapan < 50 THEN 1 ELSE 0 END) AS warga_kurang,
        SUM(CASE WHEN w.user_id IS NOT NULL THEN 1 ELSE 0 END) AS warga_berakun,
        SUM(CASE WHEN w.foto_url IS NOT NULL AND w.foto_url != '' THEN 1 ELSE 0 END) AS warga_berfoto,
        SUM(CASE WHEN w.no_telepon IS NOT NULL AND w.no_telepon != '' THEN 1 ELSE 0 END) AS warga_berkontak
       FROM warga w
       ${whereClause}
       GROUP BY w.rt, w.rw
       ORDER BY rata_rata_skor DESC, w.rw ASC, w.rt ASC`,
      params
    );

    return rows.map(r => ({
      rt: r.rt,
      rw: r.rw,
      total_warga: Number(r.total_warga),
      total_kk: Number(r.total_kk),
      rata_rata_skor: Math.round(Number(r.rata_rata_skor)),
      warga_lengkap: Number(r.warga_lengkap),
      warga_sedang: Number(r.warga_sedang),
      warga_kurang: Number(r.warga_kurang),
      persentase_lengkap: Number(r.total_warga) > 0 ? Math.round((Number(r.warga_lengkap) / Number(r.total_warga)) * 100) : 0,
      warga_berakun: Number(r.warga_berakun),
      warga_berkontak: Number(r.warga_berkontak)
    }));
  }

  /**
   * Papan peringkat kematangan data antar RT (RW Leaderboard)
   */
  async getRWLeaderboard(rw = null) {
    let whereClause = "WHERE w.status_kependudukan != 'Meninggal'";
    const params = [];

    if (rw) {
      whereClause += " AND w.rw = ?";
      params.push(rw);
    }

    const [rows] = await pool.execute(
      `SELECT 
        w.rt,
        w.rw,
        COUNT(w.id) AS total_warga,
        COALESCE(AVG(w.skor_kelengkapan), 0) AS skor_rata_rata,
        SUM(CASE WHEN w.skor_kelengkapan >= 80 THEN 1 ELSE 0 END) AS count_excellent,
        SUM(CASE WHEN w.skor_kelengkapan < 50 THEN 1 ELSE 0 END) AS count_needs_help,
        SUM(CASE WHEN w.no_telepon IS NOT NULL AND w.no_telepon != '' THEN 1 ELSE 0 END) AS count_phone
       FROM warga w
       ${whereClause}
       GROUP BY w.rt, w.rw
       ORDER BY skor_rata_rata DESC, count_excellent DESC`,
      params
    );

    return rows.map((r, index) => {
      const total = Number(r.total_warga);
      const avgScore = Math.round(Number(r.skor_rata_rata));
      let badge = 'Partisipan';
      let medal = null;

      if (index === 0 && avgScore >= 70) {
        badge = 'RT Teladan Data Utama';
        medal = 'GOLD';
      } else if (index === 1 && avgScore >= 60) {
        badge = 'RT Proaktif Data';
        medal = 'SILVER';
      } else if (index === 2 && avgScore >= 50) {
        badge = 'RT Berkembang';
        medal = 'BRONZE';
      }

      return {
        rank: index + 1,
        rt: r.rt,
        rw: r.rw,
        total_warga: total,
        skor_rata_rata: avgScore,
        count_excellent: Number(r.count_excellent),
        count_needs_help: Number(r.count_needs_help),
        persentase_lengkap: total > 0 ? Math.round((Number(r.count_excellent) / total) * 100) : 0,
        badge,
        medal
      };
    });
  }

  /**
   * Indeks Kematangan Data Komposit Tingkat Kelurahan (Data Maturity Index)
   */
  async getKelurahanDataMaturityIndex() {
    const [summary] = await pool.execute(
      `SELECT 
        COUNT(w.id) AS total_warga,
        COUNT(DISTINCT w.no_kk) AS total_kk,
        COALESCE(AVG(w.skor_kelengkapan), 0) AS overall_score,
        SUM(CASE WHEN w.skor_kelengkapan >= 80 THEN 1 ELSE 0 END) AS total_excellent,
        SUM(CASE WHEN w.skor_kelengkapan BETWEEN 50 AND 79 THEN 1 ELSE 0 END) AS total_good,
        SUM(CASE WHEN w.skor_kelengkapan < 50 THEN 1 ELSE 0 END) AS total_low,
        SUM(CASE WHEN w.no_telepon IS NOT NULL AND w.no_telepon != '' THEN 1 ELSE 0 END) AS total_with_phone,
        SUM(CASE WHEN w.foto_url IS NOT NULL AND w.foto_url != '' THEN 1 ELSE 0 END) AS total_with_photo,
        SUM(CASE WHEN w.user_id IS NOT NULL THEN 1 ELSE 0 END) AS total_accounts
       FROM warga w
       WHERE w.status_kependudukan != 'Meninggal'`
    );

    const [totalRtRw] = await pool.execute(
      `SELECT COUNT(DISTINCT rt) AS total_rt, COUNT(DISTINCT rw) AS total_rw FROM warga`
    );

    const data = summary[0] || {};
    const totalWarga = Number(data.total_warga || 0);
    const overallScore = Math.round(Number(data.overall_score || 0));

    let maturityLevel = 'Rintisan (Level 1)';
    let maturityGrade = 'D';
    if (overallScore >= 85) {
      maturityLevel = 'Optimal Cerdas (Level 4)';
      maturityGrade = 'A';
    } else if (overallScore >= 70) {
      maturityLevel = 'Terkonsolidasi (Level 3)';
      maturityGrade = 'B';
    } else if (overallScore >= 50) {
      maturityLevel = 'Berkembang (Level 2)';
      maturityGrade = 'C';
    }

    return {
      total_warga: totalWarga,
      total_kk: Number(data.total_kk || 0),
      total_rt: Number(totalRtRw[0]?.total_rt || 0),
      total_rw: Number(totalRtRw[0]?.total_rw || 0),
      overall_maturity_score: overallScore,
      maturity_level: maturityLevel,
      maturity_grade: maturityGrade,
      total_excellent: Number(data.total_excellent || 0),
      total_good: Number(data.total_good || 0),
      total_low: Number(data.total_low || 0),
      coverage: {
        phone_percentage: totalWarga > 0 ? Math.round((Number(data.total_with_phone) / totalWarga) * 100) : 0,
        photo_percentage: totalWarga > 0 ? Math.round((Number(data.total_with_photo) / totalWarga) * 100) : 0,
        account_percentage: totalWarga > 0 ? Math.round((Number(data.total_accounts) / totalWarga) * 100) : 0
      }
    };
  }

  /**
   * Ambil daftar warga untuk pengecekan anomali atau pengisian door-to-door
   */
  async getWargaForAudit(scope = {}, limit = 200) {
    let whereClause = "WHERE w.status_kependudukan != 'Meninggal'";
    const params = [];

    if (scope.rt) {
      whereClause += " AND w.rt = ?";
      params.push(scope.rt);
    }
    if (scope.rw) {
      whereClause += " AND w.rw = ?";
      params.push(scope.rw);
    }

    params.push(String(limit));

    const [rows] = await pool.execute(
      `SELECT w.*, 
              d.desil_saat_ini, d.desil_usulan
       FROM warga w
       LEFT JOIN desil_keluarga d ON w.no_kk = d.no_kk
       ${whereClause}
       ORDER BY w.skor_kelengkapan ASC, w.created_at DESC
       LIMIT ?`,
      params
    );

    return rows;
  }
}

module.exports = new CompletenessRepository();

