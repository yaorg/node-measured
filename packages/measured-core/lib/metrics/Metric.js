/**
 * Interface for Metric types.
 *
 * Implementations
 * <p>
 * <li><a href="#counter">Counter</a>, things that increment or decrement.</li>
 * <li><a href="#gauge">Gauge</a>, values that can be read instantly via a supplied call back.</li>
 * <li><a href="#histogram">Histogram</a>, keeps a reservoir of statistically relevant values to explore their distribution.</li>
 * <li><a href="#meter">Meter</a>, things that are measured as events / interval.</li>
 * <li><a href="#noopmeter">NoOpMeter</a>, an empty impl of meter, useful for supplying to a Timer, when you only care about the Histogram.</li>
 * <li><a href="#settablegauge">SettableGauge</a>, just like a Gauge but its value is set directly rather than supplied by a callback.</li>
 * <li><a href="#timer">Timer</a>, timers are a combination of Meters and Histograms. They measure the rate as well as distribution of scalar events.</li>
 * </p>
 *
 * @interface Metric
 */
// eslint-disable-next-line no-unused-vars
class Metric {
  /**
   * Please note that dispite its name, this method can return raw numbers on
   * certain implementations such as counters and gauges.
   *
   * @return {any} Returns the data from the Metric
   */
  toJSON() {}

  /**
   * The type of the Metric Impl. {@link MetricTypes}.
   * @return {string} The type of the Metric Impl.
   */
  getType() {}
}

/**
 * An enum like object that is the set of core metric types that all implementors of {@link Metric} are.
 *
 * @typedef MetricTypes
 * @interface MetricTypes
 * @type {Object.<string, string>}
 * @property {COUNTER} The type for Counters.
 * @property {GAUGE} The type for Gauges.
 * @property {HISTOGRAM} The type for Histograms.
 * @property {METER} The type for Meters.
 * @property {TIMER} The type for Timers.
 */
const MetricTypes = {
  COUNTER: 'Counter',
  GAUGE: 'Gauge',
  HISTOGRAM: 'Histogram',
  METER: 'Meter',
  TIMER: 'Timer'
};

module.exports = {
  MetricTypes
};
