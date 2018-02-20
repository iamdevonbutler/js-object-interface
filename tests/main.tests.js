const applyInterface = require('../lib');

const should = require('chai').should();
const expect = require('chai').expect;
const assert = require('chai').assert;

var obj = {
  // a: 1,
  // b: 2,
  c: {
    d: 44,
  },
  e: {
    f: 33,
  }
}

describe('info functionality', () => {
  it('.info', () => {

  });
});

describe('.forEach()', () => {

  it('', () => {
    var obj1 = applyInterface(obj);
    // var x = obj1.create('c', 3);
    // var x = obj1.update('c', 4);
    // var x = obj1.read('c');
    // var x = obj1.delete('c');
    // var x = obj1.read();
    obj1.forEach(({key, value, obj}) => {
      obj.forEach(({key}) => {
        console.log(key);
      })
    });
  });

});


describe('.map()', () => {

  it('', () => {

  });

});
