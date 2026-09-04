/**
 * @class PregnancyController
 * @description Handles HTTP requests for the Pregnancy package.
 */
class PregnancyController {
  /**
   * @param {PregnancyService} pregnancyService
   */
  constructor(pregnancyService) {
    /** @private */
    this.service = pregnancyService;
    /** @private */
    this.logger = WK.logger('PregnancyController');
  }

  /**
   * Handles request to create a new pregnancy record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  create(req) {
    try {
      const result = this.service.createPregnancy(req.body);
      return WK.response().json(result, 201);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update a pregnancy record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  update(req) {
    try {
      const { id } = req.params;
      const result = this.service.updatePregnancy(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to delete a pregnancy record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  delete(req) {
    try {
      const { id } = req.params;
      this.service.deletePregnancy(id);
      return WK.response().json(null, 204);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to find a pregnancy by its ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findById(req) {
    try {
      const { id } = req.params;
      const result = this.service.getPregnancy(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find pregnancy history for a mother.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  history(req) {
    try {
      const { motherId } = req.params;
      const result = this.service.getPregnancyHistory(motherId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find the active pregnancy for a mother.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findActive(req) {
    try {
      const { motherId } = req.params;
      const result = this.service.getActivePregnancy(motherId);
      if (!result) {
        return WK.response().json(null, 404);
      }
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to search for pregnancies.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  search(req) {
    try {
      const { query, options } = req.query;
      const result = this.service.searchPregnancies(query, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to list all pregnancies.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  list(req) {
    try {
      const { options } = req.query;
      const result = this.service.listPregnancies(options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to change pregnancy status.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  changeStatus(req) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = this.service.changeStatus(id, status);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to change pregnancy risk status.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  changeRiskStatus(req) {
    try {
      const { id } = req.params;
      const { riskStatus } = req.body;
      const result = this.service.changeRiskStatus(id, riskStatus);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to complete a pregnancy.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  complete(req) {
    try {
      const { id } = req.params;
      const result = this.service.completePregnancy(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to end a pregnancy.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  end(req) {
    try {
      const { id } = req.params;
      const result = this.service.endPregnancy(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }
}