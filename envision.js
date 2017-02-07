const fs = require('fs');
const acorn = require('acorn-jsx');

const isRequiredFromSameDirectory = (node) => {
  return ((node.type === 'VariableDeclaration')
  && node.declarations
  && node.declarations[0].init
  && (node.declarations[0].init.type === 'CallExpression')
  && (node.declarations[0].init.callee.name === 'require'))
  && (node.declarations[0].init.arguments[0].value.substring(0,2) === './')
}

const transform = (node) => ({
  name: node.declarations[0].id.name,
  file: node.declarations[0].init.arguments[0].value.substring(2)
})

const parse = (data) => {
  const ast = acorn.parse(data, {
    plugins: { jsx: true }
  });
  const nodes = ast.body;
  return nodes
    .filter(node => isRequiredFromSameDirectory(node))
    .map(node => transform(node))
}

const readFilesIntoTreeRecursive = (directory, root, tree) => {
  return new Promise((resolve, reject) => fs.readFile(directory + root, 'utf8', (err, data) => {
    if (err) return console.log(err);
    const children = parse(data);
    if (!children.length) {
      resolve(tree);
      return;
    }
    const promises = children.map(({ name, file }, index) => readFilesIntoTreeRecursive(directory, file, { name }));
    Promise.all(promises)
      .then(result => tree.children = result)
      .then(() => resolve(tree))

  }))
}

const getTree = (rootFile, callback) => {
  const index = rootFile.lastIndexOf('/');
  const directory = rootFile.substring(0, index+1);
  const root = rootFile.substring(index+1);
  readFilesIntoTreeRecursive(directory, root, { name: 'App' })
  .then(callback);
}

module.exports = { getTree };
