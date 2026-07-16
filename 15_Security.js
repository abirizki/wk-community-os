/**
 * =============================================================================
 * WK FRAMEWORK
 * File        : 15_Security.gs
 * Version     : 2.2.0
 * Description : Security Manager
 * =============================================================================
 */

var Security={};

/**
 * Panjang token
 */
Security.TOKEN_LENGTH=64;

/**
 * Membuat token acak
 *
 * @returns {String}
 */
Security.generateToken=function(){

return Utilities.getUuid()

.replace(/-/g,"")

+

Utilities.getUuid()

.replace(/-/g,"");

};

/**
 * Hash SHA-256
 *
 * @param {String} value
 * @returns {String}
 */
Security.sha256=function(value){

var bytes=

Utilities.computeDigest(

Utilities.DigestAlgorithm.SHA_256,

String(value)

);

return bytes.map(function(b){

var v=(b<0)?b+256:b;

return ("0"+v.toString(16)).slice(-2);

}).join("");

};

/**
 * Membuat password hash
 *
 * @param {String} password
 * @returns {String}
 */
Security.hashPassword=function(password){

return Security.sha256(

String(password)

);

};

/**
 * Verifikasi password
 *
 * @param {String} password
 * @param {String} hash
 * @returns {Boolean}
 */
Security.verifyPassword=function(password,hash){

return

Security.hashPassword(password)

===hash;

};

/**
 * Membuat Request Signature
 *
 * @param {Object} payload
 * @returns {String}
 */
Security.signature=function(payload){

return Security.sha256(

JSON.stringify(payload)

);

};

/* =============================================================================
 * PASSWORD SECURITY
 * =============================================================================
 */

/**
 * Jumlah iterasi hashing
 */
Security.HASH_ITERATION = 1000;

/**
 * Membuat salt acak
 *
 * @returns {String}
 */
Security.generateSalt = function () {

  return Utilities.getUuid()

    .replace(/-/g, "");

};

/**
 * Random String
 *
 * @param {Number} length
 * @returns {String}
 */
Security.randomString = function (length) {

  length = length || 32;

  var chars =

    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    "abcdefghijklmnopqrstuvwxyz" +
    "0123456789";

  var text = "";

  for (var i = 0; i < length; i++) {

    text += chars.charAt(

      Math.floor(

        Math.random() * chars.length

      )

    );

  }

  return text;

};

/**
 * Nonce
 */
Security.nonce = function () {

  return Security.randomString(32);

};

/**
 * Hash Password + Salt
 *
 * @param {String} password
 * @param {String} salt
 * @returns {String}
 */
Security.hash = function (password, salt) {

  var value =

    String(password) +

    String(salt);

  for (

    var i = 0;

    i < Security.HASH_ITERATION;

    i++

  ) {

    value =

      Security.sha256(value);

  }

  return value;

};

/**
 * Verifikasi Password
 *
 * @returns {Boolean}
 */
Security.verify = function (

  password,

  hash,

  salt

) {

  return

    Security.constantTimeCompare(

      Security.hash(

        password,

        salt

      ),

      hash

    );

};

/**
 * Constant Time Compare
 *
 * Mengurangi risiko timing attack.
 */
Security.constantTimeCompare = function (

  a,

  b

) {

  a = String(a);

  b = String(b);

  if (

    a.length !== b.length

  ) {

    return false;

  }

  var result = 0;

  for (

    var i = 0;

    i < a.length;

    i++

  ) {

    result |=

      a.charCodeAt(i)

      ^

      b.charCodeAt(i);

  }

  return result === 0;

};

/* =============================================================================
 * REQUEST SECURITY
 * =============================================================================
 */

/**
 * Membuat CSRF Token
 *
 * @returns {String}
 */
Security.generateCsrfToken = function () {

  return Security.generateToken();

};

/**
 * Validasi CSRF Token
 *
 * @param {String} token
 * @param {String} sessionToken
 * @returns {Boolean}
 */
Security.validateCsrfToken = function (token, sessionToken) {

  if (!token || !sessionToken) {

    return false;

  }

  return Security.constantTimeCompare(

    token,

    sessionToken

  );

};

/**
 * Validasi Session
 *
 * @returns {Boolean}
 */
Security.validateSession = function () {

  return Session.isLoggedIn();

};

/**
 * Validasi Signature
 *
 * @param {Object} payload
 * @param {String} signature
 * @returns {Boolean}
 */
Security.validateSignature = function (

  payload,

  signature

) {

  var sign =

    Security.signature(payload);

  return Security.constantTimeCompare(

    sign,

    signature

  );

};

/**
 * Rate Limiter
 *
 * @param {String} key
 * @param {Number} limit
 * @param {Number} ttl
 * @returns {Boolean}
 */
Security.rateLimit = function (

  key,

  limit,

  ttl

) {

  limit = limit || 30;

  ttl = ttl || 60;

  var cacheKey =

    "RATE_" + key;

  var count =

    Cache.get(cacheKey);

  count =

    count

    ? Number(count)

    : 0;

  if (count >= limit) {

    return false;

  }

  Cache.put(

    cacheKey,

    String(count + 1),

    ttl

  );

  return true;

};

/**
 * Validasi seluruh request
 *
 * @param {Object} options
 * @returns {Boolean}
 */
Security.validateRequest = function (

  options

) {

  options = options || {};

  if (

    options.session !== false &&

    !Security.validateSession()

  ) {

    return false;

  }

  if (

    options.rateKey

  ) {

    if (

      !Security.rateLimit(

        options.rateKey,

        options.limit,

        options.ttl

      )

    ) {

      return false;

    }

  }

  return true;

};

/* =============================================================================
 * SECURITY UTILITIES
 * =============================================================================
 */

/**
 * Audit Security Event
 *
 * @param {String} action
 * @param {String} message
 */
Security.audit = function(action, message) {

  Logger.info(

    CONST.MODULE.SECURITY,

    action,

    message || ""

  );

};

/**
 * Generate API Key
 *
 * @returns {String}
 */
Security.generateApiKey = function() {

  return Security.sha256(

    Security.randomString(64) +

    Date.now()

  );

};

/**
 * Generate Secret Key
 *
 * @returns {String}
 */
Security.generateSecretKey = function() {

  return Security.sha256(

    Utilities.getUuid() +

    Security.randomString(64)

  );

};

/**
 * Validasi kekuatan password
 *
 * Minimal:
 * - 8 karakter
 * - Huruf kecil
 * - Huruf besar
 * - Angka
 */
Security.isSecurePassword = function(password) {

  password = String(password || "");

  if (password.length < 8) {

    return false;

  }

  if (!/[a-z]/.test(password)) {

    return false;

  }

  if (!/[A-Z]/.test(password)) {

    return false;

  }

  if (!/[0-9]/.test(password)) {

    return false;

  }

  return true;

};

/**
 * Informasi Security
 */
Security.info = function() {

  return {

    tokenLength: Security.TOKEN_LENGTH,

    hashIteration: Security.HASH_ITERATION,

    sessionValid: Security.validateSession(),

    timestamp: Utils.timestamp()

  };

};

/**
 * Health Check
 */
Security.health = function() {

  return {

    success: true,

    status: CONST.STATUS.READY,

    service: "Security Manager", // Human-readable, ok to leave

    version: "2.2.0",

    timestamp: Utils.timestamp()

  };

};
