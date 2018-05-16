## [Docs are best viewed on the github page](https://yaorg.github.io/node-measured/)

## Measured

[![Build Status](https://secure.travis-ci.org/yaorg/node-measured.png)](http://travis-ci.org/yaorg/node-measured) [![Coverage Status](https://coveralls.io/repos/github/yaorg/node-measured/badge.svg?branch=master)](https://coveralls.io/github/yaorg/node-measured?branch=master)

A Node library for measuring and reporting application-level metrics.

Measured is heavily inspired by Coda Hale, Yammer Inc's [Dropwizard Metrics Libraries](https://github.com/dropwizard/metrics) 

### Available packages

#### Measured Core

The core measured library that has the Metric interfaces and implementations.

##### Install

```
npm install @yaorg/measured-core
```

##### Metrics

The core library has the following metrics classes:

- {@link Gauge}, Values that can be read instantly via a supplied call back.
- {@link SettableGauge}, Just like a Gauge but its value is set directly rather than supplied by a callback
- {@link Counter}, Counters are things that increment or decrement
- {@link Timer}, Timers are a combination of Meters and Histograms. They measure the rate as well as distribution of scalar events.
- {@link Histogram}, Keeps a reservoir of statistically relevant values biased towards the last 5 minutes to explore their distribution.
- {@link Meter}, Things that are measured as events / interval.

They can be created manually or with the including basic core registry called the {@link Collection}.

##### Usage

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

### Development and Contributing

See [Development and Contributing](https://github.com/yaorg/node-measured/blob/master/CONTRIBUTING.md)

### License

This project Measured and all of its modules are licensed under the [MIT license](https://github.com/yaorg/node-measured/blob/master/LICENSE).
