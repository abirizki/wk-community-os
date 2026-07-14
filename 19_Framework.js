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

  var result = {

    success: true,

    status: CONST.STATUS.READY,

    framework: Framework.META.NAME,

    version: Framework.META.VERSION,

    timestamp: Helper.now(),

    modules: {}

  };

  try {

    result.modules.config =
      (typeof CONFIG !== "undefined");

    result.modules.constants =
      (typeof CONST !== "undefined");

    result.modules.masterData =
      (typeof MasterData !== "undefined");

    result.modules.database =
      (typeof Database !== "undefined");

    result.modules.cache =
      (typeof Cache !== "undefined");

    result.modules.session =
      (typeof Session !== "undefined");

    result.modules.security =
      (typeof Security !== "undefined");

    result.modules.permission =
      (typeof Permission !== "undefined");

    result.modules.installer =
      (typeof Installer !== "undefined");

    Object.keys(result.modules).forEach(function (key) {

      if (!result.modules[key]) {

        result.success = false;

        result.status = CONST.STATUS.ERROR;

      }

    });

  } catch (err) {

    result.success = false;

    result.status = CONST.STATUS.ERROR;

    result.error = err.message;

    Logger.error(
      "FRAMEWORK",
      "BOOT",
      err.message
    );

  }

  Logger.info(
    "FRAMEWORK",
    "BOOT",
    result.status
  );

  return result;

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

    timestamp: Helper.now()

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

    timestamp: Helper.now(),

    modules: {}

  };

  var modules = {

    installer: Installer,

    database: Database,

    cache: Cache,

    session: Session,

    security: Security,

    permission: Permission

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

