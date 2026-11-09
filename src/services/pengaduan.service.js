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
   * Ambil semua pengaduan dengan filter wilayah berdasar peran pengguna
   * @param {Object} currentUser
   * @returns {Promise<Array>}
   */
  async getAll(currentUser = {}) {
    const filters = {};
    if (currentUser.role === 'ketua_rt') {
      filters.rt = currentUser.rt;
      filters.rw = currentUser.rw || '001';
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      filters.rw = currentUser.rw || '001';
    }
    return await pengaduanRepository.list(filters);
  }

  /**
   * Tindak lanjut / mediasi pengaduan warga oleh aparatur RT/RW/Kelurahan
   */
  async updateStatus(id, { status, catatan_admin }, currentUser = {}) {
    const allowed = ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'lurah', 'superadmin', 'admin'];
    if (!allowed.includes(currentUser.role)) {
      const err = new Error('Hanya aparatur lingkungan yang berwenang menindaklanjuti pengaduan.');
      err.status = 403;
      throw err;
    }
    await pengaduanRepository.updateStatus(id, { status, catatan_admin });
    return { success: true, message: `Status aduan berhasil diperbarui menjadi ${status}.` };
  }
}

module.exports = new PengaduanService();

