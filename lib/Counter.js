module.exports = Counter;
function Counter(name) {
  this.name   = name;

  this._count = 0;
}

Counter.prototype.toJSON = function() {
  return {count: this._count};
};

Counter.prototype.inc = function(n) {
  this._count += (n || 1);
};

Counter.prototype.dec = function(n) {
  this._count -= (n || 1);
};

Counter.prototype.clear = function() {
  this._count = 0;
};
