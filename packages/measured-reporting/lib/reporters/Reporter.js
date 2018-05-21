const bunyan = require('bunyan');
const Optional = require('optional-js');
const { validateReporterParameters } = require('../validators/inputValidators');

/**
 * The abstract reporter that specific implementations can extend to create a Self Reporting Metrics Registry Reporter.
 *
 * {@link SelfReportingMetricsRegistry}
 * @abstract
 */
class Reporter {
  /**
   * @param {ReporterOptions} options The optional params to supply when creating a reporter.
   */
  constructor(options) {
    validateReporterParameters(options);

    /**
     * Map of intervals to metric keys, this will be used to look up what metrics should be reported at a given interval.
     * @type {Object.<number, string>}
     * @protected
     */
    this._intervalToMetric = {};

    /**
     * Map of default dimensions, that should be sent with every metric
     * @type {Dimensions}
     * @protected
     */
    this._defaultDimensions = Object.prototype.hasOwnProperty.call(options, 'defaultDimensions')
      ? options.defaultDimensions
      : {};

    /**
     * Loggers to use, defaults to a new bunyan logger if nothing is supplied in options
     * @type {Logger}
     * @protected
     */
    this._log = Object.prototype.hasOwnProperty.call(options, 'logger')
      ? options.logger
      : bunyan.createLogger({ name: 'Reporter', level: 'info' });
  }

  /**
   * Sets the registry, this must be called before reportMetricOnInterval.
   *
   * @param {SelfReportingMetricsRegistry} registry
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
    if (Object.prototype.hasOwnProperty.call(this._intervalToMetric, intervalInSeconds)) {
      this._intervalToMetric[intervalInSeconds].add(metricKey);
    } else {
      this._intervalToMetric[intervalInSeconds] = new Set([metricKey]);
      this._reportMetricsWithInterval(intervalInSeconds);
      this._createTimedCallback(intervalInSeconds);
    }
  }

  /**
   * Creates the timed callback loop for the given interval.
   *
   * @param {number} intervalInSeconds the interval in seconds for the timeout callback
   * @protected
   */
  _createTimedCallback(intervalInSeconds) {
    this._log.debug(`createTimedCallback() called with intervalInSeconds: ${intervalInSeconds}`);
    setTimeout(() => {
      this._reportMetricsWithInterval(intervalInSeconds);
      this._createTimedCallback(intervalInSeconds);
    }, intervalInSeconds * 1000);
  }

  /**
   * Gathers all the metrics that have been registered to report on the given interval.
   *
   * @param {number} interval The interval to look up what metrics to report
   * @protected
   */
  _reportMetricsWithInterval(interval) {
    this._log.debug(`sendMetricsWithInterval() called with intervalInSeconds: ${interval}`);
    try {
      Optional.of(this._intervalToMetric[interval]).ifPresent(metrics => {
        const metricsToSend = [];
        metrics.forEach(metricKey => {
          metricsToSend.push(this._registry._getMetricWrapperByKey(metricKey));
          this._reportMetrics(metricsToSend);
        });
      });
    } catch (error) {
      this._log.error('Failed to send metrics to signal fx', error);
    }
  }

  /**
   * This method gets called with an array of {@link MetricWrapper} on an interval, when metrics should be reported.
   *
   * @param {MetricWrapper[]} metrics The array of metrics to report.
   * @protected
   * @abstract
   */
  _reportMetrics(metrics) {
    if (this === Reporter) {
      throw new TypeError('Abstract method _reportMetrics(metrics) must be implemented in implementation class');
    }
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
}

/**
 * Options for creating a {@link Reporter}
 * @interface ReporterOptions
 * @typedef ReporterOptions
 * @type {Object}
 * @property {Dimensions} defaultDimensions A dictionary of dimensions to include with every metric reported
 * @property {Logger} logger The logger to use, if not supplied a new Buynan logger will be created
 */
