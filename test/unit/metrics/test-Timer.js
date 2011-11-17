var common    = require('../../common');
var test      = require('utest');
var assert    = require('assert');
var sinon     = require('sinon');
var Timer     = common.betterMetrics.Timer;
var Histogram = common.betterMetrics.Histogram;
var Meter     = common.betterMetrics.Meter;

var timer;
var meter;
var histogram;
test('Timer', {
  before: function() {
    meter     = sinon.stub(new Meter);
    histogram = sinon.stub(new Histogram);

    timer = new Timer({
      meter     : meter,
      histogram : histogram,
    });
  },

  '#update() marks the meter': function() {
    timer.update(5);

    assert.ok(meter.mark.calledOnce);
  },

  '#update() updates the histogram': function() {
    timer.update(5);

    assert.ok(histogram.update.calledWith(5));
  },

  '#toJSON() contains meter info': function() {
    meter.toJSON.returns({a: 1, b: 2});
    var json = timer.toJSON();

    assert.equal(json['meter.a'], 1);
    assert.equal(json['meter.b'], 2);
  },

  '#toJSON() contains histogram info': function() {
    histogram.toJSON.returns({a: 1, b: 2});
    var json = timer.toJSON();

    assert.equal(json['histogram.a'], 1);
    assert.equal(json['histogram.b'], 2);
  },
});
