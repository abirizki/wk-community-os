/**
 * =============================================================================
 * WK COMMUNITY OS
 * File : 06_Logger.gs
 * =============================================================================
 */

var AppLogger = {};

/**
 * Tulis ke Apps Script Logger
 */
AppLogger.write = function (level, message) {

  var text =
    "[" +
    level +
    "] " +
    Utils.formatDate(new Date()) +
    " - " +
    message;

  Logger.log(text);

};

/**
 * INFO
 */
AppLogger.info = function (message) {

  AppLogger.write("INFO", message);

};

/**
 * WARNING
 */
AppLogger.warning = function (message) {

  AppLogger.write("WARNING", message);

};

/**
 * ERROR
 */
AppLogger.error = function (error) {

  var message = "";

  if (typeof error === "object") {

    message = error.message || JSON.stringify(error);

  } else {

    message = String(error);

  }

  AppLogger.write("ERROR", message);

};

/**
 * DEBUG
 */
AppLogger.debug = function (message) {

  if (!CONFIG.ENABLE_DEBUG_LOG) {
    return;
  }

  AppLogger.write("DEBUG", message);

};

/**
 * LOGIN
 */
AppLogger.login = function (username) {

  AppLogger.info(
    "Login : " + username
  );

};

/**
 * LOGOUT
 */
AppLogger.logout = function (username) {

  AppLogger.info(
    "Logout : " + username
  );

};

/**
 * DATABASE
 */
AppLogger.database = function (action, table) {

  AppLogger.info(
    "Database : " +
    action +
    " [" +
    table +
    "]"
  );

};

/**
 * API
 */
AppLogger.api = function (action) {

  AppLogger.info(
    "API : " + action
  );

};

/**
 * EXCEPTION
 */
AppLogger.exception = function (e) {

  AppLogger.error(e);

  if (e.stack) {

    Logger.log(e.stack);

  }

};