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
      critical_lansia: criticalRows
    };
  }

  /**
   * 4. Agregasi Keadilan Sosial (Bansos vs SKTM) per RT
   */
  async getBansosEquityByRT(scope = {}) {
    let whereBansos = "WHERE 1=1";
    let whereSKTM = "WHERE d.jenis_surat LIKE '%Tidak Mampu%' AND d.status = 'APPROVED'";
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
    const [bansosRows] = await pool.execute(
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

    // SKTM approved grouped by RT
    const [sktmRows] = await pool.execute(
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
}

module.exports = new AnalyticsRepository();

