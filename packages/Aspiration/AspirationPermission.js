/**
 * @file AspirationPermission.js
 * @description RBAC Permission checker for the Aspiration (Usulan & Musrenbang Warga) module.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 */

class AspirationPermission {
  constructor() {
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  static getPermissions() {
    return [
      { key: 'aspiration.create', description: 'Mengajukan usulan pembangunan / program baru', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
      { key: 'aspiration.vote', description: 'Memberikan suara dukungan (polling) pada usulan', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
      { key: 'aspiration.view', description: 'Melihat daftar dan detail usulan warga', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
      { key: 'aspiration.verify', description: 'Memverifikasi dan membuka periode polling usulan', defaultRoles: ['APARAT_KELURAHAN'] },
      { key: 'aspiration.schedule', description: 'Menjadwalkan usulan ke dalam sidang Musrenbang', defaultRoles: ['APARAT_KELURAHAN'] },
      { key: 'aspiration.decide', description: 'Menetapkan keputusan akhir musyawarah (Diterima/Ditunda/Ditolak)', defaultRoles: ['APARAT_KELURAHAN'] },
      { key: 'aspiration.statistics.view', description: 'Melihat dasbor partisipasi publik dan analitik Musrenbang', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
    ];
  }

  _check(permissionKey, context = {}) {
    if (!this.security) return true;
    return this.security.checkPermission(permissionKey, context);
  }

  checkCreate(context = {}) { this._check('aspiration.create', context); }
  checkVote(context = {}) { this._check('aspiration.vote', context); }
  checkView(context = {}) { this._check('aspiration.view', context); }
  checkVerify(context = {}) { this._check('aspiration.verify', context); }
  checkSchedule(context = {}) { this._check('aspiration.schedule', context); }
  checkDecide(context = {}) { this._check('aspiration.decide', context); }
  checkViewStatistics(context = {}) { this._check('aspiration.statistics.view', context); }
}

module.exports = { AspirationPermission };

