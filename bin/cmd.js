#!/usr/bin/env node

const Envision = require('../envision.js');
const program = require('commander');

program
  .version('1.0.8')
  .arguments('<root-file>')
  .action((rootFile) => Envision.parse(rootFile))
  .parse(process.argv);
