/**
 * @class PosyanduController
 * @description Handles HTTP requests for the Posyandu package.
 */
class PosyanduController {
  /**
   * @param {PosyanduService} posyanduService
   */
  constructor(posyanduService) {
    /** @private */
    this.service = posyanduService;
    /** @private */
    this.logger = WK.logger('PosyanduController');
  }

  /**
   * Handles request to create a new Posyandu visit.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  create(req) {
    try {
      const result = this.service.createVisit(req.body);
      return WK.response().json(result, 201);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update a Posyandu visit.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  update(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateVisit(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to delete a Posyandu visit.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  delete(req) {
    try {
      const { id } = req.params;
      this.service.deleteVisit(id);
      return WK.response().json(null, 204);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to find a visit by its ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findById(req) {
    try {
      const { id } = req.params;
      const result = this.service.getVisit(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find a citizen's visit history.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  history(req) {
    try {
      const { citizenId } = req.params;
      const result = this.service.getVisitHistory(citizenId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find visits by date.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findByDate(req) {
    try {
      const { date } = req.params;
      const result = this.service.getVisitsByDate(date, req.query.options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to search for visits.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  search(req) {
    try {
      const { query, options } = req.query;
      const result = this.service.searchVisits(query, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to list all visits.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  list(req) {
    try {
      const { options } = req.query;
      const result = this.service.listVisits(options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to record a measurement for a visit.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  recordMeasurement(req) {
    try {
      const { id } = req.params;
      const result = this.service.recordMeasurement(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update nutrition status for a visit.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateNutrition(req) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = this.service.updateNutritionStatus(id, status);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update development status for a visit.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateDevelopment(req) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = this.service.updateDevelopmentStatus(id, status);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to schedule the next visit.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  scheduleNextVisit(req) {
    try {
      const { id } = req.params;
      const { nextVisitDate } = req.body;
      const result = this.service.scheduleNextVisit(id, nextVisitDate);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }
}