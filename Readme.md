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

## Todo

* Finish Readme : )
