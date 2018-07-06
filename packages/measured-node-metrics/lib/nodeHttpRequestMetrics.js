const { Stopwatch } = require('measured-core');

/**
 * The default reporting interval for requests
 * @type {number}
 */
const DEFAULT_REQUEST_METRICS_REPORTING_INTERVAL_IN_SECONDS = 10;

/**
 * This module has functions needed to create middlewares for frameworks such as express.
 * It also exports the 2 functions needed to implement your own middleware.
 * If you implement a middleware for a framework not implemented here, please contribute it back.
 *
 * @module node-http-request-metrics
 */
module.exports = {
  /**
   * Creates an Express middleware that reports a timer on request data.
   * With this middleware you will get requests counts and latency percentiles all filterable by status codes, http method, and uri paths.
   *
   * @param {SelfReportingMetricsRegistry} metricsRegistry
   * @param {number} [reportingIntervalInSeconds]
   * @return {Function}
   */
  createExpressMiddleware: (metricsRegistry, reportingIntervalInSeconds) => {
    return (req, res, next) => {
      const stopwatch = module.exports.onRequestStart();

      req.on('end', () => {
        const { method } = req;
        const { statusCode } = res;
        const uri = req.route ? req.route.path : '_unknown';
        module.exports.onRequestEnd(metricsRegistry, stopwatch, method, statusCode, uri, reportingIntervalInSeconds);
      });

      next();
    };
  },

  /**
   * At the start of the request, create a stopwatch, that starts tracking how long the request is taking.
   * @return {Stopwatch}
   */
  onRequestStart: () => {
    return new Stopwatch();
  },

  /**
   * When the request ends stop the stop watch and create or update the timer for requests that tracked by method, status code, path.
   * The timers (meters and histograms) that get reported will be filterable by status codes, http method, the uri path.
   * You will be able to create dash boards such as success percentage, latency percentiles by uri path and method, etc.
   *
   * @param {SelfReportingMetricsRegistry} metricsRegistry The Self Reporting Metrics Registry
   * @param {Stopwatch} stopwatch The stopwatch created by onRequestStart
   * @param {string} method The Http Method for the request
   * @param {string|number} statusCode The status code for the response
   * @param {string} [uri] The uri path for the request. Please note to avoid out of control time series dimension creation spread,
   * you would want to strip out ids and or other variables from the uri path.
   * @param {number} [reportingIntervalInSeconds] override the reporting interval defaults to every 10 seconds.
   */
  onRequestEnd: (metricsRegistry, stopwatch, method, statusCode, uri, reportingIntervalInSeconds) => {
    reportingIntervalInSeconds = reportingIntervalInSeconds || DEFAULT_REQUEST_METRICS_REPORTING_INTERVAL_IN_SECONDS;

    const customDimensions = {
      statusCode: `${statusCode}`,
      method: `${method}`
    };

    if (uri) {
      customDimensions.uri = uri;
    }

    // get or create the timer for the request count/latency timer
    const requestTimer = metricsRegistry.getOrCreateTimer('requests', customDimensions, reportingIntervalInSeconds);

    // stop the request latency counter
    const time = stopwatch.end();
    requestTimer.update(time);
  }
};
