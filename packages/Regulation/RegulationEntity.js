/**
 * @file RegulationEntity.js
 * @description Core Entity Layer for Regulation Module (Epic Governance / Package P22) in Warga Kebonjati (WK COMMUNITY OS).
 * Encapsulates domain models for codified community regulations, articles, and sanctions.
 */

// Helper to generate UUID compatible with Google Apps Script Utilities and standard Node environments
function generateRegulationUuid() {
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
 * @class RegulationConstants
 * @classdesc Enumerations, categories, and lookup constants for the Regulation module.
 */
class RegulationConstants {
  static get CATEGORIES() {
    return [
      'TATA_TERTIB',
      'KETERTIBAN_KEAMANAN',
      'PENGELOLAAN_SAMPAH_LINGKUNGAN',
      'PEMANFAATAN_FASUM',
      'ADMINISTRASI_WARGA',
      'LAINNYA',
    ];
  }

  static get SCOPE_TYPES() {
    return ['RT', 'RW', 'KELURAHAN'];
  }

  static get STATUSES() {
    return ['DRAFT', 'UNDER_REVIEW', 'ENACTED', 'SUPERSEDED', 'REVOKED'];
  }
}

/**
 * @class Regulation
 * @classdesc Represents an official codified community regulation, ordinance, or statute.
 */
class Regulation {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateRegulationUuid();
    this.regulationNumber = data.regulationNumber || `PER-${Date.now()}`;
    this.title = data.title || '';
    this.description = data.description || null;
    this.category = data.category || 'LAINNYA';
    this.scopeType = data.scopeType || 'RT';
    this.scopeId = data.scopeId || '';
    this.decisionId = data.decisionId || null;

    // Lifecycle & Legal Status
    this.status = data.status || 'DRAFT';
    this.enactedDate = data.enactedDate || null;
    this.effectiveDate = data.effectiveDate || new Date().toISOString();
    this.expiryDate = data.expiryDate || null;
    this.signatoryCitizenId = data.signatoryCitizenId || null;
    this.supersededByRegulationId = data.supersededByRegulationId || null;
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
      regulationNumber: this.regulationNumber,
      title: this.title,
      description: this.description,
      category: this.category,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      decisionId: this.decisionId,
      status: this.status,
      enactedDate: this.enactedDate,
      effectiveDate: this.effectiveDate,
      expiryDate: this.expiryDate,
      signatoryCitizenId: this.signatoryCitizenId,
      supersededByRegulationId: this.supersededByRegulationId,
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
   * Deserializes a raw database record into a Regulation entity instance.
   * @param {object} record - Database record.
   * @returns {Regulation|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new Regulation({ ...record });
  }

  /**
   * Returns a sanitized object for citizen view.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      regulationNumber: this.regulationNumber,
      title: this.title,
      description: this.description,
      category: this.category,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      decisionId: this.decisionId,
      status: this.status,
      enactedDate: this.enactedDate,
      effectiveDate: this.effectiveDate,
      expiryDate: this.expiryDate,
      signatoryCitizenId: this.signatoryCitizenId,
      supersededByRegulationId: this.supersededByRegulationId,
      isPublic: this.isPublic,
      createdAt: this.createdAt,
    };
  }
}

/**
 * @class RegulationArticle
 * @classdesc Represents an article, chapter, clause, or penalty provision within a regulation.
 */
class RegulationArticle {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateRegulationUuid();
    this.regulationId = data.regulationId || '';
    this.chapter = data.chapter || null;
    this.articleNumber = typeof data.articleNumber === 'number' ? data.articleNumber : 1;
    this.title = data.title || '';
    this.content = data.content || '';
    this.sanctionDescription = data.sanctionDescription || null;
    this.displayOrder = typeof data.displayOrder === 'number' ? data.displayOrder : 1;

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
      regulationId: this.regulationId,
      chapter: this.chapter,
      articleNumber: this.articleNumber,
      title: this.title,
      content: this.content,
      sanctionDescription: this.sanctionDescription,
      displayOrder: this.displayOrder,
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
   * Deserializes a raw database record into a RegulationArticle entity instance.
   * @param {object} record - Database record.
   * @returns {RegulationArticle|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new RegulationArticle({ ...record });
  }

  /**
   * Returns a sanitized object for display.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      regulationId: this.regulationId,
      chapter: this.chapter,
      articleNumber: this.articleNumber,
      title: this.title,
      content: this.content,
      sanctionDescription: this.sanctionDescription,
      displayOrder: this.displayOrder,
    };
  }
}

module.exports = {
  RegulationConstants,
  Regulation,
  RegulationArticle,
};

