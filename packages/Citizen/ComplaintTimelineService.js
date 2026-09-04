/**
 * @class ComplaintTimelineService
 * @description Manages the chronological history (timeline) of actions and status changes
 * for a complaint. This provides an audit trail and transparency for the complaint's lifecycle.
 */
class ComplaintTimelineService {
  /**
   * @param {ComplaintRepository} complaintRepository - The repository for complaint data.
   */
  constructor(complaintRepository) {
    /** @private */
    this.complaintRepository = complaintRepository;
  }

  /**
   * Adds a new entry to a complaint's timeline.
   * This method updates the complaint record directly by appending to its `timeline` array.
   * @param {string} complaintId - The ID of the complaint.
   * @param {string} action - The action performed (e.g., 'SUBMITTED', 'VERIFIED_RT', 'ASSIGNED', 'RESOLVED').
   * @param {string} comment - A descriptive comment for the timeline entry.
   * @param {string|null} [userId=null] - The ID of the user who performed the action. Defaults to current user.
   * @param {string|null} [userRole=null] - The role of the user who performed the action. Defaults to current user's role.
   * @returns {object[]} The updated timeline array.
   * @throws {Error} If the complaint is not found.
   */
  addEntry(complaintId, action, comment, userId = null, userRole = null) {
    const complaint = this.complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found.');
    }

    const currentUser = WK.session().getUser();
    const entry = {
      timestamp: new Date().toISOString(),
      action: action,
      comment: comment,
      userId: userId || (currentUser ? currentUser.id : 'SYSTEM'),
      userRole: userRole || (currentUser ? currentUser.role : 'SYSTEM'),
    };

    if (!complaint.timeline) {
      complaint.timeline = [];
    }
    complaint.timeline.push(entry);

    this.complaintRepository.update(complaintId, { timeline: complaint.timeline });
    WK.logger().debug(`Timeline entry added for complaint ${complaintId}: ${action}`);
    return complaint.timeline;
  }

  /**
   * Retrieves the complete timeline for a specific complaint.
   * @param {string} complaintId - The ID of the complaint.
   * @returns {object[]} An array of timeline entries, sorted chronologically.
   */
  getTimelineForComplaint(complaintId) {
    WK.security().checkPermission('complaint.view.timeline');
    const complaint = this.complaintRepository.findById(complaintId);
    if (!complaint) {
      throw new Error('Complaint not found.');
    }
    return complaint.timeline ? complaint.timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) : [];
  }
}