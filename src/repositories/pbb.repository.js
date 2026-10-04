/**
 * src/repositories/pbb.repository.js
 * Data Access Layer for PBB (Pajak Bumi dan Bangunan)
 * Kelurahan Kebonjati, Kec. Cikole, Kota Sukabumi - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class PbbRepository {
  /**
   * Ambil seluruh record PBB berdasarkan NIK warga (beserta data anggota KK jika ada)
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async findByNik(nik) {
    const [rows] = await pool.query(
      `SELECT * FROM pbb 
       WHERE nik_warga = ? 
       ORDER BY tahun DESC, nominal DESC`,
      [nik]
    );
    return rows;
  }

  /**
   * Cari PBB spesifik berdasarkan NOP dan Tahun
   * @param {string} nop 
   * @param {number} tahun 
   * @returns {Promise<Object|null>}
   */
  async findByNopAndTahun(nop, tahun) {
    const [rows] = await pool.query(
      'SELECT * FROM pbb WHERE nop = ? AND tahun = ? LIMIT 1',
      [nop, tahun]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Cari PBB berdasarkan ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM pbb WHERE id = ? LIMIT 1', [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Perbarui status pembayaran PBB dengan audit jejak transaksi
   * @param {string} nop 
   * @param {number} tahun 
   * @param {string} status 
   * @param {Object} paymentInfo 
   * @returns {Promise<Object>}
   */
  async updateStatus(nop, tahun, status, paymentInfo = {}) {
    const { metode_bayar = 'QRIS Dinamis', nomor_transaksi_bank = null, bukti_bayar_url = null } = paymentInfo;
    const tanggal_bayar = status === 'PAID' ? new Date() : null;

    const [result] = await pool.query(
      `UPDATE pbb 
       SET status_pembayaran = ?,
           tanggal_bayar = ?,
           metode_bayar = ?,
           nomor_transaksi_bank = ?,
           bukti_bayar_url = COALESCE(?, bukti_bayar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE nop = ? AND tahun = ?`,
      [status, tanggal_bayar, metode_bayar, nomor_transaksi_bank, bukti_bayar_url, nop, tahun]
    );
    return result;
  }

  /**
   * Daftar objek PBB terfilter untuk RT, RW, dan Kelurahan
   * @param {Object} filters
   * @returns {Promise<{items: Array, total: number}>}
   */
  async listFiltered(filters = {}) {
    const {
      rw = null,
      rt = null,
      status = null,
      tahun = null,
      search = null,
      limit = 50,
      offset = 0
    } = filters;

    let whereClauses = ['1=1'];
    const params = [];

    if (rw) {
      whereClauses.push('p.rw = ?');
      params.push(rw);
    }
    if (rt) {
      whereClauses.push('p.rt = ?');
      params.push(rt);
    }
    if (status && status !== 'ALL') {
      whereClauses.push('p.status_pembayaran = ?');
      params.push(status);
    }
    if (tahun) {
      whereClauses.push('p.tahun = ?');
      params.push(Number(tahun));
    }
    if (search) {
      whereClauses.push('(p.nop LIKE ? OR p.nama_wajib_pajak LIKE ? OR p.alamat_objek_pajak LIKE ? OR p.nik_warga LIKE ?)');
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    const whereStr = whereClauses.join(' AND ');

    // Hitung total data
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM pbb p WHERE ${whereStr}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // Ambil baris data beserta nomor telepon/WA warga untuk pengingat santun
    const query = `
      SELECT p.*, w.no_telepon as no_wa_warga
      FROM pbb p
      LEFT JOIN warga w ON p.nik_warga = w.nik
      WHERE ${whereStr}
      ORDER BY p.tahun DESC, p.status_pembayaran ASC, p.rt ASC, p.nominal DESC
      LIMIT ? OFFSET ?
    `;
    const [items] = await pool.query(query, [...params, Number(limit), Number(offset)]);

    return { items, total };
  }

  /**
   * Statistik dan Analitik Realisasi PBB Wilayah (KPI Cards, Heatmap & Chart Data)
   * @param {Object} scope { rw, rt, kelurahan }
   * @param {number} tahun
   * @returns {Promise<Object>}
   */
  async getStats(scope = {}, tahun = 2026) {
    let whereClauses = ['p.tahun = ?'];
    const params = [Number(tahun)];

    if (scope.rw) {
      whereClauses.push('p.rw = ?');
      params.push(scope.rw);
    }
    if (scope.rt) {
      whereClauses.push('p.rt = ?');
      params.push(scope.rt);
    }

    const whereStr = whereClauses.join(' AND ');

    // 1. Ringkasan Keseluruhan
    const [summaryRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_objek_pajak,
        COALESCE(SUM(p.nominal), 0) as total_target_nominal,
        COALESCE(SUM(CASE WHEN p.status_pembayaran = 'PAID' THEN p.nominal ELSE 0 END), 0) as total_lunas_nominal,
        COALESCE(SUM(CASE WHEN p.status_pembayaran != 'PAID' THEN p.nominal ELSE 0 END), 0) as total_terutang_nominal,
        COUNT(CASE WHEN p.status_pembayaran = 'PAID' THEN 1 END) as total_lunas_count,
        COUNT(CASE WHEN p.status_pembayaran != 'PAID' THEN 1 END) as total_terutang_count
      FROM pbb p
      WHERE ${whereStr}
    `, params);

    const summary = summaryRows[0] || {
      total_objek_pajak: 0,
      total_target_nominal: 0,
      total_lunas_nominal: 0,
      total_terutang_nominal: 0,
      total_lunas_count: 0,
      total_terutang_count: 0
    };

    const targetNominal = Number(summary.total_target_nominal) || 0;
    const lunasNominal = Number(summary.total_lunas_nominal) || 0;
    summary.persentase_realisasi = targetNominal > 0 ? ((lunasNominal / targetNominal) * 100).toFixed(1) : '0.0';

    // 2. Breakdown per RT (Heatmap & Bar Chart)
    const [breakdownRt] = await pool.query(`
      SELECT 
        p.rt,
        p.rw,
        COUNT(*) as total_objek,
        COALESCE(SUM(p.nominal), 0) as target_nominal,
        COALESCE(SUM(CASE WHEN p.status_pembayaran = 'PAID' THEN p.nominal ELSE 0 END), 0) as lunas_nominal,
        COUNT(CASE WHEN p.status_pembayaran = 'PAID' THEN 1 END) as lunas_count,
        COUNT(CASE WHEN p.status_pembayaran != 'PAID' THEN 1 END) as belum_lunas_count
      FROM pbb p
      WHERE ${whereStr}
      GROUP BY p.rt, p.rw
      ORDER BY p.rw ASC, p.rt ASC
    `, params);

    const rtStats = breakdownRt.map(row => {
      const tgt = Number(row.target_nominal) || 0;
      const lns = Number(row.lunas_nominal) || 0;
      return {
        ...row,
        persentase: tgt > 0 ? Math.round((lns / tgt) * 100) : 0
      };
    });

    // 3. Breakdown per RW (untuk Kelurahan / Eksekutif)
    const [breakdownRw] = await pool.query(`
      SELECT 
        p.rw,
        COUNT(*) as total_objek,
        COALESCE(SUM(p.nominal), 0) as target_nominal,
        COALESCE(SUM(CASE WHEN p.status_pembayaran = 'PAID' THEN p.nominal ELSE 0 END), 0) as lunas_nominal,
        COUNT(CASE WHEN p.status_pembayaran = 'PAID' THEN 1 END) as lunas_count,
        COUNT(CASE WHEN p.status_pembayaran != 'PAID' THEN 1 END) as belum_lunas_count
      FROM pbb p
      WHERE p.tahun = ?
      GROUP BY p.rw
      ORDER BY p.rw ASC
    `, [Number(tahun)]);

    const rwStats = breakdownRw.map(row => {
      const tgt = Number(row.target_nominal) || 0;
      const lns = Number(row.lunas_nominal) || 0;
      return {
        ...row,
        persentase: tgt > 0 ? Math.round((lns / tgt) * 100) : 0
      };
    });

    return {
      tahun: Number(tahun),
      summary,
      rt_breakdown: rtStats,
      rw_breakdown: rwStats
    };
  }

  /**
   * Batch Upsert DHKP (Daftar Himpunan Ketetapan Pajak)
   * @param {Array} rows 
   * @returns {Promise<{inserted: number, updated: number}>}
   */
  async batchUpsertDhkp(rows = []) {
    let inserted = 0;
    let updated = 0;

    for (const row of rows) {
      if (!row.nop || !row.tahun) continue;

      const [res] = await pool.query(`
        INSERT INTO pbb (
          nop, nik_warga, nama_wajib_pajak, alamat_objek_pajak, rt, rw, kelurahan, kecamatan, kota, tahun,
          luas_bumi, luas_bangunan, njop_bumi, njop_bangunan, nominal, denda, status_pembayaran,
          tanggal_jatuh_tempo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          nama_wajib_pajak = VALUES(nama_wajib_pajak),
          alamat_objek_pajak = VALUES(alamat_objek_pajak),
          rt = VALUES(rt),
          rw = VALUES(rw),
          luas_bumi = VALUES(luas_bumi),
          luas_bangunan = VALUES(luas_bangunan),
          njop_bumi = VALUES(njop_bumi),
          njop_bangunan = VALUES(njop_bangunan),
          nominal = VALUES(nominal),
          status_pembayaran = IF(pbb.status_pembayaran = 'PAID', 'PAID', VALUES(status_pembayaran)),
          updated_at = CURRENT_TIMESTAMP
      `, [
        row.nop,
        row.nik_warga || '3272030103810001',
        row.nama_wajib_pajak || 'Wajib Pajak',
        row.alamat_objek_pajak || 'Kelurahan Kebonjati',
        row.rt || '001',
        row.rw || '001',
        row.kelurahan || 'Kebonjati',
        row.kecamatan || 'Cikole',
        row.kota || 'Kota Sukabumi',
        Number(row.tahun),
        Number(row.luas_bumi || 0),
        Number(row.luas_bangunan || 0),
        Number(row.njop_bumi || 0),
        Number(row.njop_bangunan || 0),
        Number(row.nominal || 0),
        Number(row.denda || 0),
        row.status_pembayaran || 'UNPAID',
        row.tanggal_jatuh_tempo || `${row.tahun}-09-30`
      ]);

      if (res.affectedRows === 1) inserted++;
      else if (res.affectedRows === 2) updated++;
    }

    return { inserted, updated, total: rows.length };
  }
}

module.exports = new PbbRepository();
