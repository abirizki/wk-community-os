/**
 * Reads framework and application version metadata.
 */
class VersionManager {
  constructor() {
    this.data = {};
  }

  load() {
    this.data = {
      APP_VERSION: PropertiesService.getScriptProperties().getProperty('APP_VERSION') || '0.0.0',
      FRAMEWORK_VERSION: PropertiesService.getScriptProperties().getProperty('FRAMEWORK_VERSION') || '1.0.0',
      BUILD: PropertiesService.getScriptProperties().getProperty('BUILD') || 'dev'
    };
    return this.data;
  }
}
