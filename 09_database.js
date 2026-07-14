/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 09_Database.gs
 * Version : 2.1.0
 * Phase   : Core Framework
 * Part    : 1 of 6
 * =============================================================================
 */

var Database={};

Database.spreadsheet=function(){

if(APP.SPREADSHEET_ID){

return SpreadsheetApp.openById(APP.SPREADSHEET_ID);

}

return SpreadsheetApp.getActiveSpreadsheet();

};

Database.sheet=function(name){

var ss=Database.spreadsheet();

var sh=ss.getSheetByName(name);

if(!sh){

sh=ss.insertSheet(name);

}

return sh;

};

Database.exists=function(name){

return Database.spreadsheet()

.getSheetByName(name)!==null;

};

Database.create=function(name,headers){

var sh=Database.sheet(name);

if(sh.getLastRow()===0){

sh.appendRow(headers||[]);

}

return sh;

};

Database.headers=function(name){

var sh=Database.sheet(name);

if(sh.getLastRow()===0){

return [];

}

return sh.getRange(

1,

1,

1,

sh.getLastColumn()

).getValues()[0];

};

Database.data=function(name){

var sh=Database.sheet(name);

if(sh.getLastRow()<=1){

return [];

}

var headers=Database.headers(name);

var values=sh.getRange(

2,

1,

sh.getLastRow()-1,

sh.getLastColumn()

).getValues();

var rows=[];

for(var i=0;i<values.length;i++){

var obj={};

for(var j=0;j<headers.length;j++){

obj[headers[j]]=values[i][j];

}

rows.push(obj);

}

return rows;

};

Database.rowIndex=function(name,key,value){

var rows=Database.data(name);

for(var i=0;i<rows.length;i++){

if(rows[i][key]==value){

return i+2;

}

}

return -1;

};

Database.insert=function(name,data){

var sh=Database.sheet(name);

var headers=Database.headers(name);

var row=[];

for(var i=0;i<headers.length;i++){

row.push(

data[headers[i]]!==undefined

?data[headers[i]]

:""

);

}

sh.appendRow(row);

return true;

};

Database.insertMany=function(name,list){

if(!list||!list.length){

return true;

}

for(var i=0;i<list.length;i++){

Database.insert(

name,

list[i]

);

}

return true;

};

Database.find=function(name,key,value){

var rows=Database.data(name);

for(var i=0;i<rows.length;i++){

if(rows[i][key]==value){

return rows[i];

}

}

return null;

};

Database.existsBy=function(name,key,value){

return Database.find(

name,

key,

value

)!==null;

};

Database.update=function(name,key,value,data){

var sh=Database.sheet(name);

var headers=Database.headers(name);

var rowIndex=Database.rowIndex(

name,

key,

value

);

if(rowIndex==-1){

return false;

}

for(var i=0;i<headers.length;i++){

var field=headers[i];

if(data[field]!==undefined){

sh.getRange(

rowIndex,

i+1

).setValue(

data[field]

);

}

}

return true;

};

Database.save=function(name,key,data){

if(Database.existsBy(

name,

key,

data[key]

)){

return Database.update(

name,

key,

data[key],

data

);

}

return Database.insert(

name,

data

);

};

Database.upsert=function(name,key,data){

return Database.save(

name,

key,

data

);

};

Database.remove=function(name,key,value){

var sh=Database.sheet(name);

var rowIndex=Database.rowIndex(

name,

key,

value

);

if(rowIndex==-1){

return false;

}

sh.deleteRow(rowIndex);

return true;

};

Database["delete"]=function(name,key,value){

return Database.remove(

name,

key,

value

);

};

Database.truncate=function(name){

var sh=Database.sheet(name);

if(sh.getLastRow()>1){

sh.deleteRows(

2,

sh.getLastRow()-1

);

}

return true;

};

Database.findBy=function(name,filters){

var rows=Database.data(name);

var result=[];

for(var i=0;i<rows.length;i++){

var match=true;

for(var k in filters){

if(rows[i][k]!=filters[k]){

match=false;

break;

}

}

if(match){

result.push(rows[i]);

}

}

return result;

};

Database.first=function(name){

var rows=Database.data(name);

return rows.length

?rows[0]

:null;

};

Database.last=function(name){

var rows=Database.data(name);

return rows.length

?rows[rows.length-1]

:null;

};

Database.count=function(name){

return Database.data(name).length;

};

Database.lastNumber=function(

name,

field,

prefix

){

var rows=Database.data(name);

var last=0;

for(var i=0;i<rows.length;i++){

var value=rows[i][field];

if(!value){

continue;

}

if(prefix&&

value.indexOf(prefix)!==0){

continue;

}

var num=parseInt(

String(value)

.split("-")

.pop(),

10

);

if(!isNaN(num)&&

num>last){

last=num;

}

}

return last;

};

Database.clearCache=function(){

if(typeof Cache!=="undefined"&&

Cache.clear){

Cache.clear();

}

return true;

};

Database.allSheets=function(){

return Object.keys(APP.SHEETS).map(function(k){

return APP.SHEETS[k];

});

};

Database.createAllTables=function(){

/* ===========================
   USERS
=========================== */

Database.create(

APP.SHEETS.USERS,

[

"ID",

"Username",

"Password",

"Nama",

"Role",

"NIK",

"No_KK",

"RT",

"RW",

"Status",

"Last_Login",

"Failed_Login",

"Created_At",

"Created_By",

"Updated_At",

"Updated_By"

]

);

/* ===========================
   SESSIONS
=========================== */

Database.create(

APP.SHEETS.SESSIONS,

[

"ID",

"User_ID",

"Username",

"Token",

"Login_At",

"Expired_At",

"IPAddress",

"UserAgent",

"Status"

]

);

/* ===========================
   KK
=========================== */

Database.create(

APP.SHEETS.KK,

[

"ID",

"No_KK",

"Nama_Kepala_Keluarga",

"NOP_Utama",

"Alamat",

"RT",

"RW",

"Status_KK",

"Keterangan",

"Created_At",

"Created_By",

"Updated_At",

"Updated_By"

]

);

/* ===========================
   WARGA
=========================== */

Database.create(

APP.SHEETS.WARGA,

[

"ID",

"NIK",

"No_KK",

"Nama",

"Jenis_Kelamin",

"Tempat_Lahir",

"Tanggal_Lahir",

"Agama",

"Status_Perkawinan",

"Tingkat_Pendidikan",

"Pekerjaan",

"Status_Dalam_Keluarga",

"RT",

"RW",

"No_HP",

"Email",

"Username",

"Photo",

"Status_Warga",

"Created_At",

"Created_By",

"Updated_At",

"Updated_By"

]

);

/* ===========================
   PBB
=========================== */

Database.create(

APP.SHEETS.PBB,

[

"ID",

"NOP",

"No_KK",

"Nama_Wajib_Pajak",

"Alamat_OP",

"RT",

"RW",

"Tahun_Pajak",

"Status_PBB",

"Catatan",

"Created_At",

"Created_By",

"Updated_At",

"Updated_By"

]

);

/* ===========================
   LAYANAN
=========================== */

Database.create(

APP.SHEETS.LAYANAN,

[

"ID",

"Kode",

"Nama",

"Icon",

"Deskripsi",

"Edukasi",

"Estimasi_Hari",

"Template_Surat",

"Perlu_QR",

"Perlu_Surat_Pengantar",

"Urutan",

"Aktif",

"Created_At",

"Created_By",

"Updated_At",

"Updated_By"

]

);

/* ===========================
   PERSYARATAN
=========================== */

Database.create(

APP.SHEETS.PERSYARATAN,

[

"ID",

"Kode_Layanan",

"Nama_Dokumen",

"Wajib",

"Urutan",

"Format_File",

"Maks_Ukuran_MB",

"Contoh_Dokumen",

"Keterangan",

"Created_At",

"Created_By",

"Updated_At",

"Updated_By"

]

);

/* ===========================
   PENGAJUAN
=========================== */

Database.create(

APP.SHEETS.PENGAJUAN,

[

"ID",

"Nomor_Pengajuan",

"Nomor_Surat",

"Jenis_Layanan",

"NIK_Pemohon",

"No_KK",

"Nama_Pemohon",

"RT",

"RW",

"Tujuan",

"Status",

"RT_Verified",

"RT_Verified_At",

"RT_Verified_By",

"RW_Verified",

"RW_Verified_At",

"RW_Verified_By",

"Kelurahan_Verified",

"Kelurahan_Verified_At",

"Kelurahan_Verified_By",

"Locked",

"Locked_At",

"Locked_By",

"Catatan",

"Created_At",

"Created_By",

"Updated_At",

"Updated_By"

]

);

/* ===========================
   DOKUMEN
=========================== */

Database.create(

APP.SHEETS.DOKUMEN,

[

"ID",

"Pengajuan_ID",

"Jenis_Dokumen",

"Nama_File",

"Drive_File_ID",

"Preview_URL",

"Mime_Type",

"Ukuran",

"Wajib",

"Uploaded_At",

"Uploaded_By"

]

);

/* ===========================
   SURAT
=========================== */

Database.create(

APP.SHEETS.SURAT,

[

"ID",

"Pengajuan_ID",

"Nomor_Surat",

"Template",

"QR_Code",

"PDF_File_ID",

"DOCX_File_ID",

"Download_Count",

"Last_Download",

"Downloaded_By",

"Generated_At",

"Generated_By"

]

);

/* ===========================
   AUDIT
=========================== */

Database.create(

APP.SHEETS.AUDIT,

[

"ID",

"Reference_ID",

"Tanggal",

"User",

"Role",

"Aksi",

"Modul",

"Keterangan"

]

);

/* ===========================
   NOTIFICATION
=========================== */

Database.create(

"notification",

[

"ID",

"User_ID",

"Title",

"Message",

"Is_Read",

"Created_At"

]

);

/* ===========================
   MASTER_TEMPLATE
=========================== */

Database.create(

"master_template",

[

"ID",

"Kode",

"Nama",

"Jenis",

"File_ID",

"Aktif"

]

);

/* ===========================
   SETTING
=========================== */

Database.create(

APP.SHEETS.SETTING,

[

"Key",

"Value",

"Keterangan",

"Updated_At",

"Updated_By"

]

);

return true;

};

Database.seedMasterData=function(){

var layanan=MasterData.layananDefault();

for(var i=0;i<layanan.length;i++){

if(!Database.existsBy(

APP.SHEETS.LAYANAN,

"Kode",

layanan[i].kode

)){

Database.insert(

APP.SHEETS.LAYANAN,

{

ID:Helper.uuid(),

Kode:layanan[i].kode,

Nama:layanan[i].nama,

Icon:"",

Deskripsi:"",

Edukasi:"",

Estimasi_Hari:layanan[i].estimasi,

Template_Surat:"",

Perlu_QR:true,

Perlu_Surat_Pengantar:true,

Urutan:i+1,

Aktif:layanan[i].aktif,

Created_At:Helper.now(),

Created_By:"SYSTEM",

Updated_At:"",

Updated_By:""

}

);

}

}

return true;

};

Database.initialize=function(){

Database.createAllTables();

Database.seedMasterData();

return true;

};

Database.install=function(){

return Database.initialize();

};

Database.version=function(){

return APP.VERSION;

};

Database.health=function(){

return{

success:true,

version:APP.VERSION,

spreadsheet:Database.spreadsheet().getName(),

tables:Database.allSheets(),

total_tables:Database.allSheets().length,

timestamp:Helper.now()

};

};

Database.info=function(){

return Database.health();

};