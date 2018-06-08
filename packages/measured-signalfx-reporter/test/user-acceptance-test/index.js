const signalfx = require('signalfx');
const express = require('express');
const bunyan = require('bunyan');
const { SignalFxMetricsReporter, SignalFxSelfReportingMetricsRegistry, SignalFxEventCategories } = require('../../lib');
const { createOSMetrics, createProcessMetrics, createExpressMiddleware } = require('../../../measured-node-metrics/lib');
const libraryMetadata = require('../../package');

const log = bunyan.createLogger({ name: 'SelfReportingMetricsRegistry', level: 'info' });

const library = libraryMetadata.name;
const version = libraryMetadata.version;

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
metricsRegistry.sendEvent('events.app.starting');

createOSMetrics(metricsRegistry);
createProcessMetrics(metricsRegistry);

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

process.on('SIGINT', async () => {
  log.info('SIG INT, exiting');
  await metricsRegistry.sendEvent('events.app.exiting');
  process.exit(0);
});


process.on('uncaughtException', async (err) => {
  log.error('There was an uncaught error', err);
  await metricsRegistry.sendEvent('events.app.uncaught-exception', SignalFxEventCategories.ALERT, {err: JSON.stringify(err)});
});
