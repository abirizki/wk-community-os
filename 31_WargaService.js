/**
 * =============================================================================
 * WK FRAMEWORK
 * File : 31_WargaService.gs
 * Version : 1.0.0
 * PART 1 OF 4
 * =============================================================================
 */

var WargaService={};

WargaService.list=function(request){

    var token=Request.token(request);

    if(!SessionRepository.validate(token)){

        return Response.unauthorized();

    }

    var user=

        SessionRepository.user(token);

    var data=

        WargaRepository.all();

    data=

        Permission.filter(

            user,

            data

        );

    return Response.success(data);

};

WargaService.detail=function(request){

    var token=Request.token(request);

    if(!SessionRepository.validate(token)){

        return Response.unauthorized();

    }

    var id=

        Request.input(

            request,

            "id"

        );

    var warga=

        WargaRepository.find(id);

    if(!warga){

        return Response.notFound(

            "Data warga tidak ditemukan."

        );

    }

    return Response.success(

        warga

    );

};

WargaService.create=function(request){

    var token=Request.token(request);

    if(!AuthService.authorize(token,"WARGA_CREATE")){

        return Response.forbidden();

    }

    var data=

        Request.except(

            request,

            [

                "action",

                "token"

            ]

        );

    if(

        WargaRepository.existsNik(

            data.NIK

        )

    ){

        return Response.error(

            "NIK sudah terdaftar."

        );

    }

    WargaRepository.create(

        data

    );

    Security.audit(

        SessionRepository.user(token),

        "CREATE_WARGA"

    );

    return Response.success(

        "Data warga berhasil ditambahkan."

    );

};

WargaService.update=function(request){

    var token=Request.token(request);

    if(!AuthService.authorize(token,"WARGA_UPDATE")){

        return Response.forbidden();

    }

    var id=

        Request.input(

            request,

            "id"

        );

    var data=

        Request.except(

            request,

            [

                "id",

                "action",

                "token"

            ]

        );

    WargaRepository.update(

        id,

        data

    );

    Security.audit(

        SessionRepository.user(token),

        "UPDATE_WARGA"

    );

    return Response.success(

        "Data warga berhasil diperbarui."

    );

};

WargaService.remove=function(request){

    var token=Request.token(request);

    if(!AuthService.authorize(token,"WARGA_DELETE")){

        return Response.forbidden();

    }

    var id=

        Request.input(

            request,

            "id"

        );

    var warga=

        WargaRepository.find(id);

    if(!warga){

        return Response.notFound(

            "Data warga tidak ditemukan."

        );

    }

    WargaRepository.delete(id);

    Security.audit(

        SessionRepository.user(token),

        "DELETE_WARGA"

    );

    return Response.success(

        "Data warga berhasil dihapus."

    );

};

WargaService.search=function(request){

    var token=Request.token(request);

    if(!SessionRepository.validate(token)){

        return Response.unauthorized();

    }

    var keyword=

        Request.input(

            request,

            "keyword",

            ""

        );

    var data=

        WargaRepository.search(

            keyword

        );

    data=

        Permission.filter(

            SessionRepository.user(token),

            data

        );

    return Response.success(data);

};

WargaService.byRT=function(request){

    return Response.success(

        WargaRepository.byRT(

            Request.input(

                request,

                "rt"

            )

        )

    );

};

WargaService.byRW=function(request){

    return Response.success(

        WargaRepository.byRW(

            Request.input(

                request,

                "rw"

            )

        )

    );

};

WargaService.byWilayah=function(request){

    return Response.success(

        WargaRepository.byWilayah(

            Request.input(

                request,

                "wilayahId"

            )

        )

    );

};

WargaService.profile=function(request){

    return Response.success(

        WargaRepository.profile(

            Request.input(

                request,

                "id"

            )

        )

    );

};

WargaService.statistics=function(request){

    var token=Request.token(request);

    if(!SessionRepository.validate(token)){

        return Response.unauthorized();

    }

    return Response.success({

        total:

            WargaRepository.total(),

        laki:

            WargaRepository.totalLaki(),

        perempuan:

            WargaRepository.totalPerempuan(),

        kk:

            WargaRepository.totalKK()

    });

};

WargaService.anggotaKK=function(request){

    var noKK=

        Request.input(

            request,

            "No_KK"

        );

    return Response.success(

        WargaRepository.anggotaKK(

            noKK

        )

    );

};

WargaService.paginate=function(request){

    var page=parseInt(

        Request.input(

            request,

            "page",

            1

        ),

        10

    );

    var limit=parseInt(

        Request.input(

            request,

            "limit",

            20

        ),

        10

    );

    return Response.success(

        WargaRepository.paginate(

            page,

            limit

        )

    );

};

WargaService.export=function(){

    return Response.success(

        WargaRepository.export()

    );

};

WargaService.health=function(){

    return Response.success(

        WargaRepository.health()

    );

};

WargaService.boot=function(){

    AppLogger.info(

        "WargaService Loaded"

    );

    return true;

};
