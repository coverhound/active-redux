#!/bin/bash
set -e

SOURCE_BRANCH="master"
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" -o "$TRAVIS_REPO_SLUG" != "coverhound/active-redux" ]; then
  echo "Skipping deploy; just doing a build."
  exit 0
fi

TARGET_BRANCH="gh-pages"
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//$GH_TOKEN@github.com:}
SHA=`git rev-parse --verify HEAD`
PACKAGE_VERSION=`cat package.json | grep version | grep -o '[0-9][0-9.]*'`

echo "Cloning a shallow copy of the repo to docs"
rm -rf docs || true
git clone --quiet --branch=$TARGET_BRANCH --depth=1 $SSH_REPO docs > /dev/null

echo "Cleaning out v$PACKAGE_VERSION of the docs"
rm -rf "docs/$PACKAGE_VERSION"

yarn docs
mv ./docs/@coverhound/active-redux/* ./docs

echo "Checking for changes in docs"
cd ./docs
git add .
if [ -z `git diff --staged --exit-code` ]; then
  echo "No changes to push. Exiting..."
  exit 0
fi

echo "Pushing up new changes"
git config user.name "travis-ci"
git config user.email "travis@travis-ci.org"
git commit -m "Deploy to GitHub Pages: $SHA [$TRAVIS_BUILD_NUMBER]"

git push origin $TARGET_BRANCH
