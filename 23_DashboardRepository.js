/**
 * =============================================================================
 * WK FRAMEWORK
 * File : 23_DashboardRepository.gs
 * Version : 1.0.0
 * PART 1 OF 3
 * =============================================================================
 */

var DashboardRepository={};

DashboardRepository.wargaTable=function(){

    return WK.Config.tables.warga;

};

DashboardRepository.suratTable=function(){

    return WK.Config.tables.surat;

};

DashboardRepository.userTable=function(){

    return WK.Config.tables.users;

};

DashboardRepository.totalWarga=function(){

    return Database

        .table(DashboardRepository.wargaTable())

        .count();

};

DashboardRepository.totalKK=function(){

    return Database

        .table(DashboardRepository.wargaTable())

        .distinct("No_KK")

        .count();

};

DashboardRepository.totalLaki=function(){

    return Database

        .table(DashboardRepository.wargaTable())

        .where("Jenis_Kelamin","L")

        .count();

};

DashboardRepository.totalPerempuan=function(){

    return Database

        .table(DashboardRepository.wargaTable())

        .where("Jenis_Kelamin","P")

        .count();

};

DashboardRepository.totalRT=function(){

    return Database

        .table(DashboardRepository.wargaTable())

        .select(["RT"])

        .distinct("RT")

        .count();

};

DashboardRepository.totalRW=function(){

    return Database

        .table(DashboardRepository.wargaTable())

        .select(["RW"])

        .distinct("RW")

        .count();

};

DashboardRepository.totalUser=function(){

    return Database

        .table(DashboardRepository.userTable())

        .count();

};

DashboardRepository.totalSurat=function(){

    return Database

        .table(DashboardRepository.suratTable())

        .count();

};

DashboardRepository.totalSuratPending=function(){

    return Database

        .table(DashboardRepository.suratTable())

        .where("Status","Pending")

        .count();

};

DashboardRepository.totalSuratProses=function(){

    return Database

        .table(DashboardRepository.suratTable())

        .where("Status","Diproses")

        .count();

};

DashboardRepository.totalSuratSelesai=function(){

    return Database

        .table(DashboardRepository.suratTable())

        .where("Status","Selesai")

        .count();

};

DashboardRepository.suratTerbaru=function(limit){

    limit=limit||10;

    return Database

        .table(DashboardRepository.suratTable())

        .orderBy("Tanggal","DESC")

        .limit(limit)

        .get();

};

DashboardRepository.userTerbaru=function(limit){

    limit=limit||10;

    return Database

        .table(DashboardRepository.userTable())

        .orderBy("Created_At","DESC")

        .limit(limit)

        .get();

};

DashboardRepository.wargaTerbaru=function(limit){

    limit=limit||10;

    return Database

        .table(DashboardRepository.wargaTable())

        .orderBy("Created_At","DESC")

        .limit(limit)

        .get();

};

DashboardRepository.wargaPerRW=function(){

    var data=

        Database

        .table(DashboardRepository.wargaTable())

        .get();

    var result={};

    data.forEach(function(item){

        var rw=item.RW||"-";

        result[rw]=(result[rw]||0)+1;

    });

    return result;

};

DashboardRepository.wargaPerRT=function(){

    var data=

        Database

        .table(DashboardRepository.wargaTable())

        .get();

    var result={};

    data.forEach(function(item){

        var rt=item.RT||"-";

        result[rt]=(result[rt]||0)+1;

    });

    return result;

};

DashboardRepository.suratPerStatus=function(){

    var data=

        Database

        .table(DashboardRepository.suratTable())

        .get();

    var result={};

    data.forEach(function(item){

        var status=item.Status||"-";

        result[status]=(result[status]||0)+1;

    });

    return result;

};

DashboardRepository.userPerRole=function(){

    var data=

        Database

        .table(DashboardRepository.userTable())

        .get();

    var result={};

    data.forEach(function(item){

        var role=item.Role||"-";

        result[role]=(result[role]||0)+1;

    });

    return result;

};

DashboardRepository.onlineUser=function(){

    return SessionRepository.online();

};

DashboardRepository.summary=function(){

    return {

        totalWarga:

            DashboardRepository.totalWarga(),

        totalKK:

            DashboardRepository.totalKK(),

        totalLaki:

            DashboardRepository.totalLaki(),

        totalPerempuan:

            DashboardRepository.totalPerempuan(),

        totalRT:

            DashboardRepository.totalRT(),

        totalRW:

            DashboardRepository.totalRW(),

        totalUser:

            DashboardRepository.totalUser(),

        totalSurat:

            DashboardRepository.totalSurat(),

        suratPending:

            DashboardRepository.totalSuratPending(),

        suratProses:

            DashboardRepository.totalSuratProses(),

        suratSelesai:

            DashboardRepository.totalSuratSelesai(),

        onlineUser:

            DashboardRepository.onlineUser()

    };

};

DashboardRepository.chart=function(){

    return{

        wargaPerRW:

            DashboardRepository.wargaPerRW(),

        wargaPerRT:

            DashboardRepository.wargaPerRT(),

        suratPerStatus:

            DashboardRepository.suratPerStatus(),

        userPerRole:

            DashboardRepository.userPerRole()

    };

};

DashboardRepository.health=function(){

    return{

        success:true,

        warga:

            DashboardRepository.totalWarga(),

        users:

            DashboardRepository.totalUser(),

        surat:

            DashboardRepository.totalSurat(),

        online:

            DashboardRepository.onlineUser()

    };

};

DashboardRepository.boot=function(){

    AppLogger.info(

        "DashboardRepository Loaded"

    );

    return true;

};

