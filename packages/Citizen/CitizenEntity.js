/**
 * @file CitizenEntity.js
 * @description Core Domain Entities for the Citizen (Demographics) module.
 */

const crypto = require('crypto');

class CitizenConstants {
  static get GENDERS() {
    return ['L', 'P'];
  }
  static get MARITAL_STATUSES() {
    return ['BELUM_KAWIN', 'KAWIN', 'CERAI_HIDUP', 'CERAI_MATI'];
  }
  static get FAMILY_RELATIONS() {
    return ['KEPALA_KELUARGA', 'SUAMI', 'ISTRI', 'ANAK', 'MENANTU', 'CUCU', 'ORANGTUA', 'MERTUA', 'FAMILI_LAIN', 'PEMBANTU', 'LAINNYA'];
  }
  static get RESIDENCY_STATUSES() {
    return ['ACTIVE', 'TEMPORARY', 'MOVED_OUT', 'DECEASED'];
  }
  static get REGION_LEVELS() {
    return ['PROVINSI', 'KABUPATEN', 'KECAMATAN', 'KELURAHAN', 'RW', 'RT'];
  }
}

class AdministrativeRegion {
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || '';
    this.level = data.level || 'RT';
    this.parentId = data.parentId || null;
    
    // WK Standard Audit Trail
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version !== undefined ? data.version : 1;
  }

  toObject() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      parentId: this.parentId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version
    };
  }

  static fromObject(data) {
    return new AdministrativeRegion(data);
  }
}

class Family {
  constructor(data = {}) {
    this.id = data.id || ''; // kk_id
    this.regionId = data.regionId || '';
    this.address = data.address || '';
    this.headOfFamilyId = data.headOfFamilyId || null;

    // WK Standard Audit Trail
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version !== undefined ? data.version : 1;
  }

  toObject() {
    return {
      id: this.id,
      regionId: this.regionId,
      address: this.address,
      headOfFamilyId: this.headOfFamilyId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version
    };
  }

  static fromObject(data) {
    return new Family(data);
  }

  toDisplay() {
    const obj = this.toObject();
    
    // Privacy protection: Masking 16 digit ID (KK)
    if (obj.id && obj.id.length >= 12) {
      const visible = obj.id.slice(-4);
      const masked = '*'.repeat(obj.id.length - 4);
      obj.id = masked + visible;
    }

    // Strip internal metadata
    delete obj.deletedAt;
    delete obj.deletedBy;

    return obj;
  }
}

class Citizen {
  constructor(data = {}) {
    this.id = data.id || ''; // warga_id / NIK
    this.familyId = data.familyId || '';
    this.fullName = data.fullName || '';
    this.birthDate = data.birthDate || null;
    this.gender = data.gender || 'L';
    this.religion = data.religion || '';
    this.occupation = data.occupation || '';
    this.maritalStatus = data.maritalStatus || 'BELUM_KAWIN';
    this.familyRelation = data.familyRelation || 'LAINNYA';
    this.residencyStatus = data.residencyStatus || 'ACTIVE';

    // WK Standard Audit Trail
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = data.version !== undefined ? data.version : 1;
  }

  toObject() {
    return {
      id: this.id,
      familyId: this.familyId,
      fullName: this.fullName,
      birthDate: this.birthDate,
      gender: this.gender,
      religion: this.religion,
      occupation: this.occupation,
      maritalStatus: this.maritalStatus,
      familyRelation: this.familyRelation,
      residencyStatus: this.residencyStatus,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version
    };
  }

  static fromObject(data) {
    return new Citizen(data);
  }

  toDisplay() {
    const obj = this.toObject();

    // Privacy protection: Masking 16 digit ID (NIK)
    if (obj.id && obj.id.length >= 12) {
      const visible = obj.id.slice(-4);
      const masked = '*'.repeat(obj.id.length - 4);
      obj.id = masked + visible;
    }

    // Strip internal metadata
    delete obj.deletedAt;
    delete obj.deletedBy;

    return obj;
  }
}

module.exports = {
  CitizenConstants,
  AdministrativeRegion,
  Family,
  Citizen
};

