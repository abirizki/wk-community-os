/**
 * @file PosyanduRepository.js
 * @description Data access layer for posyandu_members and posyandu_records tables.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

const { PosyanduMember, PosyanduRecord } = require('./PosyanduEntity.js');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
}

class PosyanduRepository extends BaseRepository {
  constructor() {
    super('posyandu_members');
    this.recordTableName = 'posyandu_records';
  }

  // --- PosyanduMember Operations ---

  createMember(member) {
    if (!this.dbAdapter) return member;
    this.dbAdapter.create(this.tableName, member.toObject());
    return member;
  }

  updateMember(member) {
    if (!this.dbAdapter) return member;
    const obj = member.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.tableName, { id: member.id }, obj);
    member.version = obj.version;
    member.updatedAt = obj.updatedAt;
    return member;
  }

  findMemberById(id) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.tableName, { id });
    return record ? PosyanduMember.fromObject(record) : null;
  }

  findMembersByCitizenId(citizenId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { citizenId });
    return records.map(r => PosyanduMember.fromObject(r));
  }

  findMembersByTargetGroup(targetGroup) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { targetGroup });
    return records.map(r => PosyanduMember.fromObject(r));
  }

  findAllMembers() {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, {});
    return records.map(r => PosyanduMember.fromObject(r));
  }

  // --- PosyanduRecord Operations ---

  createRecord(record) {
    if (!this.dbAdapter) return record;
    this.dbAdapter.create(this.recordTableName, record.toObject());
    return record;
  }

  updateRecord(record) {
    if (!this.dbAdapter) return record;
    const obj = record.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.recordTableName, { id: record.id }, obj);
    record.version = obj.version;
    record.updatedAt = obj.updatedAt;
    return record;
  }

  findRecordById(id) {
    if (!this.dbAdapter) return null;
    const rec = this.dbAdapter.findOne(this.recordTableName, { id });
    return rec ? PosyanduRecord.fromObject(rec) : null;
  }

  findRecordsByMemberId(memberId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.recordTableName, { memberId });
    // Sort descending by visitDate
    records.sort((a, b) => new Date(b.visitDate || 0) - new Date(a.visitDate || 0));
    return records.map(r => PosyanduRecord.fromObject(r));
  }

  findLatestRecordByMemberId(memberId) {
    const list = this.findRecordsByMemberId(memberId);
    return list.length > 0 ? list[0] : null;
  }

  findAllRecords() {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.recordTableName, {});
    return records.map(r => PosyanduRecord.fromObject(r));
  }
}

module.exports = { PosyanduRepository };

