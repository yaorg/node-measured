/*global describe, it, beforeEach, afterEach*/
const bunyan = require('bunyan');
const loglevel = require('loglevel');
const winston = require('winston');
const assert = require('assert');
const { Counter } = require('measured-core');
const {
  validateGaugeOptions,
  validateOptionalLogger,
  validateMetric,
  validateReporterInstance,
  validateSelfReportingMetricsRegistryParameters,
  validateOptionalPublishingInterval,
  validateOptionalDimensions,
  validateMetricName,
  validateNumberReturningCallback
} = require('../../../lib/validators/inputValidators');

describe('validateGaugeOptions', () => {
  it('it does nothing for the happy path', () => {
    validateGaugeOptions('foo', () => 10, { foo: 'bar' }, 1);
  });

  it('throws an error if the call back returns an object', () => {
    assert.throws(() => {
      validateGaugeOptions(
        'foo',
        () => {
          return { value: 10, anotherValue: 10 };
        },
        { foo: 'bar' },
        1
      );
    }, /options.callback must return a number, actual return type: object/);
  });
});

describe('validateNumberReturningCallback', () => {
  it('throws an error if a non function is supplied', () => {
    assert.throws(() => {
      validateNumberReturningCallback({});
    }, /must be function/);
  });
});

describe('validateOptionalLogger', () => {
  it('validates a Buynan logger', () => {
    const logger = bunyan.createLogger({ name: 'bunyan-logger' });
    validateOptionalLogger(logger);
  });

  it('validates a Winston logger', () => {
    validateOptionalLogger(winston);
  });

  it('validates a Loglevel logger', () => {
    validateOptionalLogger(loglevel);
  });

  it('validates an artisanal logger', () => {
    validateOptionalLogger({
      debug: (...msgs) => {
        console.log('debug: ', ...msgs);
      },
      info: (...msgs) => {
        console.log('info: ', ...msgs);
      },
      warn: (...msgs) => {
        console.log('warn: ', ...msgs);
      },
      error: (...msgs) => {
        console.log('error: ', ...msgs);
      }
    });
  });

  it('throws an error when a logger is missing an expected method', () => {
    assert.throws(() => {
      validateOptionalLogger({});
    }, /The logger that was passed in does not support/);
  });

  it('does not throw an error if a logger is not passed in as an arg', () => {
    validateOptionalLogger(null);
  });
});

describe('validateMetric', () => {
  it('throws an error if the metric is undefined', () => {
    assert.throws(() => {
      validateMetric(undefined);
    }, /^TypeError: The metric was undefined, when it was required$/);
  });

  it('throws an error if the metric is null', () => {
    assert.throws(() => {
      validateMetric(null);
    }, /^TypeError: The metric was undefined, when it was required$/);
  });

  it('throws an error if toJSON is not a function', () => {
    assert.throws(() => {
      validateMetric({});
    }, /must implement toJSON()/);
  });

  it('throws an error if getType is not a function', () => {
    assert.throws(() => {
      validateMetric({ toJSON: () => {} });
    }, /must implement getType()/);
  });

  it('throws an error if #getType() does not return an expected value', () => {
    assert.throws(() => {
      validateMetric({
        toJSON: () => {},
        getType: () => {
          return 'foo';
        }
      });
    }, /Metric#getType\(\), must return a type defined in MetricsTypes/);
  });

  it('does nothing when a valid metric is supplied', () => {
    validateMetric(new Counter());
  });
});

describe('validateReporterInstance', () => {
  it('throws an error if undefined was passed in', () => {
    assert.throws(() => {
      validateReporterInstance(null);
    }, /The reporter was undefined/);
  });

  it('throws an error if setRegistry is not a function', () => {
    assert.throws(() => {
      validateReporterInstance({});
    }, /must implement setRegistry/);
  });

  it('throws an error if reportMetricOnInterval is not a function', () => {
    assert.throws(() => {
      validateReporterInstance({ setRegistry: () => {} });
    }, /must implement reportMetricOnInterval/);
  });

  it('does nothing for a valid reporter instance', () => {
    validateReporterInstance({ setRegistry: () => {}, reportMetricOnInterval: () => {} });
  });
});

describe('validateSelfReportingMetricsRegistryParameters', () => {
  it('does nothing when a reporter is passed in', () => {
    validateSelfReportingMetricsRegistryParameters([{ setRegistry: () => {}, reportMetricOnInterval: () => {} }]);
  });
});

describe('validateOptionalPublishingInterval', () => {
  it('throws an error if validateOptionalPublishingInterval is not a number', () => {
    assert.throws(() => {
      validateOptionalPublishingInterval('1');
    }, /must be of type number/);
  });
});

describe('validateOptionalDimensions', () => {
  it('throws an error if passed dimensions is not an object', () => {
    assert.throws(() => {
      validateOptionalDimensions(1);
    }, /options.dimensions should be an object/);
  });

  it('throws an error if passed dimensions is not an object.<string, string>', () => {
    assert.throws(() => {
      validateOptionalDimensions(['thing', 'otherthing']);
    }, /dimensions where detected to be an array/);
  });

  it('throws an error if passed dimensions is not an object has non string values for demension keys', () => {
    assert.throws(() => {
      validateOptionalDimensions({ someKeyThatIsANumber: 1 });
    }, /should be of type string/);
  });
});

describe('validateMetricName', () => {
  it('throw an error if a non-string is passed', () => {
    assert.throws(() => {
      validateMetricName({});
    }, /options.name is a required option and must be of type string/);
  });
});
