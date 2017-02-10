#!/usr/bin/env node

const { setRootFile, writeTreeData } = require('../envision.js');
const program = require('commander');

console.log('Envisioning...');

program
  .version('1.0.3')
  .arguments('<file>')
  .action((file) => envision(file))
  .parse(process.argv);

function envision(file) {
  setRootFile(file);
  writeTreeData();
}
