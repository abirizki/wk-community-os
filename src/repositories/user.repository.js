/**
 * src/repositories/user.repository.js
 * Data Access Layer for Users, Multi-Tier Scoping, & KK-Centric Queries.
 * Bumi Warga - Jabar Pintar Digital
 */

const pool = require('../db/pool');

class UserRepository {
  /**
   * Find a user by username
   * @param {string} username 
   * @returns {Promise<Object|null>}
   */
  async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash, nama, role, rt, rw, status, created_at FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find a user by ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, nama, role, rt, rw, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find all family members registered under a specific No KK
   * @param {string} no_kk 
   * @returns {Promise<Array>}
   */
  async findFamilyMembersByNoKK(no_kk) {
    const [rows] = await pool.execute(
      `SELECT id, nik, no_kk, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, 
              agama, status_perkawinan, status_hubungan_keluarga, pekerjaan, 
              pendidikan_terakhir, golongan_darah, rt, rw, status_kependudukan, no_telepon
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
      [no_kk]
    );
    return rows;
  }

  /**
   * Check if a No KK exists in kartu_keluarga
   * @param {string} no_kk 
   * @returns {Promise<Object|null>}
   */
  async findKartuKeluarga(no_kk) {
    const [rows] = await pool.execute(
      'SELECT id, no_kk, kepala_keluarga, alamat, rt, rw, kelurahan, kecamatan, kota FROM kartu_keluarga WHERE no_kk = ?',
      [no_kk]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Create a new user account with hierarchy & scope
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createUser(data) {
    const {
      username,
      password_hash,
      nama,
      role = 'warga',
      rt = null,
      rw = null,
      created_by_user_id = null,
      status = 'active'
    } = data;

    const [result] = await pool.execute(
      `INSERT INTO users (username, password_hash, nama, role, rt, rw, created_by_user_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, password_hash, nama, role, rt, rw, created_by_user_id, status]
    );

    return {
      id: result.insertId,
      username,
      nama,
      role,
      rt,
      rw,
      status
    };
  }

  /**
   * List users based on caller's hierarchical scope
   * @param {Object} currentUser 
   * @param {Object} filters
   * @returns {Promise<Array>}
   */
  async findUsersByScope(currentUser, filters = {}) {
    const { role: userRole, rt: userRT, rw: userRW } = currentUser;
    const normalizedRole = userRole === 'admin' ? 'admin_kelurahan' : userRole;

    let query = `
      SELECT u.id, u.username, u.nama, u.role, u.rt, u.rw, u.status, u.created_at,
             creator.nama AS created_by_name
      FROM users u
      LEFT JOIN users creator ON u.created_by_user_id = creator.id
      WHERE 1=1
    `;
    const params = [];

    // Scope rules
    if (normalizedRole === 'superadmin') {
      // Sees all users
    } else if (normalizedRole === 'admin_kelurahan') {
      // Sees all users except superadmin
      query += ` AND u.role != 'superadmin'`;
    } else if (normalizedRole === 'ketua_rw' || normalizedRole === 'admin_rw') {
      // Only sees users in their RW, excluding superadmin and admin_kelurahan
      query += ` AND u.rw = ? AND u.role NOT IN ('superadmin', 'admin_kelurahan')`;
      params.push(userRW);
    } else if (normalizedRole === 'ketua_rt') {
      // Only sees users in their RT and RW
      query += ` AND u.rt = ? AND u.rw = ? AND u.role = 'warga'`;
      params.push(userRT, userRW);
    } else {
      // Normal warga cannot list users
      return [];
    }

    // Optional query filters
    if (filters.role) {
      query += ` AND u.role = ?`;
      params.push(filters.role);
    }
    if (filters.rt) {
      query += ` AND u.rt = ?`;
      params.push(filters.rt);
    }
    if (filters.rw) {
      query += ` AND u.rw = ?`;
      params.push(filters.rw);
    }
    if (filters.search) {
      query += ` AND (u.nama LIKE ? OR u.username LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ` ORDER BY u.created_at DESC`;

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  /**
   * Update status of a user
   * @param {number} id 
   * @param {string} status 
   */
  async updateStatus(id, status) {
    await pool.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return true;
  }

  /**
   * Update password hash of a user
   * @param {number} id 
   * @param {string} password_hash 
   */
  async updatePassword(id, password_hash) {
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
    return true;
  }
}

module.exports = new UserRepository();
