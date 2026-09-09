/**
 * src/repositories/warga.repository.js
 * Data Access Layer for Warga table.
 * Data Access Layer for Warga & Kartu Keluarga.
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class WargaRepository {
  /**
   * Cari data warga berdasarkan NIK
   * @param {string} nik 
   * @returns {Promise<Object|null>}
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      'SELECT * FROM warga WHERE nik = ? LIMIT 1',
      [nik]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Ambil daftar warga dengan pagination
   * @param {Object} options
   * @param {number} options.limit
   * @param {number} options.offset
   * @returns {Promise<Array>}
   * Cek keberadaan Kartu Keluarga
   */
  async list({ limit = 20, offset = 0 } = {}) {
  async findKartuKeluargaByNoKK(no_kk) {
    const [rows] = await pool.execute(
      'SELECT * FROM warga ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit.toString(), offset.toString()] // using string to ensure correct parameterized substitution
      'SELECT * FROM kartu_keluarga WHERE no_kk = ? LIMIT 1',
      [no_kk]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Upsert data Kartu Keluarga
   */
  async upsertKartuKeluarga(data) {
    const {
      no_kk,
      kepala_keluarga,
      alamat = 'Jl. Kebonjati No. 1',
      rt,
      rw,
      kelurahan = 'Kebonjati',
      kecamatan = 'Andir',
      kota = 'Bandung',
      provinsi = 'Jawa Barat',
      kode_pos = '40181'
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO kartu_keluarga 
       (no_kk, kepala_keluarga, alamat, rt, rw, kelurahan, kecamatan, kota, provinsi, kode_pos)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         kepala_keluarga = IF(VALUES(kepala_keluarga) != '' AND VALUES(kepala_keluarga) IS NOT NULL, VALUES(kepala_keluarga), kepala_keluarga),
         alamat = VALUES(alamat),
         rt = VALUES(rt),
         rw = VALUES(rw)`,
      [no_kk, kepala_keluarga, alamat, rt, rw, kelurahan, kecamatan, kota, provinsi, kode_pos]
    );

    return result;
  }

  /**
   * Tambah record warga baru
   */
  async create(data) {
    const {
      user_id = null,
      nik,
      no_kk,
      nama,
      jenis_kelamin = 'L',
      tempat_lahir = 'Bandung',
      tanggal_lahir,
      agama = 'Islam',
      status_perkawinan = 'Belum Kawin',
      status_hubungan_keluarga = 'Anak',
      pekerjaan = 'Belum Bekerja',
      pendidikan_terakhir = 'SMA/SMK',
      golongan_darah = 'Tidak Tahu',
      alamat = 'Jl. Kebonjati',
      rt,
      rw,
      kelurahan = 'Kebonjati',
      kecamatan = 'Andir',
      kota = 'Bandung',
      provinsi = 'Jawa Barat',
      kode_pos = '40181',
      no_telepon = null,
      email = null,
      status_kependudukan = 'Tetap'
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO warga 
       (user_id, nik, no_kk, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, agama, 
        status_perkawinan, status_hubungan_keluarga, pekerjaan, pendidikan_terakhir, 
        golongan_darah, alamat, rt, rw, kelurahan, kecamatan, kota, provinsi, kode_pos, 
        no_telepon, email, status_kependudukan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        nama = VALUES(nama),
        status_hubungan_keluarga = VALUES(status_hubungan_keluarga),
        pekerjaan = VALUES(pekerjaan),
        pendidikan_terakhir = VALUES(pendidikan_terakhir),
        no_telepon = VALUES(no_telepon)`,
      [
        user_id, nik, no_kk, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, agama,
        status_perkawinan, status_hubungan_keluarga, pekerjaan, pendidikan_terakhir,
        golongan_darah, alamat, rt, rw, kelurahan, kecamatan, kota, provinsi, kode_pos,
        no_telepon, email, status_kependudukan
      ]
    );

    return result;
  }

  /**
   * Ambil daftar warga terfilter dan scoped
   */
  async list({ rt, rw, search, limit = 20, offset = 0 } = {}) {
    let query = 'SELECT * FROM warga WHERE 1=1';
    const params = [];

    if (rw) {
      query += ' AND rw = ?';
      params.push(rw);
    }
    if (rt) {
      query += ' AND rt = ?';
      params.push(rt);
    }
    if (search) {
      query += ' AND (nama LIKE ? OR nik LIKE ? OR no_kk LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(String(limit), String(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Hitung jumlah total warga terfilter
   */
  async count({ rt, rw, search } = {}) {
    let query = 'SELECT COUNT(*) AS total FROM warga WHERE 1=1';
    const params = [];

    if (rw) {
      query += ' AND rw = ?';
      params.push(rw);
    }
    if (rt) {
      query += ' AND rt = ?';
      params.push(rt);
    }
    if (search) {
      query += ' AND (nama LIKE ? OR nik LIKE ? OR no_kk LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0] ? rows[0].total : 0;
  }
}

module.exports = new WargaRepository();

