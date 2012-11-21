(function (exports) {
    "use strict";

    var Class = require("node-class").Class,
        Events = require("node-class").Events,
        Observer,
        EV_NET_CHANGE = "syncsio:change",
        EV_NET_OBSERVE_NEW_PROPERTY = "syncsio:observe-property",
        EV_NET_OBSERVE_NEW_OBJECT = "syncsio:observe-new-object",
        EV_NET_SYNCHRONIZE= "syncsio:sync",
        EV_NET_SYNCHRONIZE_BACK= "syncsio:sync-back",

        EV_READY = "ready",
        EV_NET_UPDATE = "netupdate",
        EV_UPDATE = "update",
        console_log = function() {};
        //console_log = console.log;

    Observer = require("./observer.js").Observer;

    var ObjectSync = new Class("ObjectSync", {
        sockets: [],
        objects: {},
        objects_v: {},
    });

    ObjectSync.extends(Events);

    ObjectSync.implements({
        __construct: function() {
            this.parent();
        },
        add_socket: function(socket, sync_now) {
            sync_now = sync_now || false;

            var __change = this.__change.bind({self: this, socket: socket}),
                __new_object = this.__new_object.bind({self: this, socket: socket}),
                __observe = this.__observe.bind({self: this, socket: socket}),
                __go_sync = this.__go_sync.bind({self: this, socket: socket}),
                __back_sync = this.__back_sync.bind({self: this, socket: socket});

            this.__net_bind(socket, __change, __new_object, __observe, __go_sync, __back_sync);

            if(sync_now) {
                this.__net_emit(socket, {event: EV_NET_SYNCHRONIZE});
            }

            this.sockets.push(socket);
        },
        __observe: function(id, key, value) {
            console_log("recieve: ", EV_NET_OBSERVE_NEW_PROPERTY, arguments );
            this.self.objects[id].__observe(key, value);
            ++this.self.objects_v[id];

            console.log("iemit", EV_NET_UPDATE);
            this.self.emit(EV_NET_UPDATE);
        },
        __change: function(id, key, value) {
            console_log("recieve: ", EV_NET_CHANGE, arguments );
            this.self.objects[id].__set(key, value);
            ++this.self.objects_v[id];

            console.log("iemit", EV_NET_UPDATE);
            this.self.emit(EV_NET_UPDATE);
        },
        __back_sync: function(objects, versions) {
            console_log("recieve: ", EV_NET_SYNCHRONIZE_BACK, arguments );
            this.self.objects_v = versions;

            var id,
                obj;

            for(id in objects) {
                obj = new Observer(objects[id], null);
                obj.observer( this.self.observe(id, obj, true));
            }

            this.self.emit(EV_READY);
            this.self.remove_listeners(EV_READY);
        },
        __go_sync: function() {
            console_log("recieve: ", EV_NET_SYNCHRONIZE, arguments );

            this.self.__net_emit(this.socket, {event: EV_NET_SYNCHRONIZE_BACK, objects: this.self.objects, versions: this.self.objects_v});
        },
        __new_object: function(id, value) {
            console_log("recieve: ", EV_NET_OBSERVE_NEW_OBJECT, arguments);

            var obj = new Observer(value, null);

            obj.observer( this.self.observe(id, obj, true) );

            console.log("iemit", EV_NET_UPDATE);
            this.self.emit(EV_NET_UPDATE);
        },
        observe: function(id, object, prevent_emit) {
            this.objects[id] = object;
            this.objects_v[id] = 1;
            if(!prevent_emit) {
                console.log("emit: ", EV_NET_OBSERVE_NEW_OBJECT);
                this.__net_broadcast({event: EV_NET_OBSERVE_NEW_OBJECT, id: id, object: object});
            }


            return function(event, key, value) {
                switch(event) {
                    case "observe":
                        //this.object.__set(key, value);
                        console_log("emit", EV_NET_OBSERVE_NEW_PROPERTY, key);
                        this.__net_broadcast({event: EV_NET_OBSERVE_NEW_PROPERTY, id: id, key: key});
                    break;
                    case "change":
                        //this.object.__set(key, value);
                        console_log("emit", EV_NET_CHANGE, key, value);
                        this.__net_broadcast({event: EV_NET_CHANGE, id: id, key: key, value: value});
                    break;
                }
                this.emit(EV_UPDATE);
            }.bind(this);
        },
        get_object: function(id) {
            return this.objects[id];
        },
    });

    ObjectSync.abstract({
        "__net_bind" : ["socket", "__change", "__new_object", "__observe", "__go_sync", "__back_sync"],
        "__net_emit": ["socket", "event", "id", "key", "value"],
        "__net_broadcast": ["socket", "event", "id", "key", "value"]
    });

    exports.ObjectSync = ObjectSync;

    exports.EV_NET_CHANGE = EV_NET_CHANGE;
    exports.EV_NET_OBSERVE_NEW_PROPERTY = EV_NET_OBSERVE_NEW_PROPERTY;
    exports.EV_NET_OBSERVE_NEW_OBJECT = EV_NET_OBSERVE_NEW_OBJECT;
    exports.EV_NET_SYNCHRONIZE= EV_NET_SYNCHRONIZE;
    exports.EV_NET_SYNCHRONIZE_BACK= EV_NET_SYNCHRONIZE_BACK;

    exports.EV_READY = EV_READY;
    exports.EV_NET_UPDATE = EV_NET_UPDATE;
    exports.EV_UPDATE = EV_UPDATE;

}(module.exports));

