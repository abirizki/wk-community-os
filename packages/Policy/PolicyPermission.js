/**
 * @file PolicyPermission.js
 * @description RBAC Permission checker for the Policy module.
 */

class PolicyPermission {
  constructor() {
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  /**
   * Registers policy permissions to the global security context.
   * @returns {object[]}
   */
  static getPermissions() {
    return [
      { key: 'policy.read.own_scope', description: 'Membaca dokumen SOP dan panduan alur kerja', defaultRoles: ['PENGURUS_RT', 'PENGURUS_RW', 'BENDAHARA', 'SEKRETARIS', 'PETUGAS_RONDA', 'CITIZEN'] },
      { key: 'policy.create', description: 'Merancang draf SOP dan menambahkan langkah prosedur', defaultRoles: ['PENGURUS_RT', 'PENGURUS_RW', 'BENDAHARA', 'SEKRETARIS'] },
      { key: 'policy.approve', description: 'Menyetujui dan memberlakukan SOP resmi (ACTIVE)', defaultRoles: ['PENGURUS_RT', 'PENGURUS_RW'] },
      { key: 'policy.revise', description: 'Membuka status revisi untuk pembaruan prosedur kerja', defaultRoles: ['PENGURUS_RT', 'PENGURUS_RW', 'BENDAHARA', 'SEKRETARIS'] },
      { key: 'policy.archive', description: 'Mengarsipkan atau menonaktifkan SOP (ARCHIVED)', defaultRoles: ['PENGURUS_RT', 'PENGURUS_RW'] },
      { key: 'policy.statistics.view', description: 'Melihat analitik cakupan SOP dan tingkat kepatuhan', defaultRoles: ['PENGURUS_RT', 'PENGURUS_RW', 'BENDAHARA', 'SEKRETARIS'] },
    ];
  }

  check(permissionKey, context = {}) {
    if (!this.security) return true;
    return this.security.checkPermission(permissionKey, context);
  }

  has(permissionKey, context = {}) {
    if (!this.security) return true;
    try {
      this.security.checkPermission(permissionKey, context);
      return true;
    } catch (e) {
      return false;
    }
  }

  checkReadPolicy(context = {}) {
    this.check('policy.read.own_scope', context);
  }

  checkCreatePolicy(context = {}) {
    this.check('policy.create', context);
  }

  checkApprovePolicy(context = {}) {
    this.check('policy.approve', context);
  }

  checkRevisePolicy(context = {}) {
    this.check('policy.revise', context);
  }

  checkArchivePolicy(context = {}) {
    this.check('policy.archive', context);
  }

  checkViewStatistics(context = {}) {
    this.check('policy.statistics.view', context);
  }
}

module.exports = { PolicyPermission };

