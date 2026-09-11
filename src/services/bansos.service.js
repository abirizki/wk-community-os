/**
 * src/services/bansos.service.js
 * Business Logic Layer for Tiered Bantuan Sosial (Bansos) & Verifikasi Berjenjang.
 * Bumi Warga - Jabar Pintar Digital
 */

const bansosRepository = require('../repositories/bansos.repository');
const wargaRepository = require('../repositories/warga.repository');
const notifikasiRepository = require('../repositories/notifikasi.repository');

class BansosService {
  /**
   * Usulkan calon penerima bansos baru (RT / RW / Kelurahan)
   */
  async proposeBansos(payload, currentUser) {
    const allowedRoles = ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya Ketua RT, RW, dan Admin yang berwenang mengusulkan penerima bansos.');
      err.status = 403;
      throw err;
    }

    let { no_kk, nik_penerima, nama_penerima, jenis_bansos, alasan_pengajuan, nominal_bantuan, rt, rw } = payload;

    if (!nik_penerima || String(nik_penerima).trim().length !== 16) {
      const err = new Error('NIK penerima manfaat harus 16 digit');
      err.status = 400;
      throw err;
    }

    if (!jenis_bansos) {
      const err = new Error('Jenis bantuan sosial wajib dipilih');
      err.status = 400;
      throw err;
    }

    if (!alasan_pengajuan || alasan_pengajuan.trim().length < 5) {
      const err = new Error('Alasan evidensi pengajuan minimal 5 karakter');
      err.status = 400;
      throw err;
    }

    // Ambil data warga dari repository jika nama belum diisi
    if (!nama_penerima || !no_kk) {
      const warga = await wargaRepository.findByNik(nik_penerima);
      if (warga) {
        nama_penerima = warga.nama;
        no_kk = warga.no_kk;
        rt = warga.rt;
        rw = warga.rw;
      }
    }

    // Enforce wilayah RT / RW
    if (currentUser.role === 'ketua_rt') {
      rt = currentUser.rt;
      rw = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      rw = currentUser.rw;
    }

    // Tentukan tahap approval awal berdasar siapa yang mengusulkan
    let initialStatus = 'PENDING_RW';
    let initialStep = 'RW';

    if (['admin_kelurahan', 'superadmin', 'admin'].includes(currentUser.role)) {
      initialStatus = 'APPROVED';
      initialStep = 'COMPLETED';
    }

    const bansos = await bansosRepository.create({
      no_kk: no_kk || '3273010101900001',
      nik_penerima,
      nama_penerima: nama_penerima || 'Warga Kebonjati',
      jenis_bansos,
      alasan_pengajuan: alasan_pengajuan.trim(),
      nominal_bantuan: parseFloat(nominal_bantuan) || 0,
      status: initialStatus,
      approval_step: initialStep,
      rt: rt || '001',
      rw: rw || '001',
      diajukan_oleh_user_id: currentUser.id
    });

    // Notifikasi ke warga calon penerima
    try {
      await notifikasiRepository.create({
        nik_target: nik_penerima,
        judul: 'Usulan Bantuan Sosial Didaftarkan',
        pesan: `Anda diusulkan sebagai calon penerima manfaat ${jenis_bansos} oleh pengurus RT/RW. Usulan sedang dalam proses verifikasi.`,
        tipe: 'info',
        link: '/dashboard/bansos'
      });
    } catch (e) {
      console.warn('Notifikasi bansos error:', e.message);
    }

    return bansos;
  }

  /**
   * Ambil daftar usulan bansos berdasar scope hierarki
   */
  async listBansos(currentUser, query = {}) {
    const { role, rt, rw } = currentUser;
    const filter = {
      status: query.status || null,
      jenis_bansos: query.jenis_bansos || null,
      search: query.search || '',
      limit: parseInt(query.limit, 10) || 50,
      offset: parseInt(query.offset, 10) || 0
    };

    if (role === 'ketua_rt') {
      filter.rt = rt;
      filter.rw = rw;
    } else if (role === 'ketua_rw' || role === 'admin_rw') {
      filter.rw = rw;
      if (query.rt) filter.rt = query.rt;
    } else if (role === 'warga') {
      const activeNik = currentUser.active_nik || currentUser.username;
      const warga = await wargaRepository.findByNik(activeNik);
      if (warga) {
        return await bansosRepository.findByNoKK(warga.no_kk);
      }
      return await bansosRepository.findByNik(activeNik);
    } else {
      // Kelurahan / Superadmin
      if (query.rw) filter.rw = query.rw;
      if (query.rt) filter.rt = query.rt;
    }

    return await bansosRepository.list(filter);
  }

  /**
   * Verifikasi dan Pengesahan Usulan Bansos Berjenjang
   */
  async verifyBansos(id, currentUser, action, catatan = '', nominal = null) {
    const bansos = await bansosRepository.findById(id);
    if (!bansos) {
      const err = new Error('Data pengajuan bansos tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const { role } = currentUser;

    if (action === 'REJECT') {
      await bansosRepository.updateStatus(id, {
        status: 'REJECTED',
        approval_step: 'COMPLETED',
        catatan_verifikasi: `Ditolak oleh ${currentUser.nama} (${currentUser.role}): ${catatan || 'Kriteria belum memenuhi syarat'}`
      });

      await notifikasiRepository.create({
        nik_target: bansos.nik_penerima,
        judul: 'Status Usulan Bansos',
        pesan: `Usulan ${bansos.jenis_bansos} untuk keluarga Anda belum dapat disetujui. Catatan: ${catatan || 'Kuota terpenuhi atau kriteria belum sesuai'}`,
        tipe: 'error',
        link: '/dashboard/bansos'
      });

      return { success: true, status: 'REJECTED', message: 'Usulan bansos berhasil ditolak.' };
    }

    // ACTION: APPROVE
    if (role === 'ketua_rw' || role === 'admin_rw') {
      await bansosRepository.updateStatus(id, {
        status: 'PENDING_KELURAHAN',
        approval_step: 'KELURAHAN',
        diverifikasi_oleh_user_id: currentUser.id,
        catatan_verifikasi: catatan || 'Diverifikasi & disetujui tingkat RW. Diteruskan ke Kelurahan.'
      });

      return { success: true, status: 'PENDING_KELURAHAN', message: 'Usulan bansos diverifikasi RW dan diteruskan ke Kelurahan.' };
    }

    if (['admin_kelurahan', 'superadmin', 'admin'].includes(role)) {
      await bansosRepository.updateStatus(id, {
        status: 'APPROVED',
        approval_step: 'COMPLETED',
        disahkan_oleh_user_id: currentUser.id,
        nominal_bantuan: nominal !== null ? parseFloat(nominal) : bansos.nominal_bantuan,
        catatan_verifikasi: catatan || 'Disahkan oleh Kantor Kelurahan Kebonjati. Bantuan siap disalurkan.'
      });

      // Notifikasi kelulusan bansos ke warga
      await notifikasiRepository.create({
        nik_target: bansos.nik_penerima,
        judul: 'Penerima Manfaat Bansos Ditetapkan',
        pesan: `Selamat! Keluarga Anda telah RESMI DITETAPKAN sebagai penerima bantuan ${bansos.jenis_bansos} Kelurahan Kebonjati. Silakan pantau informasi jadwal pencairan/distribusi di Balai Warga.`,
        tipe: 'success',
        link: '/dashboard/bansos'
      });

      return { success: true, status: 'APPROVED', message: 'Usulan bansos resmi disahkan oleh Kelurahan Kebonjati.' };
    }

    throw new Error('Peran Anda tidak memiliki kewenangan verifikasi bansos ini.');
  }

  /**
   * Rekam serah-terima bantuan sosial di lapangan (Point of Disbursement)
   * Menyimpan foto serah terima GPS geotagged, koordinat, dan tanda tangan digital
   */
  async disburseBansos(id, disburseData, currentUser) {
    const allowedRoles = ['superadmin', 'admin_kelurahan', 'admin', 'ketua_rw', 'admin_rw', 'ketua_rt'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Anda tidak memiliki wewenang untuk menyalurkan bantuan sosial.');
      err.status = 403;
      throw err;
    }

    const bansos = await bansosRepository.findById(id);
    if (!bansos) {
      const err = new Error('Data usulan bantuan sosial tidak ditemukan.');
      err.status = 404;
      throw err;
    }

    if (bansos.status !== 'APPROVED') {
      const err = new Error('Hanya bantuan sosial dengan status APPROVED (Disahkan Kelurahan) yang dapat diserah-terimakan.');
      err.status = 400;
      throw err;
    }

    const updated = await bansosRepository.disburse(id, disburseData, currentUser.id);

    // Notifikasi ke warga
    try {
      await notifikasiRepository.create({
        nik_target: bansos.nik_penerima,
        judul: 'Bantuan Sosial Telah Diterima',
        pesan: `Serah terima bantuan ${bansos.jenis_bansos} untuk keluarga Anda telah berhasil dicatat oleh petugas pada ${new Date().toLocaleString('id-ID')}. Terima kasih atas konfirmasi tanda tangan Anda.`,
        tipe: 'success',
        link: '/dashboard/bansos'
      });
    } catch (e) {
      console.warn('Notifikasi gagal terkirim:', e.message);
    }

    return { success: true, message: 'Bantuan sosial berhasil diserahterimakan di lapangan.', data: updated };
  }

  /**
   * Ambil statistik bansos
   */
  async getBansosStats(currentUser, query = {}) {
    const { role, rt, rw } = currentUser;
    const filter = {};

    if (role === 'ketua_rt') {
      filter.rt = rt;
      filter.rw = rw;
    } else if (role === 'ketua_rw' || role === 'admin_rw') {
      filter.rw = rw;
      if (query.rt) filter.rt = query.rt;
    } else {
      if (query.rw) filter.rw = query.rw;
      if (query.rt) filter.rt = query.rt;
    }

    return await bansosRepository.getStats(filter);
  }
}

module.exports = new BansosService();

