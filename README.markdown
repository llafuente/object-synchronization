# object-syncronization
==========

## Introduction
============

Object synchronization across network (using socket.io atm)


## Observer
============

while Object.observe arrive... we have to use this to setup an object that listen to itself an emit the proper changes
Note: this is not a shim of Object.observe.

``` js

    var obj = new Observer(<object>);
    Observer.observer(<callback>);
    Observer.observe(<property>);

    Observer.__observe(<property>); // internal, do not trigger the callback
    Observer.__set(<property>, <value>); // internal, do not trigger the callback


    Example:
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

``` js
    // define an object
    obj = new Observer({
        property: true
    }, null),


## Install
==========

With [npm](http://npmjs.org) do:

```

npm install function-enhancements

```

## test (travis-ci ready!)
==========================

```

npm test
// or
cd /test
node test.js

```

## license
==========

MIT.
