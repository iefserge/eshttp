'use strict';
var eshttp = require('../index-node');
var server = new eshttp.HttpServer();
var response = new eshttp.HttpResponse(200, { 'x-header': 'value' }, 'hello');

server.onrequest = (request) => {
  request.respondWith(response);
};

server.listen(8080);
console.log('eshttp: listening to port 8080');
