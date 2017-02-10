const express = require('express');
const app = express();

const bodyParser = require('body-parser')

const envision = require('./envision');
envision.setRootFile('../mytrips/src/index.js');
envision.writeTreeData();

app.use(bodyParser.json());

app.use(express.static('src'));

app.listen(5000, () => console.log('listening on port 5000'));
