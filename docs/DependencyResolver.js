/**
 * @class DependencyResolver
 * @description Determines the default dependencies for a new package based on its type.
 */
class DependencyResolver {
  constructor() {
    /** @private */
    this.dependencyMap = {
      'BusinessPackage': ['core', 'system', 'eventbus', 'notification', 'analytics'],
      'DashboardPackage': ['core', 'system', 'analytics', 'dashboard'],
      'CorePackage': ['core'],
      'UtilityPackage': ['core']
    };
  }

  /**
   * Resolves dependencies for a given package type.
   * @param {string} packageType - The type of package (e.g., 'BusinessPackage').
   * @returns {string[]} An array of dependency package IDs.
   */
  resolve(packageType) {
    WK.logger().debug(`Resolving dependencies for package type: ${packageType}`);
    const dependencies = this.dependencyMap[packageType] || ['core', 'system'];
    WK.logger().info(`Resolved dependencies: [${dependencies.join(', ')}]`);
    return dependencies;
  }
}