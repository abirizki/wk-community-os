/**
 * =============================================================================
 * WK FRAMEWORK
 * -----------------------------------------------------------------------------
 * File        : 02_Constants.gs
 * Version     : 2.2.0
 * Description : Global Constants
 * Author      : WK Framework
 * -----------------------------------------------------------------------------
 * Single Source of Truth
 * Seluruh konstanta framework disimpan di file ini.
 * =============================================================================
 */

var CONST = CONST || {};

/* =============================================================================
 * FRAMEWORK
 * =============================================================================
 */

CONST.FRAMEWORK = Object.freeze({

  NAME: "WK Framework",

  APP_NAME: "WK SIMPEL",

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

/*
 * Alias untuk kompatibilitas kode lama
 */

CONST.ROLES = CONST.ROLE;

/* =============================================================================
 * ACTION
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
 * DATABASE SHEETS
 * =============================================================================
 */
CONST.SHEETS = Object.freeze({

  SYSTEM: "SYSTEM",

  USERS: "USERS",

  SESSIONS: "SESSIONS",

  KK: "KK",

  WARGA: "WARGA",

  PBB: "PBB",

  LAYANAN: "LAYANAN",

  PERSYARATAN: "PERSYARATAN",

  PENGAJUAN: "PENGAJUAN",

  DOKUMEN: "DOKUMEN",

  SURAT: "SURAT",

  AUDIT: "AUDIT",

  SETTING: "SETTING",

  LOG: "LOG"

});

/* =============================================================================
 * DOCUMENT PREFIX
 * =============================================================================
 */

CONST.PREFIX = Object.freeze({

  USER: "USR",

  KK: "KK",

  WARGA: "WGA",

  PENGAJUAN: "PNG",

  SURAT: "SRT",

  AUDIT: "ADT",

  SESSION: "SES"

});

/* =============================================================================
 * MASTER DATA
 * =============================================================================
 */

CONST.MASTER = Object.freeze({

  AGAMA: Object.freeze([

    "Islam",

    "Kristen",

    "Katolik",

    "Hindu",

    "Budha",

    "Khonghucu"

  ]),

  PENDIDIKAN: Object.freeze([

    "Tidak Sekolah",

    "SD",

    "SMP",

    "SMA",

    "D1",

    "D2",

    "D3",

    "S1",

    "S2",

    "S3"

  ]),

  PEKERJAAN: Object.freeze([

    "Belum Bekerja",

    "Pelajar",

    "Mahasiswa",

    "PNS",

    "TNI",

    "POLRI",

    "Pegawai Swasta",

    "Wiraswasta",

    "Petani",

    "Buruh",

    "Pensiunan",

    "Lainnya"

  ]),

  STATUS_PERKAWINAN: Object.freeze([

    "Belum Kawin",

    "Kawin",

    "Cerai Hidup",

    "Cerai Mati"

  ]),

  STATUS_KELUARGA: Object.freeze([

    "Kepala Keluarga",

    "Suami",

    "Istri",

    "Anak",

    "Orang Tua",

    "Famili Lain"

  ]),

  JENIS_KELAMIN: Object.freeze([

    "Laki-laki",

    "Perempuan"

  ])

});

/* =============================================================================
 * USER STATUS
 * =============================================================================
 */

CONST.USER_STATUS = Object.freeze({

  ACTIVE: "ACTIVE",

  INACTIVE: "INACTIVE",

  LOCKED: "LOCKED",

  PENDING: "PENDING"

});

/* =============================================================================
 * KK STATUS
 * =============================================================================
 */

CONST.KK_STATUS = Object.freeze({

  ACTIVE: "ACTIVE",

  PINDAH: "PINDAH",

  NONAKTIF: "NONAKTIF"

});

/* =============================================================================
 * WARGA STATUS
 * =============================================================================
 */

CONST.WARGA_STATUS = Object.freeze({

  ACTIVE: "ACTIVE",

  MENINGGAL: "MENINGGAL",

  PINDAH: "PINDAH",

  NONAKTIF: "NONAKTIF"

});

/* =============================================================================
 * PBB STATUS
 * =============================================================================
 */

CONST.PBB_STATUS = Object.freeze({

  LUNAS: "LUNAS",

  BELUM_LUNAS: "BELUM_LUNAS"

});

/* =============================================================================
 * PENGAJUAN STATUS
 * =============================================================================
 */

CONST.PENGAJUAN_STATUS = Object.freeze({

  DRAFT: "DRAFT",

  PENDING_RT: "PENDING_RT",

  DISETUJUI_RT: "DISETUJUI_RT",

  PERBAIKAN_RT: "PERBAIKAN_RT",

  PENDING_RW: "PENDING_RW",

  DISETUJUI_RW: "DISETUJUI_RW",

  PERBAIKAN_RW: "PERBAIKAN_RW",

  SELESAI: "SELESAI",

  DITOLAK: "DITOLAK"

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
 * DEFAULT MESSAGE
 * =============================================================================
 */

CONST.MESSAGE = Object.freeze({

  SUCCESS: "Berhasil.",

  ERROR: "Terjadi kesalahan.",

  CREATED: "Data berhasil dibuat.",

  UPDATED: "Data berhasil diperbarui.",

  DELETED: "Data berhasil dihapus.",

  SAVED: "Data berhasil disimpan.",

  NOT_FOUND: "Data tidak ditemukan.",

  VALIDATION: "Validasi gagal.",

  LOGIN_FAILED: "Username atau password salah.",

  ACCESS_DENIED: "Akses ditolak.",

  SESSION_EXPIRED: "Session telah berakhir."

});

/* =============================================================================
 * ERROR CODE
 * =============================================================================
 */

CONST.ERROR = Object.freeze({

  UNKNOWN: "SYS000",

  SYSTEM: "SYS500",

  VALIDATION: "VAL001",

  NOT_FOUND: "SYS404",

  DUPLICATE: "SYS409",

  UNAUTHORIZED: "AUTH001",

  FORBIDDEN: "AUTH002",

  LOGIN_FAILED: "AUTH003",

  SESSION_EXPIRED: "AUTH004"

});

/* =============================================================================
 * COMPATIBILITY
 *
 * Layer sementara selama migrasi APP -> CONFIG / CONST.
 * Jangan menambah properti baru di sini.
 * Setelah seluruh project selesai dimigrasikan,
 * blok ini dapat dihapus.
 * =============================================================================
 */

CONST.APP = Object.freeze({

  NAME: CONFIG.APP_NAME,

  VERSION: CONFIG.VERSION,

  DATE_FORMAT: CONFIG.DATE_FORMAT,

  DATETIME_FORMAT: CONFIG.DATETIME_FORMAT,

  SPREADSHEET_ID: CONFIG.SPREADSHEET_ID,

  SPREADSHEET_NAME: CONFIG.SPREADSHEET_NAME,

  SESSION_TIMEOUT: CONFIG.SESSION_TIMEOUT

});

/* =============================================================================
 * END OF FILE
 * =============================================================================
 */