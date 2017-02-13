#!/usr/bin/env node

const envision = require('../envision.js');
const program = require('commander');

console.log('Envisioning...');

program
  .version('1.0.0')
  .arguments('<root-file>')
  .action((rootFile) => envision(rootFile))
  .parse(process.argv);
