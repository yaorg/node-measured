const { MetricTypes } = require('../metrics/Metric');

const metricTypeValues = Object.values(MetricTypes);

/**
 * This module contains various validators to validate publicly exposed input.
 *
 * @module metricValidators
 */
module.exports = {
  /**
   * Validates that a metric implements the metric interface.
   *
   * @param {Metric} metric The object that is supposed to be a metric.
   */
  validateMetric: metric => {
    if (!metric) {
      throw new TypeError('The metric was undefined, when it was required');
    }
    if (typeof metric.toJSON !== 'function') {
      throw new TypeError('Metrics must implement toJSON(), see the Metric interface in the docs.');
    }
    if (typeof metric.getType !== 'function') {
      throw new TypeError('Metrics must implement getType(), see the Metric interface in the docs.');
    }
    const type = metric.getType();

    if (!metricTypeValues.includes(type)) {
      throw new TypeError(
        `Metric#getType(), must return a type defined in MetricsTypes. Found: ${type}, Valid values: ${metricTypeValues.join(
          ', '
        )}`
      );
    }
  }
};
