/**
 * @class ComplaintResolutionService
 * @description Manages the resolution process of a complaint, including
 * marking as resolved, citizen confirmation, and closing the complaint.
 */
class ComplaintResolutionService {
  /**
   * @param {ComplaintRepository} complaintRepository
   * @param {ComplaintTimelineService} timelineService
   * @param {WorkflowService} workflowService
   */
  constructor(complaintRepository, timelineService, workflowService) {
    /** @private */
    this.complaintRepository = complaintRepository;
    /** @private */
    this.timelineService = timelineService;
    /** @private */
    this.workflowService = workflowService;
  }

  /**
   * Marks a complaint as resolved by an officer or relevant party.
   * This action typically transitions the complaint's workflow state to 'RESOLVED'.
   * @param {string} complaintId - The ID of the complaint to resolve.
   * @param {string} resolutionDetails - A detailed description of the resolution.
   * @returns {ComplaintEntity} The updated complaint entity.
   * @throws {Error} If complaint not found or not in a resolvable state.
   */
  resolve(complaintId, resolutionDetails) {
    WK.security().checkPermission('complaint.resolve');
    WK.logger().info(`Resolving complaint ${complaintId}.`);

    const complaint = this.complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found.');
    }
    if (complaint.status !== 'IN_PROGRESS' && complaint.status !== 'ASSIGNED') {
      throw new Error(`Complaint is in status '${complaint.status}' and cannot be resolved.`);
    }

    // Update complaint record
    complaint.status = 'RESOLVED';
    complaint.resolutionDetails = resolutionDetails;
    complaint.resolvedAt = new Date().toISOString();
    complaint.updatedAt = new Date().toISOString();

    const updatedComplaint = this.complaintRepository.update(complaintId, complaint);

    // Add to timeline
    this.timelineService.addEntry(complaintId, 'RESOLVED', `Complaint resolved: ${resolutionDetails}`);

    // Update workflow state
    const workflow = this.workflowService.getWorkflowByReferenceId(complaintId);
    if (workflow) {
      this.workflowService.processAction(workflow.id, 'RESOLVE', `Complaint resolved by ${WK.session().getUser().id}`);
    }

    WK.event().publish('Complaint.Resolved', { payload: updatedComplaint });
    WK.audit().log('complaint.resolved', { complaintId, resolutionDetails });

    return updatedComplaint;
  }

  /**
   * Citizen confirms the resolution of their complaint.
   * This action typically transitions the complaint's workflow state to 'CLOSED'.
   * @param {string} complaintId - The ID of the complaint.
   * @param {boolean} confirmed - True if the citizen confirms the resolution, false otherwise.
   * @returns {ComplaintEntity} The updated complaint entity.
   * @throws {Error} If complaint not found or not in a resolvable state.
   */
  confirm(complaintId, confirmed) {
    WK.security().checkPermission('complaint.confirm_resolution'); // Citizen permission
    WK.logger().info(`Citizen confirming resolution for complaint ${complaintId}. Confirmed: ${confirmed}`);

    const complaint = this.complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found.');
    }
    if (complaint.status !== 'RESOLVED') {
      throw new Error(`Complaint is in status '${complaint.status}' and cannot be confirmed.`);
    }

    complaint.citizenConfirmation = confirmed ? 'CONFIRMED' : 'REJECTED';
    complaint.status = confirmed ? 'CLOSED' : 'IN_PROGRESS'; // Reopen if not confirmed
    complaint.closedAt = confirmed ? new Date().toISOString() : null;
    complaint.updatedAt = new Date().toISOString();

    const updatedComplaint = this.complaintRepository.update(complaintId, complaint);
    this.timelineService.addEntry(complaintId, confirmed ? 'CONFIRMED_BY_CITIZEN' : 'REJECTED_BY_CITIZEN', `Citizen ${confirmed ? 'confirmed' : 'rejected'} resolution.`);

    const workflow = this.workflowService.getWorkflowByReferenceId(complaintId);
    if (workflow) {
      this.workflowService.processAction(workflow.id, confirmed ? 'CONFIRM' : 'REJECT_CONFIRMATION', `Citizen ${confirmed ? 'confirmed' : 'rejected'} resolution.`);
    }

    WK.event().publish(confirmed ? 'Complaint.Closed' : 'Complaint.Reopened', { payload: updatedComplaint });
    WK.audit().log(confirmed ? 'complaint.closed' : 'complaint.reopened', { complaintId, confirmed });

    return updatedComplaint;
  }
}