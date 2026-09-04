/**
 * @class ReleaseService
 * @description The main service facade for all release management operations.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReleaseService {
  /**
   * @param {ReleaseManager} releaseManager
   * @param {UpgradeService} upgradeService
   * @param {RollbackService} rollbackService
   */
  constructor(releaseManager, upgradeService, rollbackService) {
    /** @private */
    this.releaseManager = releaseManager;
    /** @private */
    this.upgradeService = upgradeService;
    /** @private */
    this.rollbackService = rollbackService;
  }

  /**
   * Creates a new release candidate.
   * @param {string} version - The proposed semantic version for the new release (e.g., '1.1.0').
   * @param {string} releaseType - 'MAJOR', 'MINOR', or 'PATCH'.
   * @returns {object} A release candidate object.
   */
  createRelease(version, releaseType) {
    WK.security().checkPermission('releasecenter.release.create');
    return this.releaseManager.createRelease(version, releaseType);
  }

  /**
   * Initiates an upgrade to a specific release version.
   * @param {string} releaseId - The ID of the release to upgrade to.
   * @returns {object} A summary of the upgrade process.
   */
  upgradeToRelease(releaseId) {
    WK.security().checkPermission('releasecenter.upgrade.run');
    return this.upgradeService.runUpgrade(releaseId);
  }

  /**
   * Initiates a rollback to the previous stable version.
   * @returns {object} A summary of the rollback process.
   */
  rollbackToPrevious() {
    WK.security().checkPermission('releasecenter.rollback.run');
    return this.rollbackService.runRollback();
  }
}