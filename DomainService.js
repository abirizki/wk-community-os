/**
 * @class DomainService
 * @description The main service facade for the Community Governance Domain.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DomainService {
  /**
   * @param {object} context - An object containing all instantiated services from the domain.
   * @param {MeetingService} context.meetingService
   * @param {DecisionService} context.decisionService
   * @param {RegulationService} context.regulationService
   */
  constructor({
    meetingService,
    decisionService,
    regulationService
  }) {
    this.meetingService = meetingService;
    this.decisionService = decisionService;
    this.regulationService = regulationService;
  }

  /**
   * Creates a new regulation based on a decision made in a meeting.
   * This is a high-level domain method that orchestrates multiple package services.
   * @param {string} decisionId - The ID of the decision that authorizes the regulation.
   * @param {object} regulationData - The data for the new regulation.
   * @returns {RegulationEntity} The newly created regulation.
   */
  createRegulationFromDecision(decisionId, regulationData) {
    WK.security().checkPermission('governance.domain.create_regulation');
    WK.logger().info(`DomainService: Creating regulation from decision ${decisionId}.`);

    // 1. Validate the decision exists and is final
    const decision = this.decisionService.getById(decisionId);
    if (!decision || decision.status !== 'FINAL') throw new Error('Valid and final decision is required to create a regulation.');

    // 2. Create the regulation record, linking it to the source decision
    const regulation = this.regulationService.create({ ...regulationData, sourceDecisionId: decisionId });

    return regulation;
  }
}