#!/usr/bin/env node

const envision = require('../envision.js');
const program = require('commander');

console.log('Envisioning...');

program
  .version('1.0.0')
  .arguments('<file>')
  .action((file) => envision(file))
  .parse(process.argv);
