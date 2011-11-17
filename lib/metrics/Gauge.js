module.exports = Gauge;
function Gauge(properties) {
  this._readFn = properties.read;
}

// This is sync for now, but maybe async gauges would be useful as well?
Gauge.prototype.toJSON = function() {
  return {
    value: this._readFn(),
  };
};
