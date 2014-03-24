var units = require('../util/units');
var EWMA  = require('../util/ExponentiallyMovingWeightedAverage');
var Stopwatch = require('../util/Stopwatch');

module.exports = Meter;
function Meter(properties) {
  properties = properties || {};

  this._rateUnit     = properties.rateUnit || Meter.RATE_UNIT;
  this._tickInterval = properties.tickInterval || Meter.TICK_INTERVAL;
  if (properties.getTime) this._getTime = properties.getTime;

  this._m1Rate     = new EWMA(1 * units.MINUTES, this._tickInterval);
  this._m5Rate     = new EWMA(5 * units.MINUTES, this._tickInterval);
  this._m15Rate    = new EWMA(15 * units.MINUTES, this._tickInterval);
  this._count      = 0;
  this._currentSum = 0;
  this._startTime = this._getTime();
  this._lastToJSON = this._getTime();
  this._interval = setInterval(this._tick.bind(this), Meter.TICK_INTERVAL);
}

Meter.RATE_UNIT     = units.SECONDS;
Meter.TICK_INTERVAL = 5 * units.SECONDS;

Meter.prototype.mark = function(n) {
  if (!this._interval) this.start();

  n = n || 1;

  this._count += n;
  this._currentSum += n;
  this._m1Rate.update(n);
  this._m5Rate.update(n);
  this._m15Rate.update(n);
};

Meter.prototype.start = function() {
};

Meter.prototype.end = function() {
  clearInterval(this._interval);
  this._interval = null;
};

Meter.prototype.ref = function() {
  if (this._interval && this._interval.ref) {
    this._interval.ref();
  }
};

Meter.prototype.unref = function() {
  if (this._interval && this._interval.unref) {
    this._interval.unref();
  }
};

Meter.prototype._tick = function() {
  this._m1Rate.tick();
  this._m5Rate.tick();
  this._m15Rate.tick();
};

Meter.prototype.reset = function() {
  this.end();
  this.constructor.call(this);
};

Meter.prototype.meanRate = function() {
  if (this._count === 0) return 0;

  var elapsed = this._getTime() - this._startTime;
  return this._count / elapsed * this._rateUnit;
};

Meter.prototype.currentRate = function() {
  var currentSum  = this._currentSum;
  var duration    = this._getTime() - this._lastToJSON;
  var currentRate = currentSum / duration * this._rateUnit;

  this._currentSum = 0;
  this._lastToJSON = this._getTime();

  // currentRate could be NaN if duration was 0, so fix that
  return currentRate || 0;
};

Meter.prototype.toJSON = function() {
  return {
    'mean'         : this.meanRate(),
    'count'        : this._count,
    'currentRate'  : this.currentRate(),
    '1MinuteRate'  : this._m1Rate.rate(this._rateUnit),
    '5MinuteRate'  : this._m5Rate.rate(this._rateUnit),
    '15MinuteRate' : this._m15Rate.rate(this._rateUnit),
  };
};

Meter.prototype._getTime = function() {
  if (!process.hrtime) return Date.now();

  var hrtime = process.hrtime();
  return hrtime[0] * 1000 + hrtime[1] / (1000 * 1000);
};
