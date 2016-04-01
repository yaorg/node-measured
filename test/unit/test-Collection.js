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
