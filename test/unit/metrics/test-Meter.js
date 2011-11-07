var common = require('../../common');
var assert = require('assert');
var units = common.betterMetrics.units;

var meter = new common.betterMetrics.Meter(null, 1 * units.SECONDS);

// Do not let the meter start, we don't want timers running here
meter.start = function() {};

(function testAllValuesAre0InTheBeginning() {
  assert.deepEqual(meter.toJSON(), {
    mean           : 0,
    count          : 0,
    '1MinuteRate'  : 0,
    '5MinuteRate'  : 0,
    '15MinuteRate' : 0,
  });
})();

meter.mark(5);
meter._tick();

(function testValuesAfterOneTick() {
  var json = meter.toJSON();
  assert.equal(json['count'], 5);
  assert.equal(json['1MinuteRate'], 5);
  assert.equal(json['5MinuteRate'], 5);
  assert.equal(json['15MinuteRate'], 5);
})();

meter.mark(10);
meter._tick();

(function testValuesAfterOneTick() {
  var json = meter.toJSON();
  assert.equal(json['count'], 15);
  assert.equal(json['1MinuteRate'].toFixed(3), '5.083');
  assert.equal(json['5MinuteRate'].toFixed(3), '5.017');
  assert.equal(json['15MinuteRate'].toFixed(3), '5.006');
})();

