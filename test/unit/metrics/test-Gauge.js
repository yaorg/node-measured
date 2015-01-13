/*global describe, it, beforeEach, afterEach*/
'use strict';

var common = require('../../common');
var assert = require('assert');

describe('Gauge', function () {
  it('reads value from function', function () {
    var i = 0;

    var gauge = new common.measured.Gauge(function () {
      return i++;
    });

    assert.equal(gauge.toJSON(), 0);
    assert.equal(gauge.toJSON(), 1);
  });
});
