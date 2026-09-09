/**
 * src/services/notifikasi.service.js
 * Business Logic Layer for In-App Notifications.
 */

const notifikasiRepository = require('../repositories/notifikasi.repository');

class NotifikasiService {
  /**
   * Ambil daftar notifikasi untuk warga
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async getByNik(nik) {
    if (!nik) {
      const err = new Error('NIK tidak valid');
      err.status = 400;
      throw err;
    }
    return await notifikasiRepository.findByNik(nik);
  }

  /**
   * Hitung jumlah notifikasi belum dibaca
   * @param {string} nik 
   * @returns {Promise<Object>}
   */
  async getUnreadCount(nik) {
    if (!nik) {
      return { unread: 0 };
    }
    const count = await notifikasiRepository.countUnread(nik);
    return { unread: count };
  }

  /**
   * Tandai notifikasi spesifik sebagai dibaca
   * @param {number} id 
   * @param {string} nik 
   * @returns {Promise<Object>}
   */
  async markRead(id, nik) {
    await notifikasiRepository.markAsRead(id, nik);
    return { success: true };
  }

  /**
   * Tandai semua notifikasi warga sebagai dibaca
   * @param {string} nik 
   * @returns {Promise<Object>}
   */
  async markAllRead(nik) {
    await notifikasiRepository.markAllAsRead(nik);
    return { success: true };
  }
}

module.exports = new NotifikasiService();

