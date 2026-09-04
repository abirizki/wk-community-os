/**
 * @class DocumentationDiscovery
 * @description Scans all packages to discover documentation assets.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DocumentationDiscovery {
  /**
   * @param {PackageManager} packageManager
   * @param {APIRegistry} apiRegistry
   */
  constructor(packageManager, apiRegistry) {
    /** @private */
    this.packageManager = packageManager;
    /** @private */
    this.apiRegistry = apiRegistry;
  }

  /**
   * Discovers all documentation assets across all packages.
   * @returns {Array<object>} An array of document descriptors.
   */
  discoverAll() {
    const allDocs = [];
    const packages = this.packageManager.getAllPackages();

    for (const pkg of packages) {
      // Discover README.md
      allDocs.push({
        id: `${pkg.id}.readme`,
        title: `${pkg.name} - Overview`,
        type: 'Developer',
        packageId: pkg.id,
        sourcePath: `packages/${pkg.id}/README.md`
      });

      // [TODO: Discover files in docs/ subdirectories]

    }

    // Discover API Docs from APIRegistry
    // [TODO: Implement logic to create API documentation from apiRegistry]

    return allDocs;
  }
}