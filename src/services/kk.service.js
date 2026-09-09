/**
 * src/services/kk.service.js
 * Business Logic Layer for Kartu Keluarga & KK Digital
 * Bumi Warga - Jabar Pintar Digital
 */

const kkRepository = require('../repositories/kk.repository');
const pool = require('../db/pool');

class KkService {
  /**
   * Ambil data KK berdasarkan No KK
   * @param {string} noKk
   * @returns {Promise<Object>}
   */
  async getByNoKk(noKk) {
    if (!noKk || typeof noKk !== 'string' || noKk.trim().length < 10 || !/^\d+$/.test(noKk)) {
      const err = new Error('No KK tidak valid (harus numerik, minimal 10 digit)');
      err.status = 400;
      throw err;
    }

    const kk = await kkRepository.findWithMembersByNoKk(noKk.trim());
    
    if (!kk) {
      const err = new Error('Data Kartu Keluarga tidak ditemukan');
      err.status = 404;
      throw err;
    }

    return kk;
  }

  /**
   * Ambil data KK digital milik akun yang sedang login
   * @param {Object} currentUser
   * @returns {Promise<Object>}
   */
  async getMyFamilyCard(currentUser) {
    let noKk = currentUser.no_kk;

    if (!noKk) {
      // Coba cari no_kk dari NIK atau user_id di tabel warga
      const [rows] = await pool.execute(
        'SELECT no_kk FROM warga WHERE nik = ? OR user_id = ? LIMIT 1',
        [currentUser.active_nik || currentUser.username, currentUser.id]
      );
      if (rows.length > 0) {
        noKk = rows[0].no_kk;
      }
    }

    if (!noKk) {
      const err = new Error('Akun Anda belum terhubung dengan nomor Kartu Keluarga resmi.');
      err.status = 404;
      throw err;
    }

    const card = await kkRepository.findWithMembersByNoKk(noKk);
    if (!card) {
      const err = new Error('Berkas Kartu Keluarga tidak ditemukan di database.');
      err.status = 404;
      throw err;
    }

    return card;
  }
}

module.exports = new KkService();
