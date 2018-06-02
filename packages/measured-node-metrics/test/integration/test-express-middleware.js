/*global describe, it, beforeEach, afterEach*/
const express = require('express');
const Registry = require('measured-reporting').SelfReportingMetricsRegistry;
const TestReporter = require('../unit/TestReporter');
const { createExpressMiddleware } = require('../../lib');
const findFreePort = require('find-free-port');
const assert = require('assert');
const http = require('http');

describe('express-middleware', () => {
  let port;
  let reporter;
  let registry;
  let middleware;
  let app;
  let httpServer;
  beforeEach(() => {
    return new Promise(resolve => {
      reporter = new TestReporter();
      registry = new Registry(reporter);
      middleware = createExpressMiddleware(registry, 1);
      app = express();
      app.use(middleware);

      app.get('/hello', (req, res) => res.send('Hello World!'));
      app.get('/users/:userId', (req, res) => {
        res.send(`id: ${req.params.userId}`);
      });

      findFreePort(3000).then(portArr => {
        port = portArr.shift();

        httpServer = http.createServer(app);
        httpServer.listen(port);
        resolve();
      });
    });
  });

  afterEach(() => {
    httpServer.close();
    registry.shutdown();
  });

  it('creates a single timer that has 1 count for request, when an http call is made once', async () => {
    await callLocalHost(port, 'hello');

    const registeredKeys = registry._registry.allKeys();
    assert(registeredKeys.length === 1);
    assert.equal(registeredKeys[0], 'request-GET-/hello-200');
    const metricWrapper = registry._registry.getMetricWrapperByKey('request-GET-/hello-200');
    const name = metricWrapper.name;
    const dimensions = metricWrapper.dimensions;
    assert.equal(name, 'request');
    assert.deepEqual(dimensions, { statusCode: '200', method: 'GET', path: '/hello' });
  });

  it('does not create runaway n metrics in the registry for n ids in the path', async () => {
    await callLocalHost(port, 'users/foo');
    await callLocalHost(port, 'users/bar');
    await callLocalHost(port, 'users/bop');
    assert.equal(registry._registry.allKeys().length, 1, 'There should only be one metric for /users and GET');
  });
});

const callLocalHost = (port, endpoint) => {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}/${endpoint}`, resp => {
        let data = '';
        resp.on('data', chunk => {
          data += chunk;
        });

        resp.on('end', () => {
          console.log(JSON.stringify(data));
          resolve();
        });
      })
      .on('error', err => {
        console.log('Error: ', JSON.stringify(err));
        reject();
      });
  });
};
