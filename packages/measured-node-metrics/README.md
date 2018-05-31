# Measured Node Metrics

Various metrics generators and http framework middlewares that can be used with a self reporting metrics registry to easily instrument metrics for a node app.

[![npm](https://img.shields.io/npm/v/measured-reporting.svg)](https://www.npmjs.com/package/measured-node-metrics) 

## Install

```
npm install measured-node-metrics
```

## What is in this package

### [Measured Node Metrics Module](https://yaorg.github.io/node-measured/module-measured-node-metrics.html)
See the docs for the main module to see the exported helper functions and maps of metric generators for various system and os metrics.

## Example usage

```javascript
const express = require('express');
const { createProcessMetrics, createOSMetrics, createExpressMiddleware } = require('measured-node-metrics');

const registry = new SelfReportingMetricsRegistry(new SomeReporterImple());

// Create and register default OS metrics
createOSMetrics(registry);
// Create and register default process metrics
createProcessMetrics(registry);
// Use the express middleware
const app = express();
app.use(createExpressMiddleware(registry));

// Implement the rest of app
```

You can also create your own middleware if your not using express, (please contribute it)
```javascript
  const { onRequestStart, onRequestEnd } = require('measured-node-metrics');

  /**
   * Creates an Express middleware that reports a timer on request data.
   * With this middleware you will get requests counts and latency percentiles all filterable by status codes, http method, and uri paths.
   *
   * @param {SelfReportingMetricsRegistry} metricsRegistry
   * @param {number} [reportingIntervalInSeconds]
   * @return {Function}
   */
  createExpressMiddleware: (metricsRegistry, reportingIntervalInSeconds) => {
    return (req, res, next) => {
      const stopwatch = onRequestStart();

      req.on('end', () => {
        const { method } = req;
        const { statusCode } = res;
        // path variables should be stripped in order to avoid runaway time series creation, 
        // /v1/cars/:id should be one dimension rather than n, one for each id.
        const path = req.route ? req.route.path : '_unknown';
        onRequestEnd(metricsRegistry, stopwatch, method, statusCode, path, reportingIntervalInSeconds);
      });

      next();
    };
  }
```
