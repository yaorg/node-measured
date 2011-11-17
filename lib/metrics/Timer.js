var Histogram = require('./Histogram');
var Meter     = require('./Meter');

module.exports = Timer;
function Timer(properties) {
  this._meter     = properties.meter || new Meter;
  this._histogram = properties.histogram || new Histogram;
}

Timer.prototype.update = function(value) {
  this._meter.mark();
  this._histogram.update(value);
};

Timer.prototype.toJSON = function() {
  var self   = this;
  var result = {};

  ['meter', 'histogram'].forEach(function(metric) {
    var json = self['_' + metric].toJSON();
    for (var key in json) {
      result[metric + '.' + key] = json[key];
    }
  });

  return result;
};
