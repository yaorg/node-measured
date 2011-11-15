var common = require('../common');
var test   = require('utest');
var assert = require('assert');
var units = common.betterMetrics.units;

test('ExponentiallyDecayingSample', {
  'apparently nothing yet': function() {
    var sample = new common.betterMetrics.ExponentiallyDecayingSample();
  },
});
