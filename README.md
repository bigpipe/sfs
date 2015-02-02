# supreme

The build-in `fs` module of node is not optimized for high concurrency. The `sfs`
file system that we've developed is build against the native bindings of the
module and all API calls have been tweaked for our specific use case. But the
file system can still be a limiting factor. Some people prefer to store data in
their database system or dedicated file storage systems to ensure the best of
both worlds our internal file system can work with almost every API.

## Installation

This module is intended for Node.js as it makes use of the various of binding
API that are exposed internally.

```
npm install --save sfs
```

## Usage

The API that we expose is exactly the same as the Node.js API. Some methods will
just be faster for concurrent access patterns. If the methods are not optimized
or rewritten by this module we will expose the default `fs` version for those
API's so we can ensure that we're always in API parity with Node.js.

The following methods are currently optimized:

- `exists`
- `existsSync`

## License

MIT
