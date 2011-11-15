var common = require('../../common');
var test   = require('utest');
var assert = require('assert');

test('Timer', {
  // Still need to rewrite the Histogram code, will add better tests then
  'some shit': function() {
    var timer = new common.betterMetrics.Timer();

    timer.meter.start = function() {};

    timer.update(10);

    var json = timer.toJSON();
    assert.equal(json['duration.min'], 10);
    assert.equal(json['rate.count'], 1);
  },
});

