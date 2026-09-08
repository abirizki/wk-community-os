/**
 * src/services/warga.service.js
 * Business Logic Layer for Warga entity.
 */

const wargaRepository = require('../repositories/warga.repository');

class WargaService {
  /**
   * Ambil data warga berdasarkan NIK
   * @param {string} nik 
   * @returns {Promise<Object>}
   */
  async getByNik(nik) {
    if (!nik || nik.length < 5) {
      const err = new Error('NIK tidak valid atau terlalu pendek');
      err.status = 400;
      throw err;
    }

    const warga = await wargaRepository.findByNik(nik);
    
    if (!warga) {
      const err = new Error('Data Warga tidak ditemukan');
      err.status = 404;
      throw err;
    }

    return warga;
  }

  /**
   * Ambil daftar warga
   * @param {Object} options 
   * @returns {Promise<Array>}
   */
  async listWarga({ limit = 20, offset = 0 } = {}) {
    return await wargaRepository.list({ limit, offset });
  }
}

module.exports = new WargaService();

