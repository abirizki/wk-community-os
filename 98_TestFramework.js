/**
 * =============================================================================
 * WK FRAMEWORK TEST
 * -----------------------------------------------------------------------------
 * File : 98_TestFramework.gs
 * Version : 2.2.0
 * Description : Core Framework Testing
 * =============================================================================
 */

var Test = Test || {};

/**
 * Menampilkan judul test.
 *
 * @param {String} title
 */
Test.header = function (title) {

  Logger.log("");
  Logger.log("==================================================");
  Logger.log(title);
  Logger.log("==================================================");

};

/**
 * Menampilkan hasil PASS.
 *
 * @param {String} name
 */
Test.pass = function (name) {

  Logger.log("✅ PASS : " + name);

};

/**
 * Menampilkan hasil FAIL.
 *
 * @param {String} name
 * @param {Error} error
 */
Test.fail = function (name, error) {

  Logger.log("❌ FAIL : " + name);

  Logger.log(error);

};

/**
 * Menjalankan sebuah test.
 *
 * @param {String} name
 * @param {Function} callback
 */
Test.run = function (name, callback) {

  try {

    callback();

    Test.pass(name);

  } catch (err) {

    Test.fail(name, err);

  }

};

/* =============================================================================
 * CORE TEST
 * =============================================================================
 */

/**
 * Test Framework Boot
 */
function testFrameworkBoot() {

  Test.header("TEST : Framework.boot()");

  Test.run("Framework.boot()", function () {

    var result = Framework.boot();

    Logger.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      throw new Error("Framework boot failed.");
    }

    if (result.status !== CONST.STATUS.READY) {
      throw new Error("Framework status is not READY.");
    }

  });

}

function testQueryBuilder() {

  Test.header("TEST : QueryBuilder");

  Test.run("Create QueryBuilder", function () {

    var q = new QueryBuilder();

    if (!q) {
      throw new Error("QueryBuilder gagal dibuat.");
    }

    Logger.log(JSON.stringify(q._query, null, 2));

  });

}

function testQueryMethods() {

  Test.header("TEST : Query Methods");

  Test.run("Builder Methods", function () {

    var q = new QueryBuilder();

    q.table("WARGA")
      .select(["NIK", "NAMA"])
      .where("RT", "01")
      .where("STATUS", "ACTIVE")
      .orderBy("NAMA")
      .limit(10)
      .offset(5);

    Logger.log(JSON.stringify(q._query, null, 2));

    if (q._query.table !== "WARGA") {
      throw new Error("Table gagal.");
    }

    if (q._query.where.length !== 2) {
      throw new Error("Where gagal.");
    }

    if (q._query.orderBy.length !== 1) {
      throw new Error("OrderBy gagal.");
    }

    if (q._query.limit !== 10) {
      throw new Error("Limit gagal.");
    }

    if (q._query.offset !== 5) {
      throw new Error("Offset gagal.");
    }

  });

}

function testQueryOperator() {

  Test.header("TEST : Query Operator");

  Test.run("CONST.QUERY_OPERATOR", function () {

    Logger.log(CONST.QUERY_OPERATOR);

    if (CONST.QUERY_OPERATOR.GT !== ">") {
      throw new Error("GT salah.");
    }

    if (CONST.QUERY_OPERATOR.LIKE !== "LIKE") {
      throw new Error("LIKE salah.");
    }

    if (CONST.QUERY_OPERATOR.IN !== "IN") {
      throw new Error("IN salah.");
    }

  });

}

function testQueryClone() {

  Test.header("TEST : Query Clone");

  Test.run("Clone Query", function () {

    var base = new QueryBuilder();

    base
      .table("WARGA")
      .where("RT", "01");

    var copy = base.clone();

    copy.where("STATUS", "ACTIVE");

    Logger.log("BASE");
    Logger.log(JSON.stringify(base.build(), null, 2));

    Logger.log("COPY");
    Logger.log(JSON.stringify(copy.build(), null, 2));

    if (base.build().where.length !== 1) {
      throw new Error("Base berubah.");
    }

    if (copy.build().where.length !== 2) {
      throw new Error("Clone gagal.");
    }

  });

}