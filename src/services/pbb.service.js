/**
 * src/services/pbb.service.js
 * Business Logic Layer for PBB (Pajak Bumi dan Bangunan)
 * Kelurahan Kebonjati, Kec. Cikole, Kota Sukabumi - Jabar Pintar Digital
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
   * Ambil monitoring daftar PBB terfilter sesuai hak akses wilayah
   * @param {Object} user 
   * @param {Object} query 
   * @returns {Promise<Object>}
   */
  async getMonitoringList(user, query = {}) {
    const scope = {};

    // Penentuan Scope Wilayah berdasarkan Role
    if (user.role === 'ketua_rt') {
      scope.rt = user.rt || '001';
      scope.rw = user.rw || '001';
    } else if (['ketua_rw', 'admin_rw'].includes(user.role)) {
      scope.rw = user.rw || '001';
      if (query.rt) scope.rt = query.rt;
    } else {
      // Kelurahan / Eksekutif / Admin
      if (query.rw) scope.rw = query.rw;
      if (query.rt) scope.rt = query.rt;
    }

    const filters = {
      ...scope,
      status: query.status || 'ALL',
      tahun: query.tahun || 2026,
      search: query.search || '',
      limit: parseInt(query.limit, 10) || 50,
      offset: parseInt(query.offset, 10) || 0
    };

    return await pbbRepository.listFiltered(filters);
  }

  /**
   * Mengambil statistik PBB wilayah untuk Dashboard Analitik & KPI
   * @param {Object} user 
   * @param {number} tahun 
   * @returns {Promise<Object>}
   */
  async getStats(user, tahun = 2026) {
    const scope = {};

    if (user.role === 'ketua_rt') {
      scope.rt = user.rt || '001';
      scope.rw = user.rw || '001';
    } else if (['ketua_rw', 'admin_rw'].includes(user.role)) {
      scope.rw = user.rw || '001';
    }

    return await pbbRepository.getStats(scope, tahun);
  }

  /**
   * Mengambil detail lengkap E-SPPT Digital
   * @param {string} nop 
   * @param {number} tahun 
   * @returns {Promise<Object>}
   */
  async getSpptDetail(nop, tahun) {
    if (!nop || !tahun) {
      const err = new Error('NOP dan Tahun wajib diisi');
      err.status = 400;
      throw err;
    }

    const tagihan = await pbbRepository.findByNopAndTahun(nop, tahun);
    if (!tagihan) {
      const err = new Error('Objek PBB tidak ditemukan');
      err.status = 404;
      throw err;
    }

    // Bangun payload e-SPPT resmi Bapenda
    const njopBumi = Number(tagihan.njop_bumi) || 0;
    const njopBangunan = Number(tagihan.njop_bangunan) || 0;
    const totalNjop = njopBumi + njopBangunan;
    const njoptkp = 12000000; // Standar NJOPTKP Rp 12.000.000
    const njopKenaPajak = Math.max(0, totalNjop - njoptkp);

    return {
      ...tagihan,
      sppt_format: {
        nomor_sppt: `SPPT-${tagihan.tahun}-${tagihan.nop.replace(/[^0-9]/g, '').slice(-8)}`,
        provinsi: 'JAWA BARAT',
        kota: tagihan.kota || 'KOTA SUKABUMI',
        kecamatan: tagihan.kecamatan || 'CIKOLE',
        kelurahan: tagihan.kelurahan || 'KEBONJATI',
        blok: tagihan.rw ? `RW ${tagihan.rw}` : '001',
        total_njop: totalNjop,
        njoptkp: njoptkp,
        njop_kena_pajak: njopKenaPajak,
        tarif_persen: '0.1%',
        pbb_terutang: Number(tagihan.nominal),
        denda_administrasi: Number(tagihan.denda) || 0,
        total_harus_dibayar: Number(tagihan.nominal) + (Number(tagihan.denda) || 0),
        status_validasi_qr: `https://bumiwarga.online/verify-pbb/${tagihan.nop}/${tagihan.tahun}`
      }
    };
  }

  /**
   * Pembayaran Tagihan PBB (Warga Mandiri / Petugas RT/RW)
   * @param {string} nop 
   * @param {number} tahun 
   * @param {Object} user 
   * @param {Object} paymentPayload 
   * @returns {Promise<Object>}
   */
  async bayarTagihan(nop, tahun, user, paymentPayload = {}) {
    if (!nop || !tahun) {
      const err = new Error('NOP dan Tahun wajib diisi');
      err.status = 400;
      throw err;
    }

    const tagihan = await pbbRepository.findByNopAndTahun(nop, tahun);
    if (!tagihan) {
      const err = new Error('Data tagihan PBB tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const isAparatur = ['superadmin', 'admin_kelurahan', 'admin', 'lurah', 'ketua_rw', 'ketua_rt'].includes(user.role);
    const isOwner = tagihan.nik_warga === user.username || tagihan.nik_warga === user.active_nik;

    if (!isOwner && !isAparatur) {
      const err = new Error('Anda tidak memiliki akses untuk memproses tagihan ini');
      err.status = 403;
      throw err;
    }

    if (tagihan.status_pembayaran === 'PAID') {
      const err = new Error('Tagihan ini sudah berstatus LUNAS');
      err.status = 400;
      throw err;
    }

    const paymentInfo = {
      metode_bayar: paymentPayload.metode_bayar || 'QRIS Dinamis',
      nomor_transaksi_bank: paymentPayload.nomor_transaksi_bank || `BJB-${Date.now()}`,
      bukti_bayar_url: paymentPayload.bukti_bayar_url || null
    };

    await pbbRepository.updateStatus(nop, tahun, 'PAID', paymentInfo);

    return {
      nop,
      tahun,
      status_pembayaran: 'PAID',
      metode_bayar: paymentInfo.metode_bayar,
      nomor_transaksi_bank: paymentInfo.nomor_transaksi_bank,
      message: 'Pembayaran PBB berhasil diverifikasi dan lunas'
    };
  }

  /**
   * Import Acuan DHKP dari Bapenda (Batch Upsert)
   * @param {Array} records 
   * @param {Object} user 
   * @returns {Promise<Object>}
   */
  async importDhkp(records, user) {
    if (!Array.isArray(records) || records.length === 0) {
      const err = new Error('Data rekonsiliasi DHKP tidak boleh kosong');
      err.status = 400;
      throw err;
    }

    const result = await pbbRepository.batchUpsertDhkp(records);
    return {
      message: `Berhasil memproses rekonsiliasi DHKP Bapenda. ${result.inserted} objek baru ditambahkan, ${result.updated} objek diperbarui.`,
      result
    };
  }
}

module.exports = new PbbService();
