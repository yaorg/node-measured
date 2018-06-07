const Reporter = require('./Reporter');

/**
 * A reporter impl that simply logs the metrics via the Logger.
 *
 * @example
 * const { SelfReportingMetricsRegistry, LoggingReporter } = require('measured-reporting');
 * const registry = new SelfReportingMetricsRegistry(new LoggingReporter());
 *
 * @extends {Reporter}
 */
class LoggingReporter extends Reporter {
  /**
   * Logs the metrics via the inherited logger instance.
   * @param {MetricWrapper[]} metrics
   * @protected
   */
  _reportMetrics(metrics) {
    metrics.forEach(metric => {
      this._log.info(
        JSON.stringify({
          metricName: metric.name,
          dimensions: this._getDimensions(metric),
          data: metric.metricImpl.toJSON()
        })
      );
    });
  }
}

module.exports = LoggingReporter;
