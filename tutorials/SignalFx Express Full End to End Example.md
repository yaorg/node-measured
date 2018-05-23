### Using Measured to instrument OS, Process and Express Metrics.

This tutorial shows how to use the measured libraries to fully instrument OS and Node Process metrics as well as create an express middleware.

The middleware will measure request count, latency distributions (req/res time histogram) and add dimensions to make it filterable by request method, response status code, request uri path.

```javascript
const os = require('os');
const signalfx = require('signalfx');
const express = require('express');
const { SignalFxMetricsReporter, SignalFxSelfReportingMetricsRegistry } = require('measured-signalfx-reporter');
const { Stopwatch } = require('measured-core');
const libraryMetadata = require('./package'); // get metadata from package.json

const library = libraryMetadata.name;
const version = libraryMetadata.version;

// Report process and os stats 1x per minute
const PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS = 60;
// Report the request count and histogram stats every 10 seconds
const REQUEST_METRICS_REPORTING_INTERVAL_IN_SECONDS = 10;

const defaultDimensions = {
  app: library,
  app_version: version,
  env: 'test'
};

/**
 * Get your api key from a secrets provider of some kind.
 *
 * Good examples:
 *
 * <li> S3 with KMS
 * <li> Cerberus
 * <li> AWS Secrets Manager
 * <li> Vault
 * <li> Confidant
 *
 * Bad examples:
 *
 * <li> Checked into SCM in plaintext as a property
 * <li> Set as a plaintext environment variable
 *
 * @return {string} Returns the resolved Signal Fx Api Key
 */
const apiKeyResolver = () => {
  // https://diogomonica.com/2017/03/27/why-you-shouldnt-use-env-variables-for-secret-data/
  return process.env.SIGNALFX_API_KEY;
};

// Create the signal fx client
const signalFxClient = new signalfx.Ingest(apiKeyResolver(), {
  userAgents: library
});

// Create the signal fx reporter with the client
const signalFxReporter = new SignalFxMetricsReporter(signalFxClient, {
  defaultDimensions: defaultDimensions,
  defaultReportingIntervalInSeconds: 10,
  logLevel: 'debug'
});

// Create the self reporting metrics registry with the signal fx reporter
const metricsRegistry = new SignalFxSelfReportingMetricsRegistry(signalFxReporter, { logLevel: 'debug' });

// Create a gauge to track the 1 minute load average from the Node OS API.
metricsRegistry.getOrCreateGauge(
  'os-1m-load-average',
  () => {
    // os.loadavg returns an array [1, 5, 15] mins intervals
    return os.loadavg()[0];
  },
  {},
  PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS
);

// Create a gauge to track the amount of free memory for the system from the Node OS API.
metricsRegistry.getOrCreateGauge(
  'os-free-mem-bytes',
  () => {
    return os.freemem();
  },
  {},
  PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS
);

// Create a gauge to track the amount of memory used for the system from the Node OS API.
metricsRegistry.getOrCreateGauge(
  'os-total-mem-bytes',
  () => {
    return os.totalmem();
  },
  {},
  PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS
);

// https://nodejs.org/api/process.html#process_process_memoryusage
metricsRegistry.getOrCreateGauge(
  'process-memory-rss',
  () => {
    return process.memoryUsage().rss;
  },
  {},
  PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS
);

// https://nodejs.org/api/process.html#process_process_memoryusage
metricsRegistry.getOrCreateGauge(
  'process-memory-heap-total',
  () => {
    return process.memoryUsage().heapTotal;
  },
  {},
  PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS
);

// https://nodejs.org/api/process.html#process_process_memoryusage
metricsRegistry.getOrCreateGauge(
  'process-memory-heap-used',
  () => {
    return process.memoryUsage().heapUsed;
  },
  {},
  PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS
);

// https://nodejs.org/api/process.html#process_process_memoryusage
metricsRegistry.getOrCreateGauge(
  'process-memory-external',
  () => {
    const mem = process.memoryUsage();
    return mem.hasOwnProperty('external') ? mem.external : 0;
  },
  {},
  PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS
);

// https://nodejs.org/api/process.html#process_process_uptime
metricsRegistry.getOrCreateGauge(
  'process-uptime-seconds',
  () => {
    return Math.floor(process.uptime());
  },
  {},
  PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS
);

// Now that we have some base system and process metrics wired up,
// lets wire up an express middleware that will track request count, latency statics and give us all this
// information filterable by http method, response status code and URI path.

/**
 * This middleware is a little interesting because we need to track the time elapsed before we know the status code dimension.
 * So we will create the Stopwatch manually rather that using the API available on the Timer object itself, see api docs for more info.
 *
 * @param metricsRegistry the self reporting metrics registry
 * @return {Function} Express Middleware
 */
const createExpressMiddleware = metricsRegistry => {
  return (req, res, next) => {
    const stopwatch = new Stopwatch();

    req.on('end', () => {
      const customDimensions = {
        statusCode: `${res.statusCode}`,
        path: req.route ? req.route.path : '_unknown',
        method: req.method
      };

      // create the timer for the request count/latency histogram
      const requestTimer = metricsRegistry.getOrCreateTimer(
        'request',
        customDimensions,
        REQUEST_METRICS_REPORTING_INTERVAL_IN_SECONDS
      );

      // stop the request latency counter
      const time = stopwatch.end();
      requestTimer.update(time);
    });
    next();
  };
};

const app = express();
// wire up the metrics middleware
app.use(createExpressMiddleware(metricsRegistry));

app.get('/hello', (req, res) => {
  res.send('hello world');
});

app.get('/path2', (req, res) => {
  res.send('path2');
});

app.listen(8080, () => log.info('Example app listening on port 8080!'));
```