const fs = require('fs');
const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');

let rootDirectory;
//const hierarchy = [];

// custom base adding functionality for walk to traverse JSX
const base = Object.assign({}, walk.base, {
  JSXElement: (node, st, c) => node.children.forEach(n => c(n, st)),
  JSXExpressionContainer: (node, st, c) => c(node.expression, st)
})

const createIdentifierVisitors = (hierarchy, chain) => ({
  VariableDeclarator: (node, state) => {
    if (node.id.name !== state) return;
    if (node.init.type === 'ArrowFunctionExpression') return;
    const value = node.init.arguments[0].value;
    const file = rootDirectory + value.substring(2);
    rootDirectory = file.substring(0, file.lastIndexOf('/') + 1);
    readFiles(file, { hierarchy, chain });
  }
})

const createJSXElementVisitors = (ast) => ({
  JSXElement: (node, { hierarchy, chain }, ancestors) => {
    const componentChain = ancestors
      .filter(a => a.type === 'JSXElement')
      .map(a => a.openingElement.name.name)
      .filter(name => name.charAt(0) === name.charAt(0).toUpperCase())
      .reduce((hierarchy, name) => hierarchy + (hierarchy ? '.' : '') + name, chain);
    if (!componentChain || componentChain === chain) return;
    hierarchy.push(componentChain);
    console.log(hierarchy);
    if (!node.openingElement.selfClosing) return;
    const state = node.openingElement.name.name;
    walk.simple(ast, createIdentifierVisitors(hierarchy, componentChain), base, state)
  }
})

const readFiles = (rootFile, state) => {
  fs.readFile(rootFile, 'utf-8', (err, data) => {
    if (err) return console.log(err);
    const ast = acorn.parse(data, { plugins: { jsx: true } });
    walk.ancestor(ast, createJSXElementVisitors(ast), base, state);
  })
}

// rootFile is the file containing the ReactDOM.render() call.
const getTree = (rootFile, callback) => {
  rootDirectory = rootFile.substring(0, rootFile.lastIndexOf('/') + 1);
  readFiles(rootFile, { hierarchy: [], chain: '' });
}

module.exports = { getTree };
