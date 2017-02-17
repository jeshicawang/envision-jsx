const fs = require('fs');
const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');
const Mustache = require('mustache');
const opn = require('opn');

const OUTPUT_FILE_NAME = 'envision.html';

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

// if it's a relative path returns true, if it's a module path returns false
const relativePath = (file) => (file.charAt(0) === '.');

// visitors for walk.simple call
const variableDeclaratorVisitors = (rootDirectory, hierarchy, chain) => ({
  VariableDeclarator: (node, state) => {
    if (!match(node, state) || !requireCall(node)) return;
    const file = node.init.arguments[0].value;
    if (!relativePath(file)) return;
    const path = rootDirectory + file.substring(2);
    rootDirectory = path.substring(0, path.lastIndexOf('/') + 1);
    readFiles(path, { rootDirectory, hierarchy, chain });
  },
  ImportDeclaration: (node, state) => {
    if (node.specifiers.every(specifier => specifier.local.name !== state)) return;
    const file = node.source.value;
    if (!relativePath(file)) return;
    const path = rootDirectory + file.substring(2);
    rootDirectory = path.substring(0, path.lastIndexOf('/') + 1);
    readFiles(path, { rootDirectory, hierarchy, chain });
  }
})

// visitors for walk.ancestor call
const jsxElementVisitors = (ast) => ({
  JSXElement: (node, { rootDirectory, hierarchy, chain }, ancestors) => {
    const componentChain = ancestors
      .filter(ancestor => ancestor.type === 'JSXElement')
      .map(jsx => jsx.openingElement)
      .filter(jsx => jsx.name.name.charAt(0) === jsx.name.name.charAt(0).toUpperCase())
      // if it's a react-router component, maps the name of the component attribute
      .map(jsx => {
        if (!['Router', 'Route', 'IndexRoute'].includes(jsx.name.name)) return jsx.name.name;
        const component = jsx.attributes.find(attr => attr.name.name === 'component');
        return component ? component.value.expression.name : null;
      })
      // returns an empty array if last item in the array is falsey
      .reduce((components, item, index, array) => (index === array.length - 1 && !item) ? [] : array, [])
      .filter(name => !!name)
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
  const ast = acorn.parse(data, { sourceType: 'module', plugins: { jsx: true } });
  walk.ancestor(ast, jsxElementVisitors(ast), base, state);
}

// writes content to a file with the specified name
const writeFile = (fileName, content) => {
  fs.writeFile(fileName, content, (err) => {
    if (err) throw err;
    console.log('Done! ' + fileName + ' created.');
    opn(fileName, { wait: false });
  })
}

// create html file with tree rendering using data from src files
const templateHTML = (hierarchy) => {
  const template = fs.readFileSync(__dirname + '/src/template.mustache', 'utf-8');
  const view = {
    css: fs.readFileSync(__dirname + '/src/default.css', 'utf-8'),
    javascript: fs.readFileSync(__dirname + '/src/main.js', 'utf-8'),
    hierarchy: JSON.stringify(hierarchy)
  }
  return Mustache.render(template, view);
}

// make sure hierarchy has a single root
const processHierarchy = (hierarchy) => {
  const roots = hierarchy.filter(item => item.indexOf('.') === -1);
  const error = roots.length > 1 ? 'Path has multiple roots. Try a different path file?' : null;
  return { error, roots, hierarchy }
}

// compute hierarchial tree data starting from rootFile and create files to render the tree display.
const parse = (rootFile) => {
  console.log('Envisioning...');
  const hierarchy = [];
  const rootDirectory = rootFile.substring(0, rootFile.lastIndexOf('/') + 1);
  readFiles(rootFile, { rootDirectory, hierarchy, chain: '' });
  const result = processHierarchy(hierarchy);
  if (result.error) throw new Error(result.error);
  writeFile(OUTPUT_FILE_NAME, templateHTML(result.hierarchy));
}

module.exports = {
  match,
  requireCall,
  relativePath,
  templateHTML,
  processHierarchy,
  parse
};
