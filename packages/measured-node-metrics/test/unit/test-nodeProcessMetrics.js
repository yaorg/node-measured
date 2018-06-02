/*global describe, it, beforeEach, afterEach*/
const assert = require('assert');
const { validateMetric } = require('measured-core').metricValidators;
const { nodeProcessMetrics, createProcessMetrics } = require('../../lib');
const TestReporter = require('./TestReporter');
const Registry = require('measured-reporting').SelfReportingMetricsRegistry;
const { MetricTypes } = require('measured-core');

describe('nodeProcessMetrics', () => {
  it('contains a map of string to functions that generate a valid  metric object', () => {
    Object.keys(nodeProcessMetrics).forEach(metricName => {
      assert(typeof metricName === 'string', 'The key should be a string');

      const metricGeneratingFunction = nodeProcessMetrics[metricName];
      assert(typeof metricGeneratingFunction === 'function', 'metric generating function should be a function');

      const metric = metricGeneratingFunction();
      validateMetric(metric);

      const value = metric.toJSON();
      const type = metric.getType();
      if ([MetricTypes.COUNTER, MetricTypes.GAUGE].includes(type)) {
        assert(typeof value === 'number');
      } else {
        assert(typeof value === 'object');
      }
    });
  });
});

describe('createProcessMetrics', () => {
  it('creates and registers a metric for every metric defined in nodeProcessMetrics', () => {
    const reporter = new TestReporter();
    const registry = new Registry(reporter);

    createProcessMetrics(registry);

    const registeredKeys = registry._registry.allKeys();
    const expectedKeys = Object.keys(nodeProcessMetrics);
    assert(registeredKeys.length > 1);
    assert.deepEqual(registeredKeys, expectedKeys);

    registry.shutdown();
  });
});
