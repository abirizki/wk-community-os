/**
 * @class ComplaintService
 * @description Contains all business logic for the Complaint module.
 * It orchestrates repositories, validators, and other services to manage the complaint lifecycle.
 */
class ComplaintService {
  /**
   * @param {ComplaintRepository} complaintRepository
   * @param {ComplaintValidator} complaintValidator
   * @param {ComplaintCategoryService} categoryService
   * @param {ComplaintAttachmentService} attachmentService
   * @param {ComplaintAssignmentService} assignmentService
   * @param {ComplaintResolutionService} resolutionService
   * @param {ComplaintTimelineService} timelineService
   * @param {WorkflowService} workflowService
   * @param {CitizenService} citizenService
   * @param {HouseholdService} householdService
   */
  constructor(
    complaintRepository,
    complaintValidator,
    categoryService,
    attachmentService,
    assignmentService,
    resolutionService,
    timelineService,
    workflowService,
    citizenService,
    householdService
  ) {
    /** @private */
    this.complaintRepository = complaintRepository;
    /** @private */
    this.complaintValidator = complaintValidator;
    /** @private */
    this.categoryService = categoryService;
    /** @private */
    this.attachmentService = attachmentService;
    /** @private */
    this.assignmentService = assignmentService;
    /** @private */
    this.resolutionService = resolutionService;
    /** @private */
    this.timelineService = timelineService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.citizenService = citizenService;
    /** @private */
    this.householdService = householdService;
  }

  /**
   * Creates a new complaint submitted by a citizen.
   * This initiates a new workflow instance for the complaint.
   * @param {object} complaintData - The data for the new complaint.
   * @param {string} complaintData.citizenId - ID of the submitting citizen.
   * @param {string} complaintData.category - Complaint category.
   * @param {string} complaintData.title - Complaint title.
   * @param {string} complaintData.description - Complaint description.
   * @param {string} complaintData.location - Location description.
   * @param {object[]} [complaintData.attachments=[]] - Array of attachment data.
   * @returns {ComplaintEntity} The newly created complaint entity.
   * @throws {Error} If validation fails.
   */
  createComplaint(complaintData) {
    WK.security().checkPermission('complaint.create');
    WK.logger().info(`Citizen ${complaintData.citizenId} submitting new complaint.`);

    const validation = this.complaintValidator.forCreate(complaintData);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    const citizen = this.citizenService.getCitizenById(complaintData.citizenId);
    if (!citizen) {
      throw new Error('Submitting citizen not found.');
    }

    const newComplaint = new ComplaintEntity({
      id: WK.helper().generateUuid(),
      trackingNumber: this._generateTrackingNumber(),
      citizenId: complaintData.citizenId,
      householdId: citizen.householdId,
      category: complaintData.category,
      subCategory: complaintData.subCategory || null,
      title: complaintData.title,
      description: complaintData.description,
      location: complaintData.location,
      coordinates: complaintData.coordinates || null,
      priority: complaintData.priority || 'MEDIUM',
      status: 'SUBMITTED',
      attachments: complaintData.attachments, // Handled by attachmentService later
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString()
    });

    const createdComplaint = this.complaintRepository.create(newComplaint);

    // Start workflow for this complaint
    this.workflowService.startWorkflow(
      'COMPLAINT_RESOLUTION',
      createdComplaint.id,
      createdComplaint.citizenId,
      {
        complaintCategory: createdComplaint.category,
        citizenRT: citizen.address.rt,
        citizenRW: citizen.address.rw
      }
    );

    this.timelineService.addEntry(createdComplaint.id, 'SUBMITTED', 'Complaint submitted by citizen.');
    WK.event().publish('Complaint.Created', { payload: createdComplaint });

    return createdComplaint;
  }

  /**
   * Retrieves a complaint by its ID, including its timeline.
   * @param {string} complaintId - The ID of the complaint.
   * @returns {ComplaintEntity|null} The complaint entity with timeline.
   */
  getComplaintById(complaintId) {
    WK.security().checkPermission('complaint.view');
    const complaint = this.complaintRepository.findById(complaintId);
    if (complaint) {
      complaint.timeline = this.timelineService.getTimelineForComplaint(complaintId);
      complaint.citizen = this.citizenService.getCitizenById(complaint.citizenId);
      complaint.household = this.householdService.getHouseholdById(complaint.householdId);
    }
    return complaint;
  }

  /**
   * Retrieves a complaint by its public tracking number.
   * @param {string} trackingNumber - The public tracking number.
   * @returns {ComplaintEntity|null} The complaint entity with timeline.
   */
  getComplaintByTrackingNumber(trackingNumber) {
    // No permission check here, as this is for public tracking
    const complaint = this.complaintRepository.findByTrackingNumber(trackingNumber);
    if (complaint) {
      complaint.timeline = this.timelineService.getTimelineForComplaint(complaint.id);
    }
    return complaint;
  }

  /**
   * Updates the status of a complaint based on a workflow action.
   * This method is typically called by the WorkflowService.
   * @param {string} complaintId - The ID of the complaint.
   * @param {string} newStatus - The new status of the complaint.
   * @param {string} [comment=''] - Optional comment for the timeline.
   * @param {string|null} [assignedToUserId=null] - Optional user ID if assigned.
   * @param {string|null} [assignedToRoleId=null] - Optional role ID if assigned.
   * @returns {ComplaintEntity} The updated complaint entity.
   */
  updateComplaintStatus(complaintId, newStatus, comment = '', assignedToUserId = null, assignedToRoleId = null) {
    const complaint = this.complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    const oldStatus = complaint.status;
    complaint.status = newStatus;
    complaint.updatedAt = new Date().toISOString();

    if (assignedToUserId) complaint.assignedToUserId = assignedToUserId;
    if (assignedToRoleId) complaint.assignedToRoleId = assignedToRoleId;
    if (newStatus === 'RESOLVED') complaint.resolvedAt = new Date().toISOString();
    if (newStatus === 'CLOSED') complaint.closedAt = new Date().toISOString();

    const updatedComplaint = this.complaintRepository.update(complaintId, complaint);
    this.timelineService.addEntry(complaintId, newStatus, comment);

    WK.event().publish(`Complaint.${newStatus}`, { payload: updatedComplaint, oldStatus: oldStatus });
    WK.audit().log('complaint.status_updated', { complaintId, oldStatus, newStatus });

    return updatedComplaint;
  }

  /**
   * Resolves a complaint with details.
   * @param {string} complaintId - The ID of the complaint.
   * @param {string} resolutionDetails - Details of how the complaint was resolved.
   * @returns {ComplaintEntity} The updated complaint.
   */
  resolveComplaint(complaintId, resolutionDetails) {
    WK.security().checkPermission('complaint.resolve');
    return this.resolutionService.resolve(complaintId, resolutionDetails);
  }

  /**
   * Citizen confirms the resolution of their complaint.
   * @param {string} complaintId - The ID of the complaint.
   * @param {boolean} confirmed - True if confirmed, false if not satisfied.
   * @returns {ComplaintEntity} The updated complaint.
   */
  confirmResolution(complaintId, confirmed) {
    WK.security().checkPermission('complaint.confirm_resolution');
    return this.resolutionService.confirm(complaintId, confirmed);
  }

  /**
   * Generates a unique tracking number for a complaint.
   * @private
   * @returns {string} A unique tracking number.
   */
  _generateTrackingNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random alphanumeric chars
    return `CMP-${year}${month}${day}-${random}`;
  }
}