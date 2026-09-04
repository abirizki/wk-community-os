/**
 * @file AspirationEntity.js
 * @description Core Domain Entities for the Aspiration (Usulan & Musrenbang Warga) module.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 * @blueprint DOC-013
 */

const crypto = require('crypto');

class AspirationConstants {
  /**
   * Kategori usulan pembangunan / aspirasi warga.
   */
  static get ASPIRATION_CATEGORIES() {
    return ['INFRASTRUKTUR', 'PEMBERDAYAAN', 'KESEHATAN', 'PENDIDIKAN', 'LINGKUNGAN', 'SOSIAL_BUDAYA', 'LAINNYA'];
  }

  /**
   * Tingkat prioritas pembahasan usulan.
   */
  static get ASPIRATION_PRIORITIES() {
    return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  }

  /**
   * Siklus hidup status usulan warga.
   */
  static get ASPIRATION_STATUSES() {
    return ['DRAFT', 'PROPOSED', 'POLLING', 'SCHEDULING', 'IN_DISCUSSION', 'ACCEPTED', 'DEFERRED', 'REJECTED'];
  }

  /**
   * Status terminal: usulan telah selesai diputuskan dan tidak dapat dimutasi lagi.
   */
  static get TERMINAL_STATUSES() {
    return ['ACCEPTED', 'REJECTED'];
  }
}

class Aspiration {
  /**
   * @param {Object} data - Partial or full Aspiration payload.
   */
  constructor(data = {}) {
    // Identity & Proposer
    this.id = data.id || crypto.randomUUID();
    this.citizenId = data.citizenId || ''; // FK → Citizen.id (NIK)

    // Content
    this.title = data.title || '';
    this.description = data.description || '';
    this.category = data.category || 'INFRASTRUKTUR';
    this.estimatedBudget = data.estimatedBudget !== undefined ? Number(data.estimatedBudget) : 0;
    this.location = data.location || '';

    // Workflow State & Polling
    this.status = data.status || 'DRAFT';
    this.priority = data.priority || 'LOW';
    this.voteCount = data.voteCount !== undefined ? Number(data.voteCount) : 0;

    // Schedule & Resolution Trail (all nullable)
    this.pollingEndDate = data.pollingEndDate || null;
    this.scheduledMeetingDate = data.scheduledMeetingDate || null;
    this.finalDecisionNotes = data.finalDecisionNotes || null;
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
      title: this.title,
      description: this.description,
      category: this.category,
      estimatedBudget: this.estimatedBudget,
      location: this.location,
      status: this.status,
      priority: this.priority,
      voteCount: this.voteCount,
      pollingEndDate: this.pollingEndDate,
      scheduledMeetingDate: this.scheduledMeetingDate,
      finalDecisionNotes: this.finalDecisionNotes,
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
    return new Aspiration(data);
  }
}

class AspirationVote {
  /**
   * @param {Object} data - Partial or full AspirationVote payload.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.aspirationId = data.aspirationId || ''; // FK → Aspiration.id
    this.citizenId = data.citizenId || '';       // FK → Citizen.id (NIK)
    this.votedAt = data.votedAt || new Date().toISOString();
  }

  toObject() {
    return {
      id: this.id,
      aspirationId: this.aspirationId,
      citizenId: this.citizenId,
      votedAt: this.votedAt,
    };
  }

  static fromObject(data) {
    return new AspirationVote(data);
  }
}

module.exports = {
  AspirationConstants,
  Aspiration,
  AspirationVote,
};

