const bunyan = require('bunyan');
const Optional = require('optional-js');
const { validateReporterParameters } = require('../validators/inputValidators');

const DEFAULT_REPORTING_INTERVAL_IN_SECONDS = 10;

/**
 * The abstract reporter that specific implementations can extend to create a Self Reporting Metrics Registry Reporter.
 *
 * {@link SelfReportingMetricsRegistry}
 * @abstract
 */
class Reporter {
  /**
   * @param {ReporterOptions} [options] The optional params to supply when creating a reporter.
   */
  constructor(options) {
    if (this.constructor === Reporter) {
      throw new TypeError("Can't instantiate abstract class!");
    }

    options = options || {};
    validateReporterParameters(options);

    /**
     * Map of intervals to metric keys, this will be used to look up what metrics should be reported at a given interval.
     * @type {Object.<number, Set<string>>}
     * @private
     */
    this._intervalToMetric = {};
    this._intervals = [];

    /**
     * Map of default dimensions, that should be sent with every metric
     * @type {Dimensions}
     * @protected
     */
    this._defaultDimensions = options.defaultDimensions || {};

    /**
     * Loggers to use, defaults to a new bunyan logger if nothing is supplied in options
     * @type {Logger}
     * @protected
     */
    this._log = options.logger || bunyan.createLogger({ name: 'Reporter', level: options.logLevel || 'info' });

    /**
     * the default interval a number in seconds.
     * @type {number}
     * @protected
     */
    this._defaultReportingIntervalInSeconds =
      options.defaultReportingIntervalInSeconds || DEFAULT_REPORTING_INTERVAL_IN_SECONDS;
  }

  /**
   * Sets the registry, this must be called before reportMetricOnInterval.
   *
   * @param {DimensionAwareMetricsRegistry} registry
   */
  setRegistry(registry) {
    this._registry = registry;
  }

  /**
   * Informs the reporter to report a metric on a given interval in seconds.
   *
   * @param {string} metricKey The metric key for the metric in the metric registry.
   * @param {number} intervalInSeconds The interval in seconds to report the metric on.
   */
  reportMetricOnInterval(metricKey, intervalInSeconds) {
    intervalInSeconds = intervalInSeconds || this._defaultReportingIntervalInSeconds;

    if (!this._registry) {
      throw new Error(
        'You must call setRegistry(registry) before telling a Reporter to report a metric on an interval.'
      );
    }

    if (Object.prototype.hasOwnProperty.call(this._intervalToMetric, intervalInSeconds)) {
      this._intervalToMetric[intervalInSeconds].add(metricKey);
    } else {
      this._intervalToMetric[intervalInSeconds] = new Set([metricKey]);
      this._reportMetricsWithInterval(intervalInSeconds);
      this._createIntervalCallback(intervalInSeconds);
    }
  }

  /**
   * Creates the timed callback loop for the given interval.
   *
   * @param {number} intervalInSeconds the interval in seconds for the timeout callback
   * @private
   */
  _createIntervalCallback(intervalInSeconds) {
    this._log.debug(`_createIntervalCallback() called with intervalInSeconds: ${intervalInSeconds}`);
    this._intervals.push(
      setInterval(() => {
        this._reportMetricsWithInterval(intervalInSeconds);
      }, intervalInSeconds * 1000)
    );
  }

  /**
   * Gathers all the metrics that have been registered to report on the given interval.
   *
   * @param {number} interval The interval to look up what metrics to report
   * @private
   */
  _reportMetricsWithInterval(interval) {
    this._log.debug(`_reportMetricsWithInterval() called with intervalInSeconds: ${interval}`);
    try {
      Optional.of(this._intervalToMetric[interval]).ifPresent(metrics => {
        const metricsToSend = [];
        metrics.forEach(metricKey => {
          metricsToSend.push(this._registry.getMetricWrapperByKey(metricKey));
        });
        this._reportMetrics(metricsToSend);
      });
    } catch (error) {
      this._log.error('Failed to send metrics to signal fx', error);
    }
  }

  /**
   * This method gets called with an array of {@link MetricWrapper} on an interval, when metrics should be reported.
   *
   * This is the main method that needs to get implemented when created an aggregator specific reporter.
   *
   * @param {MetricWrapper[]} metrics The array of metrics to report.
   * @protected
   * @abstract
   */
  _reportMetrics(metrics) {
    throw new TypeError('Abstract method _reportMetrics(metrics) must be implemented in implementation class');
  }

  /**
   *
   * @param {MetricWrapper} metric The Wrapped Metric Object.
   * @return {Dimensions} The left merged default dimensions with the metric specific dimensions
   * @protected
   */
  _getDimensions(metric) {
    return Object.assign({}, this._defaultDimensions, metric.dimensions);
  }

  /**
   * Clears the intervals that are running to report metrics at an interval, and resets the state.
   */
  shutdown() {
    this._intervals.forEach(interval => clearInterval(interval));
    this._intervals = [];
    this._intervalToMetric = {};
  }
}

/**
 * Options for creating a {@link Reporter}
 * @interface ReporterOptions
 * @typedef ReporterOptions
 * @type {Object}
 * @property {Dimensions} defaultDimensions A dictionary of dimensions to include with every metric reported
 * @property {Logger} logger The logger to use, if not supplied a new Buynan logger will be created
 * @property {string} logLevel The log level to use with the created Bunyan logger if you didn't supply your own logger.
 * @property {number} defaultReportingIntervalInSeconds The default reporting interval to use if non is supplied when registering a metric, defaults to 10 seconds.
 */

module.exports = Reporter;
