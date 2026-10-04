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
    if (!nik_target) return null;

    try {
      // 1. Verifikasi apakah nik_target ada di tabel warga untuk mencegah pelanggaran FK
      let targetNik = String(nik_target).trim();
      const [wCheck] = await pool.execute('SELECT nik FROM warga WHERE nik = ? LIMIT 1', [targetNik]);

      if (wCheck.length === 0) {
        // Fallback: Jika target adalah username dari akun users, cari NIK warga yang terafiliasi
        try {
          const [uWarga] = await pool.execute(
            `SELECT w.nik FROM warga w 
             JOIN users u ON (w.user_id = u.id OR w.nik = u.username) 
             WHERE u.username = ? OR u.email = ? LIMIT 1`,
            [targetNik, targetNik]
          );
          if (uWarga.length > 0) {
            targetNik = uWarga[0].nik;
          } else {
            console.warn(`[NotifikasiRepo] Peringatan: NIK target '${targetNik}' tidak ditemukan di tabel warga. Notifikasi dilewati agar tidak memicu error FK.`);
            return { skipped: true, reason: 'NIK target not in warga' };
          }
        } catch (subErr) {
          return { skipped: true, reason: subErr.message };
        }
      }

      const [result] = await pool.execute(
        `INSERT INTO notifikasi (nik_target, judul, pesan, tipe, link) 
         VALUES (?, ?, ?, ?, ?)`,
        [targetNik, judul, pesan, tipe, link]
      );
      return result;
    } catch (err) {
      console.warn('[NotifikasiRepo] Gagal membuat notifikasi (handled):', err.message);
      return { skipped: true, error: err.message };
    }
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

