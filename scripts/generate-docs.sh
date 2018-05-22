#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="${SCRIPT_DIR}/.."


# Clear out old docs
rm -fr ${ROOT_DIR}/build/docs

# create the directory structure
mkdir -p ${ROOT_DIR}/build/docs/{img,packages/{measured-core,measured-reporting,measured-signalfx-reporter}}

cp ${ROOT_DIR}/documentation/assets/measured.* ${ROOT_DIR}/build/docs/img/

# Generate the complete API docs for all packages
export PACKAGE_NAME=root
jsdoc --recurse --configure ./.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${ROOT_DIR}/documentation/docstrap/template \
--readme ${ROOT_DIR}/Readme.md \
--destination build/docs/ \
${ROOT_DIR}/packages/**/lib/

# Create the docs for measured-core
export PACKAGE_NAME=measured-core
jsdoc --recurse --configure ${ROOT_DIR}/.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${ROOT_DIR}/documentation/docstrap/template \
--readme ${ROOT_DIR}/packages/measured-core/README.md \
--destination build/docs/packages/measured-core/ \
${ROOT_DIR}/packages/measured-core/lib/

# Create the docs for measured-reporting
export PACKAGE_NAME=measured-reporting
jsdoc --recurse --configure ${ROOT_DIR}/.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${ROOT_DIR}/documentation/docstrap/template \
--readme ${ROOT_DIR}/packages/measured-reporting/README.md \
--destination build/docs/packages/measured-reporting/ \
${ROOT_DIR}/packages/measured-reporting/lib/

# Create the docs for measured-signalfx-reporter
export PACKAGE_NAME=measured-signalfx-reporter
jsdoc --recurse --configure ${ROOT_DIR}/.jsdoc.json \
--tutorials ${ROOT_DIR}/tutorials \
--template ${ROOT_DIR}/documentation/docstrap/template \
--readme ${ROOT_DIR}/packages/measured-signalfx-reporter/README.md \
--destination build/docs/packages/measured-signalfx-reporter/ \
${ROOT_DIR}/packages/measured-signalfx-reporter/lib/