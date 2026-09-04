/**
 * @file AspirationService.js
 * @description Application service orchestrating Musrenbang aspiration workflows, voting, and decision making.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 */

const { Aspiration, AspirationVote } = require('./AspirationEntity.js');
const { AspirationPermission } = require('./AspirationPermission.js');
const { AspirationRule } = require('./AspirationRule.js');
const { AspirationValidator } = require('./AspirationValidator.js');

class AspirationService {
  constructor(repository) {
    this.repository = repository;
    this.permission = new AspirationPermission();
    this.rule = new AspirationRule();
    this.validator = new AspirationValidator();
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('AspirationService') : console;
    this.eventBus = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null;
  }

  /**
   * Submit a new citizen proposal (status: PROPOSED).
   * @param {Object} payload - { citizenId, title, description, category, estimatedBudget?, location }
   * @param {Object} context
   * @returns {Aspiration}
   */
  submitAspiration(payload = {}, context = {}) {
    this.permission.checkCreate(context);
    this.validator.validateSubmit(payload);
    this.rule.checkValidCategory(payload.category);

    const aspiration = new Aspiration({
      citizenId: payload.citizenId,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      estimatedBudget: payload.estimatedBudget || 0,
      location: payload.location,
      status: 'PROPOSED',
      priority: 'LOW',
      voteCount: 0,
    });

    const saved = this.repository.createAspiration(aspiration);

    if (this.logger && this.logger.info) {
      this.logger.info(`Aspiration proposed: ${saved.id} [${saved.category}] by citizen ${saved.citizenId}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('AspirationSubmitted', saved.toObject());
    }

    return saved;
  }

  /**
   * Verify proposal and open citizen polling stage (PROPOSED -> POLLING).
   * @param {string} aspirationId
   * @param {number} durationDays - Polling duration in days (default: 30)
   * @param {Object} context
   * @returns {Aspiration}
   */
  verifyAndOpenPolling(aspirationId, durationDays = 30, context = {}) {
    this.permission.checkVerify(context);

    const aspiration = this.repository.findAspirationById(aspirationId);
    if (!aspiration) throw new Error(`Aspiration not found with ID: ${aspirationId}`);

    this.rule.checkTerminalStatus(aspiration.status);
    this.rule.checkStatusTransition(aspiration.status, 'POLLING');

    aspiration.status = 'POLLING';
    aspiration.pollingEndDate = new Date(Date.now() + durationDays * 86400000).toISOString();

    const updated = this.repository.updateAspiration(aspiration);

    if (this.logger && this.logger.info) {
      this.logger.info(`Aspiration ${updated.id} polling opened until ${updated.pollingEndDate}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('AspirationPollingOpened', updated.toObject());
    }

    return updated;
  }

  /**
   * Cast an upvote for an aspiration (One-Citizen-One-Vote rule enforced).
   * Automatically escalates priority to HIGH when voteCount reaches >= 100.
   * @param {string} aspirationId
   * @param {string} citizenId
   * @param {Object} context
   * @returns {{ aspiration: Aspiration, vote: AspirationVote }}
   */
  voteAspiration(aspirationId, citizenId, context = {}) {
    this.permission.checkVote(context);

    const aspiration = this.repository.findAspirationById(aspirationId);
    if (!aspiration) throw new Error(`Aspiration not found with ID: ${aspirationId}`);

    // 1. Enforce polling eligibility (status === 'POLLING' and not expired)
    this.rule.checkPollingEligibility(aspiration.status, aspiration.pollingEndDate);

    // 2. Enforce One-Citizen-One-Vote rule
    const existingVote = this.repository.findVoteByCitizen(aspirationId, citizenId);
    this.rule.checkOneVoteRule(citizenId, existingVote ? [existingVote] : []);

    // 3. Record vote entity
    const vote = new AspirationVote({
      aspirationId,
      citizenId,
      votedAt: new Date().toISOString(),
    });
    this.repository.saveVote(vote);

    // 4. Increment voteCount
    aspiration.voteCount = (aspiration.voteCount || 0) + 1;

    // 5. Dynamic Priority Escalation: >= 100 votes elevates to HIGH
    if (aspiration.voteCount >= 100 && aspiration.priority !== 'CRITICAL') {
      aspiration.priority = 'HIGH';
      if (this.logger && this.logger.info) {
        this.logger.info(`Aspiration ${aspiration.id} reached ${aspiration.voteCount} votes. Priority escalated to HIGH.`);
      }
    }

    const updated = this.repository.updateAspiration(aspiration);

    if (this.eventBus) {
      this.eventBus.publish('AspirationVoted', {
        aspiration: updated.toObject(),
        vote: vote.toObject(),
      });
    }

    return { aspiration: updated, vote };
  }

  /**
   * Schedule Musrenbang meeting discussion (POLLING -> IN_DISCUSSION).
   * @param {string} aspirationId
   * @param {Object} payload - { scheduledMeetingDate }
   * @param {Object} context
   * @returns {Aspiration}
   */
  scheduleMusrenbang(aspirationId, payload = {}, context = {}) {
    this.permission.checkSchedule(context);
    this.validator.validateSchedule(payload);

    const aspiration = this.repository.findAspirationById(aspirationId);
    if (!aspiration) throw new Error(`Aspiration not found with ID: ${aspirationId}`);

    this.rule.checkTerminalStatus(aspiration.status);
    this.rule.checkStatusTransition(aspiration.status, 'IN_DISCUSSION');

    aspiration.scheduledMeetingDate = payload.scheduledMeetingDate;
    aspiration.status = 'IN_DISCUSSION';

    const updated = this.repository.updateAspiration(aspiration);

    if (this.logger && this.logger.info) {
      this.logger.info(`Aspiration ${updated.id} scheduled for Musrenbang discussion on ${payload.scheduledMeetingDate}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('AspirationScheduled', updated.toObject());
    }

    return updated;
  }

  /**
   * Finalize Musrenbang decision on proposal (ACCEPTED / DEFERRED / REJECTED).
   * @param {string} aspirationId
   * @param {string} decision - 'ACCEPTED' | 'DEFERRED' | 'REJECTED'
   * @param {Object} payload - { finalDecisionNotes? , rejectedReason? }
   * @param {Object} context
   * @returns {Aspiration}
   */
  decideAspiration(aspirationId, decision, payload = {}, context = {}) {
    this.permission.checkDecide(context);
    this.validator.validateDecision(decision, payload);

    const aspiration = this.repository.findAspirationById(aspirationId);
    if (!aspiration) throw new Error(`Aspiration not found with ID: ${aspirationId}`);

    this.rule.checkTerminalStatus(aspiration.status);
    this.rule.checkStatusTransition(aspiration.status, decision);

    aspiration.status = decision;
    if (decision === 'REJECTED') {
      aspiration.rejectedReason = payload.rejectedReason;
    } else {
      aspiration.finalDecisionNotes = payload.finalDecisionNotes;
    }

    const updated = this.repository.updateAspiration(aspiration);

    if (this.logger && this.logger.info) {
      this.logger.info(`Aspiration ${updated.id} decision recorded: ${decision}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('AspirationDecided', {
        decision,
        aspiration: updated.toObject(),
      });
    }

    return updated;
  }
}

module.exports = { AspirationService };

