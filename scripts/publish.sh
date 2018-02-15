#!/usr/bin/env sh
# Exit on failure of any of these commands
set -e

# This script is here because we can't safely rely on prepublish only being run
# on the machine that's publishing.
# https://blog.greenkeeper.io/what-is-npm-s-prepublish-and-why-is-it-so-confusing-a948373e6be1
# This is fixed on some versions of NPM, but we can't know what everyone's
# running, so it's not worth using it.

# Ensure our tests pass and our linter
npm run lint
npm test

# Ensure we create our distributed files
npm run dist

# Tag
version=$(npm version --json | python -c 'import sys, json; print json.load(sys.stdin)["@coverhound/active-redux"]')
git tag "v$version"
git push origin "v$version"

# Publish
npm publish
