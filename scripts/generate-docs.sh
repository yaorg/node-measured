#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/.."
DOCSTRAP_PATH="${ROOT_DIR}/node_modules/ink-docstrap/template/"

# Clear out old docs
rm -fr ${ROOT_DIR}/build/docs

# create the directory structure
mkdir -p ${ROOT_DIR}/build/docs/{img,packages/{measured-core,measured-reporting,measured-signalfx-reporter}}

# Copy the image assets
cp ${ROOT_DIR}/documentation/assets/measured.* ${ROOT_DIR}/build/docs/img/

# Copy our docpath customizations into the docstrap template dir
cp ${ROOT_DIR}/documentation/docstrap_customized/template/* ${DOCSTRAP_PATH}

# Generate the complete API docs for all packages
export PACKAGE_NAME=root
jsdoc --recurse --configure ./.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${DOCSTRAP_PATH} \
--readme ${ROOT_DIR}/Readme.md \
--destination build/docs/ \
${ROOT_DIR}/packages/**/lib/

# Create the docs for measured-core
export PACKAGE_NAME=measured-core
jsdoc --recurse --configure ${ROOT_DIR}/.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${DOCSTRAP_PATH} \
--readme ${ROOT_DIR}/packages/measured-core/README.md \
--destination build/docs/packages/measured-core/ \
${ROOT_DIR}/packages/measured-core/lib/

# Create the docs for measured-reporting
export PACKAGE_NAME=measured-reporting
jsdoc --recurse --configure ${ROOT_DIR}/.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${DOCSTRAP_PATH} \
--readme ${ROOT_DIR}/packages/measured-reporting/README.md \
--destination build/docs/packages/measured-reporting/ \
${ROOT_DIR}/packages/measured-reporting/lib/

# Create the docs for measured-signalfx-reporter
export PACKAGE_NAME=measured-signalfx-reporter
jsdoc --recurse --configure ${ROOT_DIR}/.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${DOCSTRAP_PATH} \
--readme ${ROOT_DIR}/packages/measured-signalfx-reporter/README.md \
--destination build/docs/packages/measured-signalfx-reporter/ \
${ROOT_DIR}/packages/measured-signalfx-reporter/lib/

# Create the docs for measured-node-metrics
export PACKAGE_NAME=measured-node-metrics
jsdoc --recurse --configure ${ROOT_DIR}/.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${DOCSTRAP_PATH} \
--readme ${ROOT_DIR}/packages/measured-node-metrics/README.md \
--destination build/docs/packages/measured-node-metrics/ \
${ROOT_DIR}/packages/measured-node-metrics/lib/