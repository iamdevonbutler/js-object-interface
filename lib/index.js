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

  /**
   * Add a property to the src Object.
   * @param  {String} args one or more Object keys. Use multiple keys to create nested properties.
   * @return {this}
   */
  obj.create = (...args) => {
    var value, newKey;
    value = args.pop();
    newKey = args.pop();
    var obj1 = args.reduce((p, key) => {
      return p[key];
    }, obj.src) || {}; // @todo || {} might be unnecessary.
    obj1[newKey] = value;
    return obj;
  };

  /**
   * Read the entire src Object (by passing in no args) or a Object property (w/ args).
   * Pass in multiple keys to read nested properties.
   * @param  {String} [args] zero more more Object keys. e.g. obj.read() | obj.read('a') | obj.read('a', 'b')
   * @return {Mixed} Object property value.
   */
  obj.read = (...args) => {
    if (!args.length) return obj.src;
    var obj1 = args.reduce((p, key) => {
      return p[key];
    }, obj.src);
    return obj1;
  };

  /**
   * Update the src Object. First param [or params] (multiple keys update nested values)
   * are the Object keys and the last param is always the new value.
   * Given a src Object of {a: {b: 1}} - to update key 'a' you run, obj.update('a', {b: 2}),
   * and to update the nested value of 'a.b' you run obj.update('a', 'b', 2).
   * To update the entire object, just pass in a new value w/o keys.
   * @param  {String} args one or more Object keys. e.g. obj.upate('a', 'b', value)
   * @return {this}
   */
  obj.update = (...args) => {
    var value = args.pop();
    var len = args.length;
    if (args.length === 1) obj.src = args[0];
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

  /**
   * Delete an object property. As w/ `.update()`, enter multiple params (keys) to
   * select and delete nested values.
   * @param  {String} args one or more Object keys. e.g. obj.delete('a', 'b')
   * @return {this}
   */
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
   * $value wrapps values of type Object in an interface itself -  to, for instance,
   * execute a nested forEach or map or whatever. If the value is not an object,
   * $value is undefined.
   * @param  {Function} cb params - key, value, $value
   * @param {Boolean} [async=false]
   * @return {this|Promise} returns Promise if async == true
   */
  obj.forEach = (cb, async = false) => {
    var keys;
    keys = Object.keys(obj.src);
    if (async) {
      return new Promise(async (resolve, reject) => {
        var promises = keys.map(async key => await cb(
          key,
          obj.src[key],
          isType(obj.src[key], 'object') ? applyInterface(obj.src[key], clone) : undefined,
        ));
        Promise.all(promises).then(() => resolve()).catch(reject);
      });
    }
    else {
      keys.forEach(key => cb(
        key,
        obj.src[key],
        isType(obj.src[key], 'object') ? applyInterface(obj.src[key], clone) : undefined,
      ));
      return obj;
    }
  };

  /**
   * Itterate over each object property and set it's value equal to the
   * callback return value.
   * $value wrapps values of type Object in an interface itself -  to, for instance,
   * execute a nested forEach or map or whatever. If the value is not an object,
   * $value is undefined.
   * @param  {Function} cb params: key, value, $value
   * @return {this}
   */
  obj.map = (cb, async = false) => {
    var keys, values;
    keys = Object.keys(obj.src);
    if (async) {
      return new Promise(async (resolve, reject) => {
        var promises = keys.map(async key => await cb(
          key,
          obj.src[key],
          isType(obj.src[key], 'object') ? applyInterface(obj.src[key], clone) : undefined,
        ));
        Promise.all(promises)
          .then(values => {
            keys.forEach((key, i) => obj.src[key] = values[i]);
            resolve(obj);
          }).catch(reject);
      });
    }
    else {
      values = keys.map(key => cb(
        key,
        obj.src[key],
        isType(obj.src[key], 'object') ? applyInterface(obj.src[key], clone) : undefined,
      ));
      keys.forEach((key, i) => obj.src[key] = values[i]);
      return obj;
    }
  };

  /**
   * Itterate over each object property and if every callback returns `true`,
   * `true` is returned, if not, `false` is returned.
   * @param  {Function} cb params: key, value
   * @return {Boolean}
   */
  obj.every = (cb) => {
    var keys, result;
    keys = Object.keys(obj.src);
    result = keys.every(key => cb(key, obj.src[key]));
    return result;
  };

  /**
   * Itterate over each object property and if at least one callback returns `true`,
   * `true` is returned, if not, `false` is returned.
   * @param  {Function} cb params: key, value
   * @return {Boolean}
   */
  obj.some = (cb) => {
    var keys, result;
    keys = Object.keys(obj.src);
    result = keys.some(key => cb(key, obj.src[key]));
    return result;
  };

  /**
   * Itterate over each object property and return the first property for which the callback
   * returns a truthy value. We return the key and value encapsulated
   * in an object, and if no matches are found, we return `undefined`
   * @param  {Function} cb params: key, value
   * @return {Object}
   */
  obj.find = (cb) => {
    var keys, result;
    keys = Object.keys(obj.src);
    result = keys.find(key => cb(key, obj.src[key]));
    return result ? {key: result, value: obj.src[result]} : undefined;
  };

  /**
   * Modifies the src Object. 
   * @param  {Function} cb params: key, value, $value
   * @return {Object}
   */
  obj.filter = (cb) => {
    var keys, obj1 = {};
    keys = Object.keys(obj.src);
    keys
      .filter(key => cb(
        key,
        obj.src[key],
        isType(obj.src[key], 'object') ? applyInterface(obj.src[key], clone) : undefined,
      ))
      .forEach(key => obj1[key] = obj.src[key]);
    obj.update(obj1);
    return obj;
  };

  /**
   * Create a copy (deep) of an object. Breaks existing references.
   * @param  {Object} obj
   * @return {Object}
   */
  obj.clone = (obj) => {
    return objectAssign(obj.src);
  };

  /**
   * Create a new object inheriting properties from the original and deeply assign new properties.
   * This does not modify the src Object's data - it returns a new Object.
   * To update the src Object - obj.update(obj.assign(newObj))
   * @param  {Object} obj
   * @return {Object}
   */
  obj.assign = (...args) => {
    return objectAssign(obj.src, ...args);
  };

  return obj;
};

module.exports = applyInterface;
