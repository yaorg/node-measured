/*global describe, it, beforeEach, afterEach*/
'use strict';

var common = require('../common');
var assert = require('assert');


describe('Collection', function () {
  var collection;
  beforeEach(function () {
    collection = common.measured.createCollection();
  });

  describe.only('toFlatJSON', function(){
    beforeEach(function(){
      collection = new common.measured.Collection('my-collection');
    });

    it('outputs an array', function(){
      assert.ok(Array.isArray(collection.toFlatJSON()));
    });

    it('outputs two collections', function(){
      var a = collection.counter('a');
      var b = collection.counter('b');

      a.inc(3);
      b.inc(5);

      var result = collection.toFlatJSON();
      assert.deepEqual(result, [
        {'type':'counter','name':'a','count':3,'group':'my-collection'},
        {'type':'counter','name':'b','count':5,'group':'my-collection'},
      ]);
    });

    it('outputs a meter', function(){
      var meter = collection.meter('my-meter');
      meter.mark();

      var result = collection.toFlatJSON()[0];
      assert.ok(result.mean >= 0);
      assert.ok(result.count >= 0);
      assert.ok(result.currentRate >= 0);
      assert.ok(result['1MinuteRate'] >= 0);
      assert.ok(result['5MinuteRate'] >= 0);
      assert.ok(result['15MinuteRate'] >= 0);
    });

    it('outputs a gauge', function(){
      var expected = 42;
      var gauge = new common.measured.Gauge(function(){
        return expected;
      });
      
      collection.register('my-gauge', gauge);  
      var result = collection.toFlatJSON();
      assert.deepEqual(result, [
        {'type':'gauge','name':'my-gauge','value':expected,'group':'my-collection'},
      ]); 
    });
    
    it('outputs a histogram', function(){
      var histogram = collection.histogram('my-histogram');
      histogram.update(1);
      histogram.update(1);

      var result = collection.toFlatJSON()[0];
      assert.equal(result.min, 1);
      assert.equal(result.max, 1);
      assert.equal(result.sum, 2);
      assert.equal(result.variance, 0);
      assert.equal(result.mean, 1);
      assert.equal(result.stddev, 0);
      assert.equal(result.count, 2);
      assert.equal(result.median, 1);
      assert.equal(result.p75, 1);
      assert.equal(result.p95, 1);
      assert.equal(result.p99, 1);
      assert.equal(result.p999, 1);
      assert.equal(result.name,'my-histogram');
      assert.equal(result.group,'my-collection');
      assert.equal(result.type,'histogram');
    });

    it('outputs a timer', function(){
      var timer = collection.timer('my-timer');
      timer.update(1);
      timer.update(1);

      var result = collection.toFlatJSON()[0];
      //Meter Stats
      assert.ok(result.mean >= 0);
      assert.ok(result.count >= 0);
      assert.ok(result.currentRate >= 0);
      assert.ok(result['1MinuteRate'] >= 0);
      assert.ok(result['5MinuteRate'] >= 0);
      assert.ok(result['15MinuteRate'] >= 0);
      //Histogram Stats
      assert.ok(result.min >= 0);
      assert.ok(result.max >= 0);
      assert.ok(result.sum >= 0);
      assert.ok(result.variance >= 0);
      assert.ok(result.mean >= 0);
      assert.ok(result.stddev >= 0);
      assert.ok(result.count >= 0);
      assert.ok(result.median >= 0);
      assert.ok(result.p75 >= 0);
      assert.ok(result.p95 >= 0);
      assert.ok(result.p99 >= 0);
      assert.ok(result.p999 >= 0);
      assert.ok(result.name,'my-timer');
      assert.ok(result.group,'my-collection');
      assert.ok(result.type,'timer');
    });
  });

  it('returns same metric object when given the same name', function () {
    var a1 = collection.counter('a');
    var a2 = collection.counter('a');

    assert.strictEqual(a1, a2);
  });

  it('throws exception when creating a metric without name', function () {
    assert.throws(function () {
      collection.counter();
    }, /Collection\.NoMetricName/);
  });
});
