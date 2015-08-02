'use strict';
if (process.env.NODE_ENV === 'test') {
  require('./lib/backend').setBackend(require('./backend/backend-test'));
} else {
  require('./lib/backend').setBackend(require('./backend/backend-node'));
}
module.exports = require('./lib/eshttp');
