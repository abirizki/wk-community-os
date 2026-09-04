/**
 * @class PBBController
 * @description Handles API requests for the PBB module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBController {
  /**
   * @param {PBBService} pbbService
   */
  constructor(pbbService) {
    /** @private */
    this.pbbService = pbbService;
  }

  /**
   * [POST] Endpoint to register a new Tax Object (NOP).
   * @param {object} request - Expects { body: { nop, address, landArea, buildingArea, ownerCitizenId } }.
   * @returns {object} Standard API response.
   */
  registerTaxObject(request) {
    try {
      WK.security().checkPermission('pbb.tax_object.create');
      const taxObjectData = request.body;
      const newTaxObject = this.pbbService.registerTaxObject(taxObjectData);
      return { success: true, data: newTaxObject, message: 'Tax object registered successfully.' };
    } catch (error) {
      WK.logger().error(`Error in PBBController.registerTaxObject: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * [GET] Endpoint to retrieve a tax object by its ID.
   * @param {object} request - Expects { params: { id } }.
   * @returns {object} Standard API response.
   */
  getTaxObjectById(request) {
    try {
      WK.security().checkPermission('pbb.tax_object.view');
      const id = request.params.id;
      if (!id) throw new Error('Tax Object ID is required.');
      const taxObject = this.pbbService.getTaxObjectById(id);
      if (!taxObject) return { success: false, message: 'Tax object not found.' };
      return { success: true, data: taxObject };
    } catch (error) {
      WK.logger().error(`Error in PBBController.getTaxObjectById: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * [POST] Endpoint to register a new taxpayer.
   * @param {object} request - Expects { body: { citizenId, taxpayerNumber } }.
   * @returns {object} Standard API response.
   */
  registerTaxpayer(request) {
    try {
      WK.security().checkPermission('pbb.taxpayer.create');
      const taxpayerData = request.body;
      const newTaxpayer = this.pbbService.registerTaxpayer(taxpayerData);
      return { success: true, data: newTaxpayer, message: 'Taxpayer registered successfully.' };
    } catch (error) {
      WK.logger().error(`Error in PBBController.registerTaxpayer: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * [GET] Endpoint to retrieve a taxpayer by citizen ID.
   * @param {object} request - Expects { params: { citizenId } }.
   * @returns {object} Standard API response.
   */
  getTaxpayerByCitizenId(request) {
    try {
      WK.security().checkPermission('pbb.taxpayer.view');
      const citizenId = request.params.citizenId;
      if (!citizenId) throw new Error('Citizen ID is required.');
      const taxpayer = this.pbbService.getTaxpayerByCitizenId(citizenId);
      if (!taxpayer) return { success: false, message: 'Taxpayer not found for this citizen.' };
      return { success: true, data: taxpayer };
    } catch (error) {
      WK.logger().error(`Error in PBBController.getTaxpayerByCitizenId: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * [POST] Endpoint to issue a new SPPT.
   * @param {object} request - Expects { body: { taxpayerId, taxObjectId, taxYear, taxAmount, dueDate } }.
   * @returns {object} Standard API response.
   */
  issueSPPT(request) {
    try {
      WK.security().checkPermission('pbb.sppt.issue');
      const spptData = request.body;
      const newSPPT = this.pbbService.issueSPPT(spptData);
      return { success: true, data: newSPPT, message: 'SPPT issued successfully.' };
    } catch (error) {
      WK.logger().error(`Error in PBBController.issueSPPT: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * [POST] Endpoint to record a payment for an SPPT.
   * @param {object} request - Expects { params: { spptId }, body: { paymentDate, paymentAmount, paymentMethod, transactionId } }.
   * @returns {object} Standard API response.
   */
  recordPayment(request) {
    try {
      WK.security().checkPermission('pbb.payment.record');
      const spptId = request.params.spptId;
      const paymentData = request.body;
      const paymentRecord = this.pbbService.recordPayment(spptId, paymentData);
      return { success: true, data: paymentRecord, message: 'Payment recorded successfully.' };
    } catch (error) {
      WK.logger().error(`Error in PBBController.recordPayment: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * [GET] Endpoint to retrieve all overdue SPPTs.
   * @returns {object} Standard API response.
   */
  getOverdueSPPTs() {
    try {
      WK.security().checkPermission('pbb.arrears.view');
      const overdueSPPTs = this.pbbService.getOverdueSPPTs();
      return { success: true, data: overdueSPPTs };
    } catch (error) {
      WK.logger().error(`Error in PBBController.getOverdueSPPTs: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * [POST] Endpoint to initiate arrears follow-up for a specific SPPT.
   * @param {object} request - Expects { params: { spptId } }.
   * @returns {object} Standard API response.
   */
  initiateArrearsFollowUp(request) {
    try {
      WK.security().checkPermission('pbb.arrears.followup');
      const spptId = request.params.spptId;
      const initiatedBy = WK.session().getCurrentUser().id; // Assuming current user initiates
      const result = this.pbbService.initiateArrearsFollowUp(spptId, initiatedBy);
      return { success: true, data: result, message: 'Arrears follow-up initiated.' };
    } catch (error) {
      WK.logger().error(`Error in PBBController.initiateArrearsFollowUp: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }
}