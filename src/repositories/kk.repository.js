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

    let members = [];
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM warga WHERE no_kk = ? AND (status_kependudukan != 'Meninggal' OR status_kependudukan IS NULL) ORDER BY id ASC`,
        [noKk]
      );
      members = rows.map(m => ({
        ...m,
        status_hubungan_keluarga: m.status_hubungan_keluarga || m.hubungan_keluarga || 'Anggota'
      }));
    } catch (mErr) {
      console.warn('[KkRepository] Query anggota warga note:', mErr.message);
    }
    kk.anggota = members;
    return kk;
  }
}

module.exports = new KkRepository();
