/**
 * @file CitizenRepository.js
 * @description Data access layer for administrative_regions, families, and citizens.
 */

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
    this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
}

const { AdministrativeRegion, Family, Citizen } = require('./CitizenEntity.js');

class CitizenRepository extends BaseRepository {
  constructor() {
    super('citizens');
    this.familyTable = 'families';
    this.regionTable = 'administrative_regions';
  }

  createRegion(region) {
    if (!this.dbAdapter) return region;
    this.dbAdapter.create(this.regionTable, region.toObject());
    return region;
  }

  createFamily(family) {
    if (!this.dbAdapter) return family;
    this.dbAdapter.create(this.familyTable, family.toObject());
    return family;
  }

  createCitizen(citizen) {
    if (!this.dbAdapter) return citizen;
    this.dbAdapter.create(this.tableName, citizen.toObject());
    return citizen;
  }

  updateCitizen(citizen) {
    if (!this.dbAdapter) return citizen;
    const obj = citizen.toObject();
    obj.version += 1;
    obj.updatedAt = new Date().toISOString();
    this.dbAdapter.update(this.tableName, { id: citizen.id }, obj);
    citizen.version = obj.version;
    citizen.updatedAt = obj.updatedAt;
    return citizen;
  }

  findCitizenByNik(nik) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.tableName, { id: nik });
    return record ? Citizen.fromObject(record) : null;
  }

  findFamilyByKk(kk) {
    if (!this.dbAdapter) return null;
    const record = this.dbAdapter.findOne(this.familyTable, { id: kk });
    return record ? Family.fromObject(record) : null;
  }

  findMembersByFamilyId(familyId) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.tableName, { familyId });
    return records.map(r => Citizen.fromObject(r));
  }

  findRegionsByLevel(level) {
    if (!this.dbAdapter) return [];
    const records = this.dbAdapter.search(this.regionTable, { level });
    return records.map(r => AdministrativeRegion.fromObject(r));
  }
}

module.exports = { CitizenRepository };

