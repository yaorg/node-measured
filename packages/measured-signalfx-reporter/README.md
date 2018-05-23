# Measured SignalFx Reporter

This package ties together [measured-core](../measured-core) and [measured-reporting](../measured-reporting) to create a dimensional aware self reporting metrics registry that reports metrics to [SignalFx](https://signalfx.com/).

## Install

```
npm install measured-signalfx-reporter
```

## What is in this package

### [SignalFxMetricsReporter](https://yaorg.github.io/node-measured/SignalFxMetricsReporter.html)
A SignalFx specific implementation of the [Reporter Abstract Class](https://yaorg.github.io/node-measured/Reporter.html).

### [SignalFxSelfReportingMetricsRegistry](https://yaorg.github.io/node-measured/SignalFxSelfReportingMetricsRegistry.html)
Extends [Self Reporting Metrics Registry](https://yaorg.github.io/node-measured/SelfReportingMetricsRegistry.html) but overrides methods that generate Meters to use the NoOpMeter.

### NoOpMeters

Please note that this package ignores Meters by default. Meters do not make sense to use with SignalFx because the same
values can be calculated using simple counters and the aggregation functions available within SignalFx itself.
Additionally, this saves you money because SignalFx charges based on your DPM (Datapoints per Minute) consumption.

This can be changed if anyone has a good argument for using Meters.  Please file an issue.

### Usage

See the full end to end example here: [SignalFx Express Full End to End Example](https://yaorg.github.io/node-measured/packages/measured-signalfx-reporter/tutorial-SignalFx%20Express%20Full%20End%20to%20End%20Example.html)

### Dev

There is a user acceptance test server to test this library end-to-end with [SignalFx](https://signalfx.com/).

```bash
SIGNALFX_API_KEY=xxxxx yarn uat:server
```