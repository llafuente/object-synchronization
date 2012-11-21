(function (exports) {
    "use strict";

    var Sync = require("./sync.js"),
        Observer,
        SyncSocketIO,
        Class = require("node-class").Class,
        console_log = function() {};
        //console_log = console.log;

    Observer = require("./observer.js").Observer;

    SyncSocketIO = new Class("SyncSocketIO");

    SyncSocketIO.extends(Sync.ObjectSync);

    SyncSocketIO.implements({
        __net_bind: function(socket, __change, __new_object, __observe, __go_sync, __back_sync) {
            socket.on(Sync.EV_NET_CHANGE, __change);
            socket.on(Sync.EV_NET_OBSERVE_NEW_PROPERTY, __observe);
            socket.on(Sync.EV_NET_OBSERVE_NEW_OBJECT, __new_object);
            socket.on(Sync.EV_NET_SYNCHRONIZE, __go_sync);
            socket.on(Sync.EV_NET_SYNCHRONIZE_BACK, __back_sync);
        },
        __net_emit: function(socket, obj) {
            socket.emit(obj.event, obj.id || obj.objects, obj.key || obj.object || obj.versions, obj.value);
        },
        __net_broadcast: function(obj) {
            this.sockets.forEach(function(s) {
                s.emit(obj.event, obj.id, obj.key || obj.object, obj.value);
            });
        },
    });

    exports.SyncSocketIO = SyncSocketIO;
}(module.exports));


