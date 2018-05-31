/*global describe, it, beforeEach, afterEach*/
const assert = require('assert');
const EventEmitter = require('events');
const { Stopwatch } = require('measured-core');
const { createExpressMiddleware, onRequestStart, onRequestEnd } = require('../../lib');
const TestReporter = require('./TestReporter');
const Registry = require('measured-reporting').SelfReportingMetricsRegistry;

class MockRequest extends EventEmitter {
  constructor() {
    super();
    this.method = 'GET';
    this.path = '/v1/rest/some-end-point'
  }

  end() {
    this.emit('end')
  }
}

describe('onRequestStart', () => {
  it('returns a stopwatch', () => {
    const stopwatch = onRequestStart();
    assert(stopwatch.constructor.name === 'Stopwatch')
  })
});

describe('onRequestEnd', () => {
  it('stops the stopwatch and gets or creates a timer and then updates it with the elapsed time with the appropriate dimensions', () => {
    const stopwatch = new Stopwatch();
    const registry = new Registry(new TestReporter());

    onRequestEnd(registry, stopwatch, 'POST', 201, '/some/path');

    const registeredKeys = registry._registry.allKeys();
    assert(registeredKeys.length === 1);
    const expectedKey = 'request-POST-/some/path-201';
    assert.equal(registeredKeys[0], expectedKey);
    const metricWrapper = registry._registry.getMetricWrapperByKey(expectedKey);
    assert.equal(metricWrapper.name, 'request');
    assert.deepEqual(metricWrapper.dimensions, {statusCode: '201', method: 'POST', path: '/some/path'});
    assert.equal(metricWrapper.metricImpl.getType(), 'Timer');
    assert.equal(metricWrapper.metricImpl._histogram._count, 1);
    registry.shutdown()
  })
});

describe('createExpressMiddleware', () => {
  it('creates and registers a metric called request that is a timer', () => {
    const reporter = new TestReporter();
    const registry = new Registry(reporter);

    const middleware = createExpressMiddleware(registry);

    const req = new MockRequest();
    middleware(req, {
      statusCode: 200,
    }, () => {});
    req.end();

    const registeredKeys = registry._registry.allKeys();
    assert(registeredKeys.length === 1);
    assert(registeredKeys[0].includes('request-GET'));
    registry.shutdown()
  });
});
