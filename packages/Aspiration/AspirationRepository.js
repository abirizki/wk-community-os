/**
 * @file AspirationRepository.js
 * @description Data access layer for aspirations and aspiration_votes tables.
 * @domain CommunityDemocracy
 * @package Aspiration (Epic Aspiration / P70)
 */

const { Aspiration, AspirationVote } = require('./AspirationEntity.js');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
}

class AspirationRepository extends BaseRepository {
  constructor() {
    super('aspirations');
    this.voteTableName = 'aspiration_votes';
  }

  // --- Aspiration operations ---

  createAspiration(aspiration) {
    if (!this.dbAdapter) return aspiration;
    this.dbAdapter.create(this.tableName, aspiration.toObject());
    return aspiration;
  }

  updateAspiration(aspiration) {
    if (!this.dbAdapter) return aspiration;
    const obj = aspiration.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.tableName, { id: aspiration.id }, obj);
    aspiration.version = obj.version;
    aspiration.updatedAt = obj.updatedAt;
    return aspiration;
  }

  findAspirationById(id) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.tableName, { id });
    return record ? Aspiration.fromObject(record) : null;
  }

  findAspirationsByCitizen(citizenId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { citizenId });
    return records.map(r => Aspiration.fromObject(r));
  }

  findAspirationsByStatus(status) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { status });
    return records.map(r => Aspiration.fromObject(r));
  }

  findAllAspirations() {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, {});
    return records.map(r => Aspiration.fromObject(r));
  }

  // --- AspirationVote operations ---

  saveVote(vote) {
    if (!this.dbAdapter) return vote;
    this.dbAdapter.create(this.voteTableName, vote.toObject());
    return vote;
  }

  findVoteByCitizen(aspirationId, citizenId) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.voteTableName, { aspirationId, citizenId });
    return record ? AspirationVote.fromObject(record) : null;
  }

  findVotesByAspiration(aspirationId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.voteTableName, { aspirationId });
    return records.map(r => AspirationVote.fromObject(r));
  }

  incrementVoteCount(aspirationId) {
    const asp = this.findAspirationById(aspirationId);
    if (!asp) return null;
    asp.voteCount = (asp.voteCount || 0) + 1;
    return this.updateAspiration(asp);
  }
}

module.exports = { AspirationRepository };

