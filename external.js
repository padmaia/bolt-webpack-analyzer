// @flow
'use strict';

const BOLT_WEBPACK_ANALYZER_INPUT_FILE = process.env.BOLT_WEBPACK_ANALYZER_INPUT_FILE;
// const BOLT_WEBPACK_ANALYZER_TARGET_ONLY = process.env.BOLT_WEBPACK_ANALYZER_TARGET_ONLY;
const BOLT_WEBPACK_ANALYZER_TARGET_NAME = process.env.BOLT_WEBPACK_ANALYZER_TARGET_NAME;

if (!BOLT_WEBPACK_ANALYZER_INPUT_FILE) throw new Error('Missing process.env.BOLT_WEBPACK_ANALYZER_INPUT_FILE');
// if (!BOLT_WEBPACK_ANALYZER_TARGET_ONLY) throw new Error('Missing process.env.BOLT_WEBPACK_ANALYZER_TARGET_ONLY');
if (!BOLT_WEBPACK_ANALYZER_TARGET_NAME) throw new Error('Missing process.env.BOLT_WEBPACK_ANALYZER_TARGET_NAME');

module.exports = (id /*: string */) => {
  // if (BOLT_WEBPACK_ANALYZER_TARGET_ONLY !== 'true') return false;
  if (id[0] === '.') return false;
  if (id.includes(BOLT_WEBPACK_ANALYZER_INPUT_FILE)) return false;
  if (id.includes(BOLT_WEBPACK_ANALYZER_TARGET_NAME)) return false;
  return true;
};