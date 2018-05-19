/*global describe, it, beforeEach, afterEach*/

var common = require('../../common');
var assert = require('assert');

describe('NoOpMeter', () => {
  let meter;

  beforeEach(() => {
    meter = new common.measured.NoOpMeter();
  });

  it('always returns empty object', () => {
    assert.deepEqual(meter.toJSON(), {});
  });

  it('returns the expected type', () => {
    assert.equal(meter.getType(), 'Meter');
  });
});
