/**
 * @class FileGenerator
 * @description Generates a single file from a template and variables.
 */
class FileGenerator {
  /**
   * @param {TemplateLoader} templateLoader
   */
  constructor(templateLoader) {
    /** @private */
    this.templateLoader = templateLoader;
  }

  /**
   * Generates a file at the specified path.
   * @param {string} templateName - The name of the template to use.
   * @param {string} outputPath - The full path where the file will be created.
   * @param {object} variables - An object of key-value pairs for template replacement.
   */
  generate(templateName, outputPath, variables) {
    WK.logger().debug(`Generating file '${outputPath}' from template '${templateName}'...`);

    // 1. Load the template content
    let content = this.templateLoader.load(templateName);

    // 2. Replace placeholders
    for (const key in variables) {
      const placeholder = new RegExp(`\\<\\<${key}\\>\\>`, 'g');
      content = content.replace(placeholder, variables[key]);
    }

    // 3. Write the file
    this._writeFile(outputPath, content);

    WK.logger().info(`File created: ${outputPath}`);
  }

  /**
   * Writes content to a file.
   * @private
   * @param {string} path - The full path of the file.
   * @param {string} content - The content to write.
   */
  _writeFile(path, content) {
    // In a real Node.js environment: fs.writeFileSync(path, content);
    // In Apps Script, this is conceptual. We might log it or create a Drive file.
    console.log(`--- Writing file: ${path} ---\n${content}\n--- End of file ---`);
  }
}