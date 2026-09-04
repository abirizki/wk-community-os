/**
 * @file PosyanduEntity.js
 * @description Core Domain Entities for the Posyandu (Community Health Services) module.
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 * @blueprint DOC-014
 */

const crypto = require('crypto');

class PosyanduConstants {
  /**
   * Kelompok sasaran layanan Posyandu.
   */
  static get TARGET_GROUPS() {
    return ['BALITA', 'IBU_HAMIL', 'LANSIA'];
  }

  /**
   * Status gizi balita berdasarkan rasio berat & tinggi badan (WHO Z-Score).
   */
  static get NUTRITION_STATUSES() {
    return ['GIZI_BAIK', 'GIZI_KURANG', 'GIZI_BURUK', 'GIZI_LEBIH'];
  }

  /**
   * Status stunting balita berdasarkan rasio tinggi/panjang badan menurut umur (PB/U atau TB/U).
   */
  static get STUNTING_STATUSES() {
    return ['NORMAL', 'STUNTED', 'SEVERELY_STUNTED'];
  }

  /**
   * Status tahapan kunjungan rekam medis Posyandu.
   */
  static get VISIT_STATUSES() {
    return ['SCHEDULED', 'COMPLETED', 'FOLLOW_UP_NEEDED'];
  }

  /**
   * Daftar jenis vaksin imunisasi dasar lengkap.
   */
  static get IMMUNIZATION_TYPES() {
    return [
      'HB0',
      'BCG',
      'POLIO_1',
      'DPT_HB_HIB_1',
      'POLIO_2',
      'DPT_HB_HIB_2',
      'POLIO_3',
      'DPT_HB_HIB_3',
      'POLIO_4',
      'IPV',
      'CAMPAK_RUBELLA',
    ];
  }
}

class PosyanduMember {
  /**
   * @param {Object} data - Partial or full PosyanduMember payload.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.citizenId = data.citizenId || ''; // FK → Citizen.id (NIK)
    this.parentCitizenId = data.parentCitizenId || null; // FK → Citizen.id (NIK Ortu/Wali)
    this.targetGroup = data.targetGroup || 'BALITA';
    this.posyanduName = data.posyanduName || '';
    this.dateOfBirth = data.dateOfBirth || '';
    this.gender = data.gender || 'L';
    this.bloodType = data.bloodType || null;
    this.chronicDiseases = data.chronicDiseases || null;
    this.hpht = data.hpht || null;
    this.estimatedDueDate = data.estimatedDueDate || null;

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
      citizenId: this.citizenId,
      parentCitizenId: this.parentCitizenId,
      targetGroup: this.targetGroup,
      posyanduName: this.posyanduName,
      dateOfBirth: this.dateOfBirth,
      gender: this.gender,
      bloodType: this.bloodType,
      chronicDiseases: this.chronicDiseases,
      hpht: this.hpht,
      estimatedDueDate: this.estimatedDueDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  static fromObject(data) {
    return new PosyanduMember(data);
  }

  /**
   * Privacy-Safe presentation representation with NIK masking (PHI/PII Protection).
   * @returns {Object}
   */
  toDisplay() {
    const maskNIK = (nik) => {
      if (!nik || typeof nik !== 'string') return nik;
      if (nik.length >= 12) {
        return '*'.repeat(nik.length - 4) + nik.slice(-4);
      }
      return nik;
    };

    const obj = this.toObject();
    obj.citizenId = maskNIK(obj.citizenId);
    if (obj.parentCitizenId) {
      obj.parentCitizenId = maskNIK(obj.parentCitizenId);
    }
    delete obj.deletedAt;
    delete obj.deletedBy;
    return obj;
  }
}

class PosyanduRecord {
  /**
   * @param {Object} data - Partial or full PosyanduRecord payload.
   */
  constructor(data = {}) {
    this.id = data.id || crypto.randomUUID();
    this.memberId = data.memberId || ''; // FK → PosyanduMember.id
    this.visitDate = data.visitDate || new Date().toISOString().slice(0, 10);
    this.ageInMonths = data.ageInMonths !== undefined ? Number(data.ageInMonths) : 0;
    this.weightKg = data.weightKg !== undefined ? Number(data.weightKg) : 0;
    this.heightCm = data.heightCm !== undefined ? Number(data.heightCm) : 0;
    this.headCircumferenceCm = data.headCircumferenceCm !== undefined && data.headCircumferenceCm !== null ? Number(data.headCircumferenceCm) : null;
    this.armCircumferenceCm = data.armCircumferenceCm !== undefined && data.armCircumferenceCm !== null ? Number(data.armCircumferenceCm) : null;
    this.systolic = data.systolic !== undefined && data.systolic !== null ? Number(data.systolic) : null;
    this.diastolic = data.diastolic !== undefined && data.diastolic !== null ? Number(data.diastolic) : null;
    this.bloodSugarMgDl = data.bloodSugarMgDl !== undefined && data.bloodSugarMgDl !== null ? Number(data.bloodSugarMgDl) : null;
    this.cholesterolMgDl = data.cholesterolMgDl !== undefined && data.cholesterolMgDl !== null ? Number(data.cholesterolMgDl) : null;

    // Automated evaluation results
    this.nutritionStatus = data.nutritionStatus || null;
    this.stuntingStatus = data.stuntingStatus || null;
    this.isHighRisk = Boolean(data.isHighRisk);
    this.riskNotes = data.riskNotes || null;
    this.vitaminOrPMT = data.vitaminOrPMT || null;
    this.immunizationGiven = data.immunizationGiven || null;
    this.status = data.status || 'SCHEDULED';

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
      memberId: this.memberId,
      visitDate: this.visitDate,
      ageInMonths: this.ageInMonths,
      weightKg: this.weightKg,
      heightCm: this.heightCm,
      headCircumferenceCm: this.headCircumferenceCm,
      armCircumferenceCm: this.armCircumferenceCm,
      systolic: this.systolic,
      diastolic: this.diastolic,
      bloodSugarMgDl: this.bloodSugarMgDl,
      cholesterolMgDl: this.cholesterolMgDl,
      nutritionStatus: this.nutritionStatus,
      stuntingStatus: this.stuntingStatus,
      isHighRisk: this.isHighRisk,
      riskNotes: this.riskNotes,
      vitaminOrPMT: this.vitaminOrPMT,
      immunizationGiven: this.immunizationGiven,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  static fromObject(data) {
    return new PosyanduRecord(data);
  }

  /**
   * Privacy-Safe presentation representation.
   * @returns {Object}
   */
  toDisplay() {
    const obj = this.toObject();
    delete obj.deletedAt;
    delete obj.deletedBy;
    return obj;
  }
}

module.exports = {
  PosyanduConstants,
  PosyanduMember,
  PosyanduRecord,
};

