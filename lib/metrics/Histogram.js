var EDS = require('../util/ExponentiallyDecayingSample');

module.exports = Histogram;
function Histogram(properties) {
  properties = properties || {};

  this._sample    = properties.sample || new EDS();
  this._min       = null;
  this._max       = null;
  this._count     = 0;
  this._sum       = 0;

  // These are for the Welford algorithm for calculating running variance
  // without floating-point doom.
  this._varianceM = 0;
  this._varianceS = 0;
}

Histogram.prototype.update = function(value) {
  this._count++;
  this._sum += value;

  this._sample.update(value);
  this._updateMin(value);
  this._updateMax(value);
  this._updateVariance(value);
};

Histogram.prototype.toJSON = function() {
  return {
    min      : this._min,
    max      : this._max,
    sum      : this._sum,
    variance : this._calculateVariance(),
    mean     : this._calculateMean(),
    stddev   : 0,
    count    : 0,
    median   : 0,
    p75      : 0,
    p95      : 0,
    p99      : 0,
    p999     : 0,
  };
};

Histogram.prototype._updateMin = function(value) {
  if (this._min === null || value < this._min) {
    this._min = value;
  }
};

Histogram.prototype._updateMax = function(value) {
  if (this._max === null || value > this._max) {
    this._max = value;
  }
};

Histogram.prototype._updateVariance = function(value) {
  if (this._count === 1) return this._varianceM = value;

  var oldM = this._varianceM;

  this._varianceM += ((value - oldM) / this._count);
  this._varianceS += ((value - oldM) * (value - this._varianceM));
};

Histogram.prototype._calculateMean = function() {
  return (this._count === 0)
    ? 0
    : this._sum / this._count;
};

Histogram.prototype._calculateVariance = function() {
  return (this._count <= 1)
    ? null
    : this._varianceS / (this._count - 1);
}
