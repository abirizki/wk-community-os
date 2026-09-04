/**
 * @class WorkflowPermission
 * @description Defines all permissions related to the Workflow package.
 */
class WorkflowPermission {
  /**
   * Returns an array of permission definitions for the Workflow module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const instance = 'workflow.instance';
    const definition = 'workflow.definition';

    return [
      // Instance Permissions
      { id: `${instance}.create`, description: 'Create a new workflow instance' },
      { id: `${instance}.read.own`, description: 'Read own assigned workflow instances' },
      { id: `${instance}.read.all`, description: 'Read any workflow instance' },
      { id: `${instance}.transition`, description: 'Perform a state transition on a workflow (e.g., approve, reject)' },
      { id: `${instance}.assign`, description: 'Assign a workflow task to a user or role' },
      { id: `${instance}.cancel`, description: 'Cancel an in-progress workflow instance' },

      // Definition & Management Permissions
      { id: `${definition}.manage`, description: 'Create, update, or delete workflow definitions' },
      { id: 'workflow.dashboard.view', description: 'View the main workflow dashboard' },
      { id: 'workflow.statistics.view', description: 'View workflow statistics' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 */
function registerWorkflowPermissions() {
  WK.permission('workflow', WorkflowPermission.getPermissions());
}