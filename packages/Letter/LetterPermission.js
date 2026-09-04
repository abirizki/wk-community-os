/**
 * @file LetterPermission.js
 * @description RBAC Permission checker for the Letter (Surat Pengantar) module.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

class LetterPermission {
  constructor() {
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  static getPermissions() {
    return [
      { key: 'letter.create', description: 'Mengajukan permohonan surat pengantar baru', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
      { key: 'letter.view.own', description: 'Melihat permohonan surat milik sendiri', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
      { key: 'letter.view.all', description: 'Melihat seluruh permohonan surat di wilayah kerja', defaultRoles: ['KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
      { key: 'letter.approve.rt', description: 'Menyetujui surat pengantar di tingkat RT', defaultRoles: ['KETUA_RT'] },
      { key: 'letter.approve.rw', description: 'Menyetujui surat pengantar di tingkat RW', defaultRoles: ['KETUA_RW'] },
      { key: 'letter.approve.kelurahan', description: 'Menyetujui dan menerbitkan nomor surat resmi di tingkat Kelurahan', defaultRoles: ['APARAT_KELURAHAN'] },
      { key: 'letter.reject', description: 'Menolak permohonan surat pengantar', defaultRoles: ['KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
      { key: 'letter.statistics.view', description: 'Melihat dasbor analitik dan statistik surat', defaultRoles: ['KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
    ];
  }

  _check(permissionKey, context = {}) {
    if (!this.security) return true;
    return this.security.checkPermission(permissionKey, context);
  }

  checkCreate(context = {}) { this._check('letter.create', context); }
  checkViewOwn(context = {}) { this._check('letter.view.own', context); }
  checkViewAll(context = {}) { this._check('letter.view.all', context); }
  checkApproveRt(context = {}) { this._check('letter.approve.rt', context); }
  checkApproveRw(context = {}) { this._check('letter.approve.rw', context); }
  checkApproveKelurahan(context = {}) { this._check('letter.approve.kelurahan', context); }
  checkReject(context = {}) { this._check('letter.reject', context); }
  checkViewStatistics(context = {}) { this._check('letter.statistics.view', context); }
}

module.exports = { LetterPermission };

