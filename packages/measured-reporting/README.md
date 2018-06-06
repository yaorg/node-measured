# Measured Reporting

The registry and reporting library that has the classes needed to create a dimension aware, self reporting metrics registry.

[![npm](https://img.shields.io/npm/v/measured-reporting.svg)](https://www.npmjs.com/package/measured-reporting) 

## Install

```
npm install measured-reporting
```

## What is in this package

### [Self Reporting Metrics Registry](https://yaorg.github.io/node-measured/SelfReportingMetricsRegistry.html)
A dimensional aware self-reporting metrics registry, just supply this class with a reporter implementation at instantiation and this is all you need to instrument application level metrics in your app.

See the [SelfReportingMetricsRegistryOptions](http://localhost:63342/node-measured/build/docs/packages/measured-reporting/global.html#SelfReportingMetricsRegistryOptions) for advanced configuration.

```javascript
const { SelfReportingMetricsRegistry, LoggingReporter } = require('measured-reporting');
const registry = new SelfReportingMetricsRegistry(new LoggingReporter({
  defaultDimensions: {
    hostname: os.hostname()
  }
}));

// The metric will flow through LoggingReporter#_reportMetrics(metrics) every 10 seconds by default
const myCounter = registry.getOrCreateCounter('my-counter');

```

### [Reporter Abstract Class](https://yaorg.github.io/node-measured/Reporter.html)
The base class for reporter implementations. This class is extended and the [_reportMetrics(metrics)](https://yaorg.github.io/node-measured/Reporter.html#_reportMetrics__anchor) method gets overridden to create an data aggregator specific reporter. 

See the [ReporterOptions](http://localhost:63342/node-measured/build/docs/packages/measured-reporting/global.html#ReporterOptions) for advanced configuration.

#### Current Implementations
- [SignalFx Reporter](https://yaorg.github.io/node-measured/SignalFxMetricsReporter.html) in the `measured-signalfx-reporter` package.
  - reports metrics to SignalFx.
- [Logging Reporter](https://yaorg.github.io/node-measured/LoggingReporter.html) in the `measured-reporting` package.
  - logs reported metrics at an info level through a supplied logger, defaulting to a new bunyan logger if none supplied.

#### Creating an anonymous Implementation
You can technically create an anonymous instance of this, see the following example.
```javascript
const os = require('os');
const process = require('process');
const { SelfReportingMetricsRegistry, Reporter } = require('measured-reporting');

// Create a self reporting registry with a named anonymous Reporter instance;
const registry = new SelfReportingMetricsRegistry(
  new class ConsoleReporter extends Reporter {
    constructor() {
      super({
        defaultDimensions: {
          hostname: os.hostname(),
          env: process.env['NODE_ENV'] ? process.env['NODE_ENV'] : 'unset'
        }
      })
    }

    _reportMetrics(metrics) {
      metrics.forEach(metric => {
        console.log(JSON.stringify({
          metricName: metric.name,
          dimensions: this._getDimensions(metric),
          data: metric.metricImpl.toJSON()
        }))
      });
    }
  },
);

// create a gauge that reports the process uptime every second
const processUptimeGauge = registry.getOrCreateGauge('node.process.uptime', () => process.uptime(), {}, 1);
```

Here is the output from that example

```bash
APP5HTD6ACCD8C:foo jfiel2$ NODE_ENV=development node index.js | bunyan
[2018-06-06T23:39:49.678Z]  INFO: Reporter/9526 on APP5HTD6ACCD8C: {"metricName":"node.process.uptime","dimensions":{"hostname":"APP5HTD6ACCD8C","env":"development"},"data":0.092}
[2018-06-06T23:39:50.685Z]  INFO: Reporter/9526 on APP5HTD6ACCD8C: {"metricName":"node.process.uptime","dimensions":{"hostname":"APP5HTD6ACCD8C","env":"development"},"data":1.099}
[2018-06-06T23:39:51.690Z]  INFO: Reporter/9526 on APP5HTD6ACCD8C: {"metricName":"node.process.uptime","dimensions":{"hostname":"APP5HTD6ACCD8C","env":"development"},"data":2.104}
[2018-06-06T23:39:52.691Z]  INFO: Reporter/9526 on APP5HTD6ACCD8C: {"metricName":"node.process.uptime","dimensions":{"hostname":"APP5HTD6ACCD8C","env":"development"},"data":3.105}
[2018-06-06T23:39:53.692Z]  INFO: Reporter/9526 on APP5HTD6ACCD8C: {"metricName":"node.process.uptime","dimensions":{"hostname":"APP5HTD6ACCD8C","env":"development"},"data":4.106}
```


It would of course be better to create a proper class and contribute it back as a new package for measured if it is generic and sharable.

### [Logging Reporter Class](https://yaorg.github.io/node-measured/LoggingReporter.html)
A very simple reporter that logs the metrics via the Logger.

See the [ReporterOptions](http://localhost:63342/node-measured/build/docs/packages/measured-reporting/global.html#ReporterOptions) for advanced configuration.

```javascript
const { SelfReportingMetricsRegistry, LoggingReporter } = require('measured-reporting');
const registry = new SelfReportingMetricsRegistry(new LoggingReporter({
  logger: myLogerImpl, // defaults to new bunyan logger if not supplied
  defaultDimensions: {
    hostname: require('os').hostname()
  }
}));
```

## What are dimensions?
As described by Signal Fx:
    
*A dimension is a key/value pair that, along with the metric name, is part of the identity of a time series. 
You can filter and aggregate time series by those dimensions across SignalFx.*
    
DataDog has a [nice blog post](https://www.datadoghq.com/blog/the-power-of-tagged-metrics/) about how they are used in their aggregator api.

Graphite also supports the concept via [tags](http://graphite.readthedocs.io/en/latest/tags.html).

