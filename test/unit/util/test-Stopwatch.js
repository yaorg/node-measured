/*global describe, it, beforeEach, afterEach*/
'use strict';

var common    = require('../../common');
var assert    = require('assert');
var Stopwatch = common.measured.Stopwatch;
var sinon     = require('sinon');

describe('Stopwatch', function () {
  var watch;
  var clock;
  beforeEach(function () {
    clock = sinon.useFakeTimers();
    watch = new Stopwatch({getTime: function () {
      return new Date().getTime();
    }});
  });

  afterEach(function () {
    clock.restore();
  });

  it('returns time on end', function () {
    clock.tick(100);

    var elapsed = watch.end();
    assert.equal(elapsed, 100);
  });

  it('emits time on end', function () {
    clock.tick(20);

    var time;
    watch.on('end', function (_time) {
      time = _time;
    });

    watch.end();

    assert.equal(time, 20);
  });

  it('becomes useless after being ended once', function () {
    clock.tick(20);

    var time;
    watch.on('end', function (_time) {
      time = _time;
    });

    assert.equal(watch.end(), 20);
    assert.equal(time, 20);

    time = null;
    assert.equal(watch.end(), undefined);
    assert.equal(time, null);
  });
});
