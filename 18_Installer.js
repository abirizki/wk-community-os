/**
 * =============================================================================
 * WK FRAMEWORK
 * -----------------------------------------------------------------------------
 * File        : 18_Installer.gs
 * Version     : 2.2.0
 * Description : Framework Installer
 * Author      : WK Framework
 * -----------------------------------------------------------------------------
 * Bertanggung jawab untuk:
 * - Instalasi database Spreadsheet
 * - Membuat seluruh Sheet
 * - Membuat Header
 * - Seed data awal
 * - Validasi struktur
 * - Repair
 * - Upgrade
 * =============================================================================
 */

var Installer = {};

/* =============================================================================
 * CONSTANT
 * =============================================================================
 */

Installer.STATUS = {

  READY: "READY",

  INSTALLED: "INSTALLED",

  ERROR: "ERROR"

};

/* =============================================================================
 * INSTALL
 * =============================================================================
 */

/**
 * Install Framework.
 *
 * Aman dipanggil berkali-kali (idempotent).
 *
 * @returns {Boolean}
 */
Installer.install = function () {

  Logger.info(
    "INSTALLER",
    "INSTALL",
    "Start installation"
  );

  if (!Installer.isInstalled()) {

    Installer.createHeaders();

    Installer.seed();

  }

  var report = Installer.validate();

  Logger.info(
    "INSTALLER",
    "INSTALL",
    report.success
      ? "Installation completed"
      : "Installation requires attention"
  );

  return report.success;

};

/* =============================================================================
 * SHEET
 * =============================================================================
 */

/**
 * Membuat Sheet bila belum tersedia.
 *
 * @param {String} sheetName
 * @returns {Sheet}
 */
Installer.createSheet = function (sheetName) {

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName(sheetName);

  if (sheet) {

    return sheet;

  }

  Logger.info(
    "INSTALLER",
    "CREATE_SHEET",
    sheetName
  );

  return ss.insertSheet(sheetName);

};

/**
 * Membuat Header Sheet.
 *
 * Struktur diambil dari MasterData.TABLES
 *
 * @param {String} tableName
 * @returns {Boolean}
 */
Installer.createHeader = function (tableName) {

  // This function is now deprecated as table creation is handled by Database.createAllTables().
  // It is kept for potential future use in validation or repair logic.
  // The dependency on MasterData.TABLES is removed.
  var headers = Database.headers(tableName);
  if (!headers || !headers.length) {
    return false;

  }

  var sheet = Installer.createSheet(tableName);

  // Bersihkan isi sheet
  sheet.clear();

  // Tulis Header
  sheet
    .getRange(
      1,
      1,
      1,
      headers.length
    )
    .setValues([headers]);

  // Freeze Header
  sheet.setFrozenRows(1);

  Logger.info(
    "INSTALLER",
    "HEADER_CREATED",
    tableName
  );

  return true;

};

/* =============================================================================
 * HEADER & SEED
 * =============================================================================
 */

/**
 * Membuat seluruh Header.
 *
 * @returns {Boolean}
 */
Installer.createHeaders = function () {

  Object.keys(CONST.SHEETS).forEach(function (tableName) {

    Installer.createHeader(tableName);

  });

  return true;

};

/**
 * Seed data awal framework.
 *
 * Catatan:
 * Data master akan diisi oleh Repository
 * agar Installer tetap independen.
 *
 * @returns {Boolean}
 */
Installer.seed = function () {

  Logger.info(
    "INSTALLER",
    "SEED",
    "Initialize default data"
  );

  /*
   * Contoh implementasi nanti:
   *
   * UserRepository.createAdmin();
   * ConfigRepository.seed();
   * PermissionRepository.seed();
   * MasterRepository.seed();
   */

  return true;

};

/* =============================================================================
 * VALIDATION
 * =============================================================================
 */

/**
 * Mengecek apakah framework telah terpasang.
 *
 * @returns {Boolean}
 */
Installer.isInstalled = function () {

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  return Object.keys(CONST.SHEETS).every(function (tableName) {

    return ss.getSheetByName(tableName) !== null;

  });

};

/**
 * Mengambil daftar Sheet yang ada.
 *
 * @returns {Array}
 */
Installer.getInstalledTables = function () {

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  return ss.getSheets().map(function (sheet) {

    return sheet.getName();

  });

};

/* =============================================================================
 * VALIDATION & MAINTENANCE
 * =============================================================================
 */

/**
 * Memvalidasi struktur database.
 *
 * @returns {Object}
 */
Installer.validate = function () {

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var report = {

    success: true,

    checked: 0,

    missingSheets: [],

    invalidHeaders: []

  };

  Object.keys(CONST.SHEETS).forEach(function (tableName) {

    report.checked++;

    var sheet = ss.getSheetByName(tableName);

    if (!sheet) {

      report.success = false;

      report.missingSheets.push(tableName);

      return;

    }
    // Validation logic now uses Database.headers as the source of truth.
    var expected = Database.headers(tableName) || [];

    var actual = sheet
      .getRange(1, 1, 1, expected.length)
      .getValues()[0];

    var valid = JSON.stringify(expected) === JSON.stringify(actual);

    if (!valid) {

      report.success = false;

      report.invalidHeaders.push(tableName);

    }

  });

  return report;

};

/**
 * Memperbaiki struktur framework.
 *
 * Tidak menghapus data.
 *
 * @returns {Boolean}
 */
Installer.repair = function () {

  var report = Installer.validate();

  report.missingSheets.forEach(function (tableName) {

    Installer.createHeader(tableName);

  });

  report.invalidHeaders.forEach(function (tableName) {

    Installer.createHeader(tableName);

  });

  Logger.info(
    "INSTALLER",
    "REPAIR",
    JSON.stringify(report)
  );

  return true;

};

/**
 * Upgrade struktur database.
 *
 * Saat ini hanya menjalankan repair().
 *
 * @returns {Boolean}
 */
Installer.upgrade = function () {

  Logger.info(
    "INSTALLER",
    "UPGRADE",
    "Start"
  );

  Installer.repair();

  Logger.info(
    "INSTALLER",
    "UPGRADE",
    "Completed"
  );

  return true;

};

/* =============================================================================
 * FRAMEWORK INFORMATION
 * =============================================================================
 */

/**
 * Informasi Installer.
 *
 * @returns {Object}
 */
Installer.info = function () {

  var validation = Installer.validate();

  return {

    installed: Installer.isInstalled(),

    valid: validation.success,

    totalTables: Object.keys(CONST.SHEETS).length,

    installedTables: Installer.getInstalledTables(),

    validation: validation,

    timestamp: Utils.timestamp()

  };

};

/**
 * Health Check Installer.
 *
 * @returns {Object}
 */
Installer.health = function () {

  var validation = Installer.validate();

  return {

    success: validation.success,

    status: validation.success
      ? "READY"
      : "ERROR",

    service: "Installer",

    installed: Installer.isInstalled(),

    checkedTables: validation.checked,

    totalTables: Object.keys(CONST.SHEETS).length,

    timestamp: Utils.timestamp()

  };

};