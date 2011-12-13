var common = require('../../common');
var test   = require('utest');
var assert = require('assert');

test('Gauge', {
  'reads value from function': function() {
    var i = 0;

    var gauge = new common.betterMetrics.Gauge(function() {
      return i++;
    });

    assert.equal(gauge.toJSON(), 0);
    assert.equal(gauge.toJSON(), 1);
  },
});
