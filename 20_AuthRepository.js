/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 21_AuthRepository.gs
 * Version : 2.0.0
 * Phase   : Repository
 * Part    : 1 of 2
 * =============================================================================
 */

var AuthRepository={};

AuthRepository.findUser=function(username){

return Query

.table(APP.SHEETS.USERS)

.where("Username",username)

.where("Status","ACTIVE")

.first();

};

AuthRepository.findById=function(id){

return Query

.table(APP.SHEETS.USERS)

.where("ID",id)

.first();

};

AuthRepository.findSession=function(token){

return Query

.table(APP.SHEETS.SESSIONS)

.where("Token",token)

.first();

};

AuthRepository.saveSession=function(session){

return Database.save(

APP.SHEETS.SESSIONS,

"Token",

session

);

};

AuthRepository.removeSession=function(token){

return Database.remove(

APP.SHEETS.SESSIONS,

"Token",

token

);

};

AuthRepository.existsSession=function(token){

return Query

.table(APP.SHEETS.SESSIONS)

.where("Token",token)

.exists();

};

AuthRepository.userSessions=function(userId){

return Query

.table(APP.SHEETS.SESSIONS)

.where("User_ID",userId)

.orderBy("Login_At","DESC")

.get();

};

AuthRepository.currentSession=function(){

var token=Session.token();

if(!token){

return null;

}

return AuthRepository.findSession(token);

};

