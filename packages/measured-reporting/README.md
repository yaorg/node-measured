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

### [Reporter Abstract Class](https://yaorg.github.io/node-measured/Reporter.html)
The base class for reporter implementations. This class is extended and the [_reportMetrics(metrics)](https://yaorg.github.io/node-measured/Reporter.html#_reportMetrics__anchor) method gets overridden to create an data aggregator specific reporter. See the [SignalFx Reporter](../measured-signalfx-reporter/) for an example implementation.

You can technically create an anonymous instance of this, see the following example.
```javascript
// Create anonymous console logging Reporter instance.
const reporter = new class extends Reporter {
    _reportMetrics(metrics) {
        metrics.forEach(metric => console.log(JSON.stringify(metric)))
    }
};
```
It would of course be better to create a proper class and contribute it back as a new package for measured if it is generic and sharable.

## What are dimensions?
As described by Signal Fx:
    
*A dimension is a key/value pair that, along with the metric name, is part of the identity of a time series. 
You can filter and aggregate time series by those dimensions across SignalFx.*
    
DataDog has a [nice blog post](https://www.datadoghq.com/blog/the-power-of-tagged-metrics/) about how they are used in their aggregator api.

Graphite also supports the concept via [tags](http://graphite.readthedocs.io/en/latest/tags.html).

