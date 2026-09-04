/**
 * @class MedicalRecordController
 * @description Handles HTTP requests for the MedicalRecord package.
 */
class MedicalRecordController {
  /**
   * @param {MedicalRecordService} medicalRecordService
   */
  constructor(medicalRecordService) {
    /** @private */
    this.service = medicalRecordService;
    /** @private */
    this.logger = WK.logger('MedicalRecordController');
  }

  /**
   * Handles request to create a new medical record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  create(req) {
    try {
      const result = this.service.createMedicalRecord(req.body);
      return WK.response().json(result, 201);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to update a medical record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  update(req) {
    try {
      const { id } = req.params;
      const result = this.service.updateMedicalRecord(id, req.body);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to delete a medical record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  delete(req) {
    try {
      const { id } = req.params;
      this.service.deleteMedicalRecord(id);
      return WK.response().json(null, 204);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to find a medical record by its ID.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findById(req) {
    try {
      const { id } = req.params;
      const result = this.service.getMedicalRecord(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find medical history for a citizen.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  history(req) {
    try {
      const { citizenId } = req.params;
      const result = this.service.getHistory(citizenId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to find the latest medical record for a citizen.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  findLatest(req) {
    try {
      const { citizenId } = req.params;
      const result = this.service.getLatestByCitizen(citizenId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 404);
    }
  }

  /**
   * Handles request to search for medical records.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  search(req) {
    try {
      const { query, options } = req.query;
      const result = this.service.search(query, options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to list all medical records.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  list(req) {
    try {
      const { options } = req.query;
      const result = this.service.list(options);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }

  /**
   * Handles request to complete a medical record.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  complete(req) {
    try {
      const { id } = req.params;
      const result = this.service.completeRecord(id);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update the status of a medical record.
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

  /**
   * Handles request to update diagnosis information.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateDiagnosis(req) {
    try {
      const { id } = req.params;
      const { diagnosis } = req.body;
      const result = this.service.updateDiagnosis(id, diagnosis);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update treatment information.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateTreatment(req) {
    try {
      const { id } = req.params;
      const { treatment } = req.body;
      const result = this.service.updateTreatment(id, treatment);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update prescription information.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updatePrescription(req) {
    try {
      const { id } = req.params;
      const { prescription } = req.body;
      const result = this.service.updatePrescription(id, prescription);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update clinical notes.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateClinicalNotes(req) {
    try {
      const { id } = req.params;
      const { noteContent } = req.body;
      const result = this.service.updateClinicalNotes(id, noteContent);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update provider information.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateProvider(req) {
    try {
      const { id } = req.params;
      const { providerId, providerType } = req.body;
      const result = this.service.updateProvider(id, providerId, providerType);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update location information.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateLocation(req) {
    try {
      const { id } = req.params;
      const { locationId, locationType } = req.body;
      const result = this.service.updateLocation(id, locationId, locationType);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update context information.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateContext(req) {
    try {
      const { id } = req.params;
      const { contextType, contextId } = req.body;
      const result = this.service.updateContext(id, contextType, contextId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to schedule a follow-up.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  scheduleFollowUp(req) {
    try {
      const { id } = req.params;
      const { followUpDate, followUpNotes } = req.body;
      const result = this.service.scheduleFollowUp(id, followUpDate, followUpNotes);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to update attachment reference.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  updateAttachment(req) {
    try {
      const { id } = req.params;
      const { attachmentId } = req.body;
      const result = this.service.updateAttachment(id, attachmentId);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, e.message.includes('not found') ? 404 : 400);
    }
  }

  /**
   * Handles request to get recent activity.
   * @param {object} req - The HTTP request object.
   * @returns {HTTPResponse}
   */
  recentActivity(req) {
    try {
      const { filters, limit } = req.query;
      const result = this.service.getRecentActivity(filters, limit);
      return WK.response().json(result);
    } catch (e) {
      this.logger.error(e.message);
      return WK.response().error(e.message, 400);
    }
  }
}