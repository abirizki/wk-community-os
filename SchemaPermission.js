/**
 * @class SchemaPermission
 * @description Defines all permissions related to the Schema Registry module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SchemaPermission {
  /**
   * Returns an array of permission definitions for the Schema Registry module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'schemaregistry.schema.view', description: 'View any schema definition' },
      { id: 'schemaregistry.schema.manage', description: 'Manage (create/update/delete) schemas' },
      { id: 'schemaregistry.catalog.view', description: 'View the full schema catalog' },
      { id: 'schemaregistry.dependency_graph.view', description: 'View schema dependency graphs' },
      { id: 'schemaregistry.version_history.view', description: 'View schema version history' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('schemaregistry', SchemaPermission.getPermissions());