(function (exports) {
    "use strict";

    var defineProperty = Object.defineProperty,
        hasOwnProperty = Object.hasOwnProperty,
        Observer,
        console_log = function() {};
        //console_log = console.log;

    Observer = function(ob, callback) {
        var obj = Object.create(null),
            cbk = callback || null;

        defineProperty(this, "observer", {
            value: function(new_callback) {
                cbk = new_callback || null;
            },
            writable : false,
            enumerable : false,
            configurable : false
        });

        defineProperty(this, "__observe", {
            value: function(key) {
                defineProperty(this, key, {
                    set: function(val) {
                        obj[key] = val;

                        console_log("set -> ", key, arguments, obj);
                        if (cbk) {
                            console_log("change cbk");
                            cbk("change", key, val);
                        }
                    },
                    get: function() {
                        return obj[key];
                    },
                    enumerable : true,
                    configurable : false
                });
            },
            writable : false,
            enumerable : false,
            configurable : false
        });

        defineProperty(this, "observe", {
            value: function(key) {
                console_log("observe", this, key);
                if(cbk) {
                    cbk("observe", key);
                }
                this.__observe(key);
            },
            writable : false,
            enumerable : false,
            configurable : false
        });

        defineProperty(this, "__set", {
            value: function(key, value) {
                obj[key] = value;
            },
            writable : false,
            enumerable : false,
            configurable : false
        });

        var i;
        for(i in ob) {
            obj[i] = ob[i];
            this.observe(i);
        }

        return this;
    };

    exports.Observer = Observer;
}(module.exports));