const { NoOpMeter, Timer } = require('measured-core');
const { SelfReportingMetricsRegistry } = require('measured-reporting');
const { validateTimerOptions } = require('measured-reporting').inputValidators;

/**
 * A SignalFx Self Reporting Metrics Registry that disallows the use of meters.
 * Meters don't make sense to use with SignalFx because the rate aggregations can be done within SignalFx itself.
 * Meters simply waste DPM (Datapoints per Minute).
 *
 * @extends {SelfReportingMetricsRegistry}
 */
class SignalFxSelfReportingMetricsRegistry extends SelfReportingMetricsRegistry {
  /**
   * Creates a {@link Timer} or get the existing Timer for a given name and dimension combo with a NoOpMeter.
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
   * Meters are not reported to SignalFx.
   * Meters do not make sense to use with SignalFx because the same values can be calculated
   * using simple counters and aggregations within SignalFx itself.
   *
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
