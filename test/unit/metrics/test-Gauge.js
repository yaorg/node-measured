var common = require('../../common');
var assert = require('assert');

(function testReadsValueFromFunction() {
  var i = 0;

  var gauge = new common.betterMetrics.Gauge(function() {
    return i++;
  });

  assert.equal(gauge.toJSON()['value'], 0);
  assert.equal(gauge.toJSON()['value'], 1);
})();
