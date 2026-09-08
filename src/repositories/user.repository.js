/**
 * src/repositories/user.repository.js
 * Data Access Layer for Users table.
 */

const pool = require('../db/pool');

class UserRepository {
  /**
   * Find a user by username
   * @param {string} username 
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT id, username, password_hash, nama, role, status, created_at FROM users WHERE username = ?',
      [username]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Find a user by ID
   * @param {number} id 
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, nama, role, status, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = new UserRepository();

