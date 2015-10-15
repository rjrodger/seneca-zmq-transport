/* jshint node: true */
'use strict';

var Lab = require('lab');

var lab = exports.lab = Lab.script();
var describe = lab.describe;
var it = lab.it;

var test = require('seneca-transport-test');

describe('zmq-transport', function () {
  it('happy-any', function (fin) {
    test.foo_test('', require, fin, 'zmq', -6379);
  });

  it('happy-pin', function (fin) {
    test.foo_pintest('', require, fin, 'zmq', -6379);
  });
});
