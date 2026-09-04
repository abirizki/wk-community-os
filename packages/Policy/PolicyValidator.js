/**
 * @file PolicyValidator.js
 * @description Payload validator for the Policy module.
 */

class PolicyValidator {
  validatePolicyCreate(payload) {
    const errors = [];
    if (!payload.policyNumber) errors.push('policyNumber is required');
    if (!payload.title) errors.push('title is required');
    if (!payload.category) errors.push('category is required');
    if (!payload.scopeType) errors.push('scopeType is required');
    if (!payload.scopeId) errors.push('scopeId is required');
    if (!payload.targetRole) errors.push('targetRole is required');
    if (!payload.effectiveDate) errors.push('effectiveDate is required');

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join(', ')}`);
    }
  }

  validatePolicyUpdate(payload, currentPolicy) {
    const errors = [];
    // Immutable attributes check
    if (payload.scopeId && payload.scopeId !== currentPolicy.scopeId) {
      errors.push('scopeId is immutable');
    }
    if (payload.scopeType && payload.scopeType !== currentPolicy.scopeType) {
      errors.push('scopeType is immutable');
    }
    
    // Status check
    if (['ACTIVE', 'ARCHIVED', 'DEPRECATED'].includes(currentPolicy.status)) {
       // Only allow status changes during revision/archival, but not full payload mutability
       if (payload.title && payload.title !== currentPolicy.title) errors.push('title cannot be changed when active');
       if (payload.category && payload.category !== currentPolicy.category) errors.push('category cannot be changed when active');
    }

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join(', ')}`);
    }
  }

  validateProcedureAdd(payload) {
    const errors = [];
    if (!payload.policyId) errors.push('policyId is required');
    if (!payload.stepTitle) errors.push('stepTitle is required');
    if (!payload.instruction) errors.push('instruction is required');
    if (typeof payload.estimatedDurationMinutes !== 'number') errors.push('estimatedDurationMinutes is required and must be a number');

    if (errors.length > 0) {
      throw new Error(`Validation Error: ${errors.join(', ')}`);
    }
  }
}

module.exports = { PolicyValidator };

