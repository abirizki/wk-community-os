/**
 * @class DocumentationRegistry
 * @description Manages the in-memory store of all discovered documentation assets.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DocumentationRegistry {
  constructor() {
    /** @private @type {Map<string, object>} */
    this.documents = new Map();
  }

  /**
   * Registers a new document descriptor.
   * @param {object} docDescriptor - The document descriptor to register.
   */
  register(docDescriptor) {
    if (!docDescriptor || !docDescriptor.id) {
      throw new Error('Invalid document descriptor provided for registration.');
    }
    this.documents.set(docDescriptor.id, docDescriptor);
  }

  /**
   * Retrieves a document descriptor by its ID.
   * @param {string} docId - The unique ID of the document.
   * @returns {object|undefined}
   */
  get(docId) {
    return this.documents.get(docId);
  }

  /**
   * Retrieves all registered document descriptors.
   * @returns {Array<object>}
   */
  getAll() {
    return Array.from(this.documents.values());
  }
}