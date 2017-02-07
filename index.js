const express = require('express');
const app = express();

const bodyParser = require('body-parser')

const envision = require('./envision');

app.use(bodyParser.json());

app.use(express.static('public'));

app.get('/tree', (req, res) => {
  envision.getTree('../mytrips/src/components/app.js', (tree) => {
    res.json(tree);
  })
})

app.listen(5000, () => console.log('listening on port 5000'));
