# object-syncronization [![Build Status](https://secure.travis-ci.org/llafuente/object-syncronization.png?branch=master)](http://travis-ci.org/llafuente/object-syncronization)
==========

## Introduction
============

Object synchronization across network using tcp or socket.io
And If you implement three functions, you could have your own transport easily.

The "sockets" setup is in your side see the examples.

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

* new SyncSocketIO() / SyncTCP
* .add_socket(Socket socket, Boolean sync_now)
* .get_object(String id)
* .observe(String id, Object object, Boolean prevent_emit)

SocketIO example [/test/test-socket_io.js](https://github.com/llafuente/object-synchronization/blob/master/test/test-socket_io.js)
TCP example [/test/test-tcp.js](https://github.com/llafuente/object-synchronization/blob/master/test/test-tcp.js)

## Install
==========

With [npm](http://npmjs.org) do:

```

npm install object-synchronization

```

## license
==========

MIT.
