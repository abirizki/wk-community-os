/**
 * @file ComplaintEntity.js
 * @description Core Domain Entities for the Complaint (Pengaduan Warga) module.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 * @blueprint DOC-012
 */

const crypto = require('crypto');

class ComplaintConstants {
  /**
   * Kategori aduan warga.
   */
  static get COMPLAINT_CATEGORIES() {
    return ['INFRA', 'LING', 'SOS', 'AMAN', 'PJU', 'DRAIN', 'SAMPAH'];
  }

  /**
   * Tingkat urgensi / prioritas aduan.
   */
  static get COMPLAINT_PRIORITIES() {
    return ['LOW', 'MEDIUM', 'HIGH'];
  }

  /**
   * Siklus hidup status penanganan aduan.
   */
  static get COMPLAINT_STATUSES() {
    return ['NEW', 'VERIFIED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED', 'REOPENED'];
  }

  /**
   * Status terminal: aduan tidak dapat dimutasi kecuali dibuka kembali oleh pelapor.
   */
  static get TERMINAL_STATUSES() {
    return ['CLOSED', 'REJECTED'];
  }

  /**
   * Target SLA penyelesaian (dalam jam kerja).
   */
  static get SLA_HOURS() {
    return {
      HIGH: 72,    // 1 - 3 hari kerja
      MEDIUM: 168, // 3 - 7 hari kerja
      LOW: 336,    // 7 - 14 hari kerja
    };
  }
}

class Complaint {
  /**
   * @param {Object} data - Partial or full Complaint payload.
   */
  constructor(data = {}) {
    // Identity & Reporter
    this.id = data.id || crypto.randomUUID();
    this.citizenId = data.citizenId || ''; // FK → Citizen.id (NIK)
    this.isAnonymous = data.isAnonymous !== undefined ? Boolean(data.isAnonymous) : false;

    // Content
    this.title = data.title || '';
    this.description = data.description || '';
    this.category = data.category || 'INFRA';
    this.priority = data.priority || 'MEDIUM';
    this.location = data.location || '';
    this.attachments = Array.isArray(data.attachments) ? data.attachments : [];

    // Workflow State
    this.status = data.status || 'NEW';

    // Resolution & Assignment Trail (all nullable)
    this.assignedOfficerId = data.assignedOfficerId || null;
    this.resolutionEvidence = Array.isArray(data.resolutionEvidence) ? data.resolutionEvidence : [];
    this.resolutionNotes = data.resolutionNotes || null;
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
      isAnonymous: this.isAnonymous,
      title: this.title,
      description: this.description,
      category: this.category,
      priority: this.priority,
      location: this.location,
      attachments: this.attachments,
      status: this.status,
      assignedOfficerId: this.assignedOfficerId,
      resolutionEvidence: this.resolutionEvidence,
      resolutionNotes: this.resolutionNotes,
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
    return new Complaint(data);
  }

  /**
   * Sanitizes object for public dashboard or presentation display,
   * masking citizen identity if anonymous and stripping internal audit fields.
   */
  toDisplay() {
    const obj = this.toObject();

    if (this.isAnonymous) {
      obj.citizenId = 'ANONYMOUS';
    } else if (obj.citizenId && obj.citizenId.length >= 12) {
      const visible = obj.citizenId.slice(-4);
      obj.citizenId = '*'.repeat(obj.citizenId.length - 4) + visible;
    }

    delete obj.deletedAt;
    delete obj.deletedBy;

    return obj;
  }
}

module.exports = {
  ComplaintConstants,
  Complaint,
};

