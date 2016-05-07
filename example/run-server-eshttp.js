'use strict';
const eshttp = require('../index-node');
const server = new eshttp.HttpServer();
const response = new eshttp.HttpResponse(200, { 'x-header': 'value' }, 'hello');

server.onrequest = request => {
  request.respondWith(response);
};

server.listen(8080);
console.log('eshttp: listening to port 8080');
