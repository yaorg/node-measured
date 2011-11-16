var common = require('../../common');
var test   = require('utest');
var assert = require('assert');
var ExponentiallyDecayingSample = common.betterMetrics.ExponentiallyDecayingSample;

test('ExponentiallyDecayingSample', {
  'returns an empty array for toJSON by default': function() {
    var sample = new ExponentiallyDecayingSample();
    assert.deepEqual(sample.toJSON(), []);
  },
});

var sample;
test('ExponentiallyDecayingSample#update', {
  before: function() {
    sample = new ExponentiallyDecayingSample({
      size: 2,
      random: function() {
        return 1;
      }
    });
  },

  'can add one item': function() {
    sample.update('a');

    assert.deepEqual(sample.toJSON(), ['a']);
  },

  'sorts items according to priority ascending': function() {
    sample.update('a', Date.now() + 0);
    sample.update('b', Date.now() + 1000);

    assert.deepEqual(sample.toJSON(), ['a', 'b']);
  },

  'pops items with lowest priority': function() {
    sample.update('a', Date.now() + 0);
    sample.update('b', Date.now() + 1000);
    sample.update('c', Date.now() + 2000);

    assert.deepEqual(sample.toJSON(), ['b', 'c']);
  },

  'items with too low of a priority do not make it in': function() {
    sample.update('a', Date.now() + 1000);
    sample.update('b', Date.now() + 2000);
    sample.update('c', Date.now() + 0);

    assert.deepEqual(sample.toJSON(), ['a', 'b']);
  },
});
