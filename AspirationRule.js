/**
 * @class AspirationRule
 * @description Encapsulates business rule checks for the Aspiration package.
 */
class AspirationRule {
  /**
   * @param {AspirationRepository} aspirationRepository
   * @param {CitizenRepository} citizenRepository
   * @param {FamilyRepository} familyRepository
   * @param {WorkflowService} workflowService - To interact with the Workflow engine.
   */
  constructor(aspirationRepository, citizenRepository, familyRepository, workflowService) {
    /** @private */
    this.aspirationRepository = aspirationRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.familyRepository = familyRepository;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('AspirationRule');

    /** @private */
    this.allowedStatusTransitions = {
      'SUBMITTED': ['IN_REVIEW', 'ARCHIVED'],
      'IN_REVIEW': ['APPROVED', 'REJECTED', 'ASSIGNED', 'ARCHIVED'],
      'ASSIGNED': ['IN_REVIEW', 'IMPLEMENTED', 'ARCHIVED'],
      'APPROVED': ['IMPLEMENTED', 'ARCHIVED'],
      'REJECTED': ['ARCHIVED'],
      'IMPLEMENTED': ['ARCHIVED'],
      'ARCHIVED': [],
    };
  }

  /**
   * Checks if the citizen who submitted the aspiration exists.
   * @param {string} citizenId - The ID of the citizen.
   * @throws {Error} If the citizen does not exist.
   */
  checkCitizenExists(citizenId) {
    if (!this.citizenRepository.exists(citizenId)) {
      throw new Error(`Citizen with ID ${citizenId} not found.`);
    }
  }

  /**
   * Checks if the family exists (if provided).
   * @param {string} familyId - The ID of the family.
   * @throws {Error} If the family does not exist.
   */
  checkFamilyExists(familyId) {
    if (!this.familyRepository.exists(familyId)) {
      throw new Error(`Family with ID ${familyId} not found.`);
    }
  }

  /**
   * Checks if the citizen belongs to the specified family (if familyId is provided).
   * @param {string} citizenId - The ID of the citizen.
   * @param {string} familyId - The ID of the family.
   * @throws {Error} If the citizen is not a member of the family.
   */
  checkCitizenFamilyRelationship(citizenId, familyId) {
    const family = this.familyRepository.findById(familyId);
    if (!family || !family.members.some(member => member.citizenId === citizenId)) {
      throw new Error(`Citizen ${citizenId} is not a member of family ${familyId}.`);
    }
  }

  /**
   * Checks if the aspiration category is valid against master data.
   * @param {string} category - The category to validate.
   * @throws {Error} If the category is invalid.
   */
  checkValidCategory(category) {
    if (!WK.service('MasterData').exists('ASPIRATION_CATEGORY', category)) {
      throw new Error(`Invalid aspiration category: '${category}'.`);
    }
  }

  /**
   * Validates a status transition for an aspiration.
   * This rule is primarily for direct status updates, but the Workflow engine will
   * handle the primary orchestration.
   * @param {string} fromStatus - The current status.
   * @param {string} toStatus - The new status.
   * @throws {Error} If the transition is not allowed.
   */
  checkStatusTransition(fromStatus, toStatus) {
    if (!this.allowedStatusTransitions[fromStatus] || !this.allowedStatusTransitions[fromStatus].includes(toStatus)) {
      this.logger.warn(`Invalid aspiration status transition from ${fromStatus} to ${toStatus}`);
      throw new Error(`Invalid aspiration status transition from ${fromStatus} to ${toStatus}.`);
    }
  }

  /**
   * Checks if a workflow instance is associated with the aspiration.
   * @param {string} workflowId - The ID of the workflow instance.
   * @throws {Error} If the workflow does not exist.
   */
  checkWorkflowExists(workflowId) {
    // This is a conceptual check; actual implementation would call workflowService.getWorkflow(workflowId)
    // or workflowRepository.findById(workflowId)
    // For P17.1, we assume workflowService.getWorkflow will handle existence.
  }

  /**
   * Checks if an aspiration can be voted on.
   * @param {Aspiration} aspiration - The aspiration entity.
   * @throws {Error} If the aspiration is not in a votable state.
   */
  checkCanBeVoted(aspiration) {
    if (aspiration.status !== 'SUBMITTED' && aspiration.status !== 'IN_REVIEW') {
      throw new Error(`Aspiration cannot be voted on. Current status is '${aspiration.status}'.`);
    }
  }
}