/**
 * src/services/keuangan.service.js
 * Business Logic Layer for Pembukuan Kas & Iuran Warga RT/RW.
 * Bumi Warga - Jabar Pintar Digital
 */

const keuanganRepository = require('../repositories/keuangan.repository');
const kkRepository = require('../repositories/kk.repository');
const wargaRepository = require('../repositories/warga.repository');
const { generateCsv, generateExcelXml, maskPii } = require('../utils/export.util');

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

  /**
   * Ekspor Buku Kas Umum (BKU) ke format XLSX / CSV
   */
  async exportKas(filters = {}, currentUser, format = 'xlsx') {
    const list = await this.getTransaksiList(filters, currentUser);
    const rt = filters.rt || currentUser.rt || '001';
    const rw = filters.rw || currentUser.rw || '001';

    const headers = [
      'No',
      'Tanggal Transaksi',
      'Nomor Transaksi',
      'Tipe',
      'Kategori',
      'Keterangan Peruntukan',
      'Kas Masuk (Rp)',
      'Kas Keluar (Rp)',
      'Wilayah',
      'Petugas Pencatat'
    ];

    let totalMasuk = 0;
    let totalKeluar = 0;

    const rows = list.map((tx, idx) => {
      const masuk = tx.tipe === 'MASUK' ? Number(tx.nominal) : 0;
      const keluar = tx.tipe === 'KELUAR' ? Number(tx.nominal) : 0;
      totalMasuk += masuk;
      totalKeluar += keluar;

      return [
        idx + 1,
        tx.tanggal_transaksi ? new Date(tx.tanggal_transaksi).toISOString().slice(0, 10) : '-',
        tx.nomor_transaksi || '-',
        tx.tipe,
        tx.kategori || '-',
        tx.keterangan || '-',
        { value: masuk, type: 'Currency' },
        { value: keluar, type: 'Currency' },
        `RT ${tx.rt || '-'}/RW ${tx.rw || '-'}`,
        tx.nama_pencatat || 'Sistem'
      ];
    });

    const totalRow = [
      '',
      '',
      '',
      '',
      'TOTAL MUTASI',
      `Saldo Bersih: Rp ${(totalMasuk - totalKeluar).toLocaleString('id-ID')}`,
      { value: totalMasuk, type: 'Currency' },
      { value: totalKeluar, type: 'Currency' },
      '',
      ''
    ];

    if (format === 'csv') {
      const csvRows = [
        ...list.map((tx, idx) => [
          idx + 1,
          tx.tanggal_transaksi ? new Date(tx.tanggal_transaksi).toISOString().slice(0, 10) : '-',
          tx.nomor_transaksi || '-',
          tx.tipe,
          tx.kategori || '-',
          tx.keterangan || '-',
          tx.tipe === 'MASUK' ? Number(tx.nominal) : 0,
          tx.tipe === 'KELUAR' ? Number(tx.nominal) : 0,
          `RT ${tx.rt || '-'}/RW ${tx.rw || '-'}`,
          tx.nama_pencatat || 'Sistem'
        ]),
        ['', '', '', '', 'TOTAL', `Saldo Bersih: ${totalMasuk - totalKeluar}`, totalMasuk, totalKeluar, '', '']
      ];
      return {
        filename: `Buku_Kas_RT${rt}_RW${rw}_${Date.now()}.csv`,
        mimeType: 'text/csv; charset=utf-8',
        content: generateCsv(headers, csvRows)
      };
    }

    const xml = generateExcelXml(`Buku Kas RT ${rt} RW ${rw}`, [
      {
        name: `Buku Kas RT${rt}-RW${rw}`,
        headers,
        rows: [...rows, totalRow]
      }
    ]);

    return {
      filename: `Buku_Kas_RT${rt}_RW${rw}_${Date.now()}.xls`,
      mimeType: 'application/vnd.ms-excel',
      content: xml
    };
  }

  /**
   * Ekspor Rekonsiliasi Iuran Warga per KK ke format XLSX / CSV
   */
  async exportIuran(filters = {}, currentUser, format = 'xlsx') {
    const list = await this.getIuranList(filters, currentUser);
    const rt = filters.rt || currentUser.rt || '001';
    const rw = filters.rw || currentUser.rw || '001';

    const headers = [
      'No',
      'No. Kartu Keluarga',
      'Nama Kepala Keluarga',
      'Wilayah RT/RW',
      'Periode Bulan',
      'Tarif Iuran (Rp)',
      'Status Pembayaran',
      'Tanggal Pembayaran',
      'Metode Bayar',
      'Nomor Kuitansi'
    ];

    const isAuthorized = ['superadmin', 'admin', 'admin_kelurahan', 'ketua_rw', 'admin_rw', 'ketua_rt'].includes(currentUser.role);

    const rows = list.map((item, idx) => {
      const maskedKK = isAuthorized ? item.no_kk : maskPii(item.no_kk);
      return [
        idx + 1,
        maskedKK || '-',
        item.nama_kepala_keluarga || '-',
        `RT ${item.rt || '-'}/RW ${item.rw || '-'}`,
        item.periode_bulan || '-',
        { value: Number(item.nominal) || 0, type: 'Currency' },
        item.status === 'LUNAS' ? 'LUNAS' : 'BELUM BAYAR',
        item.tanggal_bayar ? new Date(item.tanggal_bayar).toISOString().slice(0, 10) : '-',
        item.metode_bayar || '-',
        item.nomor_kuitansi || '-'
      ];
    });

    if (format === 'csv') {
      const csvRows = list.map((item, idx) => [
        idx + 1,
        (isAuthorized ? item.no_kk : maskPii(item.no_kk)) || '-',
        item.nama_kepala_keluarga || '-',
        `RT ${item.rt || '-'}/RW ${item.rw || '-'}`,
        item.periode_bulan || '-',
        Number(item.nominal) || 0,
        item.status === 'LUNAS' ? 'LUNAS' : 'BELUM BAYAR',
        item.tanggal_bayar ? new Date(item.tanggal_bayar).toISOString().slice(0, 10) : '-',
        item.metode_bayar || '-',
        item.nomor_kuitansi || '-'
      ]);
      return {
        filename: `Rekap_Iuran_RT${rt}_RW${rw}_${Date.now()}.csv`,
        mimeType: 'text/csv; charset=utf-8',
        content: generateCsv(headers, csvRows)
      };
    }

    const xml = generateExcelXml(`Rekap Iuran RT ${rt} RW ${rw}`, [
      {
        name: `Rekap Iuran RT${rt}-RW${rw}`,
        headers,
        rows
      }
    ]);

    return {
      filename: `Rekap_Iuran_RT${rt}_RW${rw}_${Date.now()}.xls`,
      mimeType: 'application/vnd.ms-excel',
      content: xml
    };
  }
}

module.exports = new KeuanganService();

