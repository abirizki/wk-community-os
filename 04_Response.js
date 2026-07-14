/**
 * =============================================================================
 * WK COMMUNITY OS
 * File : 04_Response.gs
 * =============================================================================
 */

var Response = {};

/**
 * Success Response
 */
Response.success = function (data, message) {

  return {
    success: true,
    code: "OK",
    message: message || "Berhasil",
    data: data || null,
    timestamp: Utils.formatDate(new Date())
  };

};

/**
 * Error Response
 */
Response.error = function (code, message) {

  return {
    success: false,
    code: code || "SYS001",
    message: message || "Terjadi kesalahan.",
    data: null,
    timestamp: Utils.formatDate(new Date())
  };

};

/**
 * Validation Error
 */
Response.validation = function (errors) {

  return {
    success: false,
    code: "VALIDATION_ERROR",
    message: "Validasi gagal.",
    errors: errors || [],
    timestamp: Utils.formatDate(new Date())
  };

};

/**
 * Unauthorized
 */
Response.unauthorized = function () {

  return Response.error(
    "AUTH001",
    "Anda tidak memiliki hak akses."
  );

};

/**
 * Forbidden
 */
Response.forbidden = function () {

  return Response.error(
    "AUTH002",
    "Akses ditolak."
  );

};

/**
 * Not Found
 */
Response.notFound = function (objectName) {

  return Response.error(
    "SYS404",
    (objectName || "Data") + " tidak ditemukan."
  );

};

/**
 * Duplicate Data
 */
Response.duplicate = function (field) {

  return Response.error(
    "DUPLICATE",
    field + " sudah digunakan."
  );

};

/**
 * Invalid Login
 */
Response.invalidLogin = function () {

  return Response.error(
    "AUTH003",
    "Username atau password salah."
  );

};

/**
 * Session Expired
 */
Response.sessionExpired = function () {

  return Response.error(
    "AUTH004",
    "Session telah berakhir."
  );

};

/**
 * Exception Handler
 */
Response.exception = function (e) {

  Logger.error(e);

  return Response.error(
    "SYS500",
    e.message || String(e)
  );

};