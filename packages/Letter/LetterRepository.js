/**
 * @file LetterRepository.js
 * @description Data access layer for letters table.
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

const { Letter } = require('./LetterEntity.js');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
}

class LetterRepository extends BaseRepository {
  constructor() {
    super('letters');
  }

  createLetter(letter) {
    if (!this.dbAdapter) return letter;
    this.dbAdapter.create(this.tableName, letter.toObject());
    return letter;
  }

  updateLetter(letter) {
    if (!this.dbAdapter) return letter;
    const obj = letter.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.tableName, { id: letter.id }, obj);
    letter.version = obj.version;
    letter.updatedAt = obj.updatedAt;
    return letter;
  }

  findLetterById(id) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.tableName, { id });
    return record ? Letter.fromObject(record) : null;
  }

  findLettersByCitizen(citizenId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { citizenId });
    return records.map(r => Letter.fromObject(r));
  }

  findLettersByStatus(status) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { status });
    return records.map(r => Letter.fromObject(r));
  }

  findAllLetters() {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, {});
    return records.map(r => Letter.fromObject(r));
  }
}

module.exports = { LetterRepository };

