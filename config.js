// @flow
'use strict';
const path = require('path');
const webpack = require('webpack');
const CompressionPlugin = require('compression-webpack-plugin');
const external = require('./external');

const BOLT_WEBPACK_ANALYZER_INPUT_FILE = process.env.BOLT_WEBPACK_ANALYZER_INPUT_FILE;
const BOLT_WEBPACK_ANALYZER_OUTPUT_FILE = process.env.BOLT_WEBPACK_ANALYZER_OUTPUT_FILE;

if (!BOLT_WEBPACK_ANALYZER_INPUT_FILE) throw new Error('Missing process.env.BOLT_WEBPACK_ANALYZER_INPUT_FILE');
if (!BOLT_WEBPACK_ANALYZER_OUTPUT_FILE) throw new Error('Missing process.env.BOLT_WEBPACK_ANALYZER_OUTPUT_FILE');

module.exports = {
  mode: 'production',
  entry: BOLT_WEBPACK_ANALYZER_INPUT_FILE,
  output: {
    path: path.dirname(BOLT_WEBPACK_ANALYZER_OUTPUT_FILE),
    filename: path.basename(BOLT_WEBPACK_ANALYZER_OUTPUT_FILE),
  },
  plugins: [
    new CompressionPlugin(),
  ],
  // externals: [
  //   (context, request, callback) => {
  //     if (external(request)) {
  //       callback(null, 'commonjs ' + request);
  //       return;
  //     }
  //     callback();
  //   },
  // ],
};