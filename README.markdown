# object-syncronization
==========

## Introduction
============

Object synchronization across network (using socket.io atm)


## Observer
============

while Object.observe arrive... we have to use this to setup an object that listen to itself an emit the proper changes
Note: this is not a shim of Object.observe.

* new Observer(Object object);
* .observer(Function callback);
* .observe(String property);
* .__observe(String property); // internal, do not trigger the callback
* .__set(String property, Mixed value); // internal, do not trigger the callback

Example:

``` js
    var obj = new Observer({
        test: true
    }, function() {
        console.log(arguments);
    }); // -> { '0': 'observe', '1': 'test' }

    console.log(obj.test); // true
    obj.test = false; // { '0': 'change', '1': 'test', '2': false }
    console.log(obj.test); // false

```

## Sync
============

* new SyncSocketIO()
* .add_socket(SocketIO socket, Boolean sync_now)
* .get_object(String id)
* .observe(String id, Object object, Boolean prevent_emit)

for the example check [/test/test.js](https://github.com/llafuente/object-synchronization/blob/master/test/test.js)

## Install
==========

With [npm](http://npmjs.org) do:

```

npm install object-synchronization

```

## license
==========

MIT.
