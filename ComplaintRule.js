/**
 * @class ComplaintRule
 * @description Encapsulates business rule checks for the Complaint package.
 */
class ComplaintRule {
  /**
   * @param {ComplaintRepository} complaintRepository
   * @param {CitizenRepository} citizenRepository
   * @param {FamilyRepository} familyRepository
   * @param {WorkflowService} workflowService - To interact with the Workflow engine.
   */
  constructor(complaintRepository, citizenRepository, familyRepository, workflowService) {
    /** @private */
    this.complaintRepository = complaintRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.familyRepository = familyRepository;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('ComplaintRule');

    /** @private */
    this.allowedStatusTransitions = {
      'SUBMITTED': ['IN_REVIEW', 'REJECTED', 'CANCELLED'],
      'IN_REVIEW': ['ASSIGNED', 'RESOLVED', 'REJECTED', 'CANCELLED'],
      'ASSIGNED': ['IN_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED'],
      'RESOLVED': ['CLOSED', 'REOPENED'],
      'REJECTED': ['CLOSED'],
      'CANCELLED': ['CLOSED'],
      'CLOSED': ['REOPENED'],
      'REOPENED': ['IN_REVIEW', 'ASSIGNED'],
    };
  }

  /**
   * Checks if the citizen who filed the complaint exists.
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
   * Checks if the complaint category is valid against master data.
   * @param {string} category - The category to validate.
   * @throws {Error} If the category is invalid.
   */
  checkValidCategory(category) {
    if (!WK.service('MasterData').exists('COMPLAINT_CATEGORY', category)) {
      throw new Error(`Invalid complaint category: '${category}'.`);
    }
  }

  /**
   * Checks if the complaint priority is valid against master data.
   * @param {string} priority - The priority to validate.
   * @throws {Error} If the priority is invalid.
   */
  checkValidPriority(priority) {
    if (!WK.service('MasterData').exists('COMPLAINT_PRIORITY', priority)) {
      throw new Error(`Invalid complaint priority: '${priority}'.`);
    }
  }

  /**
   * Validates a status transition for a complaint.
   * This rule is primarily for direct status updates, but the Workflow engine will
   * handle the primary orchestration.
   * @param {string} fromStatus - The current status.
   * @param {string} toStatus - The new status.
   * @throws {Error} If the transition is not allowed.
   */
  checkStatusTransition(fromStatus, toStatus) {
    if (!this.allowedStatusTransitions[fromStatus] || !this.allowedStatusTransitions[fromStatus].includes(toStatus)) {
      this.logger.warn(`Invalid complaint status transition from ${fromStatus} to ${toStatus}`);
      throw new Error(`Invalid complaint status transition from ${fromStatus} to ${toStatus}.`);
    }
  }

  /**
   * Checks if a workflow instance is associated with the complaint.
   * @param {string} workflowId - The ID of the workflow instance.
   * @throws {Error} If the workflow does not exist.
   */
  checkWorkflowExists(workflowId) {
    // This is a conceptual check; actual implementation would call workflowService.getWorkflow(workflowId)
    // or workflowRepository.findById(workflowId)
    // For P16.1, we assume workflowService.getWorkflow will handle existence.
  }
}