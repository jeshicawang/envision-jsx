#!/usr/bin/env node

const envision = require('../envision.js');
const program = require('commander');

program
  .version('1.0.5')
  .arguments('<root-file>')
  .action((rootFile) => envision(rootFile))
  .parse(process.argv);
