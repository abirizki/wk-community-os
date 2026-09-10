/**
 * src/services/dokumen.service.js
 * Business Logic Layer for Dokumen Request.
 * Business Logic Layer for Multi-Tier Document Approvals & Demography Event Triggers.
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');
const dokumenRepository = require('../repositories/dokumen.repository');
const notifikasiRepository = require('../repositories/notifikasi.repository');
const bansosRepository = require('../repositories/bansos.repository');
const wargaRepository = require('../repositories/warga.repository');

class DokumenService {
  /**
   * Ajukan permohonan surat baru
   * @param {Object} payload 
   * @returns {Promise<Object>}
   */
  async requestDokumen(payload) {
    const { nik_pemohon, jenis_dokumen, keperluan } = payload;
  async requestDokumen(payload, currentUser) {
    const activeNik = currentUser.active_nik || currentUser.username;
    const { jenis_dokumen, keperluan } = payload;

    if (!nik_pemohon) {
      const err = new Error('NIK pemohon wajib disertakan dari sesi');
      err.status = 400;
    if (!activeNik) {
      const err = new Error('Sesi autentikasi NIK pemohon tidak ditemukan');
      err.status = 401;
      throw err;
    }

    if (!jenis_dokumen || jenis_dokumen.trim() === '') {
      const err = new Error('Jenis dokumen wajib dipilih');
      const err = new Error('Jenis dokumen/surat wajib dipilih');
      err.status = 400;
      throw err;
    }

    if (!keperluan || keperluan.trim().length < 5) {
      const err = new Error('Keperluan permohonan surat minimal 5 karakter');
      err.status = 400;
      throw err;
    }

    const result = await dokumenRepository.create(payload);
    // Ambil data domisili pemohon
    const warga = await wargaRepository.findByNik(activeNik);
    const rt = warga ? warga.rt : (currentUser.rt || '001');
    const rw = warga ? warga.rw : (currentUser.rw || '001');

    // Kirim notifikasi konfirmasi ke pemohon
    const result = await dokumenRepository.create({
      nik_pemohon: activeNik,
      jenis_dokumen: jenis_dokumen.trim(),
      keperluan: keperluan.trim(),
      rt,
      rw
    });

    // Kirim notifikasi ke pemohon
    try {
      await notifikasiRepository.create({
        nik_target: nik_pemohon,
        nik_target: activeNik,
        judul: 'Permohonan Surat Diajukan',
        pesan: `Permohonan ${jenis_dokumen} Anda telah diterima sistem dan sedang dalam antrean verifikasi petugas kelurahan.`,
        pesan: `Permohonan ${jenis_dokumen} (No: ${result.nomor_registrasi}) berhasil diajukan dan sedang menunggu verifikasi Ketua RT ${rt}.`,
        tipe: 'info',
        link: '/dashboard/dokumen'
      });
    } catch (e) {
      console.warn('Gagal memicu notifikasi pengajuan dokumen:', e.message);
      console.warn('Notifikasi error:', e.message);
    }

    return {
      id: result.insertId,
      ...payload,
      status: 'SUBMITTED',
      created_at: new Date()
    };
    return result;
  }

  /**
   * Ambil daftar permohonan surat warga tertentu
   * @param {string} nik 
   * @returns {Promise<Array>}
   * Ambil daftar permohonan surat milik warga aktif atau seluruh keluarga
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
   * Ambil seluruh permohonan surat berdasar hierarki peran
   */
  async getAll() {
    return await dokumenRepository.list();
  async listByScope(currentUser, query = {}) {
    const { role, rt, rw } = currentUser;
    const filter = {
      status: query.status || null,
      approval_step: query.approval_step || null,
      limit: parseInt(query.limit, 10) || 50,
      offset: parseInt(query.offset, 10) || 0
    };

    if (role === 'ketua_rt') {
      filter.rt = rt;
      filter.rw = rw;
    } else if (role === 'ketua_rw' || role === 'admin_rw') {
      filter.rw = rw;
      if (query.rt) filter.rt = query.rt;
    } else {
      // Admin Kelurahan & Super Admin
      if (query.rw) filter.rw = query.rw;
      if (query.rt) filter.rt = query.rt;
    }

    return await dokumenRepository.list(filter);
  }

  /**
   * Update status permohonan surat oleh operator/admin
   * @param {number} id 
   * @param {string} status 
   * @param {string} catatan_admin 
   * @param {string} file_hasil 
   * @returns {Promise<Object>}
   * Eksekusi trigger demografi otomatis saat surat disahkan oleh Kelurahan
   */
  async updateStatus(id, status, catatan_admin = null, file_hasil = null) {
    const validStatuses = ['SUBMITTED', 'VERIFYING', 'APPROVED', 'REJECTED', 'READY_PICKUP'];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Status tidak valid. Pilihan: ${validStatuses.join(', ')}`);
      err.status = 400;
      throw err;
  async executeDemographyTrigger(doc) {
    const jenis = (doc.jenis_surat || doc.jenis_dokumen || '').toLowerCase();
    const nik = doc.nik_pemohon;

    console.log(`[Demography Trigger] Checking triggers for '${jenis}' on NIK: ${nik}`);

    // 1. Trigger Kematian / Surat Keterangan Meninggal Dunia
    if (jenis.includes('meninggal') || jenis.includes('kematian')) {
      await pool.execute(
        `UPDATE warga SET status_kependudukan = 'Meninggal' WHERE nik = ?`,
        [nik]
      );
      await pool.execute(
        `UPDATE users SET status = 'inactive' WHERE username = ?`,
        [nik]
      );
      await pool.execute(
        `UPDATE posyandu_lansia SET status_tinggal = 'Sebatang Kara' WHERE nik = ?`,
        [nik]
      );
      console.log(`[Trigger Sukses] Status kependudukan ${nik} diubah ke 'Meninggal' dan akun dinonaktifkan.`);
      return true;
    }

    // 2. Trigger Pindah Domisili
    if (jenis.includes('pindah') || jenis.includes('domisili')) {
      if (jenis.includes('pindah')) {
        await pool.execute(
          `UPDATE warga SET status_kependudukan = 'Pindah' WHERE nik = ?`,
          [nik]
        );
        console.log(`[Trigger Sukses] Status kependudukan ${nik} diubah ke 'Pindah'.`);
        return true;
      }
    }

    // 3. Trigger Surat Keterangan Tidak Mampu (SKTM) -> Masuk Antrean Bansos Otomatis
    if (jenis.includes('tidak mampu') || jenis.includes('sktm')) {
      const warga = await wargaRepository.findByNik(nik);
      if (warga) {
        await bansosRepository.create({
          no_kk: warga.no_kk,
          nik_penerima: warga.nik,
          nama_penerima: warga.nama,
          jenis_bansos: 'SKTM',
          alasan_pengajuan: `Otomatis direkomendasikan melalui pengesahan SKTM: ${doc.keperluan}`,
          nominal_bantuan: 300000.00,
          status: 'APPROVED',
          approval_step: 'COMPLETED',
          rt: warga.rt,
          rw: warga.rw,
          catatan_verifikasi: 'Evidensi tervalidasi via Surat Keterangan Tidak Mampu resmi Kelurahan Kebonjati.'
        });
        console.log(`[Trigger Sukses] Keluarga ${warga.nama} (KK: ${warga.no_kk}) otomatis dimasukkan ke daftar penerima bantuan SKTM.`);
        return true;
      }
    }

    return false;
  }

  /**
   * Verifikasi & Persetujuan Berjenjang (RT -> RW -> Kelurahan)
   */
  async approveDokumen(id, currentUser, catatan = '') {
    const doc = await dokumenRepository.findById(id);
    if (!doc) {
      const err = new Error('Dokumen tidak ditemukan');
      err.status = 404;
      throw err;
    }

    await dokumenRepository.updateStatus(id, status, catatan_admin, file_hasil);
    if (doc.status === 'APPROVED') {
      throw new Error('Dokumen ini sudah disetujui sebelumnya.');
    }
    if (doc.status === 'REJECTED') {
      throw new Error('Dokumen ini sudah ditolak dan tidak dapat diproses lagi.');
    }

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
    const { role } = currentUser;

    // STEP 1: Persetujuan Ketua RT
    if (role === 'ketua_rt') {
      if (doc.approval_step !== 'RT') {
        throw new Error('Tahap verifikasi dokumen ini bukan di tingkat RT.');
      }
      await dokumenRepository.updateApproval(id, {
        status: 'VERIFYING',
        approval_step: 'RW',
        approved_by_rt: currentUser.id,
        catatan_petugas: catatan || 'Disetujui oleh Ketua RT, diteruskan ke RW'
      });

      // Notifikasi ke warga
      await notifikasiRepository.create({
        nik_target: doc.nik_pemohon,
        judul: `Update Status: ${doc.jenis_dokumen}`,
        pesan,
        tipe,
        judul: 'Persetujuan RT Berhasil',
        pesan: `Permohonan surat ${doc.jenis_dokumen} telah disetujui RT ${doc.rt} dan diteruskan ke RW ${doc.rw}.`,
        tipe: 'info',
        link: '/dashboard/dokumen'
      });
    } catch (e) {
      console.warn('Gagal memicu notifikasi update dokumen:', e.message);

      return { success: true, step: 'RW', message: 'Disetujui oleh RT. Menunggu verifikasi RW.' };
    }

    return { id, status, catatan_admin, file_hasil };
    // STEP 2: Persetujuan Ketua RW / Admin RW
    if (role === 'ketua_rw' || role === 'admin_rw') {
      if (doc.approval_step !== 'RW' && doc.approval_step !== 'RT') {
        throw new Error('Tahap verifikasi dokumen ini bukan di tingkat RW.');
      }
      await dokumenRepository.updateApproval(id, {
        status: 'VERIFYING',
        approval_step: 'KELURAHAN',
        approved_by_rw: currentUser.id,
        catatan_petugas: catatan || 'Disetujui oleh Ketua RW, diteruskan ke Kantor Kelurahan'
      });

      // Notifikasi ke warga
      await notifikasiRepository.create({
        nik_target: doc.nik_pemohon,
        judul: 'Persetujuan RW Berhasil',
        pesan: `Permohonan surat ${doc.jenis_dokumen} telah disetujui RW ${doc.rw} dan sedang dalam pengesahan Kelurahan Kebonjati.`,
        tipe: 'info',
        link: '/dashboard/dokumen'
      });

      return { success: true, step: 'KELURAHAN', message: 'Disetujui oleh RW. Menunggu pengesahan Kelurahan.' };
    }

    // STEP 3: Pengesahan Kelurahan (Admin Kelurahan / Superadmin)
    if (['admin_kelurahan', 'superadmin', 'admin'].includes(role)) {
      // Eksekusi trigger demografi
      let triggerRan = false;
      try {
        triggerRan = await this.executeDemographyTrigger(doc);
      } catch (triggerErr) {
        console.error('Trigger execution error:', triggerErr.message);
      }

      await dokumenRepository.updateApproval(id, {
        status: 'APPROVED',
        approval_step: 'COMPLETED',
        approved_by_kelurahan: currentUser.id,
        catatan_petugas: catatan || 'Surat resmi telah disahkan dan siap dicetak / diambil di kantor kelurahan.',
        trigger_executed: triggerRan ? 1 : 0
      });

      // Notifikasi akhir ke warga
      await notifikasiRepository.create({
        nik_target: doc.nik_pemohon,
        judul: 'Surat Resmi Telah Disahkan',
        pesan: `Selamat! Permohonan ${doc.jenis_dokumen} Anda telah RESMI DISETUJUI dan disahkan oleh Kelurahan Kebonjati. Silakan unduh atau cetak dokumen Anda.`,
        tipe: 'success',
        link: '/dashboard/dokumen'
      });

      return { 
        success: true, 
        step: 'COMPLETED', 
        status: 'APPROVED', 
        trigger_executed: triggerRan,
        message: 'Surat telah resmi disahkan oleh Kelurahan Kebonjati dan trigger data demografi berhasil dieksekusi.' 
      };
    }

    throw new Error('Peran Anda tidak memiliki wewenang untuk menyetujui dokumen ini.');
  }

  /**
   * Penolakan Dokumen oleh Petugas RT, RW, atau Kelurahan
   */
  async rejectDokumen(id, currentUser, catatan = '') {
    const doc = await dokumenRepository.findById(id);
    if (!doc) {
      const err = new Error('Dokumen tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const alasan = catatan || 'Persyaratan administrasi atau berkas belum lengkap.';

    await dokumenRepository.updateApproval(id, {
      status: 'REJECTED',
      approval_step: 'COMPLETED',
      catatan_petugas: `Ditolak oleh ${currentUser.nama} (${currentUser.role}): ${alasan}`
    });

    // Notifikasi penolakan ke warga
    await notifikasiRepository.create({
      nik_target: doc.nik_pemohon,
      judul: 'Permohonan Surat Ditolak',
      pesan: `Permohonan ${doc.jenis_dokumen} Anda tidak dapat diproses. Alasan: ${alasan}`,
      tipe: 'error',
      link: '/dashboard/dokumen'
    });

    return {
      success: true,
      status: 'REJECTED',
      message: 'Permohonan surat berhasil ditolak dengan catatan pemberitahuan ke warga.'
    };
  }
}

module.exports = new DokumenService();

