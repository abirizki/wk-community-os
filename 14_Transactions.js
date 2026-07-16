/**
 * =============================================================================
 * WK FRAMEWORK
 * File        : 14_Transaction.gs
 * Version     : 2.2.0
 * Description : Transaction & Workflow Manager
 * =============================================================================
 */

var Transaction = {};

/**
 * Transaction aktif
 */
Transaction._active = null;

/**
 * Riwayat transaksi
 */
Transaction._history = [];

/**
 * Memulai transaksi baru
 *
 * @param {String} name
 * @returns {Object}
 */
Transaction.begin = function (name) {

  if (Transaction.isActive()) {
    throw new Error("Transaction already running.");
  }

  var trx = {
    id: Utils.uuid(),
    name: name || CONST.MODULE.TRANSACTION,
    status: CONST.TRANSACTION_STATUS.RUNNING,

    user: Session.username(), // Already correct, no change needed.

    startedAt: Utils.timestamp(),
    startedMillis: Date.now(),

    finishedAt: null,
    finishedMillis: null,

    duration: 0,

    steps: [],
    undoStack: [],

    metadata: {}
  };

  Transaction._active = trx;

  if (typeof EVENT !== "undefined") {

    Event.dispatch(
      CONST.EVENT.TRANSACTION_BEGIN,
      trx
    );

  }

  return trx;

};

/**
 * Transaction aktif
 *
 * @returns {Object|null}
 */
Transaction.current = function () {

  return Transaction._active;

};

/**
 * Apakah ada transaksi aktif
 *
 * @returns {Boolean}
 */
Transaction.isActive = function () {

  return Transaction._active !== null;

};

/**
 * ID transaksi aktif
 *
 * @returns {String|null}
 */
Transaction.id = function () {

  return Transaction.isActive()
    ? Transaction._active.id
    : null;

};

/**
 * Nama transaksi
 *
 * @returns {String|null}
 */
Transaction.name = function () {

  return Transaction.isActive()
    ? Transaction._active.name
    : null;

};

/**
 * Status transaksi
 *
 * @returns {String}
 */
Transaction.status = function () {

  return Transaction.isActive()
    ? Transaction._active.status
    : CONST.TRANSACTION_STATUS.IDLE;

};

/**
 * Menambah metadata transaksi
 *
 * @param {String} key
 * @param {*} value
 * @returns {Boolean}
 */
Transaction.set = function (key, value) {

  if (!Transaction.isActive()) {

    return false;

  }

  Transaction._active.metadata[key] = value;

  return true;

};

/**
 * Mengambil metadata transaksi
 *
 * @param {String} key
 * @returns {*}
 */
Transaction.get = function (key) {

  if (!Transaction.isActive()) {

    return null;

  }

  return Transaction._active.metadata[key];

};

/* =============================================================================
 * WORKFLOW STEP
 * =============================================================================
 */

/**
 * Menambahkan step baru
 *
 * @param {String} name
 * @param {String=} module
 * @returns {Object|Boolean}
 */
Transaction.step=function(name,module){

if(!Transaction.isActive()){

return false;

}

var step={

id:Utils.uuid(),

name:name,

module:module||CONST.MODULE.CORE,

status:CONST.TRANSACTION_STATUS.RUNNING,

startedAt:Utils.timestamp(),

startedMillis:Date.now(),

finishedAt:null,

finishedMillis:null,

duration:0,

message:""

};

Transaction._active.steps.push(step);

return step;

};

/**
 * Menyelesaikan step
 *
 * @param {String} message
 * @returns {Boolean}
 */
Transaction.finishStep=function(message){

if(!Transaction.isActive()){

return false;

}

var steps=Transaction._active.steps;

if(!steps.length){

return false;

}

var step=steps[steps.length-1];

step.status=CONST.STATUS.SUCCESS;

step.finishedAt=Utils.timestamp();

step.finishedMillis=Date.now();

step.duration=

step.finishedMillis-

step.startedMillis;

step.message=message||"";

return true;

};

/**
 * Step gagal
 *
 * @param {String} message
 * @returns {Boolean}
 */
Transaction.failStep=function(message){

if(!Transaction.isActive()){

return false;

}

var steps=Transaction._active.steps;

if(!steps.length){

return false;

}

var step=steps[steps.length-1];

step.status=CONST.STATUS.FAILED;

step.finishedAt=Utils.timestamp();

step.finishedMillis=Date.now();

step.duration=

step.finishedMillis-

step.startedMillis;

step.message=message||"";

return true;

};

/**
 * Menambahkan Undo Action
 *
 * Undo dijalankan saat rollback
 *
 * @param {Function} callback
 * @returns {Boolean}
 */
Transaction.undo=function(callback){

if(!Transaction.isActive()){

return false;

}

if(typeof callback==="function"){

Transaction._active.undoStack.push(callback);

}

return true;

};

/**
 * Daftar workflow
 *
 * @returns {Array}
 */
Transaction.steps=function(){

if(!Transaction.isActive()){

return [];

}

return Transaction._active.steps;

};

/**
 * Step terakhir
 *
 * @returns {Object|null}
 */
Transaction.lastStep=function(){

if(!Transaction.isActive()){

return null;

}

var steps=Transaction._active.steps;

return steps.length

?steps[steps.length-1]

:null;

};

/**
 * Jumlah step
 *
 * @returns {Number}
 */
Transaction.stepCount=function(){

return Transaction.isActive()

?Transaction._active.steps.length

:0;

};

/**
 * Progress
 *
 * @param {Number} total
 * @returns {Number}
 */
Transaction.progress=function(total){

total=total||1;

return Math.min(

100,

Math.round(

(Transaction.stepCount()/total)*100

)

);

};

/* =============================================================================
 * TRANSACTION CONTROL
 * =============================================================================
 */

/**
 * Menyelesaikan transaksi
 *
 * @private
 */
Transaction.finish=function(status,reason){

if(!Transaction.isActive()){

return null;

}

var trx=Transaction._active;

trx.status=status;

trx.reason=reason||"";

trx.finishedAt=Utils.timestamp();

trx.finishedMillis=Date.now();

trx.duration=

trx.finishedMillis-

trx.startedMillis;

/* simpan history */

Transaction._history.push(

JSON.parse(

JSON.stringify(trx)

)

);

/* hapus transaksi aktif */

Transaction._active=null;

return trx;

};

/**
 * Commit Transaction
 */

Transaction.commit=function(){

if(!Transaction.isActive()){

return false;

}

var trx=

Transaction.finish(

CONST.TRANSACTION_STATUS.COMMITTED

);

if(

typeof EVENT!=="undefined"

){

Event.dispatch(

CONST.EVENT.TRANSACTION_COMMIT,

trx

);

}

Logger.info(

CONST.MODULE.TRANSACTION,

"COMMIT",

trx.id

);

return trx;

};

/**
 * Rollback Transaction
 */

Transaction.rollback=function(reason){

if(!Transaction.isActive()){

return false;

}

var stack=

Transaction.current()

.undoStack;

/* LIFO */

for(

var i=stack.length-1;

i>=0;

i--

){

try{

stack[i]();

}catch(ex){

Logger.error(

CONST.MODULE.TRANSACTION,

"UNDO",

ex

);

}

}

var trx=

Transaction.finish(

CONST.TRANSACTION_STATUS.ROLLED_BACK,

reason

);

if(

typeof EVENT!=="undefined"

){

Event.dispatch(

CONST.EVENT.TRANSACTION_ROLLBACK,

trx

);

}

Logger.warning(

CONST.MODULE.TRANSACTION,

"ROLLBACK",

reason||""

);

return trx;

};

/**
 * Cancel
 */

Transaction.cancel=function(message){

return Transaction.rollback(

message||

"CANCELLED"

);

};

/**
 * Clear Active Transaction
 */

Transaction.clear=function(){

Transaction._active=null;

return true;

};
/* =============================================================================
 * AFTER COMMIT
 * =============================================================================
 */

/**
 * Menambahkan callback setelah commit berhasil.
 *
 * @param {Function} callback
 * @returns {Boolean}
 */
Transaction.afterCommit=function(callback){

if(!Transaction.isActive()){

return false;

}

if(!Transaction._active.afterCommit){

Transaction._active.afterCommit=[];

}

if(typeof callback==="function"){

Transaction._active.afterCommit.push(callback);

}

return true;

};

/**
 * Menjalankan seluruh callback afterCommit.
 *
 * @private
 */
Transaction.runAfterCommit=function(trx){

if(!trx.afterCommit){

return;

}

trx.afterCommit.forEach(function(callback){

try{

callback();

}catch(ex){

Logger.error(

CONST.MODULE.TRANSACTION,

"AFTER_COMMIT",

ex

);

}

});

};

/* =============================================================================
 * HISTORY
 * =============================================================================
 */

/**
 * Seluruh history transaksi.
 */
Transaction.history=function(){

return Transaction._history.slice();

};

/**
 * Transaksi terakhir.
 */
Transaction.last=function(){

return Transaction._history.length

?Transaction._history[
Transaction._history.length-1
]

:null;

};

/**
 * Ringkasan transaksi.
 */
Transaction.summary=function(){

return{

active:Transaction.isActive(),

current:Transaction.current(),

history:Transaction._history.length

};

};

/**
 * Informasi kesehatan Transaction Manager.
 */
Transaction.health=function(){

return{

success:true,

status:

Transaction.isActive()

        ?CONST.TRANSACTION_STATUS.RUNNING

        :CONST.TRANSACTION_STATUS.IDLE,

activeId:

Transaction.id(),

history:

Transaction._history.length,

    timestamp:Utils.timestamp()

};

};

Transaction.info=function(){

return Transaction.health();

};