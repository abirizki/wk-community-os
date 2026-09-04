/**
 * @class ComplaintAssignmentService
 * @description Manages the assignment of complaints to specific users (officers) or roles.
 */
class ComplaintAssignmentService {
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
   * Assigns a complaint to a specific user (officer) or a role.
   * This action typically transitions the complaint's workflow state.
   * @param {string} complaintId - The ID of the complaint to assign.
   * @param {string|null} userId - The ID of the user to assign to (optional).
   * @param {string|null} roleId - The ID of the role to assign to (optional).
   * @param {string} [comment=''] - Optional comment for the assignment.
   * @returns {ComplaintEntity} The updated complaint entity.
   * @throws {Error} If complaint not found or permission denied.
   */
  assignComplaint(complaintId, userId = null, roleId = null, comment = '') {
    WK.security().checkPermission('complaint.assign');
    WK.logger().info(`Assigning complaint ${complaintId} to user ${userId || 'N/A'} / role ${roleId || 'N/A'}`);

    const complaint = this.complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    // Update complaint record
    complaint.assignedToUserId = userId;
    complaint.assignedToRoleId = roleId;
    complaint.updatedAt = new Date().toISOString();

    const updatedComplaint = this.complaintRepository.update(complaintId, complaint);

    // Add to timeline
    const assignmentComment = comment || `Complaint assigned to ${userId ? `user ${userId}` : `role ${roleId}`}.`;
    this.timelineService.addEntry(complaintId, 'ASSIGNED', assignmentComment);

    // Update workflow state (e.g., from VERIFIED to ASSIGNED or IN_PROGRESS)
    // This assumes the workflow definition allows this transition.
    const workflow = this.workflowService.getWorkflowByReferenceId(complaintId);
    if (workflow) {
      this.workflowService.processAction(workflow.id, 'ASSIGN', assignmentComment);
    } else {
      WK.logger().warn(`No active workflow found for complaint ${complaintId} during assignment.`);
    }

    WK.event().publish('Complaint.Assigned', { payload: updatedComplaint, assignedTo: { userId, roleId } });
    WK.audit().log('complaint.assigned', { complaintId, assignedToUserId: userId, assignedToRoleId: roleId });

    return updatedComplaint;
  }

  /**
   * Retrieves the current assignment details for a complaint.
   * @param {string} complaintId - The ID of the complaint.
   * @returns {object|null} An object with userId and roleId, or null if not assigned.
   */
  getAssignment(complaintId) {
    WK.security().checkPermission('complaint.view.assigned');
    const complaint = this.complaintRepository.findById(complaintId);
    if (complaint) {
      return { userId: complaint.assignedToUserId, roleId: complaint.assignedToRoleId };
    }
    return null;
  }
}