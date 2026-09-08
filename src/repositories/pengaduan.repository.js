/**
 * src/repositories/pengaduan.repository.js
 * Data Access Layer for Pengaduan.
 */

const pool = require('../db/pool');

class PengaduanRepository {
  /**
   * Insert data pengaduan baru
   * @param {Object} payload
   * @returns {Promise<Object>} Insert result
   */
  async create(payload) {
    const { nik_pelapor, judul, deskripsi, kategori, lampiran_url } = payload;
    
    const [result] = await pool.execute(
      `INSERT INTO pengaduan (nik_pelapor, judul, deskripsi, kategori, lampiran_url) 
       VALUES (?, ?, ?, ?, ?)`,
      [nik_pelapor, judul, deskripsi, kategori, lampiran_url || null]
    );
    
    return result;
  }

  /**
   * Ambil daftar pengaduan spesifik milik satu warga (berdasarkan NIK)
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      'SELECT * FROM pengaduan WHERE nik_pelapor = ? ORDER BY created_at DESC',
      [nik]
    );
    return rows;
  }

  /**
   * Ambil semua pengaduan
   * @returns {Promise<Array>}
   */
  async list() {
    const [rows] = await pool.execute(
      'SELECT * FROM pengaduan ORDER BY created_at DESC'
    );
    return rows;
  }
}

module.exports = new PengaduanRepository();
