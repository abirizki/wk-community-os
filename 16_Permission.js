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

SUPER_ADMIN:["*"],

ADMIN:[

"dashboard.view",

"user.manage",

"master.manage",

"kk.manage",

"warga.manage",

"pbb.manage",

"surat.manage"

],

KELURAHAN:[

"dashboard.view",

"kk.read",

"warga.read",

"pbb.read",

"pbb.update",

"surat.read",

"surat.verify",

"surat.approve",

"laporan.view"

],

RW:[

"dashboard.view",

"kk.read",

"warga.read",

"surat.create",

"surat.read",

"surat.verify.rw",

"surat.download"

],

RT:[

"dashboard.view",

"kk.read",

"kk.create",

"kk.update",

"warga.read",

"warga.create",

"warga.update",

"surat.create",

"surat.read",

"surat.verify.rt"

],

WARGA:[

"dashboard.view",

"profil.read",

"profil.update",

"surat.create",

"surat.read",

"surat.download"

],

GUEST:[

"home.view",

"informasi.view"

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

"GUEST"

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

"GUEST"

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

permissions.indexOf("*")>-1

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

"GUEST"

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

    "PERMISSION",

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

    "PERMISSION",

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

    timestamp:

      Helper.now()

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

    timestamp:

      Helper.now()

  };

};