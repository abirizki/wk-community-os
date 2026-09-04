/**
 * @class MedicineController
 * @description Handles HTTP requests for the Medicine package (Master Data).
 */
class MedicineController {
  /**
   * @param {MedicineService} medicineService
   */
  constructor(medicineService) {
    /** @private */
    this.service = medicineService;
    /** @private */
    this.logger = WK.logger('MedicineController');
  }

  /**
   * Handles request to create a new medicine master record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  create(req) {
    try {
      const result = this.service.createMedicine(req.body);
      return WK.response().json(result, 201);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update a medicine master record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  update(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateMedicine(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to delete a medicine master record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  delete(req) {
    try {
      const { id } = req.params;
      this.service.deleteMedicine(id);
      return WK.response().json(null, 204);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to find a medicine by its ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findById(req) {
    try {
      const { id } = req.params;
      const result = this.service.getMedicine(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find a medicine by its code.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findByCode(req) {
    try {
      const { code } = req.params;
      const result = this.service.getByCode(code);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to search for medicine records.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  search(req) {
    try {
      const { query, options } = req.query;
      const result = this.service.searchMedicines(query, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to list all medicine records.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  list(req) {
    try {
      const { options } = req.query;
      const result = this.service.listMedicines(options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update the status of a medicine master record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateStatus(req) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = this.service.updateStatus(id, status);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }
}