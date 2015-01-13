/*global describe, it, beforeEach, afterEach*/
'use strict';

var common = require('../../common');
var assert = require('assert');
var EDS    = common.measured.ExponentiallyDecayingSample;
var units  = common.measured.units;

describe('ExponentiallyDecayingSample#toSortedArray', function () {
  var sample;
  beforeEach(function () {
    sample = new EDS({
      size: 3,
      random: function () {
        return 1;
      }
    });
  });

  it('returns an empty array by default', function () {
    assert.deepEqual(sample.toSortedArray(), []);
  });

  it('is always sorted by priority', function () {
    sample.update('a', Date.now() + 3000);
    sample.update('b', Date.now() + 2000);
    sample.update('c', Date.now());

    assert.deepEqual(sample.toSortedArray(), ['c', 'b', 'a']);
  });
});

describe('ExponentiallyDecayingSample#toArray', function () {
  var sample;
  beforeEach(function () {
    sample = new EDS({
      size: 3,
      random: function () {
        return 1;
      }
    });
  });

  it('returns an empty array by default', function () {
    assert.deepEqual(sample.toArray(), []);
  });

  it('may return an unsorted array', function () {
    sample.update('a', Date.now() + 3000);
    sample.update('b', Date.now() + 2000);
    sample.update('c', Date.now());

    assert.deepEqual(sample.toArray(), ['c', 'a', 'b']);
  });
});

describe('ExponentiallyDecayingSample#update', function () {
  var sample;
  beforeEach(function () {
    sample = new EDS({
      size: 2,
      random: function () {
        return 1;
      }
    });
  });

  it('can add one item', function () {
    sample.update('a');

    assert.deepEqual(sample.toSortedArray(), ['a']);
  });

  it('sorts items according to priority ascending', function () {
    sample.update('a', Date.now());
    sample.update('b', Date.now() + 1000);

    assert.deepEqual(sample.toSortedArray(), ['a', 'b']);
  });

  it('pops items with lowest priority', function () {
    sample.update('a', Date.now());
    sample.update('b', Date.now() + 1000);
    sample.update('c', Date.now() + 2000);

    assert.deepEqual(sample.toSortedArray(), ['b', 'c']);
  });

  it('items with too low of a priority do not make it in', function () {
    sample.update('a', Date.now() + 1000);
    sample.update('b', Date.now() + 2000);
    sample.update('c', Date.now());

    assert.deepEqual(sample.toSortedArray(), ['a', 'b']);
  });
});

describe('ExponentiallyDecayingSample#_rescale', function () {
  var sample;
  beforeEach(function () {
    sample = new EDS({
      size: 2,
      random: function () {
        return 1;
      }
    });
  });

  it('works as expected', function () {
    sample.update('a', Date.now() + 50 * units.MINUTES);
    sample.update('b', Date.now() + 55 * units.MINUTES);

    var elements = sample._elements.toSortedArray();
    assert.ok(elements[0].priority > 1000);
    assert.ok(elements[1].priority > 1000);

    sample._rescale(Date.now() + 60 * units.MINUTES);

    elements = sample._elements.toSortedArray();
    assert.ok(elements[0].priority < 1);
    assert.ok(elements[0].priority > 0);
    assert.ok(elements[1].priority < 1);
    assert.ok(elements[1].priority > 0);
  });
});
