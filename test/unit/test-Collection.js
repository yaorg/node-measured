var common = require('../common');
var test   = require('utest');
var assert = require('assert');

test('Collection', {
  'with two counters': function() {
    var collection = new common.betterMetrics.Collection('foo.bar.');
    var a = collection.counter('a');
    var b = collection.counter('b');

    a.inc(3);
    b.inc(5);

    assert.deepEqual(collection.toJSON(), {
      'foo.bar.a': {
        count: 3,
      },
      'foo.bar.b': {
        count: 5,
      },
    });
  },
});
