/**
 * =============================================================================
 * WK FRAMEWORK
 * File : 30_AuthService.gs
 * Version : 1.0.0
 * PART 1 OF 4
 * =============================================================================
 */

var AuthService={};

AuthService.login=function(request){

    request=Security.checkRequest(request);

    var username=

        Request.input(

            request,

            "username"

        );

    var password=

        Request.input(

            request,

            "password"

        );

    if(

        !username ||

        !password

    ){

        return Response.error(

            "Username dan password wajib diisi."

        );

    }

    if(

        Security.isLocked(

            username

        )

    ){

        return Response.error(

            "Akun sementara dikunci."

        );

    }

    var user=

        AuthRepository.login(

            username,

            password

        );

    if(!user){

        Security.failedAttempt(

            username

        );

        Security.logDenied(

            username

        );

        return Response.error(

            "Username atau password salah."

        );

    }

    Security.resetAttempt(

        username

    );

    var session=

        SessionRepository.create(

            user

        );

    AuthRepository.lastLogin(

        user.ID

    );

    Security.logLogin(

        username

    );

    return Response.success({

        token:session.Token,

        user:user

    });

};

AuthService.logout=function(request){

    var token=

        Request.token(request);

    if(!token){

        return Response.error(

            "Token tidak ditemukan."

        );

    }

    SessionRepository.logout(

        token

    );

    SessionRepository.destroy(

        token

    );

    return Response.success(

        "Logout berhasil."

    );

};

AuthService.me=function(request){

    var token=

        Request.token(request);

    if(

        !SessionRepository.validate(

            token

        )

    ){

        return Response.unauthorized();

    }

    return Response.success(

        SessionRepository.user(

            token

        )

    );

};

AuthService.changePassword=function(request){

    var token=

        Request.token(request);

    if(

        !SessionRepository.validate(

            token

        )

    ){

        return Response.unauthorized();

    }

    var user=

        SessionRepository.user(token);

    var oldPassword=

        Request.input(

            request,

            "old_password"

        );

    var newPassword=

        Request.input(

            request,

            "new_password"

        );

    if(

        !Security.verifyPassword(

            oldPassword,

            user.Password

        )

    ){

        return Response.error(

            "Password lama tidak sesuai."

        );

    }

    var validation=

        Security.validatePassword(

            newPassword

        );

    if(

        !validation.success

    ){

        return Response.error(

            validation.message

        );

    }

    AuthRepository.updatePassword(

        user.ID,

        newPassword

    );

    Security.audit(

        user,

        "CHANGE_PASSWORD"

    );

    return Response.success(

        "Password berhasil diperbarui."

    );

};

AuthService.refresh=function(request){

    var token=

        Request.token(request);

    if(

        !SessionRepository.validate(

            token

        )

    ){

        return Response.unauthorized();

    }

    SessionRepository.refresh(

        token

    );

    return Response.success(

        SessionRepository.find(

            token

        )

    );

};

AuthService.profile=function(request){

    var token=

        Request.token(request);

    if(

        !SessionRepository.validate(

            token

        )

    ){

        return Response.unauthorized();

    }

    var user=

        SessionRepository.user(

            token

        );

    return Response.success(

        AuthRepository.profile(

            user.ID

        )

    );

};

AuthService.health=function(){

    return Response.success({

        auth:

            AuthRepository.health(),

        session:

            SessionRepository.health()

    });

};

AuthService.updateProfile=function(request){

    var token=

        Request.token(request);

    if(

        !SessionRepository.validate(

            token

        )

    ){

        return Response.unauthorized();

    }

    var user=

        SessionRepository.user(

            token

        );

    var data=

        Request.only(

            request,

            [

                "Nama",

                "Email",

                "No_HP",

                "Alamat",

                "Foto"

            ]

        );

    AuthRepository.update(

        user.ID,

        data

    );

    Security.audit(

        user,

        "UPDATE_PROFILE"

    );

    return Response.success(

        "Profil berhasil diperbarui."

    );

};

AuthService.verify=function(token){

    return SessionRepository.validate(

        token

    );

};

AuthService.user=function(token){

    if(

        !SessionRepository.validate(

            token

        )

    ){

        return null;

    }

    return SessionRepository.user(

        token

    );

};

AuthService.authorize=function(token,permission){

    var user=

        AuthService.user(

            token

        );

    if(!user){

        return false;

    }

    return Permission.can(

        user,

        permission

    );

};

AuthService.require=function(token,permission){

    if(

        !AuthService.authorize(

            token,

            permission

        )

    ){

        throw new Error(

            "Unauthorized"

        );

    }

    return true;

};

AuthService.boot=function(){

    AppLogger.info(

        "AuthService Loaded"

    );

    return true;

};

AuthService.currentSession = function () {

    var token = Session.token();

    if (!token) {
        return null;
    }

    return AuthRepository.findSession(token);
};
