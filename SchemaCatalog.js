/**
 * @class SchemaCatalog
 * @description Generates a human-readable catalog of all registered schemas.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SchemaCatalog {
  /**
   * Generates a structured catalog from a map of schema descriptors.
   * @param {Map<string, SchemaDescriptor>} schemas - A map of schema IDs to SchemaDescriptor objects.
   * @returns {object} A structured catalog.
   */
  static generate(schemas) {
    const catalog = {};
    for (const [id, schema] of schemas.entries()) {
      if (!catalog[schema.type]) {
        catalog[schema.type] = {};
      }
      if (!catalog[schema.type][schema.packageId]) {
        catalog[schema.type][schema.packageId] = [];
      }
      catalog[schema.type][schema.packageId].push({
        id: schema.id,
        description: schema.description,
        version: schema.version,
        definition: schema.definition // Simplified for catalog view
      });
    }
    return catalog;
  }
}