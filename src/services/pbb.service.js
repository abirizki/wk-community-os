/**
 * src/services/pbb.service.js
 * Business Logic Layer for PBB.
 */

const pbbRepository = require('../repositories/pbb.repository');

class PbbService {
  /**
   * Ambil daftar tagihan PBB berdasarkan NIK warga
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async getTagihanByNik(nik) {
    if (!nik) {
      const err = new Error('NIK tidak valid');
      err.status = 400;
      throw err;
    }

    return await pbbRepository.findByNik(nik);
  }

  /**
   * Simulasi pembayaran tagihan PBB
   * @param {string} nop 
   * @param {number} tahun 
   * @param {string} nikPelapor - untuk validasi otorisasi (opsional jika warga hanya bisa bayar pajaknya sendiri)
   * @returns {Promise<Object>}
   */
  async bayarTagihan(nop, tahun, nikPelapor) {
    if (!nop || !tahun) {
      const err = new Error('NOP dan Tahun wajib diisi');
      err.status = 400;
      throw err;
    }

    // Cek keberadaan tagihan
    const tagihan = await pbbRepository.findByNopAndTahun(nop, tahun);
    if (!tagihan) {
      const err = new Error('Data tagihan PBB tidak ditemukan');
      err.status = 404;
      throw err;
    }

    // Validasi kepemilikan (Warga hanya bisa bayar miliknya)
    if (tagihan.nik_warga !== nikPelapor) {
      const err = new Error('Anda tidak memiliki akses ke tagihan ini');
      err.status = 403;
      throw err;
    }

    if (tagihan.status_pembayaran === 'PAID') {
      const err = new Error('Tagihan ini sudah dibayar');
      err.status = 400;
      throw err;
    }

    // Proses update status
    await pbbRepository.updateStatus(nop, tahun, 'PAID');
    
    return {
      nop,
      tahun,
      status_pembayaran: 'PAID',
      message: 'Pembayaran berhasil'
    };
  }
}

module.exports = new PbbService();
