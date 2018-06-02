const os = require('os');

/**
 * @module CpuUtils
 */
module.exports = {
  /**
   *
   * @return {{idle: number, total: number}}
   */
  cpuAverage: () => {
    //Initialise sum of idle and time of cores and fetch CPU info
    let totalIdle = 0,
      totalTick = 0;
    const cpus = os.cpus();

    cpus.forEach(cpu => {
      //Total up the time in the cores tick
      Object.keys(cpu.times).forEach((type) => {
        totalTick += cpu.times[type];
      });
      //Total up the idle time of the core
      totalIdle += cpu.times.idle;
    });

    //Return the average Idle and Tick times
    return { idle: totalIdle / cpus.length, total: totalTick / cpus.length };
  },

  /**
   *
   * @param {{idle: number, total: number}} startMeasure
   * @param {{idle: number, total: number}} endMeasure
   */
  calculateCpuUsagePercent: (startMeasure, endMeasure) => {
    //Calculate the difference in idle and total time between the measures
    const idleDifference = endMeasure.idle - startMeasure.idle;
    const totalDifference = endMeasure.total - startMeasure.total;
    //Calculate the average percentage CPU usage
    return Math.ceil(100 - (100 * idleDifference / totalDifference));
  }
};
