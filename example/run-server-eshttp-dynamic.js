'use strict';
var eshttp = require('../index-node');
var server = new eshttp.HttpServer();
var HttpResponse = eshttp.HttpResponse;

server.onrequest = request => {
  var response = new HttpResponse(200, { 'x-header': 'value' }, 'hello');
  request.respondWith(response);
};

server.listen(8000);
console.log('eshttp: listening to port 8000');
