const SignalFxMetricsReporter = require('./reporters/SignalFxMetricsReporter');
const SignalFxSelfReportingMetricsRegistry = require('./registries/SignalFxSelfReportingMetricsRegistry');

/**
 * The main measured module that is referenced when require('measured-signalfx-reporter') is used.
 * @module measured-signalfx-reporter
 */
module.exports = {
  /**
   * {@type SignalFxMetricsReporter}
   */
  SignalFxMetricsReporter,
  /**
   * {@type SignalFxSelfReportingMetricsRegistry}
   */
  SignalFxSelfReportingMetricsRegistry
};
