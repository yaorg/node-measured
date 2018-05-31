const { Gauge } = require('measured-core');
const os = require('os');

/**
 * The default reporting interval for node os metrics is 30 seconds.
 *
 * @type {number}
 */
const DEFAULT_NODE_OS_METRICS_REPORTING_INTERVAL_IN_SECONDS = 30;

/**
 * A map of Metric generating functions, that create Metrics to measure node os stats.
 */
const nodeOsMetrics = {
  /**
   * https://nodejs.org/api/os.html#os_os_loadavg
   * @return {Gauge}
   */
  'node.os.loadavg.1m': () => {
    return new Gauge(() => {
      return os.loadavg()[0];
    });
  },
  /**
   * https://nodejs.org/api/os.html#os_os_loadavg
   * @return {Gauge}
   */
  'node.os.loadavg.5m': () => {
    return new Gauge(() => {
      return os.loadavg()[1];
    });
  },
  /**
   * https://nodejs.org/api/os.html#os_os_loadavg
   * @return {Gauge}
   */
  'node.os.loadavg.15m': () => {
    return new Gauge(() => {
      return os.loadavg()[2];
    });
  },
  'node.os.freemem': () => {
    return new Gauge(() => {
      return os.freemem();
    });
  },
  'node.os.totalmem': () => {
    return new Gauge(() => {
      return os.totalmem();
    });
  },

  /**
   * Gauge to track how long the os has been running.
   *
   * See {@link https://nodejs.org/api/os.html#os_os_uptime} for more information.
   * @return {Gauge}
   */
  'node.os.uptime': () => {
    return new Gauge(() => {
      // The os.uptime() method returns the system uptime in number of seconds.
      return os.uptime();
    });
  }
};

/**
 * This module contains the methods to create and register default node os metrics to a metrics registry.
 *
 * @module node-os-metrics
 */
module.exports = {
  /**
   * Method that can be used to add a set of default node process metrics to your app.
   *
   * @param {SelfReportingMetricsRegistry} metricsRegistry
   * @param {Dimensions} customDimensions
   * @param {number} reportingIntervalInSeconds
   */
  createOSMetrics: (metricsRegistry, customDimensions, reportingIntervalInSeconds) => {
    customDimensions = customDimensions || {};
    reportingIntervalInSeconds = reportingIntervalInSeconds || DEFAULT_NODE_OS_METRICS_REPORTING_INTERVAL_IN_SECONDS;

    Object.keys(nodeOsMetrics).forEach(metricName => {
      metricsRegistry.register(metricName, nodeOsMetrics[metricName](), customDimensions, reportingIntervalInSeconds);
    });
  },

  /**
   * Map of metric names to a corresponding function that creates and returns a Metric that tracks it.
   * See {@link nodeOsMetrics}
   */
  nodeOsMetrics
};
