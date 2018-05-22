/*global describe, it, beforeEach, afterEach*/
const assert = require('assert');
const { Counter } = require('measured-core');
const DimensionAwareMetricsRegistry = require('../../../lib/registries/DimensionAwareMetricsRegistry');

describe('DimensionAwareMetricsRegistry', () => {

  let registry;
  beforeEach(() => {
    registry = new DimensionAwareMetricsRegistry();
  });

  it('hasMetric() returns true after putMetric() and getMetric() retrieves it, and it has the expected value', () => {
    const counter = new Counter({
      count: 10
    });

    const metricName = 'counter';

    const dimensions = {
      foo: 'bar'
    };

    assert(!registry.hasMetric(metricName, dimensions));
    registry.putMetric(metricName, counter, dimensions);
    assert(registry.hasMetric(metricName, dimensions));
    assert(counter === registry.getMetric(metricName, dimensions));
    assert.equal(10, registry.getMetric(metricName, dimensions).toJSON())
  });

  it('getMetricByKey() returns the proper metric wrapper', () => {
    const counter = new Counter({
      count: 10
    });

    const metricName = 'counter';

    const dimensions = {
      foo: 'bar'
    };

    const key = registry.putMetric(metricName, counter, dimensions);
    assert(key.includes('counter-bar'));
    const wrapper = registry.getMetricWrapperByKey(key);
    assert.deepEqual(counter, wrapper.metricImpl);
    assert.deepEqual(dimensions, wrapper.dimensions);
    assert.equal(metricName, wrapper.name)
  })

});