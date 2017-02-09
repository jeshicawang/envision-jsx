const express = require('express');
const app = express();

const bodyParser = require('body-parser')

const envision = require('./tree');

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/tree', (req, res) => {
  const { root } = req.query;
  const tree = envision.getTree(root);
  res.json(tree);
})

app.listen(5000, () => console.log('listening on port 5000'));
