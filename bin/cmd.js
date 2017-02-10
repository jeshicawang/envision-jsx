#!/usr/bin/env node

const envision = require('../envision.js');
const program = require('commander');

console.log('Envisioning...');

program
  .version('1.0.0')
  .arguments('<file>')
  .action((file) => envision(file))
  .parse(process.argv);

console.log('Done! Open index.html from envision/ to view rendered tree diagram.');
