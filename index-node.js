'use strict';
if (process.env.NODE_ENV === 'test') {
  require('./backend').setBackend(require('./backend-test'));
} else {
  require('./backend').setBackend(require('./backend-node'));
}
module.exports = require('./eshttp');
