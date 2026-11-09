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
   * Ambil semua pengaduan dengan scoping RT/RW dan informasi pelapor
   * @param {Object} filter
   * @returns {Promise<Array>}
   */
  async list({ rt, rw } = {}) {
    let query = `
      SELECT p.*, w.nama AS nama_pelapor, w.rt, w.rw, w.no_telepon AS telepon_pelapor
      FROM pengaduan p
      LEFT JOIN warga w ON p.nik_pelapor = w.nik
      WHERE 1=1
    `;
    const params = [];
    if (rw) {
      query += ' AND w.rw = ?';
      params.push(rw);
    }
    if (rt) {
      query += ' AND w.rt = ?';
      params.push(rt);
    }
    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Update status dan catatan tanggapan pengaduan
   */
  async updateStatus(id, { status, catatan_admin }) {
    let query = 'UPDATE pengaduan SET status = ?, catatan_admin = ?';
    const params = [status, catatan_admin || null];
    if (status === 'RESOLVED') {
      query += ', resolved_at = NOW()';
    }
    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.execute(query, params);
    return result;
  }
}

module.exports = new PengaduanRepository();

