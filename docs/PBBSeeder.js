/**
 * @class PBBSeeder
 * @description Seeds initial or demo data for the PBB module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBSeeder {
  /**
   * @param {PBBService} pbbService
   * @param {CitizenService} citizenService
   * @param {HouseholdService} householdService
   */
  constructor(pbbService, citizenService, householdService) {
    /** @private */
    this.pbbService = pbbService;
    /** @private */
    this.citizenService = citizenService;
    /** @private */
    this.householdService = householdService;
  }

  /**
   * Runs the seeder to populate the database.
   */
  run() {
    WK.security().checkPermission('pbb.seed');
    WK.logger().info('Running PBB module seeder...');

    this._seedDemoTaxObjectsAndTaxpayers();
    this._seedDemoSPPTs();
    this._seedDemoPayments();

    WK.logger().info('PBB module seeder completed.');
  }

  /** @private */
  _seedDemoTaxObjectsAndTaxpayers() {
    const demoCitizens = this.citizenService.findAll({ limit: 5 });
    if (demoCitizens.length === 0) {
      WK.logger().warn('No demo citizens found to seed PBB data. Skipping.');
      return;
    }

    demoCitizens.forEach((citizen, index) => {
      // Seed Taxpayer
      if (!this.pbbService.taxpayerRepository.findByCitizenId(citizen.id)) {
        this.pbbService.registerTaxpayer({
          citizenId: citizen.id,
          taxpayerNumber: `WP-${citizen.nik.substring(0, 10)}-${index + 1}`
        });
        WK.logger().info(`Seeded taxpayer for citizen ${citizen.nama_lengkap}.`);
      }

      // Seed Tax Object (NOP)
      const household = this.householdService.getHouseholdById(citizen.householdId);
      if (household && !this.pbbService.taxObjectRepository.findByNop(household.pbbNumber)) {
        this.pbbService.registerTaxObject({
          nop: household.pbbNumber,
          address: household.address,
          landArea: household.landArea,
          buildingArea: household.buildingArea,
          ownerCitizenId: citizen.id
        });
        WK.logger().info(`Seeded tax object ${household.pbbNumber} for citizen ${citizen.nama_lengkap}.`);
      }
    });
  }

  /** @private */
  _seedDemoSPPTs() {
    const demoTaxpayers = this.pbbService.taxpayerRepository.findAll();
    const demoTaxObjects = this.pbbService.taxObjectRepository.findAll();

    if (demoTaxpayers.length > 0 && demoTaxObjects.length > 0 && this.pbbService.spptRepository.findAll().length === 0) {
      for (let i = 0; i < Math.min(demoTaxpayers.length, demoTaxObjects.length); i++) {
        const taxpayer = demoTaxpayers[i];
        const taxObject = demoTaxObjects[i];
        this.pbbService.issueSPPT({
          taxpayerId: taxpayer.id,
          taxObjectId: taxObject.id,
          taxYear: new Date().getFullYear(),
          taxAmount: Math.floor(Math.random() * 1000000) + 100000, // Rp 100,000 - 1,100,000
          dueDate: new Date(new Date().getFullYear(), 8, 30).toISOString() // Sept 30th of current year
        });
        WK.logger().info(`Seeded SPPT for NOP ${taxObject.nop}.`);
      }
    }
  }

  /** @private */
  _seedDemoPayments() {
    const issuedSPPTs = this.pbbService.spptRepository.findAll({ status: 'ISSUED' });
    if (issuedSPPTs.length > 0) {
      // Pay about 70% of issued SPPTs
      issuedSPPTs.slice(0, Math.floor(issuedSPPTs.length * 0.7)).forEach(sppt => {
        this.pbbService.recordPayment(sppt.id, {
          paymentDate: new Date().toISOString(),
          paymentAmount: sppt.taxAmount,
          paymentMethod: 'BANK_TRANSFER',
          transactionId: WK.helper().generateUuid()
        });
        WK.logger().info(`Seeded payment for SPPT ${sppt.spptNumber}.`);
      });
    }
  }
}