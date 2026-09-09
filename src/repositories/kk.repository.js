/**
 * src/repositories/kk.repository.js
 * Data Access Layer for Kartu Keluarga & Anggota Keluarga
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class KkRepository {
  /**
   * Cari data KK berdasarkan No KK
   * @param {string} noKk
   * @returns {Promise<Object|null>}
   */
  async findByNoKk(noKk) {
    const [rows] = await pool.execute(
      'SELECT * FROM kartu_keluarga WHERE no_kk = ? LIMIT 1',
      [noKk]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Cari data KK lengkap beserta seluruh anggota keluarganya
   * @param {string} noKk
   * @returns {Promise<Object|null>}
   */
  async findWithMembersByNoKk(noKk) {
    const [kkRows] = await pool.execute(
      'SELECT * FROM kartu_keluarga WHERE no_kk = ? LIMIT 1',
      [noKk]
    );
    if (kkRows.length === 0) return null;
    const kk = kkRows[0];

    const [members] = await pool.execute(
      `SELECT id, nik, no_kk, nama, jenis_kelamin, tempat_lahir, tanggal_lahir,
              agama, status_perkawinan, status_hubungan_keluarga, pekerjaan,
              pendidikan_terakhir, golongan_darah, rt, rw, alamat, status_kependudukan, no_telepon
       FROM warga
       WHERE no_kk = ? AND status_kependudukan != 'Meninggal'
       ORDER BY
         CASE status_hubungan_keluarga
           WHEN 'Kepala Keluarga' THEN 1
           WHEN 'Suami' THEN 2
           WHEN 'Istri' THEN 3
           WHEN 'Anak' THEN 4
           ELSE 5
         END,
         tanggal_lahir ASC`,
      [noKk]
    );
    kk.anggota = members;
    return kk;
  }
}

module.exports = new KkRepository();
