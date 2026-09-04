/**
 * @class GeneratorEngine
 * @description The main orchestrator for all code generation tasks.
 */
class GeneratorEngine {
  /**
   * @param {PackageValidator} validator
   * @param {PackageBuilder} builder
   * @param {GeneratorConfig} config
   */
  constructor(validator, builder, config) {
    /** @private */
    this.validator = validator;
    /** @private */
    this.builder = builder;
    /** @private */
    this.config = config;
  }

  /**
   * Executes a generation command.
   * @param {string} command - The primary command (e.g., 'package', 'service').
   * @param {string} name - The name of the component to generate (e.g., 'Health').
   * @param {object} [options={}] - Additional options for generation.
   * @returns {object} A result object indicating success or failure.
   */
  execute(command, name, options = {}) {
    WK.logger().info(`GeneratorEngine executing command '${command}' for '${name}' with options: ${JSON.stringify(options)}`);

    try {
      switch (command) {
        case 'package':
          return this.generatePackage(name, options);
        // Add cases for 'service', 'controller', etc. here
        default:
          throw new Error(`Unknown command: ${command}`);
      }
    } catch (error) {
      WK.logger().error(`Generation failed: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generates a new package.
   * @private
   * @param {string} packageName - The name of the package.
   * @param {object} options - Options for the package.
   */
  generatePackage(packageName, options) {
    // 1. Validate the request
    this.validator.validatePackageName(packageName);
    this.validator.ensurePackageDoesNotExist(packageName);

    // 2. Build the package
    const result = this.builder.build(packageName, options);

    const successMessage = `Package '${packageName}' generated successfully at '${result.path}'.`;
    WK.logger().info(successMessage);
    return { success: true, message: successMessage, data: result };
  }
}