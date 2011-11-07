var units = require('./units');

module.exports = EWMA;
function EWMA(timePeriod, tickInterval) {
  this._timePeriod   = timePeriod || 1 * units.MINUTE;
  this._tickInterval = tickInterval || EWMA.TICK_INTERVAL;
  this._alpha        = 1 - Math.exp(-this._tickInterval / this._timePeriod);
  this._counter      = 0;
  this._rate         = null;
}
EWMA.TICK_INTERVAL = 5 * units.SECONDS;

EWMA.prototype.update = function(n) {
  this._counter += n;
};

EWMA.prototype.tick = function() {
  var instantRate = this._counter / this._tickInterval;
  this._counter   = 0;

  if (this._rate !== null) {
    this._rate += (this._alpha * (instantRate - this._rate));
  } else {
    this._rate = instantRate;
  }
};

EWMA.prototype.rate = function(timeUnit) {
  return this._rate * timeUnit;
};
