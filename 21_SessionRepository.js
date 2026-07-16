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

    return CONST.SHEETS.SESSIONS;

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

SessionRepository.create=function(sessionObject){
    Database

        .table(SessionRepository.table())

        .insert(sessionObject);

    return sessionObject;

};

SessionRepository.update=function(token, data){
    return Database
        .table(SessionRepository.table())

        .update(

            "Token",

            token,

            data

        );
};

SessionRepository.delete=function(token){

    return Database

        .table(SessionRepository.table())

        .delete(

            "Token",

            token

        );

};

SessionRepository.deleteByUser=function(userId){

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
    // This function is now handled by AuthService calling update.
    // This is dead code.
    return false;
};

SessionRepository.active=function(){

    return Database

        .table(SessionRepository.table())

        .where("Status","ACTIVE")

        .get();

};

SessionRepository.online=function(){

    return SessionRepository.active().length;

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