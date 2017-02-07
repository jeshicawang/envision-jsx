const rootFile = '../mytrips/src/components/app.js';

fetch('/tree?root=' + rootFile)
  .then(results => results.json())
  .then(json => console.log(json))
  .catch(error => console.error(error));
