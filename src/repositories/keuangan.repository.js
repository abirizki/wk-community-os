/**
 * src/repositories/keuangan.repository.js
 * Data Access Layer for Pembukuan Kas Lingkungan & Iuran Warga RT/RW.
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class KeuanganRepository {
  /**
   * Catat transaksi kas masuk atau kas keluar
   */
  async createTransaksi(payload) {
    const {
      nomor_transaksi,
      tipe,
      kategori,
      nominal,
      keterangan,
      tanggal_transaksi,
      bukti_foto_url = null,
      tingkat_wilayah = 'RT',
      rt,
      rw,
      dicatat_oleh_user_id
    } = payload;

    const noTx = nomor_transaksi || `KAS-${rt || '001'}-${Date.now().toString(36).toUpperCase()}`;

    const [result] = await pool.execute(
      `INSERT INTO keuangan_kas 
       (nomor_transaksi, tipe, kategori, nominal, keterangan, tanggal_transaksi, bukti_foto_url, tingkat_wilayah, rt, rw, dicatat_oleh_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        noTx,
        tipe,
        kategori,
        nominal,
        keterangan,
        tanggal_transaksi || new Date().toISOString().slice(0, 10),
        bukti_foto_url,
        tingkat_wilayah,
        rt,
        rw,
        dicatat_oleh_user_id
      ]
    );

    return this.getTransaksiById(result.insertId);
  }

  /**
   * Ambil transaksi kas by ID
   */
  async getTransaksiById(id) {
    const [rows] = await pool.execute(
      `SELECT k.*, u.nama AS nama_pencatat, u.role AS role_pencatat
       FROM keuangan_kas k
       LEFT JOIN users u ON k.dicatat_oleh_user_id = u.id
       WHERE k.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Ambil daftar riwayat kas dengan filter wilayah dan kategori
   */
  async getTransaksiList(filters = {}) {
    let query = `
      SELECT k.*, u.nama AS nama_pencatat, u.role AS role_pencatat
      FROM keuangan_kas k
      LEFT JOIN users u ON k.dicatat_oleh_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.rt) {
      query += ' AND k.rt = ?';
      params.push(filters.rt);
    }
    if (filters.rw) {
      query += ' AND k.rw = ?';
      params.push(filters.rw);
    }
    if (filters.tipe) {
      query += ' AND k.tipe = ?';
      params.push(filters.tipe);
    }
    if (filters.kategori) {
      query += ' AND k.kategori = ?';
      params.push(filters.kategori);
    }
    if (filters.search) {
      query += ' AND (k.keterangan LIKE ? OR k.nomor_transaksi LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY k.tanggal_transaksi DESC, k.id DESC LIMIT 100';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Ringkasan Saldo dan Rekapitulasi Kas
   */
  async getKasSummary(filters = {}) {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (filters.rt) {
      whereClause += ' AND rt = ?';
      params.push(filters.rt);
    }
    if (filters.rw) {
      whereClause += ' AND rw = ?';
      params.push(filters.rw);
    }

    // 1. Total Masuk & Keluar
    const [totals] = await pool.execute(
      `SELECT 
         COALESCE(SUM(CASE WHEN tipe = 'MASUK' THEN nominal ELSE 0 END), 0) AS total_masuk,
         COALESCE(SUM(CASE WHEN tipe = 'KELUAR' THEN nominal ELSE 0 END), 0) AS total_keluar
       FROM keuangan_kas
       ${whereClause}`,
      params
    );

    const total_masuk = parseFloat(totals[0]?.total_masuk || 0);
    const total_keluar = parseFloat(totals[0]?.total_keluar || 0);
    const saldo_berjalan = total_masuk - total_keluar;

    // 2. Breakdown per Kategori
    const [breakdown] = await pool.execute(
      `SELECT tipe, kategori, SUM(nominal) as total_nominal, COUNT(*) as jumlah_transaksi
       FROM keuangan_kas
       ${whereClause}
       GROUP BY tipe, kategori
       ORDER BY total_nominal DESC`,
      params
    );

    return {
      total_masuk,
      total_keluar,
      saldo_berjalan,
      breakdown
    };
  }

  /**
   * Daftar Iuran Warga per KK
   */
  async getIuranList(filters = {}) {
    let query = `
      SELECT i.*, u.nama AS nama_penerima
      FROM keuangan_iuran_warga i
      LEFT JOIN users u ON i.diterima_oleh_user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.rt) {
      query += ' AND i.rt = ?';
      params.push(filters.rt);
    }
    if (filters.rw) {
      query += ' AND i.rw = ?';
      params.push(filters.rw);
    }
    if (filters.periode_bulan) {
      query += ' AND i.periode_bulan = ?';
      params.push(filters.periode_bulan);
    }
    if (filters.status_bayar) {
      query += ' AND i.status_bayar = ?';
      params.push(filters.status_bayar);
    }
    if (filters.no_kk) {
      query += ' AND i.no_kk = ?';
      params.push(filters.no_kk);
    }

    query += ' ORDER BY i.status_bayar ASC, i.nama_kepala_keluarga ASC';

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Bayar Iuran Warga (Tandai Lunas)
   */
  async payIuran(id, payload) {
    const {
      metode_bayar = 'TUNAI_RT',
      bukti_bayar_url = null,
      diterima_oleh_user_id
    } = payload;

    await pool.execute(
      `UPDATE keuangan_iuran_warga
       SET status_bayar = 'LUNAS',
           tanggal_bayar = NOW(),
           metode_bayar = ?,
           bukti_bayar_url = ?,
           diterima_oleh_user_id = ?
       WHERE id = ?`,
      [metode_bayar, bukti_bayar_url, diterima_oleh_user_id, id]
    );

    const [rows] = await pool.execute('SELECT * FROM keuangan_iuran_warga WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Inisialisasi Otomatis Iuran Bulanan untuk KK Terdaftar di RT/RW
   */
  async generateMonthlyBills(periodeBulan, rt, rw, nominal = 25000) {
    // Ambil seluruh KK unik di wilayah
    const [kkRows] = await pool.execute(
      `SELECT no_kk, nama_kepala_keluarga, rt, rw 
       FROM kartu_keluarga 
       WHERE rt = ? AND rw = ?`,
      [rt, rw]
    );

    let createdCount = 0;
    for (const kk of kkRows) {
      try {
        await pool.execute(
          `INSERT IGNORE INTO keuangan_iuran_warga 
           (no_kk, nama_kepala_keluarga, periode_bulan, nominal_tagihan, status_bayar, rt, rw)
           VALUES (?, ?, ?, ?, 'BELUM_BAYAR', ?, ?)`,
          [kk.no_kk, kk.nama_kepala_keluarga, periodeBulan, nominal, rt, rw]
        );
        createdCount++;
      } catch (e) {}
    }

    return createdCount;
  }
}

module.exports = new KeuanganRepository();

