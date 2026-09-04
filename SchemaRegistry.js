/**
 * @class SchemaRegistry
 * @description Manages the in-memory store of all discovered and registered schemas.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SchemaRegistry {
  constructor() {
    /** @private @type {Map<string, SchemaDescriptor>} */
    this.schemas = new Map();
  }

  /**
   * Registers a new schema or updates an existing one.
   * @param {SchemaDescriptor} schemaDescriptor - The schema descriptor to register.
   */
  registerSchema(schemaDescriptor) {
    if (!schemaDescriptor || !schemaDescriptor.id) {
      throw new Error('Invalid schema descriptor provided for registration.');
    }
    this.schemas.set(schemaDescriptor.id, schemaDescriptor);
    WK.logger().debug(`Schema registered: ${schemaDescriptor.id}`);
  }

  /**
   * Retrieves a schema by its ID.
   * @param {string} schemaId - The unique ID of the schema.
   * @returns {SchemaDescriptor|undefined} The schema descriptor, or undefined if not found.
   */
  getSchema(schemaId) {
    return this.schemas.get(schemaId);
  }
}