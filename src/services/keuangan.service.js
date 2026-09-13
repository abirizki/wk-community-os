/**
 * src/services/keuangan.service.js
 * Business Logic Layer for Pembukuan Kas & Iuran Warga RT/RW.
 * Bumi Warga - Jabar Pintar Digital
 */

const keuanganRepository = require('../repositories/keuangan.repository');
const kkRepository = require('../repositories/kk.repository');
const wargaRepository = require('../repositories/warga.repository');

class KeuanganService {
  /**
   * Catat transaksi kas masuk / keluar
   */
  async catatTransaksi(payload, currentUser) {
    const allowedRoles = ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya pengurus RT, RW, atau Kelurahan yang berwenang mencatat transaksi kas.');
      err.status = 403;
      throw err;
    }

    const {
      tipe,
      kategori,
      nominal,
      keterangan,
      tanggal_transaksi,
      bukti_foto_url,
      rt = currentUser.rt || '001',
      rw = currentUser.rw || '001'
    } = payload;

    if (!tipe || !['MASUK', 'KELUAR'].includes(tipe)) {
      const err = new Error('Tipe transaksi harus bernilai MASUK atau KELUAR');
      err.status = 400;
      throw err;
    }

    if (!nominal || isNaN(nominal) || parseFloat(nominal) <= 0) {
      const err = new Error('Nominal transaksi kas harus lebih dari 0');
      err.status = 400;
      throw err;
    }

    if (!keterangan || keterangan.trim().length < 3) {
      const err = new Error('Keterangan peruntukan kas wajib diisi');
      err.status = 400;
      throw err;
    }

    const tingkat_wilayah = currentUser.role.includes('rw') ? 'RW' : (currentUser.role.includes('kelurahan') ? 'KELURAHAN' : 'RT');
    const dateFormatted = (tanggal_transaksi || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomor_transaksi = `KAS-${tingkat_wilayah}${rt}-${dateFormatted}-${randomSuffix}`;

    const transaksi = await keuanganRepository.createTransaksi({
      nomor_transaksi,
      tipe,
      kategori: kategori || (tipe === 'MASUK' ? 'Kas Sukarela / Donasi' : 'Operasional Lingkungan'),
      nominal: parseFloat(nominal),
      keterangan,
      tanggal_transaksi: tanggal_transaksi || new Date().toISOString().slice(0, 10),
      bukti_foto_url: bukti_foto_url || null,
      tingkat_wilayah,
      rt,
      rw,
      dicatat_oleh_user_id: currentUser.id
    });

    return {
      success: true,
      message: `Transaksi kas ${tipe} berhasil dibukukan: Rp ${parseFloat(nominal).toLocaleString('id-ID')}`,
      data: transaksi
    };
  }

  /**
   * Ambil riwayat transaksi kas berdasar otorisasi wilayah
   */
  async getTransaksiList(filters = {}, currentUser) {
    const scopedFilters = { ...filters };

    // Batasi cakupan data berdasar role
    if (currentUser.role === 'ketua_rt') {
      scopedFilters.rt = currentUser.rt;
      scopedFilters.rw = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      scopedFilters.rw = currentUser.rw;
    } else if (currentUser.role === 'warga') {
      // Warga melihat transparansi kas RT domisilinya
      const warga = await wargaRepository.findByNik(currentUser.username);
      scopedFilters.rt = warga?.rt || currentUser.rt || '001';
      scopedFilters.rw = warga?.rw || currentUser.rw || '001';
    }

    return keuanganRepository.getTransaksiList(scopedFilters);
  }

  /**
   * Ambil ringkasan saldo kas & breakdown
   */
  async getKasSummary(currentUser) {
    const filters = {};

    if (currentUser.role === 'ketua_rt') {
      filters.rt = currentUser.rt;
      filters.rw = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      filters.rw = currentUser.rw;
    } else if (currentUser.role === 'warga') {
      const warga = await wargaRepository.findByNik(currentUser.username);
      filters.rt = warga?.rt || currentUser.rt || '001';
      filters.rw = warga?.rw || currentUser.rw || '001';
    }

    const summary = await keuanganRepository.getKasSummary(filters);
    return {
      success: true,
      data: {
        ...summary,
        wilayah_info: {
          rt: filters.rt || 'Semua RT',
          rw: filters.rw || 'Semua RW',
          kelurahan: 'Kelurahan Kebonjati'
        }
      }
    };
  }

  /**
   * Ambil daftar iuran warga (Matriks per KK)
   */
  async getIuranList(filters = {}, currentUser) {
    const scopedFilters = { ...filters };

    if (currentUser.role === 'ketua_rt') {
      scopedFilters.rt = currentUser.rt;
      scopedFilters.rw = currentUser.rw;
    } else if (currentUser.role === 'ketua_rw' || currentUser.role === 'admin_rw') {
      scopedFilters.rw = currentUser.rw;
    } else if (currentUser.role === 'warga') {
      // Warga hanya melihat iuran KK sendiri
      const warga = await wargaRepository.findByNik(currentUser.username);
      scopedFilters.no_kk = warga?.no_kk || currentUser.username;
    }

    // Default periode bulan ini jika tidak dispesifikasikan
    if (!scopedFilters.periode_bulan && !scopedFilters.no_kk) {
      const now = new Date();
      scopedFilters.periode_bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    const list = await keuanganRepository.getIuranList(scopedFilters);
    return list;
  }

  /**
   * Bayar Iuran Warga & otomatis tambahkan ke kas masuk
   */
  async bayarIuran(iuranId, payload, currentUser) {
    const allowedRoles = ['ketua_rt', 'ketua_rw', 'admin_rw', 'admin_kelurahan', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya pengurus RT/RW yang berhak mengesahkan pembayaran iuran warga.');
      err.status = 403;
      throw err;
    }

    const { metode_bayar = 'TUNAI_RT', bukti_bayar_url = null } = payload;

    const updated = await keuanganRepository.payIuran(iuranId, {
      metode_bayar,
      bukti_bayar_url,
      diterima_oleh_user_id: currentUser.id
    });

    if (!updated) {
      const err = new Error('Data tagihan iuran warga tidak ditemukan');
      err.status = 404;
      throw err;
    }

    // Otomatis bukukan ke kas masuk RT
    try {
      const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      await keuanganRepository.createTransaksi({
        nomor_transaksi: `KAS-IURAN-${updated.rt}-${dateFormatted}-${updated.id}`,
        tipe: 'MASUK',
        kategori: 'Iuran Bulanan Warga',
        nominal: parseFloat(updated.nominal_tagihan || 25000),
        keterangan: `Pembayaran Iuran Periode ${updated.periode_bulan} - KK a.n ${updated.nama_kepala_keluarga}`,
        tanggal_transaksi: new Date().toISOString().slice(0, 10),
        bukti_foto_url: bukti_bayar_url,
        tingkat_wilayah: 'RT',
        rt: updated.rt,
        rw: updated.rw,
        dicatat_oleh_user_id: currentUser.id
      });
    } catch (e) {
      console.warn('Auto-record iuran to kas note:', e.message);
    }

    return {
      success: true,
      message: `Iuran KK ${updated.nama_kepala_keluarga} periode ${updated.periode_bulan} berhasil disahkan LUNAS.`,
      data: updated
    };
  }

  /**
   * Generate Tagihan Iuran Bulanan untuk Seluruh KK di RT
   */
  async generateTagihanBulanan(payload, currentUser) {
    const allowedRoles = ['ketua_rt', 'ketua_rw', 'admin_kelurahan', 'superadmin', 'admin'];
    if (!allowedRoles.includes(currentUser.role)) {
      const err = new Error('Hanya pengurus lingkungan yang berwenang men-generate tagihan iuran bulanan.');
      err.status = 403;
      throw err;
    }

    const {
      periode_bulan,
      rt = currentUser.rt || '001',
      rw = currentUser.rw || '001',
      nominal = 25000
    } = payload;

    if (!periode_bulan || !/^\d{4}-\d{2}$/.test(periode_bulan)) {
      const err = new Error('Format periode_bulan harus YYYY-MM (contoh: 2026-09)');
      err.status = 400;
      throw err;
    }

    const count = await keuanganRepository.generateMonthlyBills(periode_bulan, rt, rw, parseFloat(nominal));
    return {
      success: true,
      message: `Berhasil men-generate tagihan iuran periode ${periode_bulan} untuk ${count} Kepala Keluarga di RT ${rt} / RW ${rw}.`,
      count
    };
  }

  /**
   * Ambil data format kuitansi resmi dinas kas RT/RW
   */
  async getKuitansiTransaksi(id, currentUser) {
    const tx = await keuanganRepository.getTransaksiById(id);
    if (!tx) {
      const err = new Error('Transaksi kas tidak ditemukan');
      err.status = 404;
      throw err;
    }

    const dateFormatted = new Date(tx.tanggal_transaksi);
    const dateStr = dateFormatted.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    return {
      nomor_kuitansi: `KW-${tx.nomor_transaksi}`,
      kop: {
        instansi: 'RUKUN TETANGGA / RUKUN WARGA',
        wilayah: `RT ${tx.rt} / RW ${tx.rw} &bull; KELURAHAN KEBONJATI`,
        kota: 'Kota Sukabumi, Jawa Barat',
        portal: 'bumiwarga.online'
      },
      transaksi: tx,
      tanggal_resmi: dateStr,
      spbe_code: `SPBE-KAS-${tx.id}-${Date.now().toString(36).toUpperCase()}`
    };
  }
}

module.exports = new KeuanganService();

