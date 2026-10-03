/**
 * src/services/aparatur.service.js
 * Business Logic Layer for Aparatur Kelurahan, RT/RW, & Mitra Keamanan
 * Bumi Warga - Jabar Pintar Digital
 */

const aparaturRepository = require('../repositories/aparatur.repository');
const wargaRepository = require('../repositories/warga.repository');

class AparaturService {
  async getDirectory(query = {}) {
    return await aparaturRepository.list(query);
  }

  async getById(id) {
    const item = await aparaturRepository.findById(id);
    if (!item) {
      const err = new Error('Data pejabat aparatur tidak ditemukan');
      err.status = 404;
      throw err;
    }
    return item;
  }

  async createPejabat(payload) {
    if (!payload.nama_pejabat || payload.nama_pejabat.trim() === '') {
      throw new Error('Nama pejabat aparatur wajib diisi');
    }
    if (!payload.kategori) {
      throw new Error('Kategori aparatur wajib dipilih');
    }
    if (!payload.jabatan) {
      throw new Error('Jabatan wajib diisi');
    }

    // Jika ditautkan dengan NIK warga, sinkronisasi data warga
    if (payload.nik_pejabat) {
      const warga = await wargaRepository.findByNik(payload.nik_pejabat);
      if (warga) {
        if (!payload.nama_pejabat) payload.nama_pejabat = warga.nama;
        if (!payload.no_wa && warga.no_telepon) payload.no_wa = warga.no_telepon;
      }
    }

    return await aparaturRepository.create(payload);
  }

  async updatePejabat(id, payload) {
    await this.getById(id);
    return await aparaturRepository.update(id, payload);
  }

  async deletePejabat(id) {
    await this.getById(id);
    return await aparaturRepository.delete(id);
  }
}

module.exports = new AparaturService();
