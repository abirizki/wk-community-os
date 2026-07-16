/**
 * =============================================================================
 * WK FRAMEWORK
 * File        : 16_Permission.gs
 * Version     : 2.2.0
 * Description : Role Based Access Control (RBAC)
 * =============================================================================
 */

var Permission={};

/**
 * Role Matrix
 *
 * Format:
 * role : [permission,...]
 */
Permission._roles={

SUPER_ADMIN:[CONST.PERMISSION.ALL],

ADMIN:[

CONST.PERMISSION.DASHBOARD_VIEW,

CONST.PERMISSION.USER_MANAGE,

CONST.PERMISSION.MASTER_MANAGE,

CONST.PERMISSION.KK_MANAGE,

CONST.PERMISSION.WARGA_MANAGE,

CONST.PERMISSION.PBB_MANAGE,

CONST.PERMISSION.SURAT_MANAGE

],

KELURAHAN:[

CONST.PERMISSION.DASHBOARD_VIEW,

CONST.PERMISSION.KK_READ,

CONST.PERMISSION.WARGA_READ,

CONST.PERMISSION.PBB_READ,

CONST.PERMISSION.PBB_UPDATE,

CONST.PERMISSION.SURAT_READ,

CONST.PERMISSION.SURAT_VERIFY,

CONST.PERMISSION.SURAT_APPROVE,

CONST.PERMISSION.LAPORAN_VIEW

],

RW:[

CONST.PERMISSION.DASHBOARD_VIEW,

CONST.PERMISSION.KK_READ,

CONST.PERMISSION.WARGA_READ,

CONST.PERMISSION.SURAT_CREATE,

CONST.PERMISSION.SURAT_READ,

CONST.PERMISSION.SURAT_VERIFY_RW,

CONST.PERMISSION.SURAT_DOWNLOAD

],

RT:[

CONST.PERMISSION.DASHBOARD_VIEW,

CONST.PERMISSION.KK_READ,

CONST.PERMISSION.KK_CREATE,

CONST.PERMISSION.KK_UPDATE,

CONST.PERMISSION.WARGA_READ,

CONST.PERMISSION.WARGA_CREATE,

CONST.PERMISSION.WARGA_UPDATE,

CONST.PERMISSION.SURAT_CREATE,

CONST.PERMISSION.SURAT_READ,

CONST.PERMISSION.SURAT_VERIFY_RT

],

WARGA:[

CONST.PERMISSION.DASHBOARD_VIEW,

CONST.PERMISSION.PROFIL_READ,

CONST.PERMISSION.PROFIL_UPDATE,

CONST.PERMISSION.SURAT_CREATE,

CONST.PERMISSION.SURAT_READ,

CONST.PERMISSION.SURAT_DOWNLOAD

],

GUEST:[

CONST.PERMISSION.HOME_VIEW,

CONST.PERMISSION.INFORMASI_VIEW

]

};

/**
 * Mengambil permission berdasarkan role
 *
 * @param {String} role
 * @returns {Array}
 */
Permission.permissions=function(role){

role=String(

role||

CONST.ROLE.GUEST

).toUpperCase();

return

Permission._roles[role]

||

[];

};

/**
 * Daftar Role
 *
 * @returns {Array}
 */
Permission.roles=function(){

return Object.keys(

Permission._roles

);

};

/* =============================================================================
 * PERMISSION CHECKER
 * =============================================================================
 */

/**
 * Mengambil role aktif.
 *
 * @param {String=} role
 * @returns {String}
 */
Permission.currentRole=function(role){

return String(

role ||

Session.role() ||

CONST.ROLE.GUEST

).toUpperCase();

};

/**
 * Apakah role memiliki permission tertentu.
 *
 * @param {String} permission
 * @param {String=} role
 * @returns {Boolean}
 */
Permission.can=function(permission,role){

role=

Permission.currentRole(role);

var permissions=

Permission.permissions(role);

if(

permissions.indexOf(CONST.PERMISSION.ALL)>-1

){

return true;

}

return permissions.indexOf(permission)>-1;

};

/**
 * Kebalikan dari can()
 */
Permission.cannot=function(permission,role){

return !Permission.can(

permission,

role

);

};

/**
 * Seluruh permission harus dimiliki.
 *
 * @param {Array} permissions
 * @param {String=} role
 * @returns {Boolean}
 */
Permission.all=function(

permissions,

role

){

for(

var i=0;

i<permissions.length;

i++

){

if(

!Permission.can(

permissions[i],

role

)

){

return false;

}

}

return true;

};

/**
 * Minimal satu permission.
 *
 * @param {Array} permissions
 * @param {String=} role
 * @returns {Boolean}
 */
Permission.any=function(

permissions,

role

){

for(

var i=0;

i<permissions.length;

i++

){

if(

Permission.can(

permissions[i],

role

)

){

return true;

}

}

return false;

};

/**
 * Memiliki role tertentu.
 */
Permission.hasRole=function(role){

return

Permission.currentRole()

===

String(role)

.toUpperCase();

};

/**
 * Guest
 */
Permission.isGuest=function(){

return Permission.hasRole(

CONST.ROLE.GUEST

);

};

/**
 * Sudah login
 */
Permission.isAuthenticated=function(){

return !Permission.isGuest();

};
/* =============================================================================
 * PERMISSION MANAGEMENT
 * =============================================================================
 */

/**
 * Otorisasi permission.
 *
 * @param {String} permission
 * @param {String=} role
 * @returns {Boolean}
 */
Permission.authorize = function(permission, role) {

  if (Permission.can(permission, role)) {

    return true;

  }

  Logger.warning(

    CONST.MODULE.PERMISSION,

    "DENIED",

    permission

  );

  throw new Error(

    "Access denied : " + permission

  );

};

/**
 * Menambahkan permission ke role (runtime only).
 *
 * @param {String} role
 * @param {String} permission
 * @returns {Boolean}
 */
Permission.grant = function(role, permission) {

  role = Permission.currentRole(role);

  if (!Permission._roles[role]) {

    Permission._roles[role] = [];

  }

  if (

    Permission._roles[role].indexOf(permission) === -1

  ) {

    Permission._roles[role].push(permission);

  }

  return true;

};

/**
 * Menghapus permission dari role (runtime only).
 *
 * @param {String} role
 * @param {String} permission
 * @returns {Boolean}
 */
Permission.revoke = function(role, permission) {

  role = Permission.currentRole(role);

  if (!Permission._roles[role]) {

    return false;

  }

  Permission._roles[role] =

    Permission._roles[role].filter(function(item) {

      return item !== permission;

    });

  return true;

};

/**
 * Menambahkan role baru (runtime only).
 *
 * @param {String} role
 * @param {Array=} permissions
 * @returns {Boolean}
 */
Permission.addRole = function(role, permissions) {

  role = String(role).toUpperCase();

  Permission._roles[role] = permissions || [];

  return true;

};

/**
 * Menghapus role (runtime only).
 *
 * @param {String} role
 * @returns {Boolean}
 */
Permission.removeRole = function(role) {

  role = String(role).toUpperCase();

  delete Permission._roles[role];

  return true;

};

/**
 * Mengganti seluruh permission role (runtime only).
 *
 * @param {String} role
 * @param {Array} permissions
 * @returns {Boolean}
 */
Permission.setPermissions = function(role, permissions) {

  role = String(role).toUpperCase();

  Permission._roles[role] = permissions || [];

  return true;

};
/* =============================================================================
 * PERMISSION UTILITIES
 * =============================================================================
 */

/**
 * Mengembalikan seluruh Role Matrix.
 *
 * @returns {Object}
 */
Permission.matrix = function() {

  return JSON.parse(

    JSON.stringify(

      Permission._roles

    )

  );

};

/**
 * Reset seluruh Role Matrix ke kondisi awal.
 *
 * Catatan:
 * Untuk MVP hanya mengembalikan false karena
 * matrix bawaan framework bersifat read-only.
 *
 * @returns {Boolean}
 */
Permission.reset = function() {

  Logger.warning(

    CONST.MODULE.PERMISSION,

    "RESET",

    "Operation not supported"

  );

  return false;

};

/**
 * Informasi Permission Engine.
 *
 * @returns {Object}
 */
Permission.info = function() {

  return {

    roles: Permission.roles(),

    totalRoles:

      Permission.roles().length,

    authenticated:

      Permission.isAuthenticated(),

    currentRole:

      Permission.currentRole(),

    timestamp: Utils.timestamp()

  };

};

/**
 * Health Check.
 *
 * @returns {Object}
 */
Permission.health = function() {

  return {

    success: true,

    status: "READY",

    service: "Permission Engine",

    version: "2.2.0",

    totalRoles:

      Permission.roles().length,

    timestamp: Utils.timestamp()

  };

};