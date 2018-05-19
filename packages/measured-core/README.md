# Measured Core

The core measured library that has the Metric interfaces and implementations.

## Install

```
npm install measured-core
```

## Docs

### See the full [API Docs here](https://yaorg.github.io/node-measured/core/index.html).

### Metrics

The core library has the following metrics classes:

- [Gauge](https://yaorg.github.io/node-measured/core/index.html#gauge), Values that can be read instantly via a supplied call back.
- [SettableGauge](https://yaorg.github.io/node-measured/core/index.html#settablegauge), Just like a Gauge but its value is set directly rather than supplied by a callback.
- [Counter](https://yaorg.github.io/node-measured/core/index.html#counter), Counters are things that increment or decrement.
- [Timer](https://yaorg.github.io/node-measured/core/index.html#timer), Timers are a combination of Meters and Histograms. They measure the rate as well as distribution of scalar events.
- [Histogram](https://yaorg.github.io/node-measured/core/index.html#histogram), Keeps a reservoir of statistically relevant values to explore their distribution.
- [Meter](https://yaorg.github.io/node-measured/core/index.html#meter), Things that are measured as events / interval.

They can be created manually or with the including basic core registry called the [Collection](https://yaorg.github.io/node-measured/core/index.html#collection).

## Usage

**Step 1:** Add measurements to your code. For example, lets track the
requests/sec of a http server:

```js
var http  = require('http');
var stats = require('measured').createCollection();

http.createServer(function(req, res) {
  stats.meter('requestsPerSecond').mark();
  res.end('Thanks');
}).listen(3000);
```

**Step 2:** Show the collected measurements (more advanced examples follow later):

```js
setInterval(function() {
  console.log(stats.toJSON());
}, 1000);
```

This will output something like this every second:

```
{ requestsPerSecond:
   { mean: 1710.2180279856818,
     count: 10511,
     'currentRate': 1941.4893498239829,
     '1MinuteRate': 168.08263156623656,
     '5MinuteRate': 34.74630977619571,
     '15MinuteRate': 11.646507524106095 } }
```

**Step 3:** Aggregate the data into your backend of choice.
Here are a few time series data aggregators.
- [Graphite](http://graphite.wikidot.com/)
    - A free and open source, self hosted and managed solution for time series data.
- [SignalFx](https://signalfx.com/)
    - An enterprise SASS offering for time series data.
- [Datadog](https://www.datadoghq.com/)
    - An enterprise SASS offering for time series data.
