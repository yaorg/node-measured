/*global describe, it, beforeEach, afterEach*/
const assert = require('assert');
const { LoggingReporter } = require('../../../lib');

describe('LoggingReporter', () => {
  let loggedMessages = [];
  let logger;
  beforeEach(() => {
    logger = {
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
  });

  it('uses the supplied log level', () => {
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
  });

  it('defaults to info level, if no override supplied', () => {
    it('uses the supplied log level', () => {
      let reporter = new LoggingReporter({
        logger: logger,
      });

      reporter._reportMetrics([{
        name: 'test',
        dimensions: {},
        metricImpl: {toJSON: () => 5}
      }]);

      assert.equal(loggedMessages.shift(), "info: ");
      assert.equal(loggedMessages.shift(), "{\"metricName\":\"test\",\"dimensions\":{},\"data\":5}")
    });
  });

});

