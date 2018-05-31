const { Gauge } = require('measured-core');
const process = require('process');

/**
 * The default reporting interval for node process metrics is 30 seconds.
 *
 * @type {number}
 */
const DEFAULT_NODE_PROCESS_METRICS_REPORTING_INTERVAL_IN_SECONDS = 30;

/**
 * A map of Metric generating functions, that create Metrics to measure node process stats.
 * @type {Object.<string, function>}
 */
const nodeProcessMetrics = {
  /**
   * Creates a gauge that reports the rss from the node memory usage api.
   * See {@link https://nodejs.org/api/process.html#process_process_memoryusage} for more information.
   *
   * @return {Gauge}
   */
  'node.process.memory-usage.rss': () => {
    return new Gauge(() => {
      return process.memoryUsage().rss;
    });
  },
  /**
   * See {@link https://nodejs.org/api/process.html#process_process_memoryusage} for more information.
   *
   * @return {Gauge}
   */
  'node.process.memory-usage.heap-total': () => {
    return new Gauge(() => {
      return process.memoryUsage().heapTotal;
    });
  },
  /**
   * See {@link https://nodejs.org/api/process.html#process_process_memoryusage} for more information.
   *
   * @return {Gauge}
   */
  'node.process.memory-usage.heap-used': () => {
    return new Gauge(() => {
      return process.memoryUsage().heapUsed;
    });
  },
  /**
   * See {@link https://nodejs.org/api/process.html#process_process_memoryusage} for more information.
   *
   * @return {Gauge}
   */
  'node.process.memory-usage.external': () => {
    return new Gauge(() => {
      const mem = process.memoryUsage();
      return Object.prototype.hasOwnProperty.call(mem, 'external') ? mem.external : 0;
    });
  },
  /**
   * Gauge to track how long the node process has been running.
   *
   * See {@link https://nodejs.org/api/process.html#process_process_uptime} for more information.
   * @return {Gauge}
   */
  'node.process.uptime': () => {
    return new Gauge(() => {
      return Math.floor(process.uptime());
    });
  }
};

/**
 * This module contains the methods to create and register default node process metrics to a metrics registry.
 *
 * @module node-process-metrics
 */
module.exports = {
  /**
   * Method that can be used to add a set of default node process metrics to your app.
   *
   * @param {SelfReportingMetricsRegistry} metricsRegistry
   * @param {Dimensions} [customDimensions]
   * @param {number} [reportingIntervalInSeconds]
   */
  createProcessMetrics: (metricsRegistry, customDimensions, reportingIntervalInSeconds) => {
    customDimensions = customDimensions || {};
    reportingIntervalInSeconds =
      reportingIntervalInSeconds || DEFAULT_NODE_PROCESS_METRICS_REPORTING_INTERVAL_IN_SECONDS;

    Object.keys(nodeProcessMetrics).forEach(metricName => {
      metricsRegistry.register(
        metricName,
        nodeProcessMetrics[metricName](),
        customDimensions,
        reportingIntervalInSeconds
      );
    });
  },

  /**
   * Map of metric names to a corresponding function that creates and returns a Metric that tracks it.
   * See {@link nodeProcessMetrics}
   */
  nodeProcessMetrics
};
