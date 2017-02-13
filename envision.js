const fs = require('fs');
const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');
const Mustache = require('mustache');

// custom walker algorithm adding functionality for walk to traverse JSX
const base = Object.assign({}, walk.base, {
  JSXElement: (node, st, c) => node.children.forEach(n => c(n, st)),
  JSXExpressionContainer: (node, st, c) => c(node.expression, st)
})

// returns whether the node's variable declarator name matches name or not
const match = (node, name) => {
  switch (node.id.type) {
    case 'Identifier':
      return node.id.name === name;
    case 'ObjectPattern':
      return node.id.properties.map(property => property.key.name).includes(name);
    default:
      return false;
  }
}

// returns whether the node is a require call or not
const requireCall = (node) => node.init.callee && node.init.callee.name === 'require';

// visitors for walk.simple call
const variableDeclaratorVisitors = (rootDirectory, hierarchy, chain) => ({
  VariableDeclarator: (node, state) => {
    if (!match(node, state) || !requireCall(node)) return;
    const file = node.init.arguments[0].value;
    if (file.charAt(0) !== '.') return;
    const path = rootDirectory + file.substring(2);
    rootDirectory = path.substring(0, path.lastIndexOf('/') + 1);
    readFiles(path, { rootDirectory, hierarchy, chain });
  }
})

// visitors for walk.ancestor call
const jsxElementVisitors = (ast) => ({
  JSXElement: (node, { rootDirectory, hierarchy, chain }, ancestors) => {
    const componentChain = ancestors
      .filter(a => a.type === 'JSXElement')
      .map(a => a.openingElement.name.name)
      .filter(name => name.charAt(0) === name.charAt(0).toUpperCase())
      .reduce((chain, name) => chain + (chain ? '.' : '') + name, chain);
    if (!componentChain || componentChain === chain) return;
    hierarchy.push(componentChain);
    const state = node.openingElement.name.name;
    walk.simple(ast, variableDeclaratorVisitors(rootDirectory, hierarchy, componentChain), base, state)
  }
})

// parsing the data from a file and calling a walker function to traverse the resulting AST
const readFiles = (path, state) => {
  if (path.substring(path.length - 3) !== '.js') path = path + '.js';
  const data = fs.readFileSync(path, 'utf-8');
  const ast = acorn.parse(data, { plugins: { jsx: true } });
  walk.ancestor(ast, jsxElementVisitors(ast), base, state);
}

// create envision.html file from src files
const createEnvisionHTML = (hierarchy) => {
  const template = fs.readFileSync(__dirname + '/src/template.mustache', 'utf-8');
  const view = {
    css: fs.readFileSync(__dirname + '/src/default.css', 'utf-8'),
    javascript: fs.readFileSync(__dirname + '/src/main.js', 'utf-8'),
    hierarchy: JSON.stringify(hierarchy)
  }
  const output = Mustache.render(template, view)
  fs.writeFile('envision.html', output, (err) => {
    if (err) throw err;
    console.log('Done! Open envision.html to view rendered tree diagram.');
  })
}

// compute hierarchial tree data starting from rootFile and create files to render the tree display.
const envision = (rootFile) => {
  const hierarchy = [];
  const rootDirectory = rootFile.substring(0, rootFile.lastIndexOf('/') + 1);
  readFiles(rootFile, { rootDirectory, hierarchy, chain: '' });
  createEnvisionHTML(hierarchy);
}

module.exports = envision;
