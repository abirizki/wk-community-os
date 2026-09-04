/**
 * @class WorkflowService
 * @description The main service for orchestrating business process workflow instances.
 */
class WorkflowService {
  /**
   * @param {WorkflowRepository} workflowRepository
   * @param {WorkflowValidator} workflowValidator
   * @param {WorkflowRule} workflowRule
   * @param {WorkflowDefinitionProvider} definitionProvider
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(workflowRepository, workflowValidator, workflowRule, definitionProvider, eventBus, analyticsService) {
    /** @private */
    this.repository = workflowRepository;
    /** @private */
    this.validator = workflowValidator;
    /** @private */
    this.rule = workflowRule;
    /** @private */
    this.definitionProvider = definitionProvider;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('WorkflowService');
  }

  /**
   * Starts a new workflow instance based on a definition.
   * @param {object} payload - The data to start the workflow. Must include definitionId, contextType, and contextId.
   * @returns {Workflow} The newly created workflow instance.
   */
  startWorkflow(payload) {
    WK.security().checkPermission('workflow.instance.create');
    this.logger.info(`Attempting to start workflow '${payload.definitionId}' for ${payload.contextType}:${payload.contextId}`);

    this.validator.validateForCreate(payload);

    const definition = this.definitionProvider.getDefinition(payload.definitionId);
    const initialState = definition.initialState;

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      currentState: initialState,
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const workflowEntity = new Workflow(entityData);
    workflowEntity.addHistory({
      from: null,
      to: initialState,
      action: 'START',
      actorId: currentUser.id,
    });

    const createdRecord = this.repository.create(workflowEntity);

    this.eventBus.publish('WorkflowStarted', {
      source: 'WorkflowService',
      payload: createdRecord,
    });

    this.analyticsService.track('workflow_started', {
      workflowId: createdRecord.id,
      definitionId: createdRecord.definitionId,
    });

    this.logger.info(`Successfully started workflow ${createdRecord.id}`);
    return createdRecord;
  }

  /**
   * Retrieves a single workflow instance by its ID.
   * @param {string} id - The ID of the workflow instance.
   * @returns {Workflow}
   */
  getWorkflow(id) {
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Workflow instance with ID ${id} not found.`);
    }

    const security = WK.security();
    if (!security.hasPermission('workflow.instance.read.all')) {
      security.checkPermission('workflow.instance.read.own');
      if (record.assigneeId !== WK.user().id) {
        throw new Error('Access denied. You can only view workflows assigned to you.');
      }
    }

    return record;
  }

  /**
   * Transitions a workflow instance to a new state by performing an action.
   * @param {string} workflowId - The ID of the workflow instance to transition.
   * @param {string} action - The action to perform (e.g., 'APPROVE', 'REJECT', 'SUBMIT').
   * @param {object} [context={}] - Additional context for the transition (e.g., notes, variables).
   * @returns {Workflow} The updated workflow instance.
   */
  transition(workflowId, action, context = {}) {
    WK.security().checkPermission('workflow.instance.transition');
    this.logger.info(`Attempting to transition workflow ${workflowId} with action '${action}'`);

    const instance = this.getWorkflow(workflowId);
    this.validator.validateForTransition(instance, action);

    const nextState = this.rule.getValidNextState(instance, action);
    const definition = this.definitionProvider.getDefinition(instance.definitionId);
    const nextStateDefinition = definition.states[nextState];

    const currentUser = WK.user();
    const updatePayload = {
      previousState: instance.currentState,
      currentState: nextState,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
    };

    instance.addHistory({
      from: instance.currentState,
      to: nextState,
      action: action,
      actorId: currentUser.id,
      notes: context.notes || null,
    });
    updatePayload.history = instance.history;

    // Check if the new state is a terminal state
    if (nextStateDefinition.type === 'terminal') {
      updatePayload.status = nextStateDefinition.status; // e.g., 'COMPLETED', 'CANCELLED'
      updatePayload.completedAt = new Date().toISOString();
    }

    const updatedRecord = this.repository.update(workflowId, updatePayload);

    this.eventBus.publish('WorkflowTransitioned', {
      source: 'WorkflowService',
      payload: {
        workflow: updatedRecord,
        transition: { from: instance.currentState, to: nextState, action },
      },
    });

    this.analyticsService.track('workflow_transitioned', {
      workflowId: workflowId,
      definitionId: instance.definitionId,
      fromState: instance.currentState,
      toState: nextState,
      action: action,
    });

    this.logger.info(`Successfully transitioned workflow ${workflowId} to state '${nextState}'`);
    return updatedRecord;
  }

  /**
   * Assigns a workflow instance to a user or role.
   * @param {string} workflowId - The ID of the workflow instance.
   * @param {string} assigneeId - The ID of the user or role.
   * @param {string} assigneeType - The type of assignee ('USER' or 'ROLE').
   * @returns {Workflow} The updated workflow instance.
   */
  assign(workflowId, assigneeId, assigneeType) {
    WK.security().checkPermission('workflow.instance.assign');
    this.logger.info(`Assigning workflow ${workflowId} to ${assigneeType}:${assigneeId}`);

    const instance = this.getWorkflow(workflowId);
    this.rule.checkIsActive(instance);

    const updatePayload = {
      assigneeId,
      assigneeType,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(workflowId, updatePayload);

    this.eventBus.publish('WorkflowAssigned', {
      source: 'WorkflowService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }

  /**
   * Cancels an in-progress workflow instance.
   * @param {string} workflowId - The ID of the workflow instance.
   * @param {string} reason - The reason for cancellation.
   * @returns {Workflow} The updated, cancelled workflow instance.
   */
  cancel(workflowId, reason) {
    WK.security().checkPermission('workflow.instance.cancel');
    this.logger.warn(`Attempting to cancel workflow ${workflowId} for reason: ${reason}`);

    if (!reason) {
      throw new Error('A reason is required to cancel a workflow.');
    }

    // Use the generic transition method to handle cancellation if defined in the workflow
    // This ensures all rules and history logging are consistent.
    return this.transition(workflowId, 'CANCEL', { notes: reason });
  }

  /**
   * Searches for workflow instances.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Workflow[]}
   */
  searchWorkflows(query, options) {
    WK.security().checkPermission('workflow.instance.read.all');
    return this.repository.search(query, options);
  }
}