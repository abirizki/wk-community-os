/**
 * =============================================================================
 * WK FRAMEWORK
 * File : 21_SessionRepository.gs
 * Version : 1.0.0
 * PART 1 OF 3
 * =============================================================================
 */

var SessionRepository = {};

SessionRepository.table=function(){

    return WK.Config.tables.sessions;

};

SessionRepository.find=function(token){

    return Database

        .table(SessionRepository.table())

        .where("Token",token)

        .first();

};

SessionRepository.findByUser=function(userId){

    return Database

        .table(SessionRepository.table())

        .where("User_ID",userId)

        .first();

};

SessionRepository.exists=function(token){

    return Database

        .table(SessionRepository.table())

        .where("Token",token)

        .exists();

};

SessionRepository.create=function(user){

    var token=

        Security.generateToken();

    var data={

        ID:Security.uuid(),

        User_ID:user.ID,

        Username:user.Username,

        Role:user.Role,

        Wilayah_ID:user.Wilayah_ID,

        Token:token,

        Login_At:new Date(),

        Expired_At:new Date(

            new Date().getTime()+

            (1000*60*60*24)

        ),

        Status:"ACTIVE"

    };

    Database

        .table(SessionRepository.table())

        .insert(data);

    return data;

};

SessionRepository.validate=function(token){

    var session=

        SessionRepository.find(token);

    if(!session){

        return false;

    }

    if(session.Status!=="ACTIVE"){

        return false;

    }

    if(

        new Date(session.Expired_At)

        <

        new Date()

    ){

        return false;

    }

    return true;

};

SessionRepository.user=function(token){

    var session=

        SessionRepository.find(token);

    if(!session){

        return null;

    }

    return AuthRepository.findById(

        session.User_ID

    );

};

SessionRepository.refresh=function(token){

    var session=

        SessionRepository.find(token);

    if(!session){

        return false;

    }

    return Database

        .table(SessionRepository.table())

        .update(

            "Token",

            token,

            {

                Expired_At:new Date(

                    new Date().getTime()+

                    (1000*60*60*24)

                )

            }

        );

};

SessionRepository.destroy=function(token){

    return Database

        .table(SessionRepository.table())

        .delete(

            "Token",

            token

        );

};

SessionRepository.destroyByUser=function(userId){

    var sessions=

        Database

        .table(SessionRepository.table())

        .where("User_ID",userId)

        .get();

    sessions.forEach(function(item){

        Database

            .table(SessionRepository.table())

            .delete(

                "ID",

                item.ID

            );

    });

    return true;

};

SessionRepository.logout=function(token){

    return Database

        .table(SessionRepository.table())

        .update(

            "Token",

            token,

            {

                Status:"LOGOUT",

                Logout_At:new Date()

            }

        );

};

SessionRepository.extend=function(token,hours){

    hours=hours||24;

    return Database

        .table(SessionRepository.table())

        .update(

            "Token",

            token,

            {

                Expired_At:new Date(

                    new Date().getTime()+

                    (1000*60*60*hours)

                )

            }

        );

};

SessionRepository.active=function(){

    return Database

        .table(SessionRepository.table())

        .where("Status","ACTIVE")

        .get();

};

SessionRepository.expired=function(){

    var now=new Date();

    return Database

        .table(SessionRepository.table())

        .filter(function(item){

            return new Date(item.Expired_At)<now;

        })

        .get();

};

SessionRepository.online=function(){

    return SessionRepository.active().length;

};

SessionRepository.cleanup=function(){

    var sessions=

        Database

        .table(SessionRepository.table())

        .get();

    var now=new Date();

    sessions.forEach(function(item){

        if(

            item.Status!=="ACTIVE" ||

            new Date(item.Expired_At)<now

        ){

            Database

                .table(SessionRepository.table())

                .delete(

                    "ID",

                    item.ID

                );

        }

    });

    return true;

};

SessionRepository.all=function(){

    return Database

        .table(SessionRepository.table())

        .orderBy("Login_At","DESC")

        .get();

};

SessionRepository.total=function(){

    return Database

        .table(SessionRepository.table())

        .count();

};

SessionRepository.health=function(){

    return {

        success:true,

        table:SessionRepository.table(),

        total:SessionRepository.total(),

        active:SessionRepository.online()

    };

};

SessionRepository.boot=function(){

    AppLogger.info(

        "SessionRepository Loaded"

    );

    return true;

};