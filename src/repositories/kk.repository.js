/**
 * src/repositories/kk.repository.js
 * Data Access Layer for Kartu Keluarga.
 */

const pool = require('../db/pool');

class KkRepository {
  /**
   * Cari data KK berdasarkan No KK
   * @param {string} noKk
   * @returns {Promise<Object|null>}
   */
  async findByNoKk(noKk) {
    const [rows] = await pool.execute(
      'SELECT * FROM kartu_keluarga WHERE no_kk = ? LIMIT 1',
      [noKk]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = new KkRepository();
