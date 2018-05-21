/*global describe, it, beforeEach, afterEach*/
const { validateGaugeOptions } = require('../../../lib/validators/inputValidators');
const assert = require('assert');

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
