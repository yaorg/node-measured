'use strict';

var Histogram = require('./Histogram');
var Meter     = require('./Meter');
var Stopwatch = require('../util/Stopwatch');

function Timer(properties) {
  properties = properties || {};

  this._meter     = properties.meter || new Meter();
  this._histogram = properties.histogram || new Histogram();
  this._getTime   = properties.getTime;
}

Timer.prototype.start = function () {
  var self  = this;
  var watch = new Stopwatch({getTime: this._getTime});

  watch.once('end', function (elapsed) {
    self.update(elapsed);
  });

  return watch;
};

Timer.prototype.update = function (value) {
  this._meter.mark();
  this._histogram.update(value);
};


Timer.prototype.reset = function () {
  this._meter.reset();
  this._histogram.reset();
};

Timer.prototype.end = function () {
  this._meter.end();
};

Timer.prototype.ref = function () {
  this._meter.ref();
};

Timer.prototype.unref = function () {
  this._meter.unref();
};

Timer.prototype.toJSON = function () {
  return {
    meter : this._meter.toJSON(),
    histogram : this._histogram.toJSON()
  };
};

module.exports = Timer;
