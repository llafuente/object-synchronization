(function (exports) {
    "use strict";

    var ObjectSync,
        Class = require("node-class").Class,
        Events = require("node-class").Events,
        Observer,
        debug = false, //this set readable event
        EV_NET_CHANGE = 1,
        EV_NET_OBSERVE_NEW_PROPERTY = 2,
        EV_NET_OBSERVE_NEW_OBJECT = 3,
        EV_NET_SYNCHRONIZE = 4,
        EV_NET_SYNCHRONIZE_BACK = 5,
        EV_READY = "ready",
        EV_NET_UPDATE = "netupdate",
        EV_UPDATE = "update",
        console_log = function () {};
        //console_log = console.log;

    if (debug) {
        EV_NET_CHANGE = "osync:change";
        EV_NET_OBSERVE_NEW_PROPERTY = "osync:observe-property";
        EV_NET_OBSERVE_NEW_OBJECT = "osync:observe-new-object";
        EV_NET_SYNCHRONIZE = "osync:sync";
        EV_NET_SYNCHRONIZE_BACK = "osync:sync-back";
    }


    Observer = require("./observer.js").Observer;

    ObjectSync = new Class("ObjectSync", {
        sockets: [],
        objects: {},
        objects_v: {}
    });

    ObjectSync.Extends(Events);

    ObjectSync.Implements({
        __construct: function () {
            this.parent();
        },
        add_socket: function (socket, sync_now) {
            sync_now = sync_now || false;

            var __change = this.__change.bind({self: this, socket: socket}),
                __new_object = this.__new_object.bind({self: this, socket: socket}),
                __observe = this.__observe.bind({self: this, socket: socket}),
                __go_sync = this.__go_sync.bind({self: this, socket: socket}),
                __back_sync = this.__back_sync.bind({self: this, socket: socket});

            this.__net_bind(socket, __change, __new_object, __observe, __go_sync, __back_sync);

            if (sync_now) {
                this.__net_emit(socket, {event: EV_NET_SYNCHRONIZE});
            }

            this.sockets.push(socket);
        },
        __observe: function (id, key, value) {
            this.self.emit("log", ["__observe", EV_NET_OBSERVE_NEW_PROPERTY, arguments]);

            this.self.objects[id].__observe(key, value);
            ++this.self.objects_v[id];

            this.self.emit("log", ["__observe-emit", EV_NET_UPDATE]);

            this.self.emit(EV_NET_UPDATE);
        },
        __change: function (id, key, value) {
            this.self.emit("log", ["__change", EV_NET_CHANGE, arguments]);

            this.self.objects[id].__set(key, value);
            ++this.self.objects_v[id];

            this.self.emit("log", ["__change-emit", EV_NET_UPDATE]);

            this.self.emit(EV_NET_UPDATE);
        },
        __back_sync: function (objects, versions) {
            this.self.emit("log", ["__back_sync", EV_NET_SYNCHRONIZE_BACK, arguments]);

            this.self.objects_v = versions;

            var id,
                obj;

            for (id in objects) {
                obj = new Observer(objects[id], null);
                obj.observer(this.self.observe(id, obj, true));
            }

            this.self.emit(EV_READY);
            this.self.remove_listeners(EV_READY);
        },
        __go_sync: function () {
            this.self.emit("log", ["__go_sync", EV_NET_SYNCHRONIZE, arguments]);

            this.self.__net_emit(this.socket, {event: EV_NET_SYNCHRONIZE_BACK, objects: this.self.objects, versions: this.self.objects_v});
        },
        __new_object: function (id, value) {
            this.self.emit("log", ["__go_sync", EV_NET_OBSERVE_NEW_OBJECT, arguments]);

            var obj = new Observer(value, null);

            obj.observer(this.self.observe(id, obj, true));

            this.self.emit("log", ["__new_object-emit", EV_NET_UPDATE]);

            this.self.emit(EV_NET_UPDATE);
        },
        observe: function (id, object, prevent_emit) {
            this.objects[id] = object;
            this.objects_v[id] = 1;
            if (!prevent_emit) {
                this.emit("log", ["observe-emit", EV_NET_OBSERVE_NEW_OBJECT]);
                this.__net_broadcast({event: EV_NET_OBSERVE_NEW_OBJECT, id: id, object: object});
            }


            return function (event, key, value) {
                switch (event) {
                case "observe":
                    this.emit("log", ["observe-emit", EV_NET_OBSERVE_NEW_PROPERTY, key]);

                    this.__net_broadcast({event: EV_NET_OBSERVE_NEW_PROPERTY, id: id, key: key});
                    break;
                case "change":
                    this.emit("log", ["observe-emit", EV_NET_CHANGE, key]);

                    this.__net_broadcast({event: EV_NET_CHANGE, id: id, key: key, value: value});
                    break;
                }
                this.emit(EV_UPDATE);
            }.bind(this);
        },
        get_object: function (id) {
            return this.objects[id];
        }
    });

    ObjectSync.Abstract({
        "__net_bind" : ["socket", "__change", "__new_object", "__observe", "__go_sync", "__back_sync"],
        "__net_emit": ["socket", "event", "id", "key", "value"],
        "__net_broadcast": ["socket", "event", "id", "key", "value"]
    });

    exports.ObjectSync = ObjectSync;

    exports.EV_NET_CHANGE = EV_NET_CHANGE;
    exports.EV_NET_OBSERVE_NEW_PROPERTY = EV_NET_OBSERVE_NEW_PROPERTY;
    exports.EV_NET_OBSERVE_NEW_OBJECT = EV_NET_OBSERVE_NEW_OBJECT;
    exports.EV_NET_SYNCHRONIZE = EV_NET_SYNCHRONIZE;
    exports.EV_NET_SYNCHRONIZE_BACK = EV_NET_SYNCHRONIZE_BACK;

    exports.EV_READY = EV_READY;
    exports.EV_NET_UPDATE = EV_NET_UPDATE;
    exports.EV_UPDATE = EV_UPDATE;

}(module.exports));


