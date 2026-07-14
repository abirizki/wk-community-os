/**
 * =============================================================================
 * WK FRAMEWORK
 * -----------------------------------------------------------------------------
 * File        : 02_Constants.gs
 * Version     : 2.2.0
 * Description : Global Constants
 * Author      : WK Framework
 * -----------------------------------------------------------------------------
 * Seluruh konstanta global framework.
 *
 * CATATAN:
 * Jangan menggunakan string literal pada module lain.
 * Selalu gunakan CONST.xxx
 * =============================================================================
 */

var CONST = CONST || {};

/* =============================================================================
 * FRAMEWORK
 * =============================================================================
 */

CONST.FRAMEWORK = Object.freeze({

  NAME: "WK Framework",

  APP_NAME: "Warga Kebonjati",

  VERSION: "2.2.0",

  CODENAME: "Sprint 2",

  PLATFORM: "Google Apps Script",

  AUTHOR: "WK Framework",

  COPYRIGHT: "© Warga Kebonjati"

});

/* =============================================================================
 * STATUS
 * =============================================================================
 */

CONST.STATUS = Object.freeze({

  ACTIVE: "ACTIVE",

  INACTIVE: "INACTIVE",

  ENABLED: "ENABLED",

  DISABLED: "DISABLED",

  READY: "READY",

  PENDING: "PENDING",

  PROCESS: "PROCESS",

  SUCCESS: "SUCCESS",

  FAILED: "FAILED",

  ERROR: "ERROR",

  WARNING: "WARNING",

  APPROVED: "APPROVED",

  REJECTED: "REJECTED",

  VERIFIED: "VERIFIED",

  UNVERIFIED: "UNVERIFIED",

  LOCKED: "LOCKED",

  OPEN: "OPEN",

  CLOSED: "CLOSED",

  ARCHIVED: "ARCHIVED",

  DELETED: "DELETED"

});

/* =============================================================================
 * LOG LEVEL
 * =============================================================================
 */

CONST.LOG = Object.freeze({

  DEBUG: "DEBUG",

  INFO: "INFO",

  NOTICE: "NOTICE",

  WARNING: "WARNING",

  ERROR: "ERROR",

  CRITICAL: "CRITICAL"

});

/* =============================================================================
 * RESPONSE CODE
 * =============================================================================
 */

CONST.RESPONSE = Object.freeze({

  SUCCESS: 200,

  CREATED: 201,

  ACCEPTED: 202,

  BAD_REQUEST: 400,

  UNAUTHORIZED: 401,

  FORBIDDEN: 403,

  NOT_FOUND: 404,

  CONFLICT: 409,

  VALIDATION_ERROR: 422,

  SERVER_ERROR: 500

});

/* =============================================================================
 * ROLE
 * =============================================================================
 */

CONST.ROLE = Object.freeze({

  SUPER_ADMIN: "SUPER_ADMIN",

  ADMIN: "ADMIN",

  RW: "RW",

  RT: "RT",

  WARGA: "WARGA",

  OWNER: "OWNER",

  OPERATOR: "OPERATOR",

  GUEST: "GUEST"

});

/* =============================================================================
 * ACTION / PERMISSION
 * =============================================================================
 */

CONST.ACTION = Object.freeze({

  VIEW: "VIEW",

  CREATE: "CREATE",

  UPDATE: "UPDATE",

  DELETE: "DELETE",

  VERIFY: "VERIFY",

  APPROVE: "APPROVE",

  REJECT: "REJECT",

  PRINT: "PRINT",

  EXPORT: "EXPORT",

  IMPORT: "IMPORT",

  LOGIN: "LOGIN",

  LOGOUT: "LOGOUT"

});

/* =============================================================================
 * QUERY OPERATOR
 * =============================================================================
 */

CONST.QUERY_OPERATOR = Object.freeze({

  EQ: "=",

  NE: "!=",

  GT: ">",

  GTE: ">=",

  LT: "<",

  LTE: "<=",

  LIKE: "LIKE",

  IN: "IN",

  NOT_IN: "NOT_IN",

  BETWEEN: "BETWEEN",

  IS_NULL: "IS_NULL",

  IS_NOT_NULL: "IS_NOT_NULL"

});

/* =============================================================================
 * DATABASE TABLE
 * =============================================================================
 */

CONST.TABLE = Object.freeze({

  USER: "USER",

  ROLE: "ROLE",

  PERMISSION: "PERMISSION",

  USER_ROLE: "USER_ROLE",

  ROLE_PERMISSION: "ROLE_PERMISSION",

  KK: "KK",

  WARGA: "WARGA",

  PROPERTI: "PROPERTI",

  PBB: "PBB",

  SURAT: "SURAT",

  DOKUMEN: "DOKUMEN",

  PENDUDUK_SEMENTARA: "PENDUDUK_SEMENTARA",

  FASILITAS: "FASILITAS",

  LOG: "LOG",

  CONFIG: "CONFIG"

});

/* =============================================================================
 * CACHE
 * =============================================================================
 */

CONST.CACHE = Object.freeze({

  CONFIG: "CONFIG",

  MASTER: "MASTER",

  USER: "USER",

  SESSION: "SESSION",

  ROLE: "ROLE",

  PERMISSION: "PERMISSION",

  MENU: "MENU",

  LOOKUP: "LOOKUP"

});

/* =============================================================================
 * SESSION
 * =============================================================================
 */

CONST.SESSION = Object.freeze({

  USER_ID: "USER_ID",

  USERNAME: "USERNAME",

  FULLNAME: "FULLNAME",

  ROLE: "ROLE",

  RT: "RT",

  RW: "RW",

  LOGIN_TIME: "LOGIN_TIME",

  LAST_ACTIVITY: "LAST_ACTIVITY",

  TOKEN: "TOKEN",

  EXPIRED_AT: "EXPIRED_AT"

});

/* =============================================================================
 * EVENT
 * =============================================================================
 */

CONST.EVENT = Object.freeze({

  LOGIN: "LOGIN",

  LOGOUT: "LOGOUT",

  CREATE: "CREATE",

  UPDATE: "UPDATE",

  DELETE: "DELETE",

  VERIFY: "VERIFY",

  APPROVE: "APPROVE",

  REJECT: "REJECT",

  PRINT: "PRINT",

  EXPORT: "EXPORT",

  IMPORT: "IMPORT",

  INSTALL: "INSTALL",

  UPGRADE: "UPGRADE",

  REPAIR: "REPAIR"

});

/* =============================================================================
 * DOCUMENT TYPE
 * =============================================================================
 */

CONST.DOCUMENT = Object.freeze({

  PHOTO: "PHOTO",

  PROFILE: "PROFILE",

  KTP: "KTP",

  KK: "KK",

  PBB: "PBB",

  SURAT: "SURAT",

  SELFIE: "SELFIE",

  SUPPORTING: "SUPPORTING",

  OTHER: "OTHER"

});

/* =============================================================================
 * PROPERTY TYPE
 * =============================================================================
 */

CONST.PROPERTY = Object.freeze({

  RUMAH: "RUMAH",

  KONTRAKAN: "KONTRAKAN",

  KOS: "KOS",

  RUKO: "RUKO",

  KIOS: "KIOS",

  TANAH: "TANAH",

  GEDUNG: "GEDUNG",

  FASILITAS_UMUM: "FASILITAS_UMUM",

  LAINNYA: "LAINNYA"

});

