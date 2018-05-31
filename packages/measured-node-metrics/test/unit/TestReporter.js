const { Reporter } = require('measured-reporting');

/**
 * @extends Reporter
 */
class TestReporter extends Reporter {
  constructor(options) {
    super(options);

    this._reportedMetrics = [];
  }

  getReportedMetrics() {
    return this._reportedMetrics;
  }

  _reportMetrics(metrics) {
    this._reportedMetrics.push(metrics);
  }
}

module.exports = TestReporter;