/*global describe, it, beforeEach, afterEach*/
const assert = require('assert');
const TimeUnits = require('measured-core').units;
const { Counter } = require('measured-core');
const DimensionAwareMetricsRegistry = require('../../../lib/registries/DimensionAwareMetricsRegistry');
const { Reporter } = require('../../../lib');
const { validateReporterInstance } = require('../../../lib/validators/inputValidators');

/**
 * @extends Reporter
 */
class TestReporter extends Reporter {
  constructor(options) {
    super(options);

    this._reportedMetrics = [];
  }

  getReportedMetrics() {
    return this._reportedMetrics;
  }

  _reportMetrics(metrics) {
    this._reportedMetrics.push(metrics);
  }
}

describe('Reporter', () => {
  let reporter;
  let counter = new Counter({ count: 5 });
  let metricName = 'my-test-metric-key';
  let metricKey;
  let metricInterval = 1;
  let metricDimensions = {
    hostname: 'instance-hostname',
    foo: 'bar'
  };
  let registry;

  beforeEach(() => {
    registry = new DimensionAwareMetricsRegistry();
    metricKey = registry.putMetric(metricName, counter, metricDimensions);
    reporter = new TestReporter();
    reporter.setRegistry(registry);
  });

  it('throws an error if you try to instantiate the abstract class', () => {
    assert.throws(() => {
      new Reporter();
    }, /^TypeError: Can\'t instantiate abstract class\!$/);
  });

  it('throws an error if _reportMetrics is not implemented', () => {
    class BadImpl extends Reporter {}
    assert.throws(() => {
      const badImpl = new BadImpl();
      badImpl._reportMetrics([]);
    }, /method _reportMetrics\(metrics\) must be implemented/);
  });

  it('throws an error if reportMetricOnInterval is called before setRegistry', () => {
    assert.throws(() => {
      let unsetReporter = new TestReporter();
      unsetReporter.reportMetricOnInterval(metricKey, metricInterval);
    }, /must call setRegistry/);
  });

  it('_reportMetricsWithInterval reports the test metric wrapper', () => {
    reporter._intervalToMetric[metricInterval] = new Set([metricKey]);
    reporter._reportMetricsWithInterval(metricInterval);
    assert.equal(reporter.getReportedMetrics().length, 1);
    assert.deepEqual(reporter.getReportedMetrics().shift(), [registry.getMetricWrapperByKey(metricKey)]);
  });

  it('should report 5 times in a  5 second window with a metric set to be reporting every 1 second', (done, fail) => {
    reportAndWait(reporter, metricKey, metricInterval)
      .then(() => {
        reporter.shutdown();
        const numberOfReports = reporter.getReportedMetrics().length;
        assert.equal(numberOfReports, 5);
        done();
      })
      .catch(() => {
        reporter.shutdown();
        assert.fail('', '', '');
      });
  }).timeout(10000);

  it('should only create 1 interval for 2 metrics with the same reporting interval', () => {
    reporter.reportMetricOnInterval(metricKey, metricInterval);
    metricKey = registry.putMetric('foo', counter, metricDimensions);
    reporter.reportMetricOnInterval('foo', metricInterval);

    const intervalCount = reporter._intervals.length;
    assert.equal(1, intervalCount);
    reporter.shutdown();
  });

  it('should left merge dimensions with the metric dimensions taking precedence when _getDimensions is called', () => {
    let defaultDimensions = {
      hostname: 'instance-hostname',
      foo: 'bar'
    };
    reporter = new TestReporter({ defaultDimensions });
    const customDimensions = {
      foo: 'bam',
      region: 'us-west-2'
    };
    const merged = reporter._getDimensions({ dimensions: customDimensions });
    const expected = {
      hostname: 'instance-hostname',
      foo: 'bam',
      region: 'us-west-2'
    };
    assert.deepEqual(expected, merged);
  });

  it('Can be used to create an anonymous instance of a reporter', () => {
    const anonymousReporter = new class extends Reporter {
      _reportMetrics(metrics) {
        metrics.forEach(metric => console.log(JSON.stringify(metric)));
      }
    }();

    validateReporterInstance(anonymousReporter);
  });

  it('unrefs timers, when configured to', () => {
    let calledUnref = false;

    const timer = setTimeout(() => {}, 100);
    clearTimeout(timer);
    const proto = timer.constructor.prototype;
    const { unref } = proto;
    proto.unref = function wrappedUnref() {
      calledUnref = true;
      return unref.call(this);
    };

    reporter = new TestReporter({ unrefTimers: true });
    reporter.setRegistry(registry);
    reporter.reportMetricOnInterval(metricKey, metricInterval);

    proto.unref = unref;

    assert.ok(calledUnref);
  });
});

const reportAndWait = (reporter, metricKey, metricInterval) => {
  return new Promise(resolve => {
    reporter.reportMetricOnInterval(metricKey, metricInterval);
    setTimeout(() => {
      resolve();
    }, 5 * TimeUnits.SECONDS);
  });
};
