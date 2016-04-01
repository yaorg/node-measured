'use strict';

exports.extend = function extend(obj, src) {
  var key;
  for (key in src) {
    if (src.hasOwnProperty(key)) {
      obj[key] = src[key];
    }
  }
  return obj;
};
