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

### .forEach()
### .map()
### .every()
### .some()
### .find()
### .filter()
### .assign()

plug function-properties module.

* the usege of undefined, use null to represent no value or else there will be errors w/ select and such.

## License
MIT
