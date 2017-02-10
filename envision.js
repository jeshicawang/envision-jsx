const fs = require('fs');
const acorn = require('acorn-jsx');
const walk = require('acorn/dist/walk');
const Mustache = require('mustache');

const outputDirectory = 'jsx-hierarchy';
let rootFile;

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

// parsing the data from rootFile and calling a walker function to traverse the resulting AST
const readFiles = (rootFile, state) => {
  const data = fs.readFileSync(rootFile, 'utf-8');
  const ast = acorn.parse(data, { plugins: { jsx: true } });
  walk.ancestor(ast, jsxElementVisitors(ast), base, state);
}

const copyFilesFromSrc = (...files) => files
//  .filter(file => !fs.existsSync(outputDirectory + '/' + file))
  .forEach(file => fs.createReadStream(__dirname + '/src/' + file).pipe(fs.createWriteStream(outputDirectory + '/' + file)))

// copy files from src folder to jsx-hierarchy folder on the client side
const createJSXHierarchyFiles = (hierarchy) => {
  if (!fs.existsSync(outputDirectory))
    fs.mkdirSync(outputDirectory);
  const template = fs.readFileSync(__dirname + '/src/template.mustache', 'utf-8');
  const output = Mustache.render(template, { hierarchy: JSON.stringify(hierarchy) })
  fs.writeFile(outputDirectory + '/main.js', output, (err) => {
    if (err) throw err;
    console.log('main.js written');
  })
  copyFilesFromSrc('index.html', 'default.css');
}

// compute hierarchial tree data starting from rootFile and create files to render the tree display.
const writeTreeData = () => {
  const hierarchy = [];
  const rootDirectory = rootFile.substring(0, rootFile.lastIndexOf('/') + 1);
  readFiles(rootFile, { rootDirectory, hierarchy, chain: '' });
  createJSXHierarchyFiles(hierarchy);
}

// sets the rootFile, should be the file where ReactDOM.render is called.
const setRootFile = (file) => rootFile = file;

module.exports = { setRootFile, writeTreeData };
