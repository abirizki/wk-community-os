/**
 * src/repositories/posyandu.repository.js
 * Data Access Layer for Posyandu.
 */

const pool = require('../db/pool');

class PosyanduRepository {
  /**
   * Insert rekam medis balita baru
   * @param {Object} payload 
   * @returns {Promise<Object>} Insert result
   */
  async create(payload) {
    const { 
      nik_warga, 
      nama_anak, 
      umur_bulan, 
      berat_badan_kg, 
      tinggi_badan_cm, 
      tanggal_pemeriksaan, 
      catatan_kesehatan 
    } = payload;

    const [result] = await pool.execute(
      `INSERT INTO posyandu 
      (nik_warga, nama_anak, umur_bulan, berat_badan_kg, tinggi_badan_cm, tanggal_pemeriksaan, catatan_kesehatan) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nik_warga, nama_anak, umur_bulan, berat_badan_kg, tinggi_badan_cm, tanggal_pemeriksaan, catatan_kesehatan || null]
    );

    return result;
  }

  /**
   * Ambil histori posyandu berdasarkan NIK ortu/wali
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      'SELECT * FROM posyandu WHERE nik_warga = ? ORDER BY tanggal_pemeriksaan DESC',
      [nik]
    );
    return rows;
  }
}

module.exports = new PosyanduRepository();

