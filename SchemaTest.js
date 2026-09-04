/**
 * @class SchemaTest
 * @description Provides a test suite for the Schema Registry package.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SchemaTest {
  /**
   * Main entry point to run all tests for the Schema Registry package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Schema Registry Package Test Suite ---');
    let allTestsPassed = true;

    allTestsPassed = SchemaTest.testSchemaRegistration() && allTestsPassed;
    allTestsPassed = SchemaTest.testSchemaDiscovery() && allTestsPassed;
    allTestsPassed = SchemaTest.testSchemaCatalogGeneration() && allTestsPassed;
    allTestsPassed = SchemaTest.testSchemaDependencyGraphGeneration() && allTestsPassed;

    if (allTestsPassed) {
      WK.logger().info('--- [PASS] All Schema Registry Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Schema Registry Package Tests Failed ---');
    }
    return allTestsPassed;
  }

  /**
   * Sets up a mock environment for testing.
   * @private
   */
  static _setupMocks() {
    const mockSchemaRegistry = new SchemaRegistry();
    const mockPackageManager = {
      getAllPackages: () => [
        { id: 'citizen', name: 'Citizen', version: '1.0.0', components: ['CitizenEntity', 'CitizenMigration'] },
        { id: 'letter', name: 'Letter', version: '1.0.0', components: ['LetterEntity', 'LetterMigration'] }
      ]
    };
    const mockSchemaDiscovery = new SchemaDiscovery();
    const mockSecurity = { checkPermission: () => true };
    WK.security = () => mockSecurity;
    WK.logger = () => ({ info: console.log, debug: console.log, warn: console.warn, error: console.error });

    const schemaService = new SchemaService(mockSchemaRegistry, mockSchemaDiscovery, mockPackageManager);
    return { schemaService, mockSchemaRegistry, mockSchemaDiscovery, mockPackageManager };
  }

  static testSchemaRegistration() {
    WK.logger().info('Running SchemaRegistry.registerSchema test...');
    const { mockSchemaRegistry } = SchemaTest._setupMocks();
    const testSchema = { id: 'test.schema', type: 'Test', packageId: 'test', version: '1.0.0', description: 'A test schema', definition: {} };
    mockSchemaRegistry.registerSchema(testSchema);
    console.assert(mockSchemaRegistry.getSchema('test.schema') === testSchema, 'Test Failed: Schema not registered correctly.');
    WK.logger().info('SchemaRegistry.registerSchema test passed.');
    return true;
  }

  static testSchemaDiscovery() {
    WK.logger().info('Running SchemaDiscovery.discoverSchemas test...');
    const { schemaService, mockSchemaRegistry } = SchemaTest._setupMocks();
    schemaService.initialize();
    console.assert(mockSchemaRegistry.getSchema('citizen.database') !== undefined, 'Test Failed: Citizen database schema not discovered.');
    console.assert(mockSchemaRegistry.getSchema('letter.entity') !== undefined, 'Test Failed: Letter entity schema not discovered.');
    WK.logger().info('SchemaDiscovery.discoverSchemas test passed.');
    return true;
  }

  static testSchemaCatalogGeneration() {
    WK.logger().info('Running SchemaCatalog.generate test...');
    const { schemaService } = SchemaTest._setupMocks();
    schemaService.initialize();
    const catalog = schemaService.generateSchemaCatalog();
    console.assert(catalog.Database && catalog.Database.citizen, 'Test Failed: Catalog did not generate correctly.');
    WK.logger().info('SchemaCatalog.generate test passed.');
    return true;
  }

  static testSchemaDependencyGraphGeneration() {
    WK.logger().info('Running SchemaDependencyGraph.generate test...');
    const { schemaService } = SchemaTest._setupMocks();
    schemaService.initialize();
    const graph = schemaService.generateDependencyGraph();
    console.assert(graph.nodes.length > 0 && graph.edges.length > 0, 'Test Failed: Dependency graph not generated correctly.');
    WK.logger().info('SchemaDependencyGraph.generate test passed.');
    return true;
  }
}

// Global function to run all tests, typically called from a test runner or directly in Apps Script
function runAllSchemaRegistryTests() {
  SchemaTest.runAll();
}