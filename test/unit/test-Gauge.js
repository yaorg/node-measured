var common = require('../common');
var assert = require('assert');

(function testHasName() {
  var gauge = new common.betterMetrics.Gauge('temperature');
  assert.equal(gauge.name, 'temperature');
})();

(function testReadsValueFromFunction() {
  var i = 0;

  var gauge = new common.betterMetrics.Gauge(null, function() {
    return i++;
  });

  assert.equal(gauge.toJSON()['value'], 0);
  assert.equal(gauge.toJSON()['value'], 1);
})();
