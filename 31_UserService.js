/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 31_UserService.gs
 * Version : 1.0.0
 * Phase   : Service
 * =============================================================================
 */

var UserService = {};

/**
 * Mengubah password pengguna.
 *
 * @param {String} id - ID pengguna.
 * @param {String} newPassword - Password baru (plain text).
 * @returns {Boolean}
 */
UserService.changePassword = function (id, newPassword) {

  var hashedPassword = Security.hashPassword(newPassword);

  var data = {
    Password: hashedPassword,
    Updated_At: Utils.timestamp(),
    Updated_By: Session.username()
  };

  return UserRepository.update({
    ID: id,
    Password: data.Password,
    Updated_At: data.Updated_At,
    Updated_By: data.Updated_By
  });

};

/**
 * Mengaktifkan akun pengguna.
 *
 * @param {String} id - ID pengguna.
 * @returns {Boolean}
 */
UserService.activateUser = function (id) {

  var data = {
    Status: CONST.USER_STATUS.ACTIVE,
    Updated_At: Utils.timestamp(),
    Updated_By: Session.username()
  };

  return UserRepository.update({
    ID: id,
    Status: data.Status,
    Updated_At: data.Updated_At,
    Updated_By: data.Updated_By
  });

};

/**
 * Menonaktifkan akun pengguna.
 *
 * @param {String} id - ID pengguna.
 * @returns {Boolean}
 */
UserService.deactivateUser = function (id) {

  var data = {
    Status: CONST.USER_STATUS.INACTIVE,
    Updated_At: Utils.timestamp(),
    Updated_By: Session.username()
  };

  return UserRepository.update({
    ID: id,
    Status: data.Status,
    Updated_At: data.Updated_At,
    Updated_By: data.Updated_By
  });

};

/**
 * Mereset password pengguna.
 *
 * @param {String} id - ID pengguna.
 * @param {String} newPassword - Password baru (plain text).
 * @returns {Boolean}
 */
UserService.resetPassword = function (id, newPassword) {
    // Di masa depan, fungsi ini bisa mengirim notifikasi atau email.
    // Untuk saat ini, fungsinya sama dengan changePassword.
    return UserService.changePassword(id, newPassword);
};

/**
 * Health Check UserService.
 *
 * @returns {Object}
 */
UserService.health = function () {
  var repoHealth = UserRepository.health ? UserRepository.health() : { success: false };
  return {
    success: repoHealth.success,
    status: repoHealth.success ? CONST.STATUS.READY : CONST.STATUS.ERROR,
    service: "UserService",
    version: "1.0.0",
    repository: repoHealth,
    timestamp: Utils.timestamp()
  };
};