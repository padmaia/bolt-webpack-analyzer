#!/usr/bin/env node
// @flow
'use strict';
const meow = require('meow');
const arrify = require('arrify');
const Table = require('cli-table');
const prettyBytes = require('pretty-bytes');
const chalk = require('chalk');
const boltWebpackAnalyzer = require('./');

const cli = meow({
  help: `
    Usage
      $ bolt-webpack-analyzer

      Flags
      --ignore, -i <dep name>    Ignore packages (can be globs)
  `,
  flags: {
    ignore: {
      type: 'string',
  		alias: 'i'
    },
  },
});

console.log(cli.flags.ignore);

async function main() {
  try {
    let results = await boltWebpackAnalyzer({
      cwd: process.cwd(),
      ignore: arrify(cli.flags.ignore),
    });

    let table = new Table({
      head: ['Name', 'min', 'min+gz']
    });

    results.forEach(result => {
      table.push([
        result.entry.name,
        result.sizes.outputBytes ? prettyBytes(result.sizes.outputBytes) : chalk.red('err'),
        result.sizes.outputBytesGz ? prettyBytes(result.sizes.outputBytesGz) : chalk.red('err'),
      ]);
    });

    console.log(table.toString());
  } catch (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }
}

main();