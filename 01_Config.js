/**
 * =============================================================================
 * WK FRAMEWORK
 * =============================================================================
 * File        : 01_Config.gs
 * Version     : 2.2.0
 * Description : Global Application Configuration
 * Author      : WK Framework
 * =============================================================================
 */

var CONFIG = Object.freeze({

  /* ==========================================================================
   * APPLICATION
   * ========================================================================== */

  APP_NAME: "WK SIMPEL",

  APP_CODE: "WK",

  VERSION: "2.2.0",

  DESCRIPTION: "Framework RT/RW Digital Warga Kebonjati",

  ENVIRONMENT: "PRODUCTION",

  DEBUG: true,

  LOG_LEVEL: "INFO",

  /* ==========================================================================
   * REGIONAL
   * ========================================================================== */

  COUNTRY: "Indonesia",

  PROVINCE: "Jawa Barat",

  CITY: "Kota Sukabumi",

  DISTRICT: "Cikole",

  VILLAGE: "Kebonjati",

  TIMEZONE: "Asia/Jakarta",

  LOCALE: "id-ID",

  CURRENCY: "IDR",

  /* ==========================================================================
   * DATE & TIME
   * ========================================================================== */

  DATE_FORMAT: "dd/MM/yyyy",

  DATETIME_FORMAT: "dd/MM/yyyy HH:mm:ss",

  /* ==========================================================================
   * SPREADSHEET
   * ========================================================================== */

  SPREADSHEET_ID: "",

  SPREADSHEET_NAME: "WK_SIMPEL_DATABASE",

  DEFAULT_SHEET: "SYSTEM",

  AUTO_CREATE_SHEET: true,

  /* ==========================================================================
   * CACHE
   * ========================================================================== */

  CACHE_ENABLED: true,

  CACHE_TTL: 300,

  CACHE_PREFIX: "WK_",

  /* ==========================================================================
   * SESSION
   * ========================================================================== */

  SESSION_ENABLED: true,

  SESSION_TIMEOUT: 3600,

  SESSION_PREFIX: "WK_SESSION_",

  /* ==========================================================================
   * DATABASE
   * ========================================================================== */

  DEFAULT_PAGE_SIZE: 20,

  MAX_PAGE_SIZE: 100,

  DEFAULT_SORT_DIRECTION: "ASC",

  DEFAULT_BATCH_SIZE: 100

  ,
  /* ==========================================================================
   * FILE UPLOAD
   * ========================================================================== */

  UPLOAD_FOLDER: "WK_UPLOAD",

  MAX_UPLOAD_SIZE: 2 * 1024 * 1024,

  ALLOWED_FILE_TYPES: [

    "pdf",

    "jpg",

    "jpeg",

    "png"

  ],

  IMAGE_MAX_WIDTH: 1920,

  IMAGE_MAX_HEIGHT: 1080,

  IMAGE_QUALITY: 85,

  /* ==========================================================================
   * SECURITY
   * ========================================================================== */

  PASSWORD_MIN_LENGTH: 8,

  PASSWORD_REQUIRE_UPPERCASE: true,

  PASSWORD_REQUIRE_NUMBER: true,

  PASSWORD_REQUIRE_SYMBOL: false,

  MAX_LOGIN_ATTEMPT: 5,

  LOCKOUT_DURATION: 900,

  ENABLE_AUDIT_LOG: true,

  ENABLE_ACTIVITY_LOG: true,

  /* ==========================================================================
   * REPOSITORY
   * ========================================================================== */

  AUTO_GENERATE_ID: true,

  SOFT_DELETE: true,

  DEFAULT_CREATED_BY: "SYSTEM",

  DEFAULT_UPDATED_BY: "SYSTEM",

  /* ==========================================================================
   * QR CODE
   * ========================================================================== */

  QR_ENABLED: true,

QR_WIDTH: 250,

QR_HEIGHT: 250,

QR_MARGIN: 2,

QR_VERIFY_URL: "",

  /* ==========================================================================
   * SURAT
   * ========================================================================== */

  SURAT_NUMBER_FORMAT:

    "{KODE}/{NOMOR}/{RT}/{RW}/{BULAN}/{TAHUN}",

  SURAT_DEFAULT_STATUS: "DRAFT",

  SURAT_REQUIRE_APPROVAL: true,

  SURAT_USE_QR_SIGNATURE: true

  ,
  /* ==========================================================================
   * PROPERTY (RUMAH / KOS / KONTRAKAN)
   * ========================================================================== */

  PROPERTY_ENABLED: true,

  PROPERTY_ALLOW_OWNER_REGISTRATION: true,

  PROPERTY_REQUIRE_RT_APPROVAL: true,

  PROPERTY_DEFAULT_STATUS: "ACTIVE",

  PROPERTY_PHOTO_REQUIRED: true,

  /* ==========================================================================
   * PENDUDUK SEMENTARA
   * ========================================================================== */

  TEMP_RESIDENT_ENABLED: true,

  TEMP_RESIDENT_PHOTO_REQUIRED: true,

  TEMP_RESIDENT_ID_REQUIRED: true,

  TEMP_RESIDENT_MAX_STAY_DAYS: 365,

  TEMP_RESIDENT_REQUIRE_RT_APPROVAL: true,

  /* ==========================================================================
   * FASILITAS UMUM & SWASTA
   * ========================================================================== */

  FACILITY_ENABLED: true,

  FACILITY_PHOTO_REQUIRED: true,

  FACILITY_ALLOW_LOCATION_NOTE: true,

  FACILITY_DEFAULT_STATUS: "ACTIVE",

  /* ==========================================================================
   * DASHBOARD
   * ========================================================================== */

  DASHBOARD_REFRESH_INTERVAL: 300,

  DASHBOARD_SHOW_STATISTICS: true,

  DASHBOARD_SHOW_NOTIFICATION: true,

  /* ==========================================================================
   * FEATURE FLAGS
   * ========================================================================== */

  FEATURE_QR_CODE: true,

  FEATURE_AUDIT_LOG: true,

  FEATURE_CACHE: true,

  FEATURE_NOTIFICATION: false,

  FEATURE_WHATSAPP: false,

  FEATURE_EMAIL: false,

  FEATURE_API: false,

  /* ==========================================================================
   * SYSTEM
   * ========================================================================== */

  SYSTEM_MAINTENANCE: false,

  SYSTEM_READONLY: false,

  SYSTEM_VERSION: "2.2.0"

  ,

  /* ==========================================================================
   * FRAMEWORK
   * ========================================================================== */

  FRAMEWORK_NAME: "WK Framework",

  FRAMEWORK_VERSION: "2.2.0",

  FRAMEWORK_STATUS: "PRODUCTION",

  /* ==========================================================================
   * INSTALLER
   * ========================================================================== */

  AUTO_INSTALL: true,

  AUTO_UPGRADE: true,

  INSTALL_SAMPLE_DATA: false,

  /* ==========================================================================
   * DEVELOPMENT
   * ========================================================================== */

  STRICT_MODE: true,

  ENABLE_PROFILER: false,

  ENABLE_DEBUG_LOG: true

});