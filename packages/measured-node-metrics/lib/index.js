const { nodeProcessMetrics, createProcessMetrics } = require('./nodeProcessMetrics');
const { nodeOsMetrics, createOSMetrics } = require('./nodeOsMetrics');
const { createExpressMiddleware, onRequestStart, onRequestEnd } = require('./nodeHttpRequestMetrics');

/**
 * The main module for the measured-node-metrics lib.
 *
 * Various functions to help create node metrics and http framework middlewares
 * that can be used with a self reporting metrics registry to easily instrument metrics for a node app.
 *
 * @module measured-node-metrics
 */
module.exports = {
  /**
   * Map of metric names and a functions that can be used to generate that metric object that can be registered with a
   * self reporting metrics registry or used as seen fit.
   *
   * See {@link nodeProcessMetrics}.
   *
   * @type {Object.<string, function>}
   */
  nodeProcessMetrics,

  /**
   * Method that can be used to add a set of default node process metrics to your node app.
   *
   * registers all metrics defined in the {@link nodeProcessMetrics} map.
   *
   * @function
   * @name createProcessMetrics
   * @param {SelfReportingMetricsRegistry} metricsRegistry
   * @param {Dimensions} customDimensions
   * @param {number} reportingIntervalInSeconds
   */
  createProcessMetrics,

  /**
   * Map of metric names and a functions that can be used to generate that metric object that can be registered with a
   * self reporting metrics registry or used as seen fit.
   *
   * See {@link nodeOsMetrics}.
   *
   * @type {Object.<string, function>}
   */
  nodeOsMetrics,

  /**
   * Method that can be used to add a set of default node process metrics to your app.
   *
   * registers all metrics defined in the {@link nodeOsMetrics} map.
   *
   * @function
   * @name createOSMetrics
   * @param {SelfReportingMetricsRegistry} metricsRegistry
   * @param {Dimensions} customDimensions
   * @param {number} reportingIntervalInSeconds
   */
  createOSMetrics,

  /**
   * Creates an Express middleware that reports a timer on request data.
   * With this middleware you will get requests counts and latency percentiles all filterable by status codes, http method, and uri paths.
   *
   * @function
   * @name createExpressMiddleware
   * @param {SelfReportingMetricsRegistry} metricsRegistry
   * @param {number} [reportingIntervalInSeconds]
   * @return {Function}
   */
  createExpressMiddleware,

  /**
   * At the start of the request, create a stopwatch, that starts tracking how long the request is taking.
   * @function
   * @name onRequestStart
   * @return {Stopwatch}
   */
  onRequestStart,

  /**
   * When the request ends stop the stop watch and create or update the timer for requests that tracked by method, statuscode, path.
   * The timers (meters and histograms) that get reported will be filterable by status codes, http method, the uri path.
   * You will be able to create dash boards such as success percentage, latency percentiles by path and method, etc.
   *
   * @function
   * @name onRequestEnd
   * @param metricsRegistry The Self Reporting Metrics Registry
   * @param stopwatch The stopwatch created by onRequestStart
   * @param method The Http Method for the request
   * @param statusCode The status code for the response
   * @param [uri] The uri for the request. Please note to avoid out of control time series dimension creation spread,
   * you would want to strip out ids and or other variables from the uri path.
   * @param [reportingIntervalInSeconds] override the reporting interval defaults to every 10 seconds.
   */
  onRequestEnd
};
