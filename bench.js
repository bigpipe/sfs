'use strict';

var sfs = require('./')
  , fs = require('fs');

/**
 * Simple benchmark utility.
 *
 * @param {String} method Name of the method we want to execute.
 * @param {String} path Path of the file we want to use.
 * @param {Number} requests Amount of requests we want to execute.
 * @param {Function} done Completion callback.
 * @api public
 */
function bench(method, path, requests, done) {
  function run(library, next) {
    var synchronous = ~method.toLowerCase().indexOf('sync')
      , name = library === sfs ? 'sfs(mine)' : 'fs(node)'
      , now = Date.now()
      , completed = 0
      , i = 0;

    function callback() { if (++completed === requests) {
      console.log(name +'#'+ method +' took: '+ (Date.now() - now) +'ms');
      next();
    }}

    for (; i < requests; i++) {
      if (!synchronous) library[method](path, callback);
      else callback(library[method](path));
    }
  }

  return function runner() {
    console.log('');
    console.log('Starting benchmark: '+ method +', against path:'+ path);
    console.log('');

    run(fs, function next() {
      run(sfs, done || function () {});
    });
  };
}

bench('exists', __dirname +'/bench.js-gone', 25000)();
