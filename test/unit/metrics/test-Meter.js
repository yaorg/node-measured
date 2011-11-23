var common = require('../../common');
var test   = require('utest');
var assert = require('assert');
var sinon  = require('sinon');
var units  = common.betterMetrics.units;

var meter;
test('Meter', {
  before: function() {
    meter = new common.betterMetrics.Meter();
    meter.start = function() {};
  },

  'all values are correctly initialized': function() {
    assert.deepEqual(meter.toJSON(), {
      mean           : 0,
      count          : 0,
      snapshot       : null,
      '1MinuteRate'  : 0,
      '5MinuteRate'  : 0,
      '15MinuteRate' : 0,
    });
  },

  'decay over two marks and ticks': function() {
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

  'mean rate': function() {
    var clock = sinon.useFakeTimers();

    meter.mark(5);
    clock.tick(5000);

    var json = meter.toJSON();
    assert.equal(json['mean'], 1);

    clock.tick(5000);

    json = meter.toJSON();
    assert.equal(json['mean'], 0.5);

    clock.restore();
  },

  'snapshot is a sum': function() {
    meter.mark(1);
    meter.mark(2);
    meter.mark(3);

    assert.equal(meter.toJSON()['snapshot'], 6);
  },

  'snapshot resets by reading it': function() {
    meter.mark(1);
    meter.mark(2);
    meter.mark(3);

    meter.toJSON();
    assert.strictEqual(meter.toJSON()['snapshot'], null);
  },
});
