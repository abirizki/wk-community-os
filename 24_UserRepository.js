/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 20_UserRepository.gs
 * Version : 2.0.0
 * Phase   : Repository
 * Part    : 1 of 2
 * =============================================================================
 */

var UserRepository={};

UserRepository.all=function(){

return Query
.table(CONST.SHEETS.USERS)
.orderBy("Nama")
.get();

};

UserRepository.count=function(){

return Query
.table(CONST.SHEETS.USERS)
.count();

};

UserRepository.find=function(id){

return Query
.table(CONST.SHEETS.USERS)
.where("ID",id)
.first();

};

UserRepository.findByUsername=function(username){

return Query
.table(CONST.SHEETS.USERS)
.where("Username",username)
.first();

};

UserRepository.findByRole=function(role){

return Query
.table(CONST.SHEETS.USERS)
.where("Role",role)
.orderBy("Nama")
.get();

};

UserRepository.findActive=function(){

return Query
.table(CONST.SHEETS.USERS)
.where("Status","ACTIVE")
.orderBy("Nama")
.get();

};

UserRepository.exists=function(username){

return Query
.table(CONST.SHEETS.USERS)
.where("Username",username)
.exists();

};

UserRepository.save=function(user){

return Database.save(

CONST.SHEETS.USERS,

"ID",

user

);

};

UserRepository.update=function(user){

return Database.update(

CONST.SHEETS.USERS,

"ID",

user.ID,

user

);

};

UserRepository.remove=function(id){

return Database.remove(

CONST.SHEETS.USERS,

"ID",

id

);

};

UserRepository.search=function(keyword){

return Query

.table(CONST.SHEETS.USERS)

.whereLike("Nama",keyword)

.orderBy("Nama")

.get();

};

UserRepository.roles=function(){

return Query

.table(CONST.SHEETS.USERS)

.select([

"ID",

"Nama",

"Role",

"Status"

])

.orderBy("Nama")

.get();

};

/**
 * Health Check UserRepository.
 *
 * @returns {Object}
 */
UserRepository.health = function () {
  return {
    success: true,
    table: CONST.SHEETS.USERS,
    total: UserRepository.count(),
    status: CONST.STATUS.READY
  };
};