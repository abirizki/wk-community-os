/**
 * src/services/kk.service.js
 * Business Logic Layer for Kartu Keluarga.
 */

const kkRepository = require('../repositories/kk.repository');

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

    const kk = await kkRepository.findByNoKk(noKk.trim());
    
    if (!kk) {
      const err = new Error('Data Kartu Keluarga tidak ditemukan');
      err.status = 404;
      throw err;
    }

    return kk;
  }
}

module.exports = new KkService();

