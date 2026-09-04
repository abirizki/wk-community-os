/**
 * @class ComplaintPermission
 * @description Defines all permissions related to the Complaint module for Role-Based Access Control (RBAC).
 *
 * Permission Matrix:
 * | Action                      | Citizen | RT    | RW    | Kelurahan | Officer | Admin |
 * |-----------------------------|---------|-------|-------|-----------|---------|-------|
 * | complaint.create            | ✓       |       |       |           |         | ✓     |
 * | complaint.view.own          | ✓       |       |       |           |         |       |
 * | complaint.view.area         |         | ✓     | ✓     |           |         |       |
 * | complaint.view.assigned     |         |       |       |           | ✓       |       |
 * | complaint.view.all          |         |       |       | ✓         |         | ✓     |
 * | complaint.update.own        | ✓       |       |       |           |         |       |
 * | complaint.update.status     |         | ✓     | ✓     | ✓         | ✓       | ✓     |
 * | complaint.assign            |         |       |       | ✓         |         | ✓     |
 * | complaint.resolve           |         |       |       |           | ✓       | ✓     |
 * | complaint.confirm_resolution| ✓       |       |       |           |         |       |
 * | complaint.reject            |         | ✓     | ✓     | ✓         |         | ✓     |
 * | complaint.close             |         |       |       | ✓         |         | ✓     |
 * | complaint.view.statistics   |         |       |       | ✓         |         | ✓     |
 * | complaint.manage.categories |         |       |       |           |         | ✓     |
 */
class ComplaintPermission {
  /**
   * Returns an array of permission definitions for the Complaint module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      // Basic Complaint Management
      { id: 'complaint.create', description: 'Mengajukan keluhan baru' },
      { id: 'complaint.view.own', description: 'Melihat keluhan yang diajukan sendiri' },
      { id: 'complaint.view.area', description: 'Melihat keluhan di wilayahnya (RT/RW)' },
      { id: 'complaint.view.assigned', description: 'Melihat keluhan yang ditugaskan kepadanya' },
      { id: 'complaint.view.all', description: 'Melihat semua keluhan di semua wilayah' },
      { id: 'complaint.update.own', description: 'Memperbarui keluhan yang diajukan sendiri (selama status Draft/Submitted)' },
      { id: 'complaint.update.status', description: 'Memperbarui status keluhan (melalui workflow)' },

      // Workflow Actions
      { id: 'complaint.verify.rt', description: 'Memverifikasi keluhan di tingkat RT' },
      { id: 'complaint.verify.rw', description: 'Memverifikasi keluhan di tingkat RW' },
      { id: 'complaint.assign', description: 'Menugaskan keluhan kepada petugas atau peran' },
      { id: 'complaint.resolve', description: 'Menyelesaikan keluhan dengan detail resolusi' },
      { id: 'complaint.confirm_resolution', description: 'Mengkonfirmasi resolusi keluhan oleh warga' },
      { id: 'complaint.reject', description: 'Menolak keluhan' },
      { id: 'complaint.close', description: 'Menutup keluhan' },
      { id: 'complaint.escalate', description: 'Meningkatkan eskalasi keluhan' },
      { id: 'complaint.add_comment', description: 'Menambahkan komentar pada keluhan' },
      { id: 'complaint.add_attachment', description: 'Menambahkan lampiran pada keluhan' },

      // Administrative & Reporting
      { id: 'complaint.view.statistics', description: 'Melihat dasbor dan statistik keluhan' },
      { id: 'complaint.manage.categories', description: 'Mengelola kategori dan sub-kategori keluhan' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('complaint', ComplaintPermission.getPermissions());