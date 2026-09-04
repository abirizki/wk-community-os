/**
 * @class ReferralPermission
 * @description Defines all permissions related to the Referral package.
 */
class ReferralPermission {
  /**
   * Returns an array of permission definitions for the Referral module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    const resource = 'referral.record';
    return [
      { id: `${resource}.create`, description: 'Create a new referral' },
      { id: `${resource}.read.own`, description: 'Read own referrals' },
      { id: `${resource}.read.all`, description: 'Read any referral' },
      { id: `${resource}.update.own`, description: 'Update own referrals' },
      { id: `${resource}.update.all`, description: 'Update any referral' },
      { id: `${resource}.delete`, description: 'Delete a referral' },
      { id: `${resource}.change.status`, description: 'Change referral status' },
      { id: `${resource}.accept`, description: 'Accept a pending referral' },
      { id: `${resource}.reject`, description: 'Reject a pending referral' },
      { id: `${resource}.cancel`, description: 'Cancel an active referral' },
      { id: `${resource}.complete`, description: 'Complete an in-progress referral' },
      { id: `${resource}.schedule_followup`, description: 'Schedule a follow-up for a referral' },
      { id: `${resource}.view.sensitive_notes`, description: 'View sensitive referral notes' },
      { id: 'referral.dashboard.view', description: 'View the main referral dashboard' },
      { id: 'referral.statistics.view', description: 'View referral statistics' },
    ];
  }
}

/**
 * Registers the permissions with the framework's security service.
 * This ensures the permissions are available system-wide.
 */
function registerReferralPermissions() {
  WK.permission('referral', ReferralPermission.getPermissions());
}