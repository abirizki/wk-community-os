/**
 * @class TemplateLoader
 * @description Loads template content from the file system.
 */
class TemplateLoader {
  /**
   * @param {GeneratorConfig} config
   */
  constructor(config) {
    /** @private */
    this.templateBasePath = config.get('templateBasePath');
  }

  /**
   * Loads a template file as a string.
   * @param {string} templateName - The name of the template file (e.g., 'service.js.tpl').
   * @returns {string} The content of the template file.
   * @throws {Error} If the template file cannot be found or read.
   */
  load(templateName) {
    const templatePath = `${this.templateBasePath}/${templateName}`;
    WK.logger().debug(`Loading template from: ${templatePath}`);

    try {
      // In a real file system (like Node.js), this would be:
      // return fs.readFileSync(templatePath, 'utf8');

      // In Google Apps Script, we might store templates in a dedicated script file
      // or as files in Drive. Here we simulate it with a global object.
      const templateContent = _WK_GENERATOR_TEMPLATES[templateName];
      if (templateContent === undefined) {
        throw new Error(`Template '${templateName}' not found in the template registry.`);
      }
      return templateContent;
    } catch (e) {
      WK.logger().error(`Failed to load template '${templateName}': ${e.message}`);
      throw e;
    }
  }
}