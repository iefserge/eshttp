'use strict';

var backend = null;

module.exports = function() {
  if (!backend) {
    throw new Error('backend has not been configured');
  }
  return backend;
};

module.exports.setBackend = function(b) {
  backend = b;
};
