'use strict';

// Based on http://en.wikipedia.org/wiki/Binary_Heap
// as well as http://eloquentjavascript.net/appendix2.html
function BinaryHeap(options) {
  options = options || {};

  this._elements = options.elements || [];
  this._score    = options.score || this._score;
}

BinaryHeap.prototype.add = function () {
  var i, element;
  for (i = 0; i < arguments.length; i++) {
    element = arguments[i];

    this._elements.push(element);
    this._bubble(this._elements.length - 1);
  }
};

BinaryHeap.prototype.first = function () {
  return this._elements[0];
};

BinaryHeap.prototype.removeFirst = function () {
  var root = this._elements[0];
  var last = this._elements.pop();

  if (this._elements.length > 0) {
    this._elements[0] = last;
    this._sink(0);
  }

  return root;
};

BinaryHeap.prototype.clone = function () {
  return new BinaryHeap({
    elements: this.toArray(),
    score: this._score
  });
};

BinaryHeap.prototype.toSortedArray = function () {
  var array = [];
  var clone = this.clone();
  var element;

  while (true) {
    element = clone.removeFirst();
    if (element === undefined) {
      break;
    }

    array.push(element);
  }

  return array;
};

BinaryHeap.prototype.toArray = function () {
  return [].concat(this._elements);
};

BinaryHeap.prototype.size = function () {
  return this._elements.length;
};

BinaryHeap.prototype._bubble = function (bubbleIndex) {
  var bubbleElement = this._elements[bubbleIndex];
  var bubbleScore   = this._score(bubbleElement);
  var parentIndex;
  var parentElement;
  var parentScore;

  while (bubbleIndex > 0) {
    parentIndex   = this._parentIndex(bubbleIndex);
    parentElement = this._elements[parentIndex];
    parentScore   = this._score(parentElement);

    if (bubbleScore <= parentScore) {
      break;
    }

    this._elements[parentIndex] = bubbleElement;
    this._elements[bubbleIndex] = parentElement;
    bubbleIndex                 = parentIndex;
  }
};

BinaryHeap.prototype._sink = function (sinkIndex) {
  var sinkElement = this._elements[sinkIndex];
  var sinkScore   = this._score(sinkElement);
  var length      = this._elements.length;
  var swapIndex;
  var swapScore;
  var swapElement;
  var childIndexes;
  var i;
  var childIndex;
  var childElement;
  var childScore;

  while (true) {
    swapIndex    = null;
    swapScore    = null;
    swapElement  = null;
    childIndexes = this._childIndexes(sinkIndex);

    for (i = 0; i < childIndexes.length; i++) {
      childIndex = childIndexes[i];

      if (childIndex >= length) {
        break;
      }

      childElement = this._elements[childIndex];
      childScore   = this._score(childElement);

      if (childScore > sinkScore) {
        if (swapScore === null || swapScore < childScore) {
          swapIndex   = childIndex;
          swapScore   = childScore;
          swapElement = childElement;
        }
      }
    }

    if (swapIndex === null) {
      break;
    }

    this._elements[swapIndex] = sinkElement;
    this._elements[sinkIndex] = swapElement;
    sinkIndex = swapIndex;
  }
};

BinaryHeap.prototype._parentIndex = function (index) {
  return Math.floor((index - 1) / 2);
};

BinaryHeap.prototype._childIndexes = function (index) {
  return [
    2 * index + 1,
    2 * index + 2
  ];
};

BinaryHeap.prototype._score = function (element) {
  return element.valueOf();
};

module.exports = BinaryHeap;
