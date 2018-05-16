/**
 * Interface for Metric types
 *
 * @interface Metric
 */
// eslint-disable-next-line no-unused-vars
class Metric {
  /**
   * @return {any} Returns the data from the Metric
   */
  toJSON() {}

  /**
   * @return {string} The type of the Metric Impl
   */
  getType() {}
}

const METRIC_TYPES = {
  COUNTER: 'Counter',
  GAUGE: 'Gauge',
  HISTOGRAM: 'Histogram',
  METER: 'Meter',
  TIMER: 'Timer'
};

module.exports = {
  METRIC_TYPES
};
