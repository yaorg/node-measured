# Measured SignalFx Reporter

This package ties together [measured-core](../measured-core) and [measured-reporting](../measured-reporting) to create a dimensional aware self reporting metrics registry that reports metrics to SignalFx.

## Install

```
npm install measured-signalfx-reporter
```

## What is in this package

### [SignalFxMetricsReporter](https://yaorg.github.io/node-measured/SignalFxMetricsReporter.html)
A SignalFx specific implementation of the [Reporter Abstract Class](https://yaorg.github.io/node-measured/Reporter.html).

Please note that this implementation ignores Meters and is opinionated that you should do meter logic with counters and utilize the built in capabilities of SignalFx to get rates from counted events. This lowers your DPM usage and is how SignalFx charges you, thus lowering your bill.

If presented with a valid argument, I am open to changing this.

### [SignalFxSelfReportingMetricsRegistry](https://yaorg.github.io/node-measured/SignalFxSelfReportingMetricsRegistry.html)
Extends [Self Reporting Metrics Registry](https://yaorg.github.io/node-measured/SelfReportingMetricsRegistry.html) but overrides methods that generate Meters to use the NoOpMeter.

Again this is opinionated that you shouldn't use Meters with SignalFx, because you can use a counter and get the same results at 1/6 the DPM usage.

If presented with a valid argument, I am open to changing this.

### Usage

See the full end to end example here: [SignalFx Express Full End to End Example](https://yaorg.github.io/node-measured/packages/measured-signalfx-reporter/tutorial-SignalFx%20Express%20Full%20End%20to%20End%20Example.html)

### Dev

There is a user acceptance test server to test this library end to end to signalfx

```bash
SIGNALFX_API_KEY=xxxxx yarn uat:server
```