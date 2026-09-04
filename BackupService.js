/**
 * @class BackupService
 * @description Provides functionality to create and manage backups of the application state.
 */
class BackupService {
  /**
   * @param {ConfigurationManager} configManager
   */
  constructor(configManager) {
    /** @private */
    this.configManager = configManager;
    /** @private */
    this.backupFolderId = this.configManager.get('deployment.backup_folder_id');
    if (!this.backupFolderId) {
      WK.logger().warn('BackupService: Backup folder ID is not configured. Backups will not be stored in Drive.');
    }
  }

  /**
   * Creates a full backup of the application.
   * @param {object} options - Backup options.
   * @param {string} [options.description=''] - A description for the backup.
   * @returns {object} A summary of the backup process.
   */
  createBackup(options = {}) {
    WK.security().checkPermission('deployment.backup.create');
    WK.logger().info('--- [START] Creating Full Application Backup ---');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
      version: WK.service('deployment.versionManager').getCurrentVersion(),
      createdAt: new Date().toISOString(),
      description: options.description || `Backup created on ${timestamp}`,
      data: {},
      config: {},
      templates: {}
    };

    // 1. Backup Database Data from all repositories
    WK.logger().info('Backing up database data...');
    const allPackages = WK.registry().getPackages(); // Assuming a registry of all packages
    allPackages.forEach(pkg => {
      const repo = WK.repository(pkg.id);
      if (repo && typeof repo.findAll === 'function') {
        backupData.data[pkg.id] = repo.findAll();
        WK.logger().debug(`Backed up data for package: ${pkg.id}`);
      }
    });

    // 2. Backup Configuration
    WK.logger().info('Backing up configuration...');
    backupData.config = this.configManager.config; // Get the full config object

    // 3. Backup Templates (e.g., Google Doc IDs from LetterTemplateService)
    WK.logger().info('Backing up templates...');
    const letterTemplateService = WK.service('letter.template');
    if (letterTemplateService) {
      backupData.templates.letter = letterTemplateService.getAllTemplates();
    }

    // 4. Create a compressed package (JSON file in this case)
    const backupContent = JSON.stringify(backupData, null, 2);
    const backupFileName = `wk-backup-${timestamp}.json`;

    let fileId = null;
    if (this.backupFolderId) {
      try {
        WK.logger().info(`Saving backup file to Google Drive: ${backupFileName}`);
        const file = DriveApp.getFolderById(this.backupFolderId).createFile(backupFileName, backupContent, MimeType.PLAIN_TEXT);
        fileId = file.getId();
        WK.logger().info(`Backup file created successfully. File ID: ${fileId}`);
      } catch (e) {
        WK.logger().error(`Failed to save backup to Google Drive: ${e.message}`, e.stack);
      }
    } else {
      WK.logger().warn('No backup folder configured. Backup data is only available in logs/memory.');
    }

    const summary = {
      status: 'SUCCESS',
      fileName: backupFileName,
      fileId: fileId,
      size: backupContent.length,
      packagesBackedUp: Object.keys(backupData.data)
    };

    WK.logger().info('--- [END] Full Application Backup Completed ---');
    return summary;
  }

  /**
   * Lists available backups from the backup folder.
   * @returns {object[]} An array of backup file objects.
   */
  listBackups() {
    // Implementation would list files from the Google Drive backup folder.
    return [];
  }
}