/**
 * src/services/user.service.js
 * Business Logic for Hierarchical User Management
 * Bumi Warga - Jabar Pintar Digital
 */

const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/user.repository');
const { ROLE_HIERARCHY } = require('../middleware/auth.middleware');

class UserService {
  /**
   * Get list of users manageable by the caller
   */
  async listUsers(currentUser, filters) {
    return await userRepository.findUsersByScope(currentUser, filters);
  }

  /**
   * Create a new user enforcing hierarchy and scope
   */
  async createUser(creatorUser, userData) {
    const { username, password, nama, role, rt, rw } = userData;

    if (!username || !password || !nama || !role) {
      throw new Error('Username, password, nama, dan role wajib diisi.');
    }

    const cleanUsername = String(username).trim();

    // Cek duplikasi username
    const existing = await userRepository.findByUsername(cleanUsername);
    if (existing) {
      throw new Error(`Username/NIK '${cleanUsername}' sudah terdaftar.`);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Siapkan data user
    const newUser = await userRepository.createUser({
      username: cleanUsername,
      password_hash,
      nama: nama.trim(),
      role,
      rt: rt ? String(rt).trim() : null,
      rw: rw ? String(rw).trim() : null,
      created_by_user_id: creatorUser.id,
      status: 'active'
    });

    return newUser;
  }

  /**
   * Toggle user status (active / inactive)
   */
  async updateUserStatus(creatorUser, targetUserId, status) {
    const target = await userRepository.findById(targetUserId);
    if (!target) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    const creatorRole = creatorUser.role === 'admin' ? 'admin_kelurahan' : creatorUser.role;
    const targetRole = target.role === 'admin' ? 'admin_kelurahan' : target.role;

    const creatorLevel = ROLE_HIERARCHY[creatorRole] ?? 99;
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 99;

    if (creatorLevel >= targetLevel && creatorRole !== 'superadmin') {
      throw new Error('Anda tidak memiliki wewenang untuk mengubah status pengguna ini.');
    }

    await userRepository.updateStatus(targetUserId, status);
    return { id: targetUserId, status };
  }

  /**
   * Reset user password by authority
   */
  async resetPassword(creatorUser, targetUserId, newPassword) {
    const target = await userRepository.findById(targetUserId);
    if (!target) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    const creatorRole = creatorUser.role === 'admin' ? 'admin_kelurahan' : creatorUser.role;
    const targetRole = target.role === 'admin' ? 'admin_kelurahan' : target.role;

    const creatorLevel = ROLE_HIERARCHY[creatorRole] ?? 99;
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 99;

    if (creatorLevel >= targetLevel && creatorRole !== 'superadmin') {
      throw new Error('Anda tidak memiliki wewenang untuk mereset password pengguna ini.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await userRepository.updatePassword(targetUserId, password_hash);
    return { success: true, message: `Password untuk user '${target.username}' berhasil diperbarui.` };
  }
}

module.exports = new UserService();
