var common = require('../../common');
var test   = require('utest');
var assert = require('assert');

var counter;
test('Counter', {
  before: function() {
    counter = new common.betterMetrics.Counter();
  },

  'has initial value of 0': function() {
    var json    = counter.toJSON();
    assert.deepEqual(json, {count: 0});
  },

  '#inc works incrementally': function() {
    counter.inc(5);
    assert.equal(counter.toJSON()['count'], 5);

    counter.inc(3);
    assert.equal(counter.toJSON()['count'], 8);
  },

  '#inc defaults to 1': function() {
    counter.inc();
    assert.equal(counter.toJSON()['count'], 1);

    counter.inc();
    assert.equal(counter.toJSON()['count'], 2);
  },

  '#dec works incrementally': function() {
    counter.dec(3);
    assert.equal(counter.toJSON()['count'], -3);

    counter.dec(2);
    assert.equal(counter.toJSON()['count'], -5);
  },

  '#dec defaults to 1': function() {
    counter.dec();
    assert.equal(counter.toJSON()['count'], -1);

    counter.dec();
    assert.equal(counter.toJSON()['count'], -2);
  },

  '#clear works': function() {
    counter.inc(23);
    assert.equal(counter.toJSON()['count'], 23);

    counter.clear();
    assert.equal(counter.toJSON()['count'], 0);
  }
});
