/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 04_Utils.gs
 * Version : 2.0.0
 * Phase   : MVP Kebonjati
 * =============================================================================
 */

var Utils={};

Utils.uuid=function(){
return Utilities.getUuid();
};

Utils.date=function(value,format){
if(!value)return "";
return Utilities.formatDate(
new Date(value),
CONFIG.TIMEZONE,
format||CONFIG.DATE_FORMAT
);
};

Utils.trim=function(value){
if(value===null||value===undefined)return "";
return String(value).trim();
};

Utils.upper=function(value){
return Utils.trim(value).toUpperCase();
};

Utils.lower=function(value){
return Utils.trim(value).toLowerCase();
};

Utils.title=function(value){
value=Utils.lower(value);
return value.replace(/\b\w/g,function(c){
return c.toUpperCase();
});
};

Utils.sanitize=function(value){
if(value===null||value===undefined)return "";
return String(value)
.replace(/<[^>]*>/g,"")
.replace(/[']/g,"")
.trim();
};

Utils.isEmpty=function(value){
return value===null||
value===undefined||
String(value).trim()==="";
};

Utils.isNumber=function(value){
return !isNaN(value);
};

Utils.isArray=function(value){
return Array.isArray(value);
};

Utils.isObject=function(value){
return Object.prototype.toString.call(value)==="[object Object]";
};

Utils.clone=function(obj){
return JSON.parse(JSON.stringify(obj));
};

Utils.random=function(length){
length=length||8;
var chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var result="";
for(var i=0;i<length;i++){
result+=chars.charAt(Math.floor(Math.random()*chars.length));
}
return result;
};

Utils.leftPad=function(value,length,char){
value=String(value);
char=char||"0";
while(value.length<length){
value=char+value;
}
return value;
};

Utils.bool=function(value){
return value===true||
value==="true"||
value===1||
value==="1";
};

Utils.generateNumber=function(prefix,lastNumber){
var d=new Date();
var year=d.getFullYear();
var month=Utils.leftPad(d.getMonth()+1,2);
var number=Utils.leftPad((lastNumber||0)+1,6);
return prefix+"-"+year+"-"+month+"-"+number;
};

Utils.generatePengajuanNumber=function(lastNumber){
return Utils.generateNumber(CONST.PREFIX.PENGAJUAN,lastNumber);
};

Utils.generateSuratNumber=function(lastNumber){
return Utils.generateNumber(CONST.PREFIX.SURAT,lastNumber);
};

Utils.generateUsername=function(nik){
nik=Utils.trim(nik);
if(nik.length>=6){
return "W"+nik.substring(nik.length-6);
}
return "W"+Utils.random(6);
};

Utils.calculateAge=function(tanggalLahir){
if(!tanggalLahir)return 0;
var birth=new Date(tanggalLahir);
var today=new Date();
var age=today.getFullYear()-birth.getFullYear();
var m=today.getMonth()-birth.getMonth();
if(m<0||(m===0&&today.getDate()<birth.getDate())){
age--;
}
return age;
};

Utils.base64Encode=function(text){
return Utilities.base64Encode(String(text||""));
};

Utils.base64Decode=function(text){
return Utilities.newBlob(
Utilities.base64Decode(text)
).getDataAsString();
};

Utils.sha256=function(text){
var bytes=Utilities.computeDigest(
Utilities.DigestAlgorithm.SHA_256,
String(text)
);
return bytes.map(function(b){
var v=(b<0?b+256:b).toString(16);
return ("0"+v).slice(-2);
}).join("");
};

Utils.formatNIK=function(nik){
return Utils.trim(nik).replace(/\D/g,"");
};

Utils.formatKK=function(kk){
return Utils.trim(kk).replace(/\D/g,"");
};

Utils.formatNOP=function(nop){
return Utils.trim(nop);
};

Utils.fileExtension=function(filename){
filename=String(filename||"");
var i=filename.lastIndexOf(".");
return i>-1?filename.substring(i+1).toLowerCase():"";
};

Utils.isAllowedFile=function(filename){
return CONFIG.ALLOWED_FILE_TYPES.indexOf(
Utils.fileExtension(filename)
)>-1;
};

Utils.qrVerifyUrl = function (id) {

  if (!CONFIG.QR_VERIFY_URL) {
    return id;
  }

  return CONFIG.QR_VERIFY_URL + id;

};

Utils.sleep = function(ms){

  Utilities.sleep(ms || 100);

};

Utils.log = function(message){

  if(CONFIG.DEBUG){

    Logger.log(message);

  }

};

Utils.success = function(){

  return true;

};

/* Bootstrap dipindahkan ke Framework */
