const {objectAssign, isType} = require('./utils');

// function functionProperties(func, obj) {
//   return new Proxy(() => {}, {
//     get(target, property) {
//       if (obj[property] !== undefined) {
//         return obj[property];
//       }
//       else {
//         let available = Object.keys(obj).map(prop => `"${prop}"`).join(', ');
//         throw new Error(`Developer error. Property "${property}" is undefined. Available properties include: ${available}.`);
//       }
//     },
//     apply(target, thisArg, argumentsList) {
//       return func.apply(null, argumentsList);
//     }
//   });
// }

// @todo prettify console log of info.
// module.exports = applyFunctionProperties(applyInterface, {
//   api: {
//     param1: {
//       type: 'Object',
//       description: 'src Object to wrap w/ interface.',
//     },
//     param2: {
//       type: 'Boolean',
//       name: 'clone',
//       default: true,
//       description: 'By default returns a new Object and does not modify the original.',
//     },
//     returns: {
//       type: 'Object',
//       description: 'Returned Object is wrapped w/ the following properties and methods.',
//       properties: {
//         src: {
//           type: 'Object',
//           desciption: 'The orginal unwrapped Object.'
//         },
//       },
//       methods: {
//         forEach: {
//           desciption: '',
//         },
//         map: {
//           desciption: '',
//         }
//       }
//     },
//   }
// });

/**
 * Wrap JS objects to create a functional Array-like interface.
 * @param  {Object} data
 * @param  {Boolean} [clone=true]
 * @return {Object} Wrapped object
 */
function applyInterface(src, clone = true) {
  var obj;

  if (!isType(src, 'object')) throw new Error(`Param 1 must be an "Object".`);

  obj = {
    src: clone ? objectAssign(src) : src,
  };

  obj.create = (...args) => {
    var value, newKey;
    value = args.pop();
    newKey = args.pop();
    var obj1 = args.reduce((p, key) => {
      return p[key];
    }, obj.src);
    obj1[newKey] = value;
    return obj;
  };

  obj.read = (...args) => {
    if (!args.length) return obj.src;
    var obj1 = args.reduce((p, key) => {
      return p[key];
    }, obj.src);
    return obj1;
  };

  obj.update = (...args) => {
    var value = args.pop();
    var len = args.length;
    args.reduce((p, key, i) => {
      if (len === i + 1) {
        p[key] = value;
      }
      else {
        return p[key];
      }
    }, obj.src);
    return obj;
  };

  obj.delete = (...args) => {
    var len = args.length;
    args.reduce((p, key, i) => {
      if (len === i + 1) {
        delete p[key];
      }
      else {
        return p[key];
      }
    }, obj.src);
    return obj;
  };

  /**
   * Itterate over each object property.
   * @param  {Function} cb params: value, key
   * @param {Boolean} [async=false]
   * @return {this|Promise} returns Promise if async == true
   */
  obj.forEach = (cb, async = false) => {
    var keys;
    keys = Object.keys(obj.src);
    if (async) {
      return new Promise(async (resolve, reject) => {
        var promises = keys.map(async key => await cb(obj.src[key], key));
        Promise.all(promises).then(() => resolve()).catch(reject);
      });
    }
    else {
      keys.forEach(key => cb({
        key,
        value: obj.src[key],
        obj: isType(obj.src[key], 'object') ? applyInterface(obj.src[key], clone) : undefined,
      }));
      return obj;
    }
  };

  /**
   * Itterate over each object property and set it's value equal to the
   * callback return value.
   * @param  {Function} cb params: value, key
   * @return {this}
   */
  // obj.map = (cb, async = false) => {
  //   var keys, values;
  //   keys = Object.keys(obj.raw);
  //   if (async) {
  //     return new Promise(async (resolve, reject) => {
  //       var promises = keys.map(async key => await cb(obj.raw[key], key));
  //       Promise.all(promises)
  //         .then(values => {
  //           keys.forEach((key, i) => obj.raw[key] = values[i]);
  //           resolve(obj);
  //         }).catch(reject);
  //     });
  //   }
  //   else {
  //     values = keys.map(key => cb(obj.raw[key], key));
  //     keys.forEach((key, i) => obj.raw[key] = values[i]);
  //     return obj;
  //   }
  // };

  /**
   * Itterate over each object property and if every callback returns `true`, return `true`,
   * if not, return `false`.
   * @param  {Function} cb params: value, key
   * @return {Boolean}
   */
  // obj.every = (cb) => {
  //   var keys, result;
  //   keys = Object.keys(obj.raw);
  //   result = keys.every(key => cb(obj.raw[key], key));
  //   return result;
  // };

  /**
   * Itterate over each object property and if at least one callback returns `true`, return `true`,
   * if not, return `false`.
   * @param  {Function} cb params: value, key
   * @return {Boolean}
   */
  // obj.some = (cb) => {
  //   var keys, result;
  //   keys = Object.keys(obj.raw);
  //   result = keys.some(key => cb(obj.raw[key], key));
  //   return result;
  // };

  /**
   * Itterate over each object property return the first property for which the callback
   * returns a truthy value. If `returnObj` == true, we return the key and value encapsulated
   * in an object, otherwise we return just the value.
   * @param  {Function} cb params: value, key
   * @param  {Boolean} [returnObj=false]
   * @return {Object}
   */
  // obj.find = (cb, returnObj = false) => {
  //   var keys, result;
  //   keys = Object.keys(obj.raw);
  //   result = keys.find(key => cb(obj.raw[key], key));
  //   return returnObj ? {key: result, value: obj.raw[result]} : obj.raw[result];
  // };

  /**
   * Removes properties from obj where `cb` returned falsy.
   * Returns a new Object that references the original.
   * @param  {Function} cb params: value, key
   * @param  {Boolean} [map=false]
   * @return {Object}
   *
   *
   *kinda fucked.
   *
   */
  // obj.filter = (cb, map = false) => {
  //   var keys, obj1 = {};
  //   keys = Object.keys(obj.raw);
  //   keys
  //     .filter(key => cb(obj.raw[key], key))
  //     .forEach(key => {
  //       obj1[key] = new Proxy(obj.raw[key], {
  //         get(target, property) {
  //           return obj.raw[property];
  //         },
  //         set(target, property, value) {
  //           obj.raw[property] = value;
  //         }
  //       });
  //     });
  //   return self.applyObjectInterface(obj1);
  // };

  /**
   * Create a copy (deep) of an object. Creates a new reference.
   * @param  {Object} obj
   * @return {Object}
   */
  // obj.clone = (obj) => {
  //   return objectAssign({}, obj);
  // };

  /**
   * Create a new object inheriting properties from the original and deeply assign new properties.
   * This does not modify the wrapped Object's data and returns a new Object.
   * To update your object: obj.update(obj.assign(newObject));
   * @param  {Object} obj
   * @return {Object}
   */
  // obj.assign = (...args) => {
  //   return self.objectAssign(obj.raw, ...args);
  // };

  return obj;
};

module.exports = applyInterface;
