/**
 * =============================================================================
 * WK FRAMEWORK
 * -----------------------------------------------------------------------------
 * File        : 19_Framework.gs
 * Version     : 2.2.0
 * Description : Framework Bootstrap & Orchestrator
 * Author      : WK Framework
 * -----------------------------------------------------------------------------
 * Tanggung Jawab:
 * - Bootstrap Framework
 * - Health Check
 * - Install Wrapper
 * - Validation
 * - Diagnostics
 * -----------------------------------------------------------------------------
 * CATATAN:
 * Framework TIDAK berisi business logic.
 * Framework hanya mengorkestrasi module lain.
 * =============================================================================
 */

var Framework = Framework || {};

/* =============================================================================
 * METADATA
 * =============================================================================
 */

Framework.META = Object.freeze({

  NAME: CONST.FRAMEWORK.NAME,

  APP_NAME: CONST.FRAMEWORK.APP_NAME,

  VERSION: CONST.FRAMEWORK.VERSION,

  CODENAME: CONST.FRAMEWORK.CODENAME,

  PLATFORM: CONST.FRAMEWORK.PLATFORM,

  AUTHOR: CONST.FRAMEWORK.AUTHOR,

  COPYRIGHT: CONST.FRAMEWORK.COPYRIGHT

});

/* =============================================================================
 * BOOTSTRAP
 * =============================================================================
 */

/**
 * Bootstrap Framework.
 *
 * Memastikan seluruh dependency utama tersedia
 * sebelum framework digunakan.
 *
 * @returns {Object}
 */
Framework.boot = function () {

  Logger.info(
    "FRAMEWORK",
    "BOOT",
    "Bootstrapping framework"
  );

  var report = {
    success: false, // Default to fail
    status: CONST.STATUS.ERROR,
    framework: Framework.META.NAME,
    version: Framework.META.VERSION,
    timestamp: Utils.timestamp(),
    modules: {},
    error: "Boot sequence not completed."
  };

  var bootSequence = [
    'CONFIG', 'CONST', 'Utils', 'Logger', 'MasterData', 'Database', 'Query',
    'Cache', 'Session', 'Security', 'Permission', 'Installer',
    'AuthRepository', 'SessionRepository', 'UserRepository', 'WargaRepository', 'DashboardRepository',
    'AuthService', 'UserService', 'WargaService', 'DashboardService'
  ];

  for (var i = 0; i < bootSequence.length; i++) {
    var moduleName = bootSequence[i];
    var moduleExists = (typeof this[moduleName] !== 'undefined' || typeof globalThis[moduleName] !== 'undefined');
    report.modules[moduleName] = moduleExists;

    if (!moduleExists) {
      report.error = "Module '" + moduleName + "' failed to load.";
      Logger.error("FRAMEWORK", "BOOT", report.error);
      return report;
    }
  }

  // If all modules loaded successfully
  report.success = true;
  report.status = CONST.STATUS.READY;
  report.error = null;

  Logger.info(
    "FRAMEWORK",
    "BOOT",
    report.status
  );

  return report;

};

/**
 * Mengetahui apakah framework siap digunakan.
 *
 * @returns {Boolean}
 */
Framework.ready = function () {

  return Framework.boot().success;

};

/* =============================================================================
 * INSTALLER WRAPPER
 * =============================================================================
 */

/**
 * Install Framework.
 *
 * @returns {Boolean}
 */
Framework.install = function () {

  Logger.info(
    "FRAMEWORK",
    "INSTALL",
    "Start"
  );

  var result = Installer.install();

  Logger.info(
    "FRAMEWORK",
    "INSTALL",
    result
      ? CONST.STATUS.SUCCESS
      : CONST.STATUS.ERROR
  );

  return result;

};

/**
 * Repair Framework.
 *
 * @returns {Boolean}
 */
Framework.repair = function () {

  Logger.info(
    "FRAMEWORK",
    "REPAIR",
    "Start"
  );

  var result = Installer.repair();

  Logger.info(
    "FRAMEWORK",
    "REPAIR",
    result
      ? CONST.STATUS.SUCCESS
      : CONST.STATUS.ERROR
  );

  return result;

};

/**
 * Upgrade Framework.
 *
 * @returns {Boolean}
 */
Framework.upgrade = function () {

  Logger.info(
    "FRAMEWORK",
    "UPGRADE",
    "Start"
  );

  var result = Installer.upgrade();

  Logger.info(
    "FRAMEWORK",
    "UPGRADE",
    result
      ? CONST.STATUS.SUCCESS
      : CONST.STATUS.ERROR
  );

  return result;

};

/* =============================================================================
 * INFORMATION
 * =============================================================================
 */

/**
 * Mengambil versi framework.
 *
 * @returns {String}
 */
Framework.version = function () {

  return Framework.META.VERSION;

};

/**
 * Informasi Framework.
 *
 * @returns {Object}
 */
Framework.info = function () {

  return {

    framework: Framework.META,

    ready: Framework.ready(),

    installed: Installer.isInstalled(),

    timestamp: Utils.timestamp()

  };

};

/**
 * Health Check Framework.
 *
 * Framework akan memanggil health() module
 * apabila function tersebut tersedia.
 *
 * @returns {Object}
 */
Framework.health = function () {

  var report = {

    framework: CONST.STATUS.READY,

    timestamp: Utils.timestamp(),

    modules: {}

  };

  var modules = {

    // Core
    Installer: Installer,
    Database: Database,
    Cache: Cache,
    Session: Session,
    Security: Security,
    Permission: Permission,
    Transaction: Transaction,
    Event: Event,
    MasterData: MasterData,
    // Repositories
    AuthRepository: AuthRepository,
    SessionRepository: SessionRepository,
    UserRepository: UserRepository,
    WargaRepository: WargaRepository,
    DashboardRepository: DashboardRepository,
    // Services
    AuthService: AuthService,
    UserService: UserService,
    WargaService: WargaService,
    DashboardService: DashboardService

  };

  Object.keys(modules).forEach(function (key) {

    var module = modules[key];

    if (
      module &&
      typeof module.health === "function"
    ) {

      report.modules[key] = module.health();

    } else {

      report.modules[key] = {

        status: CONST.STATUS.READY,

        message: "health() not implemented"

      };

    }

  });

  return report;

};
