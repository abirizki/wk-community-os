/**
 * src/services/posyandu.service.js
 * Business Logic Layer for Posyandu.
 */

const posyanduRepository = require('../repositories/posyandu.repository');

class PosyanduService {
  /**
   * Catat rekam medis baru
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  async createRecord(payload) {
    const { 
      nik_warga, 
      nama_anak, 
      umur_bulan, 
      berat_badan_kg, 
      tinggi_badan_cm, 
      tanggal_pemeriksaan 
    } = payload;

    if (!nik_warga) {
      const err = new Error('NIK Wali tidak ditemukan dalam sesi');
      err.status = 400;
      throw err;
    }

    if (!nama_anak || nama_anak.trim() === '') {
      const err = new Error('Nama anak wajib diisi');
      err.status = 400;
      throw err;
    }

    if (isNaN(berat_badan_kg) || parseFloat(berat_badan_kg) <= 0) {
      const err = new Error('Berat badan harus berupa angka positif');
      err.status = 400;
      throw err;
    }

    if (isNaN(tinggi_badan_cm) || parseFloat(tinggi_badan_cm) <= 0) {
      const err = new Error('Tinggi badan harus berupa angka positif');
      err.status = 400;
      throw err;
    }

    const result = await posyanduRepository.create(payload);
    
    return {
      id: result.insertId,
      ...payload
    };
  }

  /**
   * Ambil riwayat posyandu berdasarkan NIK ortu/wali
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async getHistoryByNik(nik) {
    if (!nik) {
      const err = new Error('NIK tidak valid');
      err.status = 400;
      throw err;
    }

    return await posyanduRepository.findByNik(nik);
  }
}

module.exports = new PosyanduService();
