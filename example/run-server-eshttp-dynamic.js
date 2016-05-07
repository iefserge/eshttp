'use strict';
const eshttp = require('../index-node');
const server = new eshttp.HttpServer();

server.onrequest = request => {
  request.respondWith(200, { 'x-header': 'value' }, 'hello');
};

server.listen(8000);
console.log('eshttp: listening to port 8000');
