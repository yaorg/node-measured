var common = require('../../common');
var assert = require('assert');

// Still need to rewrite the Histogram code, will add better tests then
(function testDoesSomethingThatLooksRight() {
  var timer = new common.betterMetrics.Timer();

  timer.meter.start = function() {};

  timer.update(10);

  var json = timer.toJSON();
  assert.equal(json['duration.min'], 10);
  assert.equal(json['rate.count'], 1);
})();
