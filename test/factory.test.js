describe('Factory', function () {
  'use strict';

  var assume = require('assume')
    , Factory = require('../');

  it('is exported as a function', function () {
    assume(Factory).is.a('function');
  });
});
