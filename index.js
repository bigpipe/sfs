'use strict';

var c = process.binding('constants')
  , queue = Object.create(null)
  , fs = process.binding('fs')
  , sfs = module.exports;

//
// Generate some name defaults for the flags.
//
c = 'O_APPEND,O_CREAT,O_EXCL,O_RDONLY,O_RDWR,O_SYNC,O_TRUNC,O_WRONLY'.split(',')
.reduce(function defaults(memo, flag) {
  memo[flag] = c[flag] || 0;
  return memo;
}, Object.create(null));

/* jshint: ignore:start */
sfs.flags = Object.create(null);

sfs.flags['r']    = c.O_RDONLY;
sfs.flags['rs']   = // Fall through, used for alias.
sfs.flags['sr']   = c.O_RDONLY | c.O_SYNC;
sfs.flags['r+']   = c.O_RDWR;
sfs.flags['rs+']  = // Fall through, used for alias.
sfs.flags['sr+']  = c.O_RDWR | c.O_SYNC;

sfs.flags['w']    = c.O_TRUNC | c.O_CREAT | c.O_WRONLY;
sfs.flags['wx']   = // Fall through, used for alias.
sfs.flags['xw']   = c.O_TRUNC | c.O_CREAT | c.O_WRONLY | c.O_EXCL;
sfs.flags['w+']   = c.O_TRUNC | c.O_CREAT | c.O_RDWR;
sfs.flags['wx+']  = // Fall through, used for alias.
sfs.flags['xw+']  = c.O_TRUNC | c.O_CREAT | c.O_RDWR | c.O_EXCL;

sfs.flags['a']    = c.O_APPEND | c.O_CREAT | c.O_WRONLY;
sfs.flags['ax']   = // Fall through, used for alias.
sfs.flags['xa']   = c.O_APPEND | c.O_CREAT | c.O_WRONLY | c.O_EXCL;
sfs.flags['a+']   = c.O_APPEND | c.O_CREAT | c.O_RDWR;
sfs.flags['ax+']  = // Fall through, used for alias.
sfs.flags['xa+']  = c.O_APPEND | c.O_CREAT | c.O_RDWR | c.O_EXCL;
/* jshint: ignore:end */

/**
 * Checks if a file exists on the current hard drive.
 *
 * @async
 * @param {String} path Path to a thing that needs to exist.
 * @param {Function} fn Completion callback.
 * @api private
 */
sfs.exists = function exists(path, fn) {
  if (running(exists, path, fn)) return;

  fs.stat(path, function done(err) {
    complete(exists, path, undefined, !err);
  });
};

/**
  * Checks if a file exists on the current hard drive.
  *
  * @sync
  * @param {String} path Path to a thing that needs to exist.
  * @api private
 */
sfs.existsSync = function exists(path) {
  return !trying(function stat() {
    fs.stat(path);
  });
};

/**
 * Open a file descriptor.
 *
 * @async
 * @param {String} path Path to the file we're trying to open.
 * @param {String} flags Flags for opening.
 * @param {Number} mode Opening mode.
 * @param {Function} fn Completion callback.
 * @api private
 */
sfs.open = function open(path, flags, mode, fn) {
  flags = sfs.flags[flags] || flags;
  fs.open(path, flags, +mode || 438, fn);
};

/**
 * Open a file descriptor.
 *
 * @sync
 * @param {String} path Path to the file we're trying to open.
 * @param {String} flags Flags for opening.
 * @param {Number} mode Opening mode.
 * @api private
 */
sfs.openSync = function openSync(path, flags, mode) {
  flags = sfs.flags[flags] || flags;
  return fs.open(path, flags, +mode || 438);
};

/**
 * Close a given file descriptor. We just reference the binding directly as
 * there is no need for extra function wrapping as the arguments map 1 on 1. For
 * the synchronous version, just omit the callback argument.
 *
 * @async/@sync
 * @param {FileDescriptor} fd The file descriptor that needs to be closed.
 * @param {Function} fn Completion callback.
 * @api private
 */
sfs.closeSync = sfs.close = fs.close;

/**
 * Small wrapper for try/catch blocks to prevent a whole function to be
 * de-optimized.
 *
 * @param {Function} fn Function to attempt to execute.
 * @returns {Error}
 * @api public
 */
function trying(fn) {
  try { return fn(); }
  catch (e) { return e; }
}

/**
 * Check if a certain operation is already running in our processing queue. It's
 * pointless. Because it's pointless to concurrently run exactly the same task.
 * We do not require a high level of uniqueness within this module.
 *
 * @param {Function} method Reference to the function that needs the queue.
 * @param {String} path Location of a thing.
 * @param {Function} fn Completion callback.
 * @api private
 */
function running(method, path, fn) {
  var id = method.sfs +'@'+ path;

  if (!queue[id]) {
    queue[id] = [fn];
    return false;
  }

  queue[id].push(fn);
  return true;
}

/**
 * A queued operation has been completed, call all the callbacks with the
 * results or error.
 *
 * @param {Function} method Reference to the function that needs the queue.
 * @param {String} path Location of a thing.
 * @param {Error} err Optional error argument for callback.
 * @param {Mixed} data Result of the async operation.
 * @api private
 */
function complete(method, path, err, data) {
  var id = method.sfs +'@'+ path
    , fns = queue[id]
    , l = fns.length
    , i = 0;

  //
  // Delete the queue before we call the callbacks. This prevents users from
  // adding new calls to the queue that we're currently processing.
  //
  delete queue[id];

  for (; i < l; i++) {
    fns[i](err, data);
  }
}

//
// Add a unique id for each of the supreme file system methods so we can use it
// check in our running queue and execute callbacks at once.
//
Object.keys(sfs).forEach(function tag(method) {
  if ('function' !== typeof sfs[method]) return;

  sfs[method].sfs = this.createHash('md5').update(
    sfs[method].toString()  // Use the function body as content for the hash
  ).digest('hex');
}, require('crypto'));

//
// Now that we've compiled unique hash methods on every single `sfs` tuned
// function we can introduce all potential missing API's from the node's fs
// module to ensure that we we have full API compatibility.
//
Object.keys(require('fs')).forEach(function each(key) {
  if (key in sfs) return;
  sfs[key] = require('fs')[key];
});
