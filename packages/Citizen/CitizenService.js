/**
 * @file CitizenService.js
 * @description Application service orchestrating business rules and persistence for Citizen module.
 */

const { AdministrativeRegion, Family, Citizen } = require('./CitizenEntity.js');
const { CitizenPermission } = require('./CitizenPermission.js');
const { CitizenRule } = require('./CitizenRule.js');
const { CitizenValidator } = require('./CitizenValidator.js');

class CitizenService {
  constructor(repository) {
    this.repository = repository;
    this.permission = new CitizenPermission();
    this.rule = new CitizenRule();
    this.validator = new CitizenValidator();
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('CitizenService') : console;
    this.eventBus = typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null;
  }

  registerRegion(payload, context = {}) {
    this.permission.checkCreate(context);
    this.validator.validateRegionCreate(payload);

    const region = new AdministrativeRegion(payload);
    const saved = this.repository.createRegion(region);

    if (this.logger.info) this.logger.info(`AdministrativeRegion registered: ${saved.id} - ${saved.name}`);
    if (this.eventBus) this.eventBus.publish('RegionRegistered', saved.toObject());
    return saved;
  }

  registerFamily(payload, context = {}) {
    this.permission.checkCreate(context);
    this.validator.validateFamilyCreate(payload);

    const existingFamily = this.repository.findFamilyByKk(payload.id);
    this.rule.checkUniqueKk(payload.id, existingFamily);

    const family = new Family(payload);
    const saved = this.repository.createFamily(family);

    if (this.logger.info) this.logger.info(`Family registered: ${saved.id}`);
    if (this.eventBus) this.eventBus.publish('FamilyRegistered', saved.toObject());
    return saved;
  }

  registerCitizen(payload, context = {}) {
    this.permission.checkCreate(context);
    this.validator.validateCitizenRegister(payload);

    this.rule.checkValidGender(payload.gender);
    this.rule.checkValidMaritalStatus(payload.maritalStatus || 'BELUM_KAWIN');
    this.rule.checkValidFamilyRelation(payload.familyRelation || 'LAINNYA');

    const existingCitizen = this.repository.findCitizenByNik(payload.id);
    this.rule.checkUniqueNik(payload.id, existingCitizen);

    const citizen = new Citizen(payload);
    const saved = this.repository.createCitizen(citizen);

    if (this.logger.info) this.logger.info(`Citizen registered: ${saved.id}`);
    if (this.eventBus) this.eventBus.publish('CitizenRegistered', saved.toObject());
    return saved;
  }

  updateResidencyStatus(nik, newStatus, context = {}) {
    this.permission.checkUpdateStatus(context);
    this.rule.checkValidResidencyStatus(newStatus);

    const citizen = this.repository.findCitizenByNik(nik);
    if (!citizen) throw new Error(`Citizen not found with NIK ${nik}`);

    this.rule.checkResidencyTransition(citizen.residencyStatus, newStatus);

    const oldStatus = citizen.residencyStatus;
    citizen.residencyStatus = newStatus;
    
    const updated = this.repository.updateCitizen(citizen);

    if (this.logger.info) this.logger.info(`Citizen residency status updated from ${oldStatus} to ${newStatus} for NIK ${nik}`);
    if (this.eventBus) this.eventBus.publish('CitizenStatusUpdated', updated.toObject());
    return updated;
  }
}

module.exports = { CitizenService };

