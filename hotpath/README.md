# Hotpath

Hotpath is memory restricted cache layer. It's intended use is to cache the most
critical code or data of your application without using to much memory.
Optimizations for the sake of performance are great as long as they do not
affect the memory management of your process.

## Installation

The module is released frequently to the npm registry and can be installed
using:

```
npm install --save hotpath
```

## Usage

In all code example we assume that the library has been required as following:

```js
'use strict';

var HotPath = require('hotpath');
```

To create a new hot path cache you need to construct a new instance:

```js
var hotpath = new HotPath({ option });
```

To customize your `HotPath` instance you can supply the following options in the
constructor: 

- `maximum`: The maximum amount of memory we can allocate for our given cache.
  Defaults to 1.7 gig.
- `available`: The amount of memory available on the system. We will calculate
  our cache size based on this. It should be given as bytes. Defaults to the
  `os.freemem()` result.
- `prefix`: A prefix for the keys to prevent dictionary attacks when storing
  things like `__proto__` in the object. Defaults to `_HotPath`
- `countkey`: Include the size of they in the allocated memory count. Defaults
  to `false`.

#### hotpath.set

To add items to your cache you need to call the `set` method with 2 argument:

1. `key`: name where your data is stored under.
2. `data`: value that needs to be stored. 

If the supplied `data` is not an `Buffer` we will automatically transform it in
to a new buffer for you. So when you retrieve your data from the cache again it
will always be a `Buffer` instance.

```js
var stored = hotpath.set('my-custom-key', new Buffer('<my important blob of data>'));
```

If you item is successfully stored in the cache it will return `true` as
boolean. The only reason why you would get a `false` boolean is when the data
you want to store is larger than the available size.

#### hotpath.allocated

The `.allocated` property allows you to check how many bytes are currently stored
in your cache. To see how much data you can still store you can subtract it from
the `.free` property.

```js
console.log('in-use', hotpath.allocated);
console.log('available', hotpath.free - hotpath.allocated);
```

#### hotpath.get

Retrieve the value that is stored in the cache. Please note that any
modification you do on this buffer will also be changed in the cache as this is
**NOT** a copy. The get method accepts one argument:

1. `key`: name where your data is stored under.

```js
var value = hotpath.get('my-custom-key');
```

#### hotpath.remove

To remove individual values from the cache you can use the remove method. It
takes one argument:

1. `key`: name where your data is stored under.

```js
var removed = hotpath.remove('my-custom-key');
```

The remove method returns a boolean indicating if the removal was successful.
When you receive `false` we could not locate the item in the cache.

#### hotpath.reset

If you want to reset the complete cache instead of removing just a single
individual value you should call the reset method. It creates a fresh new object
where all data is stored in and reset the `allocated` property.

```js
hotpath.reset();
```

#### hotpath.destroy

If you no longer which to use or reference your hot path cache you should
destroy it completely in order to release the saved memory again. Only call this
method if you will no longer reference any of it's methods as all the internal
structure will be nuked to death.

```js
hotpath.destroy();
```

## License

MIT
