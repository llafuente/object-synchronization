(function () {
    "use strict";

    var tap = require("tap"),
        test = tap.test,
        SyncSocketIO = require("../index.js").SyncSocketIO,
        Observer = require("../index.js").Observer,
    // test
        server = require('socket.io').listen(8080),
        client = require('socket.io-client'),

        obj = new Observer({
            prop1: null,
            prop2: null
        }, null),

        server_objects = new SyncSocketIO(),
        client_objects = new SyncSocketIO(),
        client_socket;



    // attach SyncSocketIO to the observer
    obj.observer( server_objects.observe(1, obj) );

    obj.prop1 = "first";
    obj.id = "do-not-sync";

    console.log(obj);

    server.set("log level", 1);

    function close_connections() {
        //var i, o = client.sockets["http://localhost:8080"];
        //for(i in o) {
           // console.log(i, o[i]);
        //}

        server.server.close();
        client.sockets["http://localhost:8080"].disconnectSync();
    }


    test("init", function (t) {
        server.sockets.on('connection', function (socket) {
            server_objects.add_socket(socket);
        });

        server.server.on('close', function() {
            console.log("server: good bye");
        });

        client_socket = client.connect("http://localhost:8080");
        client_socket.on('connect', function () {
            client_objects.add_socket(client_socket, true);
            client_objects.on("ready", function() {
                t.end();
            });
        });
        client_socket.on('disconnect', function () {
            console.log("client: good bye");
        });

    });

    test("test_obj_synchro", function (t) {
        var ob = client_objects.get_object(1);
            t.equal(ob.prop1, "first", "ob.prop1 = first");
            t.equal(ob.prop2 == null, true, "ob.prop2 = null");
            t.end();
    });

    test("realtime_synchro", function (t) {
        var client_obj = client_objects.get_object(1),
            server_obj = server_objects.get_object(1);

        var changes = 0;
        server_objects.on("netupdate", function() {
            t.equal(server_obj.prop2, "second", "server_obj.prop2 = second");
            server_objects.remove_listeners("netupdate");

            if(++changes == 2) {
                t.end();
            }
        });

        client_objects.on("netupdate", function() {
            t.equal(client_obj.prop1, "third", "client_obj.prop1 = third");
            client_objects.remove_listeners("netupdate");

            if(++changes == 2) {
                t.end();
            }
        });

        client_obj.prop2 = "second";
        server_obj.prop1 = "third";
    });



    test("realtime_observe", function (t) {
        var client_obj = client_objects.get_object(1),
            server_obj = server_objects.get_object(1);

        server_obj.observe("xxx");

        server_objects.on("netupdate", function() {
            t.equal(server_obj.xxx, "fourth", "server_obj.xxx = fourth");
            server_objects.remove_listeners("netupdate");

            t.end();
        });

        client_objects.on("netupdate", function() {
            client_obj.xxx = "fourth";
            client_objects.remove_listeners("netupdate");
        });
    });

    test("realtime_new_object", function (t) {
        var nob = new Observer({
            1337: true,
            7331: false
        }, null);

        client_objects.on("netupdate", function() {
            console.log(client_objects.objects);
            var client_obj = client_objects.get_object(2);
            t.notEqual(client_obj, undefined, "client_obj is undefined");
            if(!client_obj) {
                client_obj = {};
            }
            t.equal(client_obj[1337], true, "client_obj[1337] = true");
            t.equal(client_obj[7331], false, "client_obj[7331] = false");


            t.end();
        });


        nob.observer( server_objects.observe(2, nob) );
    });


    test("close", function (t) {
        close_connections();
        t.end();
    });

}());


