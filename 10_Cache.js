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

return CONST.CACHE.PREFIX+key;

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

CONST.CACHE.USERS,

600,

function(){

return Database.data(

CONST.SHEETS.USERS

);

}

);

};

Cache.kk=function(){

return Cache.remember(

CONST.CACHE.KK,

600,

function(){

return Database.data(

CONST.SHEETS.KK

);

}

);

};

Cache.warga=function(){

return Cache.remember(

CONST.CACHE.WARGA,

600,

function(){

return Database.data(

CONST.SHEETS.WARGA

);

}

);

};

Cache.pbb=function(){

return Cache.remember(

CONST.CACHE.PBB,

600,

function(){

return Database.data(

CONST.SHEETS.PBB

);

}

);

};

Cache.layanan=function(){

return Cache.remember(

CONST.CACHE.LAYANAN,

3600,

function(){

return Database.data(

CONST.SHEETS.LAYANAN

);

}

);

};

Cache.persyaratan=function(){

return Cache.remember(

CONST.CACHE.PERSYARATAN,

3600,

function(){

return Database.data(

CONST.SHEETS.PERSYARATAN

);

}

);

};

Cache.dashboard=function(key,callback){

return Cache.remember(

CONST.CACHE.DASHBOARD+key,

300,

callback

);

};

Cache.session=function(token,callback){

return Cache.remember(

CONST.CACHE.SESSION+token,

1800,

callback

);

};

Cache.notification=function(userId,callback){

return Cache.remember(

CONST.CACHE.NOTIFICATION+userId,

300,

callback

);

};

Cache.invalidateUser=function(){

Cache.remove(CONST.CACHE.USERS);

return true;

};

Cache.invalidateKK=function(){

Cache.remove(CONST.CACHE.KK);

return true;

};

Cache.invalidateWarga=function(){

Cache.remove(CONST.CACHE.WARGA);

return true;

};

Cache.invalidatePBB=function(){

Cache.remove(CONST.CACHE.PBB);

return true;

};

Cache.invalidateLayanan=function(){

Cache.remove(CONST.CACHE.LAYANAN);

Cache.remove(CONST.CACHE.PERSYARATAN);

return true;

};

Cache.invalidateDashboard=function(key){

if(key){

Cache.remove(

CONST.CACHE.DASHBOARD+key

);

}else{

Cache.remove(CONST.CACHE.DASHBOARD+"ADMIN");
Cache.remove(CONST.CACHE.DASHBOARD+"RW");
Cache.remove(CONST.CACHE.DASHBOARD+"RT");
Cache.remove(CONST.CACHE.DASHBOARD+"KELURAHAN");
Cache.remove(CONST.CACHE.DASHBOARD+"WARGA");

}

return true;

};

Cache.invalidateSession=function(token){

if(token){

Cache.remove(

CONST.CACHE.SESSION+token

);

}

return true;

};

Cache.invalidateNotification=function(userId){

if(userId){

Cache.remove(

CONST.CACHE.NOTIFICATION+userId

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

users:Cache.has(CONST.CACHE.USERS),

kk:Cache.has(CONST.CACHE.KK),

warga:Cache.has(CONST.CACHE.WARGA),

pbb:Cache.has(CONST.CACHE.PBB),

layanan:Cache.has(CONST.CACHE.LAYANAN),

persyaratan:Cache.has(CONST.CACHE.PERSYARATAN)

};

};

Cache.health=function(){

return{

success:true,

cache:"ScriptCache",

timestamp:Utils.timestamp(),

status:"READY"

};

};