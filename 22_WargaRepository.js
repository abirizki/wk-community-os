/**
 * =============================================================================
 * WK FRAMEWORK
 * File : 22_WargaRepository.gs
 * Version : 1.0.0
 * PART 1 OF 4
 * =============================================================================
 */

var WargaRepository = {};

WargaRepository.table=function(){

    return WK.Config.tables.warga;

};

WargaRepository.all=function(){

    return Database

        .table(WargaRepository.table())

        .orderBy("Nama")

        .get();

};

WargaRepository.find=function(id){

    return Database

        .table(WargaRepository.table())

        .find(

            "ID",

            id

        );

};

WargaRepository.findByNik=function(nik){

    return Database

        .table(WargaRepository.table())

        .where(

            "NIK",

            nik

        )

        .first();

};

WargaRepository.findByNoKK=function(noKK){

    return Database

        .table(WargaRepository.table())

        .where(

            "No_KK",

            noKK

        )

        .get();

};

WargaRepository.findByUsername=function(username){

    return Database

        .table(WargaRepository.table())

        .where(

            "Username",

            username

        )

        .first();

};

WargaRepository.byRT=function(rt){

    return Database

        .table(WargaRepository.table())

        .where(

            "RT",

            rt

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.byRW=function(rw){

    return Database

        .table(WargaRepository.table())

        .where(

            "RW",

            rw

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.byWilayah=function(wilayahId){

    return Database

        .table(WargaRepository.table())

        .where(

            "Wilayah_ID",

            wilayahId

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.existsNik=function(nik){

    return Database

        .table(WargaRepository.table())

        .where(

            "NIK",

            nik

        )

        .exists();

};

WargaRepository.existsKK=function(noKK){

    return Database

        .table(WargaRepository.table())

        .where(

            "No_KK",

            noKK

        )

        .exists();

};

WargaRepository.create=function(data){

    data=Security.beforeInsert(data);

    return Database

        .table(WargaRepository.table())

        .insert(data);

};

WargaRepository.update=function(id,data){

    data=Security.beforeUpdate(data);

    return Database

        .table(WargaRepository.table())

        .update(

            "ID",

            id,

            data

        );

};

WargaRepository.delete=function(id){

    return Database

        .table(WargaRepository.table())

        .delete(

            "ID",

            id

        );

};

WargaRepository.search=function(keyword){

    return Database

        .table(WargaRepository.table())

        .whereLike(

            "Nama",

            keyword

        )

        .get();

};

WargaRepository.active=function(){

    return Database

        .table(WargaRepository.table())

        .where(

            "Status",

            "Aktif"

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.inactive=function(){

    return Database

        .table(WargaRepository.table())

        .where(

            "Status",

            "Tidak Aktif"

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.byGender=function(jenisKelamin){

    return Database

        .table(WargaRepository.table())

        .where(

            "Jenis_Kelamin",

            jenisKelamin

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.byAgama=function(agama){

    return Database

        .table(WargaRepository.table())

        .where(

            "Agama",

            agama

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.byPekerjaan=function(pekerjaan){

    return Database

        .table(WargaRepository.table())

        .where(

            "Pekerjaan",

            pekerjaan

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.byStatusKawin=function(status){

    return Database

        .table(WargaRepository.table())

        .where(

            "Status_Perkawinan",

            status

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.paginate=function(page,limit){

    return Database

        .table(WargaRepository.table())

        .orderBy("Nama")

        .paginate(page,limit)

        .get();

};

WargaRepository.total=function(){

    return Database

        .table(WargaRepository.table())

        .count();

};

WargaRepository.totalByRT=function(rt){

    return Database

        .table(WargaRepository.table())

        .where(

            "RT",

            rt

        )

        .count();

};

WargaRepository.totalByRW=function(rw){

    return Database

        .table(WargaRepository.table())

        .where(

            "RW",

            rw

        )

        .count();

};

WargaRepository.totalByWilayah=function(wilayahId){

    return Database

        .table(WargaRepository.table())

        .where(

            "Wilayah_ID",

            wilayahId

        )

        .count();

};

WargaRepository.totalLaki=function(){

    return Database

        .table(WargaRepository.table())

        .where(

            "Jenis_Kelamin",

            "L"

        )

        .count();

};

WargaRepository.totalPerempuan=function(){

    return Database

        .table(WargaRepository.table())

        .where(

            "Jenis_Kelamin",

            "P"

        )

        .count();

};

WargaRepository.totalKK=function(){

    return Database

        .table(WargaRepository.table())

        .distinct(

            "No_KK"

        )

        .count();

};

WargaRepository.kepalaKeluarga=function(){

    return Database

        .table(WargaRepository.table())

        .where(

            "Status_Dalam_Keluarga",

            "Kepala Keluarga"

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.anggotaKK=function(noKK){

    return Database

        .table(WargaRepository.table())

        .where(

            "No_KK",

            noKK

        )

        .orderBy("Status_Dalam_Keluarga")

        .get();

};

WargaRepository.profile=function(id){

    return Database

        .table(WargaRepository.table())

        .find(

            "ID",

            id

        );

};

WargaRepository.health=function(){

    return {

        success:true,

        table:WargaRepository.table(),

        total:WargaRepository.total()

    };

};

WargaRepository.byDusun=function(dusun){

    return Database

        .table(WargaRepository.table())

        .where(

            "Dusun",

            dusun

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.byBlok=function(blok){

    return Database

        .table(WargaRepository.table())

        .where(

            "Blok",

            blok

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.byStatus=function(status){

    return Database

        .table(WargaRepository.table())

        .where(

            "Status",

            status

        )

        .orderBy("Nama")

        .get();

};

WargaRepository.select=function(fields){

    return Database

        .table(WargaRepository.table())

        .select(fields)

        .get();

};

WargaRepository.export=function(){

    return Database

        .table(WargaRepository.table())

        .orderBy("RW")

        .orderBy("RT")

        .orderBy("Nama")

        .get();

};

WargaRepository.boot=function(){

    AppLogger.info(

        "WargaRepository Loaded"

    );

    return true;

};