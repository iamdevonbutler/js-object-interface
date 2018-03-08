# js-object-interface

Wrap JS Objects to create a functional Array-like interface for iteration and whatnot.

The goal here is to make it easier to iterate over, and interact w/, complex data structures.

**engines: node >= 9.x**

## Installation
```
npm i --save js-object-interface
```

## Example
```javascript
const applyInterface = require('js-object-interface');

const obj = {a: 1,b: 2};
var $obj = applyInterface(obj);

$obj.get();
$obj.get('key');
$obj.get('key', 'nestedKey', ...);

$obj.set('value');
$obj.set('key', 'value');
$obj.set('key', 'nestedKey', 'value');

$obj.remove('key');
$obj.remove('key', 'nestedKey');

$obj.forEach(() => {});
$obj.forEach(async () => {});

$obj.map(() => {});
$obj.map(async () => {});

$obj.filter(() => {});
$obj.filter(async () => {});

$obj.find(() => {});
$obj.every(() => {});
$obj.some(() => {});

$obj.keys();
$obj.clone(wrap = false);
$obj.assign({a: 1}, {a: 2}, ...);
```

## API

API differs from the JS functional Array method API, so pay close attention - the devil is in the details.

- `.get()`
- `.set()`
- `.remove()`
- `.forEach()`
- `.map()`
- `.filter()`
- `.every()`
- `.some()`
- `.find()`
- `.keys()`
- `.clone()`
- `.assign()`

### .get()
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

$obj.get() // returns {a: 1, b: 2, c: {d: 3}};
$obj.get('a') // returns 1
$obj.get('c', 'd') // returns 3
```

### .set()
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

$obj.set({e: 1}) // replaces the .src obj w/ {e: 1}. Returns `this`.
$obj.set('a', 2)
$obj.set('c', 'd', 4)
$obj.set('e', 'f', 5) // adds property "e" as an Object w/ an "f" property === 5
```

### .remove()
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

$obj.remove() // does nothing
$obj.remove('a') // obj === {b:2, c:{d: 3}}
$obj.remove('c', 'd') // obj === {a: 1, b: 2, c: {}}
```

### .forEach()
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

$obj.forEach((value, key, $value) => {
  // value: 1,2, {d: 3}
  // key: 'a', 'b', 'c
  // $value: undefined, undefined, $obj
}); // returns `this`.

// Nested .forEach()
$obj.forEach((value, key, $value) => {
  if ($value !== undefined) { // $value is not undefined when key === 'c'
    $value.forEach((value, key) => {
      // value: 3
      // key: 'd'
    });
  }
});

// Async .forEach()
console.log(1);
await $obj.forEach(async (value, key, $value) => {
  await asyncOperation;
  console.log(2);
});
console.log(3);
// Logs 1, 2, 2, 2, 3
```

### .map()
`.map()` does not modify the .src Object - it returns a new Object.

**"param2"** [wrapResult=false] wraps the result in an interface.

```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

var result = $obj.map((value, key, $value) => {
  return value;
}); // result === {a: 1, b: 2, c: {d: 3}}.


// Nested .map()
var result = $obj.map((value, key, $value) => {
  if ($value !== undefined) { // $value is not undefined when key === 'c'
    return $value
      .map((value, key) => {
        return value;
      });
  }
  return value;
}) // result === {a: 1, b: 2, c: {d: 3}}

// Async .map()
console.log(1);
var result = await $obj.map(async (value, key, $value) => {
  await asyncOperation;
  console.log(2);
  return value;
});
console.log(3);
// result === {a: 1, b: 2, c: {d: 3}}
// Logs 1, 2, 2, 2, 3
```

### .filter()
`.filter()` does not modify the .src Object - it returns a new Object.

**"param2"** [wrapResult=false] wraps the result in an interface.

If all callbacks return `false`, `null` is returned.
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

var result = $obj
  .filter((value, key, $value) => {
    return true;
  }); // result === {a: 1, b: 2, c: {d: 3}}

// Async .filter()
console.log(1);
var result = await $obj.filter(async (value, key, $value) => {
  await asyncOperation;
  console.log(2);
  return true;
});
console.log(3);
// result === {a: 1, b: 2, c: {d: 3}}
// Logs 1, 2, 2, 2, 3
```

### .every()
`.every()` iterates over each Object property and if every callback returns `true`, `true` is returned, if not, `false` is returned.
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

var result = $obj.every((value, key, $value) => {
  return true;
}); // result === true.
```
### .some()
`.some()` iterates over each Object property and if at least one callback returns `true`, `true` is returned, if not, `false` is returned.
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

var result = $obj.some((value, key, $value) => {
  return true;
}); // result === true.
```
### .find()
`.find()` iterates over each Object property and returns the first property where the callback returns a "truthy" value.

If no matches are found, `undefined` is returned.

```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

var key = $obj.find((value, key, $value) => {
  return true;
}); // key === 'a'
```

### .keys()
Returns `Object.keys()` on the .src Object or a nested property.
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

$obj.keys(); // ['a', 'b', 'c']
$obj.keys('c'); // ['d']
$obj.keys('c', 'z'); // null
```

### .clone()
Returns a recursive (deep) copy of the .src object.
```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

var obj1 = $obj.clone();
var obj1 = $obj.clone(wrap = true); // wraps obj1 in an interface.
```
### .assign()
Returns a new Object (deep assign).

```javascript
const obj = {a: 1, b: 2, c: {d: 3}};
var $obj = applyInterface(obj);

var obj1 = $obj.assign({a: 2}, {a: 9}, ...); // obj1 === {a: 9, b: 2, c: {d: 3}};

// To update the .src Object:
obj.set(obj.assign({a: 2}));
```

* *View src (./lib/index.js) and tests (./tests/main.test.js) for a more detailed understanding of the API.*

## Performance

Now I wouldn't consider the module to be a performance bottleneck, but I should mention that it is not optimized for high-performance applications. View src.

## License
MIT
