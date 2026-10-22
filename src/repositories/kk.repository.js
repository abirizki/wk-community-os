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
    if (!noKk) return null;
    const cleanNoKk = String(noKk).trim();

    let kk = null;
    try {
      const [kkRows] = await pool.execute(
        'SELECT * FROM kartu_keluarga WHERE no_kk = ? LIMIT 1',
        [cleanNoKk]
      );
      if (kkRows.length > 0) {
        kk = kkRows[0];
      }
    } catch (err) {
      console.warn('[KkRepository] Query kartu_keluarga note:', err.message);
    }

    // Ambil anggota dari tabel warga
    let members = [];
    try {
      const [rows] = await pool.execute(
        `SELECT * FROM warga 
         WHERE no_kk = ? AND (status_kependudukan != 'Meninggal' OR status_kependudukan IS NULL) 
         ORDER BY CASE status_hubungan_keluarga 
           WHEN 'Kepala Keluarga' THEN 1 
           WHEN 'Suami' THEN 2 
           WHEN 'Istri' THEN 3 
           WHEN 'Anak' THEN 4 
           ELSE 5 
         END, id ASC`,
        [cleanNoKk]
      );
      members = rows.map(m => ({
        ...m,
        status_hubungan_keluarga: m.status_hubungan_keluarga || m.hubungan_keluarga || 'Anggota'
      }));
    } catch (mErr) {
      console.warn('[KkRepository] Query anggota warga note:', mErr.message);
    }

    // Jika tabel kartu_keluarga belum ada record-nya tetapi warga dengan no_kk tersebut ada,
    // buat objek KK dinamis dari data kepala keluarga
    if (!kk && members.length > 0) {
      const kepala = members.find(m => (m.status_hubungan_keluarga || '').toLowerCase().includes('kepala')) || members[0];
      kk = {
        id: kepala.id || 1,
        no_kk: cleanNoKk,
        kepala_keluarga: kepala.nama,
        alamat: kepala.alamat || 'Jl. Kebonjati RT 001/RW 001',
        rt: kepala.rt || '001',
        rw: kepala.rw || '001',
        kelurahan: kepala.kelurahan || 'Kebonjati',
        kecamatan: kepala.kecamatan || 'Sukabumi',
        kota: kepala.kota || 'Kota Sukabumi',
        provinsi: kepala.provinsi || 'Jawa Barat',
        kode_pos: kepala.kode_pos || '43111'
      };

      // Simpan ke database kartu_keluarga secara otomatis (Self-Healing)
      try {
        await pool.execute(
          `INSERT INTO kartu_keluarga (no_kk, kepala_keluarga, alamat, rt, rw, kelurahan, kecamatan, kota, provinsi, kode_pos)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE kepala_keluarga = VALUES(kepala_keluarga)`,
          [cleanNoKk, kk.kepala_keluarga, kk.alamat, kk.rt, kk.rw, kk.kelurahan, kk.kecamatan, kk.kota, kk.provinsi, kk.kode_pos]
        );
      } catch (insertErr) {}
    }

    if (kk) {
      kk.anggota = members;
    }

    return kk;
  }
}

module.exports = new KkRepository();
