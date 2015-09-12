'use strict';
require('../lib/backend').setBackend(require('../backend/backend-node'));
require('./headers');
require('./parser');
require('./request');
require('./server');
