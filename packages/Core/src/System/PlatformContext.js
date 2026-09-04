/**
 * Provides the shared runtime container for the Core Platform services.
 * @class
 */
class PlatformContext {
  /**
   * Creates a new platform context.
   * @param {Object} dependencies - Optional service overrides.
   */
  constructor(dependencies) {
    this.dependencies = dependencies || {};
    this.configuration = this.dependencies.configuration || new ConfigurationManager();
    this.settings = this.dependencies.settings || new SettingsManager(this.configuration);
    this.storage = this.dependencies.storage || new StorageService(this.configuration);
    this.logger = this.dependencies.logger || new LoggerService();
    this.audit = this.dependencies.audit || new AuditService(this.logger, this.storage);
    this.session = this.dependencies.session || new SessionService(this.storage, this.logger, this.configuration);
    this.permission = this.dependencies.permission || new PermissionService(this.logger);
    this.role = this.dependencies.role || new RoleService(this.permission, this.logger);
    this.authentication = this.dependencies.authentication || new AuthenticationService(this.session, this.logger, this.configuration);
    this.authorization = this.dependencies.authorization || new AuthorizationService(this.permission, this.role, this.logger);
    this.workflow = this.dependencies.workflow || new WorkflowService(this.audit, this.logger, this.dependencies.notification || new NotificationService(this.logger, this.storage));
    this.notification = this.dependencies.notification || new NotificationService(this.logger, this.storage);
    this.dashboard = this.dependencies.dashboard || new DashboardService(this.dependencies.report || new ReportService(this.storage, this.logger), this.logger);
    this.ruleEngine = this.dependencies.ruleEngine || new RuleEngineService(this.logger);
    this.report = this.dependencies.report || new ReportService(this.storage, this.logger, this.dashboard);
    this.healthCheck = this.dependencies.healthCheck || new HealthCheckService(this.configuration, this.logger);
  }

  /**
   * Returns a named service from the context.
   * @param {string} name - Service name.
   * @returns {Object} The matching service.
   */
  getService(name) {
    return this[name] || null;
  }

  /**
   * Creates a runtime snapshot for diagnostics.
   * @returns {Object} A summary object.
   */
  createRuntimeSnapshot() {
    return {
      configuration: this.configuration.getAll(),
      settings: this.settings.getAll(),
      auditEntries: this.audit.getRecent(5),
      health: this.healthCheck.run('platform')
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PlatformContext
  };
}
