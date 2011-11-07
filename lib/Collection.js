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
    var Constructor = metrics[name];
    var method = name.substr(0, 1).toLowerCase() + name.substr(1);

    // Cannot pass variable amount of arguments into a JS constructor : /
    Collection.prototype[method] = function(name, a1, a2, a3, a4, a5, a6, a7) {
      var metric = new Constructor(a1, a2, a3, a4, a5, a6, a7);
      this.register(name, metric);
      return metric;
    };
  });
