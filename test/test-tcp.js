(function () {
    "use strict";

    var tap = require("tap"),
        test = tap.test,
        SyncTCP = require("../index.js").SyncTCP,
        Observer = require("../index.js").Observer,
    // test
        client,
        server,

        obj = new Observer({
            prop1: null,
            prop2: null
        }, null),

        server_objects = new SyncTCP(),
        client_objects = new SyncTCP(),
        client_socket,
        debug = function() {}; //console.log;

    server_objects.on("log", function() {
        console.log("#<", arguments);
    });
    client_objects.on("log", function() {
        console.log("#>", arguments);
    });

    // attach SyncTCP to the observer
    obj.observer( server_objects.observe(1, obj) );

    obj.prop1 = "first";
    obj.id = "do-not-sync";

    function close_connections() {
        server.close();
        client.destroy();
    }

    function init_client(port, on_ready) {
        debug("init_client");
        client = new require('net').createConnection(port, '127.0.0.1');

        client.on('connect', function() { //'connect' listener
            debug('client connected');
            client_objects.add_socket(client, true);
            client_objects.on("ready", function() {
                debug("xxxx");
                on_ready();
            });
        });

        // Add a 'close' event handler for the client socket
        client.on('close', function() {
            debug('Connection closed');
        });

        client.on('error', function(e) {
            debug('WTF!!', arguments);
        });
    }

    function init_server(port, on_ready) {
        debug("init_server");
        server = require('net').createServer();
        server.listen(port, '127.0.0.1', function() {
            debug('server bound');
        });
        server.on('connection', function(c) { //'connection' listener
            debug('server connected');
            c.on('end', function() {
                debug('server disconnected');
            });
            server_objects.add_socket(c);
        })
        server.on('listening', function() {
            debug('listening');
            on_ready(port);
        });
        //server_objects.add_socket(server);

    }


    test("init", function (t) {
        debug("start!");
        var port = 8080;
        init_server(port, function(port) {
            init_client(port, function() {
                t.end();
            });
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


