var common    = require('../../common');
var test      = require('utest');
var assert    = require('assert');
var sinon     = require('sinon');
var Histogram = common.betterMetrics.Histogram;
var EDS       = common.betterMetrics.ExponentiallyDecayingSample;

var histogram;
test('Histogram', {
  before: function() {
    histogram = new Histogram;
  },

  'all values are null in the beginning': function() {
    var json = histogram.toJSON();
    assert.strictEqual(json['min'], null);
    assert.strictEqual(json['max'], null);
    assert.strictEqual(json['sum'], 0);
    assert.strictEqual(json['variance'], null);
    assert.strictEqual(json['mean'], 0);
    assert.strictEqual(json['stddev'], 0);
    assert.strictEqual(json['count'], 0);
    assert.strictEqual(json['median'], 0);
    assert.strictEqual(json['p75'], 0);
    assert.strictEqual(json['p95'], 0);
    assert.strictEqual(json['p99'], 0);
    assert.strictEqual(json['p999'], 0);
  },
});

var histogram;
var sample;
test('Histogram#update', {
  before: function() {
    sample    = sinon.stub(new EDS);
    histogram = new Histogram({sample: sample});
  },

  'updates underlaying sample': function() {
    histogram.update(5);
    assert.ok(sample.update.calledWith(5));
  },

  'keeps track of min': function() {
    histogram.update(5);
    histogram.update(3);
    histogram.update(6);

    assert.equal(histogram.toJSON().min, 3);
  },

  'keeps track of max': function() {
    histogram.update(5);
    histogram.update(9);
    histogram.update(3);

    assert.equal(histogram.toJSON().max, 9);
  },

  'keeps track of sum': function() {
    histogram.update(5);
    histogram.update(1);
    histogram.update(12);

    assert.equal(histogram.toJSON().sum, 18);
  },

  'keeps track of mean': function() {
    histogram.update(5);
    histogram.update(1);
    histogram.update(12);

    assert.equal(histogram.toJSON().mean, 6);
  },

  'keeps track of variance (example without variance)': function() {
    histogram.update(5);
    histogram.update(5);
    histogram.update(5);

    assert.equal(histogram.toJSON().variance, 0);
  },

  'keeps track of variance (example with variance)': function() {
    histogram.update(1);
    histogram.update(2);
    histogram.update(3);
    histogram.update(4);

    assert.equal(histogram.toJSON().variance.toFixed(3), '1.667');
  },
});
