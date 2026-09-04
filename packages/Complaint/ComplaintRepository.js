/**
 * @file ComplaintRepository.js
 * @description Data access layer for complaints table.
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

const { Complaint } = require('./ComplaintEntity.js');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
}

class ComplaintRepository extends BaseRepository {
  constructor() {
    super('complaints');
  }

  createComplaint(complaint) {
    if (!this.dbAdapter) return complaint;
    this.dbAdapter.create(this.tableName, complaint.toObject());
    return complaint;
  }

  updateComplaint(complaint) {
    if (!this.dbAdapter) return complaint;
    const obj = complaint.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.tableName, { id: complaint.id }, obj);
    complaint.version = obj.version;
    complaint.updatedAt = obj.updatedAt;
    return complaint;
  }

  findComplaintById(id) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.tableName, { id });
    return record ? Complaint.fromObject(record) : null;
  }

  findComplaintsByCitizen(citizenId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { citizenId });
    return records.map(r => Complaint.fromObject(r));
  }

  findComplaintsByStatus(status) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { status });
    return records.map(r => Complaint.fromObject(r));
  }

  findComplaintsByAssignee(assignedOfficerId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { assignedOfficerId });
    return records.map(r => Complaint.fromObject(r));
  }

  findAllComplaints() {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, {});
    return records.map(r => Complaint.fromObject(r));
  }
}

module.exports = { ComplaintRepository };

