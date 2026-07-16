/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 11_Session.gs
 * Version : 2.1.0
 * Phase   : Core Framework
 * Part    : 1 of 3
 * =============================================================================
 */

var Session={};

Session.key=function(){

return CONFIG.APP_NAME+"_SESSION";

};

Session.token=function(){

return Cache.get(

Session.key()

);

};

Session.setToken=function(token){

Cache.put(

Session.key(),

token,

CONFIG.SESSION_TIMEOUT

);

return token;

};

Session.clearToken=function(){

Cache.remove(

Session.key()

);

return true;

};

Session.login=function(session){

Session.setToken(

session.Token

);

Cache.put(

CONST.CACHE.SESSION+session.Token,

session,

CONFIG.SESSION_TIMEOUT

);

return session;

};

Session.logout=function(){

var token=Session.token();

if(token){

Cache.invalidateSession(

token

);

}

Session.clearToken();

return true;

};

Session.current=function(){

var token=Session.token();

if(!token){

return null;

}

return Cache.session(

token,

function(){

return AuthRepository.findSession(

token

);

}

);

};

Session.isLoggedIn=function(){

return Session.current()!==null;

};

Session.userId=function(){

var s=Session.current();

return s?s.User_ID:"";

};

Session.username=function(){

var s=Session.current();

return s?s.Username:"";

};

Session.currentUser=function(){

var session=Session.current();

if(!session){

return null;

}

return Cache.remember(

CONST.CACHE.USER+"_"+session.User_ID,

300,

function(){

return AuthRepository.findById(

session.User_ID

);

}

);

};

Session.role=function(){

var user=Session.currentUser();

return user?user.Role:"";

};

Session.nik=function(){

var user=Session.currentUser();

return user?user.NIK:"";

};

Session.kk=function(){

var user=Session.currentUser();

return user?user.No_KK:"";

};

Session.rt=function(){

var user=Session.currentUser();

return user?user.RT:"";

};

Session.rw=function(){

var user=Session.currentUser();

return user?user.RW:"";

};

Session.name=function(){

var user=Session.currentUser();

return user?user.Nama:"";

};

Session.refresh=function(){

var token=Session.token();

if(!token){

return null;

}

Cache.invalidateSession(

token

);

return Session.current();

};

Session.touch=function(){

var session=Session.current();

if(!session){

return false;

}

Cache.put(

CONST.CACHE.SESSION+session.Token,

session,

CONFIG.SESSION_TIMEOUT

);

return true;

};

Session.expire=function(){

Session.logout();

return true;

};

/* ===========================
   ROLE HELPERS
=========================== */

Session.hasRole=function(role){

return Session.role()===role;

};

Session.isAdmin=function(){

return Session.hasRole(

CONST.ROLE.ADMIN

);

};

Session.isKelurahan=function(){

return Session.hasRole(

CONST.ROLE.KELURAHAN

);

};

Session.isRW=function(){

return Session.hasRole(

CONST.ROLE.RW

);

};

Session.isRT=function(){

return Session.hasRole(

CONST.ROLE.RT

);

};

Session.isWarga=function(){

return Session.hasRole(

CONST.ROLE.WARGA

);

};

/* ===========================
   PROFILE
=========================== */

Session.profile=function(){

var user=Session.currentUser();

if(!user){

return null;

}

return{

id:user.ID,

username:user.Username,

nama:user.Nama,

role:user.Role,

nik:user.NIK,

kk:user.No_KK,

rt:user.RT,

rw:user.RW,

status:user.Status

};

};

/* ===========================
   SESSION INFO
=========================== */

Session.info=function(){

var s=Session.current();

return{

logged_in:s!==null,

token:Session.token(),

username:Session.username(),

role:Session.role(),

timestamp:Utils.timestamp()

};

};

Session.health=function(){

return{

success:true,

logged_in:Session.isLoggedIn(),

user:Session.username(),

role:Session.role(),

status:"READY",

timestamp:Utils.timestamp()

};

};