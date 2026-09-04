/**
 * @file PolicyEntity.js
 * @description Core Entity Layer for Policy & SOP Module (Epic Governance / Package P23) in Warga Kebonjati (WK COMMUNITY OS).
 * Encapsulates domain models for internal government policies, SOPs, and procedural steps.
 */

// Helper to generate UUID compatible with Google Apps Script Utilities and standard Node environments
function generatePolicyUuid() {
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
 * @class PolicyConstants
 * @classdesc Enumerations, categories, and lookup constants for the Policy and SOP module.
 */
class PolicyConstants {
  static get CATEGORIES() {
    return [
      'SOP_PELAYANAN_WARGA',
      'SOP_KEAMANAN_KETERTIBAN',
      'SOP_KEUANGAN_KAS',
      'SOP_PENANGANAN_DARURAT',
      'SOP_KEBERSIHAN_LINGKUNGAN',
      'INTERNAL_GOVERNANCE',
      'LAINNYA',
    ];
  }

  static get SCOPE_TYPES() {
    return ['RT', 'RW', 'KELURAHAN', 'COMMITTEE'];
  }

  static get STATUSES() {
    return ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'UNDER_REVISION', 'ARCHIVED', 'DEPRECATED'];
  }

  static get TARGET_ROLES() {
    return [
      'PENGURUS_RT',
      'PENGURUS_RW',
      'PETUGAS_RONDA',
      'BENDAHARA',
      'SEKRETARIS',
      'SATGAS_BENCANA',
      'ALL_STAFF',
    ];
  }
}

/**
 * @class Policy
 * @classdesc Represents an internal governance policy, guideline, or Standard Operating Procedure (SOP).
 */
class Policy {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generatePolicyUuid();
    this.policyNumber = data.policyNumber || `SOP-${Date.now()}`;
    this.title = data.title || '';
    this.description = data.description || null;
    this.category = data.category || 'INTERNAL_GOVERNANCE';
    this.scopeType = data.scopeType || 'RT';
    this.scopeId = data.scopeId || '';
    this.targetRole = data.targetRole || 'ALL_STAFF';

    // Lifecycle, Approval & Legal Status
    this.status = data.status || 'DRAFT';
    this.effectiveDate = data.effectiveDate || new Date().toISOString();
    this.reviewDate = data.reviewDate || null;
    this.approvedByCitizenId = data.approvedByCitizenId || null;
    this.approvedAt = data.approvedAt || null;
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
      policyNumber: this.policyNumber,
      title: this.title,
      description: this.description,
      category: this.category,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      targetRole: this.targetRole,
      status: this.status,
      effectiveDate: this.effectiveDate,
      reviewDate: this.reviewDate,
      approvedByCitizenId: this.approvedByCitizenId,
      approvedAt: this.approvedAt,
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
   * Deserializes a raw database record into a Policy entity instance.
   * @param {object} record - Database record.
   * @returns {Policy|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new Policy({ ...record });
  }

  /**
   * Returns a sanitized object for citizen / public view.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      policyNumber: this.policyNumber,
      title: this.title,
      description: this.description,
      category: this.category,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      targetRole: this.targetRole,
      status: this.status,
      effectiveDate: this.effectiveDate,
      reviewDate: this.reviewDate,
      approvedByCitizenId: this.approvedByCitizenId,
      approvedAt: this.approvedAt,
      isPublic: this.isPublic,
      createdAt: this.createdAt,
    };
  }
}

/**
 * @class PolicyProcedure
 * @classdesc Represents an individual procedural step, instruction, or action item within an SOP.
 */
class PolicyProcedure {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generatePolicyUuid();
    this.policyId = data.policyId || '';
    this.stepNumber = typeof data.stepNumber === 'number' ? data.stepNumber : 1;
    this.stepTitle = data.stepTitle || '';
    this.instruction = data.instruction || '';
    this.responsibleRole = data.responsibleRole || null;
    this.estimatedDurationMinutes = typeof data.estimatedDurationMinutes === 'number' ? data.estimatedDurationMinutes : 15;
    this.requiredDocuments = data.requiredDocuments || null;

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
      policyId: this.policyId,
      stepNumber: this.stepNumber,
      stepTitle: this.stepTitle,
      instruction: this.instruction,
      responsibleRole: this.responsibleRole,
      estimatedDurationMinutes: this.estimatedDurationMinutes,
      requiredDocuments: this.requiredDocuments,
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
   * Deserializes a raw database record into a PolicyProcedure entity instance.
   * @param {object} record - Database record.
   * @returns {PolicyProcedure|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new PolicyProcedure({ ...record });
  }

  /**
   * Returns a sanitized object for display.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      policyId: this.policyId,
      stepNumber: this.stepNumber,
      stepTitle: this.stepTitle,
      instruction: this.instruction,
      responsibleRole: this.responsibleRole,
      estimatedDurationMinutes: this.estimatedDurationMinutes,
      requiredDocuments: this.requiredDocuments,
    };
  }
}

module.exports = {
  PolicyConstants,
  Policy,
  PolicyProcedure,
};

