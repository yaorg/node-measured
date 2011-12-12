# measured

[![Build Status](https://secure.travis-ci.org/felixge/node-measured.png)](http://travis-ci.org/felixge/node-measured)

This is an alternative port of Coda Hale's [metrics library][codametrics].

I created this despite the existing [metrics port][existingmetrics] for node.js
because I wanted to fully understand the underlaying Math and algorithms.

[codametrics]:  https://github.com/codahale/metrics
[existingmetrics]: https://github.com/mikejihbe/metrics

## Install

```
npm install measured
```

## Usage

**Step 1:** Add measurements to your code. For example, lets track the
requests/sec of a http server:

```js
var measured   = require('measured');
var collection = new measured.Collection('http');
var http       = require('http');

var rps = collection.meter('requestsPerSecond');
http.createServer(function(req, res) {
  rps.mark();
  res.end('Thanks');
}).listen(3000);
```

**Step 2:** Show the collected measurements (more advanced examples follow later):

```js
setInterval(function() {
  console.log(collection.toJSON());
}, 1000);
```

This will output something like this every second:

```
{ requestsPerSecond:
   { mean: 1710.2180279856818,
     count: 10511,
     '1MinuteRate': 168.08263156623656,
     '5MinuteRate': 34.74630977619571,
     '15MinuteRate': 11.646507524106095 } }
```

**Step 3:** Aggregate the data into your backend of choice. I recommend
[graphite][].

[graphite]: http://graphite.wikidot.com/

## Metrics

The following metrics are available (both standalone and on the Collection API):

### Gauge

Values that can be read instantly. Example:

```js
var gauge = new metrics.Gauge(function() {
  return process.memoryUsage().rss;
});
```

There is currently no callback support for Gauges because otherwise it would be
very difficult to report the metrics inside a collection within a regular
interval.

**Options:**

* Gauges take a function as parameter which needs to return their current value.

**Methods:**

None.

### Counter

Things that increment or decrement. Example:

```js
var activeUploads = new metrics.Counter();
http.createServer(function(req, res) {
  activeUploads.inc();
  req.on('end', function() {
    activeUploads.dec();
  });
});
```

**Options:**

* `count` An initial count for the counter. Defaults to `0`.

**Methods:**

* `inc(n)` Increment the counter by `n`. Defaults to `1`.
* `dec(n)` Decrement the counter by `n`. Defaults to `1`.
* `reset(count)` Resets the counter back to `count` Defaults to `0`.

### Meter

Things that are measured as events / interval. Example:

```js
var meter = new metrics.Meter();
http.createServer(function(req, res) {
  meter.mark();
});
```

**Options:**

* `rateUnit` The rate unit. Defaults to `1000` (1 sec).
* `tickInterval` The interval in which the averages are updated. Defaults to
  `5000` (5 sec).

**Methods:**

* `mark(n)` Register `n` events as having just occured. Defaults to `1.

### Histogram

Things that are measured as distributions of scalars. Example:

```js
var histogram = new metrics.Histogram();
http.createServer(function(req, res) {
  if (req.headers['content-length']) {
    histogram.update(parseInt(req.headers['content-length'], 10));
  }
});
```

**Options:**

* `sample` The sample resevoir to use. Defaults to an `ExponentiallyDecayingSample`.

**Methods:**

* `update(value, timestamp)` Pushes `value` into the sample. `timestamp`
  defaults to `Date.now()`.
* `reset()` Resets all histogram values. If you passed in a custom sample
  instance, it will be replaced with the default one (patch welcome).

### Timers

Timers are a combination of Meters and Histograms. They measure the rate as
well as distribution of scalar events. Since they are frequently used for
tracking how long certain things take, they expose an API for that:

```js
var timer = new metrics.Timer();
http.createServer(function(req, res) {
  var stopwatch = timer.start();
  req.on('end', function() {
    stopwatch.end();
  });
});
```

But you can also use them as generic histograms that also track the rate of
events:

```js
var timer = new metrics.Timer();
http.createServer(function(req, res) {
  if (req.headers['content-length']) {
    timer.update(parseInt(req.headers['content-length'], 10));
  }
});
```

**Options:**

* `meter` The internal meter to use. Defaults to a new `Meter`.
* `histogram` The internal histogram to use. Defaults to a new `Histogram`.

**Methods:**

* `start()` Returns a `Stopwatch`.
* `update(value)` Updates the internal histogram with `value` and marks one
  event on the internal meter.

## Todo

* Implement a graphite reporter and feature it in the usage section.

## License

This module is licensed under the MIT license.
