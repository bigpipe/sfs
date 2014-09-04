## File system agnostic

#### Reasoning

The build-in `fs` module of node is not optimized for high concurrency. The `sfs`
file system that we've developed is build against the native bindings of the
module and all API calls have been tweaked for our specific use case. But the
file system can still be a limiting factor. Some people prefer to store data in
their database system or dedicated file storage systems to ensure the best of
both worlds our internal file system can work with almost every API.

## Hot path cache

We leverage a dedicated hot path cache system which caches frequently requested
files in the memory of the node process. The hot path cache can be configured
with the following options:

- **maximum**: The maximum amount of memory we can allocate for our given hot
  path cache.
- **available**: The amount of memory available on the system. We will calculate
  our hot path cache size based on this. It should be given as bytes.
- **prefix**: A prefix for the keys to prevent dictionary attacks when storing
  things like `__proto__` in the object.

#### Reasoning

Severing files directly out of node's memory minimizes the about of I/O we need
to serve the given file. The restricted hot path cache ensures that only the top
requested files get cached and we do not blow out of memory. It only takes
a small percentage of free memory. 2% by default and 10% if you have more than
1.7 GB available on your system.
