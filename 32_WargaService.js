/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 32_WargaService.gs
 * Version : 1.0.0
 * Phase   : Service
 * =============================================================================
 */

var WargaService = {};

/**
 * Membuat data warga baru dengan validasi dan security hook.
 *
 * @param {Object} data - Data warga dari request.
 * @returns {Object} Response object.
 */
WargaService.createWarga = function (data) {

  if (!Validator.warga(data)) {
    return Response.validation(Validator.message("WARGA"));
  }

  if (WargaRepository.existsNik(data.NIK)) {
    return Response.duplicate("NIK");
  }

  // Tambahkan audit fields dan jalankan security hook
  var preparedData = Security.beforeInsert(data);

  var result = WargaRepository.create(preparedData);

  if (result) {
    // Disarankan untuk memindahkan logic audit ke service juga
    // Security.audit(Session.user(), "CREATE_WARGA");
    return Response.created(preparedData);
  }

  return Response.error("Gagal membuat data warga.");

};

/**
 * Memperbarui data warga dengan validasi dan security hook.
 *
 * @param {String} id - ID warga yang akan diperbarui.
 * @param {Object} data - Data baru untuk warga.
 * @returns {Object} Response object.
 */
WargaService.updateWarga = function (id, data) {

  var warga = WargaRepository.find(id);
  if (!warga) {
    return Response.notFound("Warga");
  }

  // Gabungkan data lama dan baru
  var mergedData = Object.assign({}, warga, data);

  if (!Validator.warga(mergedData)) {
    return Response.validation(Validator.message("WARGA"));
  }

  // Tambahkan audit fields dan jalankan security hook
  var preparedData = Security.beforeUpdate(data);

  var result = WargaRepository.update(id, preparedData);

  if (result) {
    // Disarankan untuk memindahkan logic audit ke service juga
    // Security.audit(Session.user(), "UPDATE_WARGA");
    return Response.updated(preparedData);
  }

  return Response.error("Gagal memperbarui data warga.");

};