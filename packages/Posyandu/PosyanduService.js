/**
 * @file PosyanduService.js
 * @description Application service for Posyandu health screening, stunting detection, and visit tracking.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

const { PosyanduMember, PosyanduRecord } = require('./PosyanduEntity.js');
const { PosyanduPermission } = require('./PosyanduPermission.js');
const { PosyanduRule } = require('./PosyanduRule.js');
const { PosyanduValidator } = require('./PosyanduValidator.js');

class PosyanduService {
  constructor(repository) {
    this.repository = repository;
    this.permission = new PosyanduPermission();
    this.rule = new PosyanduRule();
    this.validator = new PosyanduValidator();
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('PosyanduService') : console;
    this.eventBus = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null;
  }

  /**
   * Register a new community health participant (Balita / Ibu Hamil / Lansia).
   * @param {Object} payload
   * @param {Object} context
   * @returns {PosyanduMember}
   */
  registerMember(payload = {}, context = {}) {
    this.permission.checkCreateMember(context);
    this.validator.validateMemberRegistration(payload);
    this.rule.checkValidTargetGroup(payload.targetGroup);

    const member = new PosyanduMember({
      citizenId: payload.citizenId,
      parentCitizenId: payload.parentCitizenId || null,
      targetGroup: payload.targetGroup,
      posyanduName: payload.posyanduName,
      dateOfBirth: payload.dateOfBirth,
      gender: payload.gender,
      bloodType: payload.bloodType || null,
      chronicDiseases: payload.chronicDiseases || null,
      hpht: payload.hpht || null,
      estimatedDueDate: payload.estimatedDueDate || null,
    });

    const saved = this.repository.createMember(member);

    if (this.logger && this.logger.info) {
      this.logger.info(`Posyandu participant registered: ${saved.id} [${saved.targetGroup}] for citizen ${saved.citizenId}`);
    }

    if (this.eventBus) {
      this.eventBus.publish('PosyanduMemberRegistered', saved.toObject());
    }

    return saved;
  }

  /**
   * Record a health visit/screening session with automated nutritional and stunting evaluations.
   * @param {Object} payload
   * @param {Object} context
   * @returns {PosyanduRecord}
   */
  recordVisit(payload = {}, context = {}) {
    this.permission.checkCreateRecord(context);
    this.validator.validateRecordSubmission(payload);

    const member = this.repository.findMemberById(payload.memberId);
    if (!member) throw new Error(`Posyandu member not found with ID: ${payload.memberId}`);

    // Calculate age in months if not explicitly provided
    let ageInMonths = payload.ageInMonths;
    if (ageInMonths === undefined || ageInMonths === null) {
      const dob = new Date(member.dateOfBirth);
      const visit = new Date(payload.visitDate);
      ageInMonths = Math.max(0, Math.floor((visit - dob) / (1000 * 60 * 60 * 24 * 30.4375)));
    }

    // Check weight progression from previous visit
    const latestRecord = this.repository.findLatestRecordByMemberId(member.id);
    const isStagnant = this.rule.evaluateWeightStagnation(
      payload.weightKg,
      latestRecord ? latestRecord.weightKg : null
    );

    let nutritionStatus = payload.nutritionStatus || null;
    let stuntingStatus = payload.stuntingStatus || null;
    let isHighRisk = Boolean(payload.isHighRisk);

    // Automated Domain Health Evaluations
    if (member.targetGroup === 'BALITA') {
      const evalResult = this.rule.evaluateNutritionAndStunting(ageInMonths, payload.weightKg, payload.heightCm);
      nutritionStatus = evalResult.nutritionStatus;
      stuntingStatus = evalResult.stuntingStatus;

      if (nutritionStatus === 'GIZI_BURUK' || stuntingStatus === 'SEVERELY_STUNTED' || isStagnant) {
        isHighRisk = true;
      }
    } else if (member.targetGroup === 'IBU_HAMIL') {
      if (this.rule.evaluateHighRiskBumil(payload.armCircumferenceCm, payload.systolic)) {
        isHighRisk = true;
      }
    } else if (member.targetGroup === 'LANSIA') {
      if ((payload.bloodSugarMgDl && Number(payload.bloodSugarMgDl) >= 200) || (payload.systolic && Number(payload.systolic) >= 150)) {
        isHighRisk = true;
      }
    }

    const visitStatus = this.rule.determineVisitStatus(isHighRisk, isStagnant);

    const record = new PosyanduRecord({
      memberId: member.id,
      visitDate: payload.visitDate,
      ageInMonths,
      weightKg: payload.weightKg,
      heightCm: payload.heightCm,
      headCircumferenceCm: payload.headCircumferenceCm || null,
      armCircumferenceCm: payload.armCircumferenceCm || null,
      systolic: payload.systolic || null,
      diastolic: payload.diastolic || null,
      bloodSugarMgDl: payload.bloodSugarMgDl || null,
      cholesterolMgDl: payload.cholesterolMgDl || null,
      nutritionStatus,
      stuntingStatus,
      isHighRisk,
      riskNotes: payload.riskNotes || null,
      vitaminOrPMT: payload.vitaminOrPMT || null,
      immunizationGiven: payload.immunizationGiven || null,
      status: visitStatus,
    });

    const saved = this.repository.createRecord(record);

    if (this.logger && this.logger.info) {
      this.logger.info(`Posyandu visit recorded: ${saved.id} for member ${member.id} (Status: ${saved.status}, Risk: ${saved.isHighRisk})`);
    }

    if (this.eventBus) {
      this.eventBus.publish('PosyanduRecordAdded', saved.toObject());
      if (isHighRisk) {
        this.eventBus.publish('HighRiskDetected', {
          memberId: member.id,
          targetGroup: member.targetGroup,
          recordId: saved.id,
          isHighRisk: true,
          nutritionStatus,
          stuntingStatus,
        });
      }
    }

    return saved;
  }

  /**
   * Retrieve member medical screening history with strict privacy protection (PHI/PII masking).
   * @param {string} memberId
   * @param {string} requesterCitizenId
   * @param {Object} context
   * @returns {{ member: Object, records: Array<Object> }}
   */
  getMemberHistory(memberId, requesterCitizenId, context = {}) {
    const member = this.repository.findMemberById(memberId);
    if (!member) throw new Error(`Posyandu member not found with ID: ${memberId}`);

    // Authorization & Privacy Rule Check
    let isAuthorized = false;
    try {
      this.permission.checkViewAllMembers(context);
      isAuthorized = true;
    } catch (_) {
      // If cannot view all, check if viewing own/child records
      if (requesterCitizenId === member.citizenId || (member.parentCitizenId && requesterCitizenId === member.parentCitizenId)) {
        this.permission.checkViewOwnRecord(context);
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error(`Security Exception: Unauthorized access to Posyandu medical records for member ${memberId}.`);
    }

    const records = this.repository.findRecordsByMemberId(memberId);

    // Return Privacy-Safe Display representation
    return {
      member: member.toDisplay(),
      records: records.map(r => r.toDisplay()),
    };
  }
}

module.exports = { PosyanduService };

