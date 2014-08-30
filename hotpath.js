'use strict';

var os = require('os');

/**
 * HotPath: A memory constrained cache for HotPath or critical files. These
 * files should be served out of memory instead of from disk for performance
 * reasons.
 *
 * Options:
 *
 * - maximum: The maximum amount of memory we can allocate for our given
 *   hotpath cache.
 * - available: The amount of memory available on the system. We will calculate
 *   our hotpath cache size based on this. It should be given as bytes.
 * - prefix: A prefix for the keys to prevent dictionary attacks when storing
 *   things like `__proto__` in the object.
 *
 * @constructor
 * @param {Object} options Configuration for HotPath.
 * @api public
 */
function HotPath(options) {
  if (!this) return new HotPath(options);

  options = options || {};

  this.maximum = +options.maximum || HotPath.maximum; // Maximum memory available.
  this.free = this.ram(options.available);            // Free mem we can use.
  this.prefix = options.prefix || '_HotPath';         // Prefix for keys.
  this.countkey = options.key || false;               // Also include key length.
  this.storage = Object.create(null);                 // Empty object.
  this.allocated = 0;                                 // Amount of mem we use.
}

/**
 * The maximum amount of free memory we accept for a given node process. We have
 * to take in account that a single node process dies with ENOMEM around 1.7 gb.
 * So it makes sense to set this as an upper limit.
 *
 * @type {Number}
 * @private
 */
HotPath.maximum = 1700000000;

/**
 * Add a new value to the internal buffer.
 *
 * @param {String} key Name of the value so you get it back from cache.
 * @param {Buffer} value Data that needs to be stored.
 * @returns {Boolean} Storage indication.
 * @api public
 */
HotPath.prototype.set = function set(key, value) {
  if (!Buffer.isBuffer(value)) value = new Buffer(value);

  //
  // We will blow out of our cache if we add this file. So we ignore it.
  //
  if (value.length + this.allocated > this.free) return false;

  key = this.prefix + key;

  this.allocated += value.length;
  this.storage[key] = value;

  if (this.countkey) {
    this.allocated += Buffer.byteLength(key);
 }

  return true;
};

/**
 * Retrieve a value.
 *
 * @param {String} key Name of the value we want to get back.
 * @returns {Mixed} Data or undefined.
 * @api public
 */
HotPath.prototype.get = function get(key) {
  return this.storage[this.prefix + key];
};

/**
 * Remove the value from the cache.
 *
 * @param {String} key Name of the value we want to get back.
 * @returns {Boolean} Successful data removal.
 * @api public
 */
HotPath.prototype.remove = function remove(key) {
  key = this.prefix + key;

  if (!(key in this.storage)) return false;

  this.allocated -= this.storage[key].length;

  if (this.countkey) {
    this.allocated -= Buffer.byteLength(key);
 }

  //
  // We want to copy over all existing data to a new object to ensure the
  // highest performance when we retrieve data from the cache. When you use
  // `delete` on the object it de-optimizes the object in to a plain dictionary
  // which is a lot slower then an unchanged object/class.
  //
  var storage = Object.create(null)
    , hotpath = this;

  Object.keys(this.storage).forEach(function each(name) {
    if (key !== name) storage[name] = hotpath.storage[name];
    delete hotpath.storage[name];
  });

  this.storage = storage;
  return true;
};

/**
 * Calculate the amount of the RAM that we have available to use a cache for hot
 * paths. We need to restrict it because we don't want to load big ass files in
 * memory when people only 256 mb to spend on hosting providers. But when there's
 * more room, we want leverage it for more performance.
 *
 * @param {Number} available Custom amount of memory that is available in bytes.
 * @returns {Number}
 * @api private
 */
HotPath.prototype.ram = function ram(available) {
  var free = available || os.freemem()
    , percentage = 2;

  if (free > this.maximum) free = this.maximum;

  //
  // Increase the size of the hot cache if we have a lot of free ram available.
  //
  if (free > 1700000000) percentage = 10;

  return (free / 100) * percentage;
};

/**
 * Clear all the things.
 *
 * @returns {HotPath}
 * @api public
 */
HotPath.prototype.destroy = function destroy() {
  this.maximum = this.free = this.storage = this.allocated = this.prefix = null;

  return this;
};

//
// Expose the module.
//
module.exports = HotPath;
