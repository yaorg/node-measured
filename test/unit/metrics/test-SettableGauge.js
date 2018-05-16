/*global describe, it, beforeEach, afterEach*/
'use strict';

var common = require('../../common');
var assert = require('assert');

describe('SettableGauge', function() {
  it('can be set with an initial value', () => {
    const gauge = new common.measured.SettableGauge({initialValue: 5});
    assert.equal(gauge.toJSON(), 5);
    gauge.setValue(11);
    assert.equal(gauge.toJSON(), 11)
  });

  it('reads value from internal state', () => {
    const gauge = new common.measured.SettableGauge();
    assert.equal(gauge.toJSON(), 0);
    gauge.setValue(5);
    assert.equal(gauge.toJSON(), 5);
  });

  it('returns the expected type', () => {
    const gauge = new common.measured.SettableGauge();
    assert.equal(gauge.getType(), 'Gauge');
  })
});