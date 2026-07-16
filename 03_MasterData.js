/**
 * =============================================================================
 * WK FRAMEWORK
 * -----------------------------------------------------------------------------
 * File        : 03_MasterData.gs
 * Version     : 2.2.0
 * Description : Master Data Provider
 * Author      : WK Framework
 * -----------------------------------------------------------------------------
 * Seluruh master data diambil dari CONST.
 * Module lain cukup memanggil MasterData.xxx()
 * =============================================================================
 */

var MasterData = {};

/* =============================================================================
 * MASTER
 * =============================================================================
 */

MasterData.agama = function () {
  return CONST.MASTER.AGAMA.slice();
};

MasterData.pendidikan = function () {
  return CONST.MASTER.PENDIDIKAN.slice();
};

MasterData.pekerjaan = function () {
  return CONST.MASTER.PEKERJAAN.slice();
};

MasterData.statusPerkawinan = function () {
  return CONST.MASTER.STATUS_PERKAWINAN.slice();
};

MasterData.statusKeluarga = function () {
  return CONST.MASTER.STATUS_KELUARGA.slice();
};

MasterData.jenisKelamin = function () {
  return CONST.MASTER.JENIS_KELAMIN.slice();
};

/* =============================================================================
 * STATUS
 * =============================================================================
 */


MasterData.userStatus = function () {
  return Object.keys(CONST.USER_STATUS).map(function (key) {
    return CONST.USER_STATUS[key];
  });
};

MasterData.wargaStatus = function () {
  return Object.keys(CONST.WARGA_STATUS).map(function (key) {
    return CONST.WARGA_STATUS[key];
  });
};

MasterData.kkStatus = function () {
  return Object.keys(CONST.KK_STATUS).map(function (key) {
    return CONST.KK_STATUS[key];
  });
};

MasterData.pbbStatus = function () {
  return Object.keys(CONST.PBB_STATUS).map(function (key) {
    return CONST.PBB_STATUS[key];
  });
};

MasterData.pengajuanStatus = function () {
  return Object.keys(CONST.PENGAJUAN_STATUS).map(function (key) {
    return CONST.PENGAJUAN_STATUS[key];
  });
};

/* =============================================================================
 * ROLE
 * =============================================================================
 */

MasterData.roles = function () {
  return Object.keys(CONST.ROLES).map(function (key) {
    return CONST.ROLES[key];
  });
};

/* =============================================================================
 * DEFAULT LAYANAN
 * =============================================================================
 */

MasterData.layananDefault = function () {

  return [

    {
      kode: "SKTM",
      nama: "Surat Keterangan Tidak Mampu",
      estimasi: "2 Hari",
      biaya: "Gratis",
      aktif: true
    },

    {
      kode: "DOM",
      nama: "Surat Keterangan Domisili",
      estimasi: "2 Hari",
      biaya: "Gratis",
      aktif: true
    },

    {
      kode: "SKU",
      nama: "Surat Keterangan Usaha",
      estimasi: "2 Hari",
      biaya: "Gratis",
      aktif: true
    },

    {
      kode: "SKCK",
      nama: "Surat Pengantar SKCK",
      estimasi: "2 Hari",
      biaya: "Gratis",
      aktif: true
    },

    {
      kode: "NIKAH",
      nama: "Surat Pengantar Nikah",
      estimasi: "2 Hari",
      biaya: "Gratis",
      aktif: true
    }

  ];

};

/* =============================================================================
 * GENERIC ACCESSOR
 * =============================================================================
 */

MasterData.get = function (name) {

  switch (String(name).toLowerCase()) {

    case "agama":
      return MasterData.agama();

    case "pendidikan":
      return MasterData.pendidikan();

    case "pekerjaan":
      return MasterData.pekerjaan();

    case "statusperkawinan":
      return MasterData.statusPerkawinan();

    case "statuskeluarga":
      return MasterData.statusKeluarga();

    case "jeniskelamin":
      return MasterData.jenisKelamin();

    case "roles":
      return MasterData.roles();

    case "userstatus":
      return MasterData.userStatus();

    case "wargastatus":
      return MasterData.wargaStatus();

    case "kkstatus":
      return MasterData.kkStatus();

    case "pbbstatus":
      return MasterData.pbbStatus();

    case "pengajuanstatus":
      return MasterData.pengajuanStatus();

    case "layanan":
      return MasterData.layananDefault();

    default:
      return [];

  }

};

/* =============================================================================
 * INFO
 * =============================================================================
 */

MasterData.version = function () {
  return CONFIG.VERSION;
};

MasterData.framework = function () {
  return CONST.FRAMEWORK.NAME;
};

/* =============================================================================
 * HEALTH CHECK
 * =============================================================================
 */

MasterData.health = function () {
  var categories = [
    "agama", "pendidikan", "pekerjaan", "statusPerkawinan",
    "statusKeluarga", "jenisKelamin", "roles", "userStatus",
    "wargaStatus", "kkStatus", "pbbStatus", "pengajuanStatus", "layanan"
  ];
  return {
    success: true,
    status: CONST.STATUS.READY,
    service: "MasterData",
    totalCategories: categories.length,
    timestamp: Utils.timestamp()
  };
};