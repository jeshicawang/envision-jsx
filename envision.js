const fs = require('fs');
const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');
const Mustache = require('mustache');

// custom walker algorithm adding functionality for walk to traverse JSX
const base = Object.assign({}, walk.base, {
  JSXElement: (node, st, c) => node.children.forEach(n => c(n, st)),
  JSXExpressionContainer: (node, st, c) => c(node.expression, st)
})

// visitors for walk.simple call
const variableDeclaratorVisitors = (rootDirectory, hierarchy, chain) => ({
  VariableDeclarator: (node, state) => {
    if (node.id.name !== state) return;
    if (node.init.type === 'ArrowFunctionExpression') return;
    const value = node.init.arguments[0].value;
    const file = rootDirectory + value.substring(2);
    rootDirectory = file.substring(0, file.lastIndexOf('/') + 1);
    readFiles(file, { rootDirectory, hierarchy, chain });
  }
})

// visitors for walk.ancestor call
const jsxElementVisitors = (ast) => ({
  JSXElement: (node, { rootDirectory, hierarchy, chain }, ancestors) => {
    const componentChain = ancestors
      .filter(a => a.type === 'JSXElement')
      .map(a => a.openingElement.name.name)
      .filter(name => name.charAt(0) === name.charAt(0).toUpperCase())
      .reduce((hierarchy, name) => hierarchy + (hierarchy ? '.' : '') + name, chain);
    if (!componentChain || componentChain === chain) return;
    hierarchy.push(componentChain);
    if (!node.openingElement.selfClosing) return;
    const state = node.openingElement.name.name;
    walk.simple(ast, variableDeclaratorVisitors(rootDirectory, hierarchy, componentChain), base, state)
  }
})

// parsing the data from a file and calling a walker function to traverse the resulting AST
const readFiles = (file, state) => {
  const data = fs.readFileSync(file, 'utf-8');
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
    console.log('envision.html created');
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
