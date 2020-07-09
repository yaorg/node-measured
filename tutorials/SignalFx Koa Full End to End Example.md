### Using Measured to instrument OS, Process and Koa Metrics.

This tutorial shows how to use the measured libraries to fully instrument OS and Node Process metrics as well as create a Koa middleware.

The middleware will measure request count, latency distributions (req/res time histogram) and add dimensions to make it filterable by request method, response status code, request uri path.

**NOTE:** You must add `app.use(createKoaMiddleware(...))` **before** the use of any Koa bodyParsers like `app.use(KoaBodyParser())` because requests that are first handled by a bodyParser will not get measured.

```javascript
const os = require('os');
const signalfx = require('signalfx');
const Koa = require('koa');
const KoaBodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const { SignalFxMetricsReporter, SignalFxSelfReportingMetricsRegistry } = require('measured-signalfx-reporter');
const { createProcessMetrics, createOSMetrics, createKoaMiddleware } = require('measured-node-metrics');
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

createOSMetrics(metricsRegistry, {}, PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS);
createProcessMetrics(metricsRegistry, {}, PROCESS_AND_SYSTEM_METRICS_REPORTING_INTERVAL_IN_SECONDS);

const app = new Koa();
router = new Router();

router.get('/hello', (req, res) => {
  res.send('hello world');
});

router.get('/path2', (req, res) => {
  res.send('path2');
});

// wire up the metrics middleware
app.use(createKoaMiddleware(metricsRegistry, REQUEST_METRICS_REPORTING_INTERVAL_IN_SECONDS));
app.use(KoaBodyParser());
app.use(router.routes());

app.listen(8080, () => log.info('Example app listening on port 8080!'));
```
