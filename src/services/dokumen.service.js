/**
 * src/services/dokumen.service.js
 * Business Logic Layer for Dokumen Request.
 */

const dokumenRepository = require('../repositories/dokumen.repository');
const notifikasiRepository = require('../repositories/notifikasi.repository');

class DokumenService {
  /**
   * Ajukan permohonan surat baru
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  async requestDokumen(payload) {
    const { nik_pemohon, jenis_dokumen, keperluan } = payload;

    if (!nik_pemohon) {
      const err = new Error('NIK pemohon wajib disertakan dari sesi');
      err.status = 400;
      throw err;
    }

    if (!jenis_dokumen || jenis_dokumen.trim() === '') {
      const err = new Error('Jenis dokumen wajib dipilih');
      err.status = 400;
      throw err;
    }

    if (!keperluan || keperluan.trim().length < 5) {
      const err = new Error('Keperluan permohonan surat minimal 5 karakter');
      err.status = 400;
      throw err;
    }

    const result = await dokumenRepository.create(payload);

    // Kirim notifikasi konfirmasi ke pemohon
    try {
      await notifikasiRepository.create({
        nik_target: nik_pemohon,
        judul: 'Permohonan Surat Diajukan',
        pesan: `Permohonan ${jenis_dokumen} Anda telah diterima sistem dan sedang dalam antrean verifikasi petugas kelurahan.`,
        tipe: 'info',
        link: '/dashboard/dokumen'
      });
    } catch (e) {
      console.warn('Gagal memicu notifikasi pengajuan dokumen:', e.message);
    }

    return {
      id: result.insertId,
      ...payload,
      status: 'SUBMITTED',
      created_at: new Date()
    };
  }

  /**
   * Ambil daftar permohonan surat warga tertentu
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async getByNik(nik) {
    if (!nik) {
      const err = new Error('NIK tidak valid');
      err.status = 400;
      throw err;
    }
    return await dokumenRepository.findByNik(nik);
  }

  /**
   * Ambil seluruh permohonan surat (Operator / Admin)
   * @returns {Promise<Array>}
   */
  async getAll() {
    return await dokumenRepository.list();
  }

  /**
   * Update status permohonan surat oleh operator/admin
   * @param {number} id 
   * @param {string} status 
   * @param {string} catatan_admin 
   * @param {string} file_hasil 
   * @returns {Promise<Object>}
   */
  async updateStatus(id, status, catatan_admin = null, file_hasil = null) {
    const validStatuses = ['SUBMITTED', 'VERIFYING', 'APPROVED', 'REJECTED', 'READY_PICKUP'];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Status tidak valid. Pilihan: ${validStatuses.join(', ')}`);
      err.status = 400;
      throw err;
    }

    const doc = await dokumenRepository.findById(id);
    if (!doc) {
      const err = new Error('Dokumen tidak ditemukan');
      err.status = 404;
      throw err;
    }

    await dokumenRepository.updateStatus(id, status, catatan_admin, file_hasil);

    // Kirim notifikasi status terbaru ke warga
    try {
      let pesan = `Status permohonan ${doc.jenis_dokumen} Anda telah diperbarui menjadi: ${status}.`;
      let tipe = 'info';
      if (status === 'APPROVED' || status === 'READY_PICKUP') {
        pesan = `Kabar baik! Permohonan ${doc.jenis_dokumen} Anda telah DISETUJUI dan siap diambil di Kantor Kelurahan Kebonjati.`;
        tipe = 'success';
      } else if (status === 'REJECTED') {
        pesan = `Permohonan ${doc.jenis_dokumen} Anda DITOLAK. Catatan: ${catatan_admin || 'Persyaratan belum lengkap.'}`;
        tipe = 'error';
      }

      await notifikasiRepository.create({
        nik_target: doc.nik_pemohon,
        judul: `Update Status: ${doc.jenis_dokumen}`,
        pesan,
        tipe,
        link: '/dashboard/dokumen'
      });
    } catch (e) {
      console.warn('Gagal memicu notifikasi update dokumen:', e.message);
    }

    return { id, status, catatan_admin, file_hasil };
  }
}

module.exports = new DokumenService();

