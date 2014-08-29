describe('HotPath', function () {
  'use strict';

  var assume = require('assume')
    , HotPath = require('../hotpath');

  it('is exposed as function', function () {
    assume(HotPath).to.be.a('function');
  });

  describe('#set', function () {
    it('only stores data if we do not blow out of memory', function () {
      var hp = new HotPath({ available: 100 });

      assume(hp.set('foo', new Buffer(40))).to.equal(false);
      assume(hp.get('foo')).to.equal(undefined);

      assume(hp.set('foo', new Buffer(2))).to.equal(true);
      assume(hp.get('foo')).to.be.a('buffer');

      hp.destroy();
    });

    it('transforms everything in buffers');
    it('increments the allocated size');
    it('returns true when stored');
  });

  describe('#get', function () {
    it('returns the stored buffer');
  });

  describe('#remove', function () {
    it('returns false when not stored');
  });

  describe('#ram', function () {
    it('normalizes the ram to a maximum');
    it('it allows more memory when we have more RAM available');
  });
});
