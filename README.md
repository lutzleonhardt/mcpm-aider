# typescript-npm-cli-template

> Boilerplate to kickstart creating a Node.js command-line tool

Inspired by [node-cli-boilerplate](https://github.com/sindresorhus/node-cli-boilerplate)

## Getting started

### Set up your repository

**Click the "Use this template" button.**

Alternatively, create a new directory and then run:

```bash
curl -fsSL https://github.com/ryansonshine/typescript-npm-cli-template/archive/main.tar.gz | tar -xz --strip-components=1
```

Replace `FULL_NAME`, `GITHUB_USER`, and `REPO_NAME` in the script below with your own details to personalize your new package:

```bash
FULL_NAME="John Smith"
GITHUB_USER="johnsmith"
REPO_NAME="my-cool-package"
sed -i.mybak "s/\([\/\"]\)(ryansonshine)/$GITHUB_USER/g; s/typescript-npm-cli-template\|my-cli-name/$REPO_NAME/g; s/Ryan Sonshine/$FULL_NAME/g" package.json package-lock.json README.md
rm *.mybak
```

### Add NPM Token

Add your npm token to your GitHub repository secrets as `NPM_TOKEN`.

### Add Codecov integration

Enable the Codecov GitHub App [here](https://github.com/apps/codecov).

**Remove everything from here and above**

---

# my-cli-name

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> My awesome command-line tool

## Install

```bash
npm install my-cli-name
```

## Usage

```bash
Usage: my-command [options]

Options:
  -V, --version            output the version number
  -d, --debug              enables verbose logging (default: false)

Examples:

  $ my-command --version
  1.0.0
```

[build-img]:https://github.com/ryansonshine/typescript-npm-cli-template/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/ryansonshine/typescript-npm-cli-template/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/typescript-npm-cli-template
[downloads-url]:https://www.npmtrends.com/typescript-npm-cli-template
[npm-img]:https://img.shields.io/npm/v/typescript-npm-cli-template
[npm-url]:https://www.npmjs.com/package/typescript-npm-cli-template
[issues-img]:https://img.shields.io/github/issues/ryansonshine/typescript-npm-cli-template
[issues-url]:https://github.com/ryansonshine/typescript-npm-cli-template/issues
[codecov-img]:https://codecov.io/gh/ryansonshine/typescript-npm-cli-template/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/ryansonshine/typescript-npm-cli-template
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/
