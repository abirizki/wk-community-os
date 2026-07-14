/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 12_Request.gs
 * Version : 2.1.0
 * Phase   : Core Framework
 * Part    : 1 of 4
 * =============================================================================
 */

var Request={};

Request.event=function(e){

return e||null;

};

Request.parameter=function(e,name,def){

def=def||"";

if(!e){

return def;

}

if(!e.parameter){

return def;

}

return e.parameter[name]||def;

};

Request.parameters=function(e){

if(!e){

return {};

}

return e.parameters||{};

};

Request.postData=function(e){

if(!e){

return null;

}

return e.postData||null;

};

Request.body=function(e){

var post=Request.postData(e);

if(!post){

return "";

}

return post.contents||"";

};

Request.json=function(e){

try{

var body=Request.body(e);

if(!body){

return {};

}

return JSON.parse(body);

}catch(ex){

return {};

}

};

Request.method=function(e){

if(Request.body(e)){

return "POST";

}

return "GET";

};

Request.isPost=function(e){

return Request.method(e)==="POST";

};

Request.isGet=function(e){

return Request.method(e)==="GET";

};

Request.input=function(e,name,def){

def=def||"";

var json=Request.json(e);

if(json[name]!==undefined){

return json[name];

}

return Request.parameter(

e,

name,

def

);

};

Request.all=function(e){

var data={};

var params=Request.parameters(e);

for(var k in params){

data[k]=params[k];

}

var json=Request.json(e);

for(var j in json){

data[j]=json[j];

}

return data;

};

Request.only=function(e,fields){

var src=Request.all(e);

var obj={};

fields=fields||[];

for(var i=0;i<fields.length;i++){

var f=fields[i];

if(src[f]!==undefined){

obj[f]=src[f];

}

}

return obj;

};

Request.except=function(e,fields){

var obj=Request.all(e);

fields=fields||[];

for(var i=0;i<fields.length;i++){

delete obj[fields[i]];

}

return obj;

};

Request.has=function(e,name){

return Request.input(

e,

name,

null

)!==null;

};

Request.filled=function(e,name){

var value=Request.input(

e,

name,

""

);

return !Utils.isEmpty(value);

};

Request.sanitize=function(data){

data=data||{};

var clean={};

for(var k in data){

clean[k]=Utils.escapeHtml(

String(data[k]).trim()

);

}

return clean;

};

Request.context=function(e){

return{

method:Request.method(e),

request:Request.sanitize(

Request.all(e)

),

session:Session.info(),

user:Session.profile(),

timestamp:Helper.now()

};

};

Request.requestId=function(){

return Helper.uuid();

};

Request.clientIp=function(e){

return Request.parameter(

e,

"ip",

""

);

};

Request.userAgent=function(e){

return Request.parameter(

e,

"userAgent",

""

);

};

Request.isAjax=function(e){

return Request.input(

e,

"ajax",

false

)===true||

Request.input(

e,

"ajax",

"false"

)==="true";

};

Request.merge=function(e,data){

var obj=Request.all(e);

for(var k in data){

obj[k]=data[k];

}

return obj;

};

Request.replace=function(data){

return Request.sanitize(

data

);

};

Request.collect=function(e){

return Request.sanitize(

Request.all(e)

);

};

Request.validate=function(e,rules){

var data=Request.collect(e);

return Validator.validate(

data,

rules

);

};