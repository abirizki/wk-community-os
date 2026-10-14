/**
 * src/repositories/pbb.repository.js
 * Data Access Layer for PBB.
 */

const pool = require('../db/pool');

class PbbRepository {
  /**
   * Ambil seluruh record PBB berdasarkan NIK
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      'SELECT * FROM pbb WHERE nik_warga = ? ORDER BY tahun DESC',
      [nik]
    );
    return rows;
  }

  /**
   * Perbarui status pembayaran PBB
   * @param {string} nop 
   * @param {number} tahun 
   * @param {string} status 
   * @returns {Promise<Object>}
   */
  async updateStatus(nop, tahun, status) {
    const [result] = await pool.execute(
      'UPDATE pbb SET status_pembayaran = ? WHERE nop = ? AND tahun = ?',
      [status, nop, tahun]
    );
    return result;
  }

  /**
   * Cari PBB spesifik berdasarkan NOP dan Tahun
   * @param {string} nop 
   * @param {number} tahun 
   * @returns {Promise<Object|null>}
   */
  /**
   * Cari PBB spesifik berdasarkan NOP dan Tahun
   * @param {string} nop 
   * @param {number} tahun 
   * @returns {Promise<Object|null>}
   */
  async findByNopAndTahun(nop, tahun) {
    const [rows] = await pool.execute(
      'SELECT * FROM pbb WHERE nop = ? AND tahun = ? LIMIT 1',
      [nop, tahun]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Ambil daftar PBB terfilter untuk Admin Kelurahan & RT/RW
   */
  async listPbb({ rw, rt, tahun, status, search, limit = 100, offset = 0 } = {}) {
    let query = `
      SELECT p.*, w.nama AS nama_warga_ktp, COALESCE(p.nama_wajib_pajak, w.nama) AS nama_tampil,
             COALESCE(p.alamat_objek_pajak, w.alamat) AS alamat_tampil,
             COALESCE(p.rt, w.rt) AS rt_tampil, COALESCE(p.rw, w.rw) AS rw_tampil
      FROM pbb p
      LEFT JOIN warga w ON p.nik_warga = w.nik
      WHERE 1=1
    `;
    const params = [];

    if (rw) {
      query += ' AND (p.rw = ? OR (p.rw IS NULL AND w.rw = ?))';
      params.push(String(rw).padStart(3, '0').slice(-3), String(rw).padStart(3, '0').slice(-3));
    }
    if (rt) {
      query += ' AND (p.rt = ? OR (p.rt IS NULL AND w.rt = ?))';
      params.push(String(rt).padStart(3, '0').slice(-3), String(rt).padStart(3, '0').slice(-3));
    }
    if (tahun) {
      query += ' AND p.tahun = ?';
      params.push(parseInt(tahun, 10));
    }
    if (status && status !== 'ALL') {
      query += ' AND p.status_pembayaran = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (p.nop LIKE ? OR p.nik_warga LIKE ? OR p.nama_wajib_pajak LIKE ? OR w.nama LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.tahun DESC, p.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    try {
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (e) {
      console.warn('[PbbRepo] listPbb fallback:', e.message);
      return [];
    }
  }

  /**
   * Bulk Import Data DHKP PBB dari Kelurahan
   */
  async bulkImportPbb(records = []) {
    let inserted = 0;
    let updated = 0;
    for (const r of records) {
      try {
        const [res] = await pool.execute(
          `INSERT INTO pbb 
            (nop, nik_warga, nama_wajib_pajak, alamat_objek_pajak, rt, rw, tahun, nominal, tanggal_jatuh_tempo, status_pembayaran)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            nama_wajib_pajak = VALUES(nama_wajib_pajak),
            alamat_objek_pajak = VALUES(alamat_objek_pajak),
            rt = VALUES(rt),
            rw = VALUES(rw),
            nominal = VALUES(nominal),
            tanggal_jatuh_tempo = VALUES(tanggal_jatuh_tempo),
            status_pembayaran = VALUES(status_pembayaran)`,
          [
            r.nop,
            r.nik_warga,
            r.nama_wajib_pajak || null,
            r.alamat_objek_pajak || null,
            r.rt ? String(r.rt).padStart(3, '0').slice(-3) : '001',
            r.rw ? String(r.rw).padStart(3, '0').slice(-3) : '001',
            r.tahun || new Date().getFullYear(),
            r.nominal || 150000,
            r.tanggal_jatuh_tempo || `${new Date().getFullYear()}-09-30`,
            r.status_pembayaran || 'UNPAID'
          ]
        );
        if (res.affectedRows === 1) inserted++;
        else if (res.affectedRows >= 2) updated++;
      } catch (err) {
        console.warn('[PbbRepo] bulkImportPbb row error:', err.message);
      }
    }
    return { inserted, updated, total: records.length };
  }

  /**
   * Verifikasi PBB oleh RT/RW
   */
  async verifyPbbByRt(id, { status_pembayaran, catatan_rt, verifikator_user_id, bukti_bayar_url }) {
    const [res] = await pool.execute(
      `UPDATE pbb 
       SET status_pembayaran = ?, catatan_rt = ?, verifikasi_rt = 1,
           verifikasi_rt_at = NOW(), verifikator_rt_user_id = ?,
           bukti_bayar_url = COALESCE(?, bukti_bayar_url)
       WHERE id = ?`,
      [status_pembayaran || 'PAID', catatan_rt || null, verifikator_user_id || null, bukti_bayar_url || null, id]
    );
    return res;
  }
}

module.exports = new PbbRepository();

