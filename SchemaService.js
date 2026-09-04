/**
 * @class SchemaService
 * @description The main service facade for the Schema Registry package, orchestrating schema discovery, registration, and reporting.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SchemaService {
  /**
   * @param {SchemaRegistry} schemaRegistry
   * @param {SchemaDiscovery} schemaDiscovery
   * @param {PackageManager} packageManager - From Kernel
   */
  constructor(schemaRegistry, schemaDiscovery, packageManager) {
    /** @private */
    this.schemaRegistry = schemaRegistry;
    /** @private */
    this.schemaDiscovery = schemaDiscovery;
    /** @private */
    this.packageManager = packageManager;
  }

  /**
   * Initializes the Schema Service by discovering and registering all schemas.
   */
  initialize() {
    WK.logger().info('Initializing SchemaService: Discovering and registering schemas...');
    const packages = this.packageManager.getAllPackages();
    for (const pkg of packages) {
      const discoveredSchemas = this.schemaDiscovery.discoverSchemas(pkg);
      for (const schema of discoveredSchemas) {
        this.schemaRegistry.registerSchema(schema);
      }
    }
    WK.logger().info(`SchemaService initialized. Total schemas registered: ${this.schemaRegistry.schemas.size}`);
  }

  /**
   * Retrieves a specific schema by its ID.
   * @param {string} schemaId - The ID of the schema.
   * @returns {SchemaDescriptor|undefined}
   */
  getSchemaById(schemaId) {
    WK.security().checkPermission('schemaregistry.schema.view');
    return this.schemaRegistry.getSchema(schemaId);
  }

  /**
   * Generates the full schema catalog.
   * @returns {object} A structured catalog of all registered schemas.
   */
  generateSchemaCatalog() {
    WK.security().checkPermission('schemaregistry.catalog.view');
    return SchemaCatalog.generate(this.schemaRegistry.schemas);
  }

  /**
   * Generates the dependency graph for all schemas.
   * @returns {object} A representation of schema dependencies.
   */
  generateDependencyGraph() {
    WK.security().checkPermission('schemaregistry.dependency_graph.view');
    return SchemaDependencyGraph.generate(this.schemaRegistry.schemas);
  }

  /**
   * Retrieves the version history for a specific schema.
   * @param {string} schemaId - The ID of the schema.
   * @returns {Array<object>} An array of version history entries.
   */
  getSchemaVersionHistory(schemaId) {
    WK.security().checkPermission('schemaregistry.version_history.view');
    const schema = this.schemaRegistry.getSchema(schemaId);
    if (!schema) {
      throw new Error(`Schema with ID '${schemaId}' not found.`);
    }
    return SchemaVersionHistory.getHistory(schema);
  }
}