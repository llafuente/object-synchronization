(function (exports) {
    "use strict";

    // TODO
    // minimize the message, do not send an Object an array is enough

    var Sync = require("./sync.js"),
        Observer,
        SyncTCPBin,
        encode = require("buffalo").serialize,
        decode = require("buffalo").parse,
        Class = require("node-class").Class,
        console_log = function () {};
        //console_log = console.log;

    Observer = require("./observer.js").Observer;

    SyncTCPBin = new Class("SyncTCPBin");

    SyncTCPBin.extends(Sync.ObjectSync);

    SyncTCPBin.implements({
        __net_bind: function (socket, __change, __new_object, __observe, __go_sync, __back_sync) {
            console.log("bindings!");
            socket.setEncoding("utf8");

            socket.on('data', function (data) {
                data = decode(new Buffer(data));
                console.log("data --> ", data);
                switch (data.event) {
                case Sync.EV_NET_CHANGE:
                    __change(data.id, data.key, data.value);
                    break;
                case Sync.EV_NET_OBSERVE_NEW_PROPERTY:
                    __observe(data.id, data.key);
                    break;
                case Sync.EV_NET_OBSERVE_NEW_OBJECT:
                    __new_object(data.id, data.object);
                    break;
                case Sync.EV_NET_SYNCHRONIZE:
                    __go_sync();
                    break;
                case Sync.EV_NET_SYNCHRONIZE_BACK:
                    __back_sync(data.objects, data.versions);
                    break;
                }
            });

        },
        __net_emit: function (socket, obj) {
            console.log("write!", arguments);
            var eobj = encode(obj);
            console.log("eobj", eobj);

            socket.write(eobj);
        },
        __net_broadcast: function (obj) {
            console.log("write!", arguments);
            var eobj = encode(obj);
            console.log("eobj", eobj);
            this.sockets.forEach(function (s) {
                s.write(eobj);
            });
        }
    });

    exports.SyncTCPBin = SyncTCPBin;
}(module.exports));


