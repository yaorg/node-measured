# better-metrics

[![Build Status](https://secure.travis-ci.org/felixge/node-better-metrics.png)](http://travis-ci.org/felixge/node-better-metrics)

This is an alternative port of Coda Hale's [metrics library][codametrics].

I created this because I did not like the existing [metrics][existingmetrics]
port which:

* Expects me to expose my metrics over http
* Has a test suite contains no assert statements (!?)

[codametrics]:  https://github.com/codahale/metrics
[existingmetrics]: https://github.com/mikejihbe/metrics

## Install

This is not ready for you yet

## Usage

Here is a simple example that measures the requests / second for a http server:

```js
var metrics = require('better-metrics'));
var meter   = new metrics.Meter();

var http = require('http');
http.createServer(function(req, res) {
  meter.mark();
  res.end('Thanks');
}).listen(3000);
```

Now this just measures things, but does not give you any way to look at the
results. But fear not, logging this information is really simple:

```js
setTimeout(function() {
  console.log(meter.toJSON());
}, 1000);
```

This will print something like this:

## Todo

* Finish Readme : )
* Re-write Histogram and involved classes, took them from the original metrics
  library as I had to get those ready in a hurry for something : ).
