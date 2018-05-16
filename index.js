const Collection = require('./lib/Collection');
const Counter = require('./lib/metrics/Counter');
const Gauge = require('./lib/metrics/Gauge');
const SettableGauge = require('./lib/metrics/SettableGauge');
const Histogram = require('./lib/metrics/Histogram');
const Meter = require('./lib/metrics/Meter');
const NoOpMeter = require('./lib/metrics/NoOpMeter');
const Timer = require('./lib/metrics/Timer');
const BinaryHeap = require('./lib/util/BinaryHeap');
const ExponentiallyDecayingSample = require('./lib/util/ExponentiallyDecayingSample');
const ExponentiallyMovingWeightedAverage = require('./lib/util/ExponentiallyMovingWeightedAverage');
const Stopwatch = require('./lib/util/Stopwatch');
const units = require('./lib/util/units');

/**
 * The main measured module that is referenced when require('measured') is used.
 * @module measured
 */
module.exports = {
  /**
   * See {@link Collection}
   * @type {Collection}
   * @augments Collection
   */
  Collection,

  /**
   * See {@link Counter}
   * @type {Counter}
   */
  Counter,

  /**
   * See {@link Gauge}
   * @type {Gauge}
   */
  Gauge,

  /**
   * See {@link SettableGauge}
   * @type {SettableGauge}
   */
  SettableGauge,

  /**
   * See {@link Histogram}
   * @type {Histogram}
   */
  Histogram,

  /**
   * See {@link Meter}
   * @type {Meter}
   */
  Meter,

  /**
   * See {@link NoOpMeter}
   * @type {NoOpMeter}
   */
  NoOpMeter,

  /**
   * See {@link Timer}
   * @type {Timer}
   */
  Timer,

  /**
   * See {@link BinaryHeap}
   * @type {BinaryHeap}
   */
  BinaryHeap,

  /**
   * See {@link ExponentiallyDecayingSample}
   * @type {ExponentiallyDecayingSample}
   */
  ExponentiallyDecayingSample,

  /**
   * See {@link ExponentiallyMovingWeightedAverage}
   * @type {ExponentiallyMovingWeightedAverage}
   */
  ExponentiallyMovingWeightedAverage,

  /**
   * See {@link Stopwatch}
   * @type {Stopwatch}
   */
  Stopwatch,

  /**
   * See {@link units}
   * @type {units}
   */
  units,

  /**
   * Creates a named collection. See {@Collection} for more details
   *
   * @param name The name for the collection
   * @return {Collection}
   */
  createCollection: name => {
    return new Collection(name);
  }
};
