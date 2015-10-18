'use strict';
var eshttp = require('../index-node');
var server = new eshttp.HttpServer();
var HttpResponse = eshttp.HttpResponse;

server.onrequest = request => {
  request.respondWith(200, { 'x-header': 'value' }, 'hello');
};

server.listen(8000);
console.log('eshttp: listening to port 8000');
