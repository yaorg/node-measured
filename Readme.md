# felix-metrics

[![Build Status](https://secure.travis-ci.org/felixge/node-felix-metrics.png)](http://travis-ci.org/felixge/node-felix-metrics)

This is an alternative port of Coda Hale's [metrics library][codametrics].

I created this despite the existing [metrics port][existingmetrics] for node.js
because I wanted to fully understand the underlaying Math and algorithms.

[codametrics]:  https://github.com/codahale/metrics
[existingmetrics]: https://github.com/mikejihbe/metrics

## Install

This is not ready for you yet

## Usage

**Step 1:** Add metrics to your code. For example, lets track the requests/sec
of a http server:

```js
var metrics    = require('felix-metrics');
var collection = new metrics.Collection('http');
var http       = require('http');

var rps = collection.meter('requestsPerSecond');
http.createServer(function(req, res) {
  meter.mark();
  res.end('Thanks');
}).listen(3000);
```

**Step 2:** Show the collected metrics (more advanced examples follow later):

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
var gauge = new metrics.Gauge({read: function() {
  return process.memoryUsage().rss;
});
```

There is currently no callback support for Gauges because otherwise it would be
very difficult to report the metrics inside a collection within a regular
interval.

**Options:**

* `read` A function that returns the current value of the Gauge.

**Methods:**

None.

## Counter

Things that increment or decrement. For example sessions on a server:

```js
var sessions = new metrics.Counter();
counter.inc();
```

**Options:**

* `count` An initial count for the counter. Defaults to `0`.

**Methods:**

* `#inc(n = 1)` Increment the counter by `n`.
* `#dec(n = 1)` Decrement the counter by `n`.

## Meter

Things that are measured as a rate, typically in seconds.

## Todo

* Finish Readme : )
