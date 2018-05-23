/*global describe, it, beforeEach, afterEach*/
const { validateSignalFxClient } = require('../../../lib/validators/inputValidators');
const assert = require('assert');

describe('validateRequiredSignalFxMetricsReporterParameters', () => {
  it('does nothing for the happy path', () => {
    validateSignalFxClient({ send: () => {} });
  });

  it('throws an error when a bad signal fx client is supplied', () => {
    assert.throws(() => {
      validateSignalFxClient({});
    }, /signalFxClient must implement send\(data: any\)/);
  });
});
