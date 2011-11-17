var common    = require('../../common');
var test      = require('utest');
var assert    = require('assert');
var Stopwatch = common.betterMetrics.Stopwatch;
var sinon     = require('sinon');

var watch;
var clock;
test('Stopwatch', {
  before: function() {
    clock = sinon.useFakeTimers();
    watch = new Stopwatch();
  },

  after: function() {
    clock.restore();
  },

  'returns time on stop': function() {
    clock.tick(10);

    var watch = new Stopwatch();
    clock.tick(100);

    var elapsed = watch.stop();
    assert.equal(elapsed, 100);
  },

  'emits time on stop': function() {
    var watch = new Stopwatch();
    clock.tick(20);

    var time;
    watch.on('stop', function(_time) {
      time = _time;
    });

    watch.stop();

    assert.equal(time, 20);
  },

  'becomes useless after being stopped once': function() {
    var watch = new Stopwatch();
    clock.tick(20);

    var time;
    watch.on('stop', function(_time) {
      time = _time;
    });

    assert.equal(watch.stop(), 20);
    assert.equal(time, 20);

    time = null;
    assert.equal(watch.stop(), undefined);
    assert.equal(time, null);
  },
});
