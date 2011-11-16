var common     = require('../../common');
var test       = require('utest');
var assert     = require('assert');
var BinaryHeap = common.betterMetrics.BinaryHeap;

test('BinaryHeap#toArray', {
  'is empty in the beginning': function() {
    var heap = new BinaryHeap();
    assert.deepEqual(heap.toArray(), []);
  },

  'does not leak internal references': function() {
    var heap  = new BinaryHeap();
    var array = heap.toArray();
    array.push(1);

    assert.deepEqual(heap.toArray(), []);
  },
});

test('BinaryHeap#toSortedArray', {
  'is empty in the beginning': function() {
    var heap = new BinaryHeap();
    assert.deepEqual(heap.toSortedArray(), []);
  },

  'does not leak internal references': function() {
    var heap  = new BinaryHeap();
    var array = heap.toSortedArray();
    array.push(1);

    assert.deepEqual(heap.toSortedArray(), []);
  },

  'returns a sorted array': function() {
    var heap  = new BinaryHeap();
    heap.push(1, 2, 3, 4, 5, 6, 7, 8);

    assert.deepEqual(heap.toSortedArray(), [8, 7, 6, 5, 4, 3, 2, 1]);
  },
});

var heap;
test('BinaryHeap#push', {
  before: function() {
    heap = new BinaryHeap();
  },

  'lets you add one element': function() {
    heap.push(1);

    assert.deepEqual(heap.toArray(), [1]);
  },

  'lets you add two elements': function() {
    heap.push(1);
    heap.push(2);

    assert.deepEqual(heap.toArray(), [2, 1]);
  },

  'lets you add two elements at once': function() {
    heap.push(1, 2);

    assert.deepEqual(heap.toArray(), [2, 1]);
  },

  'places elements according to their valueOf()': function() {
    heap.push(2);
    heap.push(1);
    heap.push(3);

    assert.deepEqual(heap.toArray(), [3, 1, 2]);
  },
});

var heap;
test('BinaryHeap#pop', {
  before: function() {
    heap = new BinaryHeap();
    heap.push(1, 2, 3, 4, 5, 6, 7, 8);
  },

  'pop returns the last element': function() {
    var element = heap.pop();
    assert.equal(element, 8);
  },

  'pop removes the last element': function() {
    var element = heap.pop();
    assert.equal(heap.toArray().length, 7);
  },

  'pop works multiple times': function() {
    assert.equal(heap.pop(), 8);
    assert.equal(heap.pop(), 7);
    assert.equal(heap.pop(), 6);
    assert.equal(heap.pop(), 5);
    assert.equal(heap.pop(), 4);
    assert.equal(heap.pop(), 3);
    assert.equal(heap.pop(), 2);
    assert.equal(heap.pop(), 1);
    assert.equal(heap.pop(), undefined);
  },
});

test('BinaryHeap', {
  'takes custom score function': function() {
    var heap = new BinaryHeap({score: function(obj) {
      return -obj;
    }});

    heap.push(8, 7, 6, 5, 4, 3, 2, 1)
    assert.deepEqual(heap.toSortedArray(), [1, 2, 3, 4, 5, 6, 7, 8]);
  },
});
