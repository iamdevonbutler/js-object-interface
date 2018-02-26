const objectAssign = require('js-object-assign');

module.exports = applyInterface;

/**
 * Wrap JS objects to create a functional Array-like interface.
 * @param  {Object} data
 * @param  {Boolean} [clone=true]
 * @return {Object} Wrapped object
 */
function applyInterface(src, clone = true) {
  var obj;

  if (!isObject(src)) throw new Error(`Param 1 must be an "Object".`);

  obj = {
    src: clone ? objectAssign(src) : src,
  };

  /**
   * Read the entire src Object (by passing in no args) or a Object property (w/ args).
   * Pass in multiple keys to read nested properties.
   * @param  {String} [args] zero more more Object keys. e.g. obj.read() | obj.read('a') | obj.read('a', 'b')
   * @return {Mixed} Object property value.
   */
  obj.get = (...args) => {
    if (!args.length) return undefined;
    var obj1 = args.reduce((p, key) => {
      if (p[key] !== undefined) {
        return p[key];
      }
      else {
        return undefined;
      }
    }, obj.src);
    return obj1;
  };

  /**
   * Add a property to the src Object.
   * @param  {String} args one or more Object keys. Use multiple keys to create nested properties.
   * @return {this}
   */
  obj.set = (...args) => {
    var value, newKey;
    value = args.pop();
    newKey = args.pop();
    if (!newKey) {
      obj.src = value;
      return obj;
    }
    var obj1 = args.reduce((p, key) => {
      if (p[key] !== undefined) {
        return p[key];
      }
      else {
        p[key] = {};
        return p[key];
      }
    }, obj.src);
    obj1[newKey] = value;
    return obj;
  };

  /**
   * Delete an object property. As w/ `.update()`, enter multiple params (keys) to
   * select and delete nested values.
   * @param  {String} args one or more Object keys. e.g. obj.delete('a', 'b')
   * @return {this}
   */
  obj.remove = (...args) => {
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
      return new Promise((resolve, reject) => {
        var promises = keys.map(key => cb(
          key,
          obj.src[key],
          _wrap(obj.src[key])
        ));
        Promise.all(promises).then(() => resolve()).catch(reject);
      });
    }
    else {
      keys.forEach(key => cb(
        key,
        obj.src[key],
        _wrap(obj.src[key])
      ));
      return obj;
    }
  };

  /**
   * Itterate over each object property and set it's value equal to the
   * callback return value.
   * $value wrapps values of type Object in an interface itself - to, for instance,
   * execute a nested forEach or map or whatever. If the value is not an object,
   * $value is undefined.
   * @param  {Function} cb params: key, value, $value
   * @return {this}
   */
  obj.map = (cb, async = false) => {
    var keys, values;
    keys = Object.keys(obj.src);
    if (async) {
      return new Promise((resolve, reject) => {
        var promises = keys.map(key => cb(
          key,
          obj.src[key],
          _wrap(obj.src[key])
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
        _wrap(obj.src[key])
      ));
      // @todo if undefined, don't modify value.
      keys.forEach((key, i) => obj.src[key] = values[i]);
      return obj;
    }
  };

  /**
   * Modifies the src Object. Keeps values when cb returns truthy,
   * removes values when cb returns falsy.
   * @param  {Function} cb params: key, value, $value
   * @return {Object}
   */
  obj.filter = (cb, async = false) => {
    var keys, obj1 = {};
    keys = Object.keys(obj.src);
    if (async) {
      return new Promise((resolve, reject) => {
        var promises = keys.map(key => cb(
          key,
          obj.src[key],
          _wrap(obj.src[key])
        ));
        Promise.all(promises)
          .then(values => {
            keys
              .filter((key, i) => values[i])
              .forEach(key => obj1[key] = obj.src[key]);
            resolve(obj);
          }).catch(reject);
      });
    }
    else {
      obj1 = keys
        .filter(key => cb(
          key,
          obj.src[key],
          _wrap(obj.src[key])
        ))
        .forEach(key => obj1[key] = obj.src[key]);
    }
    return obj1;
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
   * Create a copy (deep) of an object. Breaks existing references.
   * @param  {Object} obj
   * @return {Object}
   */
  obj.clone = () => {
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

  obj._wrap = (obj1) => {
    return isObject(obj1) ? applyInterface(obj1, clone) : undefined;
  };

  return obj;
};

function isObject(obj) {
  var tag = Object.prototype.toString.call(obj);
  return typeof obj === 'object' && obj !== null && Array.isArray(obj) === false && !(obj instanceof Date) && tag !== '[object Error]';
};
