/**
 * @file CitizenPermission.js
 * @description RBAC Permission checker for the Citizen module.
 */

class CitizenPermission {
  constructor() {
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  static getPermissions() {
    return [
      { key: 'citizen.read.own_family', description: 'Melihat data demografi keluarga sendiri', defaultRoles: ['CITIZEN'] },
      { key: 'citizen.read.all', description: 'Melihat data demografi seluruh warga', defaultRoles: ['PENGURUS_RT', 'PENGURUS_RW'] },
      { key: 'citizen.create', description: 'Mendaftarkan warga atau KK baru', defaultRoles: ['PENGURUS_RT'] },
      { key: 'citizen.update.status', description: 'Memperbarui status kependudukan (pindah, wafat)', defaultRoles: ['PENGURUS_RT'] },
      { key: 'citizen.statistics.view', description: 'Melihat analitik demografi warga', defaultRoles: ['PENGURUS_RT', 'PENGURUS_RW', 'KEPALA_DESA'] },
    ];
  }

  check(permissionKey, context = {}) {
    if (!this.security) return true;
    return this.security.checkPermission(permissionKey, context);
  }

  checkReadOwnFamily(context = {}) {
    this.check('citizen.read.own_family', context);
  }

  checkReadAll(context = {}) {
    this.check('citizen.read.all', context);
  }

  checkCreate(context = {}) {
    this.check('citizen.create', context);
  }

  checkUpdateStatus(context = {}) {
    this.check('citizen.update.status', context);
  }

  checkViewStatistics(context = {}) {
    this.check('citizen.statistics.view', context);
  }
}

module.exports = { CitizenPermission };

