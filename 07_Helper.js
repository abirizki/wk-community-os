/**
 * =============================================================================
 * WK FRAMEWORK
 * -----------------------------------------------------------------------------
 * File        : 07_Helper.gs
 * Version     : 2.2.0
 * Description : Framework Helper
 * Author      : WK Framework
 * -----------------------------------------------------------------------------
 * Helper bersifat stateless.
 * Tidak menyimpan data.
 * Tidak mengakses Spreadsheet secara langsung.
 * =============================================================================
 */

var Helper = {};

/* =============================================================================
 * BASIC
 * =============================================================================
 */

Helper.uuid = function () {
  return Utils.uuid();
};

Helper.now = function () {
  return Utils.timestamp();
};

Helper.today = function () {
  return Utils.today();
};

/* =============================================================================
 * CURRENT USER
 * =============================================================================
 */

Helper.user = function () {

  try {

    return SessionRepository.current();

  } catch (e) {

    return null;

  }

};

Helper.userId = function () {

  var user = Helper.user();

  return user ? user.id : "";

};

Helper.username = function () {

  var user = Helper.user();

  return user ? user.username : "SYSTEM";

};

Helper.role = function () {

  var user = Helper.user();

  return user ? user.role : "SYSTEM";

};

/* =============================================================================
 * ID GENERATOR
 * =============================================================================
 */

Helper.createId = function (prefix) {

  return prefix +
    "-" +
    Utilities.getUuid()
      .substring(0, 8)
      .toUpperCase();

};

Helper.createPengajuanId = function () {

  return Helper.createId(
    CONST.PREFIX.PENGAJUAN
  );

};

Helper.createSuratId = function () {

  return Helper.createId(
    CONST.PREFIX.SURAT
  );

};

Helper.createAuditId = function () {

  return Helper.createId(
    CONST.PREFIX.AUDIT
  );

};

/* =============================================================================
 * AUDIT
 * =============================================================================
 */

Helper.audit = function (
  aksi,
  modul,
  keterangan
) {

  return {

    id: Helper.createAuditId(),

    tanggal: Helper.now(),

    user: Helper.username(),

    role: Helper.role(),

    aksi: aksi,

    modul: modul,

    keterangan: keterangan || ""

  };

};

Helper.statusHistory = function (
  status,
  catatan
) {

  return {

    tanggal: Helper.now(),

    status: status,

    oleh: Helper.username(),

    role: Helper.role(),

    catatan: catatan || ""

  };

};

/* =============================================================================
 * RESPONSE
 * =============================================================================
 */

Helper.success = function (data) {

  return Response.success(data);

};

Helper.error = function (message) {

  return Response.error(message);

};

Helper.notFound = function () {

  return Response.notFound();

};

Helper.unauthorized = function () {

  return Response.unauthorized();

};

/* =============================================================================
 * NUMBER GENERATOR
 * =============================================================================
 */

Helper.nextPengajuanNumber = function () {
  // TODO: This logic has been moved to PengajuanService to break circular dependency.
  // This helper is now deprecated and should be removed.
  Logger.log("WARNING: Helper.nextPengajuanNumber() is deprecated.");
  return Utils.generatePengajuanNumber(0);
};

Helper.nextSuratNumber = function () {
  // TODO: This logic has been moved to SuratService to break circular dependency.
  // This helper is now deprecated and should be removed.
  Logger.log("WARNING: Helper.nextSuratNumber() is deprecated.");
  return Utils.generateSuratNumber(0);
};

/* =============================================================================
 * QR CODE
 * =============================================================================
 */

Helper.qrUrl = function (id) {

  return Utils.qrVerifyUrl(id);

};

Helper.qrData = function (pengajuan) {

  return {

    id: pengajuan.ID,

    nomor: pengajuan.Nomor_Pengajuan,

    layanan: pengajuan.Jenis_Layanan,

    nik: pengajuan.NIK_Pemohon,

    url: Helper.qrUrl(pengajuan.ID)

  };

};

/* =============================================================================
 * FILE UPLOAD
 * =============================================================================
 */

Helper.uploadInfo = function (file) {

  return {

    id: Helper.uuid(),

    nama: file && file.name ? file.name : "",

    ekstensi:
      file && file.name
        ? Utils.fileExtension(file.name)
        : "",

    ukuran:
      file && file.size
        ? file.size
        : 0,

    valid:
      file
        ? Utils.isAllowedFile(file.name)
        : false,

    tanggal: Helper.now(),

    oleh: Helper.username()

  };

};

/* =============================================================================
 * TEMPLATE DATA
 * =============================================================================
 */

Helper.templateData = function (
  pengajuan,
  warga
) {

  return {

    NOMOR_PENGAJUAN:
      pengajuan.Nomor_Pengajuan,

    NOMOR_SURAT:
      pengajuan.Nomor_Surat || "",

    NAMA:
      warga.Nama,

    NIK:
      warga.NIK,

    NO_KK:
      warga.No_KK,

    ALAMAT:
      warga.Alamat,

    RT:
      warga.RT,

    RW:
      warga.RW,

    JENIS_LAYANAN:
      pengajuan.Jenis_Layanan,

    TUJUAN:
      pengajuan.Tujuan || "",

    TANGGAL:
      Helper.today(),

    QRCODE:
      Helper.qrUrl(pengajuan.ID)

  };

};

/* =============================================================================
 * DASHBOARD
 * =============================================================================
 */

Helper.dashboardSummary = function (data) {

  data = data || {};

  return {

    kk: data.kk || 0,

    warga: data.warga || 0,

    nop: data.nop || 0,

    layanan: data.layanan || 0,

    pengajuan: data.pengajuan || 0,

    selesai: data.selesai || 0,

    menunggu: data.menunggu || 0

  };

};

/* =============================================================================
 * ROLE
 * =============================================================================
 */

Helper.isRT = function () {

  return Helper.role() === CONST.ROLE.RT;

};

Helper.isRW = function () {

  return Helper.role() === CONST.ROLE.RW;

};

Helper.isKelurahan = function () {

  return Helper.role() === CONST.ROLE.KELURAHAN;

};

Helper.isAdmin = function () {

  return Helper.role() === CONST.ROLE.ADMIN;

};

Helper.isWarga = function () {

  return Helper.role() === CONST.ROLE.WARGA;

};

/* =============================================================================
 * DOCUMENT
 * =============================================================================
 */

Helper.generatePdf = function (template, data) {

  return {

    success: true,

    type: "PDF",

    template: template,

    data: data,

    tanggal: Helper.now(),

    oleh: Helper.username()

  };

};

Helper.generateDocx = function (template, data) {

  return {

    success: true,

    type: "DOCX",

    template: template,

    data: data,

    tanggal: Helper.now(),

    oleh: Helper.username()

  };

};

Helper.exportExcel = function (sheetName) {

  return {

    success: true,

    sheet: sheetName,

    tanggal: Helper.now(),

    oleh: Helper.username()

  };

};

Helper.importExcel = function (sheetName, fileName) {

  return {

    success: true,

    sheet: sheetName,

    file: fileName,

    tanggal: Helper.now(),

    oleh: Helper.username()

  };

};

/* =============================================================================
 * LOCKING
 * =============================================================================
 */

Helper.lockPengajuan = function (pengajuan) {

  pengajuan.Locked = true;

  pengajuan.Locked_At = Helper.now();

  pengajuan.Locked_By = Helper.username();

  return pengajuan;

};

Helper.unlockPengajuan = function (pengajuan) {

  pengajuan.Locked = false;

  pengajuan.Locked_At = "";

  pengajuan.Locked_By = "";

  return pengajuan;

};

/* =============================================================================
 * VERIFICATION
 * =============================================================================
 */

Helper.verifyRT = function (pengajuan) {

  pengajuan.Status = CONST.PENGAJUAN_STATUS.DISETUJUI_RT;

  pengajuan.Verifikasi_RT = Helper.now();

  pengajuan.RT_By = Helper.username();

  return pengajuan;

};

Helper.verifyRW = function (pengajuan) {

  pengajuan.Status = CONST.PENGAJUAN_STATUS.DISETUJUI_RW;

  pengajuan.Verifikasi_RW = Helper.now();

  pengajuan.RW_By = Helper.username();

  return pengajuan;

};

Helper.verifyKelurahan = function (pengajuan) {

  pengajuan.Status = CONST.PENGAJUAN_STATUS.SELESAI;

  pengajuan.Verifikasi_Kelurahan = Helper.now();

  pengajuan.Kelurahan_By = Helper.username();

  return pengajuan;

};

Helper.needRevision = function (
  pengajuan,
  role,
  catatan
) {

  if (role === CONST.ROLE.RT) {

    pengajuan.Status =
      CONST.PENGAJUAN_STATUS.PERBAIKAN_RT;

  } else if (role === CONST.ROLE.RW) {

    pengajuan.Status =
      CONST.PENGAJUAN_STATUS.PERBAIKAN_RW;

  }

  pengajuan.Catatan = catatan || "";

  Helper.unlockPengajuan(pengajuan);

  return pengajuan;

};

/* =============================================================================
 * NOTIFICATION
 * =============================================================================
 */

Helper.notification = function (
  user,
  title,
  message
) {

  return {

    user: user,

    title: title,

    message: message,

    tanggal: Helper.now()

  };

};

/* =============================================================================
 * TIMELINE
 * =============================================================================
 */

Helper.timeline = function (
  status,
  catatan
) {

  return {

    tanggal: Helper.now(),

    status: status,

    oleh: Helper.username(),

    role: Helper.role(),

    catatan: catatan || ""

  };

};

/* =============================================================================
 * AUDIT INFO
 * =============================================================================
 */

Helper.createdInfo = function () {

  return {

    created_at: Helper.now(),

    created_by: Helper.username()

  };

};

Helper.updatedInfo = function () {

  return {

    updated_at: Helper.now(),

    updated_by: Helper.username()

  };

};