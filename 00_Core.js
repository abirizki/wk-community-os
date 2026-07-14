/**
 * =============================================================================
 * WK COMMUNITY OS
 * File : 00_Core.gs
 * =============================================================================
 */

/**
 * Namespace Global
 */
var WK = {};

/**
 * Informasi Framework
 */
WK.Info = {
  framework: "WK Core",
  application: "Warga Kebonjati",
  version: "1.0.0",
  release: "0.1.0",
  environment: "production"
};

/**
 * Registry
 */
WK.Modules = {};
WK.Services = {};
WK.Repositories = {};
WK.Controllers = {};
WK.Helpers = {};
WK.Cache = {};

/**
 * Status Boot
 */
WK.Booted = false;

/**
 * Boot Framework
 */
WK.boot = function () {

  if (WK.Booted) {
    return;
  }

  Logger.log("================================");
  Logger.log("WK Community OS");
  Logger.log("Version : " + WK.Info.version);
  Logger.log("================================");

  WK.Booted = true;

};

/**
 * Health Check
 */
WK.health = function () {

  return {

    framework: WK.Info.framework,

    version: WK.Info.version,

    booted: WK.Booted

  };

};