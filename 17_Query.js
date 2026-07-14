/**
 * =============================================================================
 * WK FRAMEWORK
 * -----------------------------------------------------------------------------
 * File        : 17_Query.gs
 * Version     : 2.2.0
 * Description : Query Builder
 * Author      : WK Framework
 * =============================================================================
 */

/* =============================================================================
 * QUERY BUILDER
 * =============================================================================
 */

/**
 * Constructor Query Builder.
 *
 * @constructor
 */
function QueryBuilder() {

  this.reset();

}

/* =============================================================================
 * RESET
 * =============================================================================
 */

/**
 * Reset query menjadi kondisi awal.
 *
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.reset = function () {

  this._query = {

    table: "",

    select: ["*"],

    where: [],

    orderBy: [],

    limit: null,

    offset: 0

  };

  return this;

};

/* =============================================================================
 * TABLE
 * =============================================================================
 */

/**
 * Menentukan nama tabel.
 *
 * @param {String} table
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.table = function (table) {

  this._query.table = table;

  return this;

};

/* =============================================================================
 * SELECT
 * =============================================================================
 */

/**
 * Menentukan field yang dipilih.
 *
 * @param {Array|String} fields
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.select = function (fields) {

  if (!fields) {

    fields = ["*"];

  }

  if (!Array.isArray(fields)) {

    fields = [fields];

  }

  this._query.select = fields;

  return this;

};

/* =============================================================================
 * WHERE
 * =============================================================================
 */

/**
 * Menambahkan kondisi WHERE.
 *
 * Contoh:
 *   .where("RT","01")
 *   .where("UMUR",">",17)
 *
 * @param {String} field
 * @param {String|*} operator
 * @param {*} value
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.where = function (field, operator, value) {

  if (arguments.length === 2) {

    value = operator;
    operator = "=";

  }

  this._query.where.push({

    field: field,

    operator: String(operator).toUpperCase(),

    value: value

  });

  return this;

};

/* =============================================================================
 * OR WHERE
 * =============================================================================
 */

/**
 * Menambahkan kondisi OR WHERE.
 *
 * @param {String} field
 * @param {String|*} operator
 * @param {*} value
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.orWhere = function (field, operator, value) {

  if (arguments.length === 2) {

    value = operator;
    operator = "=";

  }

  this._query.where.push({

    type: "OR",

    field: field,

    operator: String(operator).toUpperCase(),

    value: value

  });

  return this;

};

/* =============================================================================
 * ORDER BY
 * =============================================================================
 */

/**
 * Menambahkan ORDER BY.
 *
 * @param {String} field
 * @param {String=} direction
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.orderBy = function (field, direction) {

  direction = direction || "ASC";

  this._query.orderBy.push({

    field: field,

    direction: String(direction).toUpperCase()

  });

  return this;

};

/* =============================================================================
 * LIMIT
 * =============================================================================
 */

/**
 * Membatasi jumlah data.
 *
 * @param {Number} value
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.limit = function (value) {

  this._query.limit = Number(value);

  return this;

};

/* =============================================================================
 * OFFSET
 * =============================================================================
 */

/**
 * Offset data.
 *
 * @param {Number} value
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.offset = function (value) {

  this._query.offset = Number(value);

  return this;

};

/* =============================================================================
 * BUILD
 * =============================================================================
 */

/**
 * Menghasilkan snapshot query.
 *
 * Repository akan menggunakan hasil ini
 * untuk melakukan proses filtering.
 *
 * @returns {Object}
 */
QueryBuilder.prototype.build = function () {

  return this.toObject();

};

/* =============================================================================
 * OBJECT
 * =============================================================================
 */

/**
 * Mengubah Query menjadi Object baru
 * (deep copy).
 *
 * @returns {Object}
 */
QueryBuilder.prototype.toObject = function () {

  return JSON.parse(
    JSON.stringify(this._query)
  );

};

/* =============================================================================
 * CLONE
 * =============================================================================
 */

/**
 * Membuat salinan QueryBuilder.
 *
 * @returns {QueryBuilder}
 */
QueryBuilder.prototype.clone = function () {

  var copy = new QueryBuilder();

  copy._query = this.toObject();

  return copy;

};