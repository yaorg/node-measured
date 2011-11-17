var common = require('../../common');
var test   = require('utest');
var assert = require('assert');
var units  = common.betterMetrics.units;

var meter;
test('Meter', {
  before: function() {
    meter = new common.betterMetrics.Meter();
  },

  'all values are 0 in the beginning': function() {
    assert.deepEqual(meter.toJSON(), {
      mean           : 0,
      count          : 0,
      '1MinuteRate'  : 0,
      '5MinuteRate'  : 0,
      '15MinuteRate' : 0,
    });
  },

  'decay over two marks and ticks': function() {
    meter.start = function() {};

    meter.mark(5);
    meter._tick();

    var json = meter.toJSON();
    assert.equal(json['count'], 5);
    assert.equal(json['1MinuteRate'].toFixed(4), '0.0800');
    assert.equal(json['5MinuteRate'].toFixed(4), '0.0165');
    assert.equal(json['15MinuteRate'].toFixed(4), '0.0055');

    meter.mark(10);
    meter._tick();

    var json = meter.toJSON();
    assert.equal(json['count'], 15);
    assert.equal(json['1MinuteRate'].toFixed(3), '0.233');
    assert.equal(json['5MinuteRate'].toFixed(3), '0.049');
    assert.equal(json['15MinuteRate'].toFixed(3), '0.017');
  },
});
