/**
 * @file PolicyService.js
 * @description Application service orchestrating business rules and persistence for Policy.
 */

const { Policy, PolicyProcedure } = require('./PolicyEntity.js');
const { PolicyPermission } = require('./PolicyPermission.js');
const { PolicyRule } = require('./PolicyRule.js');
const { PolicyValidator } = require('./PolicyValidator.js');

class PolicyService {
  constructor(repository) {
    this.repository = repository;
    this.permission = new PolicyPermission();
    this.rule = new PolicyRule();
    this.validator = new PolicyValidator();
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('PolicyService') : console;
    this.eventBus = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null;
  }

  draftPolicy(payload, context = {}) {
    this.permission.checkCreatePolicy(context);
    this.validator.validatePolicyCreate(payload);
    
    this.rule.checkValidCategory(payload.category);
    this.rule.checkValidScopeType(payload.scopeType);
    this.rule.checkValidTargetRole(payload.targetRole);

    const policy = new Policy(payload);
    policy.status = 'DRAFT';
    
    const saved = this.repository.createPolicy(policy);
    if (this.logger.info) this.logger.info(`Policy drafted: ${saved.policyNumber}`);
    if (this.eventBus) this.eventBus.publish('PolicyDrafted', saved.toObject());
    
    return saved;
  }

  addProcedure(payload, context = {}) {
    this.permission.checkCreatePolicy(context);
    this.validator.validateProcedureAdd(payload);

    const policy = this.repository.findPolicyById(payload.policyId);
    if (!policy) throw new Error('Policy not found');

    this.rule.checkImmutability(policy);

    const procedure = new PolicyProcedure(payload);
    const saved = this.repository.addProcedure(procedure);
    
    if (this.logger.info) this.logger.info(`Procedure added to Policy ${policy.id}`);
    return saved;
  }

  submitForApproval(policyId, context = {}) {
    this.permission.checkCreatePolicy(context);
    
    const policy = this.repository.findPolicyById(policyId);
    if (!policy) throw new Error('Policy not found');

    this.rule.checkStatusTransition(policy.status, 'PENDING_APPROVAL');
    
    policy.status = 'PENDING_APPROVAL';
    const updated = this.repository.updatePolicy(policy);
    
    if (this.eventBus) this.eventBus.publish('PolicySubmittedForApproval', updated.toObject());
    return updated;
  }

  approvePolicy(policyId, approverId, context = {}) {
    this.permission.checkApprovePolicy(context);
    
    const policy = this.repository.findPolicyById(policyId);
    if (!policy) throw new Error('Policy not found');

    this.rule.checkStatusTransition(policy.status, 'ACTIVE');
    this.rule.checkApprovalIntegrity(policy, approverId);
    
    policy.status = 'ACTIVE';
    policy.approvedByCitizenId = approverId;
    policy.approvedAt = new Date().toISOString();
    
    const updated = this.repository.updatePolicy(policy);
    
    if (this.logger.info) this.logger.info(`Policy approved and ACTIVE: ${updated.policyNumber}`);
    if (this.eventBus) this.eventBus.publish('PolicyApproved', updated.toObject());
    
    return updated;
  }

  revisePolicy(policyId, context = {}) {
    this.permission.checkRevisePolicy(context);
    
    const policy = this.repository.findPolicyById(policyId);
    if (!policy) throw new Error('Policy not found');

    this.rule.checkStatusTransition(policy.status, 'UNDER_REVISION');
    
    policy.status = 'UNDER_REVISION';
    const updated = this.repository.updatePolicy(policy);
    
    if (this.eventBus) this.eventBus.publish('PolicyRevisionStarted', updated.toObject());
    return updated;
  }

  archivePolicy(policyId, context = {}) {
    this.permission.checkArchivePolicy(context);
    
    const policy = this.repository.findPolicyById(policyId);
    if (!policy) throw new Error('Policy not found');

    this.rule.checkStatusTransition(policy.status, 'ARCHIVED');
    
    policy.status = 'ARCHIVED';
    const updated = this.repository.updatePolicy(policy);
    
    if (this.eventBus) this.eventBus.publish('PolicyArchived', updated.toObject());
    return updated;
  }
}

module.exports = { PolicyService };

