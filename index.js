'use strict';

var Collection = require('./lib/Collection');
var metrics = require('./lib/metrics');
var util = require('./lib/util');

var name;
for (name in metrics) {
  if (metrics.hasOwnProperty(name)) {
    exports[name] = metrics[name];
  }
}

for (name in util) {
  if (util.hasOwnProperty(name)) {
    exports[name] = util[name];
  }
}

exports.createCollection = function (name) {
  return new Collection(name);
};

exports.Collection = Collection;
