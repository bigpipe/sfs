'use strict';

var queue = Object.create(null)
  , fs = process.binding('fs')
  , sfs = module.exports;

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
