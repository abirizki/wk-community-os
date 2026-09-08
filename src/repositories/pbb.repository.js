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
  async findByNopAndTahun(nop, tahun) {
    const [rows] = await pool.execute(
      'SELECT * FROM pbb WHERE nop = ? AND tahun = ? LIMIT 1',
      [nop, tahun]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = new PbbRepository();
