/**
 * src/services/pengaduan.service.js
 * Business Logic Layer for Pengaduan.
 */

const pengaduanRepository = require('../repositories/pengaduan.repository');

class PengaduanService {
  /**
   * Buat pengaduan baru
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  async createPengaduan(payload) {
    const { nik_pelapor, judul, deskripsi, kategori } = payload;

    if (!nik_pelapor) {
      const err = new Error('NIK pelapor tidak ditemukan dalam sesi');
      err.status = 400;
      throw err;
    }

    if (!judul || judul.trim() === '') {
      const err = new Error('Judul pengaduan tidak boleh kosong');
      err.status = 400;
      throw err;
    }

    if (!deskripsi || deskripsi.trim().length < 10) {
      const err = new Error('Deskripsi pengaduan minimal 10 karakter');
      err.status = 400;
      throw err;
    }

    if (!kategori) {
      const err = new Error('Kategori pengaduan harus dipilih');
      err.status = 400;
      throw err;
    }

    const result = await pengaduanRepository.create(payload);
    
    return {
      id: result.insertId,
      ...payload,
      status: 'PENDING'
    };
  }

  /**
   * Ambil daftar pengaduan berdasarkan NIK
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async getByNik(nik) {
    if (!nik) {
      const err = new Error('NIK pelapor tidak valid');
      err.status = 400;
      throw err;
    }

    return await pengaduanRepository.findByNik(nik);
  }

  /**
   * Ambil semua pengaduan
   * @returns {Promise<Array>}
   */
  async getAll() {
    return await pengaduanRepository.list();
  }
}

module.exports = new PengaduanService();
