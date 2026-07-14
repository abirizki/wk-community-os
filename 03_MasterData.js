/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 03_MasterData.gs
 * Version : 2.0.0
 * Phase   : MVP Kebonjati
 * =============================================================================
 */

var MasterData={};

MasterData.pendidikan=function(){
return APP.PENDIDIKAN.slice();
};

MasterData.pekerjaan=function(){
return APP.PEKERJAAN.slice();
};

MasterData.agama=function(){
return APP.AGAMA.slice();
};

MasterData.statusPerkawinan=function(){
return APP.STATUS_PERKAWINAN.slice();
};

MasterData.statusKeluarga=function(){
return APP.STATUS_KELUARGA.slice();
};

MasterData.roles=function(){
return Object.keys(APP.ROLES).map(function(k){
return APP.ROLES[k];
});
};

MasterData.userStatus=function(){
return Object.keys(APP.USER_STATUS).map(function(k){
return APP.USER_STATUS[k];
});
};

MasterData.wargaStatus=function(){
return Object.keys(APP.WARGA_STATUS).map(function(k){
return APP.WARGA_STATUS[k];
});
};

MasterData.kkStatus=function(){
return Object.keys(APP.KK_STATUS).map(function(k){
return APP.KK_STATUS[k];
});
};

MasterData.pbbStatus=function(){
return Object.keys(APP.PBB_STATUS).map(function(k){
return APP.PBB_STATUS[k];
});
};

MasterData.pengajuanStatus=function(){
return Object.keys(APP.PENGAJUAN_STATUS).map(function(k){
return APP.PENGAJUAN_STATUS[k];
});
};

MasterData.jenisKelamin=function(){
return[
"Laki-laki",
"Perempuan"
];
};

MasterData.channelPengajuan=function(){
return[
"ONLINE",
"LAYANAN_RT",
"LAYANAN_RW",
"OFFICE"
];
};

MasterData.layananDefault=function(){
return[
{
kode:"SKTM",
nama:"Surat Keterangan Tidak Mampu",
estimasi:"2 Hari",
biaya:"Gratis",
aktif:true
},
{
kode:"DOM",
nama:"Surat Keterangan Domisili",
estimasi:"2 Hari",
biaya:"Gratis",
aktif:true
},
{
kode:"SKU",
nama:"Surat Keterangan Usaha",
estimasi:"2 Hari",
biaya:"Gratis",
aktif:true
},
{
kode:"SKCK",
nama:"Surat Pengantar SKCK",
estimasi:"2 Hari",
biaya:"Gratis",
aktif:true
},
{
kode:"NIKAH",
nama:"Surat Pengantar Nikah",
estimasi:"2 Hari",
biaya:"Gratis",
aktif:true
}
];
};