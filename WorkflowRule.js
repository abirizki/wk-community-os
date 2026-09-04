/**
 * @class WorkflowRule
 * @description Encapsulates business rule checks for the Workflow package.
 */
class WorkflowRule {
  /**
   * @param {WorkflowRepository} workflowRepository
   * @param {WorkflowDefinitionProvider} definitionProvider - A service to get workflow definitions.
   */
  constructor(workflowRepository, definitionProvider) {
    /** @private */
    this.repository = workflowRepository;
    /** @private */
    this.definitionProvider = definitionProvider;
    /** @private */
    this.logger = WK.logger('WorkflowRule');
  }

  /**
   * Checks if the workflow definition exists and is valid.
   * @param {string} definitionId - The ID of the workflow definition.
   * @throws {Error} If the definition does not exist.
   */
  checkDefinitionExists(definitionId) {
    const definition = this.definitionProvider.getDefinition(definitionId);
    if (!definition) {
      throw new Error(`Workflow definition with ID '${definitionId}' not found.`);
    }
  }

  /**
   * Checks if an active workflow already exists for the given business context.
   * @param {string} contextType - The type of the business entity.
   * @param {string} contextId - The ID of the business entity.
   * @throws {Error} If an active workflow already exists.
   */
  checkContextUniqueness(contextType, contextId) {
    const existingWorkflow = this.repository.findActiveByContext(contextType, contextId);
    if (existingWorkflow) {
      throw new Error(`An active workflow already exists for ${contextType} ID ${contextId}.`);
    }
  }

  /**
   * Checks if the workflow is in an active (non-terminal) state.
   * @param {Workflow} workflowInstance - The workflow instance to check.
   * @throws {Error} If the workflow is in a terminal state.
   */
  checkIsActive(workflowInstance) {
    const terminalStates = ['COMPLETED', 'CANCELLED', 'FAILED'];
    if (terminalStates.includes(workflowInstance.status)) {
      throw new Error(`Workflow is in a terminal state ('${workflowInstance.status}') and cannot be transitioned.`);
    }
  }

  /**
   * Validates a state transition against the workflow definition.
   * @param {Workflow} workflowInstance - The current workflow instance.
   * @param {string} action - The action being performed.
   * @returns {string} The name of the next state.
   * @throws {Error} If the transition is not allowed.
   */
  getValidNextState(workflowInstance, action) {
    const definition = this.definitionProvider.getDefinition(workflowInstance.definitionId);
    if (!definition) {
      throw new Error(`Could not find definition for workflow ${workflowInstance.id}.`);
    }

    const currentStateDefinition = definition.states[workflowInstance.currentState];
    if (!currentStateDefinition) {
      throw new Error(`Current state '${workflowInstance.currentState}' not found in definition '${definition.id}'.`);
    }

    const transition = currentStateDefinition.on[action];
    if (!transition) {
      throw new Error(`Action '${action}' is not valid for the current state '${workflowInstance.currentState}'.`);
    }

    // Further checks can be added here, e.g., based on user role
    // this.checkActorPermissionForTransition(WK.user(), transition.allowedRoles);

    return transition.target;
  }

  /**
   * Checks if the current user has permission to perform a transition.
   * @param {object} user - The current user object from WK.user().
   * @param {string[]} allowedRoles - An array of roles allowed to perform the transition.
   * @throws {Error} If the user does not have the required role.
   */
  checkActorPermissionForTransition(user, allowedRoles) {
    if (!allowedRoles || allowedRoles.length === 0) {
      return; // No specific roles required
    }

    const userRoles = user.roles || [];
    const hasPermission = userRoles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      throw new Error(`User does not have the required role to perform this action. Required one of: ${allowedRoles.join(', ')}.`);
    }
  }
}