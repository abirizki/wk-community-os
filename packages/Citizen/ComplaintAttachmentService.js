/**
 * @class ComplaintAttachmentService
 * @description Manages attachments for complaints, handling storage and retrieval.
 */
class ComplaintAttachmentService {
  /**
   * @param {StorageService} storageService - The framework's storage service.
   */
  constructor(storageService) {
    /** @private */
    this.storageService = storageService;
    /** @private */
    this.attachmentFolderId = WK.config().get('complaint.attachment_folder_id');
    if (!this.attachmentFolderId) {
      WK.logger().warn('ComplaintAttachmentService: Attachment folder ID is not configured. Attachments will not be stored.');
    }
  }

  /**
   * Uploads a single attachment file for a complaint.
   * @param {string} complaintId - The ID of the complaint this attachment belongs to.
   * @param {object} fileData - The file data object (e.g., from a form upload).
   * @param {string} fileData.name - Original file name.
   * @param {string} fileData.mimeType - MIME type of the file.
   * @param {string} fileData.bytes - Base64 encoded file content.
   * @returns {object} An object containing the file ID and URL of the uploaded file.
   * @throws {Error} If upload fails or folder is not configured.
   */
  uploadAttachment(complaintId, fileData) {
    WK.security().checkPermission('complaint.add_attachment');
    if (!this.attachmentFolderId) {
      throw new Error('Complaint attachment storage is not configured.');
    }
    WK.logger().info(`Uploading attachment for complaint ID: ${complaintId}, file: ${fileData.name}`);

    try {
      const folderPath = `complaints/${complaintId}`;
      const uploadedFile = this.storageService.uploadFile(
        fileData.bytes,
        fileData.mimeType,
        this.attachmentFolderId, // Parent folder
        `${folderPath}/${fileData.name}` // Full path within parent
      );

      if (!uploadedFile) {
        throw new Error('Failed to upload file to storage.');
      }

      WK.audit().log('complaint.attachment_uploaded', {
        complaintId: complaintId,
        fileId: uploadedFile.id,
        fileName: uploadedFile.name
      });

      return {
        fileId: uploadedFile.id,
        fileName: uploadedFile.name,
        fileUrl: uploadedFile.url // Assuming storageService returns URL
      };
    } catch (e) {
      WK.logger().error(`Error uploading attachment for complaint ${complaintId}: ${e.message}`, e.stack);
      throw new Error(`Gagal mengunggah lampiran: ${e.message}`);
    }
  }

  /**
   * Retrieves the URL for a specific attachment.
   * @param {string} fileId - The ID of the attachment file.
   * @returns {string|null} The URL of the file, or null if not found.
   */
  getAttachmentUrl(fileId) {
    WK.security().checkPermission('complaint.view.attachment');
    WK.logger().debug(`Retrieving URL for attachment ID: ${fileId}`);
    return this.storageService.getFileUrl(fileId);
  }
}