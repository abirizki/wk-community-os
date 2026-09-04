/**
 * Represents a citizen domain entity.
 * @class
 */
class CitizenEntity {
  /**
   * Creates a citizen entity.
   * @param {Object} payload - Citizen payload.
   */
  constructor(payload) {
    this.citizenId = payload.citizenId || `citizen-${Date.now()}`;
    this.nik = payload.nik || '';
    this.kkNumber = payload.kkNumber || '';
    this.fullName = payload.fullName || '';
    this.gender = payload.gender || '';
    this.birthPlace = payload.birthPlace || '';
    this.birthDate = payload.birthDate || '';
    this.religion = payload.religion || '';
    this.education = payload.education || '';
    this.occupation = payload.occupation || '';
    this.maritalStatus = payload.maritalStatus || '';
    this.citizenship = payload.citizenship || '';
    this.phone = payload.phone || '';
    this.email = payload.email || '';
    this.photo = payload.photo || '';
    this.address = payload.address || '';
    this.province = payload.province || '';
    this.city = payload.city || '';
    this.district = payload.district || '';
    this.village = payload.village || '';
    this.rw = payload.rw || '';
    this.rt = payload.rt || '';
    this.residentStatus = payload.residentStatus || 'Active';
    this.livingStatus = payload.livingStatus || 'Living';
    this.familyId = payload.familyId || '';
    this.birthRecord = payload.birthRecord || null;
    this.deathRecord = payload.deathRecord || null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CitizenEntity };
}
