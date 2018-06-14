/*global describe, it, beforeEach, afterEach*/
const assert = require('assert');
const { LoggingReporter } = require('../../../lib');

describe('LoggingReporter', () => {
  it('uses the supplied log level', () => {
    const loggedMessages = [];
    const logger = {
      debug: (...msgs) => {
        loggedMessages.push('debug: ', ...msgs);
      },
      info: (...msgs) => {
        loggedMessages.push('info: ', ...msgs);
      },
      warn: (...msgs) => {
        loggedMessages.push('warn: ', ...msgs);
      },
      error: (...msgs) => {
        loggedMessages.push('error: ', ...msgs);
      }
    };
    let reporter = new LoggingReporter({
      logger: logger,
      logLevelToLogAt: 'debug'
    });

    reporter._reportMetrics([{
      name: 'test',
      dimensions: {},
      metricImpl: {toJSON: () => 5}
    }]);

    assert.equal(loggedMessages.shift(), "debug: ");
    assert.equal(loggedMessages.shift(), "{\"metricName\":\"test\",\"dimensions\":{},\"data\":5}")
  })
});

