/*global describe, it, beforeEach, afterEach*/
'use strict';

var common = require('../../common');
var assert = require('assert');
var units = common.measured.units;
var EMWA = common.measured.ExponentiallyMovingWeightedAverage;

describe('ExponentiallyMovingWeightedAverage', function () {
  it('decay over several updates and ticks', function () {
    var ewma = new EMWA(units.MINUTES, 5 * units.SECONDS);

    ewma.update(5);
    ewma.tick();

    assert.equal(ewma.rate(units.SECONDS).toFixed(3), '0.080');

    ewma.update(5);
    ewma.update(5);
    ewma.tick();

    assert.equal(ewma.rate(units.SECONDS).toFixed(3), '0.233');

    ewma.update(15);
    ewma.tick();

    assert.equal(ewma.rate(units.SECONDS).toFixed(3), '0.455');

    var i;
    for (i = 0; i < 200; i++) {
      ewma.update(15);
      ewma.tick();
    }

    assert.equal(ewma.rate(units.SECONDS).toFixed(3), '3.000');
  });
});
