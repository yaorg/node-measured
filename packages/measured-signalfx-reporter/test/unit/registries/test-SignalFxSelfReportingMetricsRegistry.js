/*global describe, it, beforeEach, afterEach*/
const { SignalFxSelfReportingMetricsRegistry } = require('../../../lib');
const { Reporter } = require('measured-reporting');
const sinon = require('sinon');
const assert = require('assert');

/**
 * @extends Reporter
 */
class TestReporter extends Reporter {
  reportMetricOnInterval(metricKey, intervalInSeconds) {}
  _reportMetrics(metrics) {}
}

describe('SignalFxSelfReportingMetricsRegistry', () => {
  let registry;
  let reporter;
  let mockReporter;
  beforeEach(() => {
    reporter = new TestReporter();
    mockReporter = sinon.mock(reporter);
    registry = new SignalFxSelfReportingMetricsRegistry(reporter);
  });

  it('#getOrCreateTimer uses a no-op timer', () => {
    mockReporter.expects('reportMetricOnInterval').once();
    const timer = registry.getOrCreateTimer('my-timer');
    assert.equal(timer._meter.constructor.name, 'NoOpMeter');
    const theSameTimer = registry.getOrCreateTimer('my-timer');
    assert(timer === theSameTimer);
  });

  it('#getOrCreateMeter uses a no-op timer', () => {
    mockReporter.expects('reportMetricOnInterval').never();
    const meter = registry.getOrCreateMeter('my-meter');
    assert.equal(meter.constructor.name, 'NoOpMeter');
  });
});

