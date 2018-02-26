const applyInterface = require('../lib');
const isEqual = require('js-isequal');

const should = require('chai').should();
const expect = require('chai').expect;
const assert = require('chai').assert;

// @todos
// nested filter, does it work right. nested map and forEach too.

var obj = {
  a: 1,
  b: {
    c: 2,
    d: 3,
  },
  e: [4, 5],
};

var $obj = applyInterface(obj);

describe('js-object-interface tests', () => {
  describe('.src', () => {
    it('should return the original object', () => {
      expect(isEqual($obj.src, obj)).to.be.true;
    });
  });
  describe('.add()', () => {

  });
  describe('.remove()', () => {

  });
  describe('.get()', () => {

  });
  describe('.set()', () => {

  });
  describe('.forEach()', () => {

  });
  describe('.map()', () => {

  });
  describe('.filter()', () => {

  });
  describe('.every()', () => {

  });
  describe('.find()', () => {

  });
  describe('.some()', () => {

  });
  describe('.clone()', () => {

  });
  describe('.assign()', () => {

  });
  describe('misc tests', () => {
    it('should clone the src obj by default', () => {
      let obj1 = {a: 1};
      var $obj = applyInterface(obj1);
      $obj.add('b', 2);
      expect(isEqual(obj1, {a: 1})).to.be.true;
    });
    it ('should NOT clone the src obj when passing param2 as false', () => {
      let obj1 = {a: 1};
      var $obj = applyInterface(obj1, false);
      $obj.add('b', 2);
      expect(isEqual(obj1, {a: 1})).to.be.false;
      expect(isEqual(obj1, {a: 1, b: 2})).to.be.true;
    });
  });
});
