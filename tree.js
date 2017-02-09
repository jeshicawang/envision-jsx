const fs = require('fs');
const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');

// custom base adding functionality for walk to traverse JSX
const base = Object.assign({}, walk.base, {
  JSXElement: (node, st, c) => node.children.forEach(n => c(n, st)),
  JSXExpressionContainer: (node, st, c) => c(node.expression, st)
})

const visitors = {
  JSXElement: (node) => console.log(node.type),
  JSXExpressionContainer: (node) => console.log(node.type)
}

const readFiles = (rootFile) => {
  fs.readFile(rootFile, 'utf-8', (err, data) => {
    if (err) return console.log(err);
    const ast = acorn.parse(data, { plugins: { jsx: true } });
    walk.simple(ast, visitors, base);
  })
}

// rootFile is the file containing the ReactDOM.render() call.
const getTree = (rootFile, callback) => {
  readFiles(rootFile);
}

module.exports = { getTree };
