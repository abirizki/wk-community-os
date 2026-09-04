/**
 * @class Aspiration
 * @classdesc Represents a single citizen aspiration, suggestion, or idea.
 */
class Aspiration {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.citizenId = data.citizenId; // Citizen who submitted the aspiration
    this.familyId = data.familyId || null; // Optional: if aspiration is family-related
    this.subject = data.subject; // Short summary of the aspiration
    this.description = data.description; // Detailed description
    this.category = data.category; // e.g., 'INFRASTRUCTURE', 'PUBLIC_SERVICE', 'ENVIRONMENT', 'EDUCATION'
    this.status = data.status || 'SUBMITTED'; // e.g., 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'IMPLEMENTED', 'ARCHIVED'
    this.workflowId = data.workflowId || null; // Reference to the associated Workflow instance
    this.submissionDate = data.submissionDate || new Date().toISOString();
    this.upvotes = data.upvotes || 0; // Community upvotes
    this.downvotes = data.downvotes || 0; // Community downvotes
    this.assignedToId = data.assignedToId || null; // User/role ID of the assignee for review/implementation
    this.assignedToType = data.assignedToType || null; // 'USER' or 'ROLE'
    this.resolutionNotes = data.resolutionNotes || null; // Notes on how the aspiration was addressed
    this.resolutionDate = data.resolutionDate || null;
    this.attachments = data.attachments || []; // Array of attachment IDs/references

    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version || 1;
  }

  /**
   * Returns a plain object representation of the entity for database operations.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      citizenId: this.citizenId,
      familyId: this.familyId,
      subject: this.subject,
      description: this.description,
      category: this.category,
      status: this.status,
      workflowId: this.workflowId,
      submissionDate: this.submissionDate,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      assignedToId: this.assignedToId,
      assignedToType: this.assignedToType,
      resolutionNotes: this.resolutionNotes,
      resolutionDate: this.resolutionDate,
      attachments: JSON.stringify(this.attachments), // Store as JSON string
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
   * Creates an entity instance from a database record.
   * @param {object} record - The database record.
   * @returns {Aspiration|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    try {
      data.attachments = typeof record.attachments === 'string' ? JSON.parse(record.attachments) : (record.attachments || []);
    } catch (e) {
      data.attachments = [];
    }
    return new Aspiration(data);
  }
}