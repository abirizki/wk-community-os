/**
 * Main framework orchestrator for WK Framework Bootstrap.
 */
class Framework {
  constructor() {
    this.container = new Container();
    this.kernel = new Kernel();
    this.lifecycle = new Lifecycle();
    this.environment = new Environment();
    this.configManager = new ConfigManager();
    this.versionManager = new VersionManager();
    this.moduleManager = new ModuleManager();
    this.logger = new Logger();
    this.application = new Application(this);
    this.providers = [];
    this.dispatchers = [];
    this.statusData = {
      name: 'WK Framework',
      version: '1.0.0',
      environment: 'development',
      status: 'booting',
      readyAt: null
    };
  }

  boot() {
    return this.application.start();
  }

  shutdown() {
    this.lifecycle.markShutdown();
    this.statusData.status = 'shutdown';
    this.logger.info('Framework shutdown');
    return true;
  }

  version() {
    return this.versionManager.load();
  }

  environment() {
    return this.environment.load();
  }

  status() {
    return this.statusData;
  }

  loadEnvironment() {
    const env = this.environment.load();
    this.statusData.environment = env.name;
    return env;
  }

  loadConfig() {
    const config = this.configManager.load();
    this.statusData.config = config;
    return config;
  }

  loadVersion() {
    const version = this.versionManager.load();
    this.statusData.version = version.FRAMEWORK_VERSION;
    return version;
  }

  initializeContainer() {
    this.container.instance('framework', this);
    this.container.instance('container', this.container);
    this.container.instance('logger', this.logger);
    this.container.instance('moduleManager', this.moduleManager);
    return this.container;
  }

  registerProviders() {
    this.providers.forEach(function(provider) {
      provider.register();
      provider.boot();
    });
    return this.providers;
  }

  initializeModuleManager() {
    this.moduleManager.register('core', { name: 'core', enabled: true });
    return this.moduleManager;
  }

  initializeDispatchers() {
    this.dispatchers = [
      new EventDispatcher(this),
      new RuleDispatcher(this),
      new DashboardDispatcher(this)
    ];
    this.statusData.status = 'ready';
    return this.dispatchers;
  }
}
