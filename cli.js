#!/usr/bin/env node
// @flow
'use strict';
const meow = require('meow');
const boltWebpackAnalyzer = require('./');

const cli = meow({
  help: `
    Usage
      $ bolt-webpack-analyzer
  `,
  flags: {},
});

boltWebpackAnalyzer({
  cwd: process.cwd(),
}).catch(err => {
  console.error(err);
  process.exit(1);
});
