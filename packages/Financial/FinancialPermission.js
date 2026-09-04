/**
 * @file FinancialPermission.js
 * @description RBAC Permission checker for the Financial module.
 */

class FinancialPermission {
  constructor() {
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  static getPermissions() {
    return [
      { key: 'finance.dues.view.own', description: 'Melihat tagihan iuran keluarga sendiri', defaultRoles: ['CITIZEN'] },
      { key: 'finance.dues.view.all', description: 'Melihat semua tagihan iuran warga', defaultRoles: ['KETUA_RT', 'BENDAHARA', 'KETUA_RW'] },
      { key: 'finance.dues.record_payment', description: 'Mencatat pembayaran iuran warga', defaultRoles: ['BENDAHARA'] },
      { key: 'finance.dues.waive', description: 'Membebaskan tagihan iuran warga', defaultRoles: ['KETUA_RT', 'BENDAHARA', 'KETUA_RW'] },
      { key: 'finance.dues.generate_bills', description: 'Membuat tagihan iuran bulanan massal', defaultRoles: ['BENDAHARA'] },
      { key: 'finance.transaction.create', description: 'Mencatat transaksi kas manual', defaultRoles: ['BENDAHARA'] },
      { key: 'finance.transaction.view', description: 'Melihat buku kas komunitas', defaultRoles: ['KETUA_RT', 'BENDAHARA', 'KETUA_RW'] },
    ];
  }

  _check(permissionKey, context = {}) {
    if (!this.security) return true;
    return this.security.checkPermission(permissionKey, context);
  }

  checkViewOwnDues(context = {}) { this._check('finance.dues.view.own', context); }
  checkViewAllDues(context = {}) { this._check('finance.dues.view.all', context); }
  checkRecordPayment(context = {}) { this._check('finance.dues.record_payment', context); }
  checkWaiveDues(context = {}) { this._check('finance.dues.waive', context); }
  checkGenerateBills(context = {}) { this._check('finance.dues.generate_bills', context); }
  checkCreateTransaction(context = {}) { this._check('finance.transaction.create', context); }
  checkViewTransactions(context = {}) { this._check('finance.transaction.view', context); }
}

module.exports = { FinancialPermission };

