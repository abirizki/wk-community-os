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
    const { username, password, nama, role, rt, rw, nama_posyandu, jabatan, nomor_sk } = userData;

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
      nama_posyandu: nama_posyandu ? String(nama_posyandu).trim() : null,
      jabatan: jabatan ? String(jabatan).trim() : null,
      nomor_sk: nomor_sk ? String(nomor_sk).trim() : null,
      created_by_user_id: creatorUser.id,
      status: 'active'
    });

    return newUser;
  }

  /**
   * Get single user by ID with authorization check
   */
  async getUserById(callerUser, targetUserId) {
    const target = await userRepository.findById(targetUserId);
    if (!target) {
      throw new Error('Pengguna tidak ditemukan.');
    }
    return target;
  }

  /**
   * Update existing user details with hierarchy and scope validation
   */
  async updateUser(callerUser, targetUserId, updateData) {
    const target = await userRepository.findById(targetUserId);
    if (!target) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    const callerRole = callerUser.role === 'admin' ? 'admin_kelurahan' : callerUser.role;
    const targetRole = target.role === 'admin' ? 'admin_kelurahan' : target.role;

    const callerLevel = ROLE_HIERARCHY[callerRole] ?? 99;
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 99;

    // Caller cannot edit someone with higher or equal rank (except superadmin)
    if (callerLevel >= targetLevel && callerRole !== 'superadmin' && String(callerUser.id) !== String(targetUserId)) {
      throw new Error('Anda tidak memiliki wewenang untuk mengubah data pengguna ini.');
    }

    const payload = {};
    if (updateData.nama !== undefined) {
      if (!String(updateData.nama).trim()) throw new Error('Nama pengguna tidak boleh kosong.');
      payload.nama = String(updateData.nama).trim();
    }

    if (updateData.status !== undefined) {
      if (!['active', 'inactive', 'suspended'].includes(updateData.status)) {
        throw new Error('Status pengguna tidak valid.');
      }
      payload.status = updateData.status;
    }

    if (updateData.role !== undefined && updateData.role !== target.role) {
      const newRoleLevel = ROLE_HIERARCHY[updateData.role];
      if (newRoleLevel === undefined) {
        throw new Error(`Role '${updateData.role}' tidak valid.`);
      }
      if (callerLevel >= newRoleLevel && callerRole !== 'superadmin') {
        throw new Error(`Anda tidak berhak menetapkan role '${updateData.role}'.`);
      }
      payload.role = updateData.role;
    }

    if (updateData.username !== undefined) {
      const cleanUsername = String(updateData.username).trim();
      if (!cleanUsername) throw new Error('Username / NIK tidak boleh kosong.');
      if (cleanUsername !== target.username) {
        const existing = await userRepository.findByUsername(cleanUsername);
        if (existing && String(existing.id) !== String(targetUserId)) {
          throw new Error(`Username/NIK '${cleanUsername}' sudah digunakan oleh akun lain.`);
        }
        payload.username = cleanUsername;
      }
    }

    if (updateData.rt !== undefined) payload.rt = updateData.rt ? String(updateData.rt).trim() : null;
    if (updateData.rw !== undefined) payload.rw = updateData.rw ? String(updateData.rw).trim() : null;
    if (updateData.nama_posyandu !== undefined) payload.nama_posyandu = updateData.nama_posyandu ? String(updateData.nama_posyandu).trim() : null;
    if (updateData.jabatan !== undefined) payload.jabatan = updateData.jabatan ? String(updateData.jabatan).trim() : null;
    if (updateData.nomor_sk !== undefined) payload.nomor_sk = updateData.nomor_sk ? String(updateData.nomor_sk).trim() : null;

    if (updateData.password && String(updateData.password).trim().length >= 6) {
      const salt = await bcrypt.genSalt(10);
      payload.password_hash = await bcrypt.hash(String(updateData.password).trim(), salt);
    }

    await userRepository.updateUser(targetUserId, payload);
    return await userRepository.findById(targetUserId);
  }

  /**
   * Delete user by ID with safety checks
   */
  async deleteUser(callerUser, targetUserId) {
    const target = await userRepository.findById(targetUserId);
    if (!target) {
      throw new Error('Pengguna tidak ditemukan.');
    }

    if (String(callerUser.id) === String(targetUserId)) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri.');
    }

    const callerRole = callerUser.role === 'admin' ? 'admin_kelurahan' : callerUser.role;
    const targetRole = target.role === 'admin' ? 'admin_kelurahan' : target.role;

    const callerLevel = ROLE_HIERARCHY[callerRole] ?? 99;
    const targetLevel = ROLE_HIERARCHY[targetRole] ?? 99;

    if (callerLevel >= targetLevel && callerRole !== 'superadmin') {
      throw new Error('Anda tidak memiliki wewenang untuk menghapus pengguna ini.');
    }

    await userRepository.deleteUser(targetUserId);
    return { success: true, message: `Pengguna '${target.nama}' (${target.username}) berhasil dihapus.` };
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
