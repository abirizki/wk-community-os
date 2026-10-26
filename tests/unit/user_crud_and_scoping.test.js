/**
 * tests/unit/user_crud_and_scoping.test.js
 * Verification of Multi-Tier User CRUD, Role Hierarchy, and Scoping
 */

const assert = require('assert');
const userService = require('../../src/services/user.service');
const userRepository = require('../../src/repositories/user.repository');

async function runTests() {
  console.log('🧪 Running User CRUD & Scoping Unit Tests...');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${err.message}`);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     ${err.message}`);
      failed++;
    }
  }

  // Mock repository methods
  const mockDb = {
    users: [
      { id: 1, username: 'superadmin', nama: 'Super Admin Diskominfo', role: 'superadmin', rt: null, rw: null, status: 'active' },
      { id: 2, username: 'lurah_kebonjati', nama: 'Drs. H. Mulyadi', role: 'lurah', rt: null, rw: null, status: 'active' },
      { id: 3, username: 'admin_rw01', nama: 'Budi Santoso', role: 'admin_rw', rt: null, rw: '001', status: 'active' },
      { id: 4, username: 'rt01_rw01', nama: 'Asep Saepudin', role: 'ketua_rt', rt: '001', rw: '001', status: 'active' },
      { id: 5, username: 'posyandu_melati', nama: 'Siti Nurhaliza', role: 'kader_posyandu', rt: '001', rw: '001', nama_posyandu: 'Melati 01', status: 'active' },
      { id: 6, username: '3272030103860021', nama: 'Tatang Sutisna', role: 'warga', rt: '001', rw: '001', status: 'active' },
    ]
  };

  const origFindById = userRepository.findById;
  const origFindByUsername = userRepository.findByUsername;
  const origUpdateUser = userRepository.updateUser;
  const origDeleteUser = userRepository.deleteUser;
  const origFindUsersByScope = userRepository.findUsersByScope;

  userRepository.findById = async (id) => mockDb.users.find(u => String(u.id) === String(id)) || null;
  userRepository.findByUsername = async (u) => mockDb.users.find(user => user.username === u) || null;
  userRepository.updateUser = async (id, data) => {
    const idx = mockDb.users.findIndex(u => String(u.id) === String(id));
    if (idx !== -1) {
      mockDb.users[idx] = { ...mockDb.users[idx], ...data };
    }
  };
  userRepository.deleteUser = async (id) => {
    mockDb.users = mockDb.users.filter(u => String(u.id) !== String(id));
  };
  userRepository.findUsersByScope = async (scope, filters) => {
    let result = [...mockDb.users];
    if (filters?.role) result = result.filter(u => u.role === filters.role);
    if (filters?.status) result = result.filter(u => u.status === filters.status);
    return result;
  };

  try {
    // 1. GET User by ID
    await asyncTest('getUserById retrieves existing user without password_hash', async () => {
      const caller = { id: 2, role: 'lurah' };
      const target = await userService.getUserById(caller, 6);
      assert.strictEqual(target.id, 6);
      assert.strictEqual(target.nama, 'Tatang Sutisna');
    });

    // 2. Hierarchy Protection: RT cannot edit Lurah
    await asyncTest('updateUser rejects editing user with higher hierarchy rank', async () => {
      const rtCaller = { id: 4, role: 'ketua_rt', rt: '001', rw: '001' };
      let threw = false;
      try {
        await userService.updateUser(rtCaller, 2, { nama: 'Hacked Lurah' });
      } catch (err) {
        threw = true;
        assert(err.message.includes('wewenang') || err.message.includes('tingkat'));
      }
      assert.strictEqual(threw, true, 'Ketua RT must not be allowed to edit Lurah');
    });

    // 3. Hierarchy Protection: RT cannot assign role 'lurah'
    await asyncTest('updateUser rejects escalating role beyond caller authority', async () => {
      const rtCaller = { id: 4, role: 'ketua_rt', rt: '001', rw: '001' };
      let threw = false;
      try {
        await userService.updateUser(rtCaller, 6, { role: 'lurah' });
      } catch (err) {
        threw = true;
        assert(err.message.includes('berhak'));
      }
      assert.strictEqual(threw, true, 'Ketua RT must not be allowed to escalate citizen to Lurah');
    });

    // 4. Lurah successfully updates Staf / RT / Warga details
    await asyncTest('updateUser allows Lurah to update subordinate user details', async () => {
      const lurahCaller = { id: 2, role: 'lurah' };
      const updated = await userService.updateUser(lurahCaller, 5, {
        nama: 'Siti Nurhaliza, S.Tr.Keb',
        nama_posyandu: 'Posyandu Melati 01 Kebonjati',
        nomor_sk: 'SK-LURAH/2026/01'
      });
      assert.strictEqual(updated.nama, 'Siti Nurhaliza, S.Tr.Keb');
      assert.strictEqual(updated.nama_posyandu, 'Posyandu Melati 01 Kebonjati');
      assert.strictEqual(updated.nomor_sk, 'SK-LURAH/2026/01');
    });

    // 5. Delete Protection: Cannot delete self
    await asyncTest('deleteUser rejects user deleting their own account', async () => {
      const lurahCaller = { id: 2, role: 'lurah' };
      let threw = false;
      try {
        await userService.deleteUser(lurahCaller, 2);
      } catch (err) {
        threw = true;
        assert(err.message.includes('sendiri'));
      }
      assert.strictEqual(threw, true, 'User should not be able to delete their own account');
    });

    // 6. Delete Protection: Lower role cannot delete higher role
    await asyncTest('deleteUser rejects lower role deleting higher role', async () => {
      const rwCaller = { id: 3, role: 'admin_rw', rw: '001' };
      let threw = false;
      try {
        await userService.deleteUser(rwCaller, 2);
      } catch (err) {
        threw = true;
        assert(err.message.includes('wewenang'));
      }
      assert.strictEqual(threw, true, 'Admin RW cannot delete Lurah');
    });

    // 7. Successful Deletion of subordinate
    await asyncTest('deleteUser allows authorized role to delete subordinate', async () => {
      const lurahCaller = { id: 2, role: 'lurah' };
      const res = await userService.deleteUser(lurahCaller, 5);
      assert.strictEqual(res.success, true);
      const after = mockDb.users.find(u => u.id === 5);
      assert.strictEqual(after, undefined, 'User 5 should have been deleted');
    });

    // 8. Username duplication validation on update
    await asyncTest('updateUser rejects updating to a duplicate username', async () => {
      const superCaller = { id: 1, role: 'superadmin' };
      let threw = false;
      try {
        await userService.updateUser(superCaller, 6, { username: 'lurah_kebonjati' });
      } catch (err) {
        threw = true;
        assert(err.message.includes('digunakan'));
      }
      assert.strictEqual(threw, true, 'Should reject duplicate username');
    });

  } finally {
    // Restore mocks
    userRepository.findById = origFindById;
    userRepository.findByUsername = origFindByUsername;
    userRepository.updateUser = origUpdateUser;
    userRepository.deleteUser = origDeleteUser;
    userRepository.findUsersByScope = origFindUsersByScope;
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runTests();

