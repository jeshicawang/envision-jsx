fetch('/tree')
  .then(results => results.json())
  .then(json => console.log(json))
  .catch(error => console.error(error));
