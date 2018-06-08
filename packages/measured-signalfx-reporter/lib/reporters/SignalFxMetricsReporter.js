const { Reporter } = require('measured-reporting');
const { MetricTypes } = require('measured-core');
const { validateSignalFxClient } = require('../validators/inputValidators');
const { USER_DEFINED } = require('../SignalFxEventCategories');

/**
 * A Reporter that reports metrics to Signal Fx
 * @extends {Reporter}
 */
class SignalFxMetricsReporter extends Reporter {
  /**
   * @param {SignalFxClient} signalFxClient The configured signal fx client.
   * @param {ReporterOptions} [options] See {@link ReporterOptions}.
   */
  constructor(signalFxClient, options) {
    super(options);
    validateSignalFxClient(signalFxClient);
    this._signalFxClient = signalFxClient;
  }

  /**
   * Sends metrics to signal fx, converting name and dimensions and {@link Metric} to data signal fx can ingest
   * @param {MetricWrapper[]} metrics The array of metrics to send to signal fx.
   * @protected
   */
  _reportMetrics(metrics) {
    this._log.debug('_reportMetrics() called');

    let signalFxDataPointRequest = {};

    metrics.forEach(metric => {
      if (!metric) {
        this._log.warn('Metric was null when it should not have been');
        return;
      }
      signalFxDataPointRequest = this._processMetric(metric, signalFxDataPointRequest);
    });

    this._log.debug('Sending data to Signal Fx');

    this._signalFxClient.send(signalFxDataPointRequest).catch(error => {
      this._log.error('Failed to send metrics to signal fx error:', error);
    });
  }

  /**
   * Method for getting raw signal fx api request values from the Timer Object.
   *
   * @param {MetricWrapper} metric metric The Wrapped Metric Object.
   * @param {any} currentBuiltRequest The signal fx request that is being built.
   * @return {any} the currentBuiltRequest The signal fx request that is being built with the given metric in it.
   * @protected
   */
  _processMetric(metric, currentBuiltRequest) {
    const newRequest = Object.assign({}, currentBuiltRequest);

    const { name, metricImpl } = metric;
    const mergedDimensions = this._getDimensions(metric);

    const valuesToProcess = this._getValuesToProcessForType(name, metricImpl);

    valuesToProcess.forEach(metricValueTypeWrapper => {
      const signalFxDataPointMetric = {
        metric: metricValueTypeWrapper.metric,
        value: metricValueTypeWrapper.value,
        dimensions: mergedDimensions
      };

      if (Object.prototype.hasOwnProperty.call(newRequest, metricValueTypeWrapper.type)) {
        newRequest[metricValueTypeWrapper.type].push(signalFxDataPointMetric);
      } else {
        newRequest[metricValueTypeWrapper.type] = [signalFxDataPointMetric];
      }
    });

    return newRequest;
  }

  /**
   * Maps Measured Metrics Object JSON outputs to their respective signal fx metrics using logic from
   * com.signalfx.codahale.reporter.AggregateMetricSenderSessionWrapper in the java lib to derive naming
   *
   * @param {string} name The registered metric base name
   * @param {Metric} metric The metric.
   * @return {MetricValueTypeWrapper[]} an array of MetricValueTypeWrapper that can be used to
   * build the SignalFx data point request
   * @protected
   */
  _getValuesToProcessForType(name, metric) {
    const type = metric.getType();
    switch (type) {
      case MetricTypes.TIMER:
        return this._getValuesToProcessForTimer(name, metric);
      case MetricTypes.GAUGE:
        return this._getValuesToProcessForGauge(name, metric);
      case MetricTypes.COUNTER:
        return this._getValuesToProcessForCounter(name, metric);
      case MetricTypes.HISTOGRAM:
        return this._getValuesToProcessForHistogram(name, metric);
      case MetricTypes.METER:
        this._log.warn(
          'Meters are not reported to SignalFx. Meters do not make sense to use with SignalFx because the same values ' +
            'can be calculated using simple counters and aggregations within SignalFx itself.'
        );
        return [];
      default:
        this._log.error(`Metric Type: ${type} has not been implemented to report to signal fx`);
        return [];
    }
  }

  /**
   * Maps and Filters values from a Timer to a set of metrics to report to SigFx.
   *
   * @param {string} name The registry name
   * @param {Timer} timer The Timer
   * @return {MetricValueTypeWrapper[]} Returns an array of MetricValueTypeWrapper to use to build the request
   * @protected
   */
  _getValuesToProcessForTimer(name, timer) {
    let valuesToProcess = [];
    // only grab histogram data as Meters can be accomplished with signal fx using the count from the histogram
    valuesToProcess = valuesToProcess.concat(this._getValuesToProcessForHistogram(name, timer._histogram));
    return valuesToProcess;
  }

  /**
   * Maps values from a Gauge to a set of metrics to report to SigFx.
   *
   * @param {string} name The registry name
   * @param {Gauge} gauge The Gauge
   * @return {MetricValueTypeWrapper[]} Returns an array of MetricValueTypeWrapper to use to build the request
   * @protected
   */
  _getValuesToProcessForGauge(name, gauge) {
    const valuesToProcess = [];
    valuesToProcess.push({
      metric: `${name}`,
      value: gauge.toJSON(),
      type: SIGNAL_FX_GAUGE
    });
    return valuesToProcess;
  }

  /**
   * Maps values from a Counter to a set of metrics to report to SigFx.
   *
   * @param {string} name The registry name
   * @param {Counter} counter The data from the measure metric object
   * @return {MetricValueTypeWrapper[]} Returns an array of MetricValueTypeWrapper to use to build the request
   * @protected
   */
  _getValuesToProcessForCounter(name, counter) {
    const valuesToProcess = [];
    valuesToProcess.push({
      metric: `${name}.count`,
      value: counter.toJSON(),
      type: SIGNAL_FX_CUMULATIVE_COUNTER
    });
    return valuesToProcess;
  }

  /**
   * Maps and Filters values from a Histogram to a set of metrics to report to SigFx.
   *
   * @param {string} name The registry name
   * @param {Histogram} histogram The Histogram
   * @return {MetricValueTypeWrapper[]} Returns an array of MetricValueTypeWrapper to use to build the request
   * @protected
   */
  _getValuesToProcessForHistogram(name, histogram) {
    // TODO add full list of histogram metrics but enable filter
    const data = histogram.toJSON();
    const valuesToProcess = [];
    valuesToProcess.push({
      metric: `${name}.count`,
      value: data.count || 0,
      type: SIGNAL_FX_CUMULATIVE_COUNTER
    });
    valuesToProcess.push({
      metric: `${name}.max`,
      value: data.max || 0,
      type: SIGNAL_FX_GAUGE
    });
    valuesToProcess.push({
      metric: `${name}.min`,
      value: data.min || 0,
      type: SIGNAL_FX_GAUGE
    });
    valuesToProcess.push({
      metric: `${name}.mean`,
      value: data.mean || 0,
      type: SIGNAL_FX_GAUGE
    });
    valuesToProcess.push({
      metric: `${name}.p95`,
      value: data.p95 || 0,
      type: SIGNAL_FX_GAUGE
    });
    valuesToProcess.push({
      metric: `${name}.p99`,
      value: data.p99 || 0,
      type: SIGNAL_FX_GAUGE
    });
    return valuesToProcess;
  }

  /**
   * Function exposes the event API of Signal Fx.
   * See {@link https://github.com/signalfx/signalfx-nodejs#sending-events} for more details.
   *
   * @param {string} eventType The event type (name of the event time series).
   * @param {SignalFxEventCategoryId} [category] the category of event. See {@link module:SignalFxEventCategories}. Value by default is USER_DEFINED.
   * @param {Dimensions} [dimensions] a map of event dimensions, empty dictionary by default
   * @param {Object.<string, string>} [properties] a map of extra properties on that event, empty dictionary by default
   * @param {number} [timestamp] a timestamp, by default is current time.
   *
   * @example
   * const {
   *   SignalFxSelfReportingMetricsRegistry,
   *   SignalFxMetricsReporter,
   *   SignalFxEventCategories
   * } = require('measured-signalfx-reporter');
   * const registry = new SignalFxSelfReportingMetricsRegistry(new SignalFxMetricsReporter(signalFxClient));
   * registry.sendEvent('uncaughtException', SignalFxEventCategories.ALERT);
   */
  sendEvent(eventType, category, dimensions, properties, timestamp) {
    const body = {
      eventType,
      category: category || USER_DEFINED,
      dimensions: this._getDimensions({dimensions}),
      properties,
      timestamp
    };
    Object.keys(body).forEach((key) => (body[key] == null) && delete body[key]);
    return this._signalFxClient.sendEvent(body)
  }
}

// const SIGNAL_FX_COUNTER = 'counters';
const SIGNAL_FX_GAUGE = 'gauges';
const SIGNAL_FX_CUMULATIVE_COUNTER = 'cumulative_counters';

module.exports = SignalFxMetricsReporter;

/**
 * Wrapper object to wrap metric value and SFX metadata needed to send metric value to SFX data ingestion.
 *
 * @interface MetricValueTypeWrapper
 * @typedef MetricValueTypeWrapper
 * @type {Object}
 * @property {string} metric The metric name to report to SignalFx
 * @property {number} value the value to report to SignalFx
 * @property {string} type The mapped SignalFx metric type
 */
