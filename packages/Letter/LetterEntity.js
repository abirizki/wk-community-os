/**
 * @file LetterEntity.js
 * @description Core Domain Entities for the Letter (Surat Pengantar) module.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 * @blueprint DOC-011
 */

const crypto = require('crypto');

class LetterConstants {
  /**
   * Jenis surat yang didukung oleh sistem.
   */
  static get LETTER_TYPES() {
    return ['SKTM', 'DOMISILI', 'USAHA', 'PENGANTAR', 'KELAHIRAN', 'KEMATIAN'];
  }

  /**
   * Siklus hidup status pengajuan surat (3-level approval workflow).
   * DRAFT → WAITING_RT → WAITING_RW → WAITING_KELURAHAN → APPROVED
   *                   ↘ REJECTED (dapat terjadi di level manapun)
   */
  static get LETTER_STATUSES() {
    return ['DRAFT', 'WAITING_RT', 'WAITING_RW', 'WAITING_KELURAHAN', 'APPROVED', 'REJECTED'];
  }

  /**
   * Status terminal: surat tidak dapat diubah kembali setelah mencapai ini.
   */
  static get TERMINAL_STATUSES() {
    return ['APPROVED', 'REJECTED'];
  }

  /**
   * Urutan alur persetujuan (non-terminal, dapat di-advance).
   */
  static get APPROVAL_WORKFLOW() {
    return ['WAITING_RT', 'WAITING_RW', 'WAITING_KELURAHAN', 'APPROVED'];
  }

  /**
   * Dokumen pendukung wajib per jenis surat.
   */
  static get REQUIRED_ATTACHMENTS() {
    return {
      SKTM: ['scan_kk', 'scan_ktp', 'foto_rumah'],
      DOMISILI: ['scan_kk', 'scan_ktp'],
      USAHA: ['scan_kk', 'scan_ktp', 'foto_tempat_usaha'],
      PENGANTAR: ['scan_kk', 'scan_ktp'],
      KELAHIRAN: ['scan_kk', 'scan_ktp_orang_tua', 'surat_keterangan_lahir'],
      KEMATIAN: ['scan_kk', 'scan_ktp_almarhum', 'surat_keterangan_kematian'],
    };
  }
}

class Letter {
  /**
   * @param {Object} data - Partial or full Letter payload.
   */
  constructor(data = {}) {
    // Core Identity
    this.id = data.id || crypto.randomUUID();
    this.citizenId = data.citizenId || '';     // FK → Citizen.id (NIK 16-digit)
    this.familyId = data.familyId || '';       // FK → Family.id (No. KK 16-digit)

    // Request Content
    this.type = data.type || 'PENGANTAR';     // Enum: LetterConstants.LETTER_TYPES
    this.purpose = data.purpose || '';         // Keterangan/keperluan pengajuan
    this.attachments = data.attachments || []; // Array of file paths/URLs

    // Workflow State
    this.status = data.status || 'DRAFT';     // Default: DRAFT

    // Approval Trail (all nullable)
    this.letterNumber = data.letterNumber || null;
    this.approvedByRtId = data.approvedByRtId || null;
    this.approvedByRwId = data.approvedByRwId || null;
    this.approvedByKelId = data.approvedByKelId || null;
    this.rejectedReason = data.rejectedReason || null;

    // WK Standard Audit Trail
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version !== undefined ? data.version : 1;
  }

  toObject() {
    return {
      id: this.id,
      citizenId: this.citizenId,
      familyId: this.familyId,
      type: this.type,
      purpose: this.purpose,
      attachments: this.attachments,
      status: this.status,
      letterNumber: this.letterNumber,
      approvedByRtId: this.approvedByRtId,
      approvedByRwId: this.approvedByRwId,
      approvedByKelId: this.approvedByKelId,
      rejectedReason: this.rejectedReason,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  static fromObject(data) {
    return new Letter(data);
  }
}

module.exports = {
  LetterConstants,
  Letter,
};
