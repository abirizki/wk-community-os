/**
 * @class ComplaintEntity
 * @description Represents the data structure for a single complaint or public service request.
 * This entity tracks the complaint's details, status, and history through its lifecycle.
 */
class ComplaintEntity {
  /**
   * @param {object} params - The parameters to create a complaint entity.
   * @param {string} params.id - Unique identifier (UUID) for this complaint.
   * @param {string} params.trackingNumber - A public-facing unique tracking number.
   * @param {string} params.citizenId - The ID of the citizen who submitted the complaint.
   * @param {string} params.householdId - The ID of the household related to the complaint (if applicable).
   * @param {string} params.category - The category of the complaint (e.g., 'Infrastructure', 'Social').
   * @param {string} params.subCategory - A more specific sub-category.
   * @param {string} params.title - A brief title for the complaint.
   * @param {string} params.description - A detailed description of the complaint.
   * @param {string} params.location - Textual description of the location.
   * @param {object} params.coordinates - Optional geographical coordinates { lat, lng }.
   * @param {string} params.priority - Priority level ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW').
   * @param {string} params.status - Current status in the workflow (e.g., 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED').
   * @param {object[]} params.attachments - Array of attached files (e.g., { fileId: '...', fileName: '...' }).
   * @param {string|null} params.assignedToUserId - The ID of the user/officer assigned to resolve the complaint.
   * @param {string|null} params.assignedToRoleId - The role ID assigned to resolve the complaint.
   * @param {string|null} params.resolutionDetails - Details provided upon resolution.
   * @param {string|null} params.citizenConfirmation - Citizen's confirmation status ('CONFIRMED', 'REJECTED').
   * @param {string|null} params.rejectionReason - Reason if the complaint was rejected.
   * @param {string} params.createdAt - ISO 8601 timestamp of creation.
   * @param {string} params.updatedAt - ISO 8601 timestamp of last update.
   * @param {string|null} params.submittedAt - ISO 8601 timestamp when first submitted.
   * @param {string|null} params.resolvedAt - ISO 8601 timestamp when resolved.
   * @param {string|null} params.closedAt - ISO 8601 timestamp when closed.
   */
  constructor({
    id,
    trackingNumber,
    citizenId,
    householdId,
    category,
    subCategory,
    title,
    description,
    location,
    coordinates,
    priority,
    status,
    attachments,
    assignedToUserId,
    assignedToRoleId,
    resolutionDetails,
    citizenConfirmation,
    rejectionReason,
    createdAt,
    updatedAt,
    submittedAt,
    resolvedAt,
    closedAt
  }) {
    this.id = id;
    this.trackingNumber = trackingNumber;
    this.citizenId = citizenId;
    this.householdId = householdId;
    this.category = category;
    this.subCategory = subCategory;
    this.title = title;
    this.description = description;
    this.location = location;
    this.coordinates = coordinates;
    this.priority = priority;
    this.status = status;
    this.attachments = attachments || [];
    this.assignedToUserId = assignedToUserId;
    this.assignedToRoleId = assignedToRoleId;
    this.resolutionDetails = resolutionDetails;
    this.citizenConfirmation = citizenConfirmation;
    this.rejectionReason = rejectionReason;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.submittedAt = submittedAt;
    this.resolvedAt = resolvedAt;
    this.closedAt = closedAt;
  }
}