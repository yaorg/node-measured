const SelfReportingMetricsRegistry = require('./registries/SelfReportingMetricsRegistry');
const Reporter = require('./reporters/Reporter');
const inputValidators = require('./validators/inputValidators');

/**
 * The main measured module that is referenced when require('measured-reporting') is used.
 * @module measured-reporting
 */
module.exports = {
  /**
   * @type {SelfReportingMetricsRegistry}
   */
  SelfReportingMetricsRegistry,
  /**
   * @type {Reporter}
   */
  Reporter,
  /**
   * @type {inputValidators}
   */
  inputValidators
};
