var units = require('../util/units');
var EWMA  = require('../util/ExponentiallyMovingWeightedAverage');

module.exports = Meter;
function Meter(rateUnit, tickInterval) {
  this._rateUnit = rateUnit || Meter.RATE_UNIT;
  this._tickInterval = tickInterval || Meter.TICK_INTERVAL;

  this._m1Rate    = new EWMA(1 * units.MINUTES, this._tickInterval);
  this._m5Rate    = new EWMA(5 * units.MINUTES, this._tickInterval);
  this._m15Rate   = new EWMA(15 * units.MINUTES, this._tickInterval);
  this._count     = 0;
  this._interval  = null;
  this._startTime = null;
}

Meter.RATE_UNIT     = units.SECONDS;
Meter.TICK_INTERVAL = 5 * units.SECONDS;

Meter.prototype.mark = function(n) {
  if (!this._interval) this.start();

  n = n || 1;

  this._count += n;
  this._m1Rate.update(n);
  this._m5Rate.update(n);
  this._m15Rate.update(n);
};

Meter.prototype.start = function() {
  this._interval  = setInterval(this._tick.bind(this), Meter.TICK_INTERVAL);
  this._startTime = Date.now();
};

Meter.prototype.end = function() {
  clearInterval(this._interval);
};

Meter.prototype._tick = function() {
  this._m1Rate.tick();
  this._m5Rate.tick();
  this._m15Rate.tick();
};

Meter.prototype.meanRate = function() {
  if (this._count === 0) return 0;

  var elapsed = Date.now() - this._startTime;
  return this._count / elapsed * this._rateUnit;
};

Meter.prototype.toJSON = function() {
  return {
    'mean'         : this.meanRate(),
    'count'        : this._count,
    '1MinuteRate'  : this._m1Rate.rate(this._rateUnit),
    '5MinuteRate'  : this._m5Rate.rate(this._rateUnit),
    '15MinuteRate' : this._m15Rate.rate(this._rateUnit),
  };
};
