/**
 * src/repositories/aparatur.repository.js
 * Data Access Layer for Aparatur Kelurahan & Mitra Keamanan
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class AparaturRepository {
  async list({ kelurahan = 'Kebonjati', kategori = null, rw = null, rt = null } = {}) {
    try {
      let query = 'SELECT * FROM aparatur_kelurahan WHERE is_active = 1';
      const params = [];

      if (kelurahan) {
        query += ' AND kelurahan = ?';
        params.push(kelurahan);
      }
      if (kategori) {
        query += ' AND kategori = ?';
        params.push(kategori);
      }
      if (rw) {
        query += ' AND (wilayah_rw = ? OR wilayah_rw IS NULL)';
        params.push(rw);
      }
      if (rt) {
        query += ' AND (wilayah_rt = ? OR wilayah_rt IS NULL)';
        params.push(rt);
      }

      query += ' ORDER BY FIELD(kategori, "KELURAHAN", "KEAMANAN", "RW", "RT", "POSYANDU"), id ASC';
      const [rows] = await pool.execute(query, params);
      return rows;
    } catch (e) {
      console.warn('[AparaturRepo] list error:', e.message);
      return [];
    }
  }

  async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM aparatur_kelurahan WHERE id = ? LIMIT 1', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      return null;
    }
  }

  async findByNik(nik) {
    try {
      const [rows] = await pool.execute('SELECT * FROM aparatur_kelurahan WHERE nik_pejabat = ? AND is_active = 1 LIMIT 1', [nik]);
      return rows.length > 0 ? rows[0] : null;
    } catch (e) {
      return null;
    }
  }

  async create(data) {
    const {
      kelurahan = 'Kebonjati',
      kecamatan = 'Cikole',
      kota = 'Kota Sukabumi',
      kategori,
      jabatan,
      wilayah_rw = null,
      wilayah_rt = null,
      nama_posyandu = null,
      nama_pejabat,
      nik_pejabat = null,
      nip_nrp = null,
      pangkat_golongan = null,
      no_telp = null,
      no_wa,
      email = null,
      alamat_kantor = null,
      jam_layanan = 'Senin - Jumat, 08.00 - 15.30 WIB'
    } = data;

    const [result] = await pool.execute(`
      INSERT INTO aparatur_kelurahan 
        (kelurahan, kecamatan, kota, kategori, jabatan, wilayah_rw, wilayah_rt, nama_posyandu, 
         nama_pejabat, nik_pejabat, nip_nrp, pangkat_golongan, no_telp, no_wa, email, alamat_kantor, jam_layanan, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      kelurahan, kecamatan, kota, kategori, jabatan, wilayah_rw, wilayah_rt, nama_posyandu,
      nama_pejabat, nik_pejabat, nip_nrp, pangkat_golongan, no_telp, no_wa, email, alamat_kantor, jam_layanan
    ]);

    return { id: result.insertId, ...data };
  }

  async update(id, data) {
    const fields = [];
    const params = [];

    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        fields.push(`${key} = ?`);
        params.push(val);
      }
    }

    if (fields.length === 0) return true;

    params.push(id);
    const [result] = await pool.execute(`UPDATE aparatur_kelurahan SET ${fields.join(', ')} WHERE id = ?`, params);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await pool.execute('UPDATE aparatur_kelurahan SET is_active = 0 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new AparaturRepository();
