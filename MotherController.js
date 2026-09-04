/**
 * @class MotherController
 * @description Handles HTTP requests for the Mother package.
 */
class MotherController {
  /**
   * @param {MotherService} motherService
   */
  constructor(motherService) {
    /** @private */
    this.service = motherService;
    /** @private */
    this.logger = WK.logger('MotherController');
  }

  /**
   * Handles request to create a new mother profile.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  create(req) {
    try {
      const result = this.service.createMotherProfile(req.body);
      return WK.response().json(result, 201);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update a mother profile.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  update(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateMotherProfile(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to delete a mother profile.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  delete(req) {
    try {
      const { id } = req.params;
      this.service.deleteMotherProfile(id);
      return WK.response().json(null, 204);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to find a mother profile by its ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findById(req) {
    try {
      const { id } = req.params;
      const result = this.service.getMotherProfile(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find a mother profile by citizen ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findByCitizen(req) {
    try {
      const { citizenId } = req.params;
      const result = this.service.getMotherByCitizen(citizenId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find a mother profile by health profile ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findByHealthProfile(req) {
    try {
      const { healthProfileId } = req.params;
      const result = this.service.getMotherByHealthProfile(healthProfileId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to search for mother profiles.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  search(req) {
    try {
      const { query, options } = req.query;
      const result = this.service.searchMothers(query, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to list all mother profiles.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  list(req) {
    try {
      const { options } = req.query;
      const result = this.service.listMothers(options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update maternal history.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateHistory(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateMaternalHistory(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update maternal counters.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateCounters(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateCounters(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to change maternal risk status.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  changeRiskStatus(req) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const result = this.service.changeMaternalRiskStatus(id, status);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to add a maternal note.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  addNote(req) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const result = this.service.addMaternalNote(id, note);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }
}