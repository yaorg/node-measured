/*global describe, it, beforeEach, afterEach*/
'use strict';

var common     = require('../../common');
var assert     = require('assert');
var BinaryHeap = common.measured.BinaryHeap;

describe('BinaryHeap#toArray', function () {
  it('is empty in the beginning', function () {
    var heap = new BinaryHeap();
    assert.deepEqual(heap.toArray(), []);
  });

  it('does not leak internal references', function () {
    var heap  = new BinaryHeap();
    var array = heap.toArray();
    array.push(1);

    assert.deepEqual(heap.toArray(), []);
  });
});

describe('BinaryHeap#toSortedArray', function () {
  it('is empty in the beginning', function () {
    var heap = new BinaryHeap();
    assert.deepEqual(heap.toSortedArray(), []);
  });

  it('does not leak internal references', function () {
    var heap  = new BinaryHeap();
    var array = heap.toSortedArray();
    array.push(1);

    assert.deepEqual(heap.toSortedArray(), []);
  });

  it('returns a sorted array', function () {
    var heap  = new BinaryHeap();
    heap.add(1, 2, 3, 4, 5, 6, 7, 8);

    assert.deepEqual(heap.toSortedArray(), [8, 7, 6, 5, 4, 3, 2, 1]);
  });
});

describe('BinaryHeap#add', function () {
  var heap;
  beforeEach(function () {
    heap = new BinaryHeap();
  });

  it('lets you add one element', function () {
    heap.add(1);

    assert.deepEqual(heap.toArray(), [1]);
  });

  it('lets you add two elements', function () {
    heap.add(1);
    heap.add(2);

    assert.deepEqual(heap.toArray(), [2, 1]);
  });

  it('lets you add two elements at once', function () {
    heap.add(1, 2);

    assert.deepEqual(heap.toArray(), [2, 1]);
  });

  it('places elements according to their valueOf()', function () {
    heap.add(2);
    heap.add(1);
    heap.add(3);

    assert.deepEqual(heap.toArray(), [3, 1, 2]);
  });
});

describe('BinaryHeap#removeFirst', function () {
  var heap;
  beforeEach(function () {
    heap = new BinaryHeap();
    heap.add(1, 2, 3, 4, 5, 6, 7, 8);
  });

  it('removeFirst returns the last element', function () {
    var element = heap.removeFirst();
    assert.equal(element, 8);
  });

  it('removeFirst removes the last element', function () {
    heap.removeFirst();
    assert.equal(heap.toArray().length, 7);
  });

  it('removeFirst works multiple times', function () {
    assert.equal(heap.removeFirst(), 8);
    assert.equal(heap.removeFirst(), 7);
    assert.equal(heap.removeFirst(), 6);
    assert.equal(heap.removeFirst(), 5);
    assert.equal(heap.removeFirst(), 4);
    assert.equal(heap.removeFirst(), 3);
    assert.equal(heap.removeFirst(), 2);
    assert.equal(heap.removeFirst(), 1);
    assert.equal(heap.removeFirst(), undefined);
  });
});

describe('BinaryHeap#first', function () {
  var heap;
  beforeEach(function () {
    heap = new BinaryHeap();
    heap.add(1, 2, 3);
  });

  it('returns the first element but does not remove it', function () {
    var element = heap.first();
    assert.equal(element, 3);

    assert.equal(heap.toArray().length, 3);
  });
});

describe('BinaryHeap#size', function () {
  it('takes custom score function', function () {
    var heap = new BinaryHeap({elements: [1, 2, 3]});
    assert.equal(heap.size(), 3);
  });
});

describe('BinaryHeap', function () {
  it('takes custom score function', function () {
    var heap = new BinaryHeap({score: function (obj) {
      return -obj;
    }});

    heap.add(8, 7, 6, 5, 4, 3, 2, 1);
    assert.deepEqual(heap.toSortedArray(), [1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
