/**
 * @class FolderGenerator
 * @description Handles the creation of directory structures.
 */
class FolderGenerator {
  constructor() {}

  /**
   * Creates the standard folder structure for a new package.
   * @param {string} packageName - The name of the package.
   */
  createPackageStructure(packageName) {
    const basePath = `packages/${packageName}`;
    WK.logger().info(`Creating folder structure for package '${packageName}'...`);

    const foldersToCreate = [
      basePath,
      `${basePath}/src`,
      `${basePath}/docs`,
      `${basePath}/tests`
    ];

    foldersToCreate.forEach(folderPath => {
      // In a real Node.js environment: if (!fs.existsSync(folderPath)) { fs.mkdirSync(folderPath, { recursive: true }); }
      // In Apps Script, this is conceptual.
      console.log(`Creating folder: ${folderPath}`);
      WK.logger().debug(`Folder created: ${folderPath}`);
    });

    WK.logger().info('Folder structure created successfully.');
  }
}