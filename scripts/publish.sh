#!/bin/bash

######################################################################
#
# This script is intended to be used in a Travis CI/CD env.
# It assumes Travis has been set up with jq, and awk and the following secure env vars.
#
# GH_TOKEN: A github oath token with perms to create and push tags and call the releases API.
# NPM_TOKEN: A npm auth token that can publish the packages.
#
######################################################################

set -e

LATEST_RELEASE_DATA=$(curl -s --header "Accept: application/json" -L https://github.com/yaorg/lerna-playground/releases/latest)
LATEST_GITHUB_RELEASE=$(echo $LATEST_RELEASE_DATA | jq --raw-output ".tag_name" | sed 's/v\(.*\)/\1/')
CURRENT_VERSION=$(cat lerna.json | jq --raw-output ".version")

echo "Processing tag information to determine if release is major, minor or patch."
echo "The current version tag is: ${CURRENT_VERSION}"
echo "The new version tag is: ${LATEST_GITHUB_RELEASE}"

if [ -z ${GH_TOKEN} ]
then
    echo "GH_TOKEN is null, you must supply oath token for github. Aborting!"
    exit 1
fi

if [ -z ${NPM_TOKEN} ]
then
    echo "NPM_TOKEN is null, you must supply auth token for npm. Aborting!"
    exit 1
fi

if [ -z ${LATEST_GITHUB_RELEASE} ]
then
    echo "NEW_VERSION is null, aborting!"
    exit 1
fi

if [ -z ${CURRENT_VERSION} ]
then
    echo "CURRENT_VERSION is null, aborting!"
    exit 1
fi

if [ ${CURRENT_VERSION} == ${LATEST_GITHUB_RELEASE} ]
then
    echo "The current version and the new version are the same, aborting!"
    exit 1
fi

CD_VERSION=$(awk -v NEW_VERSION=${LATEST_GITHUB_RELEASE} -v CURRENT_VERSION=${CURRENT_VERSION} 'BEGIN{
    split(NEW_VERSION,newVersionParts,/\./)
    split(CURRENT_VERSION,currentVersionParts,/\./)

    for (i=1;i in currentVersionParts;i++) {
        if (newVersionParts[i] != currentVersionParts[i]) {
            if (i == 1) {
                printf "major\n"
            }

            if (i == 2) {
                printf "minor\n"
            }

            if (i == 3) {
                printf "patch\n"
            }
            break
        }
    }
}')

echo
echo "determined to use semver: '${CD_VERSION}' flag for lerna publish --cd-version"
echo

echo "Re-wireing origin remote to use GH_TOKEN"
git remote rm origin
git remote add origin https://fieldju:${GH_TOKEN}@github.com/yaorg/lerna-playground.git
git fetch --all
git checkout master

echo "Deleting tag created by github to allow lerna to create it"
RELEASE="v${LATEST_GITHUB_RELEASE}"
git tag -d ${RELEASE}
git push origin :refs/tags/${RELEASE}

echo "Preparing .npmrc"
echo '//registry.npmjs.org/:_authToken=${NPM_TOKEN}' > .npmrc
echo 'registry=http://registry.npmjs.org' >> .npmrc

lerna publish --cd-version ${CD_VERSION} --yes --force-publish

echo "Re-binding orphaned github release to tag, so that it shows up as latest release rather than draft release"
RELEASE_ID=$(curl -s --header "Accept: application/vnd.github.v3+json" -H "Authorization: token ${GH_TOKEN}" -L https://api.github.com/repos/yaorg/lerna-playground/releases | jq --arg RELEASE ${RELEASE} -r '.[] | select(.name==$RELEASE) | .id')
curl --request PATCH --data '{"draft":"false"}' -s --header "Accept: application/vnd.github.v3+json" -H "Authorization: token ${GH_TOKEN}" -L https://api.github.com/repos/yaorg/lerna-playground/releases/${RELEASE_ID}