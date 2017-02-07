const express = require('express');
const app = express();
const envision = require('./envision');

envision.getTree('../mytrips/src/components/app.js', (tree) => {
  console.log(tree);
})

app.use(express.static('public'));

app.listen(5000, () => console.log('listening on port 5000'));
