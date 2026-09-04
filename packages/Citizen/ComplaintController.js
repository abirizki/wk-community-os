/**
 * @class ComplaintController
 * @description Handles incoming API requests for the Complaint module.
 * It acts as a thin layer, validating basic input and delegating business logic
 * to the appropriate services. It is responsible for checking permissions and
 * formatting the final HTTP response.
 */
class ComplaintController {
  /**
   * @param {ComplaintService} complaintService
   * @param {ComplaintStatisticsService} statisticsService
   * @param {ComplaintCategoryService} categoryService
   */
  constructor(complaintService, statisticsService, categoryService) {
    /** @private */
    this.complaintService = complaintService;
    /** @private */
    this.statisticsService = statisticsService;
    /** @private */
    this.categoryService = categoryService;
  }

  /**
   * Handles the request to create a new complaint.
   * @param {object} request - The request object, expecting complaint data in `request.body`.
   * @returns {object} A standard response object `{ success, data?, message? }`.
   */
  create(request) {
    try {
      const complaintData = request.body;
      if (!complaintData) {
        throw new Error('Request body tidak boleh kosong.');
      }
      const newComplaint = this.complaintService.createComplaint(complaintData);
      return { success: true, data: newComplaint, message: 'Complaint berhasil diajukan.' };
    } catch (error) {
      WK.logger().error(`Error in ComplaintController.create: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * Handles the request to get a complaint by its ID.
   * @param {object} request - The request object, expecting complaint ID in `request.params.id`.
   * @returns {object} A standard response object.
   */
  getById(request) {
    try {
      const complaintId = request.params.id;
      if (!complaintId) {
        throw new Error('Complaint ID tidak boleh kosong.');
      }
      const complaint = this.complaintService.getComplaintById(complaintId);
      if (!complaint) {
        return { success: false, message: 'Complaint tidak ditemukan.' };
      }
      return { success: true, data: complaint };
    } catch (error) {
      WK.logger().error(`Error in ComplaintController.getById: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * Handles the request to get a complaint by its public tracking number.
   * @param {object} request - The request object, expecting tracking number in `request.params.trackingNumber`.
   * @returns {object} A standard response object.
   */
  getByTrackingNumber(request) {
    try {
      const trackingNumber = request.params.trackingNumber;
      if (!trackingNumber) {
        throw new Error('Tracking number tidak boleh kosong.');
      }
      const complaint = this.complaintService.getComplaintByTrackingNumber(trackingNumber);
      if (!complaint) {
        return { success: false, message: 'Complaint tidak ditemukan.' };
      }
      return { success: true, data: complaint };
    } catch (error) {
      WK.logger().error(`Error in ComplaintController.getByTrackingNumber: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * Handles requests for various complaint statistics.
   * @param {object} request - The request object, expecting statistic type in `request.query.type`.
   * @returns {object} A standard response object.
   */
  getStatistics(request) {
    try {
      WK.security().checkPermission('complaint.view.statistics');
      const statsType = request.query.type;
      let stats;
      switch (statsType) {
        case 'byCategory':
          stats = this.statisticsService.getComplaintsByCategory();
          break;
        case 'byRT':
          stats = this.statisticsService.getComplaintsByRT();
          break;
        case 'monthlyTrend':
          stats = this.statisticsService.getMonthlyTrend();
          break;
        // Add more cases as needed
        default:
          throw new Error(`Tipe statistik '${statsType}' tidak didukung.`);
      }
      return { success: true, data: stats };
    } catch (error) {
      WK.logger().error(`Error in ComplaintController.getStatistics: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * Handles the request for a list of available complaint categories.
   * @returns {object} A standard response object with categories.
   */
  getCategories() {
    try {
      const categories = this.categoryService.getAllCategories();
      return { success: true, data: categories };
    } catch (error) {
      WK.logger().error(`Error in ComplaintController.getCategories: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * Handles the request for a citizen to confirm the resolution of their complaint.
   * @param {object} request - Expects { params: { id }, body: { confirmed: boolean } }.
   * @returns {object} Standard API response.
   */
  confirmResolution(request) {
    try {
      const complaintId = request.params.id;
      const { confirmed } = request.body;
      const updatedComplaint = this.complaintService.confirmResolution(complaintId, confirmed);
      return { success: true, data: updatedComplaint, message: 'Konfirmasi resolusi berhasil.' };
    } catch (error) {
      WK.logger().error(`Error in ComplaintController.confirmResolution: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }
}