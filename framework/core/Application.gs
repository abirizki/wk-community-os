/**
 * Application lifecycle orchestrator for WK Framework.
 */
class Application {
  constructor(framework) {
    this.framework = framework;
    this.logger = framework.logger;
  }

  start() {
    this.logger.info('Application.start() invoked');

    this.framework.loadEnvironment();
    this.framework.loadConfig();
    this.framework.loadVersion();
    this.framework.initializeContainer();
    this.framework.registerProviders();
    this.framework.initializeModuleManager();
    this.framework.initializeDispatchers();

    this.framework.lifecycle.markReady();
    this.framework.statusData.readyAt = Helpers.timestamp();

    this.logger.info('Framework ready');
    return {
      success: true,
      status: this.framework.status(),
      bootedAt: this.framework.statusData.readyAt
    };
  }
}
