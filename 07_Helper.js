/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 06_Helper.gs
 * Version : 2.0.0
 * Phase   : MVP Kebonjati
 * Part    : 1 of 3
 * =============================================================================
 */

var Helper={};

Helper.uuid=function(){

return Utils.uuid();

};

Helper.now=function(){

return Utils.timestamp();

};

Helper.today=function(){

return Utils.today();

};

Helper.user=function(){

try{

return SessionRepository.current();

}catch(e){

return null;

}

};

Helper.userId=function(){

var u=Helper.user();

return u?u.id:"";

};

Helper.username=function(){

var u=Helper.user();

return u?u.username:"SYSTEM";

};

Helper.role=function(){

var u=Helper.user();

return u?u.role:"SYSTEM";

};

Helper.createId=function(prefix){

return prefix+

"-"+

Utilities.getUuid()

.substring(0,8)

.toUpperCase();

};

Helper.createPengajuanId=function(){

return Helper.createId(

APP.PREFIX.PENGAJUAN

);

};

Helper.createSuratId=function(){

return Helper.createId(

APP.PREFIX.SURAT

);

};

Helper.audit=function(

aksi,

modul,

keterangan

){

return{

id:Helper.createId(

APP.PREFIX.AUDIT

),

tanggal:Helper.now(),

user:Helper.username(),

role:Helper.role(),

aksi:aksi,

modul:modul,

keterangan:keterangan

};

};

Helper.statusHistory=function(

status,

catatan

){

return{

tanggal:Helper.now(),

status:status,

oleh:Helper.username(),

role:Helper.role(),

catatan:catatan||""

};

};

Helper.success=function(data){

return Response.success(data);

};

Helper.error=function(message){

return Response.error(message);

};

Helper.notFound=function(){

return Response.notFound();

};

Helper.unauthorized=function(){

return Response.unauthorized();

};

Helper.nextPengajuanNumber=function(){

var last=Database.lastNumber(
APP.SHEETS.PENGAJUAN,
"Nomor_Pengajuan",
APP.PREFIX.PENGAJUAN
);

return Utils.generatePengajuanNumber(last);

};

Helper.nextSuratNumber=function(){

var last=Database.lastNumber(
APP.SHEETS.SURAT,
"Nomor_Surat",
APP.PREFIX.SURAT
);

return Utils.generateSuratNumber(last);

};

Helper.qrUrl=function(id){

return Utils.qrVerifyUrl(id);

};

Helper.qrData=function(pengajuan){

return{

id:pengajuan.ID,

nomor:pengajuan.Nomor_Pengajuan,

layanan:pengajuan.Jenis_Layanan,

nik:pengajuan.NIK_Pemohon,

url:Helper.qrUrl(pengajuan.ID)

};

};

Helper.uploadInfo=function(file){

return{

id:Helper.uuid(),

nama:file&&file.name?file.name:"",

ekstensi:file&&file.name?
Utils.fileExtension(file.name):"",

ukuran:file&&file.size?file.size:0,

valid:file?
Utils.isAllowedFile(file.name):false,

tanggal:Helper.now(),

oleh:Helper.username()

};

};

Helper.templateData=function(pengajuan,warga){

return{

NOMOR_PENGAJUAN:pengajuan.Nomor_Pengajuan,

NOMOR_SURAT:pengajuan.Nomor_Surat||"",

NAMA:warga.Nama,

NIK:warga.NIK,

NO_KK:warga.No_KK,

ALAMAT:warga.Alamat,

RT:warga.RT,

RW:warga.RW,

JENIS_LAYANAN:pengajuan.Jenis_Layanan,

TUJUAN:pengajuan.Tujuan||"",

TANGGAL:Helper.today(),

QRCODE:Helper.qrUrl(pengajuan.ID)

};

};

Helper.dashboardSummary=function(data){

return{

kk:data.kk||0,

warga:data.warga||0,

nop:data.nop||0,

layanan:data.layanan||0,

pengajuan:data.pengajuan||0,

selesai:data.selesai||0,

menunggu:data.menunggu||0

};

};

Helper.isRT=function(){

return Helper.role()===APP.ROLES.RT;

};

Helper.isRW=function(){

return Helper.role()===APP.ROLES.RW;

};

Helper.isKelurahan=function(){

return Helper.role()===APP.ROLES.KELURAHAN;

};

Helper.isAdmin=function(){

return Helper.role()===APP.ROLES.ADMIN;

};

Helper.isWarga=function(){

return Helper.role()===APP.ROLES.WARGA;

};

Helper.generatePdf=function(template,data){

return{
success:true,
type:"PDF",
template:template,
data:data,
tanggal:Helper.now(),
oleh:Helper.username()
};

};

Helper.generateDocx=function(template,data){

return{
success:true,
type:"DOCX",
template:template,
data:data,
tanggal:Helper.now(),
oleh:Helper.username()
};

};

Helper.exportExcel=function(sheetName){

return{
success:true,
sheet:sheetName,
tanggal:Helper.now(),
oleh:Helper.username()
};

};

Helper.importExcel=function(sheetName,fileName){

return{
success:true,
sheet:sheetName,
file:fileName,
tanggal:Helper.now(),
oleh:Helper.username()
};

};

Helper.lockPengajuan=function(pengajuan){

pengajuan.Locked=true;
pengajuan.Locked_At=Helper.now();
pengajuan.Locked_By=Helper.username();

return pengajuan;

};

Helper.unlockPengajuan=function(pengajuan){

pengajuan.Locked=false;
pengajuan.Locked_At="";
pengajuan.Locked_By="";

return pengajuan;

};

Helper.verifyRT=function(pengajuan){

pengajuan.Status=APP.PENGAJUAN_STATUS.DISETUJUI_RT;
pengajuan.Verifikasi_RT=Helper.now();
pengajuan.RT_By=Helper.username();

return pengajuan;

};

Helper.verifyRW=function(pengajuan){

pengajuan.Status=APP.PENGAJUAN_STATUS.DISETUJUI_RW;
pengajuan.Verifikasi_RW=Helper.now();
pengajuan.RW_By=Helper.username();

return pengajuan;

};

Helper.verifyKelurahan=function(pengajuan){

pengajuan.Status=APP.PENGAJUAN_STATUS.SELESAI;
pengajuan.Verifikasi_Kelurahan=Helper.now();
pengajuan.Kelurahan_By=Helper.username();

return pengajuan;

};

Helper.needRevision=function(pengajuan,role,catatan){

if(role===APP.ROLES.RT){

pengajuan.Status=APP.PENGAJUAN_STATUS.PERBAIKAN_RT;

}else if(role===APP.ROLES.RW){

pengajuan.Status=APP.PENGAJUAN_STATUS.PERBAIKAN_RW;

}

pengajuan.Catatan=catatan||"";

Helper.unlockPengajuan(pengajuan);

return pengajuan;

};

Helper.notification=function(user,title,message){

return{

user:user,

title:title,

message:message,

tanggal:Helper.now()

};

};

Helper.timeline=function(status,catatan){

return{

tanggal:Helper.now(),

status:status,

oleh:Helper.username(),

role:Helper.role(),

catatan:catatan||""

};

};

Helper.createdInfo=function(){

return{

created_at:Helper.now(),

created_by:Helper.username()

};

};

Helper.updatedInfo=function(){

return{

updated_at:Helper.now(),

updated_by:Helper.username()

};

};