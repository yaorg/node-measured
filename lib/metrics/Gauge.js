const { METRIC_TYPES } = require('./Metric');

/**
 * Values that can be read instantly
 * @implements {Metric}
 * @example
 * var Measured = require('measured')
 * var gauge = new Measured.Gauge(function() {
 *     return process.memoryUsage().rss;
 * });
 */
class Gauge {
  /**
   * @param {function} readFn A function that returns the numeric value for this gauge.
   */
  constructor(readFn) {
    this._readFn = readFn;
  }

  /**
   * This is sync for now, but maybe async gauges would be useful as well?
   * @return {number} Gauges directly return the value from the callback which should be a number.
   */
  toJSON() {
    return this._readFn();
  }

  /**
   * @inheritDoc
   */
  getType() {
    return METRIC_TYPES.GAUGE;
  }
}

module.exports = Gauge;
