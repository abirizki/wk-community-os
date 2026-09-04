/**
 * @class WorkflowValidator
 * @description Provides validation logic for Workflow data.
 */
class WorkflowValidator {
  /**
   * @param {WorkflowRule} workflowRule - The business rule checker for workflows.
   */
  constructor(workflowRule) {
    /** @private */
    this.rule = workflowRule;
  }

  /**
   * Validates the payload for creating a new workflow instance.
   * @param {object} payload - The data payload.
   * @throws {Error} If validation fails.
   */
  validateForCreate(payload) {
    if (!payload.definitionId) {
      throw new Error('Workflow definition ID is required.');
    }
    if (!payload.contextType) {
      throw new Error('Workflow context type is required.');
    }
    if (!payload.contextId) {
      throw new Error('Workflow context ID is required.');
    }

    this.rule.checkDefinitionExists(payload.definitionId);
    this.rule.checkContextUniqueness(payload.contextType, payload.contextId);
  }

  /**
   * Validates the payload for a state transition.
   * @param {Workflow} workflowInstance - The current workflow instance.
   * @param {string} action - The action being performed (e.g., 'APPROVE', 'REJECT').
   * @throws {Error} If validation fails.
   */
  validateForTransition(workflowInstance, action) {
    if (!action) {
      throw new Error('An action is required to transition a workflow state.');
    }
    this.rule.checkIsActive(workflowInstance);
  }
}