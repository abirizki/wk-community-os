/**
 * @class DocumentationService
 * @description The main service facade for the Documentation Center.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DocumentationService {
  /**
   * @param {DocumentationRegistry} documentationRegistry
   * @param {DocumentationDiscovery} documentationDiscovery
   * @param {DocumentationGenerator} documentationGenerator
   */
  constructor(documentationRegistry, documentationDiscovery, documentationGenerator) {
    /** @private */
    this.documentationRegistry = documentationRegistry;
    /** @private */
    this.documentationDiscovery = documentationDiscovery;
    /** @private */
    this.documentationGenerator = documentationGenerator;
  }

  /**
   * Initializes the service by discovering and registering all documentation.
   */
  initialize() {
    WK.logger().info('Initializing DocumentationService: Discovering and registering all documentation...');
    const allDocs = this.documentationDiscovery.discoverAll();
    for (const doc of allDocs) {
      this.documentationRegistry.register(doc);
    }
    WK.logger().info(`DocumentationService initialized. Total documents registered: ${this.documentationRegistry.getAll().length}`);
  }

  /**
   * Gets a categorized list of all available documentation.
   * @returns {object} A categorized object of document descriptors.
   */
  getDocumentationCatalog() {
    WK.security().checkPermission('documentationcenter.catalog.view');
    const allDocs = this.documentationRegistry.getAll();
    const catalog = {};
    // [TODO: Implement categorization logic based on doc.type and doc.packageId]
    return allDocs;
  }

  /**
   * Retrieves and renders the content of a specific document.
   * @param {string} docId - The unique ID of the document.
   * @returns {string} The rendered HTML content of the document.
   */
  getDocumentContent(docId) {
    WK.security().checkPermission('documentationcenter.document.view');
    const docDescriptor = this.documentationRegistry.get(docId);
    if (!docDescriptor) {
      throw new Error(`Document with ID '${docId}' not found.`);
    }

    // In a real system, this would read the file content from the source.
    // For this conceptual implementation, we'll use placeholder content.
    const rawContent = `# ${docDescriptor.title}\n\nThis is the content for ${docDescriptor.id}.`;

    return this.documentationGenerator.generate(rawContent, 'markdown');
  }
}