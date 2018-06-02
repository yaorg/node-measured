/*global describe, it, beforeEach, afterEach*/
const assert = require('assert');
const CpuUtils = require('../../../lib/utils/CpuUtils');

describe('CpuUtils', () => {
  it('#cpuAverage ', () => {
    const measure = CpuUtils.cpuAverage();
    assert(typeof measure.idle === 'number');
    assert(measure.idle > 0);

    assert(typeof measure.total === 'number');
    assert(measure.total > 0);
  });

  it('#calculateCpuUsagePercent calculates a percent', async () => {
    const start = CpuUtils.cpuAverage();

    for (let i = 0; i < 10000000; i++) {
      Math.floor(Math.random() * Math.floor(10000000));
    }

    const end = CpuUtils.cpuAverage();
    const percent = CpuUtils.calculateCpuUsagePercent(start, end);
    assert(typeof percent === 'number');
    assert(percent > 0);
  });
});
