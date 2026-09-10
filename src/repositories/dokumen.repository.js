/**
 * src/repositories/dokumen.repository.js
 * Data Access Layer for Dokumen Request (Pelayanan Surat Kelurahan).
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class DokumenRepository {
  /**
   * Buat permohonan surat baru
   * @param {Object} payload 
   * @returns {Promise<Object>}
   * Buat permohonan surat baru dengan nomor registrasi unik
   */
  async create(payload) {
    const { nik_pemohon, jenis_dokumen, keperluan } = payload;
    const { 
      nik_pemohon, 
      jenis_dokumen, 
      keperluan, 
      nomor_registrasi,
      rt = null,
      rw = null
    } = payload;

    const noReg = nomor_registrasi || `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.execute(
      `INSERT INTO dokumen_request (nik_pemohon, jenis_dokumen, keperluan, status) 
       VALUES (?, ?, ?, 'SUBMITTED')`,
      [nik_pemohon, jenis_dokumen, keperluan]
      `INSERT INTO dokumen_request 
       (nomor_registrasi, nik_pemohon, jenis_surat, keperluan, status, approval_step, rt, rw, trigger_executed) 
       VALUES (?, ?, ?, ?, 'SUBMITTED', 'RT', ?, ?, 0)`,
      [noReg, nik_pemohon, jenis_dokumen, keperluan, rt, rw]
    );
    return result;
  }

  /**
   * Ambil daftar permohonan surat milik warga (berdasarkan NIK)
   * @param {string} nik 
   * @returns {Promise<Array>}
   */
  async findByNik(nik) {
    const [rows] = await pool.execute(
      `SELECT * FROM dokumen_request WHERE nik_pemohon = ? ORDER BY created_at DESC`,
      [nik]
    );
    return rows;
    return {
      id: result.insertId,
      nomor_registrasi: noReg,
      ...payload,
      status: 'SUBMITTED',
      approval_step: 'RT'
    };
  }

  /**
   * Ambil detail permohonan surat berdasarkan ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   * Ambil detail permohonan surat berdasarkan ID lengkap dengan data warga & KK
   */
  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT * FROM dokumen_request WHERE id = ? LIMIT 1`,
      `SELECT d.*, 
              d.jenis_surat AS jenis_dokumen,
              w.nama AS nama_pemohon, 
              w.no_kk, 
              w.jenis_kelamin,
              w.tanggal_lahir,
              w.pekerjaan,
              w.alamat,
              COALESCE(d.rt, w.rt) AS rt,
              COALESCE(d.rw, w.rw) AS rw,
              w.no_telepon,
              rt_user.nama AS nama_petugas_rt,
              rw_user.nama AS nama_petugas_rw,
              kel_user.nama AS nama_petugas_kelurahan
       FROM dokumen_request d 
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       LEFT JOIN users rt_user ON d.approved_by_rt = rt_user.id
       LEFT JOIN users rw_user ON d.approved_by_rw = rw_user.id
       LEFT JOIN users kel_user ON d.approved_by_kelurahan = kel_user.id
       WHERE d.id = ? 
       LIMIT 1`,
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Ambil semua permohonan surat (untuk admin/operator)
   * @returns {Promise<Array>}
   * Ambil permohonan surat milik satu NIK atau satu No KK
   */
  async list() {
  async findByNik(nik) {
    const [rows] = await pool.execute(
      `SELECT d.*, w.nama as nama_pemohon, w.no_telepon 
      `SELECT d.*, 
              d.jenis_surat AS jenis_dokumen,
              w.nama AS nama_pemohon,
              w.no_kk,
              COALESCE(d.rt, w.rt) AS rt,
              COALESCE(d.rw, w.rw) AS rw
       FROM dokumen_request d 
       LEFT JOIN warga w ON d.nik_pemohon = w.nik 
       ORDER BY d.created_at DESC`
       LEFT JOIN warga w ON d.nik_pemohon = w.nik
       WHERE d.nik_pemohon = ? OR w.no_kk = (SELECT no_kk FROM warga WHERE nik = ? LIMIT 1)
       ORDER BY d.created_at DESC`,
      [nik, nik]
    );
    return rows;
  }

  /**
   * Update status permohonan dokumen
   * @param {number} id 
   * @param {string} status 
   * @param {string} catatan_admin 
   * @param {string} file_hasil 
   * @returns {Promise<Object>}
   * Ambil daftar permohonan surat berdasar filter dan hierarki kewilayahan
   */
  async updateStatus(id, status, catatan_admin = null, file_hasil = null) {
    const approvedAt = status === 'APPROVED' || status === 'READY_PICKUP' ? new Date() : null;
    const [result] = await pool.execute(
      `UPDATE dokumen_request 
       SET status = ?, catatan_admin = COALESCE(?, catatan_admin), file_hasil = COALESCE(?, file_hasil), approved_at = COALESCE(?, approved_at)
       WHERE id = ?`,
      [status, catatan_admin, file_hasil, approvedAt, id]
    );
  async list({ rt, rw, status, approval_step, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT d.*, 
             d.jenis_surat AS jenis_dokumen,
             w.nama AS nama_pemohon, 
             w.no_kk,
             w.no_telepon,
             COALESCE(d.rt, w.rt) AS rt,
             COALESCE(d.rw, w.rw) AS rw
      FROM dokumen_request d 
      LEFT JOIN warga w ON d.nik_pemohon = w.nik 
      WHERE 1=1
    `;
    const params = [];

    if (rw) {
      query += ' AND (d.rw = ? OR (d.rw IS NULL AND w.rw = ?))';
      params.push(rw, rw);
    }
    if (rt) {
      query += ' AND (d.rt = ? OR (d.rt IS NULL AND w.rt = ?))';
      params.push(rt, rt);
    }
    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }
    if (approval_step) {
      query += ' AND d.approval_step = ?';
      params.push(approval_step);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(String(limit), String(offset));

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Update status dan step approval berjenjang
   */
  async updateApproval(id, updateData) {
    const {
      status,
      approval_step,
      catatan_petugas = null,
      approved_by_rt = null,
      approved_by_rw = null,
      approved_by_kelurahan = null,
      trigger_executed = null,
      file_url = null
    } = updateData;

    let query = 'UPDATE dokumen_request SET status = ?, approval_step = ?';
    const params = [status, approval_step];

    if (catatan_petugas !== null) {
      query += ', catatan_petugas = ?, catatan_admin = ?';
      params.push(catatan_petugas, catatan_petugas);
    }
    if (approved_by_rt !== null) {
      query += ', approved_by_rt = ?';
      params.push(approved_by_rt);
    }
    if (approved_by_rw !== null) {
      query += ', approved_by_rw = ?';
      params.push(approved_by_rw);
    }
    if (approved_by_kelurahan !== null) {
      query += ', approved_by_kelurahan = ?, approved_at = NOW()';
      params.push(approved_by_kelurahan);
    }
    if (trigger_executed !== null) {
      query += ', trigger_executed = ?';
      params.push(trigger_executed);
    }
    if (file_url !== null) {
      query += ', file_url = ?, file_hasil = ?';
      params.push(file_url, file_url);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.execute(query, params);
    return result;
  }

  /**
   * Statistik ringkasan dokumen per wilayah
   */
  async getStats({ rt, rw } = {}) {
    let query = `
      SELECT 
        COUNT(*) AS total_permohonan,
        SUM(CASE WHEN d.status = 'SUBMITTED' AND d.approval_step = 'RT' THEN 1 ELSE 0 END) AS pending_rt,
        SUM(CASE WHEN d.approval_step = 'RW' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS pending_rw,
        SUM(CASE WHEN d.approval_step = 'KELURAHAN' AND d.status != 'REJECTED' THEN 1 ELSE 0 END) AS pending_kelurahan,
        SUM(CASE WHEN d.status = 'APPROVED' THEN 1 ELSE 0 END) AS total_approved,
        SUM(CASE WHEN d.status = 'REJECTED' THEN 1 ELSE 0 END) AS total_rejected
      FROM dokumen_request d
      LEFT JOIN warga w ON d.nik_pemohon = w.nik
      WHERE 1=1
    `;
    const params = [];

    if (rw) {
      query += ' AND (d.rw = ? OR (d.rw IS NULL AND w.rw = ?))';
      params.push(rw, rw);
    }
    if (rt) {
      query += ' AND (d.rt = ? OR (d.rt IS NULL AND w.rt = ?))';
      params.push(rt, rt);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0] || {
      total_permohonan: 0,
      pending_rt: 0,
      pending_rw: 0,
      pending_kelurahan: 0,
      total_approved: 0,
      total_rejected: 0
    };
  }
}

module.exports = new DokumenRepository();

