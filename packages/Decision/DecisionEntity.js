/**
 * @file DecisionEntity.js
 * @description Core Entity Layer for Decision Module (Epic Governance / Package P21) in Warga Kebonjati (WK COMMUNITY OS).
 * Encapsulates domain models for formal community decisions, decrees, and policy impacts.
 */

// Helper to generate UUID compatible with Google Apps Script Utilities and standard Node environments
function generateDecisionUuid() {
  if (typeof Utilities !== 'undefined' && typeof Utilities.getUuid === 'function') {
    return Utilities.getUuid();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * @class DecisionConstants
 * @classdesc Enumerations, categories, and lookup constants for the Decision module.
 */
class DecisionConstants {
  static get CATEGORIES() {
    return [
      'ANGGARAN_KEUANGAN',
      'TATA_TERTIB_LINGKUNGAN',
      'KEAMANAN_RONDA',
      'KEBERSIHAN_INFRASTRUKTUR',
      'KEGIATAN_SOSIAL',
      'LAINNYA',
    ];
  }

  static get SCOPE_TYPES() {
    return ['RT', 'RW', 'KELURAHAN'];
  }

  static get STATUSES() {
    return ['DRAFT', 'RATIFIED', 'SUPERSEDED', 'REVOKED'];
  }

  static get TARGET_TYPES() {
    return ['ALL_CITIZENS', 'FAMILY_HEADS', 'SPECIFIC_RT', 'MERCHANTS', 'COMMITTEE'];
  }
}

/**
 * @class Decision
 * @classdesc Represents a formal community decree, decision, or ratified resolution from a meeting.
 */
class Decision {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateDecisionUuid();
    this.decisionNumber = data.decisionNumber || `KEP-${Date.now()}`;
    this.meetingId = data.meetingId || '';
    this.agendaId = data.agendaId || null;
    this.title = data.title || '';
    this.content = data.content || '';
    this.category = data.category || 'LAINNYA';
    this.scopeType = data.scopeType || 'RT';
    this.scopeId = data.scopeId || '';

    // Lifecycle & Governance
    this.status = data.status || 'DRAFT';
    this.effectiveDate = data.effectiveDate || new Date().toISOString();
    this.expirationDate = data.expirationDate || null;
    this.signatoryCitizenId = data.signatoryCitizenId || null;
    this.supersededByDecisionId = data.supersededByDecisionId || null;
    this.isPublic = typeof data.isPublic === 'boolean' ? data.isPublic : true;

    // WK Standard Audit Trail Fields
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = typeof data.version === 'number' ? data.version : 1;
  }

  /**
   * Returns a plain JavaScript object suitable for database persistence.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      decisionNumber: this.decisionNumber,
      meetingId: this.meetingId,
      agendaId: this.agendaId,
      title: this.title,
      content: this.content,
      category: this.category,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      status: this.status,
      effectiveDate: this.effectiveDate,
      expirationDate: this.expirationDate,
      signatoryCitizenId: this.signatoryCitizenId,
      supersededByDecisionId: this.supersededByDecisionId,
      isPublic: this.isPublic,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  /**
   * Deserializes a raw database record into a Decision entity instance.
   * @param {object} record - Database record.
   * @returns {Decision|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new Decision({ ...record });
  }

  /**
   * Returns a sanitized object for public view.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      decisionNumber: this.decisionNumber,
      meetingId: this.meetingId,
      title: this.title,
      content: this.content,
      category: this.category,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      status: this.status,
      effectiveDate: this.effectiveDate,
      expirationDate: this.expirationDate,
      signatoryCitizenId: this.signatoryCitizenId,
      supersededByDecisionId: this.supersededByDecisionId,
      isPublic: this.isPublic,
      createdAt: this.createdAt,
    };
  }
}

/**
 * @class DecisionImpact
 * @classdesc Represents the target audience, affected scope, and policy impact of a formal decision.
 */
class DecisionImpact {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateDecisionUuid();
    this.decisionId = data.decisionId || '';
    this.targetType = data.targetType || 'ALL_CITIZENS';
    this.targetScopeId = data.targetScopeId || '';
    this.description = data.description || '';

    // WK Standard Audit Trail Fields
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = typeof data.version === 'number' ? data.version : 1;
  }

  /**
   * Returns a plain JavaScript object suitable for database persistence.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      decisionId: this.decisionId,
      targetType: this.targetType,
      targetScopeId: this.targetScopeId,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  /**
   * Deserializes a raw database record into a DecisionImpact entity instance.
   * @param {object} record - Database record.
   * @returns {DecisionImpact|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new DecisionImpact({ ...record });
  }

  /**
   * Returns a sanitized object for display.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      decisionId: this.decisionId,
      targetType: this.targetType,
      targetScopeId: this.targetScopeId,
      description: this.description,
    };
  }
}

module.exports = {
  DecisionConstants,
  Decision,
  DecisionImpact,
};

