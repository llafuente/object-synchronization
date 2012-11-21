(function (exports) {
    "use strict";

    exports.Observer = require("./lib/observer.js").Observer;
    exports.Sync = require("./lib/sync.js").Sync;
    exports.SyncSocketIO = require("./lib/sync_socket_io.js").SyncSocketIO;
    exports.SyncTCP = require("./lib/sync_tcp.js").SyncTCP;

}(module.exports));