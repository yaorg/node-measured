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

    /*
    var a,b,c,d,e,f;
    beforeEach(function(){
      collection = new common.measured.Collection('counters');
      var a = collection.counter('a');
      var b = collection.counter('b');
      var c = collection.histogram('c');
      var d = collection.meter('d');
      var gauge = new common.measured.Gauge(function(){
        return 23;
      });
      var e = collection.register('e', gauge);
      var f = collection.timer('f');
      a.inc(3);
      b.inc(5);
      c.update(1);
      d.mark();
      f.update(1);
    });

    it('using toFlatJSON', function () {
      var result = collection.toFlatJSON();
      assert.equal(result.length, 6);
      assert.equal(result[0].name, 'a');
      assert.equal(result[0].type, 'counter');
    });
    */
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
