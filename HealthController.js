/**
 * @class HealthController
 * @description Handles HTTP requests for the Health package.
 */
class HealthController {
  /**
   * @param {HealthService} healthService
   * @param {HealthStatistics} healthStatistics
   */
  constructor(healthService, healthStatistics) {
    /** @private */
    this.service = healthService;
    /** @private */
    this.statistics = healthStatistics;
    /** @private */
    this.logger = WK.logger('HealthController');
  }

  /**
   * Handles request to create a new health profile.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  create(req) {
    try {
      const result = this.service.createHealthProfile(req.body);
      return WK.response().json(result, 201);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update a health profile.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  update(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateHealthProfile(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to delete a health profile.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  delete(req) {
    try {
      const { id } = req.params;
      this.service.deleteHealthProfile(id);
      return WK.response().json(null, 204);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to find a health profile by its ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findById(req) {
    try {
      const { id } = req.params;
      const result = this.service.getHealthProfile(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find a health profile by citizen ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findByCitizen(req) {
    try {
      const { citizenId } = req.params;
      const result = this.service.getHealthProfileByCitizen(citizenId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to search for health profiles.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  search(req) {
    try {
      const { query, options } = req.query;
      const result = this.service.searchHealthProfiles(query, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to list all health profiles.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  list(req) {
    try {
      const { options } = req.query;
      const result = this.service.listHealthProfiles(options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request for health statistics.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  statistics(req) {
    try {
      WK.security().checkPermission('health.dashboard.view');
      const result = this.statistics.getOverview();
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }
}