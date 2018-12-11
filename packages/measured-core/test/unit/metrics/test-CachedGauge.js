/*global describe, it, beforeEach, afterEach*/
const TimeUnits = require('../../../lib/util/units');
const CachedGauge = require('../../../lib/metrics/CachedGauge');
const assert = require('assert');

describe('CachedGauge', () => {
  let cachedGauge;
  it('A cachedGauge immediately calls the callback to set its initial value', () => {
    cachedGauge = new CachedGauge(
      () => {
        return new Promise(resolve => {
          resolve(10);
        });
      },
      1,
      TimeUnits.MINUTES
    ); // Shouldn't update in the unit test.

    return wait(5 * TimeUnits.MILLISECONDS).then(() => {
      assert.equal(cachedGauge.toJSON(), 10);
    });
  });

  it('A cachedGauge calls the callback at the interval provided', () => {
    const values = [1, 2];
    cachedGauge = new CachedGauge(
      () => {
        return new Promise(resolve => {
          resolve(values.shift());
        });
      },
      5,
      TimeUnits.MILLISECONDS
    );

    return wait(7 * TimeUnits.MILLISECONDS).then(() => {
      assert.equal(cachedGauge.toJSON(), 2);
      assert.equal(values.length, 0, 'the callback should have been called 2x, emptying the values array');
    });
  });

  afterEach(() => {
    if (cachedGauge) {
      cachedGauge.end();
    }
  });
});

const wait = waitInterval => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, waitInterval);
  });
};
