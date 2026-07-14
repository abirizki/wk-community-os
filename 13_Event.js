/**
 * =============================================================================
 * WK FRAMEWORK
 * File    : 13_Event.gs
 * Version : 2.2.0
 * Phase   : Core Framework
 * Part    : 1 of 4
 * =============================================================================
 */

var Event={};

Event._listeners={};

Event._history=[];

Event.on=function(eventName,callback){

if(!Event._listeners[eventName]){

Event._listeners[eventName]=[];

}

Event._listeners[eventName].push(callback);

return Event;

};

Event.once=function(eventName,callback){

var wrapper=function(payload){

callback(payload);

Event.off(eventName,wrapper);

};

return Event.on(

eventName,

wrapper

);

};

Event.has=function(eventName){

return !!(

Event._listeners[eventName]&&

Event._listeners[eventName].length

);

};

Event.listeners=function(eventName){

return Event._listeners[eventName]||[];

};

Event.count=function(eventName){

return Event.listeners(

eventName

).length;

};

/* =============================================================================
 * EVENT DISPATCHER
 * =============================================================================
 */

Event.off=function(eventName,callback){

if(!Event._listeners[eventName]){

return Event;

}

if(!callback){

delete Event._listeners[eventName];

return Event;

}

Event._listeners[eventName]=

Event._listeners[eventName].filter(function(fn){

return fn!==callback;

});

return Event;

};

Event.dispatch=function(eventName,payload){

payload=payload||{};

Event._history.push({

event:eventName,

timestamp:Helper.now(),

payload:payload

});

var listeners=Event.listeners(eventName);

listeners.forEach(function(listener){

try{

listener(payload);

}catch(ex){

Logger.error(

"EVENT",

eventName,

ex

);

}

});

return true;

};

Event.emit=function(eventName,payload){

return Event.dispatch(

eventName,

payload

);

};

Event.fire=function(eventName,payload){

return Event.dispatch(

eventName,

payload

);

};

/* =============================================================================
 * EVENT HISTORY
 * =============================================================================
 */

Event.history=function(){

return Event._history.slice();

};

Event.clearHistory=function(){

Event._history=[];

return true;

};

Event.stats=function(){

var totalListeners=0;

Object.keys(Event._listeners).forEach(function(name){

totalListeners+=Event._listeners[name].length;

});

return{

events:Object.keys(Event._listeners).length,

listeners:totalListeners,

history:Event._history.length

};

};

/* =============================================================================
 * PRIORITY EVENT
 * =============================================================================
 */

Event.onPriority=function(eventName,callback,priority){

priority=priority||100;

if(!Event._listeners[eventName]){

Event._listeners[eventName]=[];

}

Event._listeners[eventName].push({

priority:priority,

callback:callback

});

Event._listeners[eventName].sort(function(a,b){

return a.priority-b.priority;

});

return Event;

};

Event.dispatchPriority=function(eventName,payload){

payload=payload||{};

var listeners=Event._listeners[eventName]||[];

listeners.forEach(function(item){

try{

item.callback(payload);

}catch(ex){

Logger.error(

"EVENT",

eventName,

ex

);

}

});

return true;

};

/* =============================================================================
 * FINAL IMPLEMENTATION
 * =============================================================================
 */

Event.on=function(eventName,callback,priority){

priority=priority||100;

if(!Event._listeners[eventName]){

Event._listeners[eventName]=[];

}

Event._listeners[eventName].push({

callback:callback,

priority:priority

});

Event._listeners[eventName].sort(function(a,b){

return a.priority-b.priority;

});

return Event;

};

Event.dispatch=function(eventName,payload){

payload=payload||{};

Event._history.push({

event:eventName,

timestamp:Helper.now(),

payload:payload

});

var listeners=Event.listeners(eventName);

listeners.forEach(function(item){

try{

item.callback(payload);

}catch(ex){

Logger.error(

"EVENT",

eventName,

ex

);

}

});

return true;

};

Event.emit=function(eventName,payload){

return Event.dispatch(

eventName,

payload

);

};

Event.fire=function(eventName,payload){

return Event.dispatch(

eventName,

payload

);

};

Event.reset=function(){

Event._listeners={};

Event._history=[];

return true;

};

Event.health=function(){

return{

success:true,

status:"READY",

events:Object.keys(

Event._listeners

).length,

history:Event._history.length,

timestamp:Helper.now()

};

};