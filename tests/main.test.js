const applyInterface = require('../lib');

const should = require('chai').should();
const expect = require('chai').expect;
const assert = require('chai').assert;

var obj = {
  a: 1,
  b: 2,
  // c: {
  //   d: 44,
  // },
  // e: {
  //   f: 33,
  // }
}

describe('info functionality', () => {
  it('.info', () => {

  });
});

describe('.forEach()', () => {

  it('', () => {
    var obj1 = applyInterface(obj);
    var x = obj1.find((key, value) => {
      return value > 1;
    })
  });

});


describe('.map()', () => {

  it('', () => {

  });

});
