const Optional = require('optional-js');

/**
 * This module contains various validators to validate publicly exposed input
 * @module inputValidators
 * @private
 */
module.exports = {
  /**
   * Validates @{link Gauge} options.
   *
   * @param {string} name The metric name
   * @param {function} callback The callback for the Gauge
   * @param {Dimensions} dimensions The optional custom dimensions
   * @param {number} publishingIntervalInSeconds the optional publishing interval
   */
  validateGaugeOptions: (name, callback, dimensions, publishingIntervalInSeconds) => {
    module.exports.validateMetricName(name);
    module.exports.validateNumberReturningCallback(callback);
    module.exports.validateOptionalDimensions(dimensions);
    module.exports.validateOptionalPublishingInterval(publishingIntervalInSeconds);
  },

  /**
   * Validates the create histogram Options.
   *
   * @param {string} name The metric name
   * @param {Dimensions} dimensions The optional custom dimensions
   * @param {number} publishingIntervalInSeconds the optional publishing interval
   */
  validateHistogramOptions: (name, dimensions, publishingIntervalInSeconds) => {
    module.exports.validateMetricName(name);
    module.exports.validateOptionalDimensions(dimensions);
    module.exports.validateOptionalPublishingInterval(publishingIntervalInSeconds);
  },

  /**
   * Validates the create counter Options.
   *
   * @param {string} name The metric name
   * @param {Dimensions} dimensions The optional custom dimensions
   * @param {number} publishingIntervalInSeconds the optional publishing interval
   */
  validateCounterOptions: (name, dimensions, publishingIntervalInSeconds) => {
    module.exports.validateMetricName(name);
    module.exports.validateOptionalDimensions(dimensions);
    module.exports.validateOptionalPublishingInterval(publishingIntervalInSeconds);
  },

  /**
   * Validates the create timer Options.
   *
   * @param {string} name The metric name
   * @param {Dimensions} dimensions The optional custom dimensions
   * @param {number} publishingIntervalInSeconds the optional publishing interval
   */
  validateTimerOptions: (name, dimensions, publishingIntervalInSeconds) => {
    module.exports.validateMetricName(name);
    module.exports.validateOptionalDimensions(dimensions);
    module.exports.validateOptionalPublishingInterval(publishingIntervalInSeconds);
  },

  /**
   * Validates the create timer Options.
   *
   * @param {string} name The metric name
   * @param {Metric} metric The metric instance
   * @param {Dimensions} dimensions The optional custom dimensions
   * @param {number} publishingIntervalInSeconds the optional publishing interval
   */
  validateRegisterOptions: (name, metric, dimensions, publishingIntervalInSeconds) => {
    module.exports.validateMetricName(name);
    // todo validate metric
    module.exports.validateOptionalDimensions(dimensions);
    module.exports.validateOptionalPublishingInterval(publishingIntervalInSeconds);
  },

  /**
   * Validates the metric name.
   *
   * @param name The metric name.
   */
  validateMetricName: name => {
    const type = typeof name;
    if (type !== 'string') {
      throw new Error(`options.name is a required option and must be of type string, actual type: ${type}`);
    }
  },

  /**
   * Validates the provided callback.
   *
   * @param callback The provided callback for a gauge.
   */
  validateNumberReturningCallback: callback => {
    const type = typeof callback;
    if (type !== 'function') {
      throw new Error(`options.callback is a required option and must be function, actual type: ${type}`);
    }

    const callbackType = typeof callback();
    if (callbackType !== 'number') {
      throw new Error(`options.callback must return a number, actual return type: ${callbackType}`);
    }
  },

  /**
   * Validates a set of optional dimensions
   * @param dimensionsOptional
   */
  validateOptionalDimensions: dimensionsOptional => {
    Optional.ofNullable(dimensionsOptional).ifPresent(dimensions => {
      const type = typeof dimensions;
      if (type !== 'object') {
        throw new Error(`options.dimensions should be an object, actual type: ${type}`);
      }
      Object.keys(dimensions).forEach(key => {
        const valueType = typeof dimensions[key];
        if (valueType !== 'string') {
          throw new Error(`options.dimensions.${key} should be of type string, actual type: ${type}`);
        }
      });
    });
  },

  /**
   * Validates an optional logger instance
   * @param loggerOptional
   */
  validateOptionalLogger: loggerOptional => {
    Optional.ofNullable(loggerOptional).ifPresent(logger => {
      if (
        typeof logger.trace !== 'function' ||
        typeof logger.debug !== 'function' ||
        typeof logger.info !== 'function' ||
        typeof logger.warn !== 'function' ||
        typeof logger.error !== 'function'
      ) {
        throw new Error(
          'The logger that was passed in does not support all required ' +
            'logging methods, expected object to have functions trace, debug, info, warn, and error with ' +
            'method signatures (...msgs) => {}'
        );
      }
    });
  },

  /**
   * Validates the optional publishing interval.
   *
   * @param publishingIntervalInSecondsOptional The optional publishing interval.
   */
  validateOptionalPublishingInterval: publishingIntervalInSecondsOptional => {
    Optional.ofNullable(publishingIntervalInSecondsOptional).ifPresent(publishingIntervalInSeconds => {
      const type = typeof publishingIntervalInSeconds;
      if (type !== 'number') {
        throw new Error(`options.publishingIntervalInSeconds must be of type number, actual type: ${type}`);
      }
    });
  },

  validateReporterParameters: options => {
    module.exports.validateOptionalDimensions(options.defaultDimensions);
    module.exports.validateOptionalLogger(options.logger);
  },

  /**
   * Validates that a valid Reporter object has been supplied
   */
  validateReporterInstance: reporter => {
    // TODO implement
  },

  /**
   * Validates the input parameters for a {@link SelfReportingMetricsRegistry}
   * @param reporter
   * @param logger
   */
  validateSelfReportingMetricsRegistryParameters: (reporter, logger) => {
    // TODO implement
  }
};
