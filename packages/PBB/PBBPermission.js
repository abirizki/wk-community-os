/**
 * @file PBBPermission.js
 * @description RBAC Permission checker for PBB Tax Management module.
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

class PBBPermission {
  constructor() {
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  static getPermissions() {
    return [
      { key: 'pbb.import_sppt', description: 'Mengimpor data SPPT PBB tahunan dari Bapenda', defaultRoles: ['ADMIN', 'BAPENDA', 'APARAT_KELURAHAN'] },
      { key: 'pbb.view.own', description: 'Melihat data Objek Pajak dan SPPT PBB milik sendiri', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN', 'ADMIN'] },
      { key: 'pbb.view.rt', description: 'Melihat rekapitulasi PBB tingkat RT', defaultRoles: ['KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN', 'ADMIN'] },
      { key: 'pbb.view.rw', description: 'Melihat rekapitulasi PBB tingkat RW', defaultRoles: ['KETUA_RW', 'APARAT_KELURAHAN', 'ADMIN'] },
      { key: 'pbb.view.all', description: 'Melihat seluruh data Objek Pajak & SPPT Kelurahan', defaultRoles: ['APARAT_KELURAHAN', 'ADMIN', 'BAPENDA'] },
      { key: 'pbb.confirm_payment', description: 'Mengunggah konfirmasi bukti bayar PBB', defaultRoles: ['CITIZEN', 'KETUA_RT', 'ADMIN'] },
      { key: 'pbb.verify_payment', description: 'Memvalidasi dan mengesahkan pembayaran PBB', defaultRoles: ['KETUA_RT', 'APARAT_KELURAHAN', 'ADMIN'] },
    ];
  }

  _check(permissionKey, context = {}) {
    if (!this.security) return true;
    return this.security.checkPermission(permissionKey, context);
  }

  checkImportSPPT(context = {}) { this._check('pbb.import_sppt', context); }
  checkViewOwn(context = {}) { this._check('pbb.view.own', context); }
  checkViewRT(context = {}) { this._check('pbb.view.rt', context); }
  checkViewRW(context = {}) { this._check('pbb.view.rw', context); }
  checkViewAll(context = {}) { this._check('pbb.view.all', context); }
  checkConfirmPayment(context = {}) { this._check('pbb.confirm_payment', context); }
  checkVerifyPayment(context = {}) { this._check('pbb.verify_payment', context); }
}

module.exports = { PBBPermission };

