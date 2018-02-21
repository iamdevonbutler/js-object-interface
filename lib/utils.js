const self = module.exports;

self.objectAssign = (...objs) => {
  var result = objs
    .filter(item => self.isType(item, 'object'))
    .reduce((p, c) => {
      var keys = Object.keys(c);
      keys.forEach(key => {
        if (self.isType(c[key], 'object')) {
          p[key] = self.objectAssign(self.isType(p[key], 'object') ? p[key] : {}, c[key]);
        }
        else {
          p[key] = c[key];
        }
      });
      return p;
  }, {});
  return result;
};

self.isType = (value, type) => {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isNaN(value) === false;
    case 'boolean':
      return value === true || value === false;
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && Array.isArray(value) === false;
    case 'null':
      return value === null;
    case 'undefined':
      return value === undefined;
    case 'function':
      const tag = Object.prototype.toString.call(value);
      return tag === '[object Function]' || tag === '[object AsyncFunction]' || tag === '[object GeneratorFunction]' || tag === '[object Proxy]';
    case 'symbol':
      return typeof value === 'symbol';
    case 'NaN':
      return Number.isNaN(value);
    case 'date':
      return value instanceof Date;
    default:
      throw new Error(`Invalid value for arg "type": ${type}`);
  }
};
