describe('sfs', function () {
  'use strict';

  var assume = require('assume')
    , path = require('path')
    , sfs = require('./');

  describe('.exists', function () {
    it('finds our test file', function (next) {
      sfs.exists(__dirname + '/test.js', function (err, exists) {
        assume(err).to.be.a('undefined');
        assume(exists).to.equal(true);

        next();
      });
    });

    it('finds unknown files', function (next) {
      sfs.exists(__dirname + '/sfs.test.js-gone', function (err, exists) {
        assume(err).to.be.a('undefined');
        assume(exists).to.equal(false);

        next();
      });
    });
  });
});
