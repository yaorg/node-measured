var common = require('../common');
var assert = require('assert');
var units = common.betterMetrics.units;

var ewma = new common.betterMetrics.EWMA(1 * units.MINUTES, 5 * units.SECONDS);

ewma.update(5);
ewma.tick();

assert.equal(ewma.rate(units.SECONDS).toFixed(3), '1.000');

ewma.update(5);
ewma.update(5);
ewma.tick();

assert.equal(ewma.rate(units.SECONDS).toFixed(3), '1.080');

ewma.update(15);
ewma.tick();

assert.equal(ewma.rate(units.SECONDS).toFixed(3), '1.233');

for (var i = 0; i < 100; i++) {
  ewma.update(15);
  ewma.tick();
}

assert.equal(ewma.rate(units.SECONDS).toFixed(3), '3.000');
