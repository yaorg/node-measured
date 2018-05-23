/*global describe, it, beforeEach, afterEach*/
const { SignalFxMetricsReporter } = require('../../../lib');
const { Histogram, MetricTypes, Gauge, Timer, Meter, Counter } = require('measured-core');
const assert = require('assert');
const sinon = require('sinon');

describe('SignalFxMetricsReporter', () => {
  const name = 'request';
  const dimensions = {
    foo: 'bar'
  };
  let reporter;
  let signalFxClient;
  let clientSpy;
  beforeEach(() => {
    signalFxClient = {
      send: data => {
        return new Promise(resolve => {
          resolve();
        });
      }
    };
    clientSpy = sinon.spy(signalFxClient, 'send');
    // noinspection JSCheckFunctionSignatures
    reporter = new SignalFxMetricsReporter(signalFxClient);
  });

  it('#_reportMetrics sends the expected data to signal fx for a histogram', () => {
    const metric = new Histogram();
    const metricMock = sinon.mock(metric);
    metricMock
      .expects('getType')
      .once()
      .returns(MetricTypes.HISTOGRAM);
    metricMock
      .expects('toJSON')
      .once()
      .returns({
        min: 1,
        max: 10,
        sum: 100,
        variance: 55,
        mean: 5,
        stddev: 54,
        count: 20,
        median: 50,
        p75: 4,
        p95: 6,
        p99: 7,
        p999: 9
      });

    const metricWrapper = {
      name: name,
      metricImpl: metric,
      dimensions: dimensions
    };

    const expected = {
      gauges: [
        {
          metric: `${name}.max`,
          value: '10',
          dimensions: dimensions
        },
        {
          metric: `${name}.min`,
          value: '1',
          dimensions: dimensions
        },
        {
          metric: `${name}.mean`,
          value: '5',
          dimensions: dimensions
        },
        {
          metric: `${name}.p95`,
          value: '6',
          dimensions: dimensions
        },
        {
          metric: `${name}.p99`,
          value: '7',
          dimensions: dimensions
        }
      ],
      cumulative_counters: [
        {
          metric: `${name}.count`,
          value: '20',
          dimensions: dimensions
        }
      ]
    };

    reporter._reportMetrics([metricWrapper]);

    assert(
      clientSpy.withArgs(
        sinon.match(actual => {
          assert.deepEqual(expected, actual);
          return true;
        })
      ).calledOnce
    );
  });

  it('#_reportMetrics sends the expected data to signal fx for a gauge', () => {
    const metric = new Gauge(() => 10);

    const metricWrapper = {
      name: name,
      metricImpl: metric,
      dimensions: dimensions
    };

    const expected = {
      gauges: [
        {
          metric: `${name}`,
          value: '10',
          dimensions: dimensions
        }
      ]
    };

    reporter._reportMetrics([metricWrapper]);

    assert(
      clientSpy.withArgs(
        sinon.match(actual => {
          assert.deepEqual(expected, actual);
          return true;
        })
      ).calledOnce
    );
  });

  it('#_reportMetrics sends the expected data to signal fx for a counter', () => {
    const metric = new Counter({ count: 5 });

    const metricWrapper = {
      name: name,
      metricImpl: metric,
      dimensions: dimensions
    };

    const expected = {
      cumulative_counters: [
        {
          metric: `${name}.count`,
          value: '5',
          dimensions: dimensions
        }
      ]
    };

    reporter._reportMetrics([metricWrapper]);

    assert(
      clientSpy.withArgs(
        sinon.match(actual => {
          assert.deepEqual(expected, actual);
          return true;
        })
      ).calledOnce
    );
  });

  it('#_reportMetrics sends the expected data to signal fx for a meter', () => {
    const metric = new Meter();

    const metricWrapper = {
      name: name,
      metricImpl: metric,
      dimensions: dimensions
    };

    reporter._reportMetrics([metricWrapper]);

    assert(clientSpy.withArgs({}).calledOnce);

    metric.end();
  });
  it('#_reportMetrics sends the expected data to signal fx for an array multiple metrics', () => {
    const metric = new Histogram();
    const metricMock = sinon.mock(metric);
    metricMock
      .expects('getType')
      .once()
      .returns(MetricTypes.HISTOGRAM);
    metricMock
      .expects('toJSON')
      .once()
      .returns({
        min: 1,
        max: 10,
        sum: 100,
        variance: 55,
        mean: 5,
        stddev: 54,
        count: 20,
        median: 50,
        p75: 4,
        p95: 6,
        p99: 7,
        p999: 9
      });

    const histogramWRapper = {
      name: name,
      metricImpl: metric,
      dimensions: dimensions
    };

    const counterWrapper = {
      name: 'my-counter',
      metricImpl: new Counter({ count: 6 })
    };

    const gaugeWrapper = {
      name: 'my-gauge',
      metricImpl: new Gauge(() => 8)
    };

    const expected = {
      gauges: [
        {
          metric: `${name}.max`,
          value: '10',
          dimensions: dimensions
        },
        {
          metric: `${name}.min`,
          value: '1',
          dimensions: dimensions
        },
        {
          metric: `${name}.mean`,
          value: '5',
          dimensions: dimensions
        },
        {
          metric: `${name}.p95`,
          value: '6',
          dimensions: dimensions
        },
        {
          metric: `${name}.p99`,
          value: '7',
          dimensions: dimensions
        },
        {
          metric: 'my-gauge',
          value: '8',
          dimensions: {}
        }
      ],
      cumulative_counters: [
        {
          metric: `${name}.count`,
          value: '20',
          dimensions: dimensions
        },
        {
          metric: 'my-counter.count',
          value: '6',
          dimensions: {}
        }
      ]
    };

    reporter._reportMetrics([histogramWRapper, counterWrapper, gaugeWrapper]);

    assert(
      clientSpy.withArgs(
        sinon.match(actual => {
          assert.deepEqual(expected, actual);
          return true;
        })
      ).calledOnce
    );
  });

  it('#_reportMetrics doesnt add metrics tp]o send if a bad metric was supplied', () => {
    reporter._reportMetrics([
      {
        name: 'something',
        metricImpl: { getType: () => 'something random' }
      }
    ]);

    assert(clientSpy.withArgs({}).calledOnce);
  });

  it('#_reportMetrics sends the expected data to signal fx for a timer', () => {});
});
