/**
 * @file PolicyRule.js
 * @description Business rules and immutability logic for the Policy module.
 */

const { PolicyConstants } = require('./PolicyEntity.js');

class PolicyRule {
  checkValidCategory(category) {
    if (!PolicyConstants.CATEGORIES.includes(category)) {
      throw new Error(`Business Rule Violation: Invalid policy category '${category}'. Allowed: ${PolicyConstants.CATEGORIES.join(', ')}`);
    }
  }

  checkValidScopeType(scope) {
    if (!PolicyConstants.SCOPE_TYPES.includes(scope)) {
      throw new Error(`Business Rule Violation: Invalid policy scope type '${scope}'. Allowed: ${PolicyConstants.SCOPE_TYPES.join(', ')}`);
    }
  }

  checkValidTargetRole(role) {
    if (!PolicyConstants.TARGET_ROLES.includes(role)) {
      throw new Error(`Business Rule Violation: Invalid policy target role '${role}'. Allowed: ${PolicyConstants.TARGET_ROLES.join(', ')}`);
    }
  }

  checkStatusTransition(currentStatus, nextStatus) {
    const validTransitions = {
      'DRAFT': ['PENDING_APPROVAL'],
      'PENDING_APPROVAL': ['ACTIVE', 'DRAFT'], // DRAFT if rejected
      'ACTIVE': ['UNDER_REVISION', 'ARCHIVED', 'DEPRECATED'],
      'UNDER_REVISION': ['PENDING_APPROVAL', 'ACTIVE'],
      'ARCHIVED': [], // Terminal
      'DEPRECATED': [] // Terminal
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Business Rule Violation: Invalid policy status transition from '${currentStatus}' to '${nextStatus}'.`);
    }
  }

  checkImmutability(policy) {
    const immutableStatuses = ['ACTIVE', 'ARCHIVED', 'DEPRECATED'];
    if (immutableStatuses.includes(policy.status)) {
      throw new Error(`Business Rule Violation: Policy is immutable in status '${policy.status}'. Cannot directly mutate essential attributes. Use revise flow.`);
    }
  }

  checkApprovalIntegrity(policy, approverId) {
    if (!approverId) {
      throw new Error('Business Rule Violation: Approver ID must be provided to approve a policy.');
    }
    // Additional domain logic could verify if approverId matches the scopeId's head.
  }
}

module.exports = { PolicyRule };

