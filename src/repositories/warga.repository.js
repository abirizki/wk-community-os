/**
 * src/repositories/warga.repository.js
 * Data Access Layer for Warga table.
 */

const pool = require('../db/pool');

class WargaRepository {
  /**
   * Cari data warga berdasarkan NIK
   * @param {string} nik 
   * @returns {Promise<Object|null>}
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      'SELECT * FROM warga WHERE nik = ? LIMIT 1',
      [nik]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Ambil daftar warga dengan pagination
   * @param {Object} options
   * @param {number} options.limit
   * @param {number} options.offset
   * @returns {Promise<Array>}
   */
  async list({ limit = 20, offset = 0 } = {}) {
    const [rows] = await pool.execute(
      'SELECT * FROM warga ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit.toString(), offset.toString()] // using string to ensure correct parameterized substitution
    );
    return rows;
  }
}

module.exports = new WargaRepository();
