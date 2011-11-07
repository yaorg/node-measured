var common = require('../common');
var assert = require('assert');
var units = common.betterMetrics.units;

var sample = new common.betterMetrics.ExponentiallyDecayingSample();
