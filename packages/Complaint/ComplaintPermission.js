/**
 * @file ComplaintPermission.js
 * @description RBAC Permission checker for the Complaint (Pengaduan Warga) module.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

class ComplaintPermission {
  constructor() {
    this.security = typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null;
  }

  static getPermissions() {
    return [
      { key: 'complaint.create', description: 'Membuat / mengirim aduan warga baru', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN'] },
      { key: 'complaint.view.own', description: 'Melihat aduan milik sendiri', defaultRoles: ['CITIZEN', 'KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN', 'OFFICER'] },
      { key: 'complaint.view.all', description: 'Melihat seluruh aduan warga di sistem', defaultRoles: ['KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN', 'OFFICER'] },
      { key: 'complaint.verify', description: 'Memverifikasi keabsahan aduan warga', defaultRoles: ['APARAT_KELURAHAN'] },
      { key: 'complaint.assign', description: 'Menugaskan aduan ke dinas atau petugas lapangan', defaultRoles: ['APARAT_KELURAHAN'] },
      { key: 'complaint.resolve', description: 'Menyelesaikan pengerjaan dan mengunggah bukti resolusi', defaultRoles: ['OFFICER', 'APARAT_KELURAHAN'] },
      { key: 'complaint.close', description: 'Menutup aduan setelah konfirmasi selesai', defaultRoles: ['CITIZEN', 'APARAT_KELURAHAN'] },
      { key: 'complaint.reopen', description: 'Membuka kembali aduan yang belum terselesaikan', defaultRoles: ['CITIZEN', 'APARAT_KELURAHAN'] },
      { key: 'complaint.reject', description: 'Menolak aduan yang tidak valid / tidak sesuai kriteria', defaultRoles: ['APARAT_KELURAHAN'] },
      { key: 'complaint.statistics.view', description: 'Melihat dasbor statistik dan performa SLA aduan', defaultRoles: ['KETUA_RT', 'KETUA_RW', 'APARAT_KELURAHAN', 'OFFICER'] },
    ];
  }

  _check(permissionKey, context = {}) {
    if (!this.security) return true;
    return this.security.checkPermission(permissionKey, context);
  }

  checkCreate(context = {}) { this._check('complaint.create', context); }
  checkViewOwn(context = {}) { this._check('complaint.view.own', context); }
  checkViewAll(context = {}) { this._check('complaint.view.all', context); }
  checkVerify(context = {}) { this._check('complaint.verify', context); }
  checkAssign(context = {}) { this._check('complaint.assign', context); }
  checkResolve(context = {}) { this._check('complaint.resolve', context); }
  checkClose(context = {}) { this._check('complaint.close', context); }
  checkReopen(context = {}) { this._check('complaint.reopen', context); }
  checkReject(context = {}) { this._check('complaint.reject', context); }
  checkViewStatistics(context = {}) { this._check('complaint.statistics.view', context); }
}

module.exports = { ComplaintPermission };

