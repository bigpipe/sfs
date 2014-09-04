'use strict';

var debug = require('diagnostics')('sfs:factory')
  , hash = require('crypto').createHash
  , path = require('path');

/**
 * Representation of a single file.
 *
 * @TODO: Add the path to the contents.
 *
 * @constructor
 * @param {String} path Location of the file.
 * @param {Object} options File configuration.
 * @api public
 */
function File(path, options) {
  if (!this) return new File(path, options);
  options = options || {};

  this.requested = 0;           // The amount of x this file has been requested.
  this.contents = [];           // Various of file that we should read.
  this.factory = null;          // Reference to the factory instance.
  this.alias = '';              // Alias of the file, also known as fingerprint.

  this.modified();
}

//
// File inherits from the EventEmitter so people can hook in to these changes.
//
File.prototype.__proto__ = require('eventemitter3').prototype;

/**
 * Initialize the file and register this file instance in our factory.
 *
 * @param {Factory} factory Construction factory.
 * @returns {File}
 * @api private
 */
File.prototype.initialize = function initialize(factory) {
  this.factory = factory;

  factory.emit('add', this);
  return this;
};

/**
 * Generate a fingerprint of the current content.
 *
 * @param
 * @returns {File}
 * @api private
 */
File.prototype.fingerprinter = function fingerprinter(content) {
  this.alias = hash('md5').update(content.toString()).digest('hex');

  return this;
};

['push', 'shift', 'pop', 'unshift'].forEach(function generate(method) {
  File.prototype[method] = function compiled(path, options) {
    this.contents[method](path);
    this.emit(method);

    return this.modified();
  };
});

/**
 * Read out the compiled contents and callback with the resulting buffer.
 *
 * @param {Function} fn Error first callback.
 * @returns {File}
 * @api public
 */
File.prototype.buffer = function buffer(fn) {
  return this;
};

/**
 * Something in this file has been modified, we need to re-calculate all the
 * things.
 *
 * @returns {File}
 * @api public
 */
File.prototype.modified = function modified() {
  this.fingerprinter();

  return this;
};

/**
 * Forward the file contents to different streams, services and API's.
 *
 * @returns {File}
 * @api public
 */
File.prototype.forward = function forward() {
  return this;
};

/**
 * Destroy the file instance and un-register it in the factory.
 *
 * @returns {File}
 * @api public
 */
File.prototype.destroy = function destroy() {
  this.factory.emit('remove', this);

  return this;
};

//
// Expose the module.
//
module.exports = File;
