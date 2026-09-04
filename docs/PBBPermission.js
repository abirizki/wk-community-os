/**
 * @class PBBPermission
 * @description Defines all permissions related to the PBB module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBPermission {
  /**
   * Returns an array of permission definitions for the PBB module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'pbb.view', description: 'View all PBB data' },
      { id: 'pbb.tax_object.create', description: 'Register new tax objects (NOP)' },
      { id: 'pbb.tax_object.view', description: 'View tax object details' },
      { id: 'pbb.tax_object.update', description: 'Update tax object details' },
      { id: 'pbb.taxpayer.create', description: 'Register new taxpayers' },
      { id: 'pbb.taxpayer.view', description: 'View taxpayer details' },
      { id: 'pbb.taxpayer.update', description: 'Update taxpayer details' },
      { id: 'pbb.sppt.issue', description: 'Issue new SPPTs' },
      { id: 'pbb.sppt.view', description: 'View SPPT details' },
      { id: 'pbb.sppt.update', description: 'Update SPPT status' },
      { id: 'pbb.payment.record', description: 'Record PBB payments' },
      { id: 'pbb.payment.view', description: 'View payment history' },
      { id: 'pbb.arrears.view', description: 'View PBB arrears' },
      { id: 'pbb.arrears.followup', description: 'Initiate follow-up for PBB arrears' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('pbb', PBBPermission.getPermissions());