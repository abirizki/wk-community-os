/**
 * @class Workflow
 * @classdesc Represents a single, stateful instance of a business process workflow.
 */
class Workflow {
  /**
   * @param {object} data - The data to populate the entity.
   */
  constructor(data) {
    // Identity and Definition
    this.id = data.id;
    this.definitionId = data.definitionId; // e.g., 'LETTER_APPROVAL_V1', 'COMPLAINT_RESOLUTION_V1'

    // Business Context
    this.contextType = data.contextType; // e.g., 'Letter', 'AdministrativeService'
    this.contextId = data.contextId; // The ID of the specific letter or service request

    // State Management
    this.status = data.status || 'IN_PROGRESS'; // Overall status: 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'
    this.currentState = data.currentState; // The current step/state name, e.g., 'RT_APPROVAL'
    this.previousState = data.previousState || null;

    // Assignment and Ownership
    this.assigneeId = data.assigneeId || null; // Can be a userId or roleId
    this.assigneeType = data.assigneeType || null; // 'USER' or 'ROLE'

    // Audit and History
    this.history = data.history || []; // Array of transition history objects
    this.variables = data.variables || {}; // A key-value store for process-specific data

    // Timestamps and Control
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
    this.version = data.version || 1;
  }

  /**
   * Adds a new entry to the workflow's history log.
   * @param {object} transition - The transition details.
   */
  addHistory(transition) {
    this.history.push({
      from: transition.from,
      to: transition.to,
      action: transition.action,
      actorId: transition.actorId,
      timestamp: new Date().toISOString(),
      notes: transition.notes || null,
    });
  }

  /**
   * Returns a plain object representation of the entity for database operations.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      definitionId: this.definitionId,
      contextType: this.contextType,
      contextId: this.contextId,
      status: this.status,
      currentState: this.currentState,
      previousState: this.previousState,
      assigneeId: this.assigneeId,
      assigneeType: this.assigneeType,
      history: JSON.stringify(this.history),
      variables: JSON.stringify(this.variables),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      version: this.version,
    };
  }

  /**
   * Creates an entity instance from a database record.
   * @param {object} record - The database record.
   * @returns {Workflow|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    try {
      data.history = typeof record.history === 'string' ? JSON.parse(record.history) : (record.history || []);
    } catch (e) {
      data.history = [];
    }
    try {
      data.variables = typeof record.variables === 'string' ? JSON.parse(record.variables) : (record.variables || {});
    } catch (e) {
      data.variables = {};
    }
    return new Workflow(data);
  }
}