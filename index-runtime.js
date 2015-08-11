'use strict';
require('./lib/backend').setBackend(require('./backend/backend-runtime'));
module.exports = require('./lib/eshttp');
