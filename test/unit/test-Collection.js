/*global describe, it, beforeEach, afterEach*/
'use strict';

var common = require('../common');
var assert = require('assert');

describe('Collection', function () {
  var collection;
  beforeEach(function () {
    collection = common.measured.createCollection();
  });

  it('with two counters', function () {
    collection = new common.measured.Collection('counters');
    var a = collection.counter('a');
    var b = collection.counter('b');

    a.inc(3);
    b.inc(5);

    assert.deepEqual(collection.toJSON(), {
      'counters': {
        'a': 3,
        'b': 5,
      }
    });
  });

  it('returns same metric object when given the same name', function () {
    var a1 = collection.counter('a');
    var a2 = collection.counter('a');

    assert.strictEqual(a1, a2);
  });

  it('throws exception when creating a metric without name', function () {
    assert.throws(function () {
      collection.counter();
    }, /Collection\.NoMetricName/);
  });
});
