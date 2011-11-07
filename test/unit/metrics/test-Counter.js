var common = require('../../common');
var assert = require('assert');

(function testHasInitialValueOf0() {
  var counter = new common.betterMetrics.Counter();
  var json    = counter.toJSON();

  assert.deepEqual(json, {count: 0});
})();

(function testInc() {
  var counter = new common.betterMetrics.Counter();

  counter.inc(5);
  assert.equal(counter.toJSON()['count'], 5);

  counter.inc(3);
  assert.equal(counter.toJSON()['count'], 8);
})();

(function testIncDefaultsToOne() {
  var counter = new common.betterMetrics.Counter();

  counter.inc();
  assert.equal(counter.toJSON()['count'], 1);

  counter.inc();
  assert.equal(counter.toJSON()['count'], 2);
})();

(function testDec() {
  var counter = new common.betterMetrics.Counter();

  counter.dec(3);
  assert.equal(counter.toJSON()['count'], -3);

  counter.dec(2);
  assert.equal(counter.toJSON()['count'], -5);
})();

(function testDecDefaultsToMinusOne() {
  var counter = new common.betterMetrics.Counter();

  counter.dec();
  assert.equal(counter.toJSON()['count'], -1);

  counter.dec();
  assert.equal(counter.toJSON()['count'], -2);
})();

(function testClearCounter() {
  var counter = new common.betterMetrics.Counter();

  counter.inc(23);
  assert.equal(counter.toJSON()['count'], 23);

  counter.clear();
  assert.equal(counter.toJSON()['count'], 0);
})();
