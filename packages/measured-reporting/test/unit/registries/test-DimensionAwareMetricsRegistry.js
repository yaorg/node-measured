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
    assert.equal(10, registry.getMetric(metricName, dimensions).toJSON());
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
    assert.equal(metricName, wrapper.name);
  });

  it('#_generateStorageKey generates the same key for a metric name and dimensions with different ordering', () => {
    const metricName = 'the-metric-name';
    const demensions1 = {
      foo: 'bar',
      bam: 'boo'
    };
    const demensions2 = {
      bam: 'boo',
      foo: 'bar'
    };

    const key1 = registry._generateStorageKey(metricName, demensions1);
    const key2 = registry._generateStorageKey(metricName, demensions2);

    assert.equal(key1, key2);
  });

  it('#_generateStorageKey generates the same key for a metric name and dimensions when called 2x', () => {
    const metricName = 'the-metric-name';
    const demensions1 = {
      foo: 'bar',
      bam: 'boo'
    };

    const key1 = registry._generateStorageKey(metricName, demensions1);
    const key2 = registry._generateStorageKey(metricName, demensions1);

    assert.equal(key1, key2);
  });

  it('#_generateStorageKey generates the same key for a metric name and no dimensions when called 2x', () => {
    const metricName = 'the-metric-name';
    const demensions1 = {};

    const key1 = registry._generateStorageKey(metricName, demensions1);
    const key2 = registry._generateStorageKey(metricName, demensions1);

    assert.equal(key1, key2);
  });

  it('metricLimit limits metric count', () => {
    const limitedRegistry = new DimensionAwareMetricsRegistry({
      metricLimit: 10
    });

    const counter = new Counter({
      count: 10
    });

    const dimensions = {
      foo: 'bar'
    };

    for (let i = 0; i < 20; i++) {
      limitedRegistry.putMetric(`metric #${i}`, counter, dimensions);
    }

    assert.equal(10, limitedRegistry._metrics.size);
    assert(!limitedRegistry.hasMetric('metric #0', dimensions));
  });

  it('lru changes metric dropping strategy', () => {
    const limitedRegistry = new DimensionAwareMetricsRegistry({
      metricLimit: 10,
      lru: true
    });

    const counter = new Counter({
      count: 10
    });

    const dimensions = {
      foo: 'bar'
    };

    for (let i = 0; i < 10; i++) {
      limitedRegistry.putMetric(`metric #${i}`, counter, dimensions);
    }

    // Touch the first added metric
    limitedRegistry.getMetric('metric #0', dimensions);

    // Put a new metric in to trigger a drop
    limitedRegistry.putMetric('metric #11', counter, dimensions);

    // Verify that it dropped metric #1, not metric #0
    assert(limitedRegistry.hasMetric('metric #0', dimensions));
    assert(!limitedRegistry.hasMetric('metric #1', dimensions));
  });
});
