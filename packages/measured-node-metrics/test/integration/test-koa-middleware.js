const Koa = require('koa');
const KoaBodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const Registry = require('measured-reporting').SelfReportingMetricsRegistry;
const TestReporter = require('../unit/TestReporter');
const { createKoaMiddleware } = require('../../lib');
const findFreePort = require('find-free-port');
const assert = require('assert');
const http = require('http');

describe('koa-middleware', () => {
  let port;
  let reporter;
  let registry;
  let middleware;
  let app;
  let httpServer;
  let router;
  beforeEach(() => {
    return new Promise(resolve => {
      reporter = new TestReporter();
      registry = new Registry(reporter);
      middleware = createKoaMiddleware(registry, 1);
      app = new Koa();
      router = new Router();

      router.get('/hello', ({ response }) => {
        response.body = 'Hello World!';
        return response;
      });
      router.post('/world', ({ response }) => {
        response.body = 'Hello World!';
        response.status = 201;
        return response;
      });
      router.get('/users/:userId', ({ params, response }) => {
        response.body = `id: ${params.userId}`;
        return response;
      });

      app.use(middleware);
      app.use(KoaBodyParser());
      app.use(router.routes());
      app.use(router.allowedMethods());

      app.on('error', (err) => console.error(err));

      findFreePort(3000).then(portArr => {
        port = portArr.shift();

        httpServer = app.listen(port);
        resolve();
      });
    });
  });

  afterEach(() => {
    httpServer.close();
    registry.shutdown();
  });

  it('creates a single timer that has 1 count for requests, when an http call is made once', () => {
    return callLocalHost(port, 'hello').then(() => {
      const registeredKeys = registry._registry.allKeys();
      assert(registeredKeys.length === 1);
      assert.equal(registeredKeys[0], 'requests-GET-200-/hello');
      const metricWrapper = registry._registry.getMetricWrapperByKey('requests-GET-200-/hello');
      const { name, dimensions } = metricWrapper;
      assert.equal(name, 'requests');
      assert.deepEqual(dimensions, { statusCode: '200', method: 'GET', uri: '/hello' });
    });
  });

  it('creates a single timer that has 1 count for requests, when an http POST call is made once', () => {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
    return callLocalHost(port, 'world', options).then(() => {
      const registeredKeys = registry._registry.allKeys();
      assert(registeredKeys.length === 1);
      assert.equal(registeredKeys[0], 'requests-POST-201-/world');
      const metricWrapper = registry._registry.getMetricWrapperByKey('requests-POST-201-/world');
      const { name, dimensions } = metricWrapper;
      assert.equal(name, 'requests');
      assert.deepEqual(dimensions, { statusCode: '201', method: 'POST', uri: '/world' });
    });
  });

  it('does not create runaway n metrics in the registry for n ids in the path', () => {
    return Promise.all([
      callLocalHost(port, 'users/foo'),
      callLocalHost(port, 'users/bar'),
      callLocalHost(port, 'users/bop')
    ]).then(() => {
      assert.equal(registry._registry.allKeys().length, 1, 'There should only be one metric for /users and GET');
    });
  });
});

const callLocalHost = (port, endpoint, options) => {
  return new Promise((resolve, reject) => {
    const req = Object.assign({ protocol: 'http:',
      host: '127.0.0.1',
      port: `${port}`,
      path: `/${endpoint}`,
      method: 'GET' },
    options || {});
    http
      .request(req, resp => {
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
      })
      .end();
  });
};
