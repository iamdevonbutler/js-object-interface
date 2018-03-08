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
  if (src._isObjectInterface) return src; // @note *1 see below.

  obj = {
    src: clone ? objectAssign(src) : src,
    _isObjectInterface: true,
  };

  /**
   * Read the entire src Object (by passing in no args) or a Object property (w/ args).
   * Pass in multiple keys to read nested properties.
   * @param  {String} [args] zero more more Object keys. e.g. obj.get() | obj.get('a') | obj.get('a', 'b')
   * @return {Mixed} Object property value.
   */
  obj.get = (...args) => {
    if (!args.length) return obj.src;
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
   * Remove an object property. As w/ `.set()`, enter multiple params (keys) to
   * select and remove nested values.
   * @param  {String} args one or more Object keys. e.g. obj.remove('a', 'b')
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
   * $value wraps values of type Object in an interface itself -  to, for instance,
   * execute a nested forEach. If the value is not an object,
   * $value is undefined.
   * @param  {Function} cb params - value, key, $value
   * @return {this|Promise} returns Promise if async
   */
  obj.forEach = (cb) => {
    var keys, async;
    keys = Object.keys(obj.src);
    async = isAsync(cb);
    if (async) {
      return new Promise((resolve, reject) => {
        var promises = keys.map(key => cb(
          obj.src[key],
          key,
          obj._wrap(obj.src[key])
        ));
        Promise.all(promises).then((obj) => resolve()).catch(reject);
      });
    }
    else {
      keys.forEach(key => cb(
        obj.src[key],
        key,
        obj._wrap(obj.src[key])
      ));
      return obj;
    }
  };

  /**
   * Returns a new Object. Itterate over each object property and set it's value equal to the
   * callback return value.
   * cb param "$value" wraps values of type Object in an interface itself - to, for instance,
   * execute a nested map. If the value is not an object, $value is undefined.
   * @param  {Function} cb params: value, key, $value
   * @param  {Boolean} [wrapResult=false]
   * @return {Object|$Object|Promise|null} returns Promise if async.
   */
  obj.map = (cb, wrapResult = false) => {
    var keys, values, async, obj1 = {};
    keys = Object.keys(obj.src);
    async = isAsync(cb);
    if (async) {
      return new Promise((resolve, reject) => {
        var promises = keys.map(key => cb(
          obj.src[key],
          key,
          obj._wrap(obj.src[key])
        ));
        Promise.all(promises)
          .then(values => {
            keys.forEach((key, i) => obj1[key] = values[i]);
            if (Object.keys(obj1).length) {
              resolve(wrapResult ? applyInterface(obj1) : obj1);
            }
            else {
              resolve(null);
            }
          }).catch(reject);
      });
    }
    else {
      values = keys.map(key => cb(
        obj.src[key],
        key,
        obj._wrap(obj.src[key])
      ));
      keys.forEach((key, i) => obj1[key] = values[i]);
      if (Object.keys(obj1).length) {
        return wrapResult ? applyInterface(obj1) : obj1;
      }
      else {
        return null;
      }
    }
  };

  /**
   * Returns a new Object. Keeps values when cb returns truthy,
   * removes values when cb returns falsy.
   * cb param "$value" wraps values of type Object in an interface itself - to, for instance,
   * execute a nested map. If the value is not an object, $value is undefined.
   * @param  {Function} cb params: value, key, $value
   * @param  {Boolean} [wrapResult=false]
   * @return {Object|$Object|Promise|null} returns Promise if async.
   */
  obj.filter = (cb, wrapResult = false) => {
    var keys, async, obj1 = {};
    keys = Object.keys(obj.src);
    async = isAsync(cb);
    if (async) {
      return new Promise((resolve, reject) => {
        var promises = keys.map(key => cb(
          obj.src[key],
          key,
          obj._wrap(obj.src[key])
        ));
        Promise.all(promises)
          .then(values => {
            keys
              .filter((key, i) => values[i])
              .forEach(key => obj1[key] = obj.src[key]);
            if (Object.keys(obj1).length) {
              resolve(wrapResult ? applyInterface(obj1) : obj1);
            }
            else {
              resolve(null);
            }
          }).catch(reject);
      });
    }
    else {
      keys
        .filter(key => cb(
          obj.src[key],
          key,
          obj._wrap(obj.src[key])
        ))
        .forEach(key => obj1[key] = obj.src[key]);
      if (Object.keys(obj1).length) {
        return wrapResult ? applyInterface(obj1) : obj1;
      }
      else {
        return null;
      }
    }
  };

  /**
   * Itterate over each Object property and if every callback returns `true`,
   * `true` is returned, if not, `false` is returned.
   * @param  {Function} cb params: value, key, $value
   * @return {Boolean}
   */
  obj.every = (cb) => {
    var keys, result;
    keys = Object.keys(obj.src);
    result = keys.every(key => cb(obj.src[key], key, obj._wrap(obj.src[key])));
    return result;
  };

  /**
   * Itterate over each Object property and if at least one callback returns `true`,
   * `true` is returned, if not, `false` is returned.
   * @param  {Function} cb params: value, key, $value
   * @return {Boolean}
   */
  obj.some = (cb) => {
    var keys, result;
    keys = Object.keys(obj.src);
    result = keys.some(key => cb(obj.src[key], key, obj._wrap(obj.src[key])));
    return result;
  };

  /**
   * Itterate over each Object property and returns the first property for which the callback
   * returns a truthy value. We return the Object key, and if no matches are found, we return `undefined`
   * @param  {Function} cb params: value, key, $value
   * @return {String|undefined}
   */
  obj.find = (cb) => {
    var keys, result, wrapped;
    keys = Object.keys(obj.src);
    result = keys.find(key => cb(obj.src[key], key, obj._wrap(obj.src[key])));
    return result ? result : undefined;
  };

  /**
   * Return the result of Object.keys on .src.
   * @param {String(s)} [keys]
   * @return {Array|null}
   */
  obj.keys = (...keys) => {
    var result, obj1;
    result = null;
    obj1 = obj.get(...keys);
    if (obj1) {
      result = Object.keys(obj1);
    }
    return result;
  };

  /**
   * Create a copy (deep) of an Object. Breaks existing references.
   * @return {Object}
   */
  obj.clone = (wrap = false) => {
    return wrap ? applyInterface(objectAssign(obj.src)) : objectAssign(obj.src);
  };

  /**
   * Returns a new Object. New obj inherits properties from the original and deeply assign new properties.
   * To update the src Object - obj.update(obj.assign(newObj))
   * @param  {Object} obj e.g. obj.assign(obj, obj1, ...)
   * @return {Object}
   */
  obj.assign = (...args) => {
    return objectAssign(obj.src, ...args);
  };

  /**
   * For internal use.
   * @param  {Object} obj
   * @return {Object}
   */
  obj._wrap = (obj1) => {
    return isObject(obj1) ? applyInterface(obj1, clone) : undefined;
  };

  return obj;
};

function isAsync(obj) {
  var str, isAsync;
  str = obj.toString();
  isAsync = str[0] === 'a'
    && str[1] === 's'
    && str[2] === 'y'
    && str[3] === 'n'
    && str[4] === 'c';
  return isAsync;
};

function isObject(obj) {
  var tag = Object.prototype.toString.call(obj);
  return typeof obj === 'object' && obj !== null && Array.isArray(obj) === false && !(obj instanceof Date) && tag !== '[object Error]';
};

// *1
// Prevent double wrapping Objects with internal ._wrap calls.
// If someone runs a recursive function, wrapping both the child and parent (not recommended),
// a forEach|map|filter call on the parent will return a wrapped child for the "value" param,
// which will be unnecessarlly double wrapped by the "$value" param.
