var BinaryHeap = require('./BinaryHeap');
var units      = require('../units');

module.exports = ExponentiallyDecayingSample;
function ExponentiallyDecayingSample(options) {
  options = options || {};

  this._elements = new BinaryHeap({
    score: function(element) {
      return -element.priority;
    }
  });

  this._rescaleInterval = options.rescaleInterval || ExponentiallyDecayingSample.RESCALE_INTERVAL;
  this._alpha           = options.alpha || ExponentiallyDecayingSample.ALPHA;
  this._size            = options.size || ExponentiallyDecayingSample.SIZE;
  this._random          = options.random || this._random;
  this._started         = null;
  this._nextRescale     = null;
}

ExponentiallyDecayingSample.RESCALE_INTERVAL = 1 * units.HOURS;
ExponentiallyDecayingSample.ALPHA            = 0.015;
ExponentiallyDecayingSample.SIZE             = 1028;

ExponentiallyDecayingSample.prototype.update = function(value, timestamp) {
  if (!this._started) this._started = Date.now() / 1000;
  timestamp = (timestamp || Date.now()) / 1000;

  var newSize = this._elements.size() + 1;

  var element = {
    priority: this._priority(timestamp - this._started),
    value: value
  };

  if (newSize <= this._size) {
    this._elements.add(element);
  } else if (element.priority > this._elements.first().priority) {
    this._elements.removeFirst();
    this._elements.add(element);
  }
};

ExponentiallyDecayingSample.prototype.toJSON = function() {
  return this._elements
    .toSortedArray()
    .map(function(element) {
      return element.value;
    });
};

ExponentiallyDecayingSample.prototype._weight = function(age) {
  return Math.exp(this._alpha * age);
};

ExponentiallyDecayingSample.prototype._priority = function(value) {
  return this._weight(value) / this._random();
};

ExponentiallyDecayingSample.prototype._random = function() {
  return Math.random();
};
