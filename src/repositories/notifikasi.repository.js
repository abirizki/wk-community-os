/**
 * src/repositories/notifikasi.repository.js
 * Data Access Layer for In-App Notifications.
 */

const pool = require('../db/pool');

class NotifikasiRepository {
  /**
   * Buat notifikasi baru untuk warga
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  async create(payload) {
    const { nik_target, judul, pesan, tipe = 'info', link = null } = payload;
    const [result] = await pool.execute(
      `INSERT INTO notifikasi (nik_target, judul, pesan, tipe, link) 
       VALUES (?, ?, ?, ?, ?)`,
      [nik_target, judul, pesan, tipe, link]
    );
    return result;
  }

  /**
   * Ambil daftar notifikasi untuk warga
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      `SELECT * FROM notifikasi WHERE nik_target = ? ORDER BY created_at DESC LIMIT 30`,
      [nik]
    );
    return rows;
  }

  /**
   * Tandai satu notifikasi sebagai telah dibaca
   * @param {number} id 
   * @param {string} nik 
   * @returns {Promise<Object>}
   */
  async markAsRead(id, nik) {
    const [result] = await pool.execute(
      `UPDATE notifikasi SET is_read = 1 WHERE id = ? AND nik_target = ?`,
      [id, nik]
    );
    return result;
  }

  /**
   * Tandai semua notifikasi warga sebagai telah dibaca
   * @param {string} nik 
   * @returns {Promise<Object>}
   */
  async markAllAsRead(nik) {
    const [result] = await pool.execute(
      `UPDATE notifikasi SET is_read = 1 WHERE nik_target = ?`,
      [nik]
    );
    return result;
  }

  /**
   * Hitung jumlah notifikasi belum dibaca
   * @param {string} nik 
   * @returns {Promise<number>}
   */
  async countUnread(nik) {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as unread_count FROM notifikasi WHERE nik_target = ? AND is_read = 0`,
      [nik]
    );
    return rows[0] ? rows[0].unread_count : 0;
  }
}

module.exports = new NotifikasiRepository();

