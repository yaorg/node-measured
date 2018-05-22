const { NoOpMeter, Timer } = require('measured-core');
const { SelfReportingMetricsRegistry } = require('measured-reporting');
const { validateTimerOptions } = require('measured-reporting').inputValidators;

/**
 * A SignalFx Self Reporting Metrics Registry that disallows the use of meters as they waste DPM and accomplished using a counter.
 * @extends {SelfReportingMetricsRegistry}
 */
class SignalFxSelfReportingMetricsRegistry extends SelfReportingMetricsRegistry {

  /**
   * @param {Reporter} reporter The Metrics Reporter
   * @param {SelfReportingMetricsRegistryOptions} [options] Configurable options for the Self Reporting Metrics Registry
   */
  constructor(reporter, options) {
    super(reporter, options)
  }

  /**
   * Creates a {@link Timer} or get the existing Timer for a given name and dimension combo with a NoOpMeter
   *
   * @param {string} name The Metric name
   * @param {Dimensions} dimensions any custom {@link Dimensions} for the Metric
   * @param {number} publishingIntervalInSeconds a optional custom publishing interval
   * @return {Timer}
   */
  getOrCreateTimer(name, dimensions, publishingIntervalInSeconds) {
    validateTimerOptions(name, dimensions, publishingIntervalInSeconds);

    let timer;
    if (this._registry.hasMetric(name, dimensions)) {
      timer = this._registry.getMetric(name, dimensions);
    } else {
      timer = new Timer({ meter: new NoOpMeter() });
      const key = this._registry.putMetric(name, timer, dimensions);
      this._reporter.reportMetricOnInterval(key, publishingIntervalInSeconds);
    }

    return timer;
  }

  /**
   * You should use counters and implements meter functionality in your Dashboard.
   * @param {string} name The Metric name
   * @param {Dimensions} dimensions any custom {@link Dimensions} for the Metric
   * @param {number} publishingIntervalInSeconds a optional custom publishing interval
   * @return {NoOpMeter|*}
   */
  getOrCreateMeter(name, dimensions, publishingIntervalInSeconds) {
    this._log.error(
      'Meters will not get reported using the SignalFx reporter as they waste DPM, please use a counter instead'
    );
    return new NoOpMeter();
  }
}

module.exports = SignalFxSelfReportingMetricsRegistry;
