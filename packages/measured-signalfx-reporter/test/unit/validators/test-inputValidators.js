/*global describe, it, beforeEach, afterEach*/
const { DimensionAwareMetricsRegistry } = require('lerna-test-reporting');
const { validateSignalFxClient } = require('../../../lib/validators/inputValidators');
const assert = require('assert');

describe('validateRequiredSignalFxMetricsReporterParameters', () => {
  it('does nothing for the happy path', () => {
    validateSignalFxClient({ send: () => {} }, new DimensionAwareMetricsRegistry(), {
      foo: 'bar'
    });
  });

  it('throws an error when a bad signal fx client is supplied', () => {
    assert.throws(() => {
      validateSignalFxClient({}, new DimensionAwareMetricsRegistry(), {
        foo: 'bar'
      });
    }, /signalFxClient must implement send\(data: any\)/);
  });
});
