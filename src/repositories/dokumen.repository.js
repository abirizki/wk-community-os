/**
 * src/repositories/dokumen.repository.js
 * Data Access Layer for Dokumen Request (Pelayanan Surat Kelurahan).
 */

const pool = require('../db/pool');

class DokumenRepository {
  /**
   * Buat permohonan surat baru
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  async create(payload) {
    const { nik_pemohon, jenis_dokumen, keperluan } = payload;
    const [result] = await pool.execute(
      `INSERT INTO dokumen_request (nik_pemohon, jenis_dokumen, keperluan, status) 
       VALUES (?, ?, ?, 'SUBMITTED')`,
      [nik_pemohon, jenis_dokumen, keperluan]
    );
    return result;
  }

  /**
   * Ambil daftar permohonan surat milik warga (berdasarkan NIK)
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      `SELECT * FROM dokumen_request WHERE nik_pemohon = ? ORDER BY created_at DESC`,
      [nik]
    );
    return rows;
  }

  /**
   * Ambil detail permohonan surat berdasarkan ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM dokumen_request WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Ambil semua permohonan surat (untuk admin/operator)
   * @returns {Promise<Array>}
   */
  async list() {
    const [rows] = await pool.execute(
      `SELECT d.*, w.nama as nama_pemohon, w.no_telepon 
       FROM dokumen_request d 
       LEFT JOIN warga w ON d.nik_pemohon = w.nik 
       ORDER BY d.created_at DESC`
    );
    return rows;
  }

  /**
   * Update status permohonan dokumen
   * @param {number} id 
   * @param {string} status 
   * @param {string} catatan_admin 
   * @param {string} file_hasil 
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status, catatan_admin = null, file_hasil = null) {
    const approvedAt = status === 'APPROVED' || status === 'READY_PICKUP' ? new Date() : null;
    const [result] = await pool.execute(
      `UPDATE dokumen_request 
       SET status = ?, catatan_admin = COALESCE(?, catatan_admin), file_hasil = COALESCE(?, file_hasil), approved_at = COALESCE(?, approved_at)
       WHERE id = ?`,
      [status, catatan_admin, file_hasil, approvedAt, id]
    );
    return result;
  }
}

module.exports = new DokumenRepository();

