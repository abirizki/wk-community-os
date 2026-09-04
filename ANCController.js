/**
 * @class ANCController
 * @description Handles HTTP requests for the ANC package.
 */
class ANCController {
  /**
   * @param {ANCService} ancService
   */
  constructor(ancService) {
    /** @private */
    this.service = ancService;
    /** @private */
    this.logger = WK.logger('ANCController');
  }

  /**
   * Handles request to create a new ANC record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  create(req) {
    try {
      const result = this.service.createANC(req.body);
      return WK.response().json(result, 201);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update an ANC record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  update(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateANC(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to delete an ANC record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  delete(req) {
    try {
      const { id } = req.params;
      this.service.deleteANC(id);
      return WK.response().json(null, 204);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to find an ANC record by its ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findById(req) {
    try {
      const { id } = req.params;
      const result = this.service.getANC(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find ANC history for a pregnancy.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  history(req) {
    try {
      const { pregnancyId } = req.params;
      const result = this.service.getANCHistory(pregnancyId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find the latest ANC record for a pregnancy.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findLatest(req) {
    try {
      const { pregnancyId } = req.params;
      const result = this.service.getLatestANC(pregnancyId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to search for ANC records.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  search(req) {
    try {
      const { query, options } = req.query;
      const result = this.service.searchANC(query, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to list all ANC records.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  list(req) {
    try {
      const { options } = req.query;
      const result = this.service.listANC(options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update risk status.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateRiskStatus(req) {
    try {
      const { id } = req.params;
      const { riskStatus } = req.body;
      const result = this.service.updateRiskStatus(id, riskStatus);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update follow-up status.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateFollowUpStatus(req) {
    try {
      const { id } = req.params;
      const { followUpRequired } = req.body;
      const result = this.service.updateFollowUpStatus(id, followUpRequired);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update referral status.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateReferralStatus(req) {
    try {
      const { id } = req.params;
      const { referralRequired } = req.body;
      const result = this.service.updateReferralStatus(id, referralRequired);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }
}