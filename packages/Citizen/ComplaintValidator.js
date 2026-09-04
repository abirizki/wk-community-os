/**
 * @class ComplaintValidator
 * @description Provides comprehensive validation rules for complaint data.
 * It ensures data integrity before a complaint is processed by services.
 */
class ComplaintValidator {
  /**
   * @param {ComplaintRepository} complaintRepository
   * @param {CitizenService} citizenService
   * @param {HouseholdService} householdService
   * @param {ComplaintCategoryService} categoryService
   */
  constructor(complaintRepository, citizenService, householdService, categoryService) {
    /** @private */
    this.complaintRepository = complaintRepository;
    /** @private */
    this.citizenService = citizenService;
    /** @private */
    this.householdService = householdService;
    /** @private */
    this.categoryService = categoryService;
  }

  /**
   * Validates the data for creating a new complaint.
   * @param {object} data - The complaint data object.
   * @returns {{isValid: boolean, errors: string[]}} An object containing the validation result and an array of error messages.
   */
  forCreate(data) {
    const errors = [];

    // Required Fields Validation
    const requiredFields = ['citizenId', 'category', 'title', 'description', 'location'];
    requiredFields.forEach(field => {
      if (!data[field] || String(data[field]).trim() === '') {
        errors.push(`${field} is required.`);
      }
    });

    if (errors.length > 0) return { isValid: false, errors };

    // Validate Citizen existence
    const citizen = this.citizenService.getCitizenById(data.citizenId);
    if (!citizen) {
      errors.push(`Citizen with ID '${data.citizenId}' not found.`);
    } else if (citizen.status !== 'Aktif') {
      errors.push('Submitting citizen must be active.');
    }

    // Validate Household existence (if citizen found)
    if (citizen && !this.householdService.getHouseholdById(citizen.householdId)) {
      errors.push(`Household for citizen '${data.citizenId}' not found.`);
    }

    // Validate Category
    if (!this.categoryService.isValidCategory(data.category)) {
      errors.push(`Category '${data.category}' is not valid.`);
    }
    if (data.subCategory && !this.categoryService.isValidSubCategory(data.category, data.subCategory)) {
      errors.push(`Sub-category '${data.subCategory}' is not valid for category '${data.category}'.`);
    }

    // Validate Priority
    const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push(`Priority '${data.priority}' is not valid. Must be one of: ${validPriorities.join(', ')}.`);
    }

    // Validate Attachments (basic check)
    if (data.attachments && !Array.isArray(data.attachments)) {
      errors.push('Attachments must be an array.');
    }

    return { isValid: errors.length === 0, errors };
  }

  /**
   * Validates data for updating an existing complaint.
   * @param {object} data - The complaint data to update.
   * @param {string} complaintId - The ID of the complaint being updated.
   * @returns {{isValid: boolean, errors: string[]}} Validation result.
   */
  forUpdate(data, complaintId) {
    const errors = [];

    // Ensure complaint exists
    if (!this.complaintRepository.findById(complaintId)) {
      errors.push('Complaint not found.');
      return { isValid: false, errors };
    }

    // Validate Category if present
    if (data.category && !this.categoryService.isValidCategory(data.category)) {
      errors.push(`Category '${data.category}' is not valid.`);
    }
    if (data.category && data.subCategory && !this.categoryService.isValidSubCategory(data.category, data.subCategory)) {
      errors.push(`Sub-category '${data.subCategory}' is not valid for category '${data.category}'.`);
    }

    // Validate Priority if present
    const validPriorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    if (data.priority && !validPriorities.includes(data.priority)) {
      errors.push(`Priority '${data.priority}' is not valid.`);
    }

    // Status changes are typically handled by workflow, not direct update

    return { isValid: errors.length === 0, errors };
  }
}