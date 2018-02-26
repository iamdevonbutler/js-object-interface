# js-object-interface

Wrap JS Objects to create a functional Array-like interface for iteration and whatnot

The goal here is to make it easier to iterate over, and interact w/, complex data structures.

## Installation
```
npm i --save js-object-interface
```

## Example
```javascript
const applyInterface = require('js-object-interface');
const obj = {
  a: 1,
  b: 2,
};

var $obj = applyInterface(obj);

$obj.forEach(() => {

});
```

## API

API differs from the JS functional Array method API, so pay close attention - the devil is in the details.

- `.add()`
- `.remove()`
- `.get()`
- `.set()`
- `.forEach()`
- `.map()`
- `.filter()`
- `.every()`
- `.some()`
- `.find()`
- `.clone()`
- `.assign()`

copy src and throw it in the docs.

@todo just show examples for each and see if it needs supporitng text.
### .add()
bridge props
### .remove()
### .get()
### .set()

### .forEach()
### .map()
### .filter()

### .every()
### .some()
### .find()

### .clone()
### .assign()

* *View src (./lib/index.js) and tests (./tests/main.test.js) for a more detailed understanding of the API.*

plug function-properties module.

* the usege of undefined, use null to represent no value or else there will be errors w/ select and such.

## @todos
async documentation
using assign|filter then update to update src.
nested iteration methods

## Performance

Now I wouldn't consider the module to be a performance bottleneck, but I should mention that it is not optimized for high-performance applications.

## License
MIT
