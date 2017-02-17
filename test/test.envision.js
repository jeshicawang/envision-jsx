const { expect } = require('chai');
const acorn = require('acorn-jsx');
const Envision = require('../envision.js');

describe('Envision', () => {

  describe('match', () => {

    it('should return true if a node\'s identifier\'s name matches name', () => {
      const node = acorn.parse('const test = require(\'./file-name\')').body[0].declarations[0];
      const trueResult = Envision.match(node, 'test');
      const falseResult = Envision.match(node, 'wrong');
      expect(trueResult).to.be.a('boolean');
      expect(trueResult).to.be.true;
      expect(falseResult).to.be.a('boolean');
      expect(falseResult).to.be.false;
    })

    it('should return true if one of a node\'s object pattern\'s names matches name', () => {
      const node = acorn.parse('const { one, two, three } = require(\'./file-name\')').body[0].declarations[0];
      const trueResult = Envision.match(node, 'two');
      const falseResult = Envision.match(node, 'four');
      expect(trueResult).to.be.a('boolean');
      expect(trueResult).to.be.true;
      expect(falseResult).to.be.a('boolean');
      expect(falseResult).to.be.false;
    })

  })

  describe('requireCall', () => {

    it('should return whether the node is a require call or not', () => {
      let node = acorn.parse('const test = require(\'./file-name\')').body[0].declarations[0];
      let result = Envision.requireCall(node);
      expect(result).to.be.a('boolean');
      expect(result).to.be.true;
      node = acorn.parse('const test = 1').body[0].declarations[0];
      result = Envision.requireCall(node);
      expect(result).to.not.be.ok;
      node = acorn.parse('const test = func()').body[0].declarations[0];
      result = Envision.requireCall(node);
      expect(result).to.be.false;
    })

  })

  describe('relativePath', () => {

    it('should return true if it\'s a relative path', () => {
      expect(Envision.relativePath('./relative')).to.be.true;
      expect(Envision.relativePath('module')).to.be.false;
    })

  })

  describe('templateHTML', () => {

    it('should return the generated HTML file with the tree rendering', () => {
      expect(Envision.templateHTML('[\'root\']')).to.be.a('string');
    })

  })

  describe('processHierarchy', () => {

    it('should make sure the hierarchy has a single root', () => {
      let hierarchy = ['root'];
      let result = Envision.processHierarchy(hierarchy);
      expect(result).to.be.an('object');
      expect(result.error).to.be.null;
      expect(result.roots.length).to.equal(1);
      expect(result.hierarchy).to.equal(hierarchy);
      hierarchy = ['root1', 'root1.child1', 'root1.child2', 'root2'];
      result = Envision.processHierarchy(hierarchy);
      expect(result).to.be.an('object');
      expect(result.error).to.be.ok;
      expect(result.roots.length).to.equal(2);
      expect(result.hierarchy).to.equal(hierarchy);
    })

  })

})
