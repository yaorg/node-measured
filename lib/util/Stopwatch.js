var util         = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Stopwatch;
util.inherits(Stopwatch, EventEmitter);
function Stopwatch() {
  EventEmitter.call(this);

  this._start   = null;
  this._stopped = false;
}

Stopwatch.prototype.start = function() {
  this._start = Date.now();
};

Stopwatch.prototype.stop = function() {
  // Ideally this would throw, but having your metrics library throw in
  // production would be really annoying, right?
  if (this._stopped) return;

  this._stopped = true;
  var elapsed   = Date.now() - this._start;

  this.emit('stop', elapsed);
  return elapsed;
};
