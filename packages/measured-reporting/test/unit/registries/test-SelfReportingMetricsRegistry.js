/*global describe, it, beforeEach, afterEach*/
const assert = require('assert');
const sinon = require('sinon');
const { Counter } = require('measured-core');
const { SelfReportingMetricsRegistry } = require('../../../lib');
const DimensionAwareMetricsRegistry = require('../../../lib/registries/DimensionAwareMetricsRegistry');

describe('SelfReportingMetricsRegistry', () => {
  let selfReportingRegistry;
  let reporter;
  let mockReporter;
  let registry;

  beforeEach(() => {
    registry = new DimensionAwareMetricsRegistry();
    reporter = {
      reportMetricOnInterval() {},
      setRegistry() {}
    };
    mockReporter = sinon.mock(reporter);
    selfReportingRegistry = new SelfReportingMetricsRegistry(reporter, { registry });
  });

  it('throws an error if a metric has already been registered', () => {
    registry.putMetric('my-metric', new Counter(), {});
    assert.throws(() => {
      selfReportingRegistry.register('my-metric', new Counter(), {});
    });
  });

  it('#register registers the metric and informs the reporter to report', () => {
    const metricName = 'foo';
    const reportInterval = 1;
    const metricKey = metricName;

    mockReporter
      .expects('reportMetricOnInterval')
      .once()
      .withArgs(metricKey, reportInterval);

    selfReportingRegistry.register(metricKey, new Counter(), {}, reportInterval);

    assert.equal(1, Object.keys(registry._metrics).length);

    mockReporter.restore();
    mockReporter.verify();
  });

  it('#getOrCreateGauge creates a gauge and when called a second time returns the same gauge', () => {
    mockReporter.expects('reportMetricOnInterval').once();

    const gauge = selfReportingRegistry.getOrCreateGauge('the-metric-name', () => 10, {}, 1);
    const theSameGauge = selfReportingRegistry.getOrCreateGauge('the-metric-name', () => 10, {}, 1);

    mockReporter.restore();
    mockReporter.verify();

    assert.deepEqual(gauge, theSameGauge);
  });

  it('#getOrCreateHistogram creates and registers the metric and when called a second time returns the same metric', () => {
    mockReporter.expects('reportMetricOnInterval').once();

    const metric = selfReportingRegistry.getOrCreateHistogram('the-metric-name', {}, 1);
    const theSameMetric = selfReportingRegistry.getOrCreateHistogram('the-metric-name', {}, 1);

    mockReporter.restore();
    mockReporter.verify();

    assert.deepEqual(metric, theSameMetric);
  });

  it('#getOrCreateMeter creates and registers the metric and when called a second time returns the same metric', () => {
    mockReporter.expects('reportMetricOnInterval').once();

    const metric = selfReportingRegistry.getOrCreateMeter('the-metric-name', {}, 1);
    const theSameMetric = selfReportingRegistry.getOrCreateMeter('the-metric-name', {}, 1);

    mockReporter.restore();
    mockReporter.verify();

    assert.deepEqual(metric, theSameMetric);
    metric.end();
  });

  it('#getOrCreateCounter creates and registers the metric and when called a second time returns the same metric', () => {
    mockReporter.expects('reportMetricOnInterval').once();

    const metric = selfReportingRegistry.getOrCreateCounter('the-metric-name', {}, 1);
    const theSameMetric = selfReportingRegistry.getOrCreateCounter('the-metric-name', {}, 1);

    mockReporter.restore();
    mockReporter.verify();

    assert.deepEqual(metric, theSameMetric);
  });

  it('#getOrCreateTimer creates and registers the metric and when called a second time returns the same metric', () => {
    mockReporter.expects('reportMetricOnInterval').once();

    const metric = selfReportingRegistry.getOrCreateTimer('the-metric-name', {}, 1);
    const theSameMetric = selfReportingRegistry.getOrCreateTimer('the-metric-name', {}, 1);

    mockReporter.restore();
    mockReporter.verify();

    assert.deepEqual(metric, theSameMetric);
    metric.end();
  });

  it('#getOrCreateSettableGauge creates and registers the metric and when called a second time returns the same metric', () => {
    mockReporter.expects('reportMetricOnInterval').once();

    const metric = selfReportingRegistry.getOrCreateSettableGauge('the-metric-name', {}, 1);
    const theSameMetric = selfReportingRegistry.getOrCreateSettableGauge('the-metric-name', {}, 1);

    mockReporter.restore();
    mockReporter.verify();

    assert.deepEqual(metric, theSameMetric);
  });
});
