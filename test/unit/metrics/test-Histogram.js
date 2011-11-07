var common = require('../../common');
var assert = require('assert');

// Still need to rewrite the Histogram code, will add better tests then
(function testDoesSomethingThatLooksRight() {
  var histogram = new common.betterMetrics.Histogram();

  histogram.update(10);
  histogram.update(40);
  histogram.update(20);
  histogram.update(80);

  var json = histogram.toJSON();
  assert.equal(json['min'], 10);
  assert.equal(json['max'], 80);
  assert.equal(json['mean'].toFixed(4), '37.5000');
  assert.equal(json['stddev'].toFixed(4), '30.9570');
  assert.equal(json['median'], 30);
  assert.equal(json['p75'], 70);
  assert.equal(json['p95'], 80);
  assert.equal(json['p98'], 80);
  assert.equal(json['p99'], 80);
  assert.equal(json['p999'], 80);
})();
