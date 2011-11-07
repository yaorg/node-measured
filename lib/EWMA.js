var units = require('./units');

module.exports = EWMA;
function EWMA(timePeriod, tickInterval) {
  this._timePeriod   = timePeriod || 1 * units.MINUTE;
  this._tickInterval = tickInterval || EWMA.TICK_INTERVAL;
  this._alpha        = 1 - Math.exp(-this._tickInterval / this._timePeriod);
  this._count        = 0;
  this._rate         = 0;
}
EWMA.TICK_INTERVAL = 5 * units.SECONDS;

EWMA.prototype.update = function(n) {
  this._count += n;
};

EWMA.prototype.tick = function() {
  var instantRate = this._count / this._tickInterval;
  this._count     = 0;

  this._rate += (this._alpha * (instantRate - this._rate));
};

EWMA.prototype.rate = function(timeUnit) {
  return (this._rate || 0) * timeUnit;
};
