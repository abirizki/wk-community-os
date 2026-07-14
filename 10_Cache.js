/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 10_Cache.gs
 * Version : 2.1.0
 * Phase   : Core Framework
 * Part    : 1 of 3
 * =============================================================================
 */

var Cache={};

Cache.service=function(){

return CacheService.getScriptCache();

};

Cache.prefix=function(key){

return APP.NAME+"_"+key;

};

Cache.get=function(key){

var value=Cache.service().get(

Cache.prefix(key)

);

if(!value){

return null;

}

try{

return JSON.parse(value);

}catch(e){

return value;

}

};

Cache.put=function(

key,

value,

seconds

){

seconds=seconds||600;

if(typeof value==="object"){

value=JSON.stringify(value);

}

Cache.service().put(

Cache.prefix(key),

value,

seconds

);

return true;

};

Cache.remove=function(key){

Cache.service().remove(

Cache.prefix(key)

);

return true;

};

Cache.clear=function(){

CacheService

.getScriptCache()

.removeAll([

]);

return true;

};

Cache.has=function(key){

return Cache.get(key)!==null;

};

Cache.remember=function(

key,

seconds,

callback

){

var data=Cache.get(key);

if(data!==null){

return data;

}

data=callback();

Cache.put(

key,

data,

seconds

);

return data;

};

Cache.forever=function(

key,

value

){

return Cache.put(

key,

value,

21600

);

};

Cache.master=function(key,callback){

return Cache.remember(

"MASTER_"+key,

3600,

callback

);

};

Cache.users=function(){

return Cache.remember(

"USERS",

600,

function(){

return Database.data(

APP.SHEETS.USERS

);

}

);

};

Cache.kk=function(){

return Cache.remember(

"KK",

600,

function(){

return Database.data(

APP.SHEETS.KK

);

}

);

};

Cache.warga=function(){

return Cache.remember(

"WARGA",

600,

function(){

return Database.data(

APP.SHEETS.WARGA

);

}

);

};

Cache.pbb=function(){

return Cache.remember(

"PBB",

600,

function(){

return Database.data(

APP.SHEETS.PBB

);

}

);

};

Cache.layanan=function(){

return Cache.remember(

"LAYANAN",

3600,

function(){

return Database.data(

APP.SHEETS.LAYANAN

);

}

);

};

Cache.persyaratan=function(){

return Cache.remember(

"PERSYARATAN",

3600,

function(){

return Database.data(

APP.SHEETS.PERSYARATAN

);

}

);

};

Cache.dashboard=function(key,callback){

return Cache.remember(

"DASHBOARD_"+key,

300,

callback

);

};

Cache.session=function(token,callback){

return Cache.remember(

"SESSION_"+token,

1800,

callback

);

};

Cache.notification=function(userId,callback){

return Cache.remember(

"NOTIF_"+userId,

300,

callback

);

};

Cache.invalidateUser=function(){

Cache.remove("USERS");

return true;

};

Cache.invalidateKK=function(){

Cache.remove("KK");

return true;

};

Cache.invalidateWarga=function(){

Cache.remove("WARGA");

return true;

};

Cache.invalidatePBB=function(){

Cache.remove("PBB");

return true;

};

Cache.invalidateLayanan=function(){

Cache.remove("LAYANAN");

Cache.remove("PERSYARATAN");

return true;

};

Cache.invalidateDashboard=function(key){

if(key){

Cache.remove(

"DASHBOARD_"+key

);

}else{

Cache.remove("DASHBOARD_ADMIN");
Cache.remove("DASHBOARD_RW");
Cache.remove("DASHBOARD_RT");
Cache.remove("DASHBOARD_KELURAHAN");
Cache.remove("DASHBOARD_WARGA");

}

return true;

};

Cache.invalidateSession=function(token){

if(token){

Cache.remove(

"SESSION_"+token

);

}

return true;

};

Cache.invalidateNotification=function(userId){

if(userId){

Cache.remove(

"NOTIF_"+userId

);

}

return true;

};

Cache.flush=function(){

Cache.invalidateUser();

Cache.invalidateKK();

Cache.invalidateWarga();

Cache.invalidatePBB();

Cache.invalidateLayanan();

Cache.invalidateDashboard();

return true;

};

Cache.stats=function(){

return{

users:Cache.has("USERS"),

kk:Cache.has("KK"),

warga:Cache.has("WARGA"),

pbb:Cache.has("PBB"),

layanan:Cache.has("LAYANAN"),

persyaratan:Cache.has("PERSYARATAN")

};

};

Cache.health=function(){

return{

success:true,

cache:"ScriptCache",

timestamp:Helper.now(),

status:"READY"

};

};