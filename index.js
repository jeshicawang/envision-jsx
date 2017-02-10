const express = require('express');
const app = express();
const fs = require('fs');

const bodyParser = require('body-parser')

const envision = require('./envision');

app.use(bodyParser.json());

app.use(express.static('public'));

app.listen(5000, () => console.log('listening on port 5000'));

const root = '../mytrips/src/index.js';
const tree = envision.getTree(root);
fs.writeFile('public/data.json', JSON.stringify(tree), (err) => {
  if (err) throw err;
  console.log('Tree data written to data.json');
  console.log(tree);
});
