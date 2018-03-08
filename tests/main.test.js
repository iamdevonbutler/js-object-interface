const applyInterface = require('../lib');
const isEqual = require('js-isequal');

const should = require('chai').should();
const expect = require('chai').expect;
const assert = require('chai').assert;

var $obj, obj;

describe('js-object-interface tests', () => {
  beforeEach(() => {
    obj = {
      a: 1,
      b: {
        c: 2,
        d: 3,
      },
      e: [4, 5],
    };
    $obj = applyInterface(obj);
  });

  describe('cloning .src', () => {
    it('should clone the src obj by default', () => {
      var obj1 = {a: 1};
      var $obj = applyInterface(obj1);
      $obj.set('b', 2);
      expect(isEqual(obj1, {a: 1})).to.be.true;
    });
    it ('should NOT clone the src obj when passing param2 as false', () => {
      var obj1 = {a: 1};
      var $obj1 = applyInterface(obj1, false);
      $obj1.set('b', 2);
      expect(isEqual(obj1, {a: 1})).to.be.false;
      expect(isEqual(obj1, {a: 1, b: 2})).to.be.true;
    });
  });

  describe('.src', () => {
    it('should return the original object', () => {
      expect(isEqual($obj.src, obj)).to.be.true;
    });
  });

  describe('.get()', () => {
    it ('should return the .src Obj given no params', () => {
      expect(isEqual($obj.get(), obj)).to.be.true;
    });
    it ('should return "undefined" given invalid keys', () => {
      expect($obj.get('z') === undefined).to.be.true;
      expect($obj.get('a', 'z') === undefined).to.be.true;
      expect($obj.get('b', 'z') === undefined).to.be.true;
    });
    it ('should get a property', () => {
      expect($obj.get('a') === 1).to.be.true;
    });
    it ('should get a nested property', () => {
      expect($obj.get('b', 'c') === 2).to.be.true;
    });
  });

  describe('.set()', () => {
    it ('should update .src given a single param', () => {
      $obj.set({a: 1});
      expect(isEqual($obj.get(), {a: 1})).to.be.true;
    });
    it ('should set a new property', () => {
      $obj.set('f', 1);
      expect($obj.src.f === 1).to.be.true;
    });
    it ('should updated a top-level property', () => {
      $obj.set('a', 2);
      expect($obj.src.a === 2).to.be.true;
    });
    it ('should set a new nested property and create bridge properties', () => {
      $obj.set('f', 'g', 1);
      expect($obj.src.f.g === 1).to.be.true;
    });
    it ('should update an existing nested property', () => {
      $obj.set('b', 'c', 3);
      expect($obj.src.b.c === 3).to.be.true;
    });
  });

  describe('.remove()', () => {
    it ('should do nothing given no params', () => {
      $obj.remove();
      expect(isEqual($obj.src, obj)).to.be.true;
    });
    it ('should remove a property', () => {
      $obj.remove('f');
      expect($obj.src.f === undefined).to.be.true;
    });
    it ('should remove a nested property', () => {
      $obj.remove('b', 'c');
      expect($obj.src.b).to.be.ok;
      expect($obj.src.b.c === undefined).to.be.true;
    });
    it ('should not Error when removing a key that DNE', () => {
      $obj.remove('k');
    });
  });

  describe('.forEach()', () => {
    it ('should iterate over each value', () => {
      $obj.forEach((value, key, $value) => {
        switch (key) {
          case 'a':
            expect(value === 1).to.be.true;
            break;
          case 'b':
            expect(isEqual(value, {c: 2, d: 3})).to.be.true;
            break;
          case 'e':
            expect(isEqual(value, [4,5])).to.be.true;
            break;
          default:
            throw 'unknown key';
        }
      });
    });
    it ('should wrap child objects w/ the interface', () => {
      $obj.forEach((value, key, $value) => {
        if (key === 'b') {
          $value.forEach((value1, key1) => {
            switch (key1) {
              case 'c':
                expect(value1 === 2).to.be.true;
                break;
              case 'd':
                expect(value1 === 3).to.be.true;
                break;
              default:
                throw 'wrong key';
            }
          });
        }
      });
    });
    it ('should handle async', async () => {
      var dummy = 0, asyncFunc = new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      await $obj.forEach(async (value, key, $value) => {
        await asyncFunc;
        dummy++;
      });
      expect(dummy === 3).to.be.true;
    });
  });

  describe('.map()', () => {
    it ('should iterate over each value w/o modifying src and return a "unwrapped" obj', () => {
      var result = $obj.map((value, key, $value) => {
        return 9;
      });
      expect(isEqual(result, {a: 9, b: 9, e: 9})).to.be.true;
      expect(isEqual($obj.src, obj)).to.be.true;
    });
    it ('should iterate over each value and return an "wrapped" obj when param2 === "true"', () => {
      var result = $obj.map((value, key, $value) => {
        return 9;
      }, true);
      expect(isEqual(result.get(), {a: 9, b: 9, e: 9})).to.be.true;
    });
    it ('should wrap child objects w/ the interface using "$value"', () => {
      var result = $obj.map((value, key, $value) => {
        if (key === 'b') {
          return $value.map((value1, key1) => {
            switch (key1) {
              case 'c':
                return 9;
              case 'd':
                return 9;
              default:
                throw 'wrong key';
            }
          });
        }
        else {
          return value;
        }
      });
      expect(isEqual(result, {a: 1, b: {c: 9, d: 9}, e: [4, 5]})).to.be.true;
    });
    it ('should return "null" when mapping over an empty object', () => {
      var result = applyInterface({}).map((value, key, $value) => {
        return false;
      });
      expect(isEqual(result, null)).to.be.true;
    });
    it ('should handle async', async () => {
      var dummy = 0, asyncFunc = new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      var result = await $obj.map(async (value, key, $value) => {
        await asyncFunc;
        return 9;
      });
      expect(isEqual(result, {a: 9, b: 9, e: 9})).to.be.true;
    });
  });

  describe('.filter()', () => {
    it ('should iterate over each value and filter w/o modifying src and return a "unwrapped" Object', () => {
      var result = $obj.filter((value, key, $value) => {
        if (key === 'a') return true;
      });
      expect(isEqual(result, {a: 1})).to.be.true;
      expect(isEqual($obj.src, obj)).to.be.true;
    });
    it ('should iterate over each value and return an "wrapped" obj when param2 === "true"', () => {
      var result = $obj.filter((value, key, $value) => {
        if (key === 'a') return true;
      }, true);
      expect(isEqual(result.get(), {a: 1})).to.be.true;
    });
    it ('should return "null" when all callbacks return "false"', () => {
      var result = $obj.filter((value, key, $value) => {
        return false;
      });
      expect(isEqual(result, null)).to.be.true;
    });
    it ('should handle async', async () => {
      var dummy = 0, asyncFunc = new Promise((resolve) => {
        setTimeout(resolve, 50);
      });
      var result = await $obj.filter(async (value, key, $value) => {
        await asyncFunc;
        return key === 'a' ? true : false;
      });
      expect(isEqual(result, {a: 1})).to.be.true;
    });
    it ('should pass in a wrapped value ($value)', () => {
      var count = 0;
      $obj.filter((value, key, $value) => {
        if ($value !== undefined) {
          $value.forEach(value => {
            count++;
          });
        }
      });
      expect(count === 2).to.be.true;
    });
  });

  describe('.every()', () => {
    it ('should return "true" if all callbacks return "true"', () => {
      var result = $obj.every((value, key, $value) => {
        return true;
      });
      expect(result === true).to.be.true;
    });
    it ('should return "false" if a callback returns "false"', () => {
      var result = $obj.every((value, key, $value) => {
        if (key === 'a') return false;
        return true;
      });
      expect(result === false).to.be.true;
    });
    it ('should pass in a wrapped value ($value)', () => {
      var count = 0;
      $obj.every((value, key, $value) => {
        if ($value !== undefined) {
          $value.forEach(value => {
            count++;
          });
        }
        return true;
      });
      expect(count === 2).to.be.true;
    });
  });

  describe('.some()', () => {
    it ('should return "true" if one callback returns "true"', () => {
      var result = $obj.some((value, key, $value) => {
        if (key === 'a') return true;
        return false;
      });
      expect(result === true).to.be.true;
    });
    it ('should return "false" if no callbacks returns "true"', () => {
      var result = $obj.some((value, key, $value) => {
        return false;
      });
      expect(result === false).to.be.true;
    });
    it ('should pass in a wrapped value ($value)', () => {
      var count = 0;
      $obj.some((value, key, $value) => {
        if ($value !== undefined) {
          $value.forEach(value => {
            count++;
          });
        }
        return false;
      });
      expect(count === 2).to.be.true;
    });
  });

  describe('.find()', () => {
    it ('should return an Object key when first callback to return "true"', () => {
      var key = $obj.find((value, key, $value) => {
        return true;
      });
      expect(key === 'a').to.be.true;
    });
    it ('should return "undefined" if all callback returns "false"', () => {
      var result = $obj.find((value, key, $value) => {
        return false;
      });
      expect(result === undefined).to.be.true;
    });
    it ('should pass in a wrapped value ($value)', () => {
      var count = 0;
      $obj.find((value, key, $value) => {
        if ($value !== undefined) {
          $value.forEach(value => {
            count++;
          });
          return true;
        }
        return false;
      });
      expect(count === 2).to.be.true;
    });
  });

  describe('.clone()', () => {
    it ('should clone .src', () => {
      var obj1 = $obj.clone();
      obj1.a = 9;
      expect(isEqual($obj.src, obj)).to.be.true;
    });
    it ('should clone .src and wrap if param1 is "true"', () => {
      var $obj1 = $obj.clone(true);
      $obj1.set('a', 9);
      expect($obj1.get('a') === 9).to.be.true;
      expect(isEqual($obj.src, obj)).to.be.true;
    });
  });

  describe('.assign()', () => {
    it ('should return the src obj given no params', () => {
      var obj1 = $obj.assign();
      expect(isEqual(obj1, $obj.src)).to.be.true;
    });
    it ('should assign new values', () => {
      var obj1 = $obj.assign({b: {c: 9}}, {b: {d: 9}});
      expect(isEqual(obj1, {
        a: 1,
        b: {
          c: 9,
          d: 9,
        },
        e: [4, 5],
      })).to.be.true;
    });
  });

});
