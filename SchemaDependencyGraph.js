/**
 * @class SchemaDependencyGraph
 * @description Generates a visual representation of how different schemas depend on each other.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SchemaDependencyGraph {
  /**
   * Generates a dependency graph from a map of schema descriptors.
   * @param {Map<string, SchemaDescriptor>} schemas - A map of schema IDs to SchemaDescriptor objects.
   * @returns {object} A graph representation (e.g., adjacency list or matrix).
   */
  static generate(schemas) {
    const graph = {
      nodes: [],
      edges: []
    };

    for (const [id, schema] of schemas.entries()) {
      graph.nodes.push({ id: id, label: schema.id, type: schema.type });
      if (schema.dependencies && Array.isArray(schema.dependencies)) {
        for (const depId of schema.dependencies) {
          graph.edges.push({ from: id, to: depId });
        }
      }
    }

    return graph;
  }
}