/**
 * @file PolicyRepository.js
 * @description Data access layer for policies and policy_procedures tables.
 */

// Basic mock BaseRepository for standalone environments without a real BaseRepository.
class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
}

const { Policy, PolicyProcedure } = require('./PolicyEntity.js');

class PolicyRepository extends BaseRepository {
  constructor() {
    super('policies');
    this.proceduresTable = 'policy_procedures';
  }

  createPolicy(policy) {
    if (!this.dbAdapter) return policy;
    const obj = policy.toObject();
    this.dbAdapter.create(this.tableName, obj);
    return policy;
  }

  findPolicyById(id) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.tableName, { id });
    return Policy.fromObject(record);
  }

  findByPolicyNumber(policyNumber) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.tableName, { policyNumber });
    return Policy.fromObject(record);
  }

  updatePolicy(policy) {
    if (!this.dbAdapter) return policy;
    const obj = policy.toObject();
    obj.version += 1; // Optimistic locking
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.tableName, { id: policy.id }, obj);
    policy.version = obj.version;
    policy.updatedAt = obj.updatedAt;
    return policy;
  }

  deletePolicy(id) {
    if (!this.dbAdapter) return false;
    this.dbAdapter.update(this.tableName, { id }, { deletedAt: new Date().toISOString() });
    return true;
  }

  addProcedure(procedure) {
    if (!this.dbAdapter) return procedure;
    const obj = procedure.toObject();
    this.dbAdapter.create(this.proceduresTable, obj);
    return procedure;
  }

  findProceduresByPolicyId(policyId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.proceduresTable, { policyId });
    return records.map(r => PolicyProcedure.fromObject(r));
  }
}

module.exports = { PolicyRepository };

