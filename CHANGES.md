# Changes

## 1.3.0

- Add SettableGauge, a gauge that can have it's value set directly, useful for async situations
- Converts Files to ES6, using modified AirBnB eslint rules.
- Remove documentation from README and annotated all the classes so that documentation is generated from code rather than manually curated.
- Add tasks to create documentation static html site
- Renamed `measured` package name to `@yaorg/measured-core` to reflect new org and the fact that it is the core library.
- Configure Travis to do npm releases when tags are published

## 1.2.0

- Add Histogram#weightedPercentiles and allow setting percentilesMethod in Histogram options. (Csaba Palfi)

## 1.1.0

- Add Histogram#hasValues (Fredrik Hörte)

## 1.0.2

- Add "files" list to package.json

## 1.0.1

- Fix `counter.inc(0)` and `counter.dec(0)` (Maximilian Antoni)

## 1.0.0

- Browserify support (Maximilian Antoni)
- Change test framework to Mocha and Mochify (Maximilian Antoni)

## 0.1.5

- Fix High Resolution Timer bug when the time is greater than one second (Yujie
  Zhou)

## 0.1.4

- Meter: add ref/unref methods (Ben Noordhuis)
- Leverage Node high resolution timer (Yujie Zhou)
- Meter: the start time is not initialized correctly (Yujie Zhou)

## 0.1.3

- Implement `createConnection()` method

## 0.1.2

- Fix `this` in closure and typo (Jonas Dohse)
- Provide `Collection.end()` to shutdown internal intervals (Jonas Dohse)

