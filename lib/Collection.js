var metrics = require('./metrics');

module.exports = Collection;
function Collection(prefix) {
  this._prefix = prefix;
  this._metrics = {};
}

Collection.prototype.register = function(name, metric) {
  this._metrics[name] = metric;
};

Collection.prototype.toJSON = function() {
  var json = {};
  for (var name in this._metrics) {
    var metric = this._metrics[name];
    json[this._prefix + name] = metric.toJSON();
  }

  return json;
};

Object
  .keys(metrics)
  .forEach(function(name) {
    var MetricConstructor = metrics[name];
    var method = name.substr(0, 1).toLowerCase() + name.substr(1);

    Collection.prototype[method] = function(name, properties) {
      var metric = new MetricConstructor(properties);
      this.register(name, metric);
      return metric;
    };
  });
