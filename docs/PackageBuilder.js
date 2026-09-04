/**
 * @class PackageBuilder
 * @description Constructs a new package from templates and configuration.
 */
class PackageBuilder {
  /**
   * @param {FolderGenerator} folderGenerator
   * @param {FileGenerator} fileGenerator
   * @param {DependencyResolver} dependencyResolver
   * @param {TemplateRegistry} templateRegistry
   */
  constructor(folderGenerator, fileGenerator, dependencyResolver, templateRegistry) {
    /** @private */
    this.folderGenerator = folderGenerator;
    /** @private */
    this.fileGenerator = fileGenerator;
    /** @private */
    this.dependencyResolver = dependencyResolver;
    /** @private */
    this.templateRegistry = templateRegistry;
  }

  /**
   * Builds a complete package structure.
   * @param {string} packageName - The name of the package (e.g., 'Health').
   * @param {object} options - Generation options.
   * @returns {object} An object containing details of the generated package.
   */
  build(packageName, options) {
    const packagePath = `packages/${packageName}`;
    WK.logger().info(`Building package '${packageName}' at path '${packagePath}'...`);

    // 1. Create the folder structure
    this.folderGenerator.createPackageStructure(packageName);

    // 2. Prepare template variables
    const vars = {
      packageName: packageName,
      entityName: `${packageName}Entity`,
      serviceName: `${packageName}Service`,
      controllerName: `${packageName}Controller`,
      repositoryName: `${packageName}Repository`,
      // ... and so on
    };

    // 3. Generate standard files from templates
    const templates = this.templateRegistry.getTemplatesFor('BusinessPackage'); // Get all templates for this package type
    templates.forEach(templateInfo => {
      this.fileGenerator.generate(templateInfo.template, templateInfo.outputPath, vars);
    });

    // 4. Resolve dependencies and generate module.json
    const dependencies = this.dependencyResolver.resolve(options.type || 'BusinessPackage');
    this.fileGenerator.generate('module.json.tpl', `${packagePath}/module.json`, {
      ...vars,
      dependencies: JSON.stringify(dependencies)
    });

    WK.logger().info(`Package '${packageName}' built successfully.`);
    return { name: packageName, path: packagePath, files: templates.map(t => t.outputPath) };
  }
}