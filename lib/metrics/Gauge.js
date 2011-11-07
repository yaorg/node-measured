module.exports = Gauge;
function Gauge(fn) {
  this._fn = fn;
}

// This is sync for now, but maybe async gauges would be useful as well?
Gauge.prototype.toJSON = function() {
  return {
    value: this._fn(),
  };
};
