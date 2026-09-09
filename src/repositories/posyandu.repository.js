/**
 * src/repositories/posyandu.repository.js
 * Data Access Layer for Posyandu.
 * Data Access Layer for Posyandu Balita & Posyandu Lansia.
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class PosyanduRepository {
  // ----------------------------------------------------
  // BALITA REPOSITORY
  // ----------------------------------------------------

  /**
   * Insert rekam medis balita baru
   * @param {Object} payload 
   * @returns {Promise<Object>} Insert result
   */
  async create(payload) {
    const { 
      nik_warga, 
      nama_anak, 
      tanggal_lahir_anak = null,
      jenis_kelamin_anak = 'L',
      umur_bulan, 
      berat_badan_kg, 
      tinggi_badan_cm, 
      tanggal_pemeriksaan, 
      catatan_kesehatan 
      lingkar_kepala_cm = null,
      status_gizi = 'Normal',
      imunisasi = null,
      tanggal_pemeriksaan = new Date(), 
      petugas = 'Kader Posyandu',
      catatan_kesehatan = null
    } = payload;

    const [result] = await pool.execute(
      `INSERT INTO posyandu 
      (nik_warga, nama_anak, umur_bulan, berat_badan_kg, tinggi_badan_cm, tanggal_pemeriksaan, catatan_kesehatan) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nik_warga, nama_anak, umur_bulan, berat_badan_kg, tinggi_badan_cm, tanggal_pemeriksaan, catatan_kesehatan || null]
      (nik_warga, nama_anak, tanggal_lahir_anak, jenis_kelamin_anak, umur_bulan, berat_badan_kg, tinggi_badan_cm, lingkar_kepala_cm, status_gizi, imunisasi, tanggal_pemeriksaan, petugas, catatan_kesehatan) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nik_warga, 
        nama_anak, 
        tanggal_lahir_anak, 
        jenis_kelamin_anak, 
        umur_bulan, 
        berat_badan_kg, 
        tinggi_badan_cm, 
        lingkar_kepala_cm, 
        status_gizi, 
        imunisasi, 
        tanggal_pemeriksaan, 
        petugas, 
        catatan_kesehatan
      ]
    );

    return result;
  }

  /**
   * Ambil histori posyandu berdasarkan NIK ortu/wali
   * @param {string} nik 
   * @returns {Promise<Array>}
   * Ambil histori balita berdasarkan NIK ortu/wali
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      'SELECT * FROM posyandu WHERE nik_warga = ? ORDER BY tanggal_pemeriksaan DESC',
      `SELECT p.*, w.nama AS nama_ortu, w.rt, w.rw, w.alamat
       FROM posyandu p
       LEFT JOIN warga w ON p.nik_warga = w.nik
       WHERE p.nik_warga = ? 
       ORDER BY p.tanggal_pemeriksaan DESC, p.id DESC`,
      [nik]
    );
    return rows;
  }

  /**
   * Ambil daftar pemeriksaan balita (scoped RT/RW)
   */
  async listBalita({ rt, rw, search, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT p.*, w.nama AS nama_ortu, w.rt, w.rw, w.alamat
      FROM posyandu p
      LEFT JOIN warga w ON p.nik_warga = w.nik
      WHERE 1=1
    `;
    const params = [];

    if (rw) {
      query += ' AND w.rw = ?';
      params.push(rw);
    }
    if (rt) {
      query += ' AND w.rt = ?';
      params.push(rt);
    }
    if (search) {
      query += ' AND (p.nama_anak LIKE ? OR p.nik_warga LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.tanggal_pemeriksaan DESC, p.id DESC LIMIT ? OFFSET ?';
    params.push(String(limit), String(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Statistik ringkasan balita
   */
  async getBalitaStats({ rt, rw } = {}) {
    let query = `
      SELECT 
        COUNT(*) AS total_pemeriksaan,
        COUNT(DISTINCT p.nama_anak, p.nik_warga) AS total_balita,
        SUM(CASE WHEN p.status_gizi IN ('Normal', 'Gizi Baik') THEN 1 ELSE 0 END) AS gizi_baik,
        SUM(CASE WHEN p.status_gizi IN ('Gizi Kurang', 'Gizi Buruk') THEN 1 ELSE 0 END) AS berisiko_stunting,
        SUM(CASE WHEN p.status_gizi IN ('Risiko Lebih', 'Gizi Lebih', 'Obesitas') THEN 1 ELSE 0 END) AS gizi_lebih
      FROM posyandu p
      LEFT JOIN warga w ON p.nik_warga = w.nik
      WHERE 1=1
    `;
    const params = [];

    if (rw) {
      query += ' AND w.rw = ?';
      params.push(rw);
    }
    if (rt) {
      query += ' AND w.rt = ?';
      params.push(rt);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0] || { total_pemeriksaan: 0, total_balita: 0, gizi_baik: 0, berisiko_stunting: 0, gizi_lebih: 0 };
  }

  // ----------------------------------------------------
  // LANSIA REPOSITORY
  // ----------------------------------------------------

  /**
   * Cari data lansia berdasarkan NIK
   */
  async findLansiaByNik(nik) {
    const [rows] = await pool.execute(
      'SELECT * FROM posyandu_lansia WHERE nik = ? LIMIT 1',
      [nik]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Pendaftaran lansia baru ke database Posyandu Lansia
   */
  async createLansia(payload) {
    const {
      nik,
      nama,
      tanggal_lahir,
      jenis_kelamin,
      alamat,
      rt,
      rw,
      status_tinggal = 'Bersama Keluarga',
      riwayat_penyakit = null
    } = payload;

    const [result] = await pool.execute(
      `INSERT INTO posyandu_lansia
       (nik, nama, tanggal_lahir, jenis_kelamin, alamat, rt, rw, status_tinggal, riwayat_penyakit)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nik, nama, tanggal_lahir, jenis_kelamin, alamat, rt, rw, status_tinggal, riwayat_penyakit]
    );

    return {
      id: result.insertId,
      ...payload
    };
  }

  /**
   * Daftar lansia dengan pemeriksaan terakhirnya (Scoped RT/RW)
   */
  async listLansia({ rt, rw, search, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT 
        pl.*,
        TIMESTAMPDIFF(YEAR, pl.tanggal_lahir, CURDATE()) AS usia,
        p.id AS pemeriksaan_id,
        p.tanggal_pemeriksaan,
        p.tensi_sistolik,
        p.tensi_diastolik,
        p.gula_darah_sewaktu,
        p.kolesterol,
        p.asam_urat,
        p.berat_badan_kg,
        p.tinggi_badan_cm,
        p.imt,
        p.skor_kemandirian_adl,
        p.keluhan,
        p.tindakan_petugas,
        p.petugas
      FROM posyandu_lansia pl
      LEFT JOIN (
        SELECT lp1.*
        FROM posyandu_lansia_pemeriksaan lp1
        INNER JOIN (
          SELECT posyandu_lansia_id, MAX(tanggal_pemeriksaan) AS max_tgl, MAX(id) AS max_id
          FROM posyandu_lansia_pemeriksaan
          GROUP BY posyandu_lansia_id
        ) lp2 ON lp1.posyandu_lansia_id = lp2.posyandu_lansia_id AND lp1.id = lp2.max_id
      ) p ON pl.id = p.posyandu_lansia_id
      WHERE 1=1
    `;
    const params = [];

    if (rw) {
      query += ' AND pl.rw = ?';
      params.push(rw);
    }
    if (rt) {
      query += ' AND pl.rt = ?';
      params.push(rt);
    }
    if (search) {
      query += ' AND (pl.nama LIKE ? OR pl.nik LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY pl.nama ASC LIMIT ? OFFSET ?';
    params.push(String(limit), String(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Catat rekam medis pemeriksaan lansia
   */
  async createPemeriksaanLansia(payload) {
    const {
      posyandu_lansia_id,
      tanggal_pemeriksaan = new Date(),
      tensi_sistolik,
      tensi_diastolik,
      gula_darah_sewaktu = null,
      kolesterol = null,
      asam_urat = null,
      berat_badan_kg,
      tinggi_badan_cm,
      imt = null,
      skor_kemandirian_adl = 'Mandiri',
      keluhan = null,
      tindakan_petugas = null,
      petugas = 'Kader Posyandu Lansia'
    } = payload;

    const [result] = await pool.execute(
      `INSERT INTO posyandu_lansia_pemeriksaan
       (posyandu_lansia_id, tanggal_pemeriksaan, tensi_sistolik, tensi_diastolik, gula_darah_sewaktu, kolesterol, asam_urat, berat_badan_kg, tinggi_badan_cm, imt, skor_kemandirian_adl, keluhan, tindakan_petugas, petugas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        posyandu_lansia_id,
        tanggal_pemeriksaan,
        tensi_sistolik,
        tensi_diastolik,
        gula_darah_sewaktu,
        kolesterol,
        asam_urat,
        berat_badan_kg,
        tinggi_badan_cm,
        imt,
        skor_kemandirian_adl,
        keluhan,
        tindakan_petugas,
        petugas
      ]
    );

    return {
      id: result.insertId,
      ...payload
    };
  }

  /**
   * Riwayat seluruh pemeriksaan untuk satu lansia
   */
  async getPemeriksaanHistoryByLansiaId(lansiaId) {
    const [rows] = await pool.execute(
      `SELECT * FROM posyandu_lansia_pemeriksaan
       WHERE posyandu_lansia_id = ?
       ORDER BY tanggal_pemeriksaan DESC, id DESC`,
      [lansiaId]
    );
    return rows;
  }

  /**
   * Ambil data lansia yang berada dalam satu Kartu Keluarga (untuk persona warga login)
   */
  async findLansiaByFamilyNik(nik) {
    const [rows] = await pool.execute(
      `SELECT 
        pl.*,
        TIMESTAMPDIFF(YEAR, pl.tanggal_lahir, CURDATE()) AS usia,
        p.id AS pemeriksaan_id,
        p.tanggal_pemeriksaan,
        p.tensi_sistolik,
        p.tensi_diastolik,
        p.gula_darah_sewaktu,
        p.kolesterol,
        p.asam_urat,
        p.berat_badan_kg,
        p.tinggi_badan_cm,
        p.imt,
        p.skor_kemandirian_adl,
        p.keluhan,
        p.tindakan_petugas,
        p.petugas
       FROM posyandu_lansia pl
       JOIN warga target ON pl.nik = target.nik
       JOIN warga current_w ON target.no_kk = current_w.no_kk
       LEFT JOIN (
        SELECT lp1.*
        FROM posyandu_lansia_pemeriksaan lp1
        INNER JOIN (
          SELECT posyandu_lansia_id, MAX(tanggal_pemeriksaan) AS max_tgl, MAX(id) AS max_id
          FROM posyandu_lansia_pemeriksaan
          GROUP BY posyandu_lansia_id
        ) lp2 ON lp1.posyandu_lansia_id = lp2.posyandu_lansia_id AND lp1.id = lp2.max_id
       ) p ON pl.id = p.posyandu_lansia_id
       WHERE current_w.nik = ?
       ORDER BY pl.tanggal_lahir ASC`,
      [nik]
    );
    return rows;
  }

  /**
   * Statistik agregasi kesehatan lansia
   */
  async getLansiaStats({ rt, rw } = {}) {
    let query = `
      SELECT 
        COUNT(DISTINCT pl.id) AS total_lansia,
        SUM(CASE WHEN p.tensi_sistolik >= 140 OR p.tensi_diastolik >= 90 THEN 1 ELSE 0 END) AS total_hipertensi,
        SUM(CASE WHEN p.gula_darah_sewaktu >= 200 THEN 1 ELSE 0 END) AS total_diabetes,
        SUM(CASE WHEN p.skor_kemandirian_adl != 'Mandiri' THEN 1 ELSE 0 END) AS total_ketergantungan
      FROM posyandu_lansia pl
      LEFT JOIN (
        SELECT lp1.*
        FROM posyandu_lansia_pemeriksaan lp1
        INNER JOIN (
          SELECT posyandu_lansia_id, MAX(tanggal_pemeriksaan) AS max_tgl, MAX(id) AS max_id
          FROM posyandu_lansia_pemeriksaan
          GROUP BY posyandu_lansia_id
        ) lp2 ON lp1.posyandu_lansia_id = lp2.posyandu_lansia_id AND lp1.id = lp2.max_id
      ) p ON pl.id = p.posyandu_lansia_id
      WHERE 1=1
    `;
    const params = [];

    if (rw) {
      query += ' AND pl.rw = ?';
      params.push(rw);
    }
    if (rt) {
      query += ' AND pl.rt = ?';
      params.push(rt);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0] || { total_lansia: 0, total_hipertensi: 0, total_diabetes: 0, total_ketergantungan: 0 };
  }
}

module.exports = new PosyanduRepository();

