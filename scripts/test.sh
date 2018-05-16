#!/bin/bash

echo "Cleaning build dir"
npm run clean

mkdir -p build/{coverage,jsdoc}

echo "Running linter"
npm run lint
LINT_FAIL=$?

echo "Running mocha with coverage to run tests in a node env"
nyc --report-dir build/coverage/ --reporter=html --reporter=text mocha './test/**/test-*.js'
MOCHA_NODE_FAIL=$?

nyc check-coverage --lines 50 --per-file
COVERAGE_FAIL=$?

echo "Running mochify to run tests in a headless browser environment (Chrome only)"
npm run test:browser
MOCHIFY_BROWESER_FAIL=$?

echo "Generating js docs"
npm run jsdoc
JS_DOC_GENERATION_FAIL=$?

if [[ ${LINT_FAIL} > 0 ]] || \
   [[ ${MOCHA_NODE_FAIL} > 0 ]] || \
   [[ ${COVERAGE_FAIL} > 0 ]] || \
   [[ ${MOCHIFY_BROWESER_FAIL} > 0 ]] || \
   [[ ${JS_DOC_GENERATION_FAIL} > 0 ]]
then
    echo "Not all checks passed, exit with status 1, [ lint: ${LINT_FAIL} mocha: ${MOCHA_NODE_FAIL}, coverage: ${COVERAGE_FAIL} mochify: ${MOCHIFY_BROWESER_FAIL} jsdoc: ${JS_DOC_GENERATION_FAIL} ]"
    exit 1
else
    echo "All checks passed, exit with status 0"
    exit 0
fi