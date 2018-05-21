const bunyan = require('bunyan');
const { Gauge } = require('measured-core');
const { Timer } = require('measured-core');
const { Counter } = require('measured-core');
const { Meter } = require('measured-core');
const { Histogram } = require('measured-core');
const {
  validateSelfReportingMetricsRegistryParameters,
  validateRegisterOptions,
  validateGaugeOptions,
  validateCounterOptions,
  validateHistogramOptions,
  validateTimerOptions
} = require('../validators/inputValidators');

/**
 * A dimensional aware self-reporting metrics registry
 */
class SelfReportingMetricsRegistry {
  /**
   * @param {IntervalBasedMetricsReporter} reporter The Metrics Reporter
   * @param {SelfReportingMetricsRegistryOptions} options Configurable options for the Self Reporting Metrics Registry
   */
  constructor(reporter, options) {
    options = options || {};
    validateSelfReportingMetricsRegistryParameters(reporter, options.logger);

    this._metrics = {};

    this._reporter = reporter;
    if (options.logger !== undefined) {
      this._log = options.logger;
    } else {
      this._log = bunyan.createLogger({
        name: 'SelfReportingMetricsRegistry',
        level: options.logLevel || 'info'
      });
    }
  }

  /**
   * Registers a manually created Metric.
   *
   * @param {string} name The Metric name
   * @param {Metric} metric The {@link Metric} to register
   * @param {Dimensions} dimensions any custom {@link Dimensions} for the Metric
   * @param {number} publishingIntervalInSeconds a optional custom publishing interval
   * @example
   * const settableGauge = new SettableGauge(5);
   * // register the gauge and have it report to every 10 seconds
   * registry.register('my-gauge', settableGauge, {}, 10);
   * interval(() => {
   *    // such as cpu % used
   *    determineAValueThatCannotBeSync((value) => {
   *      settableGauge.update(value);
   *    })
   * }, 10000)
   */
  register(name, metric, dimensions, publishingIntervalInSeconds) {
    validateRegisterOptions(name, metric, dimensions, publishingIntervalInSeconds);

    if (this.hasMetric(name, dimensions)) {
      throw new Error(
        `Metric with name: ${name} and dimensions: ${JSON.stringify(dimensions)} has already been registered`
      );
    } else {
      const key = this._putMetric(name, metric, dimensions);
      this._reporter.reportMetricOnInterval(key, publishingIntervalInSeconds);
    }
    return metric;
  }

  /**
   * Creates a {@link Gauge} or get the existing Gauge for a given name and dimension combo
   *
   * @param {string} name The Metric name
   * @param {function} callback The callback that will return a value to report to signal fx
   * @param {Dimensions} dimensions any custom {@link Dimensions} for the Metric
   * @param {number} publishingIntervalInSeconds a optional custom publishing interval
   * @return {Gauge}
   * @example
   * // https://nodejs.org/api/process.html#process_process_memoryusage
   * // Report heap total and heap used at the default interval
   * registry.getOrCreateGauge(
   *   'process-memory-heap-total',
   *   () => {
   *     return process.memoryUsage().heapTotal
   *   }
   * );
   * registry.getOrCreateGauge(
   *   'process-memory-heap-used',
   *   () => {
   *     return process.memoryUsage().heapUsed
   *   }
   * )
   */
  getOrCreateGauge(name, callback, dimensions, publishingIntervalInSeconds) {
    validateGaugeOptions(name, callback, dimensions, publishingIntervalInSeconds);
    let gauge;
    if (this.hasMetric(name, dimensions)) {
      gauge = this.getMetric(name, dimensions);
    } else {
      gauge = new Gauge(callback);
      const key = this._putMetric(name, gauge, dimensions);
      this._reporter.reportMetricOnInterval(key, publishingIntervalInSeconds);
    }
    return gauge;
  }

  /**
   * Creates a {@link Histogram} or get the existing Histogram for a given name and dimension combo
   *
   * @param {string} name The Metric name
   * @param {Dimensions} dimensions any custom {@link Dimensions} for the Metric
   * @param {number} publishingIntervalInSeconds a optional custom publishing interval
   * @return {Histogram}
   */
  getOrCreateHistogram(name, dimensions, publishingIntervalInSeconds) {
    validateHistogramOptions(name, dimensions, publishingIntervalInSeconds);

    let histogram;
    if (this.hasMetric(name, dimensions)) {
      histogram = this.getMetric(name, dimensions);
    } else {
      histogram = new Histogram();
      const key = this._putMetric(name, histogram, dimensions);
      this._reporter.reportMetricOnInterval(key, publishingIntervalInSeconds);
    }

    return histogram;
  }

  /**
   * Creates a {@link Meter} or get the existing Meter for a given name and dimension combo
   *
   * @param {string} name The Metric name
   * @param {Dimensions} dimensions any custom {@link Dimensions} for the Metric
   * @param {number} publishingIntervalInSeconds a optional custom publishing interval
   * @return {Meter}
   */
  getOrCreateMeter(name, dimensions, publishingIntervalInSeconds) {
    validateHistogramOptions(name, dimensions, publishingIntervalInSeconds);

    let meter;
    if (this.hasMetric(name, dimensions)) {
      meter = this.getMetric(name, dimensions);
    } else {
      meter = new Meter();
      const key = this._putMetric(name, meter, dimensions);
      this._reporter.reportMetricOnInterval(key, publishingIntervalInSeconds);
    }

    return meter;
  }

  /**
   * Creates a {@link Counter} or get the existing Counter for a given name and dimension combo
   *
   * @param {string} name The Metric name
   * @param {Dimensions} dimensions any custom {@link Dimensions} for the Metric
   * @param {number} publishingIntervalInSeconds a optional custom publishing interval
   * @return {Counter}
   */
  getOrCreateCounter(name, dimensions, publishingIntervalInSeconds) {
    validateCounterOptions(name, dimensions, publishingIntervalInSeconds);

    let counter;
    if (this.hasMetric(name, dimensions)) {
      counter = this.getMetric(name, dimensions);
    } else {
      counter = new Counter();
      const key = this._putMetric(name, counter, dimensions);
      this._reporter.reportMetricOnInterval(key, publishingIntervalInSeconds);
    }

    return counter;
  }

  /**
   * Creates a {@link Timer} or get the existing Timer for a given name and dimension combo.
   *
   * @param {string} name The Metric name
   * @param {Dimensions} dimensions any custom {@link Dimensions} for the Metric
   * @param {number} publishingIntervalInSeconds a optional custom publishing interval
   * @return {Timer}
   */
  getOrCreateTimer(name, dimensions, publishingIntervalInSeconds) {
    validateTimerOptions(name, dimensions, publishingIntervalInSeconds);

    let timer;
    if (this.hasMetric(name, dimensions)) {
      timer = this.getMetric(name, dimensions);
    } else {
      timer = new Timer();
      const key = this._putMetric(name, timer, dimensions);
      this._reporter.reportMetricOnInterval(key, publishingIntervalInSeconds);
    }

    return timer;
  }

  /**
   * Checks to see if a metric with the given name and dimensions is present.
   *
   * @param {string} name The metric name
   * @param {Dimensions} dimensions The dimensions for the metric
   * @returns {boolean} true if the metric with given dimensions is present
   * @protected
   */
  hasMetric(name, dimensions) {
    const key = this._generateStorageKey(name, dimensions);
    return Object.prototype.hasOwnProperty.call(this._metrics, key);
  }

  /**
   * Retrieves a metric with a given name and dimensions is present.
   *
   * @param {string} name The metric name
   * @param {Dimensions} dimensions The dimensions for the metric
   * @returns {Metric} a wrapper object around name, dimension and {@link Metric}
   * @protected
   */
  getMetric(name, dimensions) {
    const key = this._generateStorageKey(name, dimensions);
    return this._metrics[key].metricImpl;
  }

  /**
   * Retrieves a metric by the calculated key (name / dimension combo).
   *
   * @param {string} key The registered key for the given registered {@link MetricWrapper}
   * @returns {MetricWrapper} a wrapper object around name, dimension and {@link Metric}
   * @protected
   */
  getMetricWrapperByKey(key) {
    return this._metrics[key];
  }

  /**
   * Upserts a {@link Metric} in the internal storage map for a given name, dimension combo
   *
   * @param {string} name The metric name
   * @param {Metric} metric The {@link Metric} impl
   * @param {Dimensions} dimensions The dimensions for the metric
   * @return {string} The registry key for the metric, dimension combo
   * @protected
   */
  _putMetric(name, metric, dimensions) {
    const key = this._generateStorageKey(name, dimensions);
    this._metrics[key] = {
      name: name,
      metricImpl: metric,
      dimensions: dimensions || {}
    };
    return key;
  }

  /**
   * Generates a unique key off of the metric name and custom dimensions for internal use in the registry maps.
   *
   * @param {string} name The metric name
   * @param {Dimensions} dimensions The dimensions for the metric
   * @return {string} a unique key based off of the metric nae and dimensions
   * @protected
   */
  _generateStorageKey(name, dimensions) {
    let key = name;
    if (dimensions) {
      Object.keys(dimensions).forEach(dimensionKey => {
        key = `${key}-${dimensions[dimensionKey]}`;
      });
    }
    return key;
  }
}

module.exports = {
  SelfReportingMetricsRegistry
};

/**
 * Configurable options for the Self Reporting Metrics Registry
 *
 * @interface SelfReportingMetricsRegistryOptions
 * @typedef SelfReportingMetricsRegistryOptions
 * @property {Logger} logger the Logger to use
 * @property {string} logLevel The Log level to use if defaulting to included logger
 */
