/**
 * @file PosyanduPermission.js
 * @description RBAC Permission checker for the Posyandu (Community Health) module.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

class PosyanduPermission {
  constructor() {
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  static getPermissions() {
    return [
      { key: 'posyandu.member.create', description: 'Mendaftarkan peserta baru Posyandu (Balita, Bumil, Lansia)', defaultRoles: ['KADER_POSYANDU', 'BIDAN_DESA', 'PUSKESMAS'] },
      { key: 'posyandu.member.view.all', description: 'Melihat seluruh daftar peserta Posyandu di wilayah', defaultRoles: ['KADER_POSYANDU', 'BIDAN_DESA', 'PUSKESMAS'] },
      { key: 'posyandu.record.create', description: 'Mencatat rekam medis penimbangan dan skrining Posyandu', defaultRoles: ['KADER_POSYANDU', 'BIDAN_DESA', 'PUSKESMAS'] },
      { key: 'posyandu.record.view.own', description: 'Melihat riwayat rekam medis posyandu anak/pribadi', defaultRoles: ['CITIZEN', 'KADER_POSYANDU', 'BIDAN_DESA'] },
      { key: 'posyandu.risk.followup', description: 'Melakukan tindak lanjut kasus risiko tinggi/stunting', defaultRoles: ['KADER_POSYANDU', 'BIDAN_DESA', 'PUSKESMAS'] },
      { key: 'posyandu.statistics.view', description: 'Melihat dasbor agregat kesehatan komunitas', defaultRoles: ['KADER_POSYANDU', 'BIDAN_DESA', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
    ];
  }

  _check(permissionKey, context = {}) {
    if (!this.security) return true;
    return this.security.checkPermission(permissionKey, context);
  }

  checkCreateMember(context = {}) { this._check('posyandu.member.create', context); }
  checkViewAllMembers(context = {}) { this._check('posyandu.member.view.all', context); }
  checkCreateRecord(context = {}) { this._check('posyandu.record.create', context); }
  checkViewOwnRecord(context = {}) { this._check('posyandu.record.view.own', context); }
  checkRiskFollowup(context = {}) { this._check('posyandu.risk.followup', context); }
  checkViewStatistics(context = {}) { this._check('posyandu.statistics.view', context); }
}

module.exports = { PosyanduPermission };

