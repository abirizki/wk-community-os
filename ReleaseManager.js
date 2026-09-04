/**
 * @class ReleaseManager
 * @description Manages the process of creating a new release candidate.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReleaseManager {
  /**
   * @param {VersionManager} versionManager
   * @param {ReleaseNotesGenerator} releaseNotesGenerator
   * @param {PackageRegistry} packageRegistry
   * @param {QualityGateService} qualityGateService
   */
  constructor(versionManager, releaseNotesGenerator, packageRegistry, qualityGateService) {
    /** @private */
    this.versionManager = versionManager;
    /** @private */
    this.releaseNotesGenerator = releaseNotesGenerator;
    /** @private */
    this.packageRegistry = packageRegistry;
    /** @private */
    this.qualityGateService = qualityGateService;
  }

  /**
   * Creates a new release candidate.
   * @param {string} version - The proposed semantic version.
   * @param {string} releaseType - 'MAJOR', 'MINOR', or 'PATCH'.
   * @returns {object} The release candidate object.
   */
  createRelease(version, releaseType) {
    WK.logger().info(`Creating new release candidate for version ${version}...`);

    // 1. Validate version
    this.versionManager.validateNewVersion(version, releaseType);

    // 2. Get changed packages
    const changedPackages = this.packageRegistry.getChangedPackagesSinceLastRelease();

    // 3. Run Quality Gate on all changed packages
    const qualityGateResult = this.qualityGateService.runOnPackages(changedPackages);
    if (qualityGateResult.status === 'FAIL') {
      throw new Error(`Quality Gate failed. Cannot create release. Issues: ${JSON.stringify(qualityGateResult.findings)}`);
    }

    // 4. Generate release notes
    const releaseNotes = this.releaseNotesGenerator.generate(changedPackages);

    // 5. [TODO: Create and store the release manifest/bundle]
    WK.logger().info(`Release candidate ${version} created successfully.`);
    return { version, releaseNotes, packages: changedPackages };
  }
}