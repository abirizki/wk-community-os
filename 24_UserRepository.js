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
.table(APP.SHEETS.USERS)
.orderBy("Nama")
.get();

};

UserRepository.count=function(){

return Query
.table(APP.SHEETS.USERS)
.count();

};

UserRepository.find=function(id){

return Query
.table(APP.SHEETS.USERS)
.where("ID",id)
.first();

};

UserRepository.findByUsername=function(username){

return Query
.table(APP.SHEETS.USERS)
.where("Username",username)
.first();

};

UserRepository.findByRole=function(role){

return Query
.table(APP.SHEETS.USERS)
.where("Role",role)
.orderBy("Nama")
.get();

};

UserRepository.findActive=function(){

return Query
.table(APP.SHEETS.USERS)
.where("Status","ACTIVE")
.orderBy("Nama")
.get();

};

UserRepository.exists=function(username){

return Query
.table(APP.SHEETS.USERS)
.where("Username",username)
.exists();

};

UserRepository.save=function(user){

return Database.save(

APP.SHEETS.USERS,

"ID",

user

);

};

UserRepository.update=function(user){

return Database.update(

APP.SHEETS.USERS,

"ID",

user.ID,

user

);

};

UserRepository.remove=function(id){

return Database.remove(

APP.SHEETS.USERS,

"ID",

id

);

};

UserRepository.changePassword=function(id,password){

return Database.update(

APP.SHEETS.USERS,

"ID",

id,

{

Password:password,

Updated_At:Helper.now(),

Updated_By:Helper.username()

}

);

};

UserRepository.activate=function(id){

return Database.update(

APP.SHEETS.USERS,

"ID",

id,

{

Status:"ACTIVE",

Updated_At:Helper.now(),

Updated_By:Helper.username()

}

);

};

UserRepository.deactivate=function(id){

return Database.update(

APP.SHEETS.USERS,

"ID",

id,

{

Status:"INACTIVE",

Updated_At:Helper.now(),

Updated_By:Helper.username()

}

);

};

UserRepository.resetPassword=function(id,password){

return UserRepository.changePassword(

id,

password

);

};

UserRepository.search=function(keyword){

return Query

.table(APP.SHEETS.USERS)

.whereLike("Nama",keyword)

.orderBy("Nama")

.get();

};

UserRepository.roles=function(){

return Query

.table(APP.SHEETS.USERS)

.select([

"ID",

"Nama",

"Role",

"Status"

])

.orderBy("Nama")

.get();

};