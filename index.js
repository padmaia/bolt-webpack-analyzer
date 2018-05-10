// @flow
'use strict';
const spawn = require('spawndamnit');
const findUp = require('find-up');
const path = require('path');
const bolt = require('bolt');
const fs = require('fs');
const pLimit = require('p-limit');
const os = require('os');
const chalk = require('chalk');
const prettyBytes = require('pretty-bytes');
const { promisify } = require('util');

const WEBPACK_BIN = path.join(__dirname, 'node_modules', '.bin', 'webpack-cli');
const DEFAULT_CONFIG = path.join(__dirname, 'config.js');

const processLimit = pLimit(os.cpus().length);

/*::
type Opts = {
  cwd: string,
};
*/

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

async function tryMkdir(filePath) {
  try {
    await mkdir(filePath);
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err;
    }
  }
}

function normalizePackageName(packageName) {
  return packageName.replace(/\//g, '--');
}

function createEntry(cacheDir, id) {
  let input = path.join(cacheDir, id + '.js');
  let output = path.join(cacheDir, id + '.bundle.js');
  let outputGz = path.join(cacheDir, id + '.bundle.js.gz');
  return { id, input, output, outputGz };
}

async function bundleEntry(cacheDir, entry) {
  let { code } = await spawn(WEBPACK_BIN, [
    '--config', DEFAULT_CONFIG
  ], {
    cwd: cacheDir,
    stdio: 'ignore',
    // stdio: verbose ? ['ignore', 'inherit', 'inherit'] : 'ignore',
    env: Object.assign({}, process.env, {
      BOLT_WEBPACK_ANALYZER_INPUT_FILE: entry.input,
      BOLT_WEBPACK_ANALYZER_OUTPUT_FILE: entry.output,
      BOLT_WEBPACK_ANALYZER_TARGET_NAME: entry.name,
      // BOLT_WEBPACK_ANALYZER_TARGET_ONLY: entry.kind === 'all' ? 'false' : 'true',
    }),
  });

  let sizes = {};

  if (code === 0) {
    let outputStats = await stat(entry.output);
    let outputStatsGz = await stat(entry.outputGz);

    sizes.outputBytes = outputStats.size;
    sizes.outputBytesGz = outputStatsGz.size;
  }

  return { code, sizes };
}

async function boltWebpackAnalyzer(
  opts /*: Opts */
) {
  let cwd = opts.cwd;
  let nodeModulesDir = await findUp('node_modules', { cwd });
  let nodeModulesCacheDir = path.join(nodeModulesDir, '.cache');
  let cacheDir = path.join(nodeModulesCacheDir, 'bolt-webpack-analyzer');

  await tryMkdir(nodeModulesCacheDir);
  await tryMkdir(cacheDir);

  let packages = await bolt.getWorkspaces({
    cwd,
    ignoreFs: '{build/*,packages/css-packs/*,website}'
  });

  let entries = await Promise.all(packages.map(async pkg => {
    let id = 'pkg--' + normalizePackageName(pkg.name);
    let entry = createEntry(cacheDir, id);

    let mainPath = path.join(pkg.dir, pkg.config.main || 'index.js');
    let relativePath = path.relative(cacheDir, mainPath);
    let fileContents = `f(require("${relativePath}"));\n`;
    await writeFile(entry.input, fileContents);
    return entry;
  }));
  
  let outputInfo = await Promise.all(entries.map(entry => processLimit(async () => {
    let { id } = entry;
    console.log(chalk.cyan(`Building ${id}...`));
    let { code, sizes } = await bundleEntry(cacheDir, entry);
    if (code !== 0) {
      console.error(chalk.red(`${id} exited with ${code}`));
    } else {
      console.log(chalk.green(`${id} (${prettyBytes(sizes.outputBytes)} min, ${prettyBytes(sizes.outputBytesGz)} min+gz)`));
    }
    return  { id, sizes };
  })));

  
}

module.exports = boltWebpackAnalyzer;
