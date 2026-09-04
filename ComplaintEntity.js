/**
 * @class Complaint
 * @classdesc Represents a single citizen complaint.
 */
class Complaint {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    this.id = data.id;
    this.citizenId = data.citizenId; // Citizen who filed the complaint
    this.familyId = data.familyId || null; // Optional: if complaint is family-related
    this.subject = data.subject; // Short summary of the complaint
    this.description = data.description; // Detailed description
    this.category = data.category; // e.g., 'INFRASTRUCTURE', 'PUBLIC_SERVICE', 'ENVIRONMENT'
    this.priority = data.priority || 'MEDIUM'; // e.g., 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    this.status = data.status || 'SUBMITTED'; // e.g., 'SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'RESOLVED', 'REJECTED', 'CLOSED'
    this.workflowId = data.workflowId || null; // Reference to the associated Workflow instance
    this.submissionDate = data.submissionDate || new Date().toISOString();
    this.assignedToId = data.assignedToId || null; // User/role ID of the assignee
    this.assignedToType = data.assignedToType || null; // 'USER' or 'ROLE'
    this.resolutionNotes = data.resolutionNotes || null;
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
      priority: this.priority,
      status: this.status,
      workflowId: this.workflowId,
      submissionDate: this.submissionDate,
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
   * @returns {Complaint|null}
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
    return new Complaint(data);
  }
}