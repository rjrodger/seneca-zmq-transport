/* Copyright (c) 2014 Richard Rodger */
"use strict";

// mocha zmq-transport.test.js

var test = require('seneca-transport-test')


describe('zmq-transport', function() {

    it('happy-zmq', function( fin ) {
        test.foo_test( 'zmq-transport', require, fin, 'zmq', 10201 )
    })
    it('happy-pin', function( fin ) {
        test.foo_pintest( 'zmq-transport', require, fin, 'zmq', 10201 )
    })

})
