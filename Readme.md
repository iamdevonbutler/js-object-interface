# Object interface

Add Array-like methods to plain JS Objects.

## Installation
```
npm i --save object-interface
```

## Example
```javascript
const applyInterface = require('object-interface');
const obj = {
  a: 1,
  b: 2,
};

var $obj = applyInterface(obj);

$obj.forEach(() => {

});
```

## API

Object methods works *slightly* different from their Array method counterparts - read docs carefully.

@todo just show examples for each and see if it needs supporitng text.
### .create()

### .read()
### .update()
### .delete()

### .forEach()
### .map()
### .every()
### .some()
### .find()
### .filter()
### .assign()

* *View src (./lib/index.js) and tests (./tests/main.test.js) for a more detailed understanding of the API.*

plug function-properties module.

* the usege of undefined, use null to represent no value or else there will be errors w/ select and such.

## Performance

Now I wouldn't consider the module to be a performance bottleneck, but I should mention that it is
not optimized for high-performance applications.

## License
MIT
