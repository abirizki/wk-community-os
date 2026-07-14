/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 05_Validator.gs
 * Version : 2.0.0
 * Phase   : MVP Kebonjati
 * Part    : 1 of 2
 * =============================================================================
 */

var Validator={};

Validator.required=function(value){

return !Utils.isEmpty(value);

};

Validator.nik=function(value){

value=Utils.formatNIK(value);

return CONST.REGEX.NIK.test(value);

};

Validator.kk=function(value){

value=Utils.formatKK(value);

return CONST.REGEX.KK.test(value);

};

Validator.nop=function(value){

value=Utils.formatNOP(value);

return CONST.REGEX.NOP.test(value);

};

Validator.phone=function(value){

if(Utils.isEmpty(value)){

return true;

}

return CONST.REGEX.PHONE.test(value);

};

Validator.date=function(value){

if(Utils.isEmpty(value)){

return false;

}

return !isNaN(new Date(value).getTime());

};

Validator.gender=function(value){

return MasterData.jenisKelamin()

.indexOf(value)>-1;

};

Validator.agama=function(value){

return MasterData.agama()

.indexOf(value)>-1;

};

Validator.pendidikan=function(value){

return MasterData.pendidikan()

.indexOf(value)>-1;

};

Validator.pekerjaan=function(value){

return MasterData.pekerjaan()

.indexOf(value)>-1;

};

Validator.statusPerkawinan=function(value){

return MasterData.statusPerkawinan()

.indexOf(value)>-1;

};

Validator.statusKeluarga=function(value){

return MasterData.statusKeluarga()

.indexOf(value)>-1;

};

Validator.role=function(value){

return MasterData.roles()

.indexOf(value)>-1;

};

Validator.file=function(filename){

return Utils.isAllowedFile(filename);

};

Validator.uploadSize=function(size){

return size<=CONFIG.MAX_UPLOAD_SIZE;

};

Validator.user=function(data){

if(!Validator.required(data.username)) return false;
if(!Validator.required(data.nama)) return false;
if(!Validator.role(data.role)) return false;

return true;

};

Validator.kkData=function(data){

if(!Validator.kk(data.No_KK)) return false;
if(!Validator.required(data.Nama_Kepala_Keluarga)) return false;
if(!Validator.required(data.RT)) return false;
if(!Validator.required(data.RW)) return false;

return true;

};

Validator.warga=function(data){

if(!Validator.nik(data.NIK)) return false;
if(!Validator.kk(data.No_KK)) return false;
if(!Validator.required(data.Nama)) return false;
if(!Validator.gender(data.Jenis_Kelamin)) return false;
if(!Validator.date(data.Tanggal_Lahir)) return false;
if(!Validator.agama(data.Agama)) return false;
if(!Validator.pendidikan(data.Tingkat_Pendidikan)) return false;
if(!Validator.pekerjaan(data.Pekerjaan)) return false;
if(!Validator.statusPerkawinan(data.Status_Perkawinan)) return false;
if(!Validator.statusKeluarga(data.Status_Dalam_Keluarga)) return false;
if(!Validator.phone(data.No_HP)) return false;

return true;

};

Validator.pbb=function(data){

if(!Validator.nop(data.NOP)) return false;
if(!Validator.kk(data.No_KK)) return false;
if(!Validator.required(data.Nama_Wajib_Pajak)) return false;

return true;

};

Validator.layanan=function(data){

if(!Validator.required(data.Kode)) return false;
if(!Validator.required(data.Nama)) return false;

return true;

};

Validator.pengajuan=function(data){

if(!Validator.required(data.Jenis_Layanan)) return false;
if(!Validator.nik(data.NIK_Pemohon)) return false;
if(!Validator.kk(data.No_KK)) return false;

return true;

};

Validator.dokumen=function(data){

if(!Validator.required(data.Nama_File)) return false;
if(!Validator.file(data.Nama_File)) return false;

return true;

};

Validator.validate=function(type,data){

switch(type){

case "USER":
return Validator.user(data);

case "KK":
return Validator.kkData(data);

case "WARGA":
return Validator.warga(data);

case "PBB":
return Validator.pbb(data);

case "LAYANAN":
return Validator.layanan(data);

case "PENGAJUAN":
return Validator.pengajuan(data);

case "DOKUMEN":
return Validator.dokumen(data);

default:
return false;

}

};

Validator.message=function(type){

var msg={

USER:"Data pengguna tidak valid.",

KK:"Data Kartu Keluarga tidak valid.",

WARGA:"Data warga tidak valid.",

PBB:"Data SPPT PBB/NOP tidak valid.",

LAYANAN:"Data layanan tidak valid.",

PENGAJUAN:"Data pengajuan tidak valid.",

DOKUMEN:"Dokumen tidak valid."

};

return msg[type]||"Validasi gagal.";

};